import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { ReactNode } from 'react'

// Mock fetch globally
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('AuthContext', () => {
  const mockSession = {
    id: 'session-123',
    user_id: 'user-123',
    wallet_address: '0x123',
    expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    user: {
      id: 'user-123',
      wallet_address: '0x123',
      username: 'testuser',
      email: 'test@example.com',
      created_at: new Date().toISOString()
    }
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('starts with no user when localStorage is empty', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('loads user from localStorage if session is valid', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession))

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user).toEqual(mockSession.user)
      expect(result.current.session).toEqual(mockSession)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('clears expired session from localStorage', () => {
      const expiredSession = {
        ...mockSession,
        expires_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSession))

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('goongpt_session')
    })

    it('handles invalid JSON in localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('goongpt_session')
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Login', () => {
    it('sets user and session on login', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        result.current.login(mockSession)
      })

      expect(result.current.user).toEqual(mockSession.user)
      expect(result.current.session).toEqual(mockSession)
      expect(result.current.isAuthenticated).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'goongpt_session',
        JSON.stringify(mockSession)
      )
    })

    it('updates existing session on re-login', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      // First login
      act(() => {
        result.current.login(mockSession)
      })

      // Second login with updated data
      const updatedSession = {
        ...mockSession,
        user: {
          ...mockSession.user,
          username: 'updateduser'
        }
      }

      act(() => {
        result.current.login(updatedSession)
      })

      expect(result.current.user?.username).toBe('updateduser')
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2)
    })
  })

  describe('Logout', () => {
    it('clears user and session on logout', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Login first
      act(() => {
        result.current.login(mockSession)
      })

      // Then logout
      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('goongpt_session')
    })

    it('calls logout endpoint with credentials', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        result.current.login(mockSession)
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/.netlify/functions/logout'),
        {
          method: 'POST',
          credentials: 'include'
        }
      )
    })

    it('handles logout endpoint errors gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        result.current.login(mockSession)
      })

      await act(async () => {
        await result.current.logout()
      })

      // Should still clear local state even if endpoint fails
      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('goongpt_session')
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Update User', () => {
    it('updates user data and persists to localStorage', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      // Login first
      act(() => {
        result.current.login(mockSession)
      })

      // Update user
      const updatedUser = {
        ...mockSession.user,
        username: 'newusername',
        email: 'newemail@example.com'
      }

      act(() => {
        result.current.updateUser(updatedUser)
      })

      expect(result.current.user).toEqual(updatedUser)
      expect(result.current.session?.user).toEqual(updatedUser)
      
      // Check localStorage was updated
      const savedSession = JSON.parse(localStorageMock.setItem.mock.calls[1][1])
      expect(savedSession.user).toEqual(updatedUser)
    })

    it('does not update if no session exists', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      const updatedUser = {
        ...mockSession.user,
        username: 'newusername'
      }

      act(() => {
        result.current.updateUser(updatedUser)
      })

      expect(result.current.user).toBeNull()
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })
  })

  describe('Environment Detection', () => {
    it('uses correct base URL in development', async () => {
      // Mock import.meta.env
      const originalEnv = (import.meta as any).env
      ;(import.meta as any).env = { DEV: true }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        result.current.login(mockSession)
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8888/.netlify/functions/logout',
        expect.any(Object)
      )

      // Restore original env
      ;(import.meta as any).env = originalEnv
    })

    it('uses relative URL in production', async () => {
      // Mock import.meta.env
      const originalEnv = (import.meta as any).env
      ;(import.meta as any).env = { DEV: false }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        result.current.login(mockSession)
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/.netlify/functions/logout',
        expect.any(Object)
      )

      // Restore original env
      ;(import.meta as any).env = originalEnv
    })
  })

  describe('Edge Cases', () => {
    it('handles multiple rapid login/logout calls', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Rapid login/logout sequence
      act(() => {
        result.current.login(mockSession)
      })

      await act(async () => {
        await result.current.logout()
      })

      act(() => {
        result.current.login(mockSession)
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2)
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2)
    })

    it('preserves other localStorage items when clearing session', () => {
      // Set some other items
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'goongpt_session') return JSON.stringify(mockSession)
        if (key === 'other_key') return 'other_value'
        return null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        result.current.logout()
      })

      // Should only remove session, not other items
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('goongpt_session')
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other_key')
      expect(localStorageMock.clear).not.toHaveBeenCalled()
    })
  })
})
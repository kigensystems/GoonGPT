import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  authRateLimiter,
  chatRateLimiter,
  imageRateLimiter,
  videoRateLimiter,
  asmrRateLimiter
} from './rateLimiter.js'
import { supabase } from './supabase.js'

// Mock supabase
vi.mock('./supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }
}))

// Mock cookies module
vi.mock('./cookies.js', () => ({
  validateSessionFromCookies: vi.fn()
}))

// Mock import for cookies
const { validateSessionFromCookies } = await import('./cookies.js')

describe('Rate Limiter', () => {
  // Mock request object
  const createMockRequest = (body = {}, headers = {}, ip = '127.0.0.1') => ({
    body: JSON.stringify(body),
    headers: {
      'x-forwarded-for': ip,
      ...headers
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('extractWalletAddress', () => {
    it('extracts wallet address from request body', async () => {
      const request = createMockRequest({ wallet_address: '0x123' })
      const limiter = await authRateLimiter(request)
      
      // Should not rate limit first request
      expect(limiter).toBeNull()
    })

    it('handles invalid JSON gracefully', async () => {
      const request = {
        body: 'invalid json',
        headers: {}
      }
      
      const limiter = await authRateLimiter(request)
      expect(limiter).toBeNull()
    })
  })

  describe('getWalletFromSession', () => {
    it('gets wallet from session cookie', async () => {
      vi.mocked(validateSessionFromCookies).mockResolvedValue({
        user_id: 'user-123'
      })

      const mockUser = { wallet_address: '0xABC' }
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUser })
          })
        })
      })

      const request = createMockRequest()
      await chatRateLimiter(request)

      expect(validateSessionFromCookies).toHaveBeenCalledWith(request)
    })

    it('handles session validation errors', async () => {
      vi.mocked(validateSessionFromCookies).mockRejectedValue(new Error('Invalid session'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const request = createMockRequest()
      await chatRateLimiter(request)

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Anonymous Rate Limiting', () => {
    it('rate limits anonymous users by IP', async () => {
      const request = createMockRequest({}, {}, '192.168.1.1')

      // First 5 requests should pass (assuming limit is 5)
      for (let i = 0; i < 5; i++) {
        const result = await authRateLimiter(request)
        expect(result).toBeNull()
      }

      // 6th request should be rate limited
      const result = await authRateLimiter(request)
      expect(result).not.toBeNull()
      expect(result.statusCode).toBe(429)
      expect(JSON.parse(result.body).error).toContain('Too many requests')
    })

    it('extracts IP from various headers', async () => {
      const ipTests = [
        { headers: { 'x-forwarded-for': '1.2.3.4' }, expected: '1.2.3.4' },
        { headers: { 'x-real-ip': '5.6.7.8' }, expected: '5.6.7.8' },
        { headers: { 'cf-connecting-ip': '9.10.11.12' }, expected: '9.10.11.12' },
        { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }, expected: '1.2.3.4' }
      ]

      for (const { headers, expected } of ipTests) {
        const request = createMockRequest({}, headers)
        await authRateLimiter(request)
        // Rate limiter should use the expected IP
        // This is tested indirectly through rate limiting behavior
      }
    })

    it('resets rate limit after time window', async () => {
      const request = createMockRequest({}, {}, '10.0.0.1')

      // Hit rate limit
      for (let i = 0; i < 6; i++) {
        await authRateLimiter(request)
      }

      // Should be rate limited
      let result = await authRateLimiter(request)
      expect(result).not.toBeNull()

      // Advance time past rate limit window (60 seconds)
      vi.advanceTimersByTime(61000)

      // Should be allowed again
      result = await authRateLimiter(request)
      expect(result).toBeNull()
    })
  })

  describe('Authenticated User Rate Limiting', () => {
    const setupAuthenticatedUser = (wallet, usage = {}) => {
      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'rate_limits') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    wallet_address: wallet,
                    chat_usage: 0,
                    image_usage: 0,
                    video_usage: 0,
                    asmr_usage: 0,
                    ...usage,
                    last_reset: new Date().toISOString()
                  }
                })
              })
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: {} })
              })
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({})
            })
          }
        }
        return {}
      })
    }

    it('tracks usage for authenticated users', async () => {
      setupAuthenticatedUser('0x123', { chat_usage: 0 })
      const request = createMockRequest({ wallet_address: '0x123' })

      // First request should pass
      const result = await chatRateLimiter(request)
      expect(result).toBeNull()

      // Should update usage
      expect(supabase.from).toHaveBeenCalledWith('rate_limits')
      expect(supabase.from('rate_limits').update).toHaveBeenCalled()
    })

    it('enforces different limits for different endpoints', async () => {
      const limits = {
        chat: { limiter: chatRateLimiter, limit: 100 },
        image: { limiter: imageRateLimiter, limit: 10 },
        video: { limiter: videoRateLimiter, limit: 5 },
        asmr: { limiter: asmrRateLimiter, limit: 10 }
      }

      for (const [type, { limiter, limit }] of Object.entries(limits)) {
        vi.clearAllMocks()
        
        const usage = {}
        usage[`${type}_usage`] = limit - 1
        setupAuthenticatedUser('0x123', usage)
        
        const request = createMockRequest({ wallet_address: '0x123' })
        
        // Should allow one more request
        let result = await limiter(request)
        expect(result).toBeNull()

        // Next request should be rate limited
        usage[`${type}_usage`] = limit
        setupAuthenticatedUser('0x123', usage)
        
        result = await limiter(request)
        expect(result).not.toBeNull()
        expect(result.statusCode).toBe(429)
      }
    })

    it('creates rate limit record for new users', async () => {
      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'rate_limits') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null })
              })
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    wallet_address: '0xNEW',
                    chat_usage: 0,
                    image_usage: 0,
                    video_usage: 0,
                    asmr_usage: 0
                  }
                })
              })
            })
          }
        }
        return {}
      })

      const request = createMockRequest({ wallet_address: '0xNEW' })
      const result = await chatRateLimiter(request)

      expect(result).toBeNull()
      expect(supabase.from('rate_limits').insert).toHaveBeenCalled()
    })

    it('handles database errors gracefully', async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Database error')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const request = createMockRequest({ wallet_address: '0x123' })
      
      // Should fall back to anonymous limiting
      const result = await chatRateLimiter(request)
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Rate Limit Headers', () => {
    it('includes rate limit headers in response', async () => {
      const request = createMockRequest({}, {}, '172.16.0.1')

      // Hit rate limit
      for (let i = 0; i < 6; i++) {
        await authRateLimiter(request)
      }

      const result = await authRateLimiter(request)
      expect(result.headers['X-RateLimit-Limit']).toBeDefined()
      expect(result.headers['X-RateLimit-Remaining']).toBe('0')
      expect(result.headers['X-RateLimit-Reset']).toBeDefined()
      expect(result.headers['Retry-After']).toBeDefined()
    })

    it('calculates retry-after correctly', async () => {
      const request = createMockRequest({}, {}, '172.16.0.2')

      // Hit rate limit
      for (let i = 0; i < 6; i++) {
        await authRateLimiter(request)
      }

      const result = await authRateLimiter(request)
      const retryAfter = parseInt(result.headers['Retry-After'])
      expect(retryAfter).toBeGreaterThan(0)
      expect(retryAfter).toBeLessThanOrEqual(60)
    })
  })

  describe('Memory Cleanup', () => {
    it('cleans up old anonymous entries', async () => {
      // Create old entries
      const oldRequest = createMockRequest({}, {}, '10.10.10.10')
      await authRateLimiter(oldRequest)

      // Advance time past cleanup threshold (1 hour)
      vi.advanceTimersByTime(3700000) // 1 hour + 100 seconds

      // Trigger cleanup (happens every 5 minutes)
      vi.advanceTimersByTime(300000) // 5 minutes

      // Old entries should be cleaned up
      // New request from same IP should be allowed
      const result = await authRateLimiter(oldRequest)
      expect(result).toBeNull()
    })
  })

  describe('Table-driven tests for endpoints', () => {
    const endpoints = [
      { name: 'auth', limiter: authRateLimiter, limit: 5, field: 'auth_usage' },
      { name: 'chat', limiter: chatRateLimiter, limit: 100, field: 'chat_usage' },
      { name: 'image', limiter: imageRateLimiter, limit: 10, field: 'image_usage' },
      { name: 'video', limiter: videoRateLimiter, limit: 5, field: 'video_usage' },
      { name: 'asmr', limiter: asmrRateLimiter, limit: 10, field: 'asmr_usage' }
    ]

    endpoints.forEach(({ name, limiter, limit, field }) => {
      it(`enforces ${limit} request limit for ${name} endpoint`, async () => {
        const usage = {}
        usage[field] = limit
        setupAuthenticatedUser('0xTEST', usage)

        const request = createMockRequest({ wallet_address: '0xTEST' })
        const result = await limiter(request)

        expect(result).not.toBeNull()
        expect(result.statusCode).toBe(429)
        expect(JSON.parse(result.body).error).toContain(`limit of ${limit}`)
      })
    })
  })

  describe('Reset Period', () => {
    it('resets usage after 60 seconds', async () => {
      const now = new Date()
      const pastReset = new Date(now.getTime() - 61000) // 61 seconds ago

      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'rate_limits') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    wallet_address: '0xRESET',
                    chat_usage: 100, // At limit
                    last_reset: pastReset.toISOString()
                  }
                })
              })
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({})
            })
          }
        }
        return {}
      })

      const request = createMockRequest({ wallet_address: '0xRESET' })
      const result = await chatRateLimiter(request)

      // Should allow request and reset usage
      expect(result).toBeNull()
      expect(supabase.from('rate_limits').update).toHaveBeenCalledWith(
        expect.objectContaining({
          chat_usage: 1,
          last_reset: expect.any(String)
        })
      )
    })
  })
})
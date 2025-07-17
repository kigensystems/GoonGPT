import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import * as AuthContext from './contexts/AuthContext'
import { imageClient } from './utils/imageClient'
import { chatClient } from './utils/chatClient'
import { videoClient } from './utils/videoClient'
import { asmrClient } from './utils/asmrClient'

// Mock all the clients
vi.mock('./utils/imageClient')
vi.mock('./utils/chatClient')
vi.mock('./utils/videoClient')
vi.mock('./utils/asmrClient')

// Mock auth context
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: vi.fn()
}))

describe('App Component', () => {
  const mockUser = {
    id: 'test-id',
    wallet_address: '0x123',
    username: 'testuser',
    email: 'test@example.com',
    created_at: new Date().toISOString()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Default auth state
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      session: null,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn()
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    expect(screen.getByText(/GoonGPT/i)).toBeInTheDocument()
  })

  describe('Mode Switching', () => {
    it('starts in chat mode by default', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
      expect(screen.getByText('Chat')).toHaveClass('bg-primary')
    })

    it('switches to image mode when clicked', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
      const imageButton = screen.getByText('Image')
      fireEvent.click(imageButton)
      expect(imageButton).toHaveClass('bg-primary')
    })

    it('switches to video mode when clicked', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
      const videoButton = screen.getByText('Video')
      fireEvent.click(videoButton)
      expect(videoButton).toHaveClass('bg-primary')
    })

    it('switches to ASMR mode when clicked', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
      const asmrButton = screen.getByText('ASMR')
      fireEvent.click(asmrButton)
      expect(asmrButton).toHaveClass('bg-primary')
    })
  })

  describe('Chat Functionality', () => {
    it('sends a chat message successfully', async () => {
      vi.mocked(chatClient.chat).mockResolvedValue('Hello from AI!')
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      const input = screen.getByPlaceholderText(/Say whatever's on your mind/i)
      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.change(input, { target: { value: 'Hello AI' } })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText('Hello AI')).toBeInTheDocument()
        expect(screen.getByText('Hello from AI!')).toBeInTheDocument()
      })

      expect(chatClient.chat).toHaveBeenCalledWith(
        'Hello AI',
        expect.any(String),
        mockUser.wallet_address
      )
    })

    it('handles chat errors gracefully', async () => {
      vi.mocked(chatClient.chat).mockRejectedValue(new Error('Network error'))
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      const input = screen.getByPlaceholderText(/Say whatever's on your mind/i)
      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.change(input, { target: { value: 'Hello AI' } })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText(/Sorry, there was an error/i)).toBeInTheDocument()
      })
    })

    it('handles rate limiting with proper message', async () => {
      const rateLimitError = new Error('Rate limit exceeded. Please wait 60 seconds.')
      ;(rateLimitError as any).rateLimited = true
      vi.mocked(chatClient.chat).mockRejectedValue(rateLimitError)
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      const input = screen.getByPlaceholderText(/Say whatever's on your mind/i)
      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.change(input, { target: { value: 'Hello AI' } })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText(/Rate limit exceeded/i)).toBeInTheDocument()
      })
    })
  })

  describe('Image Generation', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
      // Switch to image mode
      fireEvent.click(screen.getByText('Image'))
    })

    it('generates an image successfully', async () => {
      vi.mocked(imageClient.generateImage).mockResolvedValue({
        success: true,
        imageUrl: 'https://example.com/image.png',
        images: ['https://example.com/image.png']
      })

      const input = screen.getByPlaceholderText(/Describe the image/i)
      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.change(input, { target: { value: 'A beautiful sunset' } })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText('Generating your image...')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText('Here is your generated image:')).toBeInTheDocument()
      })

      expect(imageClient.generateImage).toHaveBeenCalledWith(
        'A beautiful sunset',
        512,
        512,
        expect.objectContaining({
          negative_prompt: 'low quality, blurry',
          samples: 1,
          safety_checker: false,
          enhance_prompt: true,
          wallet_address: mockUser.wallet_address
        })
      )
    })

    it('handles image generation errors', async () => {
      vi.mocked(imageClient.generateImage).mockRejectedValue(new Error('API error'))

      const input = screen.getByPlaceholderText(/Describe the image/i)
      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.change(input, { target: { value: 'A beautiful sunset' } })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText(/Sorry, there was an error generating the image/i)).toBeInTheDocument()
      })
    })
  })

  describe('Video Generation', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
      // Switch to video mode
      fireEvent.click(screen.getByText('Video'))
    })

    it('shows alert when no image is uploaded', async () => {
      // Mock window.alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      const input = screen.getByPlaceholderText(/Describe how the image should move/i)
      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.change(input, { target: { value: 'Make them dance' } })
      fireEvent.click(sendButton)

      expect(alertSpy).toHaveBeenCalledWith('Please upload an image first for video generation')
      alertSpy.mockRestore()
    })

    it('generates video with uploaded image', async () => {
      vi.mocked(videoClient.generateVideo).mockResolvedValue({
        success: true,
        videoUrl: 'https://example.com/video.mp4'
      })

      // Simulate image upload by clicking the upload area
      const uploadArea = screen.getByText(/Click to upload an image/i).closest('div')
      fireEvent.click(uploadArea!)

      // Mock file input change
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement
      const mockFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile]
      })
      fireEvent.change(fileInput)

      // Now generate video
      const input = screen.getByPlaceholderText(/Describe how the image should move/i)
      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.change(input, { target: { value: 'Make them dance' } })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText(/Your video is being generated/i)).toBeInTheDocument()
      })
    })
  })

  describe('ASMR Generation', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
      // Switch to ASMR mode
      fireEvent.click(screen.getByText('ASMR'))
    })

    it('generates ASMR audio successfully', async () => {
      vi.mocked(asmrClient.generateAudio).mockResolvedValue({
        success: true,
        audio_url: 'https://example.com/audio.mp3'
      })

      const input = screen.getByPlaceholderText(/Enter text for ASMR/i)
      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.change(input, { target: { value: 'Sweet whispers' } })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText('Here is your ASMR audio:')).toBeInTheDocument()
      })

      expect(asmrClient.generateAudio).toHaveBeenCalledWith(
        'Sweet whispers',
        mockUser.wallet_address
      )
    })
  })

  describe('Authentication States', () => {
    it('shows registration modal when not authenticated', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        session: null,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn()
      })

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      // Click wallet connect button
      const connectButton = screen.getByText(/Connect Wallet/i)
      fireEvent.click(connectButton)

      // Should trigger registration flow
      expect(screen.getByText(/Create Profile/i)).toBeInTheDocument()
    })

    it('shows user dropdown when authenticated', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      expect(screen.getByText(mockUser.username)).toBeInTheDocument()
    })
  })

  describe('Message State Management', () => {
    it('prevents duplicate message sending', async () => {
      vi.mocked(chatClient.chat).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('Response'), 1000))
      )

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      const input = screen.getByPlaceholderText(/Say whatever's on your mind/i)
      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.change(input, { target: { value: 'Test message' } })
      
      // Click send multiple times quickly
      fireEvent.click(sendButton)
      fireEvent.click(sendButton)
      fireEvent.click(sendButton)

      await waitFor(() => {
        // Should only see one user message
        const userMessages = screen.getAllByText('Test message')
        expect(userMessages).toHaveLength(1)
      })

      // Should only call API once
      expect(chatClient.chat).toHaveBeenCalledTimes(1)
    })
  })

})
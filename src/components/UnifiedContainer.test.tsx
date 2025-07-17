import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UnifiedContainer } from './UnifiedContainer'
import { Mode } from './WelcomeScreen'

describe('UnifiedContainer Component', () => {
  const mockMessages = [
    {
      id: '1',
      role: 'user' as const,
      content: 'Hello AI',
      timestamp: new Date()
    },
    {
      id: '2',
      role: 'assistant' as const,
      content: 'Hello! How can I help you?',
      timestamp: new Date()
    }
  ]

  const defaultProps = {
    mode: 'chat' as Mode,
    messages: mockMessages,
    onModeChange: vi.fn(),
    isLoading: false,
    onSendMessage: vi.fn(),
    onSuggestionClick: vi.fn(),
    // Video props
    videoUploadedImage: null,
    onVideoImageUpload: vi.fn(),
    videoQuality: 'standard' as const,
    onVideoQualityChange: vi.fn(),
    videoDuration: 81,
    onVideoDurationChange: vi.fn(),
    onSendVideo: vi.fn(),
    // ASMR props
    onSendAsmr: vi.fn(),
    // DeepFake props
    deepfakeBaseImage: null,
    deepfakeFaceImage: null,
    onDeepfakeBaseImageUpload: vi.fn(),
    onDeepfakeFaceImageUpload: vi.fn(),
    onSendDeepfake: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Mode Rendering', () => {
    it('renders chat mode correctly', () => {
      render(<UnifiedContainer {...defaultProps} />)
      
      expect(screen.getByText('Hello AI')).toBeInTheDocument()
      expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Say whatever's on your mind/i)).toBeInTheDocument()
    })

    it('renders image mode correctly', () => {
      render(<UnifiedContainer {...defaultProps} mode="image" />)
      
      expect(screen.getByPlaceholderText(/Describe the image you want/i)).toBeInTheDocument()
      expect(screen.getByText('Hot Korean Girl')).toBeInTheDocument()
    })

    it('renders video mode correctly', () => {
      render(<UnifiedContainer {...defaultProps} mode="video" />)
      
      expect(screen.getByText(/Upload an image to create a video/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Describe how the image should move/i)).toBeInTheDocument()
    })

    it('renders ASMR mode correctly', () => {
      render(<UnifiedContainer {...defaultProps} mode="asmr" />)
      
      expect(screen.getByPlaceholderText(/Enter text for sultry ASMR voice/i)).toBeInTheDocument()
    })

    it('renders deepfake mode correctly', () => {
      render(<UnifiedContainer {...defaultProps} mode="deepfake" />)
      
      expect(screen.getByText(/Upload base image/i)).toBeInTheDocument()
      expect(screen.getByText(/Upload face to swap/i)).toBeInTheDocument()
    })
  })

  describe('Mode Switching', () => {
    it('calls onModeChange when mode button is clicked', () => {
      render(<UnifiedContainer {...defaultProps} />)
      
      const imageButton = screen.getByText('Image')
      fireEvent.click(imageButton)
      
      expect(defaultProps.onModeChange).toHaveBeenCalledWith('image')
    })

    it('highlights active mode button', () => {
      render(<UnifiedContainer {...defaultProps} mode="video" />)
      
      const videoButton = screen.getByText('Video')
      expect(videoButton).toHaveClass('bg-primary')
      
      const chatButton = screen.getByText('Chat')
      expect(chatButton).not.toHaveClass('bg-primary')
    })
  })

  describe('Message Display', () => {
    it('renders all messages in order', () => {
      render(<UnifiedContainer {...defaultProps} />)
      
      const messages = screen.getAllByText(/Hello/i)
      expect(messages).toHaveLength(2)
      expect(messages[0]).toHaveTextContent('Hello AI')
      expect(messages[1]).toHaveTextContent('Hello! How can I help you?')
    })

    it('shows loading indicator when isLoading is true', () => {
      render(<UnifiedContainer {...defaultProps} isLoading={true} />)
      
      expect(screen.getByText(/Thinking.../i)).toBeInTheDocument()
    })

    it('scrolls to bottom when new messages arrive', async () => {
      const { rerender } = render(<UnifiedContainer {...defaultProps} />)
      
      // Mock scrollIntoView
      const scrollIntoViewMock = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoViewMock
      
      // Add a new message
      const newMessages = [...mockMessages, {
        id: '3',
        role: 'user' as const,
        content: 'New message',
        timestamp: new Date()
      }]
      
      rerender(<UnifiedContainer {...defaultProps} messages={newMessages} />)
      
      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalled()
      })
    })
  })

  describe('Chat Input', () => {
    it('sends message on Enter key', () => {
      render(<UnifiedContainer {...defaultProps} />)
      
      const input = screen.getByPlaceholderText(/Say whatever's on your mind/i)
      fireEvent.change(input, { target: { value: 'Test message' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      expect(defaultProps.onSendMessage).toHaveBeenCalledWith('Test message')
    })

    it('sends message on button click', () => {
      render(<UnifiedContainer {...defaultProps} />)
      
      const input = screen.getByPlaceholderText(/Say whatever's on your mind/i)
      const sendButton = screen.getByRole('button', { name: /send/i })
      
      fireEvent.change(input, { target: { value: 'Test message' } })
      fireEvent.click(sendButton)
      
      expect(defaultProps.onSendMessage).toHaveBeenCalledWith('Test message')
    })

    it('clears input after sending', () => {
      render(<UnifiedContainer {...defaultProps} />)
      
      const input = screen.getByPlaceholderText(/Say whatever's on your mind/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Test message' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      expect(input.value).toBe('')
    })

    it('disables input when loading', () => {
      render(<UnifiedContainer {...defaultProps} isLoading={true} />)
      
      const input = screen.getByPlaceholderText(/Say whatever's on your mind/i)
      const sendButton = screen.getByRole('button', { name: /send/i })
      
      expect(input).toBeDisabled()
      expect(sendButton).toBeDisabled()
    })
  })

  describe('Suggestion Pills', () => {
    it('renders suggestion pills for chat mode', () => {
      render(<UnifiedContainer {...defaultProps} />)
      
      expect(screen.getByText('How do I...')).toBeInTheDocument()
      expect(screen.getByText('Tell me about...')).toBeInTheDocument()
      expect(screen.getByText('What is...')).toBeInTheDocument()
    })

    it('renders suggestion pills for image mode', () => {
      render(<UnifiedContainer {...defaultProps} mode="image" />)
      
      expect(screen.getByText('Hot Korean Girl')).toBeInTheDocument()
      expect(screen.getByText('Placeholder 2')).toBeInTheDocument()
      expect(screen.getByText('Placeholder 3')).toBeInTheDocument()
    })

    it('calls onSuggestionClick when pill is clicked', () => {
      render(<UnifiedContainer {...defaultProps} />)
      
      const suggestionPill = screen.getByText('How do I...')
      fireEvent.click(suggestionPill)
      
      expect(defaultProps.onSuggestionClick).toHaveBeenCalledWith('How do I...')
    })
  })

  describe('Video Mode Specifics', () => {
    const videoProps = {
      ...defaultProps,
      mode: 'video' as Mode,
      videoUploadedImage: 'data:image/jpeg;base64,test'
    }

    it('shows uploaded image preview', () => {
      render(<UnifiedContainer {...videoProps} />)
      
      const preview = screen.getByAltText('Uploaded preview')
      expect(preview).toHaveAttribute('src', 'data:image/jpeg;base64,test')
    })

    it('allows changing video quality', () => {
      render(<UnifiedContainer {...videoProps} />)
      
      const qualityButton = screen.getByText('Standard')
      fireEvent.click(qualityButton)
      
      const highQualityOption = screen.getByText('High Quality')
      fireEvent.click(highQualityOption)
      
      expect(defaultProps.onVideoQualityChange).toHaveBeenCalledWith('high')
    })

    it('allows changing video duration', () => {
      render(<UnifiedContainer {...videoProps} />)
      
      const durationSlider = screen.getByLabelText(/Duration/i)
      fireEvent.change(durationSlider, { target: { value: '161' } })
      
      expect(defaultProps.onVideoDurationChange).toHaveBeenCalledWith(161)
    })

    it('handles file upload', () => {
      render(<UnifiedContainer {...videoProps} />)
      
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement
      const mockFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile]
      })
      
      fireEvent.change(fileInput)
      
      expect(defaultProps.onVideoImageUpload).toHaveBeenCalled()
    })
  })

  describe('ASMR Mode Specifics', () => {
    it('shows ASMR-specific suggestions', () => {
      render(<UnifiedContainer {...defaultProps} mode="asmr" />)
      
      expect(screen.getByText('Sweet whispers')).toBeInTheDocument()
      expect(screen.getByText('Counting slowly')).toBeInTheDocument()
      expect(screen.getByText('Bedtime story')).toBeInTheDocument()
    })

    it('calls onSendAsmr with input text', () => {
      render(<UnifiedContainer {...defaultProps} mode="asmr" />)
      
      const input = screen.getByPlaceholderText(/Enter text for sultry ASMR/i)
      fireEvent.change(input, { target: { value: 'ASMR text' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      expect(defaultProps.onSendAsmr).toHaveBeenCalledWith('ASMR text')
    })
  })

  describe('DeepFake Mode Specifics', () => {
    it('handles base image upload', () => {
      render(<UnifiedContainer {...defaultProps} mode="deepfake" />)
      
      const baseUpload = screen.getByText(/Upload base image/i).closest('div')
      const fileInput = baseUpload?.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = new File(['image'], 'base.jpg', { type: 'image/jpeg' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile]
      })
      
      fireEvent.change(fileInput)
      
      expect(defaultProps.onDeepfakeBaseImageUpload).toHaveBeenCalled()
    })

    it('handles face image upload', () => {
      render(<UnifiedContainer {...defaultProps} mode="deepfake" />)
      
      const faceUpload = screen.getByText(/Upload face to swap/i).closest('div')
      const fileInput = faceUpload?.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = new File(['image'], 'face.jpg', { type: 'image/jpeg' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile]
      })
      
      fireEvent.change(fileInput)
      
      expect(defaultProps.onDeepfakeFaceImageUpload).toHaveBeenCalled()
    })

    it('shows preview of uploaded images', () => {
      const deepfakeProps = {
        ...defaultProps,
        mode: 'deepfake' as Mode,
        deepfakeBaseImage: 'data:image/jpeg;base64,base',
        deepfakeFaceImage: 'data:image/jpeg;base64,face'
      }
      
      render(<UnifiedContainer {...deepfakeProps} />)
      
      const basePreviews = screen.getAllByAltText('Base')
      const facePreviews = screen.getAllByAltText('Face to swap')
      
      expect(basePreviews[0]).toHaveAttribute('src', 'data:image/jpeg;base64,base')
      expect(facePreviews[0]).toHaveAttribute('src', 'data:image/jpeg;base64,face')
    })

    it('calls onSendDeepfake when swap button is clicked', () => {
      const deepfakeProps = {
        ...defaultProps,
        mode: 'deepfake' as Mode,
        deepfakeBaseImage: 'data:image/jpeg;base64,base',
        deepfakeFaceImage: 'data:image/jpeg;base64,face'
      }
      
      render(<UnifiedContainer {...deepfakeProps} />)
      
      const swapButton = screen.getByText('Swap Faces')
      fireEvent.click(swapButton)
      
      expect(defaultProps.onSendDeepfake).toHaveBeenCalled()
    })
  })

  describe('Footer', () => {
    it('shows disclaimer text', () => {
      render(<UnifiedContainer {...defaultProps} />)
      
      expect(screen.getByText(/AI responses are unfiltered/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<UnifiedContainer {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/message input/i)).toBeInTheDocument()
    })

    it('supports keyboard navigation', () => {
      render(<UnifiedContainer {...defaultProps} />)
      
      const chatButton = screen.getByText('Chat')
      const imageButton = screen.getByText('Image')
      
      chatButton.focus()
      fireEvent.keyDown(chatButton, { key: 'Tab' })
      
      expect(document.activeElement).toBe(imageButton)
    })
  })
})
import { useState, useEffect } from 'react'
import { imageClient } from '../utils/imageClient'
import { ChatInput } from './ChatInput'
import { Message } from './ChatMessage'
import { ModeToggle } from './ModeToggle'

interface ImageContainerProps {
  isActive?: boolean
  initialMessages?: Message[]
  onMessagesChange?: (messages: Message[]) => void
  currentMode?: 'chat' | 'image' | 'video' | 'deepfake'
  onModeChange?: (mode: 'chat' | 'image' | 'video' | 'deepfake') => void
  onNavigateToLegal?: () => void
  onSuggestionClick?: (suggestion: string) => void
  promptMapping?: Record<string, string>
}

export function ImageContainer({ 
  initialMessages = [], 
  onMessagesChange, 
  currentMode = 'image', 
  onModeChange, 
  onNavigateToLegal, 
  onSuggestionClick,
  promptMapping = {}
}: ImageContainerProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  
  // Debug: Log initial messages and changes
  useEffect(() => {
    console.log('ImageContainer received initialMessages:', initialMessages.length, initialMessages)
    setMessages(initialMessages)
  }, [initialMessages])
  
  useEffect(() => {
    console.log('ImageContainer messages state changed:', messages.length, messages)
  }, [messages])
  
  // Helper function to update messages both locally and in parent
  const updateMessages = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    if (typeof newMessages === 'function') {
      setMessages(prev => {
        const updated = newMessages(prev)
        onMessagesChange?.(updated)
        return updated
      })
    } else {
      setMessages(newMessages)
      onMessagesChange?.(newMessages)
    }
  }
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    updateMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      console.log('Generating image for:', content)
      
      // Use enhanced prompt for backend if available, otherwise use original input
      const backendPrompt = promptMapping[content] || content
      
      const result = await imageClient.generateImage(
        backendPrompt,
        512,
        512,
        {
          negative_prompt: 'low quality, blurry',
          samples: 1,
          safety_checker: false,
          enhance_prompt: true
        }
      )
      
      console.log('Received image result:', result)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Here is your generated image:',
        imageUrl: result.images?.[0] || result.imageUrl,
        timestamp: new Date()
      }
      
      console.log('Adding assistant message:', assistantMessage)
      updateMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Image generation error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error generating the image. Please try again.',
        timestamp: new Date()
      }
      updateMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      {messages.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-8 px-4">
            {messages.map((message) => (
              <div key={message.id} className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' ? 'bg-accent' : 'bg-accent'
                  }`}>
                    {message.role === 'user' ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-white font-bold text-sm">G</span>
                    )}
                  </div>
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className="font-semibold text-sm mb-1">
                      {message.role === 'user' ? 'You' : 'GoonGPT'}
                    </div>
                    <div className="text-text-secondary">
                      {message.content}
                      {message.imageUrl && (
                        <img 
                          src={message.imageUrl} 
                          alt="Generated image" 
                          className="mt-4 rounded-lg max-w-md"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="mb-6">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">GoonGPT</div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {/* Welcome Screen */}
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-5xl font-bold mb-4">GoonGPT</h1>
            <p className="text-lg text-text-secondary text-center max-w-md">
              Create stunning images with AI
            </p>
          </div>
          
          {/* Suggestion pills */}
          <div className="flex gap-2 flex-wrap justify-center mb-8">
            <button 
              onClick={() => handleSendMessage("hot korean girl gooning")}
              className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Hot Korean Girl</span>
            </button>
            <button 
              onClick={() => handleSendMessage("Image prompt placeholder 2")}
              className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Placeholder 2</span>
            </button>
            <button 
              onClick={() => handleSendMessage("Image prompt placeholder 3")}
              className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Placeholder 3</span>
            </button>
          </div>
          
          {/* Terms disclaimer */}
          <div className="text-center text-xs text-text-muted mb-6">
            By messaging GoonGPT, you agree to our <button onClick={() => onNavigateToLegal?.()} className="underline hover:text-text-secondary">Terms</button> and have read our <button onClick={() => onNavigateToLegal?.()} className="underline hover:text-text-secondary">Privacy Policy</button>. See <button onClick={() => onNavigateToLegal?.()} className="underline hover:text-text-secondary">Disclaimer</button>.
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border">
        <div className="max-w-3xl mx-auto p-4">
          {/* Mode Toggle */}
          {onModeChange && (
            <div className="flex justify-center mb-4">
              <ModeToggle 
                currentMode={currentMode} 
                onModeChange={onModeChange}
              />
            </div>
          )}
          
          {/* Suggestion prompts for image mode */}
          {currentMode === 'image' && (
            <div className="max-w-5xl mx-auto">
              <div className="flex gap-2 flex-wrap justify-center mb-4">
                <button 
                  onClick={() => onSuggestionClick?.("hot korean girl gooning")}
                  className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Hot Korean Girl</span>
                </button>
                <button 
                  onClick={() => onSuggestionClick?.("Image prompt placeholder 2")}
                  className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Placeholder 2</span>
                </button>
                <button 
                  onClick={() => onSuggestionClick?.("Image prompt placeholder 3")}
                  className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Placeholder 3</span>
                </button>
              </div>
            </div>
          )}
          
          <ChatInput 
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Describe the image you want to generate"
          />
        </div>
      </div>
    </div>
  )
}
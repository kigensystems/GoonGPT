import { useEffect, useRef } from 'react'
import { DeepFakeInput } from './DeepFakeInput'
import { Message } from './ChatMessage'
import { ModeToggle } from './ModeToggle'

interface DeepFakeContainerProps {
  isActive: boolean
  initialMessages?: Message[]
  currentMode?: 'chat' | 'image' | 'video' | 'asmr' | 'deepfake'
  onModeChange?: (mode: 'chat' | 'image' | 'video' | 'asmr' | 'deepfake') => void
  onNavigateToLegal?: () => void
  baseImage: string | null
  faceImage: string | null
  onBaseImageUpload: (image: string | null) => void
  onFaceImageUpload: (image: string | null) => void
  onSend: () => void
  isLoading: boolean
}

export function DeepFakeContainer({ 
  initialMessages = [], 
  currentMode = 'deepfake', 
  onModeChange, 
  onNavigateToLegal,
  baseImage,
  faceImage,
  onBaseImageUpload,
  onFaceImageUpload,
  onSend,
  isLoading
}: DeepFakeContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Use parent's messages directly instead of local state
  const messages = initialMessages
  
  // Debug: Log messages changes
  useEffect(() => {
    console.log('DeepFakeContainer messages updated:', messages.length, messages)
  }, [messages])
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages Area */}
      {messages.length > 0 ? (
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
          <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Always show disabled message at the top */}
            <div className="mb-6">
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-accent">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                {/* Message Content */}
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">
                    GoonGPT
                  </div>
                  <div className="text-red-400">
                    Currently disabled due to server load, upgrade to a subscription plan for unlimited usage
                  </div>
                </div>
              </div>
            </div>
            
            {messages.map((message) => (
              <div key={message.id} className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
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
                  {/* Message Content */}
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className="font-semibold text-sm mb-1">
                      {message.role === 'user' ? 'You' : 'GoonGPT'}
                    </div>
                    <div className={`${
                      message.content.includes('Currently disabled due to server load') 
                        ? 'text-red-400' 
                        : 'text-text-secondary'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {/* Welcome Screen */}
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-5xl font-bold mb-4">GoonGPT</h1>
            <p className="text-lg text-text-secondary text-center max-w-md">
              Uncensored. Unfiltered.
            </p>
          </div>
          
          {/* DeepFake disabled message */}
          <div className="text-center mb-8">
            <div className="text-orange-400 mb-2">
              Currently disabled due to server load, upgrade to a subscription plan for unlimited usage
            </div>
          </div>
          
          {/* Terms disclaimer */}
          <div className="text-center text-xs text-text-muted mb-6">
            By messaging GoonGPT, you agree to our <button onClick={() => onNavigateToLegal?.()} className="underline hover:text-text-secondary">Terms</button> and have read our <button onClick={() => onNavigateToLegal?.()} className="underline hover:text-text-secondary">Privacy Policy</button>. See <button onClick={() => onNavigateToLegal?.()} className="underline hover:text-text-secondary">Disclaimer</button>.
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0">
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
          
          <DeepFakeInput
            onSend={onSend}
            baseImage={baseImage}
            faceImage={faceImage}
            onBaseImageUpload={onBaseImageUpload}
            onFaceImageUpload={onFaceImageUpload}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
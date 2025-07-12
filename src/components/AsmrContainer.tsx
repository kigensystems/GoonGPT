import { useEffect, useRef } from 'react'
import { AsmrInput } from './AsmrInput'
import { AsmrMessage } from './AsmrMessage'
import { Message } from './ChatMessage'
import { ModeToggle } from './ModeToggle'

interface AsmrContainerProps {
  isActive: boolean
  initialMessages?: Message[]
  currentMode?: 'chat' | 'image' | 'video' | 'asmr' | 'deepfake'
  onModeChange?: (mode: 'chat' | 'image' | 'video' | 'asmr' | 'deepfake') => void
  onNavigateToLegal?: () => void
  onSend: (text: string) => void
  isLoading: boolean
}

export function AsmrContainer({ 
  initialMessages = [], 
  currentMode = 'asmr', 
  onModeChange, 
  onNavigateToLegal,
  onSend,
  isLoading
}: AsmrContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Use parent's messages directly
  const messages = initialMessages
  
  // Debug: Log messages changes
  useEffect(() => {
    console.log('AsmrContainer messages updated:', messages.length, messages)
  }, [messages])
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (text: string) => {
    if (text.trim() && !isLoading) {
      onSend(text)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages Area */}
      {messages.length > 0 ? (
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
          <div className="max-w-3xl mx-auto py-8 px-4">
            {messages.map((message) => (
              <AsmrMessage key={message.id} message={message} />
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
          
          {/* ASMR description */}
          <div className="text-center mb-8">
            <p className="text-text-secondary mb-2">
              Transform your text into soothing ASMR whispers
            </p>
            <p className="text-sm text-text-muted">
              Enter any text and listen to it in a soft, whispering voice
            </p>
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
          
          {/* Suggestion prompts for ASMR mode */}
          {currentMode === 'asmr' && (
            <div className="max-w-5xl mx-auto">
              <div className="flex gap-2 flex-wrap justify-center mb-4">
                <button 
                  onClick={() => handleSend("Good night, sweet dreams. Rest well and let all your worries drift away.")}
                  className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Bedtime Whisper</span>
                </button>
                <button 
                  onClick={() => handleSend("You are amazing, beautiful, and worthy of all the love in the world. Take a deep breath and relax.")}
                  className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Gentle Affirmations</span>
                </button>
                <button 
                  onClick={() => handleSend("Let me take care of you. Close your eyes and focus on my voice. Everything is going to be okay.")}
                  className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Personal Attention</span>
                </button>
              </div>
            </div>
          )}
          
          <AsmrInput
            onSend={handleSend}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
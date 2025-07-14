import { useState } from 'react'

interface ChatInputProps {
  value?: string
  onChange?: (value: string) => void
  onSendMessage: (message: string) => void
  isLoading: boolean
  placeholder?: string
}

export function ChatInput({ value, onChange, onSendMessage, isLoading, placeholder = "Ask anything" }: ChatInputProps) {
  const [internalInput, setInternalInput] = useState('')
  
  // Use controlled value if provided, otherwise use internal state
  const inputValue = value !== undefined ? value : internalInput
  const setInputValue = onChange || setInternalInput

  const handleSend = () => {
    console.log('Button clicked!', { inputValue, isLoading })
    if (!inputValue.trim() || isLoading) return
    onSendMessage(inputValue)
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-6 py-4 pr-16 bg-surface rounded-3xl focus:outline-none focus:ring-2 focus:ring-accent placeholder-text-muted text-lg"
        disabled={isLoading}
      />
      <button
        onClick={handleSend}
        disabled={isLoading}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-9 h-9 bg-accent disabled:bg-gray-600 disabled:opacity-50 rounded-full hover:bg-accent/90 transition-all duration-200 shadow-lg hover:shadow-xl z-10 cursor-pointer pointer-events-auto"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-7-7m7 7l-7 7" />
          </svg>
        )}
      </button>
    </div>
  )
}
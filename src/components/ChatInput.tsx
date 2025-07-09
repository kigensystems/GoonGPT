import { useState } from 'react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  placeholder?: string
}

export function ChatInput({ onSendMessage, isLoading, placeholder = "Ask anything" }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    onSendMessage(input)
    setInput('')
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
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-6 py-4 bg-surface rounded-3xl focus:outline-none focus:ring-2 focus:ring-accent placeholder-text-muted text-lg"
        disabled={isLoading}
      />
      {input.trim() && (
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-accent hover:text-accent/80 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      )}
    </div>
  )
}
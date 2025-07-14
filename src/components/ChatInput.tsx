import { useState } from 'react'
import { CancelableLoadingButton } from './CancelableLoadingButton'

interface ChatInputProps {
  value?: string
  onChange?: (value: string) => void
  onSendMessage: (message: string) => void
  isLoading: boolean
  placeholder?: string
  onCancel?: () => void
}

export function ChatInput({ value, onChange, onSendMessage, isLoading, placeholder = "Ask anything", onCancel }: ChatInputProps) {
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
      <CancelableLoadingButton
        isLoading={isLoading}
        onCancel={onCancel}
        onClick={handleSend}
        disabled={!inputValue.trim()}
        className="absolute right-2 top-1/2 transform -translate-y-1/2"
      />
    </div>
  )
}
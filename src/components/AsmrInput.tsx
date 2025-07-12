import { useState, KeyboardEvent } from 'react'

interface AsmrInputProps {
  onSend: (text: string) => void
  isLoading: boolean
}

export function AsmrInput({ onSend, isLoading }: AsmrInputProps) {
  const [text, setText] = useState('')
  const maxLength = 500 // Character limit for ASMR text

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSend(text.trim())
      setText('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          placeholder="Enter text to convert to ASMR whispers..."
          className="w-full px-6 py-4 pr-16 bg-surface rounded-3xl focus:outline-none focus:ring-2 focus:ring-accent placeholder-text-muted text-lg resize-none min-h-[120px] max-h-[300px]"
          rows={3}
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !text.trim()}
          className="absolute right-2 bottom-2 flex items-center justify-center w-9 h-9 bg-accent disabled:bg-gray-600 disabled:opacity-50 rounded-full hover:bg-accent/90 transition-all duration-200 shadow-lg hover:shadow-xl z-10 cursor-pointer pointer-events-auto"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex justify-between items-center text-xs text-text-muted px-2">
        <span>{text.length} / {maxLength} characters</span>
        <span>Press Enter to send, Shift+Enter for new line</span>
      </div>
    </div>
  )
}
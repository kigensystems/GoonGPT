import { useState, useEffect, useRef } from 'react'

interface ImageInputProps {
  value?: string
  onChange?: (value: string) => void
  onSendMessage: (message: string) => void
  isLoading: boolean
  placeholder?: string
  imageStyle: 'anime' | 'realism'
  setImageStyle: (style: 'anime' | 'realism') => void
}

const styleOptions = [
  { key: 'anime', label: 'Anime', description: 'Illustrated aesthetic' },
  { key: 'realism', label: 'Realism', description: 'Photorealistic images' }
]

export function ImageInput({ 
  value, 
  onChange, 
  onSendMessage, 
  isLoading, 
  placeholder = "Describe the image you want to generate",
  imageStyle,
  setImageStyle
}: ImageInputProps) {
  const [internalInput, setInternalInput] = useState('')
  const [showStyleDropdown, setShowStyleDropdown] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Use controlled value if provided, otherwise use internal state
  const inputValue = value !== undefined ? value : internalInput
  const setInputValue = onChange || setInternalInput

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowStyleDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSend = () => {
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

  const currentStyle = styleOptions.find(opt => opt.key === imageStyle)

  return (
    <div ref={containerRef} className="flex flex-col">
      <div className="w-full mx-auto">
        <div className="bg-surface rounded-3xl shadow-lg">
          {/* Text Input Row */}
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-4 py-4 pr-16 bg-transparent focus:outline-none placeholder-text-muted text-lg"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-9 h-9 bg-accent disabled:bg-gray-600 disabled:opacity-50 rounded-full hover:bg-accent/90 transition-all duration-200 shadow-lg hover:shadow-xl z-10 cursor-pointer pointer-events-auto"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-7-7m7 7l-7 7" />
              </svg>
            </button>
          </div>

          {/* Bottom row with style selector */}
          <div className="flex items-center gap-3 px-4 pb-3 pt-1">
            <div className="relative">
              <button
                onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                className="flex items-center gap-2 bg-surface/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/20 hover:bg-surface transition-colors"
              >
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-text-primary font-medium">
                  {currentStyle?.label}
                </span>
              </button>
              
              {showStyleDropdown && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-surface border border-border/20 rounded-lg shadow-lg py-1 z-50">
                  {styleOptions.map(({ key, label, description }) => (
                    <button
                      key={key}
                      onClick={() => {
                        setImageStyle(key as 'anime' | 'realism')
                        setShowStyleDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-bg-main/50 transition-colors ${
                        imageStyle === key ? 'text-accent' : 'text-text-primary'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium">{label}</div>
                        <div className="text-xs text-text-secondary mt-0.5">{description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { useState, useEffect, useRef } from 'react'

interface VideoInputProps {
  value?: string
  onChange?: (value: string) => void
  onSend: (prompt: string) => void
  onImageUpload: (image: string | null) => void
  uploadedImage: string | null
  videoQuality: 'quick' | 'standard' | 'high'
  setVideoQuality: (quality: 'quick' | 'standard' | 'high') => void
  videoDuration: number
  setVideoDuration: (duration: number) => void
  videoFormat: 'mp4' | 'gif'
  setVideoFormat: (format: 'mp4' | 'gif') => void
  isLoading: boolean
}

export function VideoInput({
  value: externalValue,
  onChange: externalOnChange,
  onSend,
  onImageUpload,
  uploadedImage,
  videoQuality,
  setVideoQuality,
  videoDuration,
  setVideoDuration,
  videoFormat,
  setVideoFormat,
  isLoading
}: VideoInputProps) {
  const [internalValue, setInternalValue] = useState('')
  const [showDurationDropdown, setShowDurationDropdown] = useState(false)
  const [showQualityDropdown, setShowQualityDropdown] = useState(false)
  const [showFormatDropdown, setShowFormatDropdown] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Use external value if provided, otherwise use internal state
  const value = externalValue !== undefined ? externalValue : internalValue
  const onChange = externalOnChange || setInternalValue

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeAllDropdowns()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onImageUpload(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if (!value.trim() || isLoading || !uploadedImage) return
    onSend(value)
    if (externalOnChange) {
      externalOnChange('')
    } else {
      setInternalValue('')
    }
  }

  const getDurationInSeconds = () => {
    return (videoDuration / 16).toFixed(1)
  }

  const closeAllDropdowns = () => {
    setShowDurationDropdown(false)
    setShowQualityDropdown(false)
    setShowFormatDropdown(false)
  }

  const durationOptions = [
    { frames: 25, seconds: 1.5 },
    { frames: 40, seconds: 2.5 },
    { frames: 48, seconds: 3.0 },
    { frames: 64, seconds: 4.0 },
    { frames: 81, seconds: 5.0 },
    { frames: 96, seconds: 6.0 },
    { frames: 120, seconds: 7.5 }
  ]

  const qualityOptions = [
    { key: 'quick', label: 'Quick', icon: '⚡' },
    { key: 'standard', label: 'Standard', icon: '⭐' },
    { key: 'high', label: 'High', icon: '💎' }
  ]

  const formatOptions = [
    { key: 'mp4', label: 'MP4', icon: '🎬' },
    { key: 'gif', label: 'GIF', icon: '🎞️' }
  ]

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl">
      {/* Main Input Container */}
      <div className="relative flex items-center bg-surface rounded-3xl border border-border/20 focus-within:border-accent/50 transition-colors">
        {/* + Button for Image Upload */}
        <div className="pl-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="video-image-upload"
          />
          <label
            htmlFor="video-image-upload"
            className="flex items-center justify-center w-8 h-8 bg-surface/80 hover:bg-surface border border-border/20 rounded-lg cursor-pointer transition-colors group"
          >
            <svg className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </label>
        </div>

        {/* Image Preview */}
        {uploadedImage && (
          <div className="ml-3 relative group">
            <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-border/20">
              <div className="relative">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded preview" 
                  className="w-6 h-6 rounded object-cover cursor-pointer"
                />
                {/* Remove button overlay */}
                <button
                  onClick={() => onImageUpload(null)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {/* Large preview on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  <div className="relative">
                    <img 
                      src={uploadedImage} 
                      alt="Image preview" 
                      className="w-32 h-32 object-cover rounded-lg border border-border/20 shadow-lg"
                    />
                    {/* Arrow pointing down */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-surface"></div>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xs text-text-primary">Image</span>
            </div>
          </div>
        )}

        {/* Text Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your video..."
          className="flex-1 px-4 py-4 bg-transparent focus:outline-none placeholder-text-muted text-lg"
          disabled={isLoading}
        />

        {/* Video Controls */}
        <div className="flex items-center gap-2 pr-4">
          {/* Duration */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDurationDropdown(!showDurationDropdown)
                setShowQualityDropdown(false)
                setShowFormatDropdown(false)
              }}
              className="flex items-center gap-1 bg-surface/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-border/20 hover:bg-surface transition-colors"
            >
              <svg className="w-3 h-3 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-text-primary font-mono">
                {getDurationInSeconds()}s
              </span>
            </button>
            
            {showDurationDropdown && (
              <div className="absolute bottom-full right-0 mb-2 w-24 bg-surface border border-border/20 rounded-lg shadow-lg py-1 z-50">
                {durationOptions.map(({ frames, seconds }) => (
                  <button
                    key={frames}
                    onClick={() => {
                      setVideoDuration(frames)
                      setShowDurationDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-1 text-xs hover:bg-bg-main/50 transition-colors ${
                      videoDuration === frames ? 'text-accent' : 'text-text-primary'
                    }`}
                  >
                    {seconds}s
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quality */}
          <div className="relative">
            <button
              onClick={() => {
                setShowQualityDropdown(!showQualityDropdown)
                setShowDurationDropdown(false)
                setShowFormatDropdown(false)
              }}
              className="flex items-center gap-1 bg-surface/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-border/20 hover:bg-surface transition-colors"
            >
              <svg className="w-3 h-3 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs text-text-primary">
                4v
              </span>
            </button>
            
            {showQualityDropdown && (
              <div className="absolute bottom-full right-0 mb-2 w-24 bg-surface border border-border/20 rounded-lg shadow-lg py-1 z-50">
                {qualityOptions.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setVideoQuality(key as any)
                      setShowQualityDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-1 text-xs hover:bg-bg-main/50 transition-colors flex items-center gap-1 ${
                      videoQuality === key ? 'text-accent' : 'text-text-primary'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Format */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFormatDropdown(!showFormatDropdown)
                setShowDurationDropdown(false)
                setShowQualityDropdown(false)
              }}
              className="flex items-center gap-1 bg-surface/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-border/20 hover:bg-surface transition-colors"
            >
              <svg className="w-3 h-3 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2h4a1 1 0 0 1 0 2h-1v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6H3a1 1 0 1 1 0-2h4z" />
              </svg>
              <span className="text-xs text-text-primary">
                {videoFormat === 'mp4' ? 'MP4' : 'GIF'}
              </span>
            </button>
            
            {showFormatDropdown && (
              <div className="absolute bottom-full right-0 mb-2 w-20 bg-surface border border-border/20 rounded-lg shadow-lg py-1 z-50">
                {formatOptions.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setVideoFormat(key as any)
                      setShowFormatDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-1 text-xs hover:bg-bg-main/50 transition-colors flex items-center gap-1 ${
                      videoFormat === key ? 'text-accent' : 'text-text-primary'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Help Button */}
          <button className="flex items-center justify-center w-6 h-6 bg-surface/80 hover:bg-surface rounded-full transition-colors">
            <svg className="w-3 h-3 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isLoading || !value.trim() || !uploadedImage}
            className="flex items-center justify-center w-9 h-9 bg-accent disabled:bg-gray-600 disabled:opacity-50 rounded-full hover:bg-accent/90 transition-all duration-200 shadow-lg hover:shadow-xl z-10 cursor-pointer pointer-events-auto"
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
      </div>
    </div>
  )
}
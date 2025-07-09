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
  isLoading
}: VideoInputProps) {
  const [internalValue, setInternalValue] = useState('')
  const [showDurationDropdown, setShowDurationDropdown] = useState(false)
  const [showQualityDropdown, setShowQualityDropdown] = useState(false)
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
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size too large. Please select an image smaller than 10MB.')
        return
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please select a JPEG, PNG, or WebP image.')
        return
      }

      // Compress image before uploading
      compressImage(file, 0.8, 1024, 1024)
        .then(compressedDataUrl => {
          onImageUpload(compressedDataUrl)
        })
        .catch(error => {
          console.error('Error compressing image:', error)
          // Fallback to original file if compression fails
          const reader = new FileReader()
          reader.onloadend = () => {
            onImageUpload(reader.result as string)
          }
          reader.readAsDataURL(file)
        })
    }
  }

  // Image compression utility
  const compressImage = (file: File, quality: number = 0.8, maxWidth: number = 1024, maxHeight: number = 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        // Set canvas size
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Convert to base64 with compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
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
  }

  const durationOptions = [
    { frames: 25, seconds: 1.5 },
    { frames: 48, seconds: 3.0 },
    { frames: 81, seconds: 5.0 },
    { frames: 120, seconds: 7.5 }
  ]

  const qualityOptions = [
    { key: 'quick', label: 'Fast' },
    { key: 'standard', label: 'Standard' },
    { key: 'high', label: 'Quality' }
  ]

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl">
      {/* Main Input Container */}
      <div className="bg-surface rounded-3xl border border-border/20 focus-within:border-accent/50 transition-colors">
        {/* Top row with input and send button */}
        <div className="relative flex items-center">
          {/* + Button for Image Upload */}
          <div className="pl-4">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
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
            className="flex-1 px-4 py-4 pr-16 bg-transparent focus:outline-none placeholder-text-muted text-lg"
            disabled={isLoading}
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isLoading || !value.trim() || !uploadedImage}
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

        {/* Bottom row with video controls */}
        <div className="flex items-center gap-3 px-4 pb-3 pt-1">
          {/* Duration */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDurationDropdown(!showDurationDropdown)
                setShowQualityDropdown(false)
              }}
              className="flex items-center gap-2 bg-surface/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/20 hover:bg-surface transition-colors"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-text-primary font-medium">
                {getDurationInSeconds()}s
              </span>
            </button>
            
            {showDurationDropdown && (
              <div className="absolute top-full left-0 mt-2 w-20 bg-surface border border-border/20 rounded-lg shadow-lg py-1 z-50">
                {durationOptions.map(({ frames, seconds }) => (
                  <button
                    key={frames}
                    onClick={() => {
                      setVideoDuration(frames)
                      setShowDurationDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-bg-main/50 transition-colors ${
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
              }}
              className="flex items-center gap-2 bg-surface/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/20 hover:bg-surface transition-colors"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
              </svg>
              <span className="text-sm text-text-primary font-medium">
                {qualityOptions.find(opt => opt.key === videoQuality)?.label}
              </span>
            </button>
            
            {showQualityDropdown && (
              <div className="absolute top-full left-0 mt-2 w-28 bg-surface border border-border/20 rounded-lg shadow-lg py-1 z-50">
                {qualityOptions.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setVideoQuality(key as any)
                      setShowQualityDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-bg-main/50 transition-colors ${
                      videoQuality === key ? 'text-accent' : 'text-text-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
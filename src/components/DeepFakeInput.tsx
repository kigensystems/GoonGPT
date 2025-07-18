import { useRef } from 'react'

interface DeepFakeInputProps {
  onSend: () => void
  baseImage: string | null
  faceImage: string | null
  onBaseImageUpload: (image: string | null) => void
  onFaceImageUpload: (image: string | null) => void
  isLoading: boolean
  disabled?: boolean
}

export function DeepFakeInput({
  onSend,
  baseImage,
  faceImage,
  onBaseImageUpload,
  onFaceImageUpload,
  isLoading,
  disabled = false
}: DeepFakeInputProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    uploadHandler: (image: string | null) => void
  ) => {
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
          uploadHandler(compressedDataUrl)
        })
        .catch(error => {
          console.error('Error compressing image:', error)
          // Fallback to original file if compression fails
          const reader = new FileReader()
          reader.onloadend = () => {
            uploadHandler(reader.result as string)
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

  const allImagesUploaded = baseImage && faceImage

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl">
      {/* Main Container */}
      <div className="bg-surface rounded-3xl border border-border/20 p-4 space-y-4">
        {/* Image Upload Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Base Image */}
          <div className="space-y-2">
            <label className="text-xs text-text-secondary">Base Image</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleImageUpload(e, onBaseImageUpload)}
              className="hidden"
              id="deepfake-base-image"
            />
            <label
              htmlFor="deepfake-base-image"
              className="block aspect-video bg-surface/50 border-2 border-dashed border-border/20 rounded-lg cursor-pointer hover:border-accent/50 transition-colors overflow-hidden"
            >
              {baseImage ? (
                <img src={baseImage} alt="Base" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <svg className="w-6 h-6 text-text-muted mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-text-muted">Base image</span>
                </div>
              )}
            </label>
            {baseImage && (
              <button
                onClick={() => onBaseImageUpload(null)}
                className="text-xs text-red-400 hover:text-red-300 w-full"
              >
                Remove
              </button>
            )}
          </div>

          {/* Face Image */}
          <div className="space-y-2">
            <label className="text-xs text-text-secondary">New Face</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleImageUpload(e, onFaceImageUpload)}
              className="hidden"
              id="deepfake-face-image"
            />
            <label
              htmlFor="deepfake-face-image"
              className="block aspect-video bg-surface/50 border-2 border-dashed border-border/20 rounded-lg cursor-pointer hover:border-accent/50 transition-colors overflow-hidden"
            >
              {faceImage ? (
                <img src={faceImage} alt="Face" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <svg className="w-6 h-6 text-text-muted mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs text-text-muted">New face</span>
                </div>
              )}
            </label>
            {faceImage && (
              <button
                onClick={() => onFaceImageUpload(null)}
                className="text-xs text-red-400 hover:text-red-300 w-full"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={onSend}
            disabled={disabled || isLoading || !allImagesUploaded}
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

        {/* Helper Text */}
        {!allImagesUploaded && (
          <p className="text-xs text-text-muted text-center">
            Upload both images to start face swapping
          </p>
        )}
      </div>
    </div>
  )
}
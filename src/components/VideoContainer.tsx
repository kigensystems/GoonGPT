import { useState, useRef, useEffect } from 'react'
import { videoClient } from '../utils/videoClient'
import { VideoInput } from './VideoInput'
import { VideoMessage } from './VideoMessage'
import { Message } from './ChatMessage'
import { ModeToggle } from './ModeToggle'

interface VideoContainerProps {
  isActive?: boolean
  initialMessages?: Message[]
  onMessagesChange?: (messages: Message[]) => void
  currentMode?: 'chat' | 'image' | 'video' | 'deepfake'
  onModeChange?: (mode: 'chat' | 'image' | 'video' | 'deepfake') => void
  onNavigateToLegal?: () => void
}

interface VideoSettings {
  quality: 'quick' | 'standard' | 'high'
  duration: number
  speed: 'slow' | 'normal' | 'fast'
}

export function VideoContainer({ initialMessages = [], onMessagesChange, currentMode = 'video', onModeChange }: VideoContainerProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Helper function to update messages both locally and in parent
  const updateMessages = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    if (typeof newMessages === 'function') {
      setMessages(prev => {
        const updated = newMessages(prev)
        onMessagesChange?.(updated)
        return updated
      })
    } else {
      setMessages(newMessages)
      onMessagesChange?.(newMessages)
    }
  }
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    quality: 'standard',
    duration: 81,
    speed: 'normal'
  })

  const handleVideoGeneration = async (prompt: string) => {
    if (!uploadedImage) {
      alert('Please upload an image first for video generation')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    }

    updateMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Calculate FPS based on speed setting
      const fps = videoSettings.speed === 'slow' ? '8' : videoSettings.speed === 'normal' ? '16' : '24'
      
      // Adjust duration based on quality preset
      let adjustedDuration = videoSettings.duration
      if (videoSettings.quality === 'quick') {
        adjustedDuration = Math.min(videoSettings.duration, 50) // Limit quick to ~3 seconds
      } else if (videoSettings.quality === 'high') {
        adjustedDuration = Math.min(videoSettings.duration, 81) // Standard max for high quality
      }

      // First show processing message
      const processingMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Your video is being generated. This may take up to 60 seconds...',
        timestamp: new Date()
      }
      updateMessages(prev => [...prev, processingMessage])
      
      const result = await videoClient.generateVideo(
        uploadedImage,
        prompt,
        {
          negative_prompt: videoSettings.quality === 'quick' 
            ? 'blurry, low quality' 
            : 'blurry, low quality, distorted, extra limbs, missing limbs, broken fingers, deformed, glitch, artifacts, unrealistic, low resolution, bad anatomy, duplicate, cropped, watermark, text, logo, jpeg artifacts, noisy, oversaturated, underexposed, overexposed, flicker, unstable motion, motion blur, stretched, mutated, out of frame, bad proportions',
          num_frames: adjustedDuration.toString(),
          fps: fps,
          output_type: 'mp4'
        }
      )

      console.log('Video generation result:', result)

      // Update the processing message with the video
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Here is your generated video:',
        videoUrl: result.videoUrl,
        timestamp: new Date()
      }
      updateMessages(prev => [...prev, assistantMessage])
      
      // Clear uploaded image after successful generation
      setUploadedImage(null)
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, there was an error generating the video: ${error instanceof Error ? error.message : 'Unknown error'}. Please upload an image and describe the video you want.`,
        timestamp: new Date()
      }
      updateMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (image: string | null) => {
    setUploadedImage(image)
  }

  const updateVideoSettings = (newSettings: Partial<VideoSettings>) => {
    setVideoSettings(prev => ({ ...prev, ...newSettings }))
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Messages */}
      {messages.length > 0 ? (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="max-w-3xl mx-auto py-8 px-4">
            {messages.map((message) => (
              <VideoMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="mb-6">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">GoonGPT</div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Scroll target */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {/* Welcome Screen */}
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-5xl font-bold mb-4">GoonGPT</h1>
            <p className="text-lg text-text-secondary text-center max-w-md">
              Create videos from images with AI
            </p>
          </div>
          
          {/* Video suggestion pills */}
          <div className="flex gap-2 flex-wrap justify-center mb-8">
            <button 
              onClick={() => handleVideoGeneration("Make this character dance")}
              className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <span>Make them dance</span>
            </button>
            <button 
              onClick={() => handleVideoGeneration("Animate this person talking")}
              className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Make them talk</span>
            </button>
            <button 
              onClick={() => handleVideoGeneration("Add cinematic movement and effects")}
              className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Cinematic effects</span>
            </button>
            <button 
              onClick={() => handleVideoGeneration("Create dramatic lighting changes")}
              className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              <span>Dramatic lighting</span>
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border">
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
          <VideoInput
            onSend={handleVideoGeneration}
            onImageUpload={handleImageUpload}
            uploadedImage={uploadedImage}
            videoQuality={videoSettings.quality}
            setVideoQuality={(quality) => updateVideoSettings({ quality })}
            videoDuration={videoSettings.duration}
            setVideoDuration={(duration) => updateVideoSettings({ duration })}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

export type { VideoSettings }
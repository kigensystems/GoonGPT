import { useState, useRef, useEffect } from 'react'
import { Message } from './ChatMessage'

interface AsmrMessageProps {
  message: Message
}

export function AsmrMessage({ message }: AsmrMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
        setCurrentTime(audio.currentTime)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [message.audioUrl])

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * audio.duration
    audio.currentTime = newTime
  }

  const downloadAudio = () => {
    if (message.audioUrl) {
      const link = document.createElement('a')
      link.href = message.audioUrl
      link.download = `asmr_${message.id}.wav`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
      <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          message.role === 'user' ? 'bg-accent' : 'bg-accent'
        }`}>
          {message.role === 'user' ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          ) : (
            <span className="text-white font-bold text-sm">G</span>
          )}
        </div>
        
        {/* Message Content */}
        <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
          <div className="font-semibold text-sm mb-1">
            {message.role === 'user' ? 'You' : 'GoonGPT'}
          </div>
          
          <div className="text-text-secondary">
            {message.content}
            
            {/* Audio Player */}
            {message.audioUrl && (
              <div className="mt-3 bg-surface rounded-lg p-4 max-w-md">
                <audio ref={audioRef} src={message.audioUrl} preload="metadata" />
                
                {/* Play Controls */}
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={togglePlayback}
                    className="flex items-center justify-center w-10 h-10 bg-accent rounded-full hover:bg-accent/90 transition-colors"
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Time Display */}
                  <div className="text-sm text-text-muted">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  
                  {/* Download Button */}
                  <button
                    onClick={downloadAudio}
                    className="ml-auto flex items-center justify-center w-8 h-8 text-text-secondary hover:text-text-primary transition-colors"
                    title="Download audio"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div 
                  className="w-full bg-gray-700 rounded-full h-2 cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="bg-accent h-2 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                {/* ASMR Label */}
                <div className="flex items-center gap-2 mt-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span className="text-xs text-purple-400 font-medium">ASMR Audio</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
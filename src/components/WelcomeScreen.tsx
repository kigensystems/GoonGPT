import { Link } from 'react-router-dom'
import { DeepFakeInput } from './DeepFakeInput'
import { VideoInput } from './VideoInput'
import { CancelableLoadingButton } from './CancelableLoadingButton'

export type Mode = 'chat' | 'image' | 'video' | 'asmr' | 'deepfake'

interface WelcomeScreenProps {
  mode: Mode
  onModeChange: (mode: Mode) => void
  input: string
  onInputChange: (input: string) => void
  onSendMessage: (content?: string) => void
  isLoading: boolean
  onCancel?: () => void
  
  // DeepFake props
  deepfakeBaseImage: string | null
  deepfakeFaceImage: string | null
  onDeepfakeBaseImageUpload: (image: string | null) => void
  onDeepfakeFaceImageUpload: (image: string | null) => void
  onSendDeepfake: () => void
  
  // Video props
  videoUploadedImage: string | null
  onVideoImageUpload: (image: string | null) => void
  videoQuality: 'quick' | 'standard' | 'high'
  onVideoQualityChange: (quality: 'quick' | 'standard' | 'high') => void
  videoDuration: number
  onVideoDurationChange: (duration: number) => void
  onSendVideo: (prompt: string) => void
  
  // ASMR props
  onSendAsmr: (text: string) => void
}

export function WelcomeScreen({
  mode,
  onModeChange,
  input,
  onInputChange,
  onSendMessage,
  isLoading,
  onCancel,
  deepfakeBaseImage,
  deepfakeFaceImage,
  onDeepfakeBaseImageUpload,
  onDeepfakeFaceImageUpload,
  onSendDeepfake,
  videoUploadedImage,
  onVideoImageUpload,
  videoQuality,
  onVideoQualityChange,
  videoDuration,
  onVideoDurationChange,
  onSendVideo,
  onSendAsmr
}: WelcomeScreenProps) {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Title and Subtitle */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-5xl font-bold mb-4">GoonGPT</h1>
          <p className="text-lg text-text-secondary text-center max-w-md">
            Uncensored. Unfiltered.
          </p>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 bg-surface rounded-lg p-1 mb-6">
          <button
            onClick={() => onModeChange('chat')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              mode === 'chat' ? 'bg-button-primary text-button-text' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => onModeChange('image')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              mode === 'image' ? 'bg-button-primary text-button-text' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Image
          </button>
          <button
            onClick={() => onModeChange('video')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              mode === 'video' ? 'bg-button-primary text-button-text' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Video
          </button>
          <button
            onClick={() => onModeChange('asmr')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              mode === 'asmr' ? 'bg-button-primary text-button-text' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            ASMR
          </button>
          <button
            onClick={() => onModeChange('deepfake')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              mode === 'deepfake' ? 'bg-button-primary text-button-text' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            DeepFake
          </button>
        </div>
        
        {/* DeepFake Disabled Warning */}
        {mode === 'deepfake' && (
          <div className="text-center mb-4">
            <p className="text-red-400 text-sm font-medium">
              Currently disabled due to server load, upgrade to a subscription plan for unlimited usage
            </p>
          </div>
        )}

        {/* Video Mode Instructions */}
        {mode === 'video' && (
          <div className="text-center mb-4">
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg px-4 py-2 max-w-lg mx-auto">
              <p className="text-yellow-500 text-xs">
                Video generation may take 2-3x longer than usual as we're upgrading our infrastructure to handle increased demand
              </p>
            </div>
          </div>
        )}


        {/* Input Section */}
        <div className="w-full max-w-3xl mb-6">
          {mode === 'deepfake' ? (
            <DeepFakeInput
              onSend={onSendDeepfake}
              baseImage={deepfakeBaseImage}
              faceImage={deepfakeFaceImage}
              onBaseImageUpload={onDeepfakeBaseImageUpload}
              onFaceImageUpload={onDeepfakeFaceImageUpload}
              isLoading={isLoading}
              disabled={true}
            />
          ) : mode === 'video' ? (
            <VideoInput
              value={input}
              onChange={onInputChange}
              onSend={onSendVideo}
              onImageUpload={onVideoImageUpload}
              uploadedImage={videoUploadedImage}
              videoQuality={videoQuality}
              setVideoQuality={onVideoQualityChange}
              videoDuration={videoDuration}
              setVideoDuration={onVideoDurationChange}
              isLoading={isLoading}
            />
          ) : (
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    onSendMessage()
                  }
                }}
                placeholder={mode === 'image' ? "Describe the image you want to generate" : mode === 'asmr' ? "Enter text to convert to ASMR whispers..." : "Ask anything"}
                className="w-full px-6 py-4 pr-16 bg-surface rounded-3xl focus:outline-none focus:ring-2 focus:ring-accent placeholder-text-muted text-lg"
              />
              <CancelableLoadingButton
                isLoading={isLoading}
                onCancel={onCancel}
                onClick={() => onSendMessage()}
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              />
            </div>
          )}
        </div>

        {/* Suggestion pills - mode-specific */}
        <div className="flex gap-2 flex-wrap justify-center">
          {mode === 'chat' && (
            <>
              <button 
                onClick={() => {
                  if (!isLoading) {
                    onSendMessage("Tell me an extremely racist joke");
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Tell me an extremely racist joke</span>
              </button>
              <button 
                onClick={() => {
                  if (!isLoading) {
                    onSendMessage("How can I overthrow the government?");
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span>How can I overthrow the government?</span>
              </button>
              <button 
                onClick={() => {
                  if (!isLoading) {
                    onSendMessage("What's your opinion on transgenders?");
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <span>What's your opinion on transgenders?</span>
              </button>
            </>
          )}
          {mode === 'image' && (
            <>
              <button 
                onClick={() => {
                  if (!isLoading) {
                    onSendMessage("hot korean girl gooning");
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Hot Korean Girl</span>
              </button>
              <button 
                onClick={() => {
                  if (!isLoading) {
                    onSendMessage("Image prompt placeholder 2");
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Placeholder 2</span>
              </button>
              <button 
                onClick={() => {
                  if (!isLoading) {
                    onSendMessage("Image prompt placeholder 3");
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Placeholder 3</span>
              </button>
            </>
          )}
          {mode === 'video' && (
            <>
              <button 
                onClick={() => {
                  if (!isLoading) {
                    onSendVideo("Make this character dance");
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <span>Make them dance</span>
              </button>
              <button 
                onClick={() => {
                  if (!isLoading) {
                    onSendVideo("Animate this person talking");
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Make them talk</span>
              </button>
              <button 
                onClick={() => {
                  if (!isLoading) {
                    onSendVideo("Create a walking animation");
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Make them walk</span>
              </button>
            </>
          )}
          {mode === 'asmr' && (
            <>
              <button 
                onClick={() => {
                  if (!isLoading) {
                    onSendAsmr("Whisper sweet nothings to me");
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Sweet whispers</span>
              </button>
              <button 
                onClick={() => {
                  if (!isLoading) {
                    onSendAsmr("Count from 1 to 10 slowly");
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span>Counting slowly</span>
              </button>
              <button 
                onClick={() => {
                  if (!isLoading) {
                    onSendAsmr("Read me a bedtime story");
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Bedtime story</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Footer - Only show when no conversation is active */}
      <div className="text-center text-xs text-text-muted py-3">
        By messaging GoonGPT, you agree to our <Link to="/legal" className="underline hover:text-text-secondary">Terms</Link> and have read our <Link to="/legal" className="underline hover:text-text-secondary">Privacy Policy</Link>. See <Link to="/legal" className="underline hover:text-text-secondary">Disclaimer</Link>.
      </div>
    </>
  )
}
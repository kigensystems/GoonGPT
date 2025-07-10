interface ModeToggleProps {
  currentMode: 'chat' | 'image' | 'video' | 'deepfake'
  onModeChange: (mode: 'chat' | 'image' | 'video' | 'deepfake') => void
  className?: string
}

export function ModeToggle({ currentMode, onModeChange, className = "" }: ModeToggleProps) {
  return (
    <div className={`flex items-center gap-2 bg-surface rounded-lg p-1 ${className}`}>
      <button
        onClick={() => onModeChange('chat')}
        className={`px-4 py-2 text-sm rounded-md transition-colors ${
          currentMode === 'chat' ? 'bg-button-primary text-button-text' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        Chat
      </button>
      <button
        onClick={() => onModeChange('image')}
        className={`px-4 py-2 text-sm rounded-md transition-colors ${
          currentMode === 'image' ? 'bg-button-primary text-button-text' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        Image
      </button>
      <button
        onClick={() => onModeChange('video')}
        className={`px-4 py-2 text-sm rounded-md transition-colors ${
          currentMode === 'video' ? 'bg-button-primary text-button-text' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        Video
      </button>
      <button
        onClick={() => onModeChange('deepfake')}
        className={`px-4 py-2 text-sm rounded-md transition-colors ${
          currentMode === 'deepfake' ? 'bg-button-primary text-button-text' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        DeepFake
      </button>
    </div>
  )
}
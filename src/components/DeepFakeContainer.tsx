import { Message } from './ChatMessage'
import { UnifiedContainer } from './UnifiedContainer'

interface DeepFakeContainerProps {
  isActive: boolean
  initialMessages?: Message[]
  currentMode?: 'chat' | 'image' | 'video' | 'asmr' | 'deepfake'
  onModeChange?: (mode: 'chat' | 'image' | 'video' | 'asmr' | 'deepfake') => void
  onNavigateToLegal?: () => void
  baseImage: string | null
  faceImage: string | null
  onBaseImageUpload: (image: string | null) => void
  onFaceImageUpload: (image: string | null) => void
  onSend: () => void
  isLoading: boolean
}

export function DeepFakeContainer({ 
  initialMessages = [], 
  currentMode = 'deepfake', 
  onModeChange, 
  baseImage,
  faceImage,
  onBaseImageUpload,
  onFaceImageUpload,
  onSend,
  isLoading
}: DeepFakeContainerProps) {

  return (
    <UnifiedContainer
      mode={currentMode}
      messages={initialMessages}
      onModeChange={onModeChange}
      isLoading={isLoading}
      onSendDeepfake={onSend}
      deepfakeBaseImage={baseImage}
      deepfakeFaceImage={faceImage}
      onDeepfakeBaseImageUpload={onBaseImageUpload}
      onDeepfakeFaceImageUpload={onFaceImageUpload}
    />
  )
}
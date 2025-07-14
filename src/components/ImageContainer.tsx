import { Message } from './ChatMessage'
import { UnifiedContainer } from './UnifiedContainer'

interface ImageContainerProps {
  isActive?: boolean
  initialMessages?: Message[]
  onMessagesChange?: (messages: Message[]) => void
  currentMode?: 'chat' | 'image' | 'video' | 'asmr' | 'deepfake'
  onModeChange?: (mode: 'chat' | 'image' | 'video' | 'asmr' | 'deepfake') => void
  onNavigateToLegal?: () => void
  onSuggestionClick?: (suggestion: string) => void
}

export function ImageContainer({ 
  initialMessages = [], 
  currentMode = 'image', 
  onModeChange, 
  onSuggestionClick
}: ImageContainerProps) {

  const handleSendMessage = async (content: string) => {
    // Image-specific API integration logic would be handled here
    // This is a simplified version - the full logic would be extracted from App.tsx
    console.log('Image message:', content)
  }

  return (
    <UnifiedContainer
      mode={currentMode}
      messages={initialMessages}
      onModeChange={onModeChange}
      isLoading={false}
      onSendMessage={handleSendMessage}
      onSuggestionClick={onSuggestionClick}
    />
  )
}
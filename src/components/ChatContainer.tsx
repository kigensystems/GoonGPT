import { Message } from './ChatMessage'
import { UnifiedContainer } from './UnifiedContainer'

interface ChatContainerProps {
  isActive: boolean
  initialMessages?: Message[]
  onMessagesChange?: (messages: Message[]) => void
  currentMode?: 'chat' | 'image' | 'video' | 'asmr' | 'deepfake'
  onModeChange?: (mode: 'chat' | 'image' | 'video' | 'asmr' | 'deepfake') => void
  onNavigateToLegal?: () => void
  onSuggestionClick?: (suggestion: string) => void
}

export function ChatContainer({ initialMessages = [], currentMode = 'chat', onModeChange, onSuggestionClick }: ChatContainerProps) {

  const handleSendMessage = async (content: string) => {
    // Chat-specific API integration logic would be handled here
    // This is a simplified version - the full logic would be extracted from App.tsx
    console.log('Chat message:', content)
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


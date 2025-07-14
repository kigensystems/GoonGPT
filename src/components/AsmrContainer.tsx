import { Message } from './ChatMessage'
import { UnifiedContainer } from './UnifiedContainer'

interface AsmrContainerProps {
  isActive: boolean
  initialMessages?: Message[]
  currentMode?: 'chat' | 'image' | 'video' | 'asmr' | 'deepfake'
  onModeChange?: (mode: 'chat' | 'image' | 'video' | 'asmr' | 'deepfake') => void
  onNavigateToLegal?: () => void
  onSend: (text: string) => void
  isLoading: boolean
}

export function AsmrContainer({ 
  initialMessages = [], 
  currentMode = 'asmr', 
  onModeChange, 
  onSend,
  isLoading
}: AsmrContainerProps) {

  const handleSend = (text: string) => {
    // ASMR-specific logic would be handled here
    // This is a simplified version - the full logic would be extracted from App.tsx
    console.log('ASMR message:', text)
    onSend(text)
  }

  return (
    <UnifiedContainer
      mode={currentMode}
      messages={initialMessages}
      onModeChange={onModeChange}
      isLoading={isLoading}
      onSendAsmr={handleSend}
    />
  )
}
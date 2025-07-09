interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  imageUrl?: string
  videoUrl?: string
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
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
            {message.imageUrl && (
              <img 
                src={message.imageUrl} 
                alt="Generated image" 
                className="mt-4 rounded-lg max-w-md"
              />
            )}
            {message.videoUrl && (
              <video 
                src={message.videoUrl} 
                controls
                className="mt-4 rounded-lg max-w-md"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export type { Message }
import { RefObject } from 'react'
import { ChatMessage, Message } from './ChatMessage'
import { VideoMessage } from './VideoMessage'
import { AsmrMessage } from './AsmrMessage'

export type Mode = 'chat' | 'image' | 'video' | 'asmr' | 'deepfake'

interface MessageListProps {
  messages: Message[]
  mode: Mode
  isLoading: boolean
  messagesEndRef: RefObject<HTMLDivElement>
}

export function MessageList({ messages, mode, isLoading, messagesEndRef }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
      <div className="max-w-3xl mx-auto py-8 px-4">
        {messages.map((message) => (
          mode === 'video' ? (
            <VideoMessage key={message.id} message={message} />
          ) : mode === 'asmr' && message.audioUrl ? (
            <AsmrMessage key={message.id} message={message} />
          ) : (
            <ChatMessage key={message.id} message={message} />
          )
        ))}
        
        {/* Loading indicator */}
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
  )
}
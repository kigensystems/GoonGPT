import { Message } from './ChatMessage'

interface VideoMessageProps {
  message: Message
}

export function VideoMessage({ message }: VideoMessageProps) {
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
        <div className={`flex-1 max-w-2xl ${message.role === 'user' ? 'text-right' : ''}`}>
          <div className="font-semibold text-sm mb-1">
            {message.role === 'user' ? 'You' : 'GoonGPT'}
          </div>
          <div className="text-text-secondary">
            {message.content}
            {message.videoUrl && (
              <div className="mt-4">
                <video 
                  src={message.videoUrl} 
                  controls
                  className="rounded-lg max-w-full max-h-96 shadow-lg"
                  poster="" // You could add a poster image here
                >
                  Your browser does not support the video tag.
                </video>
                <div className="mt-2 text-xs text-text-muted">
                  <span>Video generated successfully</span>
                  <span className="mx-2">•</span>
                  <a 
                    href={message.videoUrl} 
                    download 
                    className="text-accent hover:text-accent/80"
                  >
                    Download
                  </a>
                </div>
              </div>
            )}
            {message.imageUrl && (
              <div className="mt-4">
                <img 
                  src={message.imageUrl} 
                  alt="Video preview or uploaded image" 
                  className="rounded-lg max-w-md shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
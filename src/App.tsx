import { useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages([...messages, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate API response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm GoonGPT, your uncensored AI assistant. Unlike ChatGPT, I have no content filters or restrictions. I can help with any topic without censorship. This is a demo response - connect me to a real API to unlock my full potential!",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-screen bg-bg-main text-text-primary">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <button className="text-xl font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity">
            GoonGPT
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm bg-button-primary text-button-text rounded-lg hover:opacity-90 transition-opacity font-medium">
            Log in
          </button>
          <button className="px-4 py-2 text-sm bg-button-primary text-button-text rounded-lg hover:opacity-90 transition-opacity font-medium">
            Sign up for free
          </button>
          <button className="p-2 hover:bg-surface rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            {/* Title */}
            <h1 className="text-3xl font-normal mb-8">What can I help with?</h1>
            
            {/* Chat Input */}
            <div className="w-full max-w-3xl mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Ask anything"
                  className="w-full px-4 py-8 pl-20 pr-16 bg-surface rounded-3xl focus:outline-none focus:ring-2 focus:ring-accent placeholder-text-muted text-lg"
                />
                
                {/* Left side buttons */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button className="px-3 py-1.5 text-sm bg-surface-hover rounded-full hover:bg-border transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span>Attach</span>
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-surface-hover rounded-full hover:bg-border transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search</span>
                  </button>
                </div>

                {/* Right side voice button */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <button className="px-3 py-1.5 text-sm bg-surface-hover rounded-full hover:bg-border transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>Voice</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Suggestion pills with icons */}
            <div className="flex gap-2 flex-wrap justify-center">
              <button 
                onClick={() => setInput("Help me write something")}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Help me write</span>
              </button>
              <button 
                onClick={() => setInput("Analyze this data")}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analyze data</span>
              </button>
              <button 
                onClick={() => setInput("Write code for me")}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>Code</span>
              </button>
              <button 
                onClick={() => setInput("Summarize this text")}
                className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Summarize text</span>
              </button>
              <button className="px-4 py-2 text-sm text-text-muted hover:text-text-secondary transition-colors">
                More
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto py-8 px-4">
              {messages.map((message) => (
                <div key={message.id} className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
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
                    <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className="font-semibold text-sm mb-1">
                        {message.role === 'user' ? 'You' : 'GoonGPT'}
                      </div>
                      <div className="text-text-secondary">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
            </div>
          </div>
        )}

        {/* Input Area for active chats */}
        {messages.length > 0 && (
          <div className="border-t border-border">
            <div className="max-w-3xl mx-auto p-4">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Ask anything"
                  className="w-full px-4 py-8 pl-20 pr-16 bg-surface rounded-3xl focus:outline-none focus:ring-2 focus:ring-accent placeholder-text-muted text-lg"
                />
                
                {/* Left side buttons */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button className="px-3 py-1.5 text-sm bg-surface-hover rounded-full hover:bg-border transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span>Attach</span>
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-surface-hover rounded-full hover:bg-border transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search</span>
                  </button>
                </div>

                {/* Right side voice button */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <button className="px-3 py-1.5 text-sm bg-surface-hover rounded-full hover:bg-border transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>Voice</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center text-xs text-text-muted py-3">
          By messaging GoonGPT, you agree to our <a href="#" className="underline hover:text-text-secondary">Terms</a> and have read our <a href="#" className="underline hover:text-text-secondary">Privacy Policy</a>. See <a href="#" className="underline hover:text-text-secondary">Cookie Preferences</a>.
        </div>
      </main>
    </div>
  )
}

export default App
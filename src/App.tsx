import { useState } from 'react'
import { imageClient } from './utils/imageClient'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  imageUrl?: string
}

type Mode = 'chat' | 'image'

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<Mode>('chat')

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

    if (mode === 'image') {
      try {
        const result = await imageClient.generateImage(
          input,
          512,
          512,
          {
            negative_prompt: 'low quality, blurry',
            samples: 1,
            safety_checker: false,
            enhance_prompt: true
          }
        )

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Here is your generated image:',
          imageUrl: result.images?.[0] || result.imageUrl,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, there was an error generating the image. Please try again.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } else {
      // Simulate chat response
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
    
    if (mode === 'image') {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-bg-main text-text-primary">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <img 
            src="/GoonGPT.svg" 
            alt="GoonGPT Logo" 
            className="h-12 w-auto"
          />
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
            {/* Title and Subtitle */}
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-5xl font-bold mb-4">GoonGPT</h1>
              <p className="text-lg text-text-secondary text-center max-w-md">
                Uncensored. Unfiltered. Entirely for free.
              </p>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-surface rounded-lg p-1 mb-6">
              <button
                onClick={() => setMode('chat')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  mode === 'chat' ? 'bg-button-primary text-button-text' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setMode('image')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  mode === 'image' ? 'bg-button-primary text-button-text' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Image
              </button>
            </div>
            
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
                  placeholder={mode === 'image' ? "Describe the image you want to generate" : "Ask anything"}
                  className="w-full px-6 py-4 bg-surface rounded-3xl focus:outline-none focus:ring-2 focus:ring-accent placeholder-text-muted text-lg"
                />
              </div>
            </div>

            {/* Suggestion pills with icons */}
            <div className="flex gap-2 flex-wrap justify-center">
              {mode === 'chat' ? (
                <>
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
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setInput("Create a futuristic cyberpunk cityscape")}
                    className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span>Cyberpunk City</span>
                  </button>
                  <button 
                    onClick={() => setInput("Generate a fantasy landscape with dragons")}
                    className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span>Fantasy Art</span>
                  </button>
                  <button 
                    onClick={() => setInput("Portrait of a mysterious character")}
                    className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Character Portrait</span>
                  </button>
                  <button 
                    onClick={() => setInput("Abstract art with vibrant colors")}
                    className="px-4 py-2 text-sm border border-border rounded-full hover:bg-surface transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span>Abstract Art</span>
                  </button>
                </>
              )}
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
                        {message.imageUrl && (
                          <img 
                            src={message.imageUrl} 
                            alt="Generated image" 
                            className="mt-4 rounded-lg max-w-md"
                          />
                        )}
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
              {/* Mode Toggle for active chat */}
              <div className="flex items-center gap-2 bg-surface rounded-lg p-1 mb-4 w-fit">
                <button
                  onClick={() => setMode('chat')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    mode === 'chat' ? 'bg-button-primary text-button-text' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setMode('image')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    mode === 'image' ? 'bg-button-primary text-button-text' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Image
                </button>
              </div>
              
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
                  placeholder={mode === 'image' ? "Describe the image you want to generate" : "Ask anything"}
                  className="w-full px-6 py-4 bg-surface rounded-3xl focus:outline-none focus:ring-2 focus:ring-accent placeholder-text-muted text-lg"
                />
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
import React, { useState, useRef, useEffect } from 'react'
import { useChat } from './hooks/useChat'
import { ChatInterface } from './components/ChatInterface'
import { ImageGenerator } from './components/ImageGenerator'
import { DocumentAnalyzer } from './components/DocumentAnalyzer'

function App() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'document'>('chat');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      await sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-bg-default overflow-hidden">
      {/* Background with enhanced rough gradient effect */}
      <div className="fixed inset-0 bg-bg-default overflow-hidden z-0">
        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-gradient-to-br from-pink-500/30 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-gradient-to-br from-purple-600/25 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-3xl"></div>
        
        {/* Moving gradient mesh */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/20 via-transparent to-purple-600/20"></div>
        </div>
        
        {/* Heavy grain texture - multiple layers */}
        <div 
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='roughNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch' seed='7'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23roughNoise)' opacity='0.8'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '80px 80px'
          }}
        ></div>
        
        {/* Film grain layer */}
        <div 
          className="absolute inset-0 opacity-25 mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='filmGrain'%3E%3CfeTurbulence baseFrequency='2.5' numOctaves='4' seed='12' type='fractalNoise'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23filmGrain)' opacity='0.6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px'
          }}
        ></div>
        
        {/* Paper texture layer */}
        <div 
          className="absolute inset-0 opacity-15 mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='150' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperTexture'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' result='noise' seed='3'/%3E%3CfeDiffuseLighting in='noise' lighting-color='white' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperTexture)' fill='%23ffffff'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '150px 150px'
          }}
        ></div>
        
        {/* Animated noise layer */}
        <div 
          className="absolute inset-0 opacity-10 mix-blend-screen animate-grain"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='movingGrain'%3E%3CfeTurbulence baseFrequency='3.0' numOctaves='3' seed='9' type='fractalNoise'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23movingGrain)' opacity='0.8'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '400px 400px'
          }}
        ></div>
        
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex justify-between items-center px-8 py-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-surface border border-surface rounded-lg flex items-center justify-center transition-all duration-150 ease-in-out hover:border-accent/30 group cursor-pointer">
            <span className="text-accent font-mono font-bold text-lg drop-shadow-[0_0_4px_rgba(255,45,149,0.5)] group-hover:drop-shadow-[0_0_6px_rgba(255,45,149,0.7)] transition-all duration-150">&gt;_</span>
          </div>
          <span className="text-text-primary font-mono font-semibold text-xl hover:text-accent transition-colors duration-150 ease-in-out cursor-pointer">
            XposedAI
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`text-sm font-mono transition-colors duration-150 ${activeTab === 'chat' ? 'text-accent' : 'text-muted hover:text-text-primary'}`}
          >
            CHAT
          </button>
          <button 
            onClick={() => setActiveTab('image')}
            className={`text-sm font-mono transition-colors duration-150 ${activeTab === 'image' ? 'text-accent' : 'text-muted hover:text-text-primary'}`}
          >
            IMAGE
          </button>
          <button 
            onClick={() => setActiveTab('document')}
            className={`text-sm font-mono transition-colors duration-150 ${activeTab === 'document' ? 'text-accent' : 'text-muted hover:text-text-primary'}`}
          >
            DOCUMENT
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-20 flex flex-col items-center min-h-[90vh] px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-accent font-code text-sm mb-4 opacity-60 drop-shadow-[0_0_4px_rgba(255,45,149,0.3)]">
            &lt;{activeTab.toUpperCase()}.MODE&gt;
          </div>
          <h1 className="text-4xl md:text-6xl font-mono font-bold mb-4 leading-tight">
            <span className="text-text-primary">UNCENSORED</span>
            <span className="text-transparent bg-gradient-to-r from-accent via-pink-300 to-accent bg-clip-text animate-gradient bg-[length:200%_auto] drop-shadow-[0_0_4px_rgba(255,45,149,0.3)]"> AI</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto font-sans">
            {activeTab === 'chat' && 'Experience AI without limits. Ask anything, explore everything.'}
            {activeTab === 'image' && 'Generate any image you can imagine. No restrictions, no censorship.'}
            {activeTab === 'document' && 'Analyze documents with uncensored AI intelligence.'}
          </p>
        </div>

        {/* Dynamic Content Based on Active Tab */}
        <div className="w-full max-w-4xl flex-1 flex flex-col">
          {activeTab === 'chat' && (
            <ChatInterface
              messages={messages}
              inputValue={inputValue}
              setInputValue={setInputValue}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
              messagesEndRef={messagesEndRef}
            />
          )}

          {activeTab === 'image' && <ImageGenerator />}
          
          {activeTab === 'document' && <DocumentAnalyzer />}

          {/* Error Display */}
          {error && activeTab === 'chat' && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 font-mono text-sm">ERROR: {error}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
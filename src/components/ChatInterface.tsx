import React from 'react';
import { ChatMessage } from '../utils/replicateClient';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoading: boolean;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatInterface({
  messages,
  inputValue,
  setInputValue,
  isLoading,
  onSendMessage,
  onKeyPress,
  messagesEndRef,
}: ChatInterfaceProps) {
  return (
    <>
      {/* Chat Container */}
      <div className="bg-surface rounded-2xl border border-surface shadow-2xl flex-1 flex flex-col overflow-hidden max-h-[600px] transition-all duration-150 ease-in-out hover:border-accent/20">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="text-muted font-mono text-sm">xposed@ai ~ chat</span>
          </div>
          <div className="text-accent font-code text-xs opacity-60">LIVE</div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'justify-end' : ''
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-accent font-mono font-bold text-sm">AI</span>
                </div>
              )}
              <div className={`flex-1 ${message.role === 'user' ? 'max-w-md' : ''}`}>
                <div
                  className={`rounded-lg p-4 border ${
                    message.role === 'user'
                      ? 'bg-accent/10 border-accent/30'
                      : 'bg-bg-default border-accent/20'
                  }`}
                >
                  <p className={`text-text-primary font-sans ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}>
                    {message.content || (isLoading && index === messages.length - 1 ? (
                      <span className="inline-flex items-center">
                        <span className="animate-pulse">Thinking</span>
                        <span className="ml-1 animate-pulse">...</span>
                      </span>
                    ) : '')}
                  </p>
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center flex-shrink-0 border border-accent/30">
                  <span className="text-accent font-mono font-bold text-sm">U</span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-surface">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={onKeyPress}
                placeholder="Ask me anything... (no filters, no limits)"
                className="w-full bg-bg-default border border-accent/30 rounded-lg px-4 py-3 text-text-primary placeholder-muted font-sans focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all duration-150"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={onSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-accent text-bg-default font-mono font-semibold rounded-lg hover:bg-accent/90 transition-all duration-150 ease-in-out transform hover:-translate-y-0.5 hover:drop-shadow-[0_0_8px_rgba(255,45,149,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? '...' : '> SEND'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {['Write a story', 'Explain quantum physics', 'Code a game', 'Controversial topics'].map((prompt) => (
          <button
            key={prompt}
            onClick={() => setInputValue(prompt)}
            className="px-4 py-2 bg-surface border border-accent/20 text-text-primary font-mono text-sm rounded-lg hover:border-accent/50 hover:bg-accent/5 transition-all duration-150"
          >
            {prompt}
          </button>
        ))}
      </div>
    </>
  );
}
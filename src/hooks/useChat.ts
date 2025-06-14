import { useState, useCallback } from 'react';
import { veniceClient, ChatMessage } from '../utils/veniceClient';

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Welcome to XposedAI! I'm an uncensored AI assistant. Ask me anything - there are no filters or restrictions here. What would you like to explore?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Add a temporary "thinking" message
      const tempAssistantMessage: ChatMessage = { 
        role: 'assistant', 
        content: '' 
      };
      setMessages((prev) => [...prev, tempAssistantMessage]);

      // Stream the response
      let fullResponse = '';
      await veniceClient.streamChatMessage(
        [...messages, userMessage],
        (chunk) => {
          fullResponse += chunk;
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: fullResponse,
            };
            return newMessages;
          });
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the temporary message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared. I'm ready for a fresh conversation. What would you like to discuss?",
      },
    ]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
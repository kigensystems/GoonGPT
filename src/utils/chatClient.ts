// ModelsLab Chat API Client for GoonGPT
// All API calls go through Netlify Functions for security and CORS handling

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  success: boolean;
  choices: Array<{
    message: ChatMessage;
    index: number;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export class ChatClient {
  private baseUrl: string;
  
  constructor() {
    // Use Netlify dev server URL in development, relative path in production
    this.baseUrl = (import.meta as any).env?.DEV ? 'http://localhost:8888' : '';
  }

  // Chat completion using ModelsLab API
  async sendMessage(
    messages: ChatMessage[],
    options: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<ChatCompletionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/.netlify/functions/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages,
          model: options.model || 'ModelsLab/Llama-3.1-8b-Uncensored-Dare',
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 2048,
          stream: options.stream || false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.details || 'Chat completion failed');
      }
    } catch (error) {
      console.error('Error in chat completion:', error);
      throw error;
    }
  }

  // Convenience method for simple single message
  async chat(message: string, systemPrompt?: string): Promise<string> {
    const messages: ChatMessage[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: message });
    
    const response = await this.sendMessage(messages);
    return response.choices[0].message.content;
  }
}

export const chatClient = new ChatClient();
export type { ChatMessage, ChatCompletionResponse };
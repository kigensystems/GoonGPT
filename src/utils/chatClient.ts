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
    // For local dev, use production API unless VITE_USE_LOCAL_FUNCTIONS is set
    if ((import.meta as any).env?.DEV && (import.meta as any).env?.VITE_USE_LOCAL_FUNCTIONS) {
      this.baseUrl = 'http://localhost:8888';
    } else if ((import.meta as any).env?.DEV) {
      // In dev mode without local functions, use production API
      this.baseUrl = 'https://goongpt.pro';
    } else {
      // Production mode
      this.baseUrl = '';
    }
  }

  // Chat completion using ModelsLab API
  async sendMessage(
    messages: ChatMessage[],
    options: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
      wallet_address?: string;
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
          max_tokens: options.max_tokens || 1000,
          stream: options.stream || false,
          wallet_address: options.wallet_address
        }),
      });


      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // Handle non-JSON responses (like 504 Gateway Timeout)
          console.error('[ChatClient] Failed to parse error response:', e);
          errorData = { 
            error: `HTTP error! status: ${response.status}`,
            timestamp: new Date().toISOString()
          };
        }
        
        console.error('[ChatClient] Error response:', errorData);
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const rateLimitUser = response.headers.get('X-RateLimit-User');
          const remaining = errorData.remaining || 0;
          const limit = errorData.limit || 'unknown';
          
          let message = errorData.error || 'Too many requests';
          if (retryAfter) {
            message += ` Please wait ${retryAfter} seconds before trying again.`;
          }
          if (rateLimitUser) {
            message += ` (Limit: ${limit} requests per minute)`;
          }
          
          const error = new Error(message);
          (error as any).rateLimited = true;
          (error as any).retryAfter = retryAfter;
          (error as any).remaining = remaining;
          (error as any).limit = limit;
          throw error;
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.details || 'Chat completion failed');
      }
    } catch (error) {
      console.error('[ChatClient] Error:', {
        error: error,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      throw error;
    }
  }

  // Convenience method for simple single message
  async chat(message: string, systemPrompt?: string, walletAddress?: string): Promise<string> {
    const messages: ChatMessage[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: message });
    
    const response = await this.sendMessage(messages, { wallet_address: walletAddress });
    return response.choices[0].message.content;
  }
}

export const chatClient = new ChatClient();
export type { ChatMessage, ChatCompletionResponse };
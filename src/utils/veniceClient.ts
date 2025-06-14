// Venice.AI API Client
// Note: In production, these calls should go through Netlify Functions to hide API keys

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  id: string;
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
  }>;
}

interface ImageGenerationResponse {
  data: Array<{
    url: string;
  }>;
}

interface DocumentAnalysisResponse {
  content: string;
  metadata?: any;
}

class VeniceClient {
  private baseURL: string;

  constructor() {
    // In production, this should point to your Netlify Functions
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';
  }

  // Chat completion
  async sendChatMessage(messages: ChatMessage[]): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  }

  // Image generation
  async generateImage(prompt: string, size: string = '1024x1024'): Promise<ImageGenerationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/image-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, size, n: 1 }),
      });

      if (!response.ok) {
        throw new Error(`Image API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  }

  // Document analysis
  async analyzeDocument(file: File, question: string): Promise<DocumentAnalysisResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('question', question);

      const response = await fetch(`${this.baseURL}/document-analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Document API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Document analysis error:', error);
      throw error;
    }
  }

  // Stream chat response (simulated for Netlify Functions)
  async streamChatMessage(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      // For now, we'll use the non-streaming endpoint and simulate streaming
      const response = await this.sendChatMessage(messages);
      
      if (response.choices && response.choices[0]) {
        const fullContent = response.choices[0].message.content;
        
        // Simulate streaming by chunking the response
        const words = fullContent.split(' ');
        for (let i = 0; i < words.length; i++) {
          onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
      throw error;
    }
  }
}

export const veniceClient = new VeniceClient();
export type { ChatMessage, ChatResponse, ImageGenerationResponse, DocumentAnalysisResponse };
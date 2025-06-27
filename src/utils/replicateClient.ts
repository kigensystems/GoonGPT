// Replicate API Client for XposedAI
// All API calls go through Netlify Functions for security and CORS handling

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  choices: Array<{
    message: ChatMessage;
  }>;
}

interface ImageGenerationResponse {
  success: boolean;
  imageUrl: string;
  prompt: string;
}

interface DocumentAnalysisResponse {
  content: string;
  metadata?: any;
}

export class ReplicateClient {
  private baseUrl: string;
  
  constructor() {
    // Use Netlify dev server URL in development, relative path in production
    this.baseUrl = (import.meta as any).env?.DEV ? 'http://localhost:8888' : '';
  }

  // Chat completion using Dolphin uncensored model
  async sendMessage(messages: { role: string; content: string }[]): Promise<any> {
    try {
      // Always use Netlify function for consistent behavior
      const response = await fetch(`${this.baseUrl}/.netlify/functions/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Image generation using ModelsLab API
  async generateImage(
    prompt: string, 
    width: number = 1024, 
    height: number = 1024,
    options: {
      negative_prompt?: string;
      samples?: number;
      safety_checker?: boolean;
      seed?: number;
      enhance_prompt?: boolean;
      enhance_style?: string;
    } = {}
  ): Promise<any> {
    try {
      // Always use Netlify function for consistent behavior
      const response = await fetch(`${this.baseUrl}/.netlify/functions/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt, 
          width, 
          height,
          ...options
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // ModelsLab API provides instant responses, no polling needed
      if (result.success) {
        return result;
      } else if (result.status === 'processing') {
        // Handle rare cases where processing might be required
        throw new Error(`Image is still processing. ETA: ${result.eta || 'unknown'} seconds`);
      } else {
        throw new Error(result.details || 'Image generation failed');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }


  // Document analysis using Netlify function (placeholder for future implementation)
  async analyzeDocument(_file: File): Promise<any> {
    // TODO: Implement document analysis with Replicate models
    throw new Error('Document analysis not yet implemented');
  }

  // Legacy compatibility methods
  async sendChatMessage(messages: ChatMessage[]): Promise<ChatResponse> {
    const result = await this.sendMessage(messages);
    return result;
  }

  async generateImageLegacy(prompt: string, size: string = '1024x1024'): Promise<{ data: Array<{ url: string }> }> {
    const [width, height] = size.split('x').map(s => parseInt(s) || 1024);
    const result = await this.generateImage(prompt, width, height);
    
    return {
      data: [{
        url: result.imageUrl
      }]
    };
  }
}

export const replicateClient = new ReplicateClient();
export type { ChatMessage, ChatResponse, ImageGenerationResponse, DocumentAnalysisResponse };
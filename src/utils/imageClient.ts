// ModelsLab API Client for GoonGPT
// All API calls go through Netlify Functions for security and CORS handling

interface ImageGenerationResponse {
  success: boolean;
  imageUrl: string;
  images: string[];
  prompt: string;
  meta: any;
}

export class ImageClient {
  private baseUrl: string;
  
  constructor() {
    // Use Netlify dev server URL in development, relative path in production
    this.baseUrl = (import.meta as any).env?.DEV ? 'http://localhost:8888' : '';
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
      wallet_address?: string;
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

}

export const imageClient = new ImageClient();
export type { ImageGenerationResponse };
// ModelsLab API Client for GoonGPT
// All API calls go through Netlify Functions for security and CORS handling

interface ImageGenerationResponse {
  success: boolean;
  imageUrl: string;
  images: string[];
  prompt: string;
  meta: any;
}

interface ProcessingResponse {
  status: 'processing';
  eta: number;
  request_id: string;
  message: string;
}

export class ImageClient {
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
    
    console.log('ImageClient using baseUrl:', this.baseUrl || 'relative (production)');
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
        })
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
      console.log('Image generation response:', result);
      
      // Handle immediate success
      if (result.success) {
        console.log('Image generated successfully:', result.imageUrl);
        return result;
      } 
      
      // Handle processing status - return it so caller can poll
      if (result.status === 'processing') {
        console.log('Image is processing, request_id:', result.request_id, 'ETA:', result.eta);
        return result as ProcessingResponse;
      }
      
      // Handle errors
      throw new Error(result.details || result.error || 'Image generation failed');
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  // Fetch a previously generated image by request ID
  async fetchImage(requestId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/.netlify/functions/image-fetch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          request_id: requestId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Still processing
      if (result.status === 'processing') {
        return result;
      }
      
      // Success
      if (result.success || result.status === 'success') {
        return {
          success: true,
          imageUrl: result.imageUrl,
          images: result.images || [result.imageUrl]
        };
      }
      
      // Error
      throw new Error(result.error || 'Failed to fetch image');
    } catch (error) {
      console.error('Error fetching image:', error);
      throw error;
    }
  }

  // Helper method to poll for image completion
  async pollForImage(
    requestId: string, 
    maxAttempts: number = 30,
    delayMs: number = 2000
  ): Promise<ImageGenerationResponse> {
    console.log(`Starting to poll for image, request_id: ${requestId}`);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`Polling attempt ${attempt + 1}/${maxAttempts}`);
        const result = await this.fetchImage(requestId);
        
        if (result.success) {
          console.log('Image ready after', attempt + 1, 'attempts');
          return result;
        }
        
        // Still processing, wait and try again
        if (result.status === 'processing') {
          console.log(`Still processing, waiting ${delayMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        // Some other status, throw error
        throw new Error('Unexpected status: ' + result.status);
      } catch (error) {
        console.error(`Poll attempt ${attempt + 1} failed:`, error);
        // On last attempt, throw the error
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        // Otherwise, wait and retry
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    throw new Error('Image generation timed out after ' + (maxAttempts * delayMs / 1000) + ' seconds');
  }

}

export const imageClient = new ImageClient();
export type { ImageGenerationResponse };
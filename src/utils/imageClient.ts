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
    
    // ImageClient using baseUrl
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
      style?: 'anime' | 'realism';
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
      // Image generation response received
      
      // Handle immediate success
      if (result.success) {
        // Image generated successfully
        return result;
      } 
      
      // Handle processing status - return it so caller can poll
      if (result.status === 'processing') {
        // Image is processing
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
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // Handle non-JSON responses (like 504 Gateway Timeout)
          if (response.status === 504) {
            // Return processing status for 504 errors
            return {
              status: 'processing',
              message: 'Service is busy, continuing to process'
            } as any;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
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
    delayMs: number = 2000,
    remainingEta: number = 0
  ): Promise<ImageGenerationResponse> {
    // Starting to poll for image
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Polling attempt
        const result = await this.fetchImage(requestId);
        
        // Reset error counter on successful response
        consecutiveErrors = 0;
        
        if (result.success) {
          // Image ready
          return result;
        }
        
        // Still processing, wait and try again
        if (result.status === 'processing') {
          // Adaptive delay based on remaining time
          let currentDelay = delayMs;
          if (remainingEta > 30) {
            currentDelay = 10000; // 10 seconds if lots of time left
          } else if (remainingEta > 15) {
            currentDelay = 5000; // 5 seconds if moderate time left
          } else {
            currentDelay = 2000; // 2 seconds when close to ready
          }
          
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          if (remainingEta > 0) remainingEta -= currentDelay / 1000;
          continue;
        }
        
        // Some other status, throw error
        throw new Error('Unexpected status: ' + result.status);
      } catch (error: any) {
        // Handle 504 Gateway Timeout specifically
        if (error.message?.includes('504') || error.message?.includes('Gateway Timeout')) {
          console.error('Gateway timeout during polling, will retry...');
          consecutiveErrors++;
          
          // If too many consecutive timeouts, fail
          if (consecutiveErrors >= maxConsecutiveErrors) {
            throw new Error('Multiple gateway timeouts. The service may be overloaded. Please try again later.');
          }
          
          // Wait longer after timeout
          await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second wait after timeout
          continue;
        }
        
        // Other errors
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    throw new Error('Image generation timed out after ' + (maxAttempts * delayMs / 1000) + ' seconds');
  }

}

export const imageClient = new ImageClient();
export type { ImageGenerationResponse };
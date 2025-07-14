// ModelsLab API Client for Video Generation
// All API calls go through Netlify Functions for security and CORS handling

interface VideoGenerationResponse {
  success: boolean;
  videoUrl: string;
  prompt: string;
  meta: any;
}

export class VideoClient {
  private baseUrl: string;
  private abortController: AbortController | null = null;
  
  constructor() {
    // Use Netlify dev server URL in development, relative path in production
    this.baseUrl = (import.meta as any).env?.DEV ? 'http://localhost:8888' : '';
  }
  
  // Cancel ongoing video generation
  cancel() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // Video generation using ModelsLab img2video_ultra API (NSFW-enabled)
  async generateVideo(
    initImage: string,
    prompt: string,
    options: {
      negative_prompt?: string;
      num_frames?: string;
      fps?: string;
      output_type?: string;
      wallet_address?: string;
    } = {}
  ): Promise<any> {
    try {
      // Cancel any ongoing request
      this.cancel();
      
      // Create new AbortController for this request
      this.abortController = new AbortController();
      
      // Always use Netlify function for consistent behavior
      const response = await fetch(`${this.baseUrl}/.netlify/functions/video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          init_image: initImage,
          prompt,
          output_type: options.output_type || 'mp4',
          negative_prompt: options.negative_prompt || 'blurry, low quality, distorted, extra limbs, missing limbs, broken fingers, deformed, glitch, artifacts, unrealistic, low resolution, bad anatomy, duplicate, cropped, watermark, text, logo, jpeg artifacts, noisy, oversaturated, underexposed, overexposed, flicker, unstable motion, motion blur, stretched, mutated, out of frame, bad proportions',
          num_frames: options.num_frames || '81',
          fps: options.fps || '16',
          wallet_address: options.wallet_address
        }),
        signal: this.abortController.signal
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
            message += ` (Limit: ${limit} requests per time window)`;
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
      console.log('Video client received:', result);
      
      // Check if video is processing and needs status checking
      if (result.status === 'processing') {
        // Use webhook-based status checking if track_id is available
        if (result.track_id) {
          return await this.checkVideoStatus(result.track_id);
        }
        // Fallback to polling if no track_id (for backward compatibility)
        else if (result.fetchUrl) {
          return await this.pollForVideo(result.fetchUrl);
        }
      }
      
      // Return completed video
      if (result.success && result.videoUrl) {
        return result;
      } else {
        throw new Error(result.details || 'Video generation failed');
      }
    } catch (error) {
      // Handle abort specifically
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Video generation cancelled by user');
        throw new Error('Video generation cancelled');
      }
      console.error('Error generating video:', error);
      throw error;
    } finally {
      // Clean up abort controller
      if (this.abortController) {
        this.abortController = null;
      }
    }
  }

  // Check video status using webhook-based tracking
  private async checkVideoStatus(trackId: string): Promise<any> {
    const maxAttempts = 60; // Max 10 minutes of checking
    const minInterval = 2000; // Min 2 seconds
    const maxInterval = 15000; // Max 15 seconds
    let currentInterval = minInterval;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`Checking video status (attempt ${attempt + 1}/${maxAttempts})...`);
        
        const response = await fetch(`${this.baseUrl}/.netlify/functions/video-status?track_id=${trackId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: this.abortController?.signal
        });

        if (!response.ok) {
          const errorData = await response.json();
          // If status not found, it might be too early or expired
          if (response.status === 404) {
            console.warn('Status not found, might be too early or expired');
          } else {
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
        } else {
          const result = await response.json();
          console.log('Status check result:', result);

          // Video completed successfully
          if (result.status === 'success' && result.videoUrl) {
            return {
              success: true,
              videoUrl: result.videoUrl,
              prompt: '',
              meta: { webhook_received: result.webhook_received }
            };
          }

          // Video failed
          if (result.status === 'error') {
            throw new Error(result.error || 'Video generation failed');
          }

          // If we have a fetchUrl as fallback and webhook hasn't been received after 30 seconds
          if (result.fetchUrl && !result.webhook_received && result.elapsed_seconds > 30) {
            console.log('Webhook not received after 30 seconds, falling back to polling');
            return await this.pollForVideo(result.fetchUrl);
          }
        }

        // Exponential backoff with jitter
        currentInterval = Math.min(currentInterval * 1.5 + Math.random() * 1000, maxInterval);
        
        // Wait before next attempt
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, currentInterval));
        }
      } catch (error) {
        console.error('Error checking video status:', error);
        if (attempt === maxAttempts - 1) {
          throw error;
        }
      }
    }

    throw new Error('Video generation timed out after 10 minutes');
  }

  // Poll for video completion (fallback method)
  private async pollForVideo(fetchUrl: string): Promise<any> {
    const maxAttempts = 30; // Max 5 minutes of polling
    const pollInterval = 10000; // Poll every 10 seconds
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`Polling for video (attempt ${attempt + 1}/${maxAttempts})...`);
        
        const response = await fetch(`${this.baseUrl}/.netlify/functions/video-fetch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            fetch_url: fetchUrl
          }),
          signal: this.abortController?.signal
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Poll result:', result);

        if (result.status === 'completed' && result.videoUrl) {
          return {
            success: true,
            videoUrl: result.videoUrl,
            prompt: '',
            meta: result.meta
          };
        }

        // Wait before next attempt
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      } catch (error) {
        console.error('Error polling for video:', error);
        if (attempt === maxAttempts - 1) {
          throw error;
        }
      }
    }

    throw new Error('Video generation timed out after 5 minutes');
  }
}

export const videoClient = new VideoClient();
export type { VideoGenerationResponse };
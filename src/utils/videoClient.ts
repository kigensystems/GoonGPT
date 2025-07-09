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
  
  constructor() {
    // Use Netlify dev server URL in development, relative path in production
    this.baseUrl = (import.meta as any).env?.DEV ? 'http://localhost:8888' : '';
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
    } = {}
  ): Promise<any> {
    try {
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
          fps: options.fps || '16'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Video client received:', result);
      
      // Check if video is processing and needs polling
      if (result.status === 'processing' && result.fetchUrl) {
        // Poll for video completion
        return await this.pollForVideo(result.fetchUrl, result.eta || 60);
      }
      
      // Return completed video
      if (result.success && result.videoUrl) {
        return result;
      } else {
        throw new Error(result.details || 'Video generation failed');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      throw error;
    }
  }

  // Poll for video completion
  private async pollForVideo(fetchUrl: string, initialEta: number): Promise<any> {
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
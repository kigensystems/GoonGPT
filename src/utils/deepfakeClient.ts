// ModelsLab API Client for DeepFake Generation
// All API calls go through Netlify Functions for security and CORS handling

interface DeepFakeResponse {
  success: boolean;
  imageUrl?: string;
  status?: string;
  fetchUrl?: string;
  eta?: number;
  message?: string;
  meta?: any;
}

export class DeepFakeClient {
  private baseUrl: string;
  
  constructor() {
    // Use Netlify dev server URL in development, relative path in production
    this.baseUrl = (import.meta as any).env?.DEV ? 'http://localhost:8888' : '';
  }

  // Single Face Swap using ModelsLab DeepFake API (simplified two-image approach)
  async singleFaceSwap(
    baseImage: string,
    faceImage: string,
    options: {
      watermark?: boolean;
    } = {}
  ): Promise<DeepFakeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/.netlify/functions/deepfake-swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          base_image: baseImage,
          face_image: faceImage,
          watermark: options.watermark !== false // Default to true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('DeepFake client received:', result);
      
      // Check if processing is needed
      if (result.status === 'processing' && result.fetchUrl) {
        // Poll for completion
        return await this.pollForDeepFake(result.fetchUrl, result.eta || 30);
      }
      
      // Return completed deepfake
      if (result.success && result.imageUrl) {
        return result;
      } else {
        throw new Error(result.details || 'DeepFake generation failed');
      }
    } catch (error) {
      console.error('Error generating deepfake:', error);
      throw error;
    }
  }

  // Poll for deepfake completion
  private async pollForDeepFake(fetchUrl: string, initialEta: number): Promise<DeepFakeResponse> {
    const maxAttempts = 60; // Max 2 minutes of polling
    const pollInterval = 2000; // Poll every 2 seconds
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`Polling for deepfake (attempt ${attempt + 1}/${maxAttempts})...`);
        
        // Use the same fetch endpoint as video
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
            imageUrl: result.videoUrl, // The fetch endpoint returns videoUrl but it's actually an image
            meta: result.meta
          };
        }

        // Wait before next attempt
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      } catch (error) {
        console.error('Error polling for deepfake:', error);
        if (attempt === maxAttempts - 1) {
          throw error;
        }
      }
    }

    throw new Error('DeepFake generation timed out after 2 minutes');
  }
}

export const deepfakeClient = new DeepFakeClient();
export type { DeepFakeResponse };
// Netlify Function for Video Generation using ModelsLab img2video_ultra API
import { createVideoStatus } from './utils/supabase.js';
import { videoRateLimiter } from './utils/rateLimiter.js';

export async function handler(req) {
  console.log('Video generation function called');
  console.log('Request method:', req.httpMethod);
  // Apply rate limiting
  const rateLimitResponse = await videoRateLimiter(req);
  if (rateLimitResponse) {
    return new Response(rateLimitResponse.body, {
      status: rateLimitResponse.statusCode,
      headers: rateLimitResponse.headers
    });
  }

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Check for API key
  if (!process.env.MODELSLAB_API_KEY) {
    console.error('MODELSLAB_API_KEY is not set');
    return new Response(JSON.stringify({ error: 'Server configuration error: API key not found' }), {
      status: 500,
      headers
    });
  }

  // Handle preflight OPTIONS request
  if (req.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response('', {
      status: 200,
      headers
    });
  }

  if (req.httpMethod !== 'POST') {
    console.log('Method not allowed:', req.httpMethod);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    console.log('Parsing request body');
    const body = JSON.parse(req.body);
    const { init_image, prompt, output_type, negative_prompt, num_frames, fps } = body;
    console.log('Request params:', { prompt, output_type, num_frames, fps, hasInitImage: !!init_image });

    if (!init_image || !prompt) {
      return new Response(JSON.stringify({ error: 'init_image and prompt are required' }), {
        status: 400,
        headers
      });
    }

    // Generate unique track ID for this request
    const track_id = `video_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Construct webhook URL (will be the deployed function URL)
    const siteUrl = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:8888';
    const webhookUrl = `${siteUrl}/.netlify/functions/webhooks/video-gen`;

    // Extract base64 data from data URL if present
    let processedImage = init_image;
    if (init_image.startsWith('data:')) {
      const base64Match = init_image.match(/^data:image\/\w+;base64,(.+)$/);
      if (base64Match) {
        processedImage = base64Match[1];
      }
    }

    // Call ModelsLab img2video_ultra API (NSFW-enabled endpoint)
    const response = await fetch('https://modelslab.com/api/v6/video/img2video_ultra', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: process.env.MODELSLAB_API_KEY,
        init_image: processedImage,
        prompt,
        base64: true, // Indicate that init_image is base64 encoded
        output_type: output_type || 'mp4',
        negative_prompt: negative_prompt || 'blurry, low quality, distorted, extra limbs, missing limbs, broken fingers, deformed, glitch, artifacts, unrealistic, low resolution, bad anatomy, duplicate, cropped, watermark, text, logo, jpeg artifacts, noisy, oversaturated, underexposed, overexposed, flicker, unstable motion, motion blur, stretched, mutated, out of frame, bad proportions',
        num_frames: num_frames || '81',
        fps: fps || '16',
        webhook: webhookUrl,
        track_id: track_id
      }),
    });

    const data = await response.json();
    console.log('ModelsLab API response:', data);

    if (!response.ok) {
      console.error('ModelsLab API error:', data);
      return new Response(JSON.stringify({ 
        error: data.message || data.error || 'Video generation failed',
        details: data
      }), {
        status: response.status,
        headers
      });
    }

    // Check if video is processing
    if (data.status === 'processing' && data.fetch_result) {
      // Store initial status in Supabase
      await createVideoStatus(track_id, data.fetch_result, data.eta);

      // Return processing status with track_id for webhook-based tracking
      return new Response(JSON.stringify({
        success: true,
        status: 'processing',
        track_id,
        fetchUrl: data.fetch_result,
        eta: data.eta,
        id: data.id,
        prompt,
        meta: data
      }), {
        status: 200,
        headers
      });
    }

    // Return the video generation result
    return new Response(JSON.stringify({
      success: true,
      videoUrl: data.output?.[0] || data.video_url || data.url || data.video || null,
      prompt,
      eta: data.eta,
      status: data.status || 'completed',
      meta: data
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Video generation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers
    });
  }
};
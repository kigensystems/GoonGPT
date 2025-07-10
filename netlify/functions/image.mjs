// Netlify Function: Image generation endpoint
// Uses ModelsLab API for fast image generation

import { aiRateLimiter } from './utils/rateLimiter.js';
import { validateImageInput } from './utils/validation.js';

export default async function handler(req, context) {
  // Apply rate limiting
  const rateLimitResponse = await aiRateLimiter(req);
  if (rateLimitResponse) {
    return new Response(rateLimitResponse.body, {
      status: rateLimitResponse.statusCode,
      headers: rateLimitResponse.headers
    });
  }
  // Check for required environment variables
  if (!process.env.MODELSLAB_API_KEY) {
    console.error('MODELSLAB_API_KEY is not set');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers
    });
  }

  try {
    const { prompt, negative_prompt = '', width = 1024, height = 1024, samples = 1, safety_checker = false, seed, enhance_prompt = true, enhance_style } = await req.json();
    
    // Validate input
    const validation = validateImageInput(prompt, { width, height });
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers
      });
    }

    console.log('Generating image with prompt:', prompt);
    console.log('API Key exists:', !!process.env.MODELSLAB_API_KEY);

    // ModelsLab API call for realtime text2img
    const requestBody = {
      key: process.env.MODELSLAB_API_KEY,
      prompt: prompt,
      negative_prompt: negative_prompt,
      width: String(width),
      height: String(height),
      samples: samples,
      safety_checker: safety_checker,
      seed: seed || null,
      base64: false,
      webhook: null,
      track_id: null
    };

    // Add optional parameters if provided
    if (enhance_style) {
      requestBody.enhance_style = enhance_style;
    }

    const response = await fetch('https://modelslab.com/api/v6/realtime/text2img', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ModelsLab API error:', errorData);
      throw new Error(`ModelsLab API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Handle different response types
    if (result.status === 'error') {
      throw new Error(result.message || 'Image generation failed');
    }
    
    // For processing status, return with fetch URL
    if (result.status === 'processing') {
      return new Response(JSON.stringify({
        status: 'processing',
        eta: result.eta,
        fetch_result: result.fetch_result,
        message: `Image is being generated. ETA: ${result.eta} seconds`
      }), {
        status: 202, // Accepted
        headers
      });
    }

    // For success status, return image URLs
    if (result.status === 'success' && result.output) {
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      
      return new Response(JSON.stringify({
        success: true,
        imageUrl: imageUrl,
        images: result.output, // Include all images if multiple samples
        prompt: prompt,
        meta: result.meta || {}
      }), {
        status: 200,
        headers
      });
    }
    
    // Handle unexpected response format
    throw new Error('Unexpected response format from ModelsLab API');

  } catch (error) {
    console.error('Image API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate image',
      details: error.message 
    }), {
      status: 500,
      headers
    });
  }
}
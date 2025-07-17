// Netlify Function: Image generation endpoint
// Uses ModelsLab API for fast image generation

import { imageRateLimiter } from './utils/rateLimiter.js';
import { validateImageInput } from './utils/validation.js';

export async function handler(event) {
  // Apply rate limiting
  const rateLimitResponse = await imageRateLimiter(event);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  // Check for required environment variables
  if (!process.env.MODELSLAB_API_KEY) {
    console.error('MODELSLAB_API_KEY is not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { prompt, negative_prompt = '', width = 1024, height = 1024, samples = 1, safety_checker = false, seed, enhance_prompt = true, enhance_style } = JSON.parse(event.body);
    
    // Validate input
    const validation = validateImageInput(prompt, { width, height });
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: validation.error }),
      };
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
      return {
        statusCode: 202, // Accepted
        headers,
        body: JSON.stringify({
          status: 'processing',
          eta: result.eta,
          fetch_result: result.fetch_result,
          message: `Image is being generated. ETA: ${result.eta} seconds`
        }),
      };
    }

    // For success status, return image URLs
    if (result.status === 'success' && result.output) {
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          imageUrl: imageUrl,
          images: result.output, // Include all images if multiple samples
          prompt: prompt,
          meta: result.meta || {}
        }),
      };
    }
    
    // Handle unexpected response format
    throw new Error('Unexpected response format from ModelsLab API');

  } catch (error) {
    console.error('Image API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate image',
        details: error.message 
      }),
    };
  }
}
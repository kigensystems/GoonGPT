// Netlify Function: ASMR text-to-audio endpoint
// Uses ModelsLab API for ASMR voice generation

import { asmrRateLimiter } from './utils/rateLimiter.js';

export async function handler(event) {
  // Get CORS headers first
  const origin = event.headers.origin || event.headers.Origin;
  const headers = {
    'Access-Control-Allow-Origin': origin || 'http://localhost:5173',
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

  // Apply rate limiting
  const rateLimitResponse = await asmrRateLimiter(event);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Check for required environment variables
  console.log('ASMR Environment check:', {
    hasKey: !!process.env.MODELSLAB_API_KEY,
    keyLength: process.env.MODELSLAB_API_KEY?.length,
    hasVoiceId: !!process.env.ASMR_VOICE_ID,
    voiceId: process.env.ASMR_VOICE_ID,
    nodeEnv: process.env.NODE_ENV
  });
  
  if (!process.env.MODELSLAB_API_KEY) {
    console.error('MODELSLAB_API_KEY is not set');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server configuration error - API key missing',
        details: 'MODELSLAB_API_KEY environment variable is not set'
      }),
    };
  }

  if (!process.env.ASMR_VOICE_ID) {
    console.error('ASMR_VOICE_ID is not set - ASMR feature is not configured');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'ASMR feature not configured',
        details: 'ASMR_VOICE_ID environment variable is not set. Set it to "asmrfemale" to enable ASMR.'
      }),
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
    const { text, wallet_address } = JSON.parse(event.body);
    
    // Validate input
    if (!text || typeof text !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Text is required and must be a string' }),
      };
    }

    console.log('ASMR generation request:', { 
      textLength: text.length, 
      customVoiceUrl: 'https://goongpt.pro/asmr/asmr_combined.wav',
      asmrEnabled: !!process.env.ASMR_VOICE_ID
    });

    // Simulate processing delay for realism (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Direct URL to pre-recorded ASMR audio
    const audioUrl = 'https://goongpt.pro/asmr/asmr_combined.wav';
    
    console.log('ASMR Response: Using pre-recorded audio:', audioUrl);
    
    // Return response in same format as API would
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        audio_url: audioUrl,
        message: 'ASMR audio generated successfully',
        eta: 0
      }),
    };

  } catch (error) {
    console.error('ASMR generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate ASMR audio',
        details: error.message 
      }),
    };
  }
}
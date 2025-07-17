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

    // ModelsLab API call for text-to-audio
    const requestBody = {
      key: process.env.MODELSLAB_API_KEY,
      prompt: text,
      init_audio: 'https://goongpt.pro/asmr/asmr_combined.wav',
      language: 'english',
      speed: 1.0,
    };

    console.log('ASMR API Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://modelslab.com/api/v6/voice/text_to_audio', {
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
    console.log('ASMR API Response:', JSON.stringify(result, null, 2));
    
    // Handle error response
    if (result.status === 'error') {
      const errorMsg = typeof result.message === 'object' 
        ? JSON.stringify(result.message) 
        : result.message || 'ASMR generation failed';
      throw new Error(errorMsg);
    }

    // Handle processing status
    if (result.status === 'processing') {
      console.log('ASMR audio is processing');
      // Try different URL sources
      let audioUrl;
      if (result.output && result.output[0]) {
        audioUrl = result.output[0];
        console.log('Using output URL (processing):', audioUrl);
      } else if (result.proxy_links && result.proxy_links[0]) {
        audioUrl = result.proxy_links[0];
        console.log('Using proxy URL (processing):', audioUrl);
      } else if (result.future_links && result.future_links[0]) {
        audioUrl = result.future_links[0];
        console.log('Using future_links URL:', audioUrl);
      } else {
        audioUrl = null;
      }
      
      if (audioUrl) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            audio_url: audioUrl,
            message: `Audio will be ready in approximately ${result.eta || 5} seconds`,
            eta: result.eta || 5
          }),
        };
      }
    }

    // Return successful response for immediate generation
    // Prefer direct output URL for better compatibility
    let audioUrl;
    if (result.output && result.output[0]) {
      audioUrl = result.output[0];
      console.log('Using direct output URL:', audioUrl);
    } else if (result.proxy_links && result.proxy_links[0]) {
      audioUrl = result.proxy_links[0];
      console.log('Using proxy URL:', audioUrl);
    } else {
      audioUrl = result.audio_url;
      console.log('Using audio_url field:', audioUrl);
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        audio_url: audioUrl,
        message: 'ASMR audio generated successfully',
        eta: result.eta || 0
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
// Netlify Function: ASMR text-to-audio endpoint
// Uses ModelsLab API for ASMR voice generation

export async function handler(event) {
  // Check for required environment variables
  console.log('ASMR Environment check:', {
    hasKey: !!process.env.MODELSLAB_API_KEY,
    keyLength: process.env.MODELSLAB_API_KEY?.length,
    hasVoiceId: !!process.env.ASMR_VOICE_ID,
    nodeEnv: process.env.NODE_ENV
  });
  
  if (!process.env.MODELSLAB_API_KEY) {
    console.error('MODELSLAB_API_KEY is not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  if (!process.env.ASMR_VOICE_ID) {
    console.error('ASMR_VOICE_ID is not set - voice must be uploaded first');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ASMR voice not configured' }),
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Get CORS headers based on origin
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

    console.log('ASMR generation request:', { textLength: text.length });

    // ModelsLab API call for text-to-audio
    const requestBody = {
      key: process.env.MODELSLAB_API_KEY,
      prompt: text,
      voice_id: process.env.ASMR_VOICE_ID,
      language: 'english',
      speed: 1.0,
    };

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

    // Return successful response
    const audioUrl = result.output && result.output[0] ? result.output[0] : result.audio_url;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        audio_url: audioUrl,
        message: 'ASMR audio generated successfully'
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
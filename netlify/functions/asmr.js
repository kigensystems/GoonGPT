import fetch from 'node-fetch';

export async function handler(event) {
  // CORS headers - include in all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
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
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check for API key configuration
  console.log('ASMR Environment check:', {
    hasKey: !!process.env.MODELSLAB_API_KEY,
    keyLength: process.env.MODELSLAB_API_KEY?.length,
    nodeEnv: process.env.NODE_ENV
  });

  if (!process.env.MODELSLAB_API_KEY) {
    console.error('MODELSLAB_API_KEY is not set');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server configuration error',
        details: 'API key not configured' 
      })
    };
  }

  try {
    const { text, wallet_address } = JSON.parse(event.body);

    // Validate input
    if (!text || typeof text !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid request',
          details: 'Text is required and must be a string' 
        })
      };
    }

    // Limit text length
    if (text.length > 1000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Text too long',
          details: 'Maximum text length is 1000 characters' 
        })
      };
    }

    console.log('Generating ASMR audio for text:', text.substring(0, 50) + '...');
    console.log('Using voice ID: asmrwhisperfemale');

    // Call ModelsLab text-to-audio API
    const apiUrl = 'https://modelslab.com/api/v6/voice/text_to_audio';
    const requestBody = {
      key: process.env.MODELSLAB_API_KEY,
      prompt: text,
      voice_id: 'asmrwhisperfemale',
      language: 'english',
      speed: 1.0,
    };

    console.log('Making request to ModelsLab API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('ModelsLab response status:', response.status);
    console.log('ModelsLab response text:', responseText);

    if (!response.ok) {
      console.error('ModelsLab API error:', response.status, responseText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `ModelsLab API error: ${response.status}`,
          details: responseText 
        })
      };
    }

    // Parse response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse ModelsLab response:', parseError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid API response',
          details: 'Failed to parse response from ModelsLab' 
        })
      };
    }

    console.log('Parsed ModelsLab response:', result);

    // Check for various response formats from ModelsLab
    // The API might return the URL in different fields
    const audioUrl = result.audio_url || result.output || result.url || result.audio;
    
    if (audioUrl) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          audio_url: audioUrl,
          message: 'ASMR audio generated successfully'
        })
      };
    } else if (result.status === 'processing' || result.eta) {
      // Handle async processing if ModelsLab queues the request
      return {
        statusCode: 202,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Audio generation in progress',
          details: 'Please try again in a few seconds',
          eta: result.eta
        })
      };
    } else {
      console.error('Unexpected response structure from ModelsLab:', result);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to generate audio',
          details: result.message || result.error || 'Unknown error',
          response: result
        })
      };
    }

  } catch (error) {
    console.error('Error in ASMR function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}
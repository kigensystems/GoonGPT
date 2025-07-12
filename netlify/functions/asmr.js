const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { text, wallet_address } = JSON.parse(event.body);

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    // Check if API key is configured
    if (!process.env.MODELSLAB_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    console.log('Generating ASMR audio for text:', text.substring(0, 50) + '...');

    // Call ModelsLab text-to-audio API
    const response = await fetch('https://modelslab.com/api/v6/voice/text_to_audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MODELSLAB_API_KEY}`,
      },
      body: JSON.stringify({
        key: process.env.MODELSLAB_API_KEY,
        prompt: text,
        voice_id: 'asmrwhisperfemale', // The custom voice ID you created
        language: 'english',
        speed: 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ModelsLab API error:', response.status, errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: `API error: ${response.status}`,
          details: errorText 
        })
      };
    }

    const result = await response.json();
    console.log('ModelsLab response:', result);

    // Check if the response contains an audio URL
    if (result.success && result.audio_url) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          success: true,
          audio_url: result.audio_url,
          message: 'ASMR audio generated successfully'
        })
      };
    } else {
      console.error('Invalid response from ModelsLab:', result);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to generate audio',
          details: result.message || 'Unknown error'
        })
      };
    }

  } catch (error) {
    console.error('Error in ASMR function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};
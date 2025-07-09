// Netlify Function for fetching video generation status
export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Check for API key
  if (!process.env.MODELSLAB_API_KEY) {
    console.error('MODELSLAB_API_KEY is not set');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server configuration error: API key not found' }),
    };
  }

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { fetch_url } = JSON.parse(event.body);

    if (!fetch_url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'fetch_url is required' }),
      };
    }

    // Call ModelsLab fetch API
    const response = await fetch(fetch_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: process.env.MODELSLAB_API_KEY,
      }),
    });

    const data = await response.json();
    console.log('ModelsLab fetch response:', data);

    if (!response.ok) {
      console.error('ModelsLab API error:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: data.message || data.error || 'Video fetch failed',
          details: data
        }),
      };
    }

    // Check if still processing
    if (data.status === 'processing') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          status: 'processing',
          eta: data.eta,
          message: data.message,
          meta: data
        }),
      };
    }

    // Return the completed video
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        status: 'completed',
        videoUrl: data.output?.[0] || data.video_url || data.url || data.video || null,
        meta: data
      }),
    };

  } catch (error) {
    console.error('Video fetch error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
    };
  }
};
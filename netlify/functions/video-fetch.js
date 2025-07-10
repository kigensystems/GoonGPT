// Netlify Function for fetching video generation status
export default async function handler(req, context) {
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
  if (req.method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    const { fetch_url } = await req.json();

    if (!fetch_url) {
      return new Response(JSON.stringify({ error: 'fetch_url is required' }), {
        status: 400,
        headers
      });
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
      return new Response(JSON.stringify({ 
        error: data.message || data.error || 'Video fetch failed',
        details: data
      }), {
        status: response.status,
        headers
      });
    }

    // Check if still processing
    if (data.status === 'processing') {
      return new Response(JSON.stringify({
        success: true,
        status: 'processing',
        eta: data.eta,
        message: data.message,
        meta: data
      }), {
        status: 200,
        headers
      });
    }

    // Return the completed video
    return new Response(JSON.stringify({
      success: true,
      status: 'completed',
      videoUrl: data.output?.[0] || data.video_url || data.url || data.video || null,
      meta: data
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Video fetch error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers
    });
  }
}
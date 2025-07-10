// Netlify Function for DeepFake Single Face Swap
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
    const { base_image, face_image, watermark = true } = await req.json();

    if (!base_image || !face_image) {
      return new Response(JSON.stringify({ error: 'Missing required images: base_image and face_image are required' }), {
        status: 400,
        headers
      });
    }

    // Call ModelsLab DeepFake API using the two-image trick
    // Set both init_image and target_image to the base image
    const response = await fetch('https://modelslab.com/api/v6/deepfake/single_face_swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: process.env.MODELSLAB_API_KEY,
        init_image: base_image,      // base image
        target_image: base_image,    // same base image (trick to auto-detect face)
        reference_image: face_image, // the new face to insert
        watermark,
        webhook: null,
        track_id: null
      }),
    });

    const data = await response.json();
    console.log('ModelsLab DeepFake response:', data);

    if (!response.ok) {
      console.error('ModelsLab API error:', data);
      return new Response(JSON.stringify({ 
        error: data.message || data.error || 'DeepFake generation failed',
        details: data
      }), {
        status: response.status,
        headers
      });
    }

    // Check if processing is needed
    if (data.status === 'processing' && data.fetch_result) {
      return new Response(JSON.stringify({
        success: true,
        status: 'processing',
        fetchUrl: data.fetch_result,
        eta: data.eta || 30,
        message: 'DeepFake is being processed',
        id: data.id
      }), {
        status: 200,
        headers
      });
    }

    // Return the completed deepfake
    return new Response(JSON.stringify({
      success: true,
      status: 'completed',
      imageUrl: data.output || data.image_url || data.url || null,
      meta: data
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('DeepFake error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers
    });
  }
};
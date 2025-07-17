// Netlify Function: Fetch generated images from ModelsLab
// Used for polling async image generation status

export async function handler(event) {
  console.log('=== IMAGE FETCH FUNCTION START ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', event.httpMethod);
  
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
    const { request_id } = JSON.parse(event.body);
    
    if (!request_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'request_id is required' }),
      };
    }

    console.log('=== FETCH REQUEST ===');
    console.log('Request ID:', request_id);
    console.log('API Key exists:', !!process.env.MODELSLAB_API_KEY);

    // ModelsLab API call to fetch image
    const startTime = Date.now();
    const response = await fetch('https://modelslab.com/api/v6/images/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: process.env.MODELSLAB_API_KEY,
        request_id: request_id
      }),
    });

    const responseTime = Date.now() - startTime;
    console.log(`=== FETCH API RESPONSE (${responseTime}ms) ===`);
    console.log('Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ModelsLab fetch API error:', errorData);
      throw new Error(`ModelsLab API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('=== FETCH RESPONSE DATA ===');
    console.log('Status:', result.status);
    console.log('ID:', result.id);
    console.log('Output:', result.output);
    console.log('Full response:', JSON.stringify(result, null, 2));
    
    // Handle different response types
    if (result.status === 'error') {
      console.error('API returned error:', result);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: result.message || 'Failed to fetch image',
          status: 'error'
        }),
      };
    }
    
    // Still processing
    if (result.status === 'processing') {
      console.log('=== STILL PROCESSING ===');
      console.log('Image generation in progress for request:', request_id);
      
      return {
        statusCode: 202,
        headers,
        body: JSON.stringify({
          status: 'processing',
          message: 'Image is still being generated'
        }),
      };
    }

    // Success - image is ready
    if (result.status === 'success' && result.output) {
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      
      console.log('=== FETCH SUCCESS ===');
      console.log('Image ready for request:', request_id);
      console.log('Image URLs:', result.output);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          status: 'success',
          imageUrl: imageUrl,
          images: result.output
        }),
      };
    }
    
    // Handle unexpected response
    throw new Error('Unexpected response format from ModelsLab API');

  } catch (error) {
    console.error('Image fetch error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch image',
        details: error.message 
      }),
    };
  }
}
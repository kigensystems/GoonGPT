// Netlify Function: Check image generation status
// Allows frontend to poll for prediction status

export async function handler(event) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
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

  try {
    const predictionId = event.queryStringParameters?.id;
    
    if (!predictionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prediction ID is required' }),
      };
    }

    // Check prediction status
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get prediction status: ${response.status}`);
    }

    const result = await response.json();
    
    // Return status and output if available
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: result.status,
        output: result.output,
        error: result.error,
        logs: result.logs,
        metrics: result.metrics
      }),
    };
  } catch (error) {
    console.error('Status check error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to check status',
        details: error.message 
      }),
    };
  }
}
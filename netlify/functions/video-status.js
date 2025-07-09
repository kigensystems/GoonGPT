// Status check endpoint for video generation using track_id
// Retrieves status from Netlify Blobs storage

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get track_id from query parameters
    const track_id = event.queryStringParameters?.track_id;

    if (!track_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'track_id parameter is required' }),
      };
    }

    // Retrieve status from Netlify Blobs
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('video-generation-status');

    const statusData = await store.get(track_id, { type: 'json' });

    if (!statusData) {
      // Status not found - either expired or doesn't exist
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'Status not found',
          track_id,
          message: 'The video generation status may have expired or the track_id is invalid'
        }),
      };
    }

    // Calculate elapsed time
    const created = new Date(statusData.created_at || statusData.updated_at);
    const elapsed = Math.floor((Date.now() - created.getTime()) / 1000);

    // Return status data
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        track_id,
        status: statusData.status,
        videoUrl: statusData.videoUrl || null,
        eta: statusData.eta,
        elapsed_seconds: elapsed,
        error: statusData.error || null,
        webhook_received: statusData.webhook_received || false,
        updated_at: statusData.updated_at || statusData.created_at,
        // Include fetchUrl as fallback for polling if webhook fails
        fetchUrl: statusData.fetchUrl || null
      }),
    };

  } catch (error) {
    console.error('Status check error:', error);
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
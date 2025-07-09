// Webhook handler for ModelsLab video generation callbacks
// Stores video generation status updates in Netlify Blobs

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

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
    // Parse webhook payload from ModelsLab
    const webhookData = JSON.parse(event.body);
    console.log('Webhook received:', {
      id: webhookData.id,
      status: webhookData.status,
      track_id: webhookData.track_id,
      hasOutput: !!webhookData.output,
      message: webhookData.message
    });

    // Extract relevant data
    const { id, status, output, message, track_id, eta, meta } = webhookData;

    if (!track_id) {
      console.error('No track_id in webhook payload');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing track_id' }),
      };
    }

    // Store status update in Netlify Blobs
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('video-generation-status');

    // Prepare status data to store
    const statusData = {
      id,
      status,
      track_id,
      eta,
      meta,
      updated_at: new Date().toISOString(),
      webhook_received: true
    };

    // Add output URL if video is completed
    if (status === 'success' && output && output.length > 0) {
      statusData.videoUrl = output[0];
      statusData.allOutputs = output;
    }

    // Add error message if failed
    if (status === 'error' && message) {
      statusData.error = message;
    }

    // Store the status update with 1 hour TTL
    await store.setJSON(track_id, statusData, {
      metadata: {
        ttl: 3600 // 1 hour TTL
      }
    });

    console.log(`Stored status update for track_id: ${track_id}, status: ${status}`);

    // Return success response to ModelsLab
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Webhook processed successfully',
        track_id
      }),
    };

  } catch (error) {
    console.error('Webhook processing error:', error);
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
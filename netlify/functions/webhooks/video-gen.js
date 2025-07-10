// Webhook handler for ModelsLab video generation callbacks
// Stores video generation status updates in Netlify Blobs

export default async function handler(req, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

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
    // Parse webhook payload from ModelsLab
    const webhookData = await req.json();
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
      return new Response(JSON.stringify({ error: 'Missing track_id' }), {
        status: 400,
        headers
      });
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
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Webhook processed successfully',
      track_id
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers
    });
  }
};
// Webhook handler for ModelsLab video generation callbacks
// Stores video generation status updates in Supabase

import { updateVideoStatus } from '../utils/supabase.js';

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

    // Prepare status data to update in Supabase
    const updates = {
      status: status === 'success' ? 'completed' : status, // Map 'success' to 'completed'
      webhook_received: true
    };

    // Add output URL if video is completed
    if (status === 'success' && output && output.length > 0) {
      updates.video_url = output[0];
      updates.all_outputs = output;
    }

    // Add error message if failed
    if (status === 'error' && message) {
      updates.error_message = message;
      updates.status = 'failed'; // Use 'failed' instead of 'error'
    }

    // Add meta data if provided
    if (meta) {
      updates.meta = meta;
    }

    if (eta) {
      updates.eta = eta;
    }

    // Update the status in Supabase
    await updateVideoStatus(track_id, updates);

    console.log(`Updated video status for track_id: ${track_id}, status: ${status}`);

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
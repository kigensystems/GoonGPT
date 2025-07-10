// Status check endpoint for video generation using track_id
// Retrieves status from Supabase database

import { getVideoStatus } from './utils/supabase.js';

export default async function handler(req, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers
    });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    // Get track_id from query parameters
    const url = new URL(req.url);
    const track_id = url.searchParams.get('track_id');

    if (!track_id) {
      return new Response(JSON.stringify({ error: 'track_id parameter is required' }), {
        status: 400,
        headers
      });
    }

    // Retrieve status from Supabase
    const statusData = await getVideoStatus(track_id);

    if (!statusData) {
      // Status not found - either expired or doesn't exist
      return new Response(JSON.stringify({ 
        error: 'Status not found',
        track_id,
        message: 'The video generation status may have expired or the track_id is invalid'
      }), {
        status: 404,
        headers
      });
    }

    // Calculate elapsed time
    const created = new Date(statusData.created_at);
    const elapsed = Math.floor((Date.now() - created.getTime()) / 1000);

    // Return status data
    return new Response(JSON.stringify({
      success: true,
      track_id,
      status: statusData.status,
      videoUrl: statusData.video_url || null,
      eta: statusData.eta,
      elapsed_seconds: elapsed,
      error: statusData.error_message || null,
      webhook_received: statusData.webhook_received || false,
      updated_at: statusData.updated_at,
      // Include fetchUrl as fallback for polling if webhook fails
      fetchUrl: statusData.fetch_url || null
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Status check error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers
    });
  }
};
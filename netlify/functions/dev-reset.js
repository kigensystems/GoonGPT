import { resetDevStorage } from './utils/database.js';

export default async function handler(req, context) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production' || process.env.NETLIFY) {
    return new Response(JSON.stringify({ error: 'Only available in development' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    resetDevStorage();
    
    return new Response(JSON.stringify({ message: 'Development storage cleared' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Reset error:', error);
    return new Response(JSON.stringify({ error: 'Reset failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
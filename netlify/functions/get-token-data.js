import { getUserTokenData } from './utils/supabase.js';
import { validateAuthToken } from './utils/auth.js';
import { applyCors } from './utils/cors.js';
import { createRateLimiter } from './utils/rateLimiter.js';

// Create rate limiter for token data fetching
const getTokenDataRateLimit = createRateLimiter({
  windowMs: 300000, // 5 minutes
  maxRequests: 180, // 180 requests per 5 minutes (36 per minute)
  message: 'Too many token data requests. Please wait a moment.'
});

export default async function handler(req) {
  try {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('', {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
      });
    }
    
    // Only allow GET requests
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Apply rate limiting
    const rateLimitResult = await getTokenDataRateLimit(req);
    if (rateLimitResult) {
      return new Response(rateLimitResult.body, {
        status: rateLimitResult.statusCode,
        headers: rateLimitResult.headers
      });
    }
    
    // Validate authentication
    const authResult = await validateAuthToken(req);
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get user token data
    const tokenData = await getUserTokenData(authResult.user.id);
    
    return new Response(JSON.stringify({
      success: true,
      ...tokenData
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
    
  } catch (error) {
    console.error('Get token data error:', error);
    
    let status = 500;
    let message = 'Internal server error';
    
    if (error.message === 'User not found') {
      status = 404;
      message = 'User not found';
    } else if (error.message === 'Failed to fetch token data') {
      message = 'Failed to fetch token data';
    }
    
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
}
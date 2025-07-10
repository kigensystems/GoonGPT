import { getUserTokenData } from './utils/database.js';
import { validateAuthToken } from './utils/auth.js';
import { applyCors } from './utils/cors.js';
import { createRateLimiter } from './utils/rateLimiter.js';

// Create rate limiter for token data fetching
const getTokenDataRateLimit = createRateLimiter({
  windowMs: 300000, // 5 minutes
  maxRequests: 120, // 120 requests per 5 minutes
  message: 'Too many token data requests. Please wait a moment.'
});

export async function handler(event, context) {
  const response = { statusCode: 200, headers: {}, body: '' };
  
  try {
    // Apply CORS
    applyCors(response);
    
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return response;
    }
    
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
      response.statusCode = 405;
      response.body = JSON.stringify({ error: 'Method not allowed' });
      return response;
    }
    
    // Apply rate limiting
    const rateLimitResult = await getTokenDataRateLimit(event);
    if (rateLimitResult) {
      return rateLimitResult;
    }
    
    // Validate authentication
    const authResult = await validateAuthToken(event, context);
    if (!authResult.valid) {
      response.statusCode = 401;
      response.body = JSON.stringify({ error: 'Unauthorized' });
      return response;
    }
    
    // Get user token data
    const tokenData = await getUserTokenData(context, authResult.user.id);
    
    response.body = JSON.stringify({
      success: true,
      ...tokenData
    });
    
  } catch (error) {
    console.error('Get token data error:', error);
    
    if (error.message === 'User not found') {
      response.statusCode = 404;
      response.body = JSON.stringify({ error: 'User not found' });
    } else {
      response.statusCode = 500;
      response.body = JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to fetch token data'
      });
    }
  }
  
  return response;
}
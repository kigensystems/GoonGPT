import { earnTokens } from './utils/supabase.js';
import { validateAuthToken } from './utils/auth.js';
import { applyCors } from './utils/cors.js';
import { createRateLimiter } from './utils/rateLimiter.js';
import { validateInput } from './utils/validation.js';

// Create rate limiter for token earning
const earnTokensRateLimit = createRateLimiter({
  windowMs: 300000, // 5 minutes
  maxRequests: 60, // 60 requests per 5 minutes
  message: 'Too many token earning requests. Please wait a moment.'
});

export default async function handler(req, context) {
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
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Apply rate limiting
    const rateLimitResult = await earnTokensRateLimit(req);
    if (rateLimitResult) {
      return new Response(rateLimitResult.body, {
        status: rateLimitResult.statusCode,
        headers: rateLimitResult.headers
      });
    }
    
    // Validate authentication
    const authResult = await validateAuthToken(req, context);
    if (!authResult.valid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate input
    const validation = validateInput(requestBody, {
      amount: { type: 'number', required: true, min: 1, max: 5000 },
      action: { type: 'string', required: false, maxLength: 100 }
    });
    
    if (!validation.valid) {
      return new Response(JSON.stringify({ 
        error: 'Validation failed', 
        details: validation.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { amount, action = 'Activity' } = requestBody;
    
    // Earn tokens for the user
    console.log('🔍 EARN-TOKENS: About to earn tokens for user:', authResult.user.id, 'amount:', amount);
    const result = await earnTokens(authResult.user.id, amount, action);
    console.log('✅ EARN-TOKENS: Token earning result:', result);
    
    return new Response(JSON.stringify({
      success: true,
      tokensEarned: result.tokensEarned,
      newBalance: result.newBalance,
      dailyEarned: result.dailyEarned,
      dailyRemaining: result.dailyRemaining
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
    
  } catch (error) {
    console.error('Earn tokens error:', error);
    
    let status = 500;
    let message = 'Internal server error';
    
    if (error.message === 'User not found') {
      status = 404;
      message = 'User not found';
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
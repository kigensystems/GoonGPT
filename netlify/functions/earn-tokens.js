import { earnTokens } from './utils/database.js';
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
  const response = { statusCode: 200, headers: {}, body: '' };
  
  try {
    // Apply CORS
    applyCors(response);
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return response;
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      response.statusCode = 405;
      response.body = JSON.stringify({ error: 'Method not allowed' });
      return response;
    }
    
    // Apply rate limiting
    const rateLimitResult = await earnTokensRateLimit(req);
    if (rateLimitResult) {
      return rateLimitResult;
    }
    
    // Validate authentication
    const authResult = await validateAuthToken(req, context);
    if (!authResult.valid) {
      response.statusCode = 401;
      response.body = JSON.stringify({ error: 'Unauthorized' });
      return response;
    }
    
    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      response.statusCode = 400;
      response.body = JSON.stringify({ error: 'Invalid JSON in request body' });
      return response;
    }
    
    // Validate input
    const validation = validateInput(requestBody, {
      amount: { type: 'number', required: true, min: 1, max: 50 },
      action: { type: 'string', required: false, maxLength: 100 }
    });
    
    if (!validation.valid) {
      response.statusCode = 400;
      response.body = JSON.stringify({ 
        error: 'Validation failed', 
        details: validation.errors 
      });
      return response;
    }
    
    const { amount, action = 'Activity' } = requestBody;
    
    // Earn tokens for the user
    const result = await earnTokens(authResult.user.id, amount, action);
    
    response.body = JSON.stringify({
      success: true,
      tokensEarned: result.tokensEarned,
      newBalance: result.user.token_balance,
      dailyEarned: result.user.daily_tokens_earned,
      dailyLimit: result.dailyLimit,
      dailyRemaining: result.dailyRemaining,
      transaction: result.transaction
    });
    
  } catch (error) {
    console.error('Earn tokens error:', error);
    
    if (error.message === 'Daily token limit reached') {
      response.statusCode = 429;
      response.body = JSON.stringify({ 
        error: 'Daily token earning limit reached',
        message: 'You have reached your daily limit of 100 tokens. Try again tomorrow!'
      });
    } else if (error.message === 'User not found') {
      response.statusCode = 404;
      response.body = JSON.stringify({ error: 'User not found' });
    } else {
      response.statusCode = 500;
      response.body = JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to earn tokens'
      });
    }
  }
  
  return response;
}
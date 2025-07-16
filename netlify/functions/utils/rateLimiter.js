// User-based rate limiter using Supabase for persistence
// Tracks rate limits by wallet address for authenticated users

import { supabase } from './supabase.js';

// Fallback in-memory rate limiter for unauthenticated users
const anonymousRequestCounts = new Map();

// Clean up old anonymous entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of anonymousRequestCounts.entries()) {
    if (now - data.resetTime > 3600000) { // Remove entries older than 1 hour
      anonymousRequestCounts.delete(key);
    }
  }
}, 300000);

// Helper function to extract wallet address from request
function extractWalletAddress(requestObj) {
  try {
    if (requestObj.body) {
      const body = JSON.parse(requestObj.body);
      return body.wallet_address;
    }
  } catch (error) {
    // Invalid JSON or no wallet_address in body
  }
  return null;
}

// Helper function to get wallet address from session cookie
async function getWalletFromSession(requestObj) {
  try {
    const { validateSessionFromCookies } = await import('./cookies.js');
    const session = await validateSessionFromCookies(requestObj);
    if (session && session.user_id) {
      const { getUserById } = await import('./supabase.js');
      const user = await getUserById(session.user_id);
      return user?.wallet_address;
    }
  } catch (error) {
    console.error('Error getting wallet from session:', error);
  }
  return null;
}

// Helper function to get IP address for anonymous users
function getClientIP(requestObj) {
  let ip;
  if (requestObj.headers && typeof requestObj.headers.get === 'function') {
    // Functions API v2 - req object with Headers interface
    ip = requestObj.headers.get('x-forwarded-for') || 
         requestObj.headers.get('x-real-ip');
  } else if (requestObj.headers) {
    // Functions API v1 - event object with plain headers
    ip = requestObj.headers['x-forwarded-for'] || 
         requestObj.headers['x-real-ip'];
  }
  return ip || 'anonymous';
}

// User-based rate limiter using Supabase
export function createUserRateLimiter(options = {}) {
  const {
    windowMs = 60000, // 1 minute default
    maxRequests = 10, // 10 requests per window default
    actionType = 'general', // Type of action being rate limited
    message = 'Too many requests, please try again later',
    anonymousMaxRequests = 5 // Lower limit for anonymous users
  } = options;

  return async (requestObj) => {
    const now = new Date();
    let walletAddress = extractWalletAddress(requestObj);
    
    // If no wallet address in body, try to get it from session cookie
    if (!walletAddress) {
      walletAddress = await getWalletFromSession(requestObj);
    }
    
    if (walletAddress) {
      // Authenticated user - use Supabase rate limiting
      try {
        const windowStart = new Date(now.getTime() - windowMs);
        const windowEnd = new Date(now.getTime() + windowMs);
        
        // Get or create rate limit record for this user and action
        let { data: rateLimit, error: fetchError } = await supabase
          .from('rate_limits')
          .select('*')
          .eq('wallet_address', walletAddress)
          .eq('action_type', actionType)
          .gte('window_end', now.toISOString())
          .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching rate limit:', fetchError);
          // If DB error, allow request but log it
          return null;
        }
        
        if (!rateLimit) {
          // Create new rate limit window
          const { data: newRateLimit, error: insertError } = await supabase
            .from('rate_limits')
            .insert({
              wallet_address: walletAddress,
              action_type: actionType,
              request_count: 1,
              window_start: windowStart.toISOString(),
              window_end: windowEnd.toISOString()
            })
            .select()
            .single();
          
          if (insertError) {
            console.error('Error creating rate limit:', insertError);
            return null; // Allow request if DB error
          }
          
          return null; // First request in window - allow
        }
        
        // Check if limit exceeded
        if (rateLimit.request_count >= maxRequests) {
          const resetTime = new Date(rateLimit.window_end);
          const retryAfter = Math.ceil((resetTime.getTime() - now.getTime()) / 1000);
          
          return {
            statusCode: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': retryAfter,
              'X-RateLimit-Limit': maxRequests,
              'X-RateLimit-Remaining': 0,
              'X-RateLimit-Reset': resetTime.toISOString(),
              'X-RateLimit-User': walletAddress
            },
            body: JSON.stringify({ 
              error: message,
              retryAfter: retryAfter,
              limit: maxRequests,
              remaining: 0
            })
          };
        }
        
        // Increment counter
        const { error: updateError } = await supabase
          .from('rate_limits')
          .update({ request_count: rateLimit.request_count + 1 })
          .eq('id', rateLimit.id);
        
        if (updateError) {
          console.error('Error updating rate limit:', updateError);
          // Allow request if DB error
        }
        
        return null; // Allow request
        
      } catch (error) {
        console.error('Rate limiter error:', error);
        return null; // Allow request if any error
      }
    } else {
      // Anonymous user - use in-memory rate limiting by IP
      const ip = getClientIP(requestObj);
      const key = `anonymous:${ip}`;
      
      let userData = anonymousRequestCounts.get(key);
      
      // Initialize or reset if window expired
      if (!userData || now.getTime() > userData.resetTime) {
        userData = {
          count: 0,
          resetTime: now.getTime() + windowMs
        };
        anonymousRequestCounts.set(key, userData);
      }
      
      // Increment counter
      userData.count++;
      
      // Check if limit exceeded
      if (userData.count > anonymousMaxRequests) {
        const retryAfter = Math.ceil((userData.resetTime - now.getTime()) / 1000);
        
        return {
          statusCode: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter,
            'X-RateLimit-Limit': anonymousMaxRequests,
            'X-RateLimit-Remaining': 0,
            'X-RateLimit-Reset': new Date(userData.resetTime).toISOString()
          },
          body: JSON.stringify({ 
            error: 'Too many requests from anonymous user. Please connect your wallet for higher limits.',
            retryAfter: retryAfter,
            limit: anonymousMaxRequests,
            remaining: 0
          })
        };
      }
      
      return null; // Allow request
    }
  };
}

// Legacy function for backward compatibility
export function createRateLimiter(options = {}) {
  return createUserRateLimiter(options);
}

// Pre-configured rate limiters for different endpoints
export const aiRateLimiter = createUserRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 20, // 20 AI requests per minute for authenticated users
  anonymousMaxRequests: 5, // 5 AI requests per minute for anonymous users
  actionType: 'ai_request',
  message: 'Too many AI requests. Please wait a moment before trying again.'
});

export const chatRateLimiter = createUserRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 15, // 15 chat requests per minute for authenticated users
  anonymousMaxRequests: 3, // 3 chat requests per minute for anonymous users
  actionType: 'chat',
  message: 'Too many chat requests. Please wait a moment before trying again.'
});

export const imageRateLimiter = createUserRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 10, // 10 image requests per minute for authenticated users
  anonymousMaxRequests: 2, // 2 image requests per minute for anonymous users
  actionType: 'image',
  message: 'Too many image generation requests. Please wait a moment before trying again.'
});

export const videoRateLimiter = createUserRateLimiter({
  windowMs: 300000, // 5 minutes
  maxRequests: 5, // 5 video requests per 5 minutes for authenticated users
  anonymousMaxRequests: 1, // 1 video request per 5 minutes for anonymous users
  actionType: 'video',
  message: 'Too many video generation requests. Video generation is resource-intensive, please wait before trying again.'
});

export const authRateLimiter = createUserRateLimiter({
  windowMs: 900000, // 15 minutes
  maxRequests: 10, // 10 auth attempts per 15 minutes for authenticated users
  anonymousMaxRequests: 5, // 5 auth attempts per 15 minutes for anonymous users
  actionType: 'auth',
  message: 'Too many authentication attempts. Please try again later.'
});

// ASMR rate limiter
export const asmrRateLimiter = createUserRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 10, // 10 requests per minute for authenticated users
  anonymousMaxRequests: 5, // 5 requests per minute for anonymous users
  actionType: 'asmr',
  message: 'Too many ASMR requests. Please try again later.'
});
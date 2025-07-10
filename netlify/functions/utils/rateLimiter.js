// Simple in-memory rate limiter for small projects
// Resets on function cold starts, which is fine for basic protection

const requestCounts = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > 3600000) { // Remove entries older than 1 hour
      requestCounts.delete(key);
    }
  }
}, 300000);

export function createRateLimiter(options = {}) {
  const {
    windowMs = 60000, // 1 minute default
    maxRequests = 10, // 10 requests per window default
    message = 'Too many requests, please try again later',
    keyGenerator = (requestObj) => {
      // Support both v1 (event) and v2 (req) request objects
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
  } = options;

  return async (requestObj) => {
    const key = keyGenerator(requestObj);
    const now = Date.now();
    
    let userData = requestCounts.get(key);
    
    // Initialize or reset if window expired
    if (!userData || now > userData.resetTime) {
      userData = {
        count: 0,
        resetTime: now + windowMs
      };
      requestCounts.set(key, userData);
    }
    
    // Increment counter
    userData.count++;
    
    // Check if limit exceeded
    if (userData.count > maxRequests) {
      return {
        statusCode: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((userData.resetTime - now) / 1000),
          'X-RateLimit-Limit': maxRequests,
          'X-RateLimit-Remaining': 0,
          'X-RateLimit-Reset': new Date(userData.resetTime).toISOString()
        },
        body: JSON.stringify({ error: message })
      };
    }
    
    // Return null to continue processing
    return null;
  };
}

// Pre-configured rate limiters for different endpoints
export const aiRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 20, // 20 AI requests per minute (generous for small project)
  message: 'Too many AI requests. Please wait a moment before trying again.'
});

export const authRateLimiter = createRateLimiter({
  windowMs: 900000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
  message: 'Too many authentication attempts. Please try again later.'
});
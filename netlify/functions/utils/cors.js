// Simple CORS configuration for Netlify functions

// Allowed origins - add your production domain here
const ALLOWED_ORIGINS = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:8888', // Netlify dev
  'http://localhost:3000', // Common React dev port
  'https://goongpt.pro', // Production domain
  'https://goongpt.netlify.app', // Netlify subdomain
  'https://www.goongpt.pro' // WWW subdomain
];

export function getCorsHeaders(origin) {
  // For development, check if origin is in allowed list
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  // For production with custom domain, you might want to be more strict:
  // const allowedOrigin = origin === 'https://yourdomain.com' ? origin : null;
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

export function createCorsHandler(handler) {
  return async (event, context) => {
    const origin = event.headers.origin || event.headers.Origin;
    const corsHeaders = getCorsHeaders(origin);
    
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: ''
      };
    }
    
    try {
      // Call the actual handler
      const response = await handler(event, context);
      
      // Add CORS headers to response
      return {
        ...response,
        headers: {
          ...response.headers,
          ...corsHeaders
        }
      };
    } catch (error) {
      console.error('Handler error:', error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  };
}

// Helper function to apply CORS headers to a response object
export function applyCors(response) {
  // Get origin from current request (this would need to be passed in, but for now use production domain)
  const origin = 'https://goongpt.pro'; // Default to production domain
  const corsHeaders = getCorsHeaders(origin);
  
  // Merge CORS headers into response
  response.headers = {
    ...response.headers,
    ...corsHeaders
  };
}
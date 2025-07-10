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
  return async (requestObj, context) => {
    // Support both v1 (event) and v2 (req) request objects
    let origin, method;
    if (requestObj.headers && typeof requestObj.headers.get === 'function') {
      // Functions API v2 - req object
      origin = requestObj.headers.get('origin') || requestObj.headers.get('Origin');
      method = requestObj.method;
    } else {
      // Functions API v1 - event object
      origin = requestObj.headers.origin || requestObj.headers.Origin;
      method = requestObj.httpMethod;
    }
    
    const corsHeaders = getCorsHeaders(origin);
    
    // Handle preflight requests
    if (method === 'OPTIONS') {
      // Return appropriate format based on API version
      if (requestObj.headers && typeof requestObj.headers.get === 'function') {
        // v2 format
        return new Response('', {
          status: 200,
          headers: corsHeaders
        });
      } else {
        // v1 format
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: ''
        };
      }
    }
    
    try {
      // Call the actual handler
      const response = await handler(requestObj, context);
      
      // Handle response format based on what handler returns
      if (response instanceof Response) {
        // v2 Response object - add headers
        const newHeaders = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          newHeaders.set(key, value);
        });
        return new Response(response.body, {
          status: response.status,
          headers: newHeaders
        });
      } else {
        // v1 response object - merge headers
        return {
          ...response,
          headers: {
            ...response.headers,
            ...corsHeaders
          }
        };
      }
    } catch (error) {
      console.error('Handler error:', error);
      
      // Return error in appropriate format
      if (requestObj.headers && typeof requestObj.headers.get === 'function') {
        // v2 format
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: corsHeaders
        });
      } else {
        // v1 format
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Internal server error' })
        };
      }
    }
  };
}

// Helper function to apply CORS headers to a response object (v1 format)
export function applyCors(response, origin = 'https://goongpt.pro') {
  const corsHeaders = getCorsHeaders(origin);
  
  // Merge CORS headers into response
  response.headers = {
    ...response.headers,
    ...corsHeaders
  };
}

// Helper function to get CORS headers for v2 Response objects
export function getCorsHeadersForV2(origin = 'https://goongpt.pro') {
  return getCorsHeaders(origin);
}
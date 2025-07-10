// Simple authentication middleware for protected endpoints

import { getSessionByToken } from './database.js';

export async function requireAuth(event, context) {
  // Extract token from Authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer'
      },
      body: JSON.stringify({ error: 'Missing or invalid authorization header' })
    };
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (!token) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer'
      },
      body: JSON.stringify({ error: 'Missing authentication token' })
    };
  }
  
  try {
    // Verify token and get session
    const session = await getSessionByToken(context, token);
    
    if (!session) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer'
        },
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }
    
    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer'
        },
        body: JSON.stringify({ error: 'Token has expired' })
      };
    }
    
    // Return null to indicate success, along with user info
    return {
      success: true,
      userId: session.user_id,
      session: session
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Authentication error' })
    };
  }
}

// Wrapper to make endpoints require authentication
export function withAuth(handler) {
  return async (event, context) => {
    // Check authentication
    const authResult = await requireAuth(event, context);
    
    // If auth failed, return the error response
    if (authResult.statusCode) {
      return authResult;
    }
    
    // Add user info to event context
    event.userId = authResult.userId;
    event.session = authResult.session;
    
    // Call the actual handler
    return handler(event, context);
  };
}
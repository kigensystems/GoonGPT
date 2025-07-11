// Secure cookie management utilities for authentication
// Uses HTTP-only cookies to prevent XSS attacks

const COOKIE_NAME = 'goongpt_session';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Set a secure HTTP-only cookie
 * @param {string} token - The session token
 * @param {boolean} isProduction - Whether running in production
 * @returns {string} Cookie header string
 */
export function setSecureCookie(token, isProduction = process.env.NODE_ENV === 'production') {
  const cookieOptions = [
    `${COOKIE_NAME}=${token}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    'HttpOnly', // Prevents JavaScript access
    'SameSite=Strict', // CSRF protection
    'Path=/', // Available on all paths
  ];
  
  // Only add Secure flag in production (requires HTTPS)
  if (isProduction) {
    cookieOptions.push('Secure');
  }
  
  return cookieOptions.join('; ');
}

/**
 * Clear the session cookie
 * @param {boolean} isProduction - Whether running in production
 * @returns {string} Cookie header string to clear the cookie
 */
export function clearSecureCookie(isProduction = process.env.NODE_ENV === 'production') {
  const cookieOptions = [
    `${COOKIE_NAME}=`,
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Strict',
    'Path=/',
  ];
  
  if (isProduction) {
    cookieOptions.push('Secure');
  }
  
  return cookieOptions.join('; ');
}

/**
 * Extract session token from request cookies
 * @param {Object} request - The request object (event or req)
 * @returns {string|null} The session token or null if not found
 */
export function getSessionFromCookies(request) {
  try {
    let cookieHeader;
    
    // Handle different request formats (Netlify Functions v1 vs v2)
    if (request.headers && typeof request.headers.get === 'function') {
      // Functions API v2 - req object with Headers interface
      cookieHeader = request.headers.get('cookie');
    } else if (request.headers && request.headers.cookie) {
      // Functions API v1 - event object with plain headers
      cookieHeader = request.headers.cookie;
    }
    
    if (!cookieHeader) {
      return null;
    }
    
    // Parse cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {});
    
    return cookies[COOKIE_NAME] || null;
  } catch (error) {
    console.error('Error parsing cookies:', error);
    return null;
  }
}

/**
 * Validate and get user session from cookie
 * @param {Object} request - The request object
 * @returns {Object|null} Session data or null if invalid
 */
export async function validateSessionFromCookies(request) {
  try {
    const token = getSessionFromCookies(request);
    
    if (!token) {
      return null;
    }
    
    // Import here to avoid circular dependency
    const { getSession } = await import('./supabase.js');
    const session = await getSession(token);
    
    return session;
  } catch (error) {
    console.error('Error validating session from cookies:', error);
    return null;
  }
}

/**
 * Create response headers with secure cookie
 * @param {string} token - The session token
 * @param {Object} additionalHeaders - Additional headers to merge
 * @returns {Object} Headers object
 */
export function createResponseWithCookie(token, additionalHeaders = {}) {
  return {
    'Set-Cookie': setSecureCookie(token),
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
}

/**
 * Create response headers to clear cookie
 * @param {Object} additionalHeaders - Additional headers to merge
 * @returns {Object} Headers object
 */
export function createResponseWithClearCookie(additionalHeaders = {}) {
  return {
    'Set-Cookie': clearSecureCookie(),
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
}
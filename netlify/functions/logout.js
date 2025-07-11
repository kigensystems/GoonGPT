// Logout function that clears the secure HTTP-only cookie
import { getSessionFromCookies, createResponseWithClearCookie } from './utils/cookies.js';
import { deleteSession } from './utils/supabase.js';

export default async function handler(req) {
  console.log('🔍 LOGOUT: Function started');
  
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get the session token from cookies
    const token = getSessionFromCookies(req);
    
    if (token) {
      // Delete the session from the database
      try {
        await deleteSession(token);
        console.log('✅ LOGOUT: Session deleted from database');
      } catch (error) {
        console.error('❌ LOGOUT: Error deleting session:', error);
        // Continue with logout even if DB deletion fails
      }
    }

    // Clear the cookie and return success
    console.log('✅ LOGOUT: Clearing cookie and returning success');
    return new Response(JSON.stringify({
      success: true,
      message: 'Logged out successfully'
    }), {
      status: 200,
      headers: createResponseWithClearCookie()
    });

  } catch (error) {
    console.error('❌ LOGOUT: Error during logout:', error);
    
    // Even if there's an error, clear the cookie
    return new Response(JSON.stringify({
      success: true,
      message: 'Logged out successfully'
    }), {
      status: 200,
      headers: createResponseWithClearCookie()
    });
  }
}
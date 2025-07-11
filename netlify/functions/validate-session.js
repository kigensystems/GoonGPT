// Session validation endpoint using secure HTTP-only cookies
import { validateSessionFromCookies } from './utils/cookies.js';
import { getUserById } from './utils/supabase.js';

export default async function handler(req) {
  console.log('🔍 VALIDATE-SESSION: Function started');
  
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Validate session from cookies
    const session = await validateSessionFromCookies(req);
    
    if (!session) {
      console.log('🔍 VALIDATE-SESSION: No valid session found');
      return new Response(JSON.stringify({
        authenticated: false,
        user: null
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get fresh user data
    const user = await getUserById(session.user_id);
    
    if (!user) {
      console.log('❌ VALIDATE-SESSION: Session valid but user not found');
      return new Response(JSON.stringify({
        authenticated: false,
        user: null
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ VALIDATE-SESSION: Valid session found for user:', user.id);
    return new Response(JSON.stringify({
      authenticated: true,
      user,
      expires_at: session.expires_at
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ VALIDATE-SESSION: Error validating session:', error);
    return new Response(JSON.stringify({
      authenticated: false,
      user: null,
      error: 'Session validation failed'
    }), {
      status: 200, // Return 200 to avoid breaking the app
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
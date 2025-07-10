import crypto from 'crypto';
import { getUserByWallet, getUserByUsername, createUser, createSession } from './utils/supabase.js';

export default async function handler(req, context) {
  console.log('🔍 REGISTER-USER: Function started');
  console.log('🔍 REGISTER-USER: Request method:', req.method);
  
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('🔍 REGISTER-USER: Parsing request body...');
    const { wallet_address, username, email, profile_picture } = await req.json();
    console.log('🔍 REGISTER-USER: Request data:', { wallet_address, username, email: !!email });

    if (!wallet_address || !username) {
      return new Response(JSON.stringify({ error: 'Wallet address and username are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate username (alphanumeric, underscores, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return new Response(JSON.stringify({ 
        error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(JSON.stringify({ error: 'Invalid email format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Check if username already exists
    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return new Response(JSON.stringify({ error: 'Username already taken' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if wallet already registered
    const existingWallet = await getUserByWallet(wallet_address);
    if (existingWallet) {
      return new Response(JSON.stringify({ error: 'Wallet already registered' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create user
    const user = await createUser({
      wallet_address,
      username,
      email: email || null,
      profile_picture: profile_picture || null
    });

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const session = await createSession(user.id, token);

    return new Response(JSON.stringify({
      user,
      token,
      expires_at: session.expires_at
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ REGISTER-USER: Registration error:', error);
    console.error('❌ REGISTER-USER: Error name:', error.name);
    console.error('❌ REGISTER-USER: Error message:', error.message);
    console.error('❌ REGISTER-USER: Error stack:', error.stack);
    return new Response(JSON.stringify({ error: 'Registration failed', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
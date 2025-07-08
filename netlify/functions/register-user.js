import crypto from 'crypto';
import { getUserByWallet, getUserByUsername, createUser, createSession } from './utils/database.js';

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { wallet_address, username, email, profile_picture } = JSON.parse(event.body);

    if (!wallet_address || !username) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Wallet address and username are required' })
      };
    }

    // Validate username (alphanumeric, underscores, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' 
        })
      };
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid email format' })
        };
      }
    }

    // Check if username already exists
    const existingUsername = await getUserByUsername(context, username);
    if (existingUsername) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'Username already taken' })
      };
    }

    // Check if wallet already registered
    const existingWallet = await getUserByWallet(context, wallet_address);
    if (existingWallet) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'Wallet already registered' })
      };
    }

    // Create user
    const user = await createUser(context, {
      wallet_address,
      username,
      email: email || null,
      profile_picture: profile_picture || null
    });

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const session = await createSession(context, user.id, token);

    return {
      statusCode: 201,
      body: JSON.stringify({
        user,
        token,
        expires_at: session.expires_at
      })
    };

  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Registration failed' })
    };
  }
}
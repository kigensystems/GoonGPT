import { getSession, getUserByUsername, updateUser } from './utils/supabase.js';

export default async function handler(req, context) {
  if (req.method !== 'PUT') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'No authorization token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify session
    const session = await getSession(token);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { username, email, profile_picture } = await req.json();
    const updates = {};

    // Validate and add updates
    if (username !== undefined) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return new Response(JSON.stringify({ 
          error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check if username already taken by another user
      const existingUser = await getUserByUsername(username);
      if (existingUser && existingUser.id !== session.user_id) {
        return new Response(JSON.stringify({ error: 'Username already taken' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      updates.username = username;
    }

    if (email !== undefined) {
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return new Response(JSON.stringify({ error: 'Invalid email format' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      updates.email = email || null;
    }

    if (profile_picture !== undefined) {
      updates.profile_picture = profile_picture || null;
    }

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update user
    const updatedUser = await updateUser(session.user_id, updates);

    return new Response(JSON.stringify({ user: updatedUser }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
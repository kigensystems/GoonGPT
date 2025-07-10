import { getSession, getUserByUsername, updateUser } from './utils/database.js';

export default async function handler(req, context) {
  if (req.method !== 'PUT') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'No authorization token provided' })
      };
    }

    // Verify session
    const session = await getSession(token);
    if (!session) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid or expired session' })
      };
    }

    const { username, email, profile_picture } = await req.json();
    const updates = {};

    // Validate and add updates
    if (username !== undefined) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' 
          })
        };
      }

      // Check if username already taken by another user
      const existingUser = await getUserByUsername(username);
      if (existingUser && existingUser.id !== session.user_id) {
        return {
          statusCode: 409,
          body: JSON.stringify({ error: 'Username already taken' })
        };
      }

      updates.username = username;
    }

    if (email !== undefined) {
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid email format' })
          };
        }
      }
      updates.email = email || null;
    }

    if (profile_picture !== undefined) {
      updates.profile_picture = profile_picture || null;
    }

    if (Object.keys(updates).length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No fields to update' })
      };
    }

    // Update user
    const updatedUser = await updateUser(session.user_id, updates);

    return {
      statusCode: 200,
      body: JSON.stringify({ user: updatedUser })
    };

  } catch (error) {
    console.error('Update profile error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update profile' })
    };
  }
}
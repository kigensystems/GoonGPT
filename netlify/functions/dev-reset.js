import { resetDevStorage } from './utils/database.js';

export async function handler(event, context) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production' || process.env.NETLIFY) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Only available in development' })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    resetDevStorage();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Development storage cleared' })
    };
  } catch (error) {
    console.error('Reset error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Reset failed' })
    };
  }
}
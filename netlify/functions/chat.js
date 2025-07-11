// Netlify Function: Chat completions endpoint
// Uses ModelsLab API for LLM chat completions

import { chatRateLimiter } from './utils/rateLimiter.js';
import { validateChatInput } from './utils/validation.js';

export async function handler(event) {
  // Apply rate limiting
  const rateLimitResponse = await chatRateLimiter(event);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  // Check for required environment variables
  console.log('Environment check:', {
    hasKey: !!process.env.MODELSLAB_API_KEY,
    keyLength: process.env.MODELSLAB_API_KEY?.length,
    nodeEnv: process.env.NODE_ENV
  });
  
  if (!process.env.MODELSLAB_API_KEY) {
    console.error('MODELSLAB_API_KEY is not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Get CORS headers based on origin
  const origin = event.headers.origin || event.headers.Origin;
  const headers = {
    'Access-Control-Allow-Origin': origin || 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { messages, model = 'ModelsLab/Llama-3.1-8b-Uncensored-Dare', temperature = 0.7, max_tokens = 1000, stream = false } = JSON.parse(event.body);
    
    // Validate input
    const validation = validateChatInput(messages);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: validation.error }),
      };
    }

    console.log('Chat completion request:', { model, temperature, max_tokens, messageCount: messages.length });

    // ModelsLab API call for chat completions (OpenAI-compatible endpoint)
    const requestBody = {
      model: model || 'ModelsLab/Llama-3.1-8b-Uncensored-Dare',
      messages: messages,
      temperature: temperature,
      max_tokens: max_tokens,
      stream: stream
    };

    const response = await fetch('https://modelslab.com/api/uncensored-chat/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MODELSLAB_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ModelsLab API error:', errorData);
      throw new Error(`ModelsLab API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));
    
    // Handle error response
    if (result.status === 'error') {
      const errorMsg = typeof result.message === 'object' 
        ? JSON.stringify(result.message) 
        : result.message || 'Chat completion failed';
      throw new Error(errorMsg);
    }
    
    // Handle OpenAI-compatible response format
    if (result.choices && result.choices.length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          choices: result.choices,
          usage: result.usage || {},
          model: result.model || model
        }),
      };
    }
    
    // Handle unexpected response format
    throw new Error('Unexpected response format from ModelsLab API');

  } catch (error) {
    console.error('Chat API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate chat completion',
        details: error.message 
      }),
    };
  }
}
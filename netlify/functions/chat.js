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
    const { messages, model = 'ModelsLab/Llama-3.1-8b-Uncensored-Dare', temperature = 0.4, max_tokens = 180, stream = true } = JSON.parse(event.body);
    
    // Validate input
    const validation = validateChatInput(messages);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: validation.error }),
      };
    }


    // ModelsLab API call for chat completions (OpenAI-compatible endpoint)
    const requestBody = {
      model: model || 'ModelsLab/Llama-3.1-8b-Uncensored-Dare',
      messages: messages,
      temperature: temperature,
      max_tokens: max_tokens,
      repetition_penalty: 1.1,
      top_p: 0.92,
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
      console.error('ModelsLab API error:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData
      });
      throw new Error(`ModelsLab API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
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
    console.error('Chat API error:', {
      errorType: error.constructor.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Check if it's a timeout error
    const isTimeout = error.message?.toLowerCase().includes('timeout') || 
                     error.message?.toLowerCase().includes('timedout') ||
                     error.code === 'ETIMEDOUT' ||
                     error.code === 'ECONNABORTED';
    
    return {
      statusCode: isTimeout ? 504 : 500,
      headers,
      body: JSON.stringify({ 
        error: isTimeout 
          ? 'The AI service is taking too long to respond. Please try again.'
          : 'Failed to generate chat completion',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
}
// Netlify Function: Image generation endpoint
// Proxies requests to Venice.AI image generation API

export async function handler(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
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
    const { prompt, size = '1024x1024', n = 1 } = JSON.parse(event.body);
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }
    
    // Venice.AI native Image API endpoint
    const response = await fetch('https://api.venice.ai/api/v1/image/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'flux-dev-uncensored',
        prompt: prompt,
        width: parseInt(size.split('x')[0]) || 1024,
        height: parseInt(size.split('x')[1]) || 1024,
        steps: 25,
        cfg_scale: 7.5,
        safe_mode: false,
        return_binary: false,
        hide_watermark: false
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Venice Image API error:', data);
      throw new Error(data.error?.message || 'Venice Image API error');
    }

    // Convert Venice.AI response format to OpenAI-compatible format for frontend
    const formattedResponse = {
      data: data.images ? data.images.map(base64Image => ({
        url: `data:image/png;base64,${base64Image}`
      })) : []
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(formattedResponse),
    };
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate image',
        details: error.message 
      }),
    };
  }
}
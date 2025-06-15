// Netlify Function: Image generation endpoint
// Proxies requests to FLUX.1dev uncensored MSFLUX NSFW v3 model

export async function handler(event) {
  // Check for required environment variables
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('REPLICATE_API_TOKEN is not set');
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
    const { prompt, width = 1024, height = 1024, steps = 20, cfg_scale = 5, seed = -1, scheduler = 'Euler flux beta' } = JSON.parse(event.body);
    
    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    console.log('Generating image with prompt:', prompt);
    console.log('API Token exists:', !!process.env.REPLICATE_API_TOKEN);

    // Get the latest version of the uncensored FLUX model
    const modelResponse = await fetch('https://api.replicate.com/v1/models/aisha-ai-official/flux.1dev-uncensored-msfluxnsfw-v3', {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    });
    
    if (!modelResponse.ok) {
      throw new Error(`Failed to get model info: ${modelResponse.status}`);
    }
    
    const modelData = await modelResponse.json();
    const latestVersion = modelData.latest_version.id;
    
    console.log('Found latest version:', latestVersion);

    // Replicate API call for FLUX.1dev uncensored model
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: latestVersion,
        input: {
          prompt: prompt,
          width: width,
          height: height,
          steps: steps,
          cfg_scale: cfg_scale,
          seed: seed,
          scheduler: scheduler
        },
        // Uncomment to use webhook (requires endpoint setup)
        // webhook: "https://your-domain.com/.netlify/functions/image-webhook",
        // webhook_events_filter: ["completed"]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Replicate API error:', errorData);
      throw new Error(errorData.detail || 'Replicate API error');
    }

    const prediction = await response.json();
    
    // For cold starts, return immediately with prediction ID
    // Let the frontend handle polling
    if (prediction.status === 'starting') {
      console.log('Model is cold, returning prediction ID for frontend polling');
      return {
        statusCode: 202, // Accepted
        headers,
        body: JSON.stringify({
          status: 'processing',
          predictionId: prediction.id,
          message: 'Model is starting up, this may take 30-60 seconds'
        }),
      };
    }
    
    // Poll for completion with better error handling
    let result = prediction;
    let pollCount = 0;
    const maxPolls = 10; // 20 seconds max to stay under Netlify limit
    
    while ((result.status === 'starting' || result.status === 'processing') && pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      pollCount++;
      
      // Log cold start info for first few polls
      if (pollCount <= 5 && result.status === 'starting') {
        console.log(`Model is cold starting... this may take 30-60 seconds (${pollCount}/${maxPolls})`);
      } else {
        console.log(`Polling ${pollCount}/${maxPolls}, status: ${result.status}`);
      }
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });
      
      if (!pollResponse.ok) {
        console.error(`Poll request failed: ${pollResponse.status}`);
        continue;
      }
      
      result = await pollResponse.json();
      console.log(`Poll result: ${result.status}`, result.logs ? `Logs: ${result.logs}` : '');
      
      if (result.status === 'failed' || result.status === 'canceled') {
        break;
      }
    }
    
    if (pollCount >= maxPolls) {
      throw new Error('Image generation timeout - model taking too long');
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Image generation failed');
    }

    // Return the image URL
    const imageUrl = result.output && result.output[0];
    
    if (!imageUrl) {
      throw new Error('No image generated');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        imageUrl: imageUrl,
        prompt: prompt
      }),
    };
  } catch (error) {
    console.error('Image API error:', error);
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
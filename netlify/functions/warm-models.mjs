// Netlify Function: Keep models warm
// This function should be called periodically (e.g., every 5 minutes via cron)

export async function handler(event) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Only allow authorized requests (add your own auth check)
  const authToken = event.headers.authorization;
  if (authToken !== `Bearer ${process.env.WARM_SECRET}`) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    const modelsToWarm = [
      {
        name: 'flux-uncensored',
        model: 'aisha-ai-official/flux.1dev-uncensored-msfluxnsfw-v3',
        input: {
          prompt: 'warmup test',
          width: 512,
          height: 512,
          steps: 1, // Minimal steps for warmup
          cfg_scale: 1,
          seed: 42,
          scheduler: 'Euler flux beta'
        }
      },
      {
        name: 'dolphin-chat',
        model: 'mikeei/dolphin-2.9.1-llama3-8b-gguf',
        version: 'd074e3e36af3e7f7a84cc566071e4c080c1935a8d791cdd91ae23dc99b8edd52',
        input: {
          prompt: 'warmup',
          system_prompt: 'warmup',
          prompt_template: '<|im_start|>system\n{system_prompt}<|im_end|>\n<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant',
          max_new_tokens: 1,
          temperature: 0.1,
          repeat_penalty: 1.0
        }
      }
    ];

    const results = [];

    for (const model of modelsToWarm) {
      try {
        console.log(`Warming up ${model.name}...`);
        
        // Get latest version if not specified
        let version = model.version;
        if (!version && model.model) {
          const modelResponse = await fetch(`https://api.replicate.com/v1/models/${model.model}`, {
            headers: {
              'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            },
          });
          
          if (modelResponse.ok) {
            const modelData = await modelResponse.json();
            version = modelData.latest_version.id;
          }
        }

        // Create prediction
        const response = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: version,
            input: model.input
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create prediction: ${response.status}`);
        }

        const prediction = await response.json();
        
        // Don't wait for completion - just trigger the model
        results.push({
          model: model.name,
          status: 'warming',
          predictionId: prediction.id
        });

        // Optional: Cancel the prediction after a few seconds to save costs
        setTimeout(async () => {
          try {
            await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}/cancel`, {
              method: 'POST',
              headers: {
                'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
              },
            });
            console.log(`Cancelled warmup prediction ${prediction.id} for ${model.name}`);
          } catch (e) {
            console.log(`Failed to cancel warmup prediction: ${e.message}`);
          }
        }, 5000); // Cancel after 5 seconds

      } catch (error) {
        console.error(`Failed to warm ${model.name}:`, error);
        results.push({
          model: model.name,
          status: 'error',
          error: error.message
        });
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        warmed: results,
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('Warm models error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to warm models',
        details: error.message 
      }),
    };
  }
}
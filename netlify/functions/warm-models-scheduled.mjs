// Netlify Scheduled Function: Automatically keep models warm
// Runs every 5 minutes

export async function handler(event) {
  // This function is triggered by Netlify's scheduler
  console.log('Running scheduled model warming...');

  try {
    // Call the warm-models function
    const response = await fetch(`${process.env.URL}/.netlify/functions/warm-models`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WARM_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Warm models failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Models warmed:', result);

    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error('Scheduled warming failed:', error);
    // Don't throw - we don't want to stop future runs
    return {
      statusCode: 200,
    };
  }
}

// Netlify scheduled function configuration
export const config = {
  schedule: "*/5 * * * *" // Run every 5 minutes
};
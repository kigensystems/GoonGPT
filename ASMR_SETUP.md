# ASMR Voice Setup Instructions

## Step 1: Upload Voice to ModelsLab

Run the voice upload script to get your voice_id:

```bash
# Make sure you have your API key in environment
export MODELSLAB_API_KEY="your_api_key_here"

# Run the upload script
node upload-voice.js
```

**OR** if you want to specify your deployed domain:
```bash
export MODELSLAB_API_KEY="your_api_key_here"
export NETLIFY_URL="https://your-actual-domain.netlify.app"
node upload-voice.js
```

## Step 2: Set Environment Variable

After running the script, you'll get a `voice_id`. Add it to your Netlify environment variables:

1. Go to your Netlify dashboard
2. Navigate to Site settings > Environment variables
3. Add new variable:
   - **Key**: `ASMR_VOICE_ID`
   - **Value**: The voice_id returned from the upload script

## Step 3: Deploy

After setting the environment variable, redeploy your site for the changes to take effect.

## Step 4: Test

Try the ASMR feature - it should now use your custom uploaded voice instead of the hardcoded one.

## Troubleshooting

- **500 Error "ASMR voice not configured"**: The `ASMR_VOICE_ID` environment variable is not set
- **500 Error "Server configuration error"**: The `MODELSLAB_API_KEY` environment variable is not set
- **Upload fails**: Make sure your deployed site is accessible and the audio file exists at `/asmr/asmr_combined.wav`

## Files Modified

- `netlify/functions/asmr.js` - Updated to use environment variable
- `upload-voice.js` - One-time utility script for voice upload
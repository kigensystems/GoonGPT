# Deployment Checklist for XposedAI

## Before Deploying to Netlify:

### 1. Environment Variables
Add these in Netlify Dashboard > Site Settings > Environment Variables:
- [ ] `REPLICATE_API_TOKEN` - Your Replicate API token
- [ ] `WARM_SECRET` - A random string for warming endpoint security (e.g., use `openssl rand -hex 32`)
- [ ] `URL` - Will be auto-set by Netlify (your site URL)

### 2. Test Locally First
```bash
# Create .env.local file with your tokens
cp .env.example .env.local
# Edit .env.local with your actual tokens

# Run locally
npm run dev
netlify dev  # For testing functions locally
```

### 3. Image Generation Testing
- Test with simple prompt first: "a red cube"
- Check browser console for any CORS errors
- Verify image URLs load properly (not blocked by CORS)

### 4. Common Issues & Solutions:

**Issue: "Server configuration error"**
- Solution: Add REPLICATE_API_TOKEN to Netlify environment variables

**Issue: Model timeout**
- Solution: Model is cold, wait 30-60 seconds for first request
- The warmer functions will keep it warm after deployment

**Issue: Images not displaying**
- Solution: Check if Replicate URLs are accessible (they expire after 24 hours)
- Consider proxying images through your own CDN for permanent storage

**Issue: CORS errors**
- Solution: Already handled in functions, but check browser console

### 5. Post-Deployment:
1. Test image generation with various prompts
2. Monitor Netlify Functions logs for errors
3. Check if scheduled warmer is running (every 5 minutes)
4. Verify both chat and image generation work

### 6. Cost Monitoring:
- Replicate charges per prediction
- Warming functions use minimal resources but still cost
- Monitor usage in Replicate dashboard
- Consider disabling warmers if costs are high

### 7. Security:
- Never expose REPLICATE_API_TOKEN in frontend code
- Keep WARM_SECRET secure
- All API calls go through Netlify Functions (serverless)

## Quick Test Commands:
```bash
# Test image generation
curl -X POST https://your-site.netlify.app/.netlify/functions/image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test image", "width": 512, "height": 512}'

# Test chat
curl -X POST https://your-site.netlify.app/.netlify/functions/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "hello"}]}'
```
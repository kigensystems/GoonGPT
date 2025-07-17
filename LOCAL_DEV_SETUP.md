# Local Development Setup Guide

## Quick Start

1. **Copy environment variables from Netlify**:
   - Go to https://app.netlify.com/sites/goongpt/configuration/env
   - Copy each environment variable value
   - Paste into `.env.local` file

2. **Start the local development server**:
   ```bash
   netlify dev
   ```
   This will:
   - Start Vite dev server on port 5173
   - Start Netlify Functions on port 8888
   - Proxy everything together

3. **Access your app**:
   - Open http://localhost:8888
   - All changes update instantly!

## What Works Locally

✅ **Frontend** - Hot reload, instant updates
✅ **Netlify Functions** - Full backend API
✅ **Environment Variables** - Loaded from .env.local
✅ **Database/Auth** - Connects to real Supabase

## Testing Workflow

1. Make changes to any file
2. Save the file
3. See changes instantly in browser
4. No deploy needed!

## Debugging

- **Frontend logs**: Browser console
- **Backend logs**: Terminal where `netlify dev` is running
- **Network requests**: Browser DevTools Network tab

## Common Issues

### Port already in use
```bash
# Kill processes on port 8888
lsof -ti:8888 | xargs kill -9
```

### Environment variables not loading
- Make sure `.env.local` is in root directory
- Restart `netlify dev` after changing env vars

### Function not found
- Functions must be in `netlify/functions/`
- Restart `netlify dev` after adding new functions

## Tips

- Use `console.log()` liberally - logs show in terminal
- Browser DevTools are your friend
- Changes to functions may need restart
- Frontend changes are instant

## Stop/Start

- **Stop**: Ctrl+C in terminal
- **Start**: `netlify dev`

Now you can test everything locally without waiting for deploys! 🚀
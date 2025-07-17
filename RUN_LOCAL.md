# 🚀 Quick Local Development

## Option 1: Direct Vite (Recommended for Frontend Work)

```bash
npm run dev
```
- Open http://localhost:5173
- Frontend hot reloads instantly
- Functions won't work (but you can test against production API)

## Option 2: Netlify Dev (For Testing Functions)

```bash
netlify dev
```
- Open http://localhost:8888
- Both frontend AND functions work
- Slightly slower hot reload

## Option 3: Two Terminal Approach (Best of Both)

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
netlify functions:serve
```

Then:
- Frontend: http://localhost:5173
- Functions: http://localhost:9999
- Update imageClient.ts to use localhost:9999 for local testing

## Which Should I Use?

- **Just testing UI/frontend?** → Use Option 1
- **Need to test image generation?** → Use Option 2
- **Heavy development?** → Use Option 3

## Common Issues

### Blank page on 8888?
- Normal if Netlify Dev has issues with Vite
- Just use http://localhost:5173 instead

### MIME type errors?
- Vite/Netlify Dev conflict
- Use Option 1 or 3 instead

### Functions not working?
- Check .env.local has all keys
- Make sure you're using the right port
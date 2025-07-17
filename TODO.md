## Current Issues 🔴

### Image Generation Issues
- [ ] **Images not displaying** - Broken image icon showing despite successful generation
  - API returns image URLs correctly
  - Possible CORS or R2 bucket access issue
  - Need to check browser DevTools for specific error
- [ ] **Model configuration issues** - Multiple model changes without stability
  - Started with pyros-nsfw-sdxl
  - Changed to fluxdev  
  - Changed to wai-nsfw-illustrious-sdxl
  - Duplicate negative_prompt in request body
  - Need to settle on best performing model

### Local Development Issues
- [ ] **Netlify Dev not working properly** - MIME type errors on port 8888
  - Vite/Netlify Dev conflict
  - Currently using production API for local development
  - Need proper local function testing setup

## Today's Completed Work ✅

### Image Generation Improvements
- [x] **Fixed image generation API** - Removed test block that was preventing real calls
- [x] **Implemented async image generation with polling**
  - Created image-fetch.js for checking generation status
  - Added pollForImage() method with retry logic
  - Handles both instant and queued generations
- [x] **Added visual ETA countdown** 
  - Shows "ETA: 25s" countdown during generation
  - Minimum 2 second display time for UX
  - No emojis, clean professional display
- [x] **Fixed ETA countdown not displaying**
  - Backend now always returns processing status to trigger countdown
  - Frontend handles immediate URLs with countdown display
  - Consistent visual feedback for all generations
- [x] **Fixed processing status with immediate URLs**
  - API sometimes returns "processing" but includes the URL
  - Now detects and uses URL immediately when available
- [x] **Added comprehensive logging** for debugging
  - Backend logs all requests/responses
  - Frontend logs image loading success/failure
  - Helps identify model behavior

### Model Testing
- [x] **Tested multiple models**:
  - fluxdev with uncensored-flux-lora
  - pyros-nsfw-sdxl with multi-lora (add_detail + orgasm_face)
  - wai-nsfw-illustrious-sdxl (current)
- [x] **Improved prompt mappings** - Enhanced NSFW prompts for better results

### Local Development Setup
- [x] **Created local dev environment**
  - .env.local for API keys
  - Updated all clients to use production API in dev mode
  - Works with `npm run dev` on port 5173
  - No need to wait for deploys anymore!

## Next Priority Tasks 🎯

1. **Fix broken image display**
   - Check browser console for specific error
   - May need to proxy images through Netlify
   - Or fix R2 bucket CORS settings

2. **Stabilize model selection**
   - Test and compare model outputs
   - Choose best performing model
   - Clean up request body parameters

3. **Fix local Netlify Dev** (optional)
   - Resolve MIME type issues
   - Enable local function testing
   - Or document workaround properly

## Previous Completed Work

### Architectural Consolidation ✅
- [x] **UnifiedContainer Architecture** - 88% code reduction
- [x] **Migrated all containers** to unified pattern
- [x] **Bundle size reduced** by 26kB

### UI/UX Improvements ✅
- [x] **Fixed UI inconsistencies** across all modes
- [x] **Added suggestion pills** for all modes
- [x] **Fixed double-click issues**
- [x] **Implemented cancel for video mode**

### Code Quality ✅
- [x] **Removed ~1,500 lines** of unused code
- [x] **Maintained TypeScript compliance**
- [x] **All builds passing**

## Known Security Issues (Still Pending) 🚨

### Backend Security
- [ ] **Remove API key from logs** - Currently exposed in console.logs
- [ ] **Fix error detail exposure** in production
- [ ] **Add SQL injection prevention**
- [ ] **Fix CORS headers** - Don't use request origin directly
- [ ] **Add request size limits**

### Frontend Security  
- [ ] **Fix ID collision risk** - Use proper UUID generation
- [ ] **Add HTML sanitization** for XSS prevention
- [ ] **Fix race conditions** in state updates

## Development Standards
- [x] CLAUDE.md compliance maintained
- [x] All changes tested before commit
- [x] TypeScript errors fixed immediately
- [x] Comprehensive commit messages
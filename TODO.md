## Current Issues 🔴



## Today's Completed Work ✅

### Rate Limiting Fix
- [x] **Fixed severe token fetching rate limiting (429 errors)**
  - Reduced polling intervals from 2s/5s to 30s across all components
  - Added visibility detection to pause polling when tab is hidden
  - Implemented exponential backoff for 429 responses
  - UserDropdown now only polls when dropdown is open
  - Reduced request rate from 44/min to 6/min (well under 36/min limit)
- [x] **Fixed duplicate token fetching on page load**
  - Created TokenDataContext to share data between components
  - Prevents multiple simultaneous requests on initial page load
  - Added 5-second cooldown between fetches
  - All components now share a single data source
  - Maintains backward compatibility with localStorage fallback

### UI/UX Updates
- [x] **Implemented Anime/Realism toggle for image generation**
  - Created ImageInput component with dropdown selector
  - Anime mode uses wai-nsfw-illustrious-sdxl model (1024x1024)
  - Realism mode uses fluxdev with Photorealistic-NSFW-flux LoRA (1280x720)
  - Integrated toggle throughout UI with proper state management
- [x] **Updated pricing page**
  - Changed from SOL to USD pricing ($50 Standard, $100 Premium)
  - Added launch announcement banner (7/21 with 5000 credit bonus)
  - Changed buttons to "Coming Soon" state
  - Updated FAQ with payment options (BTC, ETH, SOL, USDC)

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
  - fluxdev with Photorealistic-NSFW-flux LoRA (for realism mode)
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
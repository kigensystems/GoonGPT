# GoonGPT Deployment Checklist & Progress Notes

## 🎯 Current Feature Status

### ✅ Completed Features

#### 1. **Chat Mode**
- Uncensored LLM chat using ModelsLab API
- Model: `ModelsLab/Llama-3.1-8b-Uncensored-Dare`
- Hidden prompt mappings for enhanced responses
- Rate limiting implemented

#### 2. **Image Generation**
- Text-to-image using ModelsLab Stable Diffusion
- 512x512 resolution default
- Hidden prompt mappings for better NSFW results
- Safety checker disabled

#### 3. **Video Generation**
- Image-to-video generation
- Requires image upload + text prompt
- Quality settings: quick/standard/high
- Duration control (frames)

#### 4. **ASMR Mode** *(Latest Addition)*
- Text-to-audio with custom whisper voice
- **Voice Setup:**
  - Uploaded voice file: `/public/asmr/asmr_combined.wav`
  - Voice ID: `asmrfemale`
  - Language: English
  - Gender: Female
- **API Details:**
  - Endpoint: `https://modelslab.com/api/v6/voice/text_to_audio`
  - Handles "processing" status (audio ready in ~5 seconds)
  - Returns `future_links` URL for delayed audio access
- **Environment Variable Required:**
  - `ASMR_VOICE_ID=asmrfemale`

#### 5. **DeepFake Mode**
- Currently disabled with placeholder message
- UI complete but backend intentionally disabled

### 📝 Environment Variables Required

```bash
# ModelsLab API Key (Required for all features)
MODELSLAB_API_KEY=your_api_key_here

# ASMR Voice ID (Required for ASMR mode)
ASMR_VOICE_ID=asmrfemale
```

### 🔧 Hidden Prompt Mappings

Located in `/src/promptMappings.ts`:
- **Chat mappings**: Lines 4-12
- **Image mappings**: Lines 14-24  
- **ASMR mappings**: Lines 26-34

### 🚀 Deployment Steps

1. **Set Environment Variables in Netlify:**
   - Go to Site settings > Environment variables
   - Add `MODELSLAB_API_KEY`
   - Add `ASMR_VOICE_ID` with value `asmrfemale`

2. **Build & Deploy:**
   ```bash
   npm run build
   # Push to GitHub - Netlify auto-deploys from main branch
   ```

3. **Verify Features:**
   - [ ] Chat mode responds with uncensored content
   - [ ] Image generation creates NSFW images
   - [ ] Video generation processes uploaded images
   - [ ] ASMR mode generates whisper audio
   - [ ] DeepFake shows disabled message

### 🐛 Known Issues & Solutions

#### ASMR Audio Processing
- **Issue**: API returns "processing" status, not immediate audio
- **Solution**: Function now handles processing status and returns future_links URL
- **User Experience**: Audio available after ~5 seconds at the provided URL

#### Voice Upload
- **Voice must be uploaded once** using the voice upload endpoint
- **Voice ID format**: Simple alphanumeric, no special characters
- **The API uses your uploaded audio** even when using voice_id

### 📂 Key Files

- **Frontend Components:**
  - `/src/components/AsmrContainer.tsx` - Main ASMR UI
  - `/src/components/AsmrInput.tsx` - Text input with 500 char limit
  - `/src/components/AsmrMessage.tsx` - Audio player component

- **Backend Functions:**
  - `/netlify/functions/asmr.js` - ASMR API endpoint
  - `/netlify/functions/chat.js` - Chat endpoint
  - `/netlify/functions/generateImage.js` - Image generation
  - `/netlify/functions/generateVideo.js` - Video generation

- **Utilities:**
  - `/src/utils/asmrClient.ts` - Frontend ASMR API client
  - `/src/promptMappings.ts` - Hidden prompt enhancements

### 🔍 Testing Commands

```bash
# Local development
npm run dev

# Build check
npm run build

# Test ASMR voice (requires API key)
export MODELSLAB_API_KEY="your_key"
node test-voice-comparison.js
```

### 📊 Mode Order
1. Chat
2. Image  
3. Video
4. ASMR
5. DeepFake

### 🎨 UI/UX Notes
- Dark theme with red accent color
- ChatGPT-like interface
- Mode toggle in header and chat interface
- Preset buttons for quick prompts
- Multi-line textarea for ASMR (single line for others)

### 🔐 Security Notes
- API keys stored in environment variables only
- CORS configured for production domain
- Rate limiting on chat endpoint
- No content filtering (intentionally uncensored)

---

*Last Updated: January 2025*
*ASMR Feature: Successfully implemented with custom voice upload*
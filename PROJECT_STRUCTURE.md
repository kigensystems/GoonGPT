# GoonGPT Project Structure

```
GoonGPT/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   │   ├── AppHeader.tsx         # Main navigation header
│   │   ├── UnifiedContainer.tsx  # Main chat/content container with suggestion pills
│   │   ├── EmptyState.tsx        # Empty state with suggestion pills
│   │   ├── WelcomeScreen.tsx     # Landing page with mode selection
│   │   ├── ChatInput.tsx         # Chat mode input component
│   │   ├── ImageInput.tsx        # Image mode input with style selector
│   │   ├── VideoInput.tsx        # Video mode input with quality/duration
│   │   ├── DeepFakeInput.tsx     # Deepfake dual image upload
│   │   ├── MessageList.tsx       # Displays all messages
│   │   ├── ChatMessage.tsx       # Individual message component
│   │   ├── ImageMessage.tsx      # Image result display
│   │   ├── VideoMessage.tsx      # Video result display
│   │   ├── AsmrMessage.tsx       # Audio player for ASMR
│   │   ├── ModeToggle.tsx        # Mode switcher (chat/image/video/asmr/deepfake)
│   │   ├── InputArea.tsx         # Wrapper for input components
│   │   └── UserRegistration.tsx  # Wallet-based signup
│   │
│   ├── lib/                      # Client-side libraries
│   │   └── api/                  # API client modules
│   │       ├── chat.ts           # Chat API client
│   │       ├── image.ts          # Image generation client
│   │       ├── video.ts          # Video generation client
│   │       ├── asmr.ts           # ASMR audio client
│   │       └── deepfake.ts       # Deepfake swap client
│   │
│   ├── pages/                    # Page components
│   │   ├── Profile.tsx           # User profile page
│   │   ├── Pricing.tsx           # Pricing/subscription page
│   │   ├── EarnTokens.tsx        # Token earning page
│   │   └── Legal.tsx             # Terms/privacy page
│   │
│   ├── contexts/                 # React contexts
│   │   ├── AuthContext.tsx       # Authentication state
│   │   └── TokenDataContext.tsx  # Token balance management
│   │
│   ├── styles/                   # CSS files
│   │   └── index.css             # Main styles with Tailwind
│   │
│   ├── App.tsx                   # Main app component with all send functions
│   ├── promptMappings.ts         # Prompt enhancement mappings
│   ├── PageRouter.tsx            # Route handler
│   └── main.tsx                  # App entry point
│
├── netlify/
│   └── functions/                # Serverless backend functions
│       ├── chat.js               # Chat completion API
│       ├── image.js              # Image generation API
│       ├── video.js              # Video generation API
│       ├── asmr.js               # ASMR audio generation API
│       ├── deepfake-swap.js      # Face swap API
│       ├── auth-wallet.js        # Wallet authentication
│       ├── register-user.js      # User registration
│       ├── earn-tokens.js        # Token earning system
│       ├── get-user-balance.js   # Fetch user balance
│       ├── verify-session.js     # Session verification
│       └── utils/                # Shared utilities
│           ├── supabase.js       # Database client
│           ├── auth.js           # Auth helpers
│           ├── rateLimiter.js    # Rate limiting
│           ├── cors.js           # CORS config
│           ├── validation.js     # Input validators
│           └── cookies.js        # Cookie utilities
│
├── public/                       # Static assets
│   └── (various assets)
│
├── supabase/                     # Database files
│   └── migrations/               # SQL migrations
│
├── .env                          # Environment variables
├── netlify.toml                  # Netlify configuration
├── vite.config.ts                # Vite build config
├── tailwind.config.js            # Tailwind CSS config
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

## Key Files for Each Feature

### Chat Feature
- **Backend**: `netlify/functions/chat.js`
- **Frontend**: `src/App.tsx` (sendMessage function, Custom prompt)
- **Mappings**: `src/promptMappings.ts` (chatPromptMappings)
- **UI Pills**: `src/components/UnifiedContainer.tsx`, `EmptyState.tsx`, `WelcomeScreen.tsx`

### Image Feature
- **Backend**: `netlify/functions/image.js`
- **Frontend**: `src/App.tsx` (sendMessage with mode='image')
- **Mappings**: `src/promptMappings.ts` (imagePromptMappings)
- **UI Pills**: `src/components/UnifiedContainer.tsx`, `EmptyState.tsx`

### Video Feature
- **Backend**: `netlify/functions/video.js`
- **Frontend**: `src/App.tsx` (sendVideo function)
- **UI Pills**: `src/components/UnifiedContainer.tsx`, `EmptyState.tsx`

### ASMR Feature
- **Backend**: `netlify/functions/asmr.js`
- **Frontend**: `src/App.tsx` (sendAsmr function)
- **Mappings**: `src/promptMappings.ts` (asmrPromptMappings)
- **UI Pills**: `src/components/UnifiedContainer.tsx`, `EmptyState.tsx`

### Authentication
- **Backend**: `netlify/functions/auth-wallet.js`, `register-user.js`
- **Frontend**: `src/contexts/AuthContext.tsx`
- **Database**: Supabase tables (users, sessions)

### Token System
- **Backend**: `netlify/functions/earn-tokens.js`, `get-user-balance.js`
- **Frontend**: `src/contexts/TokenDataContext.tsx`
- **Database**: Supabase users table (token_balance field)
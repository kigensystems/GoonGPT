#Project Overview
	•	GoonGPT is an NSFW-oriented AI chatbot and image generation web app. It offers an uncensored, unfiltered ChatGPT-like experience (18+ audience), with an emphasis on anything-goes content and a UI similar to ChatGPT.

#Tech Stack
	•	Build Tool: Vite (bundler/dev server for fast TS apps)
	•	Frontend Framework: React 18+ (TypeScript + JSX) – (UI built to mimic ChatGPT interface)
	•	Language: TypeScript 5.x (strict mode enabled)
	•	Styling: Tailwind CSS 3.x for UI styling
	•	Backend: Netlify Functions (Node.js 18 runtime) for serverless API endpoints
	•	AI Models Service: ModelsLab API for AI features (LLM chat completions, Stable Diffusion image generation)

#Project Structure
	•	src/components/ – Reusable UI components (chat interface elements, message bubbles, input box, image galleries, etc.)
	•	src/pages/ – Main pages or views (e.g. Chat view, ImageGen view) if using a router; otherwise integrated in a single-page app.
	•	src/lib/ – Core logic and utilities (e.g., API client modules for calling ModelsLab endpoints, helper functions, context providers).
	•	src/assets/ – Static assets like icons or default images (if any).
	•	src/styles/ – Global styles or Tailwind configuration (if not solely in tailwind.config.js).
	•	public/ – Public static files (favicon, maybe static html).
	•	netlify/functions/ – Serverless function handlers for backend API calls (e.g., chat.ts for chat completions, generateImage.ts for text-to-image, etc.). These functions securely proxy requests to the ModelsLab API (keeping API keys hidden).
	•	Configuration Files: Root-level config files like package.json (npm scripts), tailwind.config.js (Tailwind setup), and possibly netlify.toml (Netlify settings).

#Commands
	•	Install Dependencies: npm install (install all project dependencies)
	•	Development Server: npm run dev (start Vite dev server for the front-end; likely on localhost)
	•	Build for Production: npm run build (build the app into static assets in dist/ for deployment)
	•	Serve Preview: npm run preview (optional – serve the built app locally for preview, if configured by Vite)
	•	Netlify Dev (Optional): netlify dev (run local dev server with Netlify functions support for testing backend calls)
	•	(No test or lint commands yet – project is in early development stage. Add in future if applicable.)

#Code Style & Conventions
	•	General Style: Follow TypeScript best practices (strict types, no implicit any, etc.). Use ESLint/Prettier formatting rules (standard config) – e.g., 2-space indentation, semicolons, single quotes (if configured).
	•	React Practices: Use functional components with Hooks (no class components). Prefer arrow function components. Name components with PascalCase and files to match (e.g. ChatBox.tsx).
	•	State Management: Use React’s built-in state and context for simplicity (if needed) before considering external state libraries.
	•	Imports: Use ES Modules import/export. Destructure imports when possible (e.g. import { useState } from 'react'). Keep import order organized (libraries first, then internal modules).
	•	CSS/Stying: Use Tailwind utility classes for styling; avoid inline styles or external CSS files unless necessary. Consistent naming for custom CSS classes or ids (kebab-case).
	•	File Naming: Use clear, descriptive names. For TypeScript files containing JSX, use .tsx extension. Use lowercase for file and directory names except React components (PascalCase).

#Repository Etiquette
	•	Branch Strategy: Use a main branch (e.g. main or master) for stable deployment; active development in dev branch. (Since this is a personal project, this can be flexible.)
	•	Commits: Write descriptive commit messages (state the change or feature briefly). No strict format enforced yet, but consistency is encouraged.
	•	(No formal code review process – solo developer.)

#Core Files & Utilities
	•	src/lib/apiClient.ts – (For example) A utility module to call ModelsLab API (wrapping fetch calls for chat or image generation). Claude should use this when needing to integrate API calls.
	•	models.d.ts – (If exists) Type definitions for ModelsLab API responses (e.g., interfaces for chat response, image generation options). Helps with type-safe API usage.
	•	Environment Variables: The ModelsLab API key and any secrets are stored in Netlify environment settings (not in code). The code likely reads them via process.env.MODELSLAB_API_KEY within Netlify functions.
	•	tailwind.config.js – Tailwind CSS configuration (colors, theme customizations) – ensure class names used conform to this config.

#Do Not Touch / Avoid
	•	No Content Filtering: Do not add or enable content moderation or censorship. GoonGPT is intentionally unfiltered, so refrain from implementing filters that block NSFW content.
	•	Don’t Expose Secrets: Do not commit API keys or sensitive info in the repository. Keep using environment variables for secrets (Claude should never print or log the actual API key in code).
	•	Avoid Breaking UI/UX: Do not drastically change the chat UI layout without consultation – it should remain similar to ChatGPT’s layout for familiarity.
	•	Don’t Modify Configs Without Need: Avoid arbitrary changes to critical config files (Webpack/Vite config, Tailwind config, etc.) unless it’s required for a feature.
	•	Preserve Legacy (N/A): (No legacy code yet, but in future, treat any stable or generated code with caution unless improvements are intended.)

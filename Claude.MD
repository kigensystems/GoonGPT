Purpose: Provide Claude Code with detailed context, conventions, and guidelines to scaffold the XposedAI project. Use this file as the starting point for all Claude Code–based development tasks.

⸻

1. Project Overview
	•	Name: XposedAI
	•	Tagline: “An entirely uncensored AI”
	•	Description: A polished, tech-startup–level web application delivering fully uncensored AI interactions. Built on Venice.AI for backend intelligence, with a modern React/Vite/TypeScript/Tailwind front end and Netlify Functions–powered serverless APIs.

2. Primary Stack
	•	Frontend: React (v18+) with Vite and TypeScript
	•	Styling: Tailwind CSS v3
	•	Hosting & Backend: Netlify static hosting + Netlify Functions (serverless)
	•	AI API: Venice.AI (chat, images, audio, docs via HTTP endpoints)

3. Architecture & Folder Structure

project-root/
├── public/               # Static assets (logo.svg, favicon.ico, placeholder images)
├── src/
│   ├── assets/           # Placeholder assets (icons, illustrations)
│   ├── components/       # Reusable UI components (Button, Card, Modal)
│   ├── layouts/          # Layout wrappers (MainLayout, AuthLayout)
│   ├── pages/            # Next.js pages or Vite routes (Home, Chat, Docs)
│   ├── styles/           # Tailwind overrides and custom utilities
│   ├── utils/            # Venice API client, helpers
│   └── netlify-functions/ # Serverless functions (api/chat.js, api/image.js)
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── package.json
└── claude.md             # This file

4. Styling Guidelines

4.1 Color Palette
	•	Primary: #1F2937 (Dark slate)
	•	Secondary: #3B82F6 (Bright blue)
	•	Accent: #10B981 (Emerald green)
	•	Background: #F9FAFB (Very light gray)
	•	Text Primary: #111827 (Almost black)
	•	Text Secondary: #6B7280 (Gray)

All colors defined as Tailwind theme overrides for easy use (e.g., text-primary, bg-accent).

4.2 Typography
	•	Font Family: Inter, sans-serif (modern, highly legible)
	•	Font Weights:
	•	font-normal for body text
	•	font-medium for headings
	•	font-semibold for UI labels and buttons
	•	Sizes: Scale use of Tailwind’s text-sm through text-4xl for hierarchy

4.3 Spacing & Layout
	•	Use a base spacing unit of 0.5rem (2) in Tailwind; consistent padding/margins (p-4, m-6)
	•	Leverage a 12-column grid (grid-cols-12) for page layouts
	•	Apply rounded-2xl corners for cards/buttons and shadow-md for depth

5. Placeholder Assets
	•	Use simple geometric SVGs (e.g., circle placeholder) for logos and icons
	•	Placeholder images: use unsplash.it or dummy URLs in src/assets/placeholders/
	•	All assets should be easily replaced by dropping new files into assets/ and updating import paths

6. Netlify Functions
	•	Place each function in src/netlify-functions/ with filename matching the endpoint (e.g., chat.js → /api/chat)
	•	Functions should:
	1.	Parse incoming JSON payload
	2.	Call Venice.AI endpoints using environment variables for VENICE_API_KEY
	3.	Return JSON response with proper CORS headers

Example (chat.js):

import fetch from 'node-fetch';
export async function handler(event) {
  const { message } = JSON.parse(event.body);
  const res = await fetch('https://api.venice.ai/v1/chat', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.VENICE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: message })
  });
  const data = await res.json();
  return { statusCode: 200, body: JSON.stringify(data) };
}

7. Venice API Integration
	•	Centralize all API calls in src/utils/veniceClient.ts
	•	Export functions like sendChatMessage, generateImage, transcribeAudio, each returning a promise
	•	Handle error cases and rate limits with retry logic

8. UX & Interaction
	•	Landing Page: Hero section with brief tagline, CTA to start chat, rotating feature cards
	•	Chat Interface: Fullscreen modal or side panel, sticky input, streaming responses
	•	Image Gallery: Grid layout for generated images, with inpainting modal
	•	Loading States: Skeletons (animate-pulse) for all async data fetches
	•	Notifications: Toast component for errors and confirmations

9. Next Steps for Claude Code
	1.	Generate project scaffold via create-vite@latest with React + TS template
	2.	Install dependencies: tailwindcss, postcss, autoprefixer, netlify-cli, node-fetch
	3.	Create tailwind.config.js with custom theme as above
	4.	Scaffold key components and pages with placeholder content
	5.	Implement Netlify function templates and test local functions via netlify dev
	6.	Build utility module for Venice API and write sample calls in a demo page

⸻

End of Claude Code context.
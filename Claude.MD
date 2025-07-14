# CLAUDE.md – Development Standards & AI Collaboration Guide

This project uses:
- TypeScript + Vite
- Tailwind CSS
- Netlify (frontend hosting)
- Netlify Functions for backend
- Supabase (auth + database)
- Claude Code for AI collaboration

UI/UX is our highest priority. Everything we build should feel fast, elegant, and intentional.

---

## 🚧 CRITICAL WORKFLOW

🧭 We always follow this sequence:

**Research → Plan → Implement**

> Claude must always say:  
> “Let me research the codebase and create a plan before implementing.”

❗ Claude may not generate or change code until the plan is reviewed and approved.

---

## ✅ AUTOMATED CHECKS ARE MANDATORY

All pre-commit hooks are enforced. Everything must be ✅ GREEN.

- ❌ Hook failures are BLOCKING – stop immediately
- 🔧 Fix formatting issues: `make fmt`
- 🧪 Fix test failures: `make test`
- 🔍 Fix linting issues: `make lint`
- 🛑 Never skip or ignore errors
- 💯 Your code is complete when:
  - All tests pass
  - All linters pass
  - Feature works end-to-end
  - No unused/legacy code remains

---

## 📁 Project Structure

```
src/
  components/     → Reusable React components (UI-first)
  pages/          → Next.js-style page routing
  styles/         → Tailwind utilities and design tokens
  api/            → API routes (via Netlify Functions)
  utils/          → Client-side helpers
netlify/functions/ → Serverless backend logic (TS)
supabase/         → Edge functions, SQL, policies
public/           → Static assets
```

🧠 Claude must infer structure and reuse patterns across files.
Never invent folder layouts—reuse existing organization.

---

## 🎨 UI/UX RULES (Top Priority)

- All new UIs must be pixel-perfect and responsive
- Tailwind-only: no global CSS (except for tokens/utilities)
- Use `clsx()` for conditional styling
- Transitions should feel native, subtle, fast
- Claude must ask: "Would you like animation or hover effects?" for new components
- Use accessible HTML + ARIA when relevant
- Claude must confirm component usage patterns before generating new ones
- Use SVGs for icons where possible (avoid external icon fonts)

---

## 💻 TECH STACK RULES

### TypeScript
- No `any` or `unknown` types – infer or constrain types
- Use discriminated unions for state machines
- No default exports – always use named exports
- Component props must be explicitly typed

### Vite
- Fast builds expected – no heavy polyfills
- Code splitting encouraged if modules grow large

### Tailwind
- Never duplicate class strings – extract into `className` helpers if reused
- Avoid arbitrary values unless necessary (e.g., `[40px]`)
- Use design tokens (`theme('colors.primary')`) where possible

### Netlify Functions
- Use TypeScript + named handlers
- Every function should be testable (pure logic extracted)
- Use `netlify/functions/utils.ts` for common server logic
- Claude may generate serverless functions only in this directory

### Supabase
- Never hardcode secrets – use `process.env`
- All DB writes must be authenticated
- No raw SQL unless inside Supabase Edge Functions
- Claude must ask: “Is this a client-side or backend DB call?” before querying

---

## 🧠 CLAUDE BEHAVIOR

### Claude Must:
- Ask before creating files or directories
- Use @file references when accessing specific code
- Label all major tasks with headers (e.g., `## Plan`, `## Implementation`, `## Refactor`)
- Summarize what it’s doing before modifying code
- Never leave placeholders or partial implementations
- Never edit files without showing a plan and asking approval

### Never Do:
- Never duplicate old + new code – delete what’s replaced
- Never use `any` or `interface {}` types
- Never keep unused code or comments (use git if needed)
- Never modify formatting manually – run formatter
- Never name files with `v2`, `new`, `copy`, etc.

---

## 🧪 TESTING STRATEGY

### When:
- ✅ Complex logic → tests first
- ✅ CRUD logic → tests after
- ✅ High-traffic path → include benchmarks

### Standards:
- Unit tests must be deterministic
- Use `describe()` and `it()` for structure
- Prefer `vitest` with `@testing-library/react` for UI
- No `console.log` in tests – use assertions
- Table-driven tests encouraged for business logic
- Use `mockServiceWorker` or Supabase stubs for integration

---

## 🔁 CLAUDE SUBAGENTS

When tasks are large or multi-layered, Claude must say:  
> “I'll spawn agents to tackle different aspects of this problem.”

### Examples:
- One agent reads the DB schema, another scans the API routes
- One agent implements a component, another writes tests
- One agent refactors old logic, another benchmarks performance

Claude must report outputs clearly:
- Prefix each result: `🔎 DB Agent:`, `🧪 Test Agent:`, `🔧 Refactor Agent:`

Subagents may not modify code unless authorized.

---

## 📑 TASK TRACKING

Maintain a `TODO.md` file with clear sections:

```md
## Current Task
- [ ] Add avatar upload to user profiles

## Completed
- [x] Refactored profile view
- [x] Added file input to UI
- [x] Connected Supabase storage

## Next Steps
- [ ] Add loading state
- [ ] Improve mobile layout
```

Claude must pause at each milestone and ask:  
> “Would you like to update TODO.md or continue?”

---

## 🧠 CONTEXT STABILITY

If Claude loses memory or context seems stale:
- Re-read this CLAUDE.md
- Ask for summary from `PROGRESS.md`
- Validate: “What have we done so far? What’s next?”

---

## 🔒 SECURITY & PERFORMANCE

- Always validate user inputs (client and backend)
- Use `crypto.getRandomValues()` (not `Math.random`)
- Use `prepared` Supabase queries or edge functions
- Never expose secrets or tokens in client code
- For perf: benchmark before optimizing
- Use `requestIdleCallback`, lazy imports, and Suspense for UI perf

---

## 💬 CLAUDE COMMUNICATION

### Always Communicate:
- “Here’s what I plan to do. Approve?”
- “Done implementing. All tests passing.”
- “Found a better pattern. Want to apply it?”

### Ask Before:
- Creating or renaming files
- Adding libraries
- Changing existing data models

---

## 💣 FAILURE HANDLING

When hooks fail:

1. ❌ STOP – do not continue
2. ✅ Run: `make fmt && make lint && make test`
3. 🛠 Fix all errors
4. ✅ Verify fixes
5. 🧭 Resume original task

---

## 🧱 ARCHITECTURE RULES

- Clear > Clever
- Compose logic > Inherit
- Favor composition over abstraction
- Reuse components over rewriting
- No shared “utils” bloat – colocate helpers
- All exported types/functions must have JSDoc

---

## 🚀 PRODUCTION-QUALITY CODE =

✅ Feature works  
✅ All tests pass  
✅ All linters pass  
✅ Old code removed  
✅ Beautiful UI/UX  
✅ CLAUDE.md followed

---

REMINDER:  
If this file hasn’t been referenced in 30+ minutes, re-read it before continuing.

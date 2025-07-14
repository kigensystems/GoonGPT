# Custom Slash Commands for Claude Code

This directory stores all reusable Claude Code slash commands.

## Usage
Place `.md` files here with the structure:

```md
# fix-bug.md
title: Fix a Bug
description: Analyze a bug and implement a fix
prompt: |
  Given this error:

  ```
  {{input}}
  ```

  Please:
  1. Search for the cause
  2. Propose a fix
  3. Apply with tests
```

## Suggested Commands

- `requirements-start.md` — launches discovery Q&A
- `fix-bug.md` — auto-debug flow
- `write-tests.md` — generate full test suites
- `refactor-module.md` — intelligently improve structure
- `summarize-code.md` — summarizer for onboarding

Create these commands based on your project's needs. Each one should reflect the structure, behavior, and rules outlined in your CLAUDE.md.

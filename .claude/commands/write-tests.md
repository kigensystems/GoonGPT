title: Write Tests
description: Generate unit/integration tests for given logic
prompt: |
  Generate tests for the following file or component:

  @{{input}}

  Follow our CLAUDE.md rules:
  - Use vitest
  - Use React Testing Library for UI
  - Add table-driven tests for logic
  - Include mock Supabase or MSW if needed

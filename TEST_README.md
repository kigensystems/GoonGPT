# Testing Setup

## Quick Start

The project includes basic testing setup for critical components and utilities.

### Running Tests

```bash
# Install testing dependencies first (if not already installed)
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom babel-jest identity-obj-proxy

# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### What's Tested

- **Input Validation**: Core validation functions for chat, image, and video inputs
- **Error Boundaries**: React error boundary components for graceful error handling
- **Critical Utils**: Key utility functions used throughout the app

### Test Files

- `src/utils/__tests__/validation.test.js` - Input validation tests
- `src/components/__tests__/ErrorBoundary.test.jsx` - Error boundary tests

### Adding Tests

For a small project, focus on testing:
1. Critical business logic (validation, auth, etc.)
2. Error handling components
3. Any functions that handle user data

Keep tests simple and practical - don't over-test for a small project.

### Note

Testing dependencies are not included in package.json by default to keep the project lightweight. Install them when you're ready to run tests:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom babel-jest identity-obj-proxy
```
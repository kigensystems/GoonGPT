// Jest test setup file
import '@testing-library/jest-dom';

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock window.location for navigation tests
delete window.location;
window.location = {
  reload: jest.fn(),
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);
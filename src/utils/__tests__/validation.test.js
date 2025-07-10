// Basic tests for validation utilities
// Run with: npm test

import { validateChatInput, validateImageInput, validateVideoInput, hasObviouslyBadContent } from '../validation.js';

describe('Validation Utils', () => {
  
  describe('validateChatInput', () => {
    test('should accept valid chat messages', () => {
      const messages = [
        { role: 'user', content: 'Hello world' },
        { role: 'assistant', content: 'Hi there!' }
      ];
      
      const result = validateChatInput(messages);
      expect(result.valid).toBe(true);
    });
    
    test('should reject empty messages array', () => {
      const result = validateChatInput([]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });
    
    test('should reject messages that are too long', () => {
      const messages = [
        { role: 'user', content: 'a'.repeat(11000) } // Over 10k limit
      ];
      
      const result = validateChatInput(messages);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too long');
    });
    
    test('should reject invalid role', () => {
      const messages = [
        { role: 'invalid', content: 'Hello' }
      ];
      
      const result = validateChatInput(messages);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid message role');
    });
  });
  
  describe('validateImageInput', () => {
    test('should accept valid image prompt', () => {
      const result = validateImageInput('A beautiful sunset');
      expect(result.valid).toBe(true);
    });
    
    test('should reject empty prompt', () => {
      const result = validateImageInput('');
      expect(result.valid).toBe(false);
    });
    
    test('should reject prompt that is too long', () => {
      const result = validateImageInput('a'.repeat(2100)); // Over 2k limit
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too long');
    });
    
    test('should validate image dimensions', () => {
      const result = validateImageInput('test', { width: 32, height: 32 }); // Too small
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid width');
    });
  });
  
  describe('validateVideoInput', () => {
    test('should accept valid image URL', () => {
      const result = validateVideoInput('https://example.com/image.jpg');
      expect(result.valid).toBe(true);
    });
    
    test('should accept valid base64 image', () => {
      const result = validateVideoInput('data:image/jpeg;base64,/9j/4AAQSkZJRg...');
      expect(result.valid).toBe(true);
    });
    
    test('should reject invalid URL', () => {
      const result = validateVideoInput('not-a-url');
      expect(result.valid).toBe(false);
    });
  });
  
  describe('hasObviouslyBadContent', () => {
    test('should detect script tags', () => {
      const result = hasObviouslyBadContent('<script>alert("xss")</script>');
      expect(result).toBe(true);
    });
    
    test('should detect javascript URLs', () => {
      const result = hasObviouslyBadContent('javascript:alert("xss")');
      expect(result).toBe(true);
    });
    
    test('should allow normal text', () => {
      const result = hasObviouslyBadContent('This is a normal prompt for AI');
      expect(result).toBe(false);
    });
  });
  
});
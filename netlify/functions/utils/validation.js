// Simple input validation for AI endpoints

export function validateChatInput(messages) {
  // Basic validation
  if (!messages || !Array.isArray(messages)) {
    return { valid: false, error: 'Messages must be an array' };
  }
  
  if (messages.length === 0) {
    return { valid: false, error: 'Messages array cannot be empty' };
  }
  
  if (messages.length > 50) {
    return { valid: false, error: 'Too many messages (max 50)' };
  }
  
  // Validate each message
  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      return { valid: false, error: 'Each message must have role and content' };
    }
    
    if (!['user', 'assistant', 'system'].includes(msg.role)) {
      return { valid: false, error: 'Invalid message role' };
    }
    
    if (typeof msg.content !== 'string') {
      return { valid: false, error: 'Message content must be a string' };
    }
    
    // Basic length limits
    if (msg.content.length > 10000) {
      return { valid: false, error: 'Message too long (max 10000 characters)' };
    }
  }
  
  return { valid: true };
}

export function validateImageInput(prompt, options = {}) {
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: 'Prompt must be a non-empty string' };
  }
  
  if (prompt.length > 2000) {
    return { valid: false, error: 'Prompt too long (max 2000 characters)' };
  }
  
  // Validate dimensions if provided
  if (options.width) {
    const width = parseInt(options.width);
    if (isNaN(width) || width < 64 || width > 2048) {
      return { valid: false, error: 'Invalid width (must be 64-2048)' };
    }
  }
  
  if (options.height) {
    const height = parseInt(options.height);
    if (isNaN(height) || height < 64 || height > 2048) {
      return { valid: false, error: 'Invalid height (must be 64-2048)' };
    }
  }
  
  return { valid: true };
}

export function validateVideoInput(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return { valid: false, error: 'Image URL must be provided' };
  }
  
  // Basic URL validation
  try {
    new URL(imageUrl);
  } catch {
    // Check if it's a base64 image
    if (!imageUrl.startsWith('data:image/')) {
      return { valid: false, error: 'Invalid image URL or base64 data' };
    }
  }
  
  return { valid: true };
}

// Simple content filtering (very basic, just for obvious issues)
export function hasObviouslyBadContent(text) {
  // This is very basic - just checking for obvious spam/injection attempts
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onclick=/i,
    /onerror=/i,
    /\bon\w+\s*=/i, // any on* event handlers
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(text));
}

// General input validation function
export function validateInput(data, schema) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Check if required field is missing
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    // Skip validation if field is not provided and not required
    if (value === undefined || value === null) {
      continue;
    }
    
    // Type validation
    if (rules.type) {
      const expectedType = rules.type;
      const actualType = typeof value;
      
      if (expectedType === 'number' && (actualType !== 'number' || isNaN(value))) {
        errors.push(`${field} must be a valid number`);
        continue;
      }
      
      if (expectedType === 'string' && actualType !== 'string') {
        errors.push(`${field} must be a string`);
        continue;
      }
      
      if (expectedType === 'boolean' && actualType !== 'boolean') {
        errors.push(`${field} must be a boolean`);
        continue;
      }
    }
    
    // Numeric range validation
    if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }
    
    if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
      errors.push(`${field} must be at most ${rules.max}`);
    }
    
    // String length validation
    if (rules.minLength !== undefined && typeof value === 'string' && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters long`);
    }
    
    if (rules.maxLength !== undefined && typeof value === 'string' && value.length > rules.maxLength) {
      errors.push(`${field} must be at most ${rules.maxLength} characters long`);
    }
    
    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      errors.push(`${field} has invalid format`);
    }
    
    // Content filtering
    if (typeof value === 'string' && hasObviouslyBadContent(value)) {
      errors.push(`${field} contains potentially malicious content`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}
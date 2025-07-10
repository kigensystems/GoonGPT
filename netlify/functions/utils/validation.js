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
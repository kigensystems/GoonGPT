# Authentication Security Migration

## Overview
This migration updates GoonGPT's authentication system from insecure localStorage tokens to secure HTTP-only cookies, significantly improving security posture.

## Security Improvements

### Before (Insecure)
- ❌ Tokens stored in localStorage (accessible to JavaScript)
- ❌ Vulnerable to XSS attacks
- ❌ No CSRF protection
- ❌ Tokens persist indefinitely in browser storage

### After (Secure)
- ✅ Tokens stored in HTTP-only cookies (inaccessible to JavaScript)
- ✅ Protected from XSS attacks
- ✅ CSRF protection with SameSite=Strict
- ✅ Automatic expiration with proper cleanup

## Implementation Details

### New Files Created
1. **`netlify/functions/utils/cookies.js`** - Secure cookie management utilities
2. **`netlify/functions/logout.js`** - Secure logout endpoint
3. **`netlify/functions/validate-session.js`** - Session validation endpoint

### Modified Files
1. **`src/contexts/AuthContext.tsx`** - Uses HTTP-only cookies instead of localStorage
2. **`src/components/PhantomWalletConnect.tsx`** - Includes credentials in requests
3. **`src/components/UserDropdown.tsx`** - Async logout handling
4. **`netlify/functions/auth-wallet.js`** - Sets HTTP-only cookies on login
5. **`netlify/functions/utils/rateLimiter.js`** - Enhanced to get wallet from session

### Cookie Configuration
```javascript
const cookieOptions = [
  `goongpt_session=${token}`,
  `Max-Age=604800`, // 7 days
  'HttpOnly', // Prevents JavaScript access
  'SameSite=Strict', // CSRF protection
  'Path=/', // Available on all paths
  'Secure' // HTTPS only (production)
];
```

## New API Endpoints

### 1. Session Validation
```
GET /.netlify/functions/validate-session
```
- Validates session from HTTP-only cookie
- Returns user data if valid
- Used on app initialization

### 2. Secure Logout
```
POST /.netlify/functions/logout
```
- Clears HTTP-only cookie
- Removes session from database
- Handles errors gracefully

## Client-Side Changes

### AuthContext Updates
- Removed localStorage dependency
- Added session validation on app startup
- Async logout function
- Proper error handling

### Request Configuration
All authenticated requests now include:
```javascript
{
  credentials: 'include' // Include HTTP-only cookies
}
```

## Rate Limiting Enhancement

The rate limiter now intelligently determines wallet addresses from:
1. Request body (for auth endpoints)
2. Session cookies (for protected endpoints)
3. IP address fallback (for anonymous users)

## Security Benefits

### XSS Protection
- Tokens cannot be accessed via `document.cookie`
- No risk of token theft through malicious scripts
- Tokens automatically included in requests

### CSRF Protection
- `SameSite=Strict` prevents cross-site request forgery
- Tokens only sent to same-origin requests
- Additional protection layer

### Automatic Cleanup
- Tokens expire after 7 days
- Database sessions cleaned up on logout
- No persistent storage on client

## Testing Checklist

### Authentication Flow
- [ ] Wallet connection works
- [ ] Login sets HTTP-only cookie
- [ ] Session validates on page refresh
- [ ] Logout clears cookie and session
- [ ] Expired sessions handled gracefully

### Security Verification
- [ ] `document.cookie` doesn't show session token
- [ ] Requests include credentials automatically
- [ ] Cross-origin requests blocked
- [ ] Rate limiting works with cookies

### Error Handling
- [ ] Invalid sessions redirect to login
- [ ] Network errors handled gracefully
- [ ] Fallback to anonymous rate limiting

## Migration Notes

### Breaking Changes
- Session data no longer in localStorage
- Logout function is now async
- Requires `credentials: 'include'` for authenticated requests

### Compatibility
- Works with existing rate limiting
- Maintains user experience
- Backward compatible error handling

## Production Deployment

### Environment Variables
- `NODE_ENV=production` enables Secure flag
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` required
- `MODELSLAB_API_KEY` for AI features

### HTTPS Requirement
- Secure cookies require HTTPS in production
- Development works with HTTP (localhost exception)

## Monitoring

### Log Events
- Session creation/validation
- Cookie setting/clearing
- Authentication failures
- Rate limiting events

### Security Metrics
- Failed authentication attempts
- Session hijacking attempts
- Invalid cookie access attempts

This migration significantly improves GoonGPT's security posture while maintaining the same user experience.
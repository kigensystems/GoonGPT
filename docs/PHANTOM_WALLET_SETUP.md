# Phantom Wallet Authentication Setup

This guide explains how to set up the Phantom wallet authentication system for GoonGPT.

## Overview

The authentication system allows users to:
- Connect their Phantom wallet
- Sign a message to prove wallet ownership
- Create a profile with username, email, and profile picture
- Manage their profile after authentication

## Database Setup

GoonGPT uses Netlify Blobs for data storage - no external database needed! User data is automatically stored in Netlify's blob storage when deployed.

### Data Structure

- **Users**: Stored by wallet address, username, and ID
- **Sessions**: Stored by token with 7-day expiration

## Local Development

For local development, make sure you have Netlify CLI installed:

```bash
npm install -g netlify-cli
```

Then run the development server with:

```bash
netlify dev
```

This will enable Netlify Blobs to work locally.

## How It Works

### Authentication Flow

1. User clicks "Connect Wallet" button
2. Phantom wallet popup appears for connection
3. After connection, user signs a message to prove ownership
4. Backend verifies the signature using the wallet's public key
5. If new user, registration form appears
6. After registration/login, user session is created

### Components

- **WalletConnect**: Handles wallet connection and authentication
- **UserRegistration**: Registration form for new users
- **UserProfile**: Profile management for authenticated users
- **AuthContext**: Manages authentication state across the app

### API Endpoints

- `POST /.netlify/functions/auth-wallet`: Authenticate wallet signature
- `POST /.netlify/functions/register-user`: Register new user
- `PUT /.netlify/functions/update-profile`: Update user profile

### Security

- Wallet signatures verify ownership without exposing private keys
- Session tokens expire after 7 days
- All API endpoints validate authentication tokens
- Profile updates are restricted to the authenticated user
- Data is securely stored in Netlify Blobs

## Testing

1. Install Phantom wallet browser extension
2. Create/import a Solana wallet
3. Run the development server: `netlify dev`
4. Click "Connect Wallet" and follow the flow

## Deployment

When you deploy to Netlify, the blob storage is automatically available. No additional configuration needed!

## Troubleshooting

- **Wallet not connecting**: Ensure Phantom extension is installed and unlocked
- **Signature fails**: Make sure you're signing the exact message shown
- **Data not persisting locally**: Ensure you're using `netlify dev` instead of `npm run dev`
- **Session expired**: Users need to reconnect their wallet after 7 days
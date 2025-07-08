import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import crypto from 'crypto';
import { getUserByWallet, createSession } from './utils/database.js';

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { wallet_address, signed_message, message } = JSON.parse(event.body);

    if (!wallet_address || !signed_message || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Verify the signature
    const publicKey = new PublicKey(wallet_address);
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = new Uint8Array(Buffer.from(signed_message, 'base64'));
    
    // Log signature details for debugging
    console.log('Signature verification details:', {
      wallet_address,
      message_length: message.length,
      signature_length: signatureBytes.length,
      publicKey_bytes_length: publicKey.toBytes().length
    });
    
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKey.toBytes()
    );

    if (!isValid) {
      console.error('Signature verification failed:', {
        message_preview: message.substring(0, 50) + '...',
        signature_bytes_sample: Array.from(signatureBytes.slice(0, 10))
      });
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    // Check if user exists
    const user = await getUserByWallet(context, wallet_address);
    console.log('User lookup for wallet:', wallet_address, 'found:', user);

    // If user doesn't exist, return a flag indicating registration is needed
    if (!user) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          authenticated: true,
          needs_registration: true,
          wallet_address 
        })
      };
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const session = await createSession(context, user.id, token);

    return {
      statusCode: 200,
      body: JSON.stringify({
        authenticated: true,
        user,
        token,
        expires_at: session.expires_at
      })
    };

  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Authentication failed' })
    };
  }
}
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import crypto from 'crypto';
import { getUserByWallet, createSession } from './utils/database.js';

export default async function handler(req, context) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { wallet_address, signed_message, message } = await req.json();

    if (!wallet_address || !signed_message || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
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
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user exists
    const user = await getUserByWallet(wallet_address);
    console.log('User lookup for wallet:', wallet_address, 'found:', user);

    // If user doesn't exist, return a flag indicating registration is needed
    if (!user) {
      return new Response(JSON.stringify({ 
        authenticated: true,
        needs_registration: true,
        wallet_address 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const session = await createSession(user.id, token);

    return new Response(JSON.stringify({
      authenticated: true,
      user,
      token,
      expires_at: session.expires_at
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ error: 'Authentication failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
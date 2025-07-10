import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import crypto from 'crypto';
import { getUserByWallet, createSession } from './utils/database.js';

export default async function handler(req, context) {
  console.log('🔍 AUTH-WALLET: Function started');
  console.log('🔍 AUTH-WALLET: Request method:', req.method);
  console.log('🔍 AUTH-WALLET: Request headers:', Object.fromEntries(req.headers.entries()));
  
  if (req.method !== 'POST') {
    console.log('❌ AUTH-WALLET: Method not allowed:', req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('🔍 AUTH-WALLET: Parsing request body...');
    const { wallet_address, signed_message, message } = await req.json();
    console.log('🔍 AUTH-WALLET: Request body parsed successfully');
    console.log('🔍 AUTH-WALLET: Wallet address:', wallet_address);
    console.log('🔍 AUTH-WALLET: Message length:', message?.length);
    console.log('🔍 AUTH-WALLET: Signature length:', signed_message?.length);

    if (!wallet_address || !signed_message || !message) {
      console.log('❌ AUTH-WALLET: Missing required fields');
      console.log('🔍 AUTH-WALLET: wallet_address:', !!wallet_address);
      console.log('🔍 AUTH-WALLET: signed_message:', !!signed_message);
      console.log('🔍 AUTH-WALLET: message:', !!message);
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify the signature
    console.log('🔍 AUTH-WALLET: Creating PublicKey from wallet address...');
    const publicKey = new PublicKey(wallet_address);
    console.log('🔍 AUTH-WALLET: PublicKey created successfully');
    
    console.log('🔍 AUTH-WALLET: Encoding message to bytes...');
    const messageBytes = new TextEncoder().encode(message);
    console.log('🔍 AUTH-WALLET: Message encoded, length:', messageBytes.length);
    
    console.log('🔍 AUTH-WALLET: Converting signature from base64...');
    const signatureBytes = new Uint8Array(Buffer.from(signed_message, 'base64'));
    console.log('🔍 AUTH-WALLET: Signature converted, length:', signatureBytes.length);
    
    // Log signature details for debugging
    console.log('🔍 AUTH-WALLET: Signature verification details:', {
      wallet_address,
      message_length: message.length,
      signature_length: signatureBytes.length,
      publicKey_bytes_length: publicKey.toBytes().length
    });
    
    console.log('🔍 AUTH-WALLET: Verifying signature with nacl...');
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKey.toBytes()
    );
    console.log('🔍 AUTH-WALLET: Signature verification result:', isValid);

    if (!isValid) {
      console.error('❌ AUTH-WALLET: Signature verification failed:', {
        message_preview: message.substring(0, 50) + '...',
        signature_bytes_sample: Array.from(signatureBytes.slice(0, 10))
      });
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user exists
    console.log('🔍 AUTH-WALLET: Looking up user by wallet address...');
    const user = await getUserByWallet(wallet_address);
    console.log('🔍 AUTH-WALLET: User lookup result for wallet:', wallet_address, 'found:', !!user);
    if (user) {
      console.log('🔍 AUTH-WALLET: User details:', { id: user.id, username: user.username });
    }

    // If user doesn't exist, return a flag indicating registration is needed
    if (!user) {
      console.log('🔍 AUTH-WALLET: User not found, needs registration');
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
    console.log('🔍 AUTH-WALLET: User found, generating session token...');
    const token = crypto.randomBytes(32).toString('hex');
    console.log('🔍 AUTH-WALLET: Token generated, creating session...');
    const session = await createSession(user.id, token);
    console.log('🔍 AUTH-WALLET: Session created successfully');

    console.log('🔍 AUTH-WALLET: Returning successful authentication response');
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
    console.error('❌ AUTH-WALLET: Caught error in try/catch:', error);
    console.error('❌ AUTH-WALLET: Error name:', error.name);
    console.error('❌ AUTH-WALLET: Error message:', error.message);
    console.error('❌ AUTH-WALLET: Error stack:', error.stack);
    return new Response(JSON.stringify({ error: 'Authentication failed', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
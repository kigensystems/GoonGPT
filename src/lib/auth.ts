import { PublicKey } from '@solana/web3.js';
import { WalletAuthMessage } from '../types/user';

export function createAuthMessage(walletAddress: string): WalletAuthMessage {
  const timestamp = Date.now();
  return {
    message: `Sign this message to authenticate with GoonGPT\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`,
    timestamp: timestamp,
    wallet_address: walletAddress
  };
}

export async function verifyWalletOwnership(
  publicKey: string,
  signedMessage: Uint8Array,
  originalMessage: string
): Promise<boolean> {
  try {
    const pubKey = new PublicKey(publicKey);
    const messageBytes = new TextEncoder().encode(originalMessage);
    
    const { verify } = await import('tweetnacl');
    return verify(messageBytes, signedMessage, pubKey.toBytes());
  } catch (error) {
    console.error('Error verifying wallet ownership:', error);
    return false;
  }
}
import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { createAuthMessage } from '../lib/auth';
import { useAuth } from '../contexts/AuthContext';
import { PhantomLogo } from './PhantomLogo';

interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
}

interface PhantomWalletConnectProps {
  onNeedRegistration?: (walletAddress: string) => void;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

export function PhantomWalletConnect({ onNeedRegistration }: PhantomWalletConnectProps) {
  const { login, logout, isAuthenticated } = useAuth();
  const [provider, setProvider] = useState<PhantomProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Phantom is installed
  useEffect(() => {
    if ('solana' in window) {
      const provider = window.solana as PhantomProvider;
      setProvider(provider);
    } else {
      console.log('Phantom wallet not found');
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) {
      setError('Phantom wallet not found. Please install the extension.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const response = await provider.connect();
      console.log('Wallet connected:', response.publicKey.toString());
      
      // Automatically authenticate after connection
      await authenticateWallet(response.publicKey);
    } catch (err) {
      console.error('Error connecting to Phantom:', err);
      setError('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const authenticateWallet = async (publicKey: PublicKey) => {
    if (!provider?.signMessage) return;

    setIsAuthenticating(true);
    setError(null);

    try {
      const walletAddress = publicKey.toBase58();
      const authMessage = createAuthMessage(walletAddress);
      
      const messageBytes = new TextEncoder().encode(authMessage.message);
      const { signature } = await provider.signMessage(messageBytes);

      // Convert Uint8Array to base64 properly
      const base64Signature = Buffer.from(signature).toString('base64');
      
      console.log('Sending authentication request for:', walletAddress);
      console.log('Request URL:', `${window.location.origin}/.netlify/functions/auth-wallet`);
      
      const response = await fetch('/.netlify/functions/auth-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: include cookies in request
        body: JSON.stringify({
          wallet_address: walletAddress,
          signed_message: base64Signature,
          message: authMessage.message
        })
      });

      const data = await response.json();
      console.log('Auth response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.needs_registration) {
        console.log('User needs registration');
        onNeedRegistration?.(walletAddress);
      } else {
        console.log('User exists, logging in:', data.user);
        login({
          user: data.user,
          token: 'cookie-managed', // Token is in HTTP-only cookie
          expires_at: data.expires_at
        });
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const disconnectWallet = async () => {
    if (provider) {
      try {
        await provider.disconnect();
        await logout(); // logout is now async
      } catch (err) {
        console.error('Error disconnecting wallet:', err);
      }
    }
  };

  // Check if already connected on mount
  useEffect(() => {
    if (provider?.isConnected && provider.publicKey && !isAuthenticated) {
      authenticateWallet(provider.publicKey);
    }
  }, [provider, isAuthenticated]);

  // If Phantom is not installed
  if (!provider) {
    return (
      <div className="text-center">
        <p className="text-gray-400 mb-4">Phantom wallet not detected</p>
        <a
          href="https://phantom.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2 sm:px-5 sm:py-2 bg-[#AB9FF2] text-white rounded-lg hover:bg-[#9B8EE3] transition-colors font-semibold text-sm sm:text-base shadow-md hover:shadow-lg w-full sm:w-auto min-h-[40px] sm:min-h-[43px]"
        >
          <PhantomLogo size={18} color="white" variant="icon" />
          <span className="whitespace-nowrap">Install Phantom</span>
        </a>
      </div>
    );
  }

  // If authenticated
  if (isAuthenticated && provider?.isConnected) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <button
          onClick={disconnectWallet}
          className="flex items-center justify-center gap-2 px-3 py-2 sm:px-3 sm:py-2 bg-[#AB9FF2] text-white rounded-lg hover:bg-[#9B8EE3] transition-colors text-sm font-medium w-full sm:w-auto min-h-[36px] sm:min-h-[40px]"
        >
          <PhantomLogo size={14} color="white" variant="icon" />
          <span className="whitespace-nowrap">Disconnect Phantom</span>
        </button>
      </div>
    );
  }

  // If not connected
  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={connectWallet}
        disabled={isConnecting || isAuthenticating}
        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-5 sm:py-2 bg-[#AB9FF2] text-white rounded-lg hover:bg-[#9B8EE3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base shadow-md hover:shadow-lg w-full sm:w-auto min-h-[40px] sm:min-h-[43px]"
      >
        <PhantomLogo size={18} color="white" variant="icon" />
        <span className="whitespace-nowrap">{isConnecting ? 'Connecting...' : isAuthenticating ? 'Authenticating...' : 'Connect Phantom'}</span>
      </button>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
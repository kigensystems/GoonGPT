import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserRegistrationProps {
  walletAddress: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function UserRegistration({ walletAddress, onCancel, onSuccess }: UserRegistrationProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/.netlify/functions/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          username: username.trim(),
          email: email.trim() || undefined,
          profile_picture: profilePicture.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      login({
        user: data.user,
        token: data.token,
        expires_at: data.expires_at
      });

      // Show success message
      setShowSuccess(true);

      // Redirect to earn tokens page after 2 seconds
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size too large. Please select an image smaller than 10MB.');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please select a JPEG, PNG, or WebP image.');
        return;
      }

      // Compress image before uploading
      compressImage(file, 0.8, 1024, 1024)
        .then(compressedDataUrl => {
          setProfilePicture(compressedDataUrl);
        })
        .catch(error => {
          console.error('Error compressing image:', error);
          // Fallback to original file if compression fails
          const reader = new FileReader();
          reader.onloadend = () => {
            setProfilePicture(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
    }
  };

  // Image compression utility
  const compressImage = (file: File, quality: number = 0.8, maxWidth: number = 1024, maxHeight: number = 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Show success state
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-bg-main bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-surface border border-border rounded-xl p-8 max-w-lg w-full shadow-2xl text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Registration Successful!</h2>
            <p className="text-text-secondary">
              Welcome to GoonGPT, <span className="text-accent font-semibold">{username}</span>!
            </p>
            <p className="text-text-muted text-sm mt-2">
              Redirecting you to earn your first tokens...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-bg-main bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-border rounded-xl p-8 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Complete Your Profile</h2>
          <button
            onClick={onCancel}
            className="text-text-muted hover:text-text-primary transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="bg-bg-main rounded-lg p-4 mb-6">
          <p className="text-text-secondary text-sm">
            Connected wallet: <span className="text-accent font-mono">{walletAddress.slice(0, 12)}...{walletAddress.slice(-12)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-2">
              Username *
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-bg-main text-text-primary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              placeholder="Enter username (3-20 characters)"
              required
              pattern="[a-zA-Z0-9_]{3,20}"
              title="Username must be 3-20 characters and contain only letters, numbers, and underscores"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-bg-main text-text-primary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="profilePicture" className="block text-sm font-medium text-text-secondary mb-2">
              Profile Picture (optional)
            </label>
            <div className="flex items-center space-x-4">
              {profilePicture && (
                <img
                  src={profilePicture}
                  alt="Profile preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-border"
                />
              )}
              <input
                type="file"
                id="profilePicture"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleProfilePictureChange}
                className="flex-1 text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90 file:transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-6">
            <button
              type="submit"
              disabled={isSubmitting || !username.trim()}
              className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:bg-text-muted disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 bg-surface border border-border text-text-primary rounded-lg hover:bg-bg-main transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
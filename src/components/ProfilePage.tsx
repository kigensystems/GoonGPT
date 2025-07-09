import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProfilePageProps {
  onBack: () => void;
  onNavigate: (view: 'chat' | 'pricing' | 'earn') => void;
}

export function ProfilePage({ onBack, onNavigate }: ProfilePageProps) {
  const { user, session, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || !session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updates: any = {};
      if (username !== user.username) updates.username = username;
      if (email !== user.email) updates.email = email || null;
      if (profilePicture !== user.profile_picture) updates.profile_picture = profilePicture || null;

      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        return;
      }

      const response = await fetch('/.netlify/functions/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Update failed');
      }

      updateUser(data.user);
      setIsEditing(false);
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Update failed');
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

  return (
    <div className="flex flex-col h-screen bg-bg-main text-text-primary">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="hover:opacity-80 transition-opacity"
          >
            <img 
              src="/GoonGPT-notext.png" 
              alt="GoonGPT Logo" 
              className="h-12 w-auto"
            />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('pricing')}
            className="px-3 py-2 text-sm text-text-primary hover:text-accent transition-colors font-medium"
          >
            Pricing
          </button>
          <button
            onClick={() => onNavigate('earn')}
            className="px-3 py-2 text-sm text-text-primary hover:text-accent transition-colors font-medium"
          >
            Earn Tokens
          </button>
          <a
            href="https://x.com/Goon_GPT"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 text-text-primary hover:text-accent transition-colors"
            title="Follow us on X"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a
            href="https://dexscreener.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 hover:opacity-80 transition-opacity"
            title="View on DexScreener"
          >
            <img 
              src="/dex-screener-seeklogo.svg" 
              alt="DexScreener" 
              className="w-5 h-5"
            />
          </a>
          {user && (
            <>
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-surface rounded-lg hover:bg-gray-700 transition-colors"
              >
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-white">{user.username}</span>
              </button>
              <button
                onClick={logout}
                className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                title="Logout"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="bg-surface rounded-lg p-6">
            {!isEditing ? (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center space-x-6">
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt={user.username}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-white text-3xl font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">{user.username}</h2>
                    <p className="text-text-secondary text-sm font-mono mt-1">
                      {user.wallet_address.slice(0, 12)}...{user.wallet_address.slice(-12)}
                    </p>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Username
                      </label>
                      <div className="px-3 py-2 bg-bg-main rounded-lg text-text-primary">
                        {user.username}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Email
                      </label>
                      <div className="px-3 py-2 bg-bg-main rounded-lg text-text-primary">
                        {user.email || 'Not provided'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Wallet Address
                      </label>
                      <div className="px-3 py-2 bg-bg-main rounded-lg text-text-primary font-mono text-sm break-all">
                        {user.wallet_address}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Member Since
                      </label>
                      <div className="px-3 py-2 bg-bg-main rounded-lg text-text-primary">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-text-primary">Edit Profile</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="edit-username" className="block text-sm font-medium text-text-secondary mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        id="edit-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 bg-bg-main text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                        pattern="[a-zA-Z0-9_]{3,20}"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-email" className="block text-sm font-medium text-text-secondary mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="edit-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-bg-main text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-profilePicture" className="block text-sm font-medium text-text-secondary mb-1">
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-4">
                      {profilePicture && (
                        <img
                          src={profilePicture}
                          alt="Profile preview"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <input
                        type="file"
                        id="edit-profilePicture"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleProfilePictureChange}
                        className="flex-1 text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setUsername(user.username);
                      setEmail(user.email || '');
                      setProfilePicture(user.profile_picture || '');
                      setError(null);
                    }}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-surface border border-border text-text-primary rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
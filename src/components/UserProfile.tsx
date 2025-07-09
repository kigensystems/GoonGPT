import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  onClose: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const { user, session, updateUser } = useAuth();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">User Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.username}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-white">{user.username}</h3>
                <p className="text-gray-400 text-sm font-mono">
                  {user.wallet_address.slice(0, 8)}...{user.wallet_address.slice(-8)}
                </p>
              </div>
            </div>

            {user.email && (
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{user.email}</p>
              </div>
            )}

            <div>
              <p className="text-gray-400 text-sm">Member since</p>
              <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-username" className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                id="edit-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                pattern="[a-zA-Z0-9_]{3,20}"
              />
            </div>

            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="edit-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="edit-profilePicture" className="block text-sm font-medium text-gray-300 mb-1">
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
                  className="flex-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
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
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
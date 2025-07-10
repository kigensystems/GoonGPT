import { useState, useRef, useEffect } from 'react'
import { getMockTokenData } from '../utils/mockTokens'

interface User {
  username: string
  profile_picture?: string
  wallet_address?: string
}

interface UserDropdownProps {
  user: User
  onProfile: () => void
  onLogout: () => void
}

export function UserDropdown({ user, onProfile, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const tokenData = getMockTokenData()
  
  // Mock credits data - in real app this would come from user profile/API
  const creditsBalance = 0 // Default to 0 since subscription system not implemented yet

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleProfileClick = () => {
    onProfile()
    setIsOpen(false)
  }

  const handleLogoutClick = () => {
    onLogout()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
          {/* Balance Section */}
          <div className="px-4 py-3 border-b border-border">
            <div className="text-xs text-text-muted mb-2">Account Balance</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Tokens:</span>
                <span className="text-sm font-medium text-accent">{tokenData.balance.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Credits:</span>
                <span className="text-sm font-medium text-accent">{creditsBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleProfileClick}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </button>
          <hr className="border-border my-1" />
          <button
            onClick={handleLogoutClick}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
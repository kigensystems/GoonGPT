import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { PhantomWalletConnect } from './PhantomWalletConnect'
import { TokenDashboard } from './TokenDashboard'
import { EarnableActionCard } from './EarnableActionCard'
import { UserDropdown } from './UserDropdown'
import { HowItWorksStepper } from './HowItWorksStepper'
import { getMockTokenData, formatTokenAmount } from '../utils/mockTokens'

interface EarnTokensPageProps {
  onBack: () => void
  onNavigateToChat: () => void
  onNavigateToMode?: (mode: 'chat' | 'image' | 'video') => void
  onNavigate?: (view: 'chat' | 'profile' | 'earn' | 'pricing') => void
  onNeedRegistration?: (wallet: string) => void
}

export function EarnTokensPage({ onBack, onNavigateToChat, onNavigateToMode, onNavigate, onNeedRegistration }: EarnTokensPageProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Force refresh of dashboard
  const handleEarnSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }
  
  // Actions that navigate to specific modes
  const handleChatAction = () => {
    if (onNavigateToMode) {
      onNavigateToMode('chat')
    } else {
      onNavigateToChat()
    }
  }
  
  const handleImageAction = () => {
    if (onNavigateToMode) {
      onNavigateToMode('image')
    } else {
      onNavigateToChat()
    }
  }
  
  const handleVideoAction = () => {
    if (onNavigateToMode) {
      onNavigateToMode('video')
    } else {
      onNavigateToChat()
    }
  }
  
  const tokenData = getMockTokenData()
  
  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity px-2 py-1 rounded-lg"
          >
            <img 
              src="/GoonGPT-notext.png" 
              alt="GoonGPT Logo" 
              className="h-14 w-auto"
            />
            <span className="text-xl font-bold text-text-primary">
              GoonGPT
            </span>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate?.('pricing')}
            className="px-3 py-2 text-sm text-text-primary hover:text-accent transition-colors font-medium"
          >
            Pricing
          </button>
          <button
            onClick={() => onNavigate?.('earn')}
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
          {isAuthenticated && user ? (
            <UserDropdown 
              user={user} 
              onProfile={() => onNavigate?.('profile')} 
              onLogout={logout}
            />
          ) : (
            <PhantomWalletConnect
              onNeedRegistration={onNeedRegistration}
            />
          )}
        </div>
      </header>
      
      <main className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            {isAuthenticated ? (
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Welcome back!</h2>
                <p className="text-text-secondary">
                  Your wallet: {user?.wallet_address.slice(0, 6)}...{user?.wallet_address.slice(-4)}
                </p>
                <p className="text-2xl font-semibold text-accent">
                  Balance: {formatTokenAmount(tokenData.balance)}
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-bold mb-4">Earn GoonGPT Tokens</h2>
                <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
                  Connect your Phantom wallet to start earning by interacting with our AI models.
                </p>
                <div className="flex justify-center">
                  <PhantomWalletConnect
                    onNeedRegistration={onNeedRegistration}
                  />
                </div>
              </>
            )}
          </div>
          
          {/* How It Works Stepper */}
          <HowItWorksStepper />
          
          {isAuthenticated && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Earnable Actions */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-semibold mb-4">Available Actions</h3>
                
                <div className="space-y-4">
                  <EarnableActionCard
                    icon={
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    }
                    iconColor="text-purple-400"
                    actionName="Chat With Our Uncensored Model"
                    description="Have conversations with our unfiltered AI"
                    earnAmount={5}
                    onAction={handleChatAction}
                    onEarnSuccess={handleEarnSuccess}
                  />
                  
                  <EarnableActionCard
                    icon={
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                    iconColor="text-blue-400"
                    actionName="Generate An Image"
                    description="Create NSFW images with our AI models"
                    earnAmount={3}
                    onAction={handleImageAction}
                    onEarnSuccess={handleEarnSuccess}
                  />
                  
                  <EarnableActionCard
                    icon={
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    }
                    iconColor="text-orange-400"
                    actionName="Convert An Image To Video"
                    description="Transform images into animated videos"
                    earnAmount={2}
                    onAction={handleVideoAction}
                    onEarnSuccess={handleEarnSuccess}
                  />
                </div>
              </div>
              
              {/* Token Dashboard */}
              <div className="lg:col-span-1">
                <h3 className="text-xl font-semibold mb-4">Your Progress</h3>
                <TokenDashboard key={refreshKey} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
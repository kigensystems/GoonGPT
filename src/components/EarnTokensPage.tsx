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
  onNeedRegistration?: (wallet: string) => void
}

export function EarnTokensPage({ onBack, onNavigateToChat, onNeedRegistration }: EarnTokensPageProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Force refresh of dashboard
  const handleEarnSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }
  
  // Mock actions
  const handleChatAction = () => {
    onNavigateToChat()
  }
  
  const handleSummarizeAction = async () => {
    // Simulate file upload and processing
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  const handleLabelAction = async () => {
    // Simulate labeling interface
    await new Promise(resolve => setTimeout(resolve, 1500))
  }
  
  const tokenData = getMockTokenData()
  
  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">Earn Tokens</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <UserDropdown 
                user={user} 
                onProfile={() => {}} 
                onLogout={logout}
              />
            ) : (
              <PhantomWalletConnect
                onNeedRegistration={onNeedRegistration}
              />
            )}
          </div>
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
                    icon="🤖"
                    iconColor="text-purple-400"
                    actionName="Chat with Claude"
                    description="Train the Claude model by having conversations"
                    earnAmount={5}
                    onAction={handleChatAction}
                    onEarnSuccess={handleEarnSuccess}
                  />
                  
                  <EarnableActionCard
                    icon="📚"
                    iconColor="text-blue-400"
                    actionName="Summarize Article"
                    description="Feed us docs to improve summarization"
                    earnAmount={3}
                    onAction={handleSummarizeAction}
                    onEarnSuccess={handleEarnSuccess}
                  />
                  
                  <EarnableActionCard
                    icon="📝"
                    iconColor="text-orange-400"
                    actionName="Label Examples"
                    description="Help us categorize inputs for better AI responses"
                    earnAmount={2}
                    onAction={handleLabelAction}
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
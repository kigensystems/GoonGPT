import { useEffect, useState } from 'react'
import { 
  getMockTokenData, 
  getCurrentTier, 
  formatTokenAmount,
  TierLevel,
  TIER_THRESHOLDS
} from '../utils/mockTokens'
import { getServerTokenData, isAuthenticated, type ServerTokenData } from '../utils/tokenAPI'

interface TokenDashboardProps {
  onUpdate?: () => void
}

export function TokenDashboard({ onUpdate }: TokenDashboardProps) {
  const [tokenData, setTokenData] = useState(getMockTokenData())
  const [serverData, setServerData] = useState<ServerTokenData | null>(null)
  const [animateBalance, setAnimateBalance] = useState(false)
  const [useServerData, setUseServerData] = useState(false)
  
  // Refresh data periodically and on updates
  useEffect(() => {
    const refreshData = async () => {
      // Try to get server data if user is authenticated
      if (isAuthenticated()) {
        const newServerData = await getServerTokenData()
        if (newServerData) {
          if (!serverData || newServerData.token_balance !== serverData.token_balance || 
              newServerData.transactions.length !== serverData.transactions.length) {
            if (!serverData || newServerData.token_balance !== serverData.token_balance) {
              setAnimateBalance(true)
              setTimeout(() => setAnimateBalance(false), 500)
            }
            setServerData(newServerData)
            setUseServerData(true)
            onUpdate?.()
          }
          return
        }
      }
      
      // Fallback to localStorage data
      setUseServerData(false)
      const newData = getMockTokenData()
      if (newData.balance !== tokenData.balance || 
          newData.transactions.length !== tokenData.transactions.length) {
        if (newData.balance !== tokenData.balance) {
          setAnimateBalance(true)
          setTimeout(() => setAnimateBalance(false), 500)
        }
        setTokenData(newData)
        onUpdate?.()
      }
    }
    
    // Initial refresh
    refreshData()
    
    // Set up interval for real-time updates
    const interval = setInterval(refreshData, 2000) // Check every 2 seconds
    
    return () => clearInterval(interval)
  }, [tokenData.balance, tokenData.transactions.length, serverData?.token_balance, serverData?.transactions.length, onUpdate])
  
  // Use appropriate data source
  const displayData = useServerData && serverData ? {
    balance: serverData.token_balance,
    dailyEarned: serverData.daily_tokens_earned,
    transactions: serverData.transactions.map(tx => ({
      id: tx.id,
      action: tx.action,
      amount: tx.amount,
      timestamp: tx.created_at
    }))
  } : tokenData
  
  const currentTier = getCurrentTier(displayData.balance)
  
  const getTierIcon = (tier: TierLevel) => {
    switch (tier) {
      case TierLevel.TIER_1:
        // Coin - You've just started earning
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="8" />
            <path d="M12 6v12" />
            <path d="M15 9.5a4 4 0 0 0-6 0 4 4 0 0 0 6 0Z" />
          </svg>
        )
      case TierLevel.TIER_2:
        // Wallet - Building up a balance
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path d="M19 7V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1" />
            <path d="M14 13h1.5a1.5 1.5 0 0 0 0-3H14v3Z" />
            <path d="M14 13v3" />
          </svg>
        )
      case TierLevel.TIER_3:
        // Award/Medal - Meaningful milestone
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        )
      case TierLevel.TIER_4:
        // Trophy - Top-tier achievement
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55.47.98.97 1.21C11.25 18.54 11.61 19 12 19s.75-.46 1.03-.79c.5-.23.97-.66.97-1.21v-2.34" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
        )
      default:
        // Circle with dots - Start/empty state
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
          </svg>
        )
    }
  }
  
  const getTierColor = (tier: TierLevel, isActive: boolean) => {
    if (!isActive) return 'text-text-muted'
    
    switch (tier) {
      case TierLevel.TIER_1:
        return 'text-blue-400'
      case TierLevel.TIER_2:
        return 'text-green-400'
      case TierLevel.TIER_3:
        return 'text-yellow-500'
      case TierLevel.TIER_4:
        return 'text-purple-400'
      default:
        return 'text-text-secondary'
    }
  }
  
  const getTierDisplayName = (tier: TierLevel) => {
    switch (tier) {
      case TierLevel.TIER_1:
        return 'Tier 1'
      case TierLevel.TIER_2:
        return 'Tier 2'
      case TierLevel.TIER_3:
        return 'Tier 3'
      case TierLevel.TIER_4:
        return 'Tier 4'
      default:
        return 'Start'
    }
  }
  
  return (
    <div className="bg-surface rounded-lg p-6 space-y-6">
      {/* Balance Display */}
      <div className="text-center">
        <h3 className="text-sm text-text-muted mb-3">Your Balance</h3>
        <div className={`text-4xl font-bold text-text-primary transition-all duration-500 ${
          animateBalance ? 'scale-110 text-accent' : ''
        }`}>
          {formatTokenAmount(displayData.balance)}
        </div>
        <div className="text-sm text-text-muted mt-3">
          Daily Earned: {displayData.dailyEarned}/{useServerData && serverData ? serverData.daily_limit : 100} Tokens
        </div>
        
        {/* Redeem Button */}
        <button
          disabled={true}
          className="mt-4 px-6 py-3 bg-border border border-border text-text-secondary rounded-lg font-medium text-sm cursor-not-allowed flex items-center gap-2 mx-auto transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Redeem to Phantom Wallet</span>
        </button>
        <p className="text-xs text-text-muted mt-2">Tokens can be redeemed at each progress tier</p>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Progress to Tier 4</span>
          <span className="text-text-secondary">
            {Math.round((displayData.balance / TIER_THRESHOLDS[TierLevel.TIER_4]) * 100)}%
          </span>
        </div>
          
        {/* Segmented Progress Bar */}
        <div className="relative w-full h-3">
          {/* Background segments */}
          <div className="flex w-full h-full bg-bg-main rounded-full overflow-hidden">
            {[TierLevel.TIER_1, TierLevel.TIER_2, TierLevel.TIER_3, TierLevel.TIER_4].map((tier, index) => {
              const tierThreshold = TIER_THRESHOLDS[tier]
              const tiers = [TierLevel.TIER_1, TierLevel.TIER_2, TierLevel.TIER_3, TierLevel.TIER_4]
              const prevThreshold = index === 0 ? 0 : TIER_THRESHOLDS[tiers[index - 1]]
              
              // Calculate progress within this segment
              let segmentProgress = 0
              
              if (displayData.balance >= tierThreshold) {
                // Segment is completed
                segmentProgress = 100
              } else if (displayData.balance > prevThreshold) {
                // Currently progressing through this segment
                const segmentSize = tierThreshold - prevThreshold
                const progressInSegment = displayData.balance - prevThreshold
                segmentProgress = Math.min(100, (progressInSegment / segmentSize) * 100)
              }
              
              return (
                <div key={tier} className="flex-1 relative">
                  <div className="w-full h-full bg-bg-main">
                    <div 
                      className="h-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-500 ease-out"
                      style={{ width: `${segmentProgress}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Vertical tick marks */}
          <div className="absolute inset-0 flex justify-between items-center px-0">
            {[0, 1, 2, 3, 4].map((index) => (
              <div 
                key={index}
                className="w-0.5 h-4 bg-border"
                style={{ 
                  marginLeft: index === 0 ? '0' : '-1px',
                  marginRight: index === 4 ? '0' : '-1px'
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Tier Icons */}
      <div className="flex justify-center gap-6 items-start">
        {Object.entries(TIER_THRESHOLDS)
          .filter(([tier]) => tier !== TierLevel.NONE)
          .map(([tier, threshold]) => {
            const isActive = displayData.balance >= threshold
            const isCurrentTier = tier === currentTier
            const tierLevel = tier as TierLevel
            
            return (
              <div 
                key={tier}
                className={`flex flex-col items-center w-16 transition-all duration-300 ${
                  isCurrentTier ? 'scale-110' : ''
                }`}
              >
                <div className={`mb-2 flex items-center justify-center w-8 h-8 ${isCurrentTier ? 'animate-bounce' : ''} ${getTierColor(tierLevel, isActive)}`}>
                  {getTierIcon(tierLevel)}
                </div>
                <span className={`text-xs font-medium mb-1 text-center ${getTierColor(tierLevel, isActive)}`}>
                  {getTierDisplayName(tierLevel)}
                </span>
                <span className="text-xs text-text-muted text-center">
                  {formatTokenAmount(threshold)}
                </span>
              </div>
            )
          })}
      </div>
      
      {/* Recent Transactions */}
      {displayData.transactions.length > 0 && (
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-text-secondary mb-3">Recent Activity</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {displayData.transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex justify-between text-sm">
                <span className="text-text-muted">{tx.action}</span>
                <span className="text-accent">+{tx.amount} Tokens</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
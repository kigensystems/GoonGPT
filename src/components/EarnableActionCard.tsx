import { useState } from 'react'
import { type ReactNode } from 'react'
import { earnTokens, canEarnTokens, formatTokenAmount } from '../utils/mockTokens'
import { earnServerTokens, isAuthenticated } from '../utils/tokenAPI'

interface EarnableActionProps {
  icon: ReactNode
  iconColor: string
  actionName: string
  description: string
  earnAmount: number
  onAction: () => void | Promise<void>
  onEarnSuccess?: () => void
}

export function EarnableActionCard({
  icon,
  iconColor,
  actionName,
  description,
  earnAmount,
  onAction,
  onEarnSuccess
}: EarnableActionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const canEarn = canEarnTokens(earnAmount)
  
  const handleAction = async () => {
    if (!canEarn || isLoading) return
    
    setIsLoading(true)
    try {
      // Perform the action
      await onAction()
      
      // Earn tokens - prefer server if authenticated, fallback to local
      let earned = false
      if (isAuthenticated()) {
        console.log('🔍 CLIENT: Attempting to earn server tokens:', earnAmount, actionName)
        const result = await earnServerTokens(earnAmount, actionName)
        console.log('🔍 CLIENT: Server token result:', result)
        earned = result.success
        if (!earned) {
          console.error('❌ CLIENT: Failed to earn server tokens:', result.error)
          // Show user-friendly error for daily limit
          if (result.error?.includes('Daily earning limit reached')) {
            alert(result.error)
          }
        } else {
          console.log('✅ CLIENT: Successfully earned tokens:', result)
        }
      } else {
        console.log('🔍 CLIENT: Not authenticated, using localStorage tokens')
        earned = earnTokens(actionName, earnAmount)
      }
      
      if (earned) {
        setShowSuccess(true)
        onEarnSuccess?.()
        
        // Hide success message after 2 seconds
        setTimeout(() => setShowSuccess(false), 2000)
      }
    } catch (error) {
      console.error('Error performing action:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="bg-surface rounded-lg p-6 hover:bg-surface-hover transition-all duration-200 relative group">
      {/* Success Animation */}
      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-10">
          <div className="text-accent text-2xl font-bold animate-ping">
            +{earnAmount} Tokens
          </div>
        </div>
      )}
      
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`${iconColor} flex-shrink-0`}>
          {icon}
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {actionName}
          </h3>
          <p className="text-sm text-text-muted mb-3">
            {description}
          </p>
          
          {/* Reward */}
          <div className="flex items-center justify-between">
            <span className="text-accent font-medium">
              Earns {formatTokenAmount(earnAmount)}
            </span>
            
            {/* Action Button */}
            <button
              onClick={handleAction}
              disabled={!canEarn || isLoading}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                canEarn && !isLoading
                  ? 'bg-accent text-white hover:bg-accent-hover'
                  : 'bg-surface text-text-muted cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <span>{canEarn ? 'Use Model' : 'Daily Limit Reached'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
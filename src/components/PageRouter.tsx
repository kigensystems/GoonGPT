import { useLocation, useNavigate } from 'react-router-dom'
import { ProfilePage } from './ProfilePage'
import { PricingPage } from './PricingPage'
import { EarnTokensPage } from './EarnTokensPage'
import { LegalPage } from './LegalPage'
import { Mode } from './WelcomeScreen'

export type ViewType = 'chat' | 'profile' | 'pricing' | 'earn' | 'legal'

interface PageRouterProps {
  onNeedRegistration: (wallet: string) => void
  onNavigateToMode: (mode: Mode) => void
}

export function PageRouter({ onNeedRegistration, onNavigateToMode }: PageRouterProps) {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Determine current view from URL
  const getCurrentView = (): ViewType => {
    const path = location.pathname
    if (path === '/tokens') return 'earn'
    if (path === '/pricing') return 'pricing'
    if (path === '/profile') return 'profile'
    if (path === '/legal') return 'legal'
    return 'chat'
  }
  
  const currentView = getCurrentView()

  return (
    <>
      {/* Profile Page */}
      {currentView === 'profile' && (
        <ProfilePage />
      )}

      {/* Pricing Page */}
      {currentView === 'pricing' && (
        <PricingPage
          onNeedRegistration={onNeedRegistration}
        />
      )}

      {/* Earn Tokens Page */}
      {currentView === 'earn' && (
        <EarnTokensPage 
          onNavigateToMode={(mode) => {
            navigate('/')
            onNavigateToMode(mode)
          }}
          onNeedRegistration={onNeedRegistration}
        />
      )}

      {/* Legal Page */}
      {currentView === 'legal' && (
        <LegalPage />
      )}
    </>
  )
}

export function useCurrentView(): ViewType {
  const location = useLocation()
  
  const getCurrentView = (): ViewType => {
    const path = location.pathname
    if (path === '/tokens') return 'earn'
    if (path === '/pricing') return 'pricing'
    if (path === '/profile') return 'profile'
    if (path === '/legal') return 'legal'
    return 'chat'
  }
  
  return getCurrentView()
}
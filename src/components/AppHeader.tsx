import { Link } from 'react-router-dom'
import { User } from '../types/user'
import { UserDropdown } from './UserDropdown'
import { PhantomWalletConnect } from './PhantomWalletConnect'

interface AppHeaderProps {
  isAuthenticated: boolean
  user: User | null
  onLogout: () => Promise<void>
  onNeedRegistration: (wallet: string) => void
  onLogoClick: () => void
}

export function AppHeader({ 
  isAuthenticated, 
  user, 
  onLogout, 
  onNeedRegistration,
  onLogoClick 
}: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <Link 
          to="/"
          onClick={onLogoClick}
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
        </Link>
      </div>
      
      <div className="flex items-center gap-3">
        <Link
          to="/pricing"
          className="px-3 py-2 text-sm text-text-primary hover:text-accent transition-colors font-medium"
        >
          Pricing
        </Link>
        <Link
          to="/tokens"
          className="px-3 py-2 text-sm text-text-primary hover:text-accent transition-colors font-medium"
        >
          Earn Tokens
        </Link>
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
            onLogout={onLogout}
          />
        ) : (
          <PhantomWalletConnect
            onNeedRegistration={onNeedRegistration}
          />
        )}
      </div>
    </header>
  )
}
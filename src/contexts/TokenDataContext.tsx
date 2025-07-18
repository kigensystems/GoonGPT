import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getServerTokenData, type ServerTokenData } from '../utils/tokenAPI'
import { useAuth } from './AuthContext'

interface TokenDataContextType {
  serverData: ServerTokenData | null
  isLoading: boolean
  error: string | null
  refreshData: () => Promise<void>
  lastFetch: Date | null
}

const TokenDataContext = createContext<TokenDataContextType | undefined>(undefined)

// Minimum time between fetches (in ms)
const FETCH_COOLDOWN = 5000 // 5 seconds

export function TokenDataProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [serverData, setServerData] = useState<ServerTokenData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const refreshData = useCallback(async () => {
    // Check cooldown
    if (lastFetch && Date.now() - lastFetch.getTime() < FETCH_COOLDOWN) {
      // Skipping fetch due to cooldown
      return
    }

    // Only fetch if authenticated and visible
    if (!isAuthenticated || !isVisible || isLoading) {
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      // Fetching server data
      const data = await getServerTokenData()
      if (data) {
        setServerData(data)
        setLastFetch(new Date())
      } else {
        setError('Failed to fetch token data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, isVisible, isLoading, lastFetch])

  // Initial fetch and periodic refresh
  useEffect(() => {
    if (isAuthenticated) {
      refreshData()
    }

    // Set up periodic refresh
    const interval = setInterval(() => {
      if (isVisible && isAuthenticated) {
        refreshData()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [isAuthenticated, isVisible, refreshData])

  return (
    <TokenDataContext.Provider value={{ serverData, isLoading, error, refreshData, lastFetch }}>
      {children}
    </TokenDataContext.Provider>
  )
}

export function useTokenData() {
  const context = useContext(TokenDataContext)
  if (context === undefined) {
    throw new Error('useTokenData must be used within a TokenDataProvider')
  }
  return context
}
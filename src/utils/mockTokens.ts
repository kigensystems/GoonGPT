export interface TokenTransaction {
  id: string
  action: string
  amount: number
  timestamp: string
}

export interface MockTokenData {
  balance: number
  dailyEarned: number
  lastEarnDate: string
  transactions: TokenTransaction[]
}

export enum TierLevel {
  NONE = 'NONE',
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3',
  TIER_4 = 'TIER_4'
}

export const TIER_THRESHOLDS = {
  [TierLevel.NONE]: 0,
  [TierLevel.TIER_1]: 1000,
  [TierLevel.TIER_2]: 5000,
  [TierLevel.TIER_3]: 10000,
  [TierLevel.TIER_4]: 25000,
}

const STORAGE_KEY = 'goongpt_mock_tokens'
const DAILY_LIMIT = 100

export function getMockTokenData(): MockTokenData {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const data = JSON.parse(stored) as MockTokenData
      // Check if it's a new day
      const today = new Date().toDateString()
      if (data.lastEarnDate !== today) {
        data.dailyEarned = 0
        data.lastEarnDate = today
        saveMockTokenData(data)
      }
      return data
    } catch (error) {
      console.error('Error parsing mock token data:', error)
    }
  }
  
  // Return default data
  const defaultData: MockTokenData = {
    balance: 0,
    dailyEarned: 0,
    lastEarnDate: new Date().toDateString(),
    transactions: []
  }
  saveMockTokenData(defaultData)
  return defaultData
}

export function saveMockTokenData(data: MockTokenData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function canEarnTokens(amount: number): boolean {
  const data = getMockTokenData()
  return data.dailyEarned + amount <= DAILY_LIMIT
}

export function earnTokens(action: string, amount: number): boolean {
  if (!canEarnTokens(amount)) {
    return false
  }
  
  const data = getMockTokenData()
  data.balance += amount
  data.dailyEarned += amount
  
  // Add transaction
  const transaction: TokenTransaction = {
    id: Date.now().toString(),
    action,
    amount,
    timestamp: new Date().toISOString()
  }
  data.transactions.unshift(transaction) // Add to beginning
  
  // Keep only last 50 transactions
  if (data.transactions.length > 50) {
    data.transactions = data.transactions.slice(0, 50)
  }
  
  saveMockTokenData(data)
  return true
}

export function getCurrentTier(balance: number): TierLevel {
  if (balance >= TIER_THRESHOLDS[TierLevel.TIER_4]) return TierLevel.TIER_4
  if (balance >= TIER_THRESHOLDS[TierLevel.TIER_3]) return TierLevel.TIER_3
  if (balance >= TIER_THRESHOLDS[TierLevel.TIER_2]) return TierLevel.TIER_2
  if (balance >= TIER_THRESHOLDS[TierLevel.TIER_1]) return TierLevel.TIER_1
  return TierLevel.NONE
}

export function getNextTier(currentTier: TierLevel): TierLevel | null {
  switch (currentTier) {
    case TierLevel.NONE: return TierLevel.TIER_1
    case TierLevel.TIER_1: return TierLevel.TIER_2
    case TierLevel.TIER_2: return TierLevel.TIER_3
    case TierLevel.TIER_3: return TierLevel.TIER_4
    case TierLevel.TIER_4: return null
  }
}

export function getProgressToNextTier(balance: number): { 
  percentage: number
  current: number
  needed: number
  nextTier: TierLevel | null
} {
  const currentTier = getCurrentTier(balance)
  const nextTier = getNextTier(currentTier)
  
  if (!nextTier) {
    return { percentage: 100, current: balance, needed: 0, nextTier: null }
  }
  
  const currentThreshold = currentTier === TierLevel.NONE ? 0 : TIER_THRESHOLDS[currentTier]
  const nextThreshold = TIER_THRESHOLDS[nextTier]
  const progress = balance - currentThreshold
  const total = nextThreshold - currentThreshold
  
  return {
    percentage: Math.min(100, (progress / total) * 100),
    current: balance,
    needed: nextThreshold - balance,
    nextTier
  }
}

export function formatTokenAmount(amount: number): string {
  return `${amount.toLocaleString()} Tokens`
}
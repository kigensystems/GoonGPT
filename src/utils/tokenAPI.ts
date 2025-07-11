export interface TokenTransaction {
  id: string
  action: string
  amount: number
  created_at: string
}

export interface ServerTokenData {
  token_balance: number
  total_tokens_earned: number
  credits_balance: number
  daily_tokens_earned?: number
  daily_remaining?: number
  daily_limit?: number
  last_earn_date?: string
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/.netlify/functions'

// Get user's current token data from server
export async function getServerTokenData(): Promise<ServerTokenData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/get-token-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add auth header if available
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` })
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        // User not authenticated, return null
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching server token data:', error)
    return null
  }
}

// Earn tokens on the server (with daily cap)
export async function earnServerTokens(amount: number, action: string = 'Activity'): Promise<{
  success: boolean
  tokensEarned?: number
  newBalance?: number
  dailyEarned?: number
  dailyRemaining?: number
  error?: string
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/earn-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` })
      },
      body: JSON.stringify({ amount, action })
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`
      }
    }

    return {
      success: true,
      tokensEarned: data.tokensEarned,
      newBalance: data.newBalance,
      dailyEarned: data.dailyEarned,
      dailyRemaining: data.dailyRemaining
    }
  } catch (error) {
    console.error('Error earning server tokens:', error)
    return {
      success: false,
      error: 'Failed to earn tokens'
    }
  }
}

// Helper function to get auth token from the auth context session
function getAuthToken(): string | null {
  try {
    const storedSession = localStorage.getItem('goongpt_session');
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      // Check if session is expired
      if (new Date(parsedSession.expires_at) > new Date()) {
        return parsedSession.token;
      } else {
        localStorage.removeItem('goongpt_session');
      }
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return null;
}

// Check if user is authenticated (has valid token)
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}
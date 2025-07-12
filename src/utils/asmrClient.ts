const API_BASE = '/.netlify/functions'

interface AsmrResponse {
  success: boolean
  audio_url?: string
  message?: string
  error?: string
}

export const asmrClient = {
  async generateAudio(text: string, walletAddress?: string): Promise<AsmrResponse> {
    try {
      const response = await fetch(`${API_BASE}/asmr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          wallet_address: walletAddress,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('ASMR generation error:', error)
      throw error
    }
  }
}
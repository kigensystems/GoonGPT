const API_BASE = '/.netlify/functions'

interface AsmrResponse {
  success: boolean
  audio_url?: string
  message?: string
  error?: string
  details?: string
  eta?: number
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

      const data = await response.json().catch(() => ({ 
        error: 'Network error', 
        details: 'Failed to parse response' 
      }))

      console.log('[ASMRClient] Response:', {
        status: response.status,
        data: data,
        hasAudioUrl: !!data.audio_url,
        audioUrl: data.audio_url
      })

      if (!response.ok) {
        console.error('ASMR API error:', response.status, data)
        throw new Error(data.error || `HTTP ${response.status}: ${data.details || 'Unknown error'}`)
      }

      // Handle async processing (202 status)
      if (response.status === 202) {
        console.log('ASMR audio generation in progress:', data)
        throw new Error(data.message || 'Audio generation in progress, please try again')
      }

      return data
    } catch (error) {
      console.error('ASMR generation error:', error)
      throw error
    }
  }
}
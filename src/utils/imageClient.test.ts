import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { imageClient } from './imageClient'

// Mock fetch globally
global.fetch = vi.fn()

// Mock import.meta.env
const originalEnv = (import.meta as any).env

describe('ImageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(import.meta as any).env = { DEV: false }
  })

  afterEach(() => {
    vi.clearAllMocks()
    ;(import.meta as any).env = originalEnv
  })

  describe('Environment Configuration', () => {
    it('uses localhost URL in development', () => {
      ;(import.meta as any).env = { DEV: true }
      const client = new (imageClient.constructor as any)()
      expect(client.baseUrl).toBe('http://localhost:8888')
    })

    it('uses relative URL in production', () => {
      ;(import.meta as any).env = { DEV: false }
      const client = new (imageClient.constructor as any)()
      expect(client.baseUrl).toBe('')
    })
  })

  describe('generateImage', () => {
    const mockSuccessResponse = {
      success: true,
      imageUrl: 'https://example.com/generated.jpg',
      images: ['https://example.com/generated.jpg'],
      prompt: 'test prompt',
      meta: { seed: 12345 }
    }

    it('sends correct request parameters', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse
      } as Response)

      await imageClient.generateImage('A beautiful sunset', 512, 768, {
        negative_prompt: 'ugly, blurry',
        samples: 2,
        safety_checker: true,
        seed: 42,
        enhance_prompt: false,
        enhance_style: 'photographic',
        wallet_address: '0x123'
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/.netlify/functions/image',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: 'A beautiful sunset',
            width: 512,
            height: 768,
            negative_prompt: 'ugly, blurry',
            samples: 2,
            safety_checker: true,
            seed: 42,
            enhance_prompt: false,
            enhance_style: 'photographic',
            wallet_address: '0x123'
          })
        }
      )
    })

    it('uses default parameters when not provided', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse
      } as Response)

      await imageClient.generateImage('Test prompt')

      const body = JSON.parse(
        (vi.mocked(global.fetch).mock.calls[0][1] as any).body
      )

      expect(body).toMatchObject({
        prompt: 'Test prompt',
        width: 1024,
        height: 1024
      })
      // Options should be spread but empty
      expect(body.negative_prompt).toBeUndefined()
      expect(body.samples).toBeUndefined()
    })

    it('returns successful response data', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse
      } as Response)

      const result = await imageClient.generateImage('Test prompt')

      expect(result).toEqual(mockSuccessResponse)
    })

    describe('Error Handling', () => {
      it('handles rate limiting with proper error details', async () => {
        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Headers({
            'Retry-After': '60',
            'X-RateLimit-User': 'true'
          }),
          json: async () => ({
            error: 'Rate limit exceeded',
            remaining: 0,
            limit: 10
          })
        } as Response)

        await expect(imageClient.generateImage('Test')).rejects.toThrow(
          'Rate limit exceeded Please wait 60 seconds before trying again. (Limit: 10 requests per minute)'
        )

        try {
          await imageClient.generateImage('Test')
        } catch (error: any) {
          expect(error.rateLimited).toBe(true)
          expect(error.retryAfter).toBe('60')
          expect(error.remaining).toBe(0)
          expect(error.limit).toBe(10)
        }
      })

      it('handles rate limiting without retry header', async () => {
        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Headers(),
          json: async () => ({
            error: 'Too many requests'
          })
        } as Response)

        await expect(imageClient.generateImage('Test')).rejects.toThrow(
          'Too many requests'
        )
      })

      it('handles general HTTP errors', async () => {
        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({
            error: 'Internal server error'
          })
        } as Response)

        await expect(imageClient.generateImage('Test')).rejects.toThrow(
          'Internal server error'
        )
      })

      it('handles HTTP errors without error message', async () => {
        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({})
        } as Response)

        await expect(imageClient.generateImage('Test')).rejects.toThrow(
          'HTTP error! status: 503'
        )
      })

      it('handles processing status response', async () => {
        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: 'processing',
            eta: 30
          })
        } as Response)

        await expect(imageClient.generateImage('Test')).rejects.toThrow(
          'Image is still processing. ETA: 30 seconds'
        )
      })

      it('handles processing without ETA', async () => {
        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: 'processing'
          })
        } as Response)

        await expect(imageClient.generateImage('Test')).rejects.toThrow(
          'Image is still processing. ETA: unknown seconds'
        )
      })

      it('handles failed generation', async () => {
        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: false,
            details: 'NSFW content detected'
          })
        } as Response)

        await expect(imageClient.generateImage('Test')).rejects.toThrow(
          'NSFW content detected'
        )
      })

      it('handles failed generation without details', async () => {
        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: false
          })
        } as Response)

        await expect(imageClient.generateImage('Test')).rejects.toThrow(
          'Image generation failed'
        )
      })

      it('handles network errors', async () => {
        vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

        await expect(imageClient.generateImage('Test')).rejects.toThrow(
          'Network error'
        )
      })

      it('logs errors to console', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Test error'))

        try {
          await imageClient.generateImage('Test')
        } catch {
          // Expected to throw
        }

        expect(consoleSpy).toHaveBeenCalledWith(
          'Error generating image:',
          expect.any(Error)
        )

        consoleSpy.mockRestore()
      })
    })

    describe('Table-driven tests for dimensions', () => {
      const dimensionTests = [
        { width: 256, height: 256, description: 'small square' },
        { width: 512, height: 512, description: 'medium square' },
        { width: 1024, height: 1024, description: 'large square' },
        { width: 1920, height: 1080, description: 'landscape HD' },
        { width: 1080, height: 1920, description: 'portrait HD' },
        { width: 2048, height: 2048, description: 'max size' }
      ]

      dimensionTests.forEach(({ width, height, description }) => {
        it(`handles ${description} dimensions (${width}x${height})`, async () => {
          vi.mocked(global.fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => mockSuccessResponse
          } as Response)

          await imageClient.generateImage('Test', width, height)

          const body = JSON.parse(
            (vi.mocked(global.fetch).mock.calls[0][1] as any).body
          )

          expect(body.width).toBe(width)
          expect(body.height).toBe(height)
        })
      })
    })

    describe('Table-driven tests for options', () => {
      const optionTests = [
        {
          options: { negative_prompt: 'ugly' },
          expected: { negative_prompt: 'ugly' },
          description: 'negative prompt only'
        },
        {
          options: { samples: 4 },
          expected: { samples: 4 },
          description: 'multiple samples'
        },
        {
          options: { safety_checker: false },
          expected: { safety_checker: false },
          description: 'disabled safety checker'
        },
        {
          options: { seed: 12345 },
          expected: { seed: 12345 },
          description: 'fixed seed'
        },
        {
          options: { enhance_prompt: true, enhance_style: 'anime' },
          expected: { enhance_prompt: true, enhance_style: 'anime' },
          description: 'prompt enhancement with style'
        },
        {
          options: {
            negative_prompt: 'bad',
            samples: 2,
            safety_checker: true,
            seed: 999,
            enhance_prompt: false,
            wallet_address: '0xABC'
          },
          expected: {
            negative_prompt: 'bad',
            samples: 2,
            safety_checker: true,
            seed: 999,
            enhance_prompt: false,
            wallet_address: '0xABC'
          },
          description: 'all options combined'
        }
      ]

      optionTests.forEach(({ options, expected, description }) => {
        it(`handles ${description}`, async () => {
          vi.mocked(global.fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => mockSuccessResponse
          } as Response)

          await imageClient.generateImage('Test', 1024, 1024, options)

          const body = JSON.parse(
            (vi.mocked(global.fetch).mock.calls[0][1] as any).body
          )

          Object.entries(expected).forEach(([key, value]) => {
            expect(body[key]).toBe(value)
          })
        })
      })
    })
  })

  describe('Singleton Pattern', () => {
    it('exports a singleton instance', () => {
      expect(imageClient).toBeDefined()
      expect(imageClient.generateImage).toBeDefined()
      expect(typeof imageClient.generateImage).toBe('function')
    })

    it('maintains same instance across imports', () => {
      const instance1 = imageClient
      const instance2 = imageClient
      expect(instance1).toBe(instance2)
    })
  })
})
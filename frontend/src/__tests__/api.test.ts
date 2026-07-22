import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiError } from '../services/api'

describe('ApiError', () => {
  it('should create an error with status and message', () => {
    const err = new ApiError('Not found', 404)
    expect(err.message).toBe('Not found')
    expect(err.status).toBe(404)
    expect(err.name).toBe('ApiError')
  })
})

describe('apiRequest', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should throw ApiError on timeout', async () => {
    vi.stubGlobal('fetch', () => new Promise(() => {}))
    vi.stubGlobal('setTimeout', vi.fn().mockReturnValue(1))
    vi.stubGlobal('clearTimeout', vi.fn())

    const { apiRequest } = await import('../services/api')
    await expect(apiRequest('/test')).rejects.toThrow()
  })
})

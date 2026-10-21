import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchEventCountsByCategory, fetchEventCountsByLocation } from './eventCounts.js'

const okResponse = (rows) => ({ ok: true, json: async () => rows })

describe('eventCounts API client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('requests the category endpoint', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(okResponse([{ count: 1 }]))
    await expect(fetchEventCountsByCategory()).resolves.toEqual([{ count: 1 }])
    expect(globalThis.fetch.mock.calls[0][0]).toBe('http://localhost:8000/event-counts/category')
  })

  it('requests the location endpoint', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(okResponse([{ count: 2 }]))
    await expect(fetchEventCountsByLocation()).resolves.toEqual([{ count: 2 }])
    expect(globalThis.fetch.mock.calls[0][0]).toBe('http://localhost:8000/event-counts/location')
  })

  it('classifies network failures as API-down connection errors', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(fetchEventCountsByCategory()).rejects.toMatchObject({
      message: 'API server is down! Please check the API server.',
      isConnectionError: true,
    })
  })
})

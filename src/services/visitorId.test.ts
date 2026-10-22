import { afterEach, describe, expect, it, vi } from 'vitest'
import { getVisitorId, VISITOR_ID_STORAGE_KEY } from '../../services/visitorId'

describe('getVisitorId', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('creates and persists a UUID v4 for the browser', () => {
    const randomUUID = vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '11111111-1111-4111-8111-111111111111',
    )

    expect(getVisitorId()).toBe('11111111-1111-4111-8111-111111111111')
    expect(localStorage.getItem(VISITOR_ID_STORAGE_KEY)).toBe(
      '11111111-1111-4111-8111-111111111111',
    )
    expect(getVisitorId()).toBe('11111111-1111-4111-8111-111111111111')
    expect(randomUUID).toHaveBeenCalledOnce()
  })

  it('replaces invalid or non-v4 values in storage', () => {
    localStorage.setItem(VISITOR_ID_STORAGE_KEY, 'not-a-uuid')
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '22222222-2222-4222-8222-222222222222',
    )

    expect(getVisitorId()).toBe('22222222-2222-4222-8222-222222222222')
    expect(localStorage.getItem(VISITOR_ID_STORAGE_KEY)).toBe(
      '22222222-2222-4222-8222-222222222222',
    )
  })
})

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../services/apiClient'
import { useUpdateWatchlistEntryMutation } from './useUpdateWatchlistEntryMutation'
import { watchlistQueryKey } from './useWatchlistQuery'

vi.mock('../../services/apiClient', () => ({
  apiClient: { patch: vi.fn() },
}))

const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } })

const makeWrapper =
  (client: QueryClient) =>
  ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )

afterEach(() => vi.clearAllMocks())

describe('useUpdateWatchlistEntryMutation', () => {
  it('patches the entry and refreshes its watchlist data', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { id: 8 } })
    const client = makeClient()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const { result } = renderHook(() => useUpdateWatchlistEntryMutation(), {
      wrapper: makeWrapper(client),
    })

    await act(async () => {
      await result.current.mutateAsync({
        id: 8,
        tmdbId: 42,
        mediaType: 'tv',
        update: { status: 'watched', rating: 9, review: 'A favorite.' },
      })
    })

    expect(apiClient.patch).toHaveBeenCalledWith('/entry/8', {
      status: 'watched',
      rating: 9,
      review: 'A favorite.',
    })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: watchlistQueryKey })
    expect(invalidate).toHaveBeenCalledTimes(1)
    client.clear()
  })

  it('keeps API failures available to the caller for recovery', async () => {
    const error = new Error('Unable to update')
    vi.mocked(apiClient.patch).mockRejectedValue(error)
    const client = makeClient()
    const { result } = renderHook(() => useUpdateWatchlistEntryMutation(), {
      wrapper: makeWrapper(client),
    })

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          id: 8,
          tmdbId: 42,
          mediaType: 'movie',
          update: { rating: null },
        }),
      ).rejects.toBe(error)
    })

    client.clear()
  })
})

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../services/apiClient'
import { useAddToWatchlistMutation } from './useAddToWatchlistMutation'
import { useRemoveFromWatchlistMutation } from './useRemoveFromWatchlistMutation'
import { watchlistQueryKey } from './useWatchlistQuery'

vi.mock('../../services/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } })

const makeWrapper =
  (client: QueryClient) =>
  ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )

afterEach(() => vi.clearAllMocks())

describe('watchlist mutations', () => {
  it('creates a TV entry with its media type', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 8 } })
    const client = makeClient()
    const { result } = renderHook(() => useAddToWatchlistMutation(), {
      wrapper: makeWrapper(client),
    })

    await act(async () => {
      await result.current.mutateAsync({ tmdb_id: 42, media_type: 'tv' })
    })

    expect(apiClient.post).toHaveBeenCalledWith('/entry', {
      tmdb_id: 42,
      media_type: 'tv',
      status: 'want',
    })
    client.clear()
  })

  it('removes only the matching media type when IDs overlap', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ data: null })
    const client = makeClient()
    client.setQueryData(watchlistQueryKey, [
      { id: 1, tmdb_id: 42, media_type: 'movie' },
      { id: 2, tmdb_id: 42, media_type: 'tv' },
    ])
    const { result } = renderHook(() => useRemoveFromWatchlistMutation(), {
      wrapper: makeWrapper(client),
    })

    await act(async () => {
      await result.current.mutateAsync({ tmdb_id: 42, media_type: 'tv' })
    })

    expect(apiClient.delete).toHaveBeenCalledExactlyOnceWith('/entry/2')
    client.clear()
  })
})

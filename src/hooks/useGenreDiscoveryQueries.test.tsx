import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../services/apiClient'
import { useGenreDiscoveryQueries } from './useGenreDiscoveryQueries'

vi.mock('../../services/apiClient', () => ({
  apiClient: { get: vi.fn() },
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return { Wrapper, queryClient }
}

describe('useGenreDiscoveryQueries', () => {
  it('starts all per-media-type genre requests together', async () => {
    const pendingRequests: Array<(value: unknown) => void> = []
    vi.mocked(apiClient.get).mockImplementation(
      () =>
        new Promise((resolve) => {
          pendingRequests.push(resolve)
        }) as never,
    )
    const { Wrapper, queryClient } = createWrapper()
    const { unmount } = renderHook(() => useGenreDiscoveryQueries(), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(4))
    expect(apiClient.get).toHaveBeenNthCalledWith(1, '/movies/discover', {
      params: { with_genres: '27|53' },
    })
    expect(apiClient.get).toHaveBeenNthCalledWith(2, '/tv/discover', {
      params: { with_genres: '9648' },
    })
    expect(apiClient.get).toHaveBeenNthCalledWith(3, '/movies/discover', {
      params: { with_genres: '28|12' },
    })
    expect(apiClient.get).toHaveBeenNthCalledWith(4, '/tv/discover', {
      params: { with_genres: '10759' },
    })

    pendingRequests.forEach((resolve) => resolve({ data: { results: [] } }))
    unmount()
    queryClient.clear()
  })

  it('normalizes movie and TV fields while preserving composite identity', async () => {
    vi.mocked(apiClient.get).mockImplementation(async (path) => {
      const isTv = path === '/tv/discover'
      return {
        data: {
          results: [
            isTv
              ? {
                  id: 7,
                  name: 'A Mystery Show',
                  first_air_date: '2022-04-03',
                  poster_path: null,
                  media_type: 'tv',
                }
              : {
                  id: 7,
                  title: 'A Suspense Film',
                  release_date: '2021-02-01',
                  poster_path: '/poster.jpg',
                  media_type: 'movie',
                },
          ],
        },
      } as never
    })
    const { Wrapper, queryClient } = createWrapper()
    const { result, unmount } = renderHook(() => useGenreDiscoveryQueries(), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current[0].items).toHaveLength(2))
    expect(result.current[0].items).toEqual([
      {
        id: 7,
        title: 'A Suspense Film',
        release_date: '2021-02-01',
        poster_path: '/poster.jpg',
        media_type: 'movie',
      },
      {
        id: 7,
        title: 'A Mystery Show',
        release_date: '2022-04-03',
        poster_path: null,
        media_type: 'tv',
      },
    ])

    unmount()
    queryClient.clear()
  })
})

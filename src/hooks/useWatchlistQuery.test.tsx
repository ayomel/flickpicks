import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../services/apiClient'
import { useWatchlistTitles } from './useWatchlistQuery'

vi.mock('../../services/apiClient', () => ({
  apiClient: { get: vi.fn() },
}))

const entries = [
  { id: 1, tmdb_id: 42, media_type: 'movie' },
  { id: 2, tmdb_id: 42, media_type: 'tv' },
] as const

describe('useWatchlistTitles', () => {
  it('loads same-ID movies and TV shows from their detail routes', async () => {
    vi.mocked(apiClient.get).mockImplementation(async (url) => {
      if (url === '/entry') return { data: entries } as never
      if (url === '/movies/42') {
        return {
          data: {
            id: 42,
            title: 'Movie twin',
            poster_path: '/movie.jpg',
            backdrop_path: '/movie-backdrop.jpg',
            release_date: '2001-01-01',
            runtime: 123,
            genres: [{ id: 18, name: 'Drama' }],
            streaming_providers: { flatrate: [] },
            trailer: 'https://youtube.com/watch?v=movie123',
            videos: { results: [] },
          },
        } as never
      }
      if (url === '/tv/42') {
        return {
          data: {
            id: 42,
            name: 'TV twin',
            poster_path: '/tv.jpg',
            backdrop_path: '/tv-backdrop.jpg',
            first_air_date: '2020-01-01',
            episode_run_time: [44],
            genres: [{ id: 9648, name: 'Mystery' }],
            streaming_providers: { rent: [] },
            trailer: null,
            videos: { results: [] },
          },
        } as never
      }
      throw new Error(`Unexpected URL: ${url}`)
    })

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const { result } = renderHook(() => useWatchlistTitles(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    })

    await waitFor(() => expect(result.current.titles).toHaveLength(2))
    expect(result.current.titles).toEqual([
      {
        id: 42,
        title: 'Movie twin',
        poster_path: '/movie.jpg',
        backdrop_path: '/movie-backdrop.jpg',
        release_date: '2001-01-01',
        media_type: 'movie',
        runtime: 123,
        genres: [{ id: 18, name: 'Drama' }],
        streaming_providers: { flatrate: [] },
        trailer: 'https://youtube.com/watch?v=movie123',
        videos: { results: [] },
      },
      {
        id: 42,
        title: 'TV twin',
        poster_path: '/tv.jpg',
        backdrop_path: '/tv-backdrop.jpg',
        release_date: '2020-01-01',
        media_type: 'tv',
        episode_run_time: [44],
        genres: [{ id: 9648, name: 'Mystery' }],
        streaming_providers: { rent: [] },
        trailer: null,
        videos: { results: [] },
      },
    ])
    expect(apiClient.get).toHaveBeenCalledWith('/movies/42')
    expect(apiClient.get).toHaveBeenCalledWith('/tv/42')
    client.clear()
  })
})

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { apiClient } from '../../../services/apiClient'
import { BecauseYouRatedRow } from './BecauseYouRatedRow'
import type { WatchlistTitle } from '@/hooks/useWatchlistQuery'
import type { WatchlistEntryRead } from '@/types/watchlist'

vi.mock('../../../services/apiClient', () => ({
  apiClient: { get: vi.fn() },
}))

const entry = (
  id: number,
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  status: 'want' | 'watched',
  rating: number | null,
) =>
  ({
    id,
    tmdb_id: tmdbId,
    media_type: mediaType,
    status,
    rating,
    review: '',
    added_by: 'visitor',
    created_at: '',
    updated_at: '',
  }) satisfies WatchlistEntryRead

const title = (
  id: number,
  mediaType: 'movie' | 'tv',
  name: string,
): WatchlistTitle => ({
  id,
  title: name,
  poster_path: null,
  release_date: '2024-01-01',
  media_type: mediaType,
})

const renderRow = (entries: WatchlistEntryRead[], titles: WatchlistTitle[]) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <BecauseYouRatedRow entries={entries} titles={titles} />
      </MemoryRouter>
    </QueryClientProvider>,
  )

  return queryClient
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('BecauseYouRatedRow', () => {
  it('shows recommendations from high-rated watched seeds, filtering saved titles and duplicate results', async () => {
    const entries = [
      entry(1, 101, 'movie', 'watched', 9),
      entry(2, 202, 'tv', 'watched', 8),
      entry(3, 303, 'movie', 'want', 10),
      entry(4, 404, 'tv', 'watched', 7),
      entry(5, 505, 'tv', 'want', null),
    ]
    vi.mocked(apiClient.get).mockImplementation(async (url) => {
      if (url === '/movies/101/recommendations') {
        return {
          data: {
            results: [
              {
                id: 606,
                title: 'Arrival',
                poster_path: null,
                release_date: '2016-09-01',
                media_type: 'movie',
              },
              {
                id: 505,
                name: 'Saved show',
                poster_path: null,
                first_air_date: '2010-01-01',
                media_type: 'tv',
              },
            ],
          },
        } as never
      }
      if (url === '/tv/202/recommendations') {
        return {
          data: {
            results: [
              {
                id: 606,
                title: 'Duplicate Arrival',
                poster_path: null,
                release_date: '2016-09-01',
                media_type: 'movie',
              },
              {
                id: 606,
                name: 'Same ID TV',
                poster_path: null,
                first_air_date: '2020-01-01',
                media_type: 'tv',
              },
            ],
          },
        } as never
      }
      throw new Error(`Unexpected URL: ${url}`)
    })

    const queryClient = renderRow(entries, [
      title(101, 'movie', 'Dune: Part Two'),
      title(202, 'tv', 'Severance'),
    ])

    expect(
      await screen.findByText(/because you rated dune: part two 9\/10/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/also based on your 8\/10 rating of Severance/i),
    ).toBeInTheDocument()

    const arrival = await screen.findByRole('link', { name: /arrival/i })
    expect(arrival).toHaveAttribute('href', '/movies/606')
    expect(within(arrival).getByText('Movie')).toBeInTheDocument()

    const sameIdTv = screen.getByRole('link', { name: /same id tv/i })
    expect(sameIdTv).toHaveAttribute('href', '/tv/606')
    expect(within(sameIdTv).getByText('TV')).toBeInTheDocument()

    expect(
      screen.queryByRole('link', { name: /saved show/i }),
    ).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /arrival/i })).toHaveLength(1)
    expect(apiClient.get).toHaveBeenCalledWith('/movies/101/recommendations')
    expect(apiClient.get).toHaveBeenCalledWith('/tv/202/recommendations')
    expect(apiClient.get).not.toHaveBeenCalledWith(
      '/movies/303/recommendations',
    )
    expect(apiClient.get).not.toHaveBeenCalledWith('/tv/404/recommendations')
    expect(apiClient.get).not.toHaveBeenCalledWith('/tv/505/recommendations')
    queryClient.clear()
  })

  it('hides the row when no watched entry meets the high-rating threshold', async () => {
    renderRow(
      [entry(1, 101, 'movie', 'watched', 7), entry(2, 202, 'tv', 'want', 10)],
      [title(101, 'movie', 'Dune: Part Two'), title(202, 'tv', 'Severance')],
    )

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /because you rated/i }),
      ).not.toBeInTheDocument()
    })
    expect(apiClient.get).not.toHaveBeenCalled()
  })
})

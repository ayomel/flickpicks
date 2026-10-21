import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WatchlistRow } from './WatchlistRow'

vi.mock('@/hooks/useWatchlistQuery', () => ({
  useWatchlistTitles: () => ({
    titles: [
      {
        id: 42,
        title: 'Test Movie',
        poster_path: null,
        release_date: '2024-01-01',
        media_type: 'movie',
      },
      {
        id: 42,
        title: 'Test Show',
        poster_path: null,
        release_date: '2020-01-01',
        media_type: 'tv',
      },
    ],
    isLoadingTitles: false,
    isError: false,
    entriesQuery: { data: [{ id: 1, tmdb_id: 1 }] },
  }),
}))

describe('WatchlistRow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders saved titles for the shared watchlist', () => {
    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <WatchlistRow />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      screen.getByRole('heading', { name: 'Saved to watch' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.getByText('Test Show')).toBeInTheDocument()
    expect(screen.getByText('2 titles')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /test show/i })).toHaveAttribute(
      'href',
      '/tv/42',
    )
  })
})

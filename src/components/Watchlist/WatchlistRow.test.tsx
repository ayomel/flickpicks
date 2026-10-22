import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
    entriesQuery: {
      data: [
        {
          id: 1,
          tmdb_id: 42,
          media_type: 'movie',
          status: 'watched',
          rating: 8,
          review: 'A good one.',
          added_by: '',
          created_at: '',
          updated_at: '',
        },
        {
          id: 2,
          tmdb_id: 42,
          media_type: 'tv',
          status: 'want',
          rating: null,
          review: '',
          added_by: '',
          created_at: '',
          updated_at: '',
        },
      ],
    },
  }),
}))

afterEach(() => cleanup())

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
    expect(
      screen.getByRole('button', { name: /8\/10 · edit review/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /mark watched · review/i }),
    ).toBeInTheDocument()
  })

  it('opens the selected title review from its watchlist card', async () => {
    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <WatchlistRow />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    fireEvent.click(
      screen.getByRole('button', { name: /8\/10 · edit review/i }),
    )
    expect(
      await screen.findByRole('dialog', { name: 'Your review for Test Movie' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Your review' })).toHaveValue(
      'A good one.',
    )
    client.clear()
  })
})

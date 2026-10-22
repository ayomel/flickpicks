import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WatchlistRow } from './WatchlistRow'

const { mockUseWatchlistTitles } = vi.hoisted(() => ({
  mockUseWatchlistTitles: vi.fn(),
}))

vi.mock('@/hooks/useWatchlistQuery', () => ({
  useWatchlistTitles: mockUseWatchlistTitles,
}))

const watchlistData = {
  titles: [
    {
      id: 42,
      title: 'Test Movie',
      poster_path: '/movie-poster.jpg',
      release_date: '2024-01-01',
      media_type: 'movie',
    },
    {
      id: 42,
      title: 'Test Show',
      poster_path: '/show-poster.jpg',
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
}

afterEach(() => cleanup())

describe('WatchlistRow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseWatchlistTitles.mockReturnValue(watchlistData)
  })

  it('separates titles by status and counts each section independently', () => {
    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <WatchlistRow />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    const savedToWatch = screen.getByRole('list', { name: 'Saved to watch' })
    const alreadyWatched = screen.getByRole('list', {
      name: 'Already watched',
    })

    expect(
      screen.getByRole('heading', { name: 'Saved to watch' }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Already watched' }),
    ).toBeVisible()
    expect(savedToWatch).toHaveTextContent('Test Show')
    expect(savedToWatch).not.toHaveTextContent('Test Movie')
    expect(alreadyWatched).toHaveTextContent('Test Movie')
    expect(alreadyWatched).not.toHaveTextContent('Test Show')
    expect(screen.getAllByText('1 title')).toHaveLength(2)
    expect(
      within(savedToWatch).getByRole('link', { name: /test show/i }),
    ).toHaveAttribute('href', '/tv/42')
    expect(
      within(alreadyWatched).getByRole('button', {
        name: /8\/10 · edit review/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /mark watched · review/i }),
    ).toBeInTheDocument()
  })

  it('moves a title into Already watched when its status changes', () => {
    const savedToWatch = {
      ...watchlistData,
      titles: [watchlistData.titles[1]],
      entriesQuery: { data: [watchlistData.entriesQuery.data[1]] },
    }
    mockUseWatchlistTitles.mockReturnValue(savedToWatch)

    const client = new QueryClient()
    const { rerender } = render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <WatchlistRow />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      within(screen.getByRole('list', { name: 'Saved to watch' })).getByRole(
        'link',
        { name: /test show/i },
      ),
    ).toBeInTheDocument()

    mockUseWatchlistTitles.mockReturnValue({
      ...savedToWatch,
      entriesQuery: {
        data: [{ ...savedToWatch.entriesQuery.data[0], status: 'watched' }],
      },
    })
    rerender(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <WatchlistRow />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      screen.queryByRole('heading', { name: 'Saved to watch' }),
    ).not.toBeInTheDocument()
    expect(
      within(screen.getByRole('list', { name: 'Already watched' })).getByRole(
        'link',
        { name: /test show/i },
      ),
    ).toBeInTheDocument()
    client.clear()
  })

  it('hides empty sections and explains how to save the first title', () => {
    const oneSavedTitle = {
      ...watchlistData,
      titles: [watchlistData.titles[1]],
      entriesQuery: { data: [watchlistData.entriesQuery.data[1]] },
    }
    mockUseWatchlistTitles.mockReturnValue(oneSavedTitle)

    const client = new QueryClient()
    const { rerender } = render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <WatchlistRow />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      screen.getByRole('heading', { name: 'Saved to watch' }),
    ).toBeVisible()
    expect(
      screen.queryByRole('heading', { name: 'Already watched' }),
    ).not.toBeInTheDocument()

    mockUseWatchlistTitles.mockReturnValue({
      ...watchlistData,
      titles: [],
      entriesQuery: { data: [] },
    })
    rerender(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <WatchlistRow />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      screen.queryByRole('heading', { name: 'Saved to watch' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Already watched' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(
        'Nothing saved yet — browse trending and add your first title',
      ),
    ).toBeVisible()
    client.clear()
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
      within(screen.getByRole('list', { name: 'Already watched' })).getByRole(
        'button',
        { name: /8\/10 · edit review/i },
      ),
    )
    const dialog = await screen.findByRole('dialog', {
      name: 'Your review for Test Movie',
    })
    expect(
      within(dialog).getByRole('img', { name: 'Test Movie poster' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Your review' })).toHaveValue(
      'A good one.',
    )
    client.clear()
  })

  it('opens and dismisses the review dialog with the keyboard', async () => {
    const user = userEvent.setup()
    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <WatchlistRow />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    const reviewButton = screen.getByRole('button', {
      name: /8\/10 · edit review/i,
    })
    reviewButton.focus()
    await user.keyboard('{Enter}')
    expect(
      await screen.findByRole('dialog', { name: 'Your review for Test Movie' }),
    ).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    client.clear()
  })
})

import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MovieNightPicker } from './MovieNightPicker'

const { mockUseWatchlistTitles } = vi.hoisted(() => ({
  mockUseWatchlistTitles: vi.fn(),
}))

vi.mock('@/hooks/useWatchlistQuery', () => ({
  useWatchlistTitles: mockUseWatchlistTitles,
}))

const movie = {
  id: 11,
  title: 'Moonlight Drive',
  poster_path: '/moonlight-poster.jpg',
  backdrop_path: '/moonlight-backdrop.jpg',
  release_date: '2022-04-03',
  media_type: 'movie',
  runtime: 124,
  genres: [
    { id: 18, name: 'Drama' },
    { id: 10749, name: 'Romance' },
  ],
  streaming_providers: {
    flatrate: [
      {
        logo_path: '/streamer.jpg',
        provider_id: 8,
        provider_name: 'Stream Box',
        display_priority: 0,
      },
    ],
  },
  trailer: 'https://www.youtube.com/watch?v=abc123xyz00',
  videos: { results: [] },
}

const show = {
  id: 22,
  title: 'North Shore',
  poster_path: '/north-shore-poster.jpg',
  backdrop_path: '/north-shore-backdrop.jpg',
  release_date: '2021-08-12',
  media_type: 'tv',
  episode_run_time: [45],
  genres: [{ id: 9648, name: 'Mystery' }],
  streaming_providers: undefined,
  trailer: null,
  videos: { results: [] },
}

const makeEntry = (tmdb_id: number, status: 'want' | 'watched') => ({
  id: tmdb_id,
  tmdb_id,
  media_type: tmdb_id === 22 ? 'tv' : 'movie',
  status,
  rating: null,
  review: '',
  added_by: '',
  created_at: '',
  updated_at: '',
})

const renderPicker = () =>
  render(
    <MemoryRouter>
      <MovieNightPicker />
    </MemoryRouter>,
  )

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

beforeEach(() => {
  mockUseWatchlistTitles.mockReturnValue({
    titles: [movie, show],
    isLoadingTitles: false,
    isError: false,
    entriesQuery: {
      data: [makeEntry(movie.id, 'want'), makeEntry(show.id, 'want')],
    },
  })
})

describe('MovieNightPicker', () => {
  it('picks only want entries and shows the selected title details', async () => {
    const user = userEvent.setup()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    renderPicker()

    await user.click(
      screen.getByRole('button', { name: 'Pick for us tonight' }),
    )

    const result = screen.getByRole('region', { name: 'Tonight’s pick' })
    expect(
      within(result).getByRole('heading', { name: 'Moonlight Drive' }),
    ).toBeVisible()
    expect(within(result).getByText('2022 · 2h 4m')).toBeVisible()
    expect(within(result).getByText('Drama')).toBeVisible()
    expect(within(result).getByText('Romance')).toBeVisible()
    expect(within(result).getByText('Stream Box')).toBeVisible()
    expect(
      within(result).getByRole('img', { name: 'Moonlight Drive poster' }),
    ).toBeVisible()
    expect(result.querySelector('img[aria-hidden="true"]')).toHaveAttribute(
      'src',
      expect.stringContaining('moonlight-backdrop.jpg'),
    )
    expect(
      within(result).getByRole('link', {
        name: 'Open Moonlight Drive details',
      }),
    ).toHaveAttribute('href', '/movies/11')
    await user.click(
      within(result).getByRole('button', { name: 'Play trailer' }),
    )
    expect(await screen.findByTitle('Moonlight Drive trailer')).toHaveAttribute(
      'src',
      expect.stringContaining('abc123xyz00'),
    )
  })

  it('never chooses a watched title', async () => {
    const user = userEvent.setup()
    mockUseWatchlistTitles.mockReturnValue({
      titles: [movie, show],
      isLoadingTitles: false,
      isError: false,
      entriesQuery: {
        data: [makeEntry(movie.id, 'watched'), makeEntry(show.id, 'want')],
      },
    })
    vi.spyOn(Math, 'random').mockReturnValue(0)
    renderPicker()

    await user.click(
      screen.getByRole('button', { name: 'Pick for us tonight' }),
    )

    expect(screen.getByRole('heading', { name: 'North Shore' })).toBeVisible()
    expect(
      screen.queryByRole('heading', { name: 'Moonlight Drive' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('2021 · 45m per episode')).toBeVisible()
  })

  it('excludes the just-shown title when picking again', async () => {
    const user = userEvent.setup()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    renderPicker()

    await user.click(
      screen.getByRole('button', { name: 'Pick for us tonight' }),
    )
    expect(
      screen.getByRole('heading', { name: 'Moonlight Drive' }),
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Pick again' }))
    expect(screen.getByRole('heading', { name: 'North Shore' })).toBeVisible()
  })

  it('picks from the keyboard and keeps the result controls reachable', async () => {
    const user = userEvent.setup()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    renderPicker()

    await user.tab()
    expect(
      screen.getByRole('button', { name: 'Pick for us tonight' }),
    ).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(
      screen.getByRole('heading', { name: 'Moonlight Drive' }),
    ).toBeVisible()

    const detailsLink = screen.getByRole('link', {
      name: 'Open Moonlight Drive details',
    })
    detailsLink.focus()
    expect(detailsLink).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Pick again' })).toBeEnabled()
  })

  it('explains an empty picker and links back to browsing', () => {
    mockUseWatchlistTitles.mockReturnValue({
      titles: [],
      isLoadingTitles: false,
      isError: false,
      entriesQuery: { data: [] },
    })
    renderPicker()

    expect(
      screen.getByText(/save a few titles to your watchlist/i),
    ).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Browse trending movies' }),
    ).toHaveAttribute('href', '/#browse')
  })

  it('shows a reduced-motion-safe reveal and disables picking again when only one title remains', async () => {
    const user = userEvent.setup()
    mockUseWatchlistTitles.mockReturnValue({
      titles: [movie],
      isLoadingTitles: false,
      isError: false,
      entriesQuery: { data: [makeEntry(movie.id, 'want')] },
    })
    renderPicker()

    await user.click(
      screen.getByRole('button', { name: 'Pick for us tonight' }),
    )
    const result = screen.getByRole('region', { name: 'Tonight’s pick' })
    expect(result.className).toContain('motion-safe:')
    expect(screen.getByRole('button', { name: 'Pick again' })).toBeDisabled()
    expect(screen.getByText(/only one title is saved to watch/i)).toBeVisible()
  })
})

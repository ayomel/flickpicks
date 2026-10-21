import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { MovieActions } from './MovieActions'
import type { FeaturedMovie } from '@/types/trending'

vi.mock('@/hooks/useWatchlistQuery', () => ({
  useIsOnWatchlist: () => ({ isOnWatchlist: false, isLoading: false }),
}))

vi.mock('@/hooks/useAddToWatchlistMutation', () => ({
  useAddToWatchlistMutation: () => ({
    isPending: false,
    isError: false,
    mutate: vi.fn(),
  }),
}))

vi.mock('@/hooks/useRemoveFromWatchlistMutation', () => ({
  useRemoveFromWatchlistMutation: () => ({
    isPending: false,
    isError: false,
    mutate: vi.fn(),
  }),
}))

const movie = {
  adult: false,
  backdrop_path: '/backdrop.jpg',
  id: 550,
  title: 'Fight Club',
  original_title: 'Fight Club',
  overview: 'overview',
  poster_path: '/poster.jpg',
  media_type: 'movie',
  original_language: 'en',
  genre_ids: [18],
  popularity: 100,
  release_date: '1999-10-15',
  softcore: false,
  video: false,
  vote_average: 8.4,
  vote_count: 1000,
} satisfies FeaturedMovie

describe('MovieActions', () => {
  it('makes More info a single link tab stop', () => {
    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <MovieActions movie={movie} />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    const moreInfo = screen.getByRole('link', { name: /more info/i })
    expect(moreInfo).toHaveAttribute('href', '/movies/550')
    expect(screen.queryByRole('button', { name: /more info/i })).toBeNull()
  })
})

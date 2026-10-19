import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MovieSearch } from './MovieSearch'
import type { SearchMediaResult } from '@/types/search'

const movieHit = {
  media_type: 'movie',
  id: 603,
  title: 'The Matrix',
  original_title: 'The Matrix',
  release_date: '1999-03-31',
  video: false,
  adult: false,
  backdrop_path: null,
  genre_ids: [28],
  original_language: 'en',
  overview: '',
  popularity: 1,
  poster_path: null,
  softcore: false,
  vote_average: 8,
  vote_count: 100,
} satisfies SearchMediaResult

const tvHit = {
  media_type: 'tv',
  id: 1396,
  name: 'Breaking Bad',
  original_name: 'Breaking Bad',
  first_air_date: '2008-01-20',
  adult: false,
  backdrop_path: null,
  genre_ids: [18],
  original_language: 'en',
  overview: '',
  popularity: 1,
  poster_path: null,
  softcore: false,
  vote_average: 9,
  vote_count: 100,
  origin_country: ['US'],
} satisfies SearchMediaResult

vi.mock('@/hooks/useSearchQuery', () => ({
  MIN_SEARCH_LENGTH: 2,
  useSearchQuery: () => ({
    data: [movieHit, tvHit],
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('@/hooks/useDebouncedValue', () => ({
  useDebouncedValue: (value: string) => value,
}))

const renderSearch = () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<MovieSearch />} />
        <Route
          path="/movies/:id"
          element={<div data-testid="movie-detail" />}
        />
        <Route path="/tv/:id" element={<div data-testid="tv-detail" />} />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  cleanup()
})

describe('MovieSearch', () => {
  it('navigates to the in-app TV detail page when a TV result is selected', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.type(screen.getByPlaceholderText(/search movies/i), 'br')
    await user.click(screen.getByRole('option', { name: /breaking bad/i }))

    expect(screen.getByTestId('tv-detail')).toBeInTheDocument()
  })

  it('navigates to the movie detail page when a movie result is selected', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.type(screen.getByPlaceholderText(/search movies/i), 'ma')
    await user.click(screen.getByRole('option', { name: /the matrix/i }))

    expect(screen.getByTestId('movie-detail')).toBeInTheDocument()
  })
})

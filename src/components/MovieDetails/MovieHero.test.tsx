import { cleanup, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { MovieHero } from './MovieHero'
import type { MovieDetails } from '@/types/movieDetails'

afterEach(() => {
  cleanup()
})

const movie = {
  id: 603,
  title: 'The Matrix',
  tagline: 'Welcome to the Real World.',
  overview: 'A computer hacker learns...',
  release_date: '1999-03-31',
  runtime: 136,
  vote_average: 8.2,
  genres: [{ id: 28, name: 'Action' }],
  backdrop_path: '/b.jpg',
  poster_path: '/p.jpg',
  budget: 63_000_000,
  production_companies: [],
  production_countries: [],
  trailer: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
  streaming_providers: {
    link: 'https://www.themoviedb.org/movie/603-the-matrix/watch?locale=en-US',
  },
} as MovieDetails

const renderHero = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <MovieHero movie={movie} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MovieHero', () => {
  it('shows a back link, title, tagline, meta, and hero actions', () => {
    renderHero()

    expect(
      screen.getByRole('link', { name: 'Back to browse' }),
    ).toHaveAttribute('href', '/')
    expect(
      screen.getByRole('heading', { name: 'The Matrix' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Welcome to the Real World.')).toBeInTheDocument()
    expect(screen.getByText(/1999/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /play trailer/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Play (opens in a new tab)' }),
    ).toHaveAttribute(
      'href',
      'https://www.themoviedb.org/movie/603-the-matrix/watch?locale=en-US',
    )
  })
})

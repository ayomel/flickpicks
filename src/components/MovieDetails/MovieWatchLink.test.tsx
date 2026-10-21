import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MovieWatchLink } from './MovieWatchLink'

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

describe('MovieWatchLink', () => {
  it('links a movie ID to the configured watch page in a new tab', () => {
    vi.stubEnv('VITE_MOVIE_WATCH_BASE_URL', 'https://7movies.ac')
    render(<MovieWatchLink movieId={969681} />)

    const link = screen.getByRole('link', { name: /play/i })
    expect(link).toHaveAttribute('href', 'https://7movies.ac/movie/969681/watch')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAccessibleName(/play/i)
  })

  it.each([
    0,
    -1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
  ])('does not render for an invalid movie ID: %s', (movieId) => {
    vi.stubEnv('VITE_MOVIE_WATCH_BASE_URL', 'https://7movies.ac')
    render(<MovieWatchLink movieId={movieId} />)

    expect(screen.queryByRole('link', { name: /play/i })).not.toBeInTheDocument()
  })

  it.each([
    undefined,
    '',
    'http://7movies.ac',
    'https://7movies.ac/unexpected-path',
    'https://user:password@7movies.ac',
  ])('does not render when the configured watch base URL is invalid: %s', (baseUrl) => {
    vi.stubEnv('VITE_MOVIE_WATCH_BASE_URL', baseUrl ?? '')
    render(<MovieWatchLink movieId={969681} />)

    expect(screen.queryByRole('link', { name: /play/i })).not.toBeInTheDocument()
  })
})

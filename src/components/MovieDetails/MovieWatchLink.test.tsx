import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MovieWatchLink } from './MovieWatchLink'

afterEach(() => {
  cleanup()
})

describe('MovieWatchLink', () => {
  it('links a movie ID to the 7Movies watch page in a new tab', () => {
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
    render(<MovieWatchLink movieId={movieId} />)

    expect(screen.queryByRole('link', { name: /play/i })).not.toBeInTheDocument()
  })
})

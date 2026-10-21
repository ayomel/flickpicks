import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MovieWatchLink } from './MovieWatchLink'

afterEach(() => {
  cleanup()
})

describe('MovieWatchLink', () => {
  it('links to a valid TMDB movie watch page in a new tab', () => {
    render(
      <MovieWatchLink
        url="https://www.themoviedb.org/movie/1433583-example/watch?locale=en-US"
      />,
    )

    const link = screen.getByRole('link', { name: /play/i })
    expect(link).toHaveAttribute(
      'href',
      'https://www.themoviedb.org/movie/1433583-example/watch?locale=en-US',
    )
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAccessibleName(/play/i)
  })

  it.each([
    undefined,
    '',
    'not a URL',
    'http://www.themoviedb.org/movie/1433583/watch',
    'https://themoviedb.org/movie/1433583/watch',
    'https://www.themoviedb.org.evil.example/movie/1433583/watch',
    'https://user@www.themoviedb.org/movie/1433583/watch',
    'https://www.themoviedb.org:8443/movie/1433583/watch',
    'https://www.themoviedb.org/movie/1433583',
    'https://www.themoviedb.org/tv/1433583/watch',
  ])('does not render for an invalid watch URL: %s', (url) => {
    render(<MovieWatchLink url={url} />)

    expect(screen.queryByRole('link', { name: /play/i })).not.toBeInTheDocument()
  })
})

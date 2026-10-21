import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { PosterCard } from './PosterCard'

afterEach(() => {
  cleanup()
})

describe('PosterCard', () => {
  it('links to the movie detail page', () => {
    render(
      <MemoryRouter>
        <PosterCard
          movie={{
            id: 550,
            title: 'Fight Club',
            poster_path: null,
            release_date: '1999-10-15',
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /fight club/i })).toHaveAttribute(
      'href',
      '/movies/550',
    )
    expect(screen.getByText('1999')).toBeInTheDocument()
  })

  it('links a saved TV show to its TV details page', () => {
    render(
      <MemoryRouter>
        <PosterCard
          movie={{
            id: 42,
            title: 'Test Show',
            poster_path: null,
            release_date: '2020-01-01',
            media_type: 'tv',
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /test show/i })).toHaveAttribute(
      'href',
      '/tv/42',
    )
    expect(screen.getByText('2020')).toBeInTheDocument()
  })

  it('falls back to the film icon when the poster fails', () => {
    render(
      <MemoryRouter>
        <PosterCard
          movie={{
            id: 550,
            title: 'Fight Club',
            poster_path: '/broken.jpg',
            release_date: '1999-10-15',
          }}
        />
      </MemoryRouter>,
    )

    fireEvent.error(screen.getByRole('img', { name: 'Fight Club poster' }))
    expect(
      screen.queryByRole('img', { name: 'Fight Club poster' }),
    ).not.toBeInTheDocument()
    expect(document.querySelector('svg')).toBeTruthy()
  })

  it('uses a real poster alt text and responsive srcset', () => {
    render(
      <MemoryRouter>
        <PosterCard
          movie={{
            id: 550,
            title: 'Fight Club',
            poster_path: '/fight.jpg',
            release_date: '1999-10-15',
          }}
        />
      </MemoryRouter>,
    )

    const image = screen.getByRole('img', { name: 'Fight Club poster' })
    expect(image).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w342/fight.jpg',
    )
    expect(image).toHaveAttribute(
      'srcSet',
      'https://image.tmdb.org/t/p/w185/fight.jpg 185w, https://image.tmdb.org/t/p/w342/fight.jpg 342w',
    )
    expect(image).toHaveAttribute('loading', 'lazy')
    expect(image).toHaveAttribute('decoding', 'async')
    expect(image).toHaveAttribute('width', '342')
    expect(image).toHaveAttribute('height', '513')
  })
})

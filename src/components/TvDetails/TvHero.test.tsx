import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { TvHero } from './TvHero'
import type { TvDetails } from '@/types/tvDetails'

afterEach(() => {
  cleanup()
})

describe('TvHero', () => {
  it('does not render the movie watch action', () => {
    const show = {
      id: 1396,
      name: 'Breaking Bad',
      first_air_date: '2008-01-20',
      number_of_seasons: 5,
      number_of_episodes: 62,
      episode_run_time: [47],
      vote_average: 8.9,
      vote_count: 1000,
      genres: [],
      backdrop_path: null,
    } as TvDetails

    render(
      <MemoryRouter>
        <TvHero show={show} />
      </MemoryRouter>,
    )

    expect(
      screen.queryByRole('link', { name: 'Play (opens in a new tab)' }),
    ).not.toBeInTheDocument()
  })
})

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TvDetailsInfo } from './TvDetailsInfo'
import type { TvDetails } from '@/types/tvDetails'

afterEach(() => {
  cleanup()
})

const show = {
  id: 1396,
  name: 'Breaking Bad',
  first_air_date: '2008-01-20',
  last_air_date: '2013-09-29',
  number_of_seasons: 5,
  number_of_episodes: 62,
  episode_run_time: [47],
  status: 'Ended',
  genres: [{ id: 18, name: 'Drama' }],
  created_by: [
    {
      id: 1,
      credit_id: 'c1',
      name: 'Vince Gilligan',
      gender: 2,
      profile_path: null,
    },
  ],
  networks: [{ id: 2, logo_path: null, name: 'AMC', origin_country: 'US' }],
  spoken_languages: [
    { english_name: 'English', iso_639_1: 'en', name: 'English' },
  ],
  production_countries: [
    { iso_3166_1: 'US', name: 'United States of America' },
  ],
  origin_country: ['US'],
  poster_path: null,
} as TvDetails

describe('TvDetailsInfo', () => {
  it('renders TV-specific sidebar fields', () => {
    render(<TvDetailsInfo show={show} />)

    expect(screen.getAllByText('Drama').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Vince Gilligan').length).toBeGreaterThan(0)
    expect(screen.getAllByText('AMC').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/5 seasons/).length).toBeGreaterThan(0)
  })
})

import { describe, expect, it } from 'vitest'
import type { TvDetails } from '@/types/tvDetails'
import {
  formatEpisodeRuntime,
  formatSeasonsEpisodes,
  getCreatorNames,
  getNetworkNames,
  getTvCountryNames,
} from './formatTv'

const baseShow = {
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
  production_countries: [
    { iso_3166_1: 'US', name: 'United States of America' },
  ],
  origin_country: ['US'],
} as TvDetails

describe('formatSeasonsEpisodes', () => {
  it('formats seasons and episodes', () => {
    expect(formatSeasonsEpisodes(5, 62)).toBe('5 seasons · 62 episodes')
    expect(formatSeasonsEpisodes(1, 1)).toBe('1 season · 1 episode')
  })

  it('returns null when both are zero', () => {
    expect(formatSeasonsEpisodes(0, 0)).toBeNull()
  })
})

describe('formatEpisodeRuntime', () => {
  it('formats the first positive runtime with per-episode label', () => {
    expect(formatEpisodeRuntime([0, 47, 50])).toBe('47m / ep')
  })

  it('returns null when no positive runtime', () => {
    expect(formatEpisodeRuntime([])).toBeNull()
    expect(formatEpisodeRuntime([0])).toBeNull()
  })
})

describe('getCreatorNames', () => {
  it('joins creator names', () => {
    expect(getCreatorNames(baseShow)).toBe('Vince Gilligan')
  })
})

describe('getNetworkNames', () => {
  it('joins network names', () => {
    expect(getNetworkNames(baseShow)).toBe('AMC')
  })
})

describe('getTvCountryNames', () => {
  it('prefers production country names', () => {
    expect(getTvCountryNames(baseShow)).toBe('United States of America')
  })

  it('falls back to origin country codes', () => {
    expect(
      getTvCountryNames({
        ...baseShow,
        production_countries: [],
      } as TvDetails),
    ).toBe('US')
  })
})

import { describe, expect, it } from 'vitest'
import { getTvEpisodeWatchPageUrl } from './getTvEpisodeWatchPageUrl'

describe('getTvEpisodeWatchPageUrl', () => {
  it('builds a 7Movies URL for the selected TV episode', () => {
    expect(getTvEpisodeWatchPageUrl(67178, 1, 2, 'https://7movies.ac')).toBe(
      'https://7movies.ac/tv/67178/watch?episode=2&open=tv-67178&season=1&watch=1',
    )
  })

  it('supports Specials as season zero', () => {
    expect(getTvEpisodeWatchPageUrl(1396, 0, 3, 'https://7movies.ac')).toBe(
      'https://7movies.ac/tv/1396/watch?episode=3&open=tv-1396&season=0&watch=1',
    )
  })

  it.each([
    [0, 1, 1],
    [-1, 1, 1],
    [Number.NaN, 1, 1],
    [Number.MAX_SAFE_INTEGER + 1, 1, 1],
    [1396, -1, 1],
    [1396, 1.5, 1],
    [1396, 1, 0],
    [1396, 1, Number.POSITIVE_INFINITY],
  ])(
    'returns null for invalid show, season, or episode values: %s/%s/%s',
    (showId, seasonNumber, episodeNumber) => {
      expect(
        getTvEpisodeWatchPageUrl(
          showId,
          seasonNumber,
          episodeNumber,
          'https://7movies.ac',
        ),
      ).toBeNull()
    },
  )

  it('returns null when the watch base URL is invalid', () => {
    expect(getTvEpisodeWatchPageUrl(1396, 1, 1, 'http://7movies.ac')).toBeNull()
  })
})

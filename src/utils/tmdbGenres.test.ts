import { describe, expect, it } from 'vitest'
import { MIN_GENRE_ROW_COUNT, TRENDING_GENRE_ROWS } from './tmdbGenres'

describe('genre discovery rows', () => {
  it('uses separate movie and TV genre filters for every row', () => {
    expect(TRENDING_GENRE_ROWS).toEqual([
      {
        id: 'horror-thriller',
        title: 'Horror, Thriller & Mystery',
        movieGenreIds: [27, 53],
        tvGenreIds: [9648],
      },
      {
        id: 'action-adventure',
        title: 'Action & Adventure',
        movieGenreIds: [28, 12],
        tvGenreIds: [10759],
      },
    ])
  })

  it('keeps the existing minimum genre row size', () => {
    expect(MIN_GENRE_ROW_COUNT).toBe(4)
  })
})

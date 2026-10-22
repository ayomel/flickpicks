import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { TrendingRows } from './TrendingRows'

const useTrendingQuery = vi.fn()
const useGenreDiscoveryQueries = vi.fn()

vi.mock('@/hooks/useTrendingQuery', () => ({
  useTrendingQuery: () => useTrendingQuery(),
}))

vi.mock('@/hooks/useGenreDiscoveryQueries', () => ({
  useGenreDiscoveryQueries: () => useGenreDiscoveryQueries(),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('TrendingRows', () => {
  it('uses independent movie and TV discover results for genre rows', () => {
    useTrendingQuery.mockReturnValue({
      data: {
        results: [
          {
            id: 99,
            title: 'Only Trending',
            poster_path: '/trending.jpg',
            release_date: '2024-01-01',
            media_type: 'movie',
          },
        ],
      },
      isLoading: false,
      isError: false,
    })
    useGenreDiscoveryQueries.mockReturnValue([
      {
        id: 'horror-thriller',
        title: 'Horror, Thriller & Mystery',
        items: [
          {
            id: 7,
            title: 'Discovered Movie',
            poster_path: null,
            release_date: '2021-02-01',
            media_type: 'movie',
          },
          {
            id: 7,
            title: 'Discovered Show',
            poster_path: null,
            release_date: '2022-04-03',
            media_type: 'tv',
          },
          {
            id: 8,
            title: 'More Discovered Movie',
            poster_path: '/more.jpg',
            release_date: '2020-05-06',
            media_type: 'movie',
          },
          {
            id: 9,
            title: 'More Discovered Show',
            poster_path: '/more-tv.jpg',
            release_date: '2019-03-02',
            media_type: 'tv',
          },
        ],
        isLoading: false,
        isError: false,
      },
      {
        id: 'action-adventure',
        title: 'Action & Adventure',
        items: [],
        isLoading: false,
        isError: false,
      },
    ])

    render(
      <MemoryRouter>
        <TrendingRows />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Horror, Thriller & Mystery' }),
    ).toBeInTheDocument()
    expect(
      screen
        .getAllByRole('link')
        .find((link) => link.getAttribute('href') === '/movies/7'),
    ).toBeInTheDocument()
    expect(
      screen
        .getAllByRole('link')
        .find((link) => link.getAttribute('href') === '/tv/7'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Action & Adventure' }),
    ).toBeNull()
    expect(
      screen.queryByRole('link', { name: /only trending/i }),
    ).toHaveAttribute('href', '/movies/99')
  })
})

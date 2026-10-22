import { cleanup, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ComingSoonRow } from './ComingSoonRow'

const useUpcomingQuery = vi.fn()

vi.mock('@/hooks/useUpcomingQuery', () => ({
  useUpcomingQuery: () => useUpcomingQuery(),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const renderRow = () => {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ComingSoonRow />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ComingSoonRow', () => {
  it('renders upcoming titles as backdrop cards', () => {
    useUpcomingQuery.mockReturnValue({
      data: {
        dates: { maximum: '2026-11-11', minimum: '2026-10-21' },
        page: 1,
        results: [
          {
            id: 1,
            title: 'The Mongoose',
            backdrop_path: '/b.jpg',
            poster_path: '/p.jpg',
            release_date: '2099-10-30',
          },
        ],
      },
      isLoading: false,
      isError: false,
    })

    renderRow()
    expect(
      screen.getByRole('heading', { name: 'Upcoming movies' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /the mongoose/i })).toHaveAttribute(
      'href',
      '/movies/1',
    )
  })

  it('filters out titles released before today', () => {
    useUpcomingQuery.mockReturnValue({
      data: {
        dates: { maximum: '2026-11-11', minimum: '2020-01-01' },
        page: 1,
        results: [
          {
            id: 1,
            title: 'Old Release',
            backdrop_path: '/old.jpg',
            poster_path: '/old-p.jpg',
            release_date: '2020-01-01',
          },
          {
            id: 2,
            title: 'Future Release',
            backdrop_path: '/new.jpg',
            poster_path: '/new-p.jpg',
            release_date: '2099-12-01',
          },
        ],
      },
      isLoading: false,
      isError: false,
    })

    renderRow()
    expect(
      screen.queryByRole('link', { name: /old release/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /future release/i }),
    ).toBeInTheDocument()
  })

  it('shows an error state', () => {
    useUpcomingQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    renderRow()
    expect(
      screen.getByText("Couldn't load upcoming movies."),
    ).toBeInTheDocument()
  })

  it('shows an empty state', () => {
    useUpcomingQuery.mockReturnValue({
      data: { dates: { maximum: '', minimum: '' }, page: 1, results: [] },
      isLoading: false,
      isError: false,
    })

    renderRow()
    expect(
      screen.getByText('No upcoming titles right now.'),
    ).toBeInTheDocument()
  })
})

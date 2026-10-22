import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../../services/apiClient'
import type { TvSeason, TvSeasonSummary } from '@/types/tvDetails'
import { TvSeasonBrowser } from './TvSeasonBrowser'

vi.mock('../../../services/apiClient', () => ({
  apiClient: { get: vi.fn() },
}))

const seasons: TvSeasonSummary[] = [
  {
    id: 12,
    air_date: '2008-01-20',
    episode_count: 7,
    name: 'Season 1',
    overview: '',
    poster_path: null,
    season_number: 1,
    vote_average: 8.5,
  },
  {
    id: 13,
    air_date: null,
    episode_count: 2,
    name: 'Specials',
    overview: '',
    poster_path: null,
    season_number: 0,
    vote_average: 0,
  },
]

const renderBrowser = (watchBaseUrl = 'https://7movies.ac') => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const view = render(
    <QueryClientProvider client={client}>
      <TvSeasonBrowser
        showId={1396}
        seasons={seasons}
        watchBaseUrl={watchBaseUrl}
      />
    </QueryClientProvider>,
  )
  return { ...view, client }
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('TvSeasonBrowser', () => {
  it('keeps seasons collapsed and fetches episodes only when expanded', async () => {
    let resolveSeason: ((value: { data: TvSeason }) => void) | undefined
    vi.mocked(apiClient.get).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSeason = resolve
        }) as never,
    )
    const user = userEvent.setup()
    const { client } = renderBrowser()

    expect(apiClient.get).not.toHaveBeenCalled()
    expect(screen.getByText('Specials')).toBeInTheDocument()
    expect(screen.getByText('Season 1').closest('details')).not.toHaveAttribute(
      'open',
    )

    await user.click(screen.getByText('Season 1'))

    await waitFor(() =>
      expect(apiClient.get).toHaveBeenCalledWith('/tv/1396/season/1'),
    )
    expect(screen.getByRole('status')).toHaveTextContent('Loading episodes')

    resolveSeason?.({
      data: {
        ...seasons[0],
        episodes: [
          {
            id: 1,
            episode_number: 1,
            name: 'Pilot',
            air_date: '2008-01-20',
            runtime: 58,
            overview: 'A chemistry teacher receives difficult news.',
            season_number: 1,
          },
          {
            id: 2,
            episode_number: 2,
            name: 'Episode 2',
            air_date: null,
            runtime: null,
            overview: '',
            season_number: 1,
          },
        ],
      },
    })

    expect(await screen.findByText('Pilot')).toBeInTheDocument()
    expect(screen.getByText('Episode 1')).toBeInTheDocument()
    expect(screen.getByText(/Jan 20, 2008/)).toBeInTheDocument()
    expect(screen.getByText(/58 min/)).toBeInTheDocument()
    expect(
      screen.getByText('A chemistry teacher receives difficult news.'),
    ).toBeInTheDocument()
    const episodeOneLink = screen.getByRole('link', {
      name: 'Play episode 1 (opens in a new tab)',
    })
    expect(episodeOneLink).toHaveAttribute(
      'href',
      'https://7movies.ac/tv/1396/watch?episode=1&open=tv-1396&season=1&watch=1',
    )
    expect(episodeOneLink).toHaveAttribute('target', '_blank')
    expect(episodeOneLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getAllByText('Episode 2')).toHaveLength(1)
    expect(
      screen.getByRole('link', {
        name: 'Play episode 2 (opens in a new tab)',
      }),
    ).toHaveAttribute(
      'href',
      'https://7movies.ac/tv/1396/watch?episode=2&open=tv-1396&season=1&watch=1',
    )
    client.clear()
  })

  it('shows an empty state for a season without episodes', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { ...seasons[1], episodes: [] },
    } as never)
    const user = userEvent.setup()
    const { client } = renderBrowser()

    await user.click(screen.getByText('Specials'))

    expect(
      await screen.findByText('No episodes available for this season.'),
    ).toBeInTheDocument()
    expect(apiClient.get).toHaveBeenCalledWith('/tv/1396/season/0')
    client.clear()
  })

  it('shows a retry action after a season request fails', async () => {
    vi.mocked(apiClient.get)
      .mockRejectedValueOnce(new Error('network failure'))
      .mockResolvedValueOnce({
        data: {
          ...seasons[0],
          episodes: [
            {
              id: 1,
              episode_number: 1,
              name: 'Pilot',
              air_date: null,
              runtime: null,
              overview: '',
              season_number: 1,
            },
          ],
        },
      } as never)
    const user = userEvent.setup()
    const { client } = renderBrowser()

    await user.click(screen.getByText('Season 1'))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Episodes could not be loaded.',
    )

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('Pilot')).toBeInTheDocument()
    expect(apiClient.get).toHaveBeenCalledTimes(2)
    client.clear()
  })
})

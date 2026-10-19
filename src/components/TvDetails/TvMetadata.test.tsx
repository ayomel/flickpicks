import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TvMetadata } from './TvMetadata'
import type { TvDetails } from '@/types/tvDetails'

afterEach(() => {
  cleanup()
})

const show = {
  id: 1,
  name: 'Untitled',
  tagline: 'A quiet series.',
  first_air_date: '2026-01-01',
  number_of_seasons: 2,
  number_of_episodes: 12,
  episode_run_time: [45],
  vote_average: 0,
  vote_count: 0,
  genres: [],
} as TvDetails

describe('TvMetadata', () => {
  it('hides the rating badge when there are no votes', () => {
    render(<TvMetadata show={show} />)

    expect(screen.queryByText('0.0')).not.toBeInTheDocument()
    expect(screen.getByText(/2026/)).toBeInTheDocument()
    expect(screen.getByText(/2 seasons/)).toBeInTheDocument()
  })

  it('shows the rating badge when votes exist', () => {
    render(
      <TvMetadata show={{ ...show, vote_average: 8.9, vote_count: 1200 }} />,
    )

    expect(screen.getByText('8.9')).toBeInTheDocument()
  })

  it('allows long titles to wrap anywhere', () => {
    render(
      <TvMetadata
        show={{
          ...show,
          name: 'SupercalifragilisticexpialidociousShowTitleWithoutSpaces',
        }}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'SupercalifragilisticexpialidociousShowTitleWithoutSpaces',
      }),
    ).toHaveClass('[overflow-wrap:anywhere]')
  })
})

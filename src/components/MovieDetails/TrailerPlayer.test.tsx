import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { TrailerPlayer } from './TrailerPlayer'
import type { MovieDetails } from '@/types/movieDetails'

afterEach(() => {
  cleanup()
})

const movie = {
  id: 603,
  title: 'The Matrix',
  trailer: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
  videos: { results: [] },
} as MovieDetails

describe('TrailerPlayer', () => {
  it('opens a youtube-nocookie embed only after Play trailer is pressed', async () => {
    const user = userEvent.setup()
    render(<TrailerPlayer media={movie} />)

    expect(screen.queryByTitle('The Matrix trailer')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Play trailer' }))

    const iframe = await screen.findByTitle('The Matrix trailer')
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/vKQi3bBA1y8?autoplay=1&rel=0',
    )
    expect(iframe).toHaveAttribute(
      'referrerPolicy',
      'strict-origin-when-cross-origin',
    )
    expect(screen.getByText('Press Esc or Close to exit')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    render(<TrailerPlayer media={movie} />)

    await user.click(screen.getByRole('button', { name: 'Play trailer' }))
    expect(await screen.findByTitle('The Matrix trailer')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByTitle('The Matrix trailer')).not.toBeInTheDocument()
  })

  it('plays a TV trailer from the video results using the show name', async () => {
    const user = userEvent.setup()
    render(
      <TrailerPlayer
        media={{
          title: 'Breaking Bad',
          videos: {
            results: [
              {
                iso_639_1: 'en',
                iso_3166_1: 'US',
                name: 'Official trailer',
                key: 'HhesaQXLuRY',
                site: 'YouTube',
                size: 1080,
                type: 'Trailer',
                official: true,
                id: 'video-1',
                published_at: '2008-01-20T00:00:00.000Z',
              },
            ],
          },
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Play trailer' }))

    expect(await screen.findByTitle('Breaking Bad trailer')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/HhesaQXLuRY?autoplay=1&rel=0',
    )
  })
})

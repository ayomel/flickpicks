import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FeatureMovieHero } from './FeatureMovieHero'
import type { FeaturedMovie } from '@/types/trending'

const setContentHovered = vi.fn()
const setControlsHovered = vi.fn()
const setFocused = vi.fn()

vi.mock('@/hooks/useHeroSlideshow', () => ({
  useHeroSlideshow: () => ({
    index: 0,
    progress: 0.25,
    playing: true,
    next: vi.fn(),
    prev: vi.fn(),
    goTo: vi.fn(),
    setContentHovered,
    setControlsHovered,
    setFocused,
    reducedMotion: false,
  }),
  HERO_INTERVAL_MS: 6000,
}))

vi.mock('@/hooks/useTrendingQuery', () => ({
  useTrendingQuery: () => ({
    data: {
      page: 1,
      results: [
        {
          adult: false,
          backdrop_path: '/backdrop.jpg',
          id: 550,
          title: 'Fight Club',
          original_title: 'Fight Club',
          overview: 'An office worker forms an underground club.',
          poster_path: '/poster.jpg',
          media_type: 'movie',
          original_language: 'en',
          genre_ids: [18],
          popularity: 100,
          release_date: '1999-10-15',
          softcore: false,
          video: false,
          vote_average: 8.4,
          vote_count: 1000,
        } satisfies FeaturedMovie,
        {
          adult: false,
          backdrop_path: '/other.jpg',
          id: 603,
          title: 'The Matrix',
          original_title: 'The Matrix',
          overview: 'A hacker learns the truth.',
          poster_path: '/m.jpg',
          media_type: 'movie',
          original_language: 'en',
          genre_ids: [28],
          popularity: 90,
          release_date: '1999-03-31',
          softcore: false,
          video: false,
          vote_average: 8.7,
          vote_count: 2000,
        } satisfies FeaturedMovie,
      ],
      total_pages: 1,
      total_results: 2,
    },
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('@/hooks/useWatchlistQuery', () => ({
  useIsOnWatchlist: () => ({ isOnWatchlist: false, isLoading: false }),
}))

vi.mock('@/hooks/useAddToWatchlistMutation', () => ({
  useAddToWatchlistMutation: () => ({
    isPending: false,
    isError: false,
    mutate: vi.fn(),
  }),
}))

vi.mock('@/hooks/useRemoveFromWatchlistMutation', () => ({
  useRemoveFromWatchlistMutation: () => ({
    isPending: false,
    isError: false,
    mutate: vi.fn(),
  }),
}))

afterEach(() => {
  cleanup()
  setContentHovered.mockClear()
  setControlsHovered.mockClear()
  setFocused.mockClear()
})

const renderHero = () => {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <FeatureMovieHero />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('FeatureMovieHero', () => {
  it('pauses autoplay on content and controls hover, not the whole section', () => {
    const { container } = renderHero()
    const section = container.querySelector('section')
    expect(section).toBeTruthy()

    fireEvent.mouseOver(section!)
    expect(setContentHovered).not.toHaveBeenCalled()
    expect(setControlsHovered).not.toHaveBeenCalled()

    fireEvent.mouseOver(screen.getByTestId('hero-content-hotzone'))
    expect(setContentHovered).toHaveBeenCalledWith(true)

    setContentHovered.mockClear()
    fireEvent.mouseOver(screen.getByTestId('hero-controls-hotzone'))
    expect(setControlsHovered).toHaveBeenCalledWith(true)

    setFocused.mockClear()
    fireEvent.focus(screen.getByRole('button', { name: 'Next movie' }))
    expect(setFocused).toHaveBeenCalledWith(true)
  })

  it('keeps hover flags independent when moving from content to controls', () => {
    renderHero()

    const contentHotzone = screen.getByTestId('hero-content-hotzone')
    const controlsHotzone = screen.getByTestId('hero-controls-hotzone')

    fireEvent.mouseOver(contentHotzone)
    expect(setContentHovered).toHaveBeenCalledWith(true)

    fireEvent.mouseOut(contentHotzone, { relatedTarget: controlsHotzone })
    fireEvent.mouseOver(controlsHotzone, { relatedTarget: contentHotzone })
    expect(setContentHovered).toHaveBeenCalledWith(false)
    expect(setControlsHovered).toHaveBeenCalledWith(true)
  })
})

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../../services/apiClient'
import { WatchlistReviewSection } from './WatchlistReviewSection'

vi.mock('../../../services/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn(), patch: vi.fn() },
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const renderSection = (mediaType: 'movie' | 'tv') => {
  vi.mocked(apiClient.get).mockResolvedValue({
    data: [
      {
        id: 2,
        tmdb_id: 42,
        media_type: 'tv',
        status: 'watched',
        rating: 7,
        review: 'Worth the watch.',
        added_by: '',
        created_at: '',
        updated_at: '',
      },
    ],
  })
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <WatchlistReviewSection
        tmdbId={42}
        mediaType={mediaType}
        title={mediaType === 'tv' ? 'Test show' : 'Test movie'}
      />
    </QueryClientProvider>,
  )
  return client
}

describe('WatchlistReviewSection', () => {
  it('shows the review editor after marking a saved title watched', async () => {
    const wantEntry = {
      id: 2,
      tmdb_id: 42,
      media_type: 'tv',
      status: 'want',
      rating: null,
      review: '',
      added_by: '',
      created_at: '',
      updated_at: 'before',
    }
    const watchedEntry = {
      ...wantEntry,
      status: 'watched',
      updated_at: 'after',
    }
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: [wantEntry] })
      .mockResolvedValue({ data: [watchedEntry] })
    vi.mocked(apiClient.patch).mockResolvedValue({ data: watchedEntry })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    render(
      <QueryClientProvider client={client}>
        <WatchlistReviewSection tmdbId={42} mediaType="tv" title="Test show" />
      </QueryClientProvider>,
    )

    fireEvent.click(
      await screen.findByRole('button', { name: 'Mark as watched' }),
    )
    expect(
      await screen.findByRole('textbox', { name: 'Your review' }),
    ).toBeInTheDocument()
    expect(apiClient.patch).toHaveBeenCalledWith('/entry/2', {
      status: 'watched',
    })
    client.clear()
  })

  it('loads the saved review for a matching TV entry', async () => {
    const client = renderSection('tv')
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Your review' })).toHaveValue(
        'Worth the watch.',
      ),
    )
    expect(screen.getByRole('radio', { name: '7 out of 10' })).toBeChecked()
    client.clear()
  })

  it('does not match a same-ID entry with a different media type', async () => {
    const client = renderSection('movie')
    expect(
      await screen.findByText(/add this title to your watchlist/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add to watchlist' }),
    ).toBeInTheDocument()
    client.clear()
  })
})

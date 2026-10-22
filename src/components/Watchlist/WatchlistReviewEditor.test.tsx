import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../../services/apiClient'
import { WatchlistReviewEditor } from './WatchlistReviewEditor'
import type { WatchlistEntryRead } from '@/types/watchlist'

vi.mock('../../../services/apiClient', () => ({
  apiClient: { patch: vi.fn() },
}))

const makeEntry = (
  overrides: Partial<WatchlistEntryRead> = {},
): WatchlistEntryRead => ({
  id: 8,
  tmdb_id: 42,
  media_type: 'movie',
  status: 'watched',
  rating: 8,
  review: 'A good one.',
  added_by: '',
  created_at: '',
  updated_at: '',
  ...overrides,
})

const renderEditor = (entry = makeEntry()) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const result = render(
    <QueryClientProvider client={client}>
      <WatchlistReviewEditor entry={entry} title="Test title" />
    </QueryClientProvider>,
  )
  return { ...result, client }
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('WatchlistReviewEditor', () => {
  it('loads existing rating and review and saves changes', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: makeEntry() })
    const { client } = renderEditor()

    expect(screen.getByRole('radio', { name: '8 out of 10' })).toBeChecked()
    expect(screen.getByLabelText('Your review')).toHaveValue('A good one.')

    fireEvent.click(screen.getByRole('radio', { name: '9 out of 10' }))
    fireEvent.change(screen.getByLabelText('Your review'), {
      target: { value: 'Still great.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save review' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Saved')
    expect(apiClient.patch).toHaveBeenCalledWith('/entry/8', {
      rating: 9,
      review: 'Still great.',
    })
    client.clear()
  })

  it('allows a rating to be cleared', () => {
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: 'Clear rating' }))
    expect(screen.getByRole('radio', { name: '8 out of 10' })).not.toBeChecked()
    expect(
      screen.queryByRole('button', { name: 'Clear rating' }),
    ).not.toBeInTheDocument()
  })

  it('shows a recoverable save error and preserves the draft', async () => {
    vi.mocked(apiClient.patch).mockRejectedValue(new Error('Unavailable'))
    const { client } = renderEditor(makeEntry({ rating: null, review: '' }))
    fireEvent.change(screen.getByLabelText('Your review'), {
      target: { value: 'Draft review' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save review' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Couldn’t save your review. Try again.',
    )
    expect(screen.getByLabelText('Your review')).toHaveValue('Draft review')
    client.clear()
  })

  it('requires the title to be watched before showing rating controls', () => {
    renderEditor(makeEntry({ status: 'want', rating: null, review: '' }))
    expect(
      screen.getByText(/mark this title as watched before adding/i),
    ).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
  })
})

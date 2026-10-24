import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

const renderEditor = (
  entry = makeEntry(),
  posterPath: string | null = null,
) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const result = render(
    <QueryClientProvider client={client}>
      <WatchlistReviewEditor
        entry={entry}
        title="Test title"
        posterPath={posterPath}
      />
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

    expect(await screen.findByText('Saved')).toBeInTheDocument()
    expect(apiClient.patch).toHaveBeenCalledWith('/entry/8', {
      rating: 9,
      review: 'Still great.',
    })
    client.clear()
  })

  it('shows the empty state, title artwork, privacy note, and all ten ratings', () => {
    renderEditor(makeEntry({ rating: null, review: '' }), '/poster.jpg')

    expect(
      screen.getByRole('img', { name: 'Test title poster' }),
    ).toHaveAttribute('src', expect.stringContaining('/poster.jpg'))
    expect(
      screen.getByText(/only you can see your rating and review/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('No review yet')
    expect(screen.getAllByRole('radio')).toHaveLength(10)
    expect(
      screen.getByRole('radio', { name: '1 out of 10' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: '10 out of 10' }),
    ).toBeInTheDocument()
  })

  it('lets a keyboard user move between labeled rating choices', () => {
    renderEditor(makeEntry({ rating: null, review: '' }))
    const firstRating = screen.getByRole('radio', { name: '1 out of 10' })
    const secondRating = screen.getByRole('radio', { name: '2 out of 10' })

    firstRating.focus()
    fireEvent.keyDown(firstRating, { key: 'ArrowRight' })

    expect(secondRating).toBeChecked()
    expect(secondRating).toHaveFocus()
  })

  it('announces that a review is being saved', async () => {
    let finishRequest = () => {}
    vi.mocked(apiClient.patch).mockImplementation(
      () =>
        new Promise((resolve) => {
          finishRequest = () => resolve({ data: makeEntry() })
        }),
    )
    const { client } = renderEditor()

    fireEvent.click(screen.getByRole('button', { name: 'Save review' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Saving your review…',
    )

    await act(async () => finishRequest())
    expect(await screen.findByText('Saved')).toBeInTheDocument()
    client.clear()
  })

  it('locks the draft while saving and reopens it after a successful save', async () => {
    const user = userEvent.setup()
    let finishRequest: (result: { data: WatchlistEntryRead }) => void = () => {}
    vi.mocked(apiClient.patch).mockImplementation(
      () =>
        new Promise((resolve) => {
          finishRequest = resolve
        }),
    )
    const { client } = renderEditor()
    const review = screen.getByLabelText('Your review')
    const clearRating = screen.getByRole('button', { name: 'Clear rating' })

    await user.clear(review)
    await user.type(review, 'Updated review')
    await user.click(screen.getByRole('button', { name: 'Save review' }))

    expect(await screen.findByText('Saving your review…')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '8 out of 10' })).toBeDisabled()
    expect(clearRating).toBeDisabled()
    expect(review).toBeDisabled()
    expect(review).toHaveValue('Updated review')

    await act(async () => finishRequest({ data: makeEntry() }))
    expect(await screen.findByText('Saved')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '8 out of 10' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Clear rating' })).toBeEnabled()
    expect(review).toBeEnabled()

    await user.type(review, 'Another edit')
    expect(screen.getByRole('status')).toHaveTextContent('Unsaved changes')
    client.clear()
  })

  it('keeps the draft locked until a failed save settles, then preserves it for retry', async () => {
    const user = userEvent.setup()
    let failRequest: (error: Error) => void = () => {}
    vi.mocked(apiClient.patch).mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          failRequest = reject
        }),
    )
    const { client } = renderEditor(makeEntry({ rating: null, review: '' }))
    const review = screen.getByLabelText('Your review')

    await user.type(review, 'Draft to retry')
    await user.click(screen.getByRole('button', { name: 'Save review' }))

    expect(await screen.findByText('Saving your review…')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '1 out of 10' })).toBeDisabled()
    expect(review).toBeDisabled()
    await act(async () => failRequest(new Error('Unavailable')))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Couldn’t save your review. Try again.',
    )
    expect(review).toBeEnabled()
    expect(review).toHaveValue('Draft to retry')
    expect(screen.getByRole('radio', { name: '1 out of 10' })).toBeEnabled()
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

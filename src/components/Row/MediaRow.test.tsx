import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { WatchlistEntryRead } from '@/types/watchlist'
import { MediaRow } from './MediaRow'
import { WatchlistReviewDialog } from '../Watchlist/WatchlistReviewDialog'

afterEach(() => {
  cleanup()
})

const sampleItems = [
  { id: 1, label: 'One' },
  { id: 2, label: 'Two' },
]

describe('MediaRow', () => {
  it('renders the label, title, and items', () => {
    render(
      <MediaRow
        label="Trending"
        title="This week"
        items={sampleItems}
        getKey={(item) => item.id}
        renderItem={(item, { tabIndex }) => (
          <a href={`/movies/${item.id}`} tabIndex={tabIndex}>
            {item.label}
          </a>
        )}
      />,
    )

    expect(screen.getByText('Trending')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'This week' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'One' })).toBeInTheDocument()
  })

  it('shows an error message when the row fails', () => {
    render(
      <MediaRow
        label="Trending"
        title="This week"
        items={sampleItems}
        getKey={(item) => item.id}
        isError
        renderItem={(item) => <a href={`/movies/${item.id}`}>{item.label}</a>}
      />,
    )

    expect(screen.getByText("Couldn't load this row.")).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'One' })).not.toBeInTheDocument()
  })

  it('shows an empty message and can hide the heading', () => {
    render(
      <MediaRow
        label="Trending"
        title="This week"
        items={[]}
        getKey={(item: { id: number }) => item.id}
        emptyMessage="No trending movies right now."
        showHeading={false}
        renderItem={() => null}
      />,
    )

    expect(
      screen.getByText('No trending movies right now.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'This week' }),
    ).not.toBeInTheDocument()
  })

  it('exposes a skip link and mouse-only scroll controls at the ends', async () => {
    const user = userEvent.setup()
    const scrollBy = vi.fn()

    render(
      <MediaRow
        label="Trending"
        title="This week"
        items={sampleItems}
        getKey={(item) => item.id}
        renderItem={(item, { tabIndex }) => (
          <a href={`/movies/${item.id}`} tabIndex={tabIndex}>
            {item.label}
          </a>
        )}
      />,
    )

    const list = screen.getByRole('list', { name: 'This week' })
    Object.defineProperty(list, 'scrollBy', {
      value: scrollBy,
      configurable: true,
    })
    Object.defineProperty(list, 'clientWidth', {
      value: 400,
      configurable: true,
    })
    Object.defineProperty(list, 'scrollWidth', {
      value: 1200,
      configurable: true,
    })
    Object.defineProperty(list, 'scrollLeft', {
      value: 0,
      configurable: true,
      writable: true,
    })
    list.dispatchEvent(new Event('scroll'))

    expect(
      screen.getByRole('link', { name: 'Skip This week' }),
    ).toBeInTheDocument()

    const right = await screen.findByRole('button', {
      name: 'Scroll This week right',
    })
    expect(
      screen.queryByRole('button', { name: 'Scroll This week left' }),
    ).not.toBeInTheDocument()
    expect(right).toHaveAttribute('tabindex', '-1')

    await user.click(right)
    expect(scrollBy).toHaveBeenCalled()
  })

  it('keeps portal review keyboard input separate from row navigation', async () => {
    const user = userEvent.setup()
    const entry: WatchlistEntryRead = {
      id: 8,
      tmdb_id: 42,
      media_type: 'movie',
      status: 'watched',
      rating: 8,
      review: 'A good one.',
      added_by: '',
      created_at: '',
      updated_at: '',
    }
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <MediaRow
          label="Watchlist"
          title="Recently watched"
          items={[entry, { ...entry, id: 9, tmdb_id: 43 }]}
          getKey={(item) => item.id}
          renderItem={(item, { tabIndex, onFocus }) => (
            <article>
              <a
                href={`/movies/${item.tmdb_id}`}
                tabIndex={tabIndex}
                onFocus={onFocus}
              >
                {item.tmdb_id}
              </a>
              <WatchlistReviewDialog
                entry={item}
                title={`Movie ${item.tmdb_id}`}
              />
            </article>
          )}
        />
      </QueryClientProvider>,
    )

    await user.click(
      screen.getAllByRole('button', { name: '8/10 · Edit review' })[0],
    )
    const firstRating = await screen.findByRole('radio', {
      name: '1 out of 10',
    })
    const secondRating = screen.getByRole('radio', { name: '2 out of 10' })
    firstRating.focus()
    await user.keyboard('{ArrowRight}')
    expect(secondRating).toHaveFocus()
    expect(secondRating).toBeChecked()

    const review = screen.getByRole('textbox', { name: 'Your review' })
    review.focus()
    const caretEvent = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    })
    review.dispatchEvent(caretEvent)
    expect(caretEvent.defaultPrevented).toBe(false)

    await user.click(screen.getByRole('button', { name: 'Close review' }))
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Your review for Movie 42' }),
      ).not.toBeInTheDocument(),
    )
    const firstCard = screen.getByRole('link', { name: '42' })
    const secondCard = screen.getByRole('link', { name: '43' })
    firstCard.focus()
    await user.keyboard('{ArrowRight}')
    expect(secondCard).toHaveFocus()
    client.clear()
  })
})

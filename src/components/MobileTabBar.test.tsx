import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/ui/button'
import { MobileTabBar } from './MobileTabBar'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const renderBar = (initialEntry = '/') => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <button type="button">Outside</button>
                <Button>Add to watchlist</Button>
                <div id="watchlist">Watchlist target</div>
                <MobileTabBar />
              </div>
            }
          />
          <Route path="/movies/:id" element={<MobileTabBar />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MobileTabBar', () => {
  it('renders Home, Search, and Watchlist tabs', () => {
    renderBar()

    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Watchlist' }),
    ).toBeInTheDocument()
  })

  it('opens the search panel from the Search tab', async () => {
    const user = userEvent.setup()
    renderBar()

    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(
      screen.getByRole('dialog', { name: 'Search movies & TV' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeVisible()
    expect(screen.getByRole('combobox')).toHaveFocus()
  })

  it('returns focus to Search when Escape closes the panel', async () => {
    const user = userEvent.setup()
    renderBar()

    const searchTab = screen.getByRole('button', { name: 'Search' })
    await user.click(searchTab)
    expect(
      screen.getByRole('dialog', { name: 'Search movies & TV' }),
    ).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(
      screen.queryByRole('dialog', { name: 'Search movies & TV' }),
    ).not.toBeInTheDocument()
    expect(searchTab).toHaveFocus()
  })

  it('closes the search panel on a tap outside without restoring focus', async () => {
    const user = userEvent.setup()
    renderBar()

    const searchTab = screen.getByRole('button', { name: 'Search' })
    await user.click(searchTab)
    expect(
      screen.getByRole('dialog', { name: 'Search movies & TV' }),
    ).toBeInTheDocument()

    const outside = screen.getByRole('button', { name: 'Outside' })
    await user.click(outside)

    expect(
      screen.queryByRole('dialog', { name: 'Search movies & TV' }),
    ).not.toBeInTheDocument()
    expect(searchTab).not.toHaveFocus()
    expect(outside).toHaveFocus()
  })

  it('closes the search panel when a React Aria Button outside is tapped', async () => {
    const user = userEvent.setup()
    renderBar()

    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(
      screen.getByRole('dialog', { name: 'Search movies & TV' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add to watchlist' }))

    expect(
      screen.queryByRole('dialog', { name: 'Search movies & TV' }),
    ).not.toBeInTheDocument()
  })

  it('closes from the panel and restores focus to the Search tab', async () => {
    const user = userEvent.setup()
    renderBar()

    const searchTab = screen.getByRole('button', { name: 'Search' })
    await user.click(searchTab)
    await user.click(screen.getByRole('button', { name: 'Close search' }))

    expect(
      screen.queryByRole('dialog', { name: 'Search movies & TV' }),
    ).not.toBeInTheDocument()
    expect(searchTab).toHaveFocus()
  })

  it('marks Home as the current page on /', () => {
    renderBar('/')
    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('scrolls to the top when Home is pressed from /#watchlist', async () => {
    const user = userEvent.setup()
    const scrollTo = vi.fn()
    Object.defineProperty(window, 'scrollTo', {
      value: scrollTo,
      configurable: true,
    })
    renderBar('/#watchlist')

    await user.click(screen.getByRole('button', { name: 'Home' }))
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('scrolls to the watchlist anchor when Watchlist is pressed', async () => {
    const user = userEvent.setup()
    const scrollIntoView = vi.fn()
    renderBar('/#watchlist')

    const target = document.getElementById('watchlist')
    expect(target).toBeTruthy()
    if (target) {
      target.scrollIntoView = scrollIntoView
    }

    await user.click(screen.getByRole('button', { name: 'Watchlist' }))
    expect(scrollIntoView).toHaveBeenCalled()
  })
})

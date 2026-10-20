import { useEffect, useId, useRef, useState } from 'react'
import { Bookmark, Home, Search } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MovieSearch } from '@/components/Search/MovieSearch'
import { cn } from '@/lib/utils'

const tabClass = (active: boolean) =>
  cn(
    'flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-2 py-1.5 text-xs font-medium',
    'outline-none transition-colors',
    'focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    active ? 'text-brand' : 'text-muted-foreground hover:text-foreground',
  )

export const MobileTabBar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const searchPanelId = useId()
  const shellRef = useRef<HTMLDivElement>(null)
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const locationKey = `${location.pathname}${location.hash}`
  const [indexedLocationKey, setIndexedLocationKey] = useState(locationKey)
  const [searchOpen, setSearchOpen] = useState(false)

  if (locationKey !== indexedLocationKey) {
    setIndexedLocationKey(locationKey)
    if (searchOpen) setSearchOpen(false)
  }

  const onHome = location.pathname === '/'
  const onWatchlist = onHome && location.hash === '#watchlist'
  const homeActive = onHome && !onWatchlist && !searchOpen
  const watchlistActive = onWatchlist && !searchOpen

  const closeSearch = (restoreFocus = false) => {
    setSearchOpen(false)
    if (restoreFocus) {
      queueMicrotask(() => searchButtonRef.current?.focus())
    }
  }

  useEffect(() => {
    if (!searchOpen) return

    const input = shellRef.current?.querySelector<HTMLInputElement>(
      'input[type="search"]',
    )
    input?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeSearch(true)
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (shellRef.current?.contains(target)) return
      closeSearch()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [searchOpen])

  const goHome = () => {
    setSearchOpen(false)
    if (!onHome) {
      navigate('/')
      return
    }
    if (location.hash) {
      navigate('/')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goWatchlist = () => {
    setSearchOpen(false)
    if (onWatchlist) {
      document.getElementById('watchlist')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      return
    }
    navigate('/#watchlist')
  }

  return (
    <div
      ref={shellRef}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 sm:hidden"
    >
      {searchOpen ? (
        <div
          id={searchPanelId}
          role="dialog"
          aria-label="Search movies"
          className="pointer-events-auto border-t border-border/80 bg-background/96 px-4 py-3 backdrop-blur-md"
        >
          <MovieSearch />
        </div>
      ) : null}

      <nav
        aria-label="Primary"
        className={cn(
          'pointer-events-auto border-t border-border/80 bg-background/96 backdrop-blur-md',
          'pb-[env(safe-area-inset-bottom)]',
        )}
      >
        <div className="flex h-14 items-stretch gap-1 px-2">
          <button
            type="button"
            className={tabClass(homeActive)}
            aria-current={homeActive ? 'page' : undefined}
            onClick={goHome}
          >
            <Home className="size-5" aria-hidden />
            Home
          </button>

          <button
            ref={searchButtonRef}
            type="button"
            className={tabClass(searchOpen)}
            aria-expanded={searchOpen}
            aria-controls={searchPanelId}
            onClick={() =>
              setSearchOpen((open) => {
                if (open) {
                  queueMicrotask(() => searchButtonRef.current?.focus())
                }
                return !open
              })
            }
          >
            <Search className="size-5" aria-hidden />
            Search
          </button>

          <button
            type="button"
            className={tabClass(watchlistActive)}
            aria-current={watchlistActive ? 'page' : undefined}
            onClick={goWatchlist}
          >
            <Bookmark className="size-5" aria-hidden />
            Watchlist
          </button>
        </div>
      </nav>
    </div>
  )
}

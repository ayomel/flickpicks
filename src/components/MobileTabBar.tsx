import { Bookmark, Home, Search } from 'lucide-react'
import { MovieSearch } from '@/components/Search/MovieSearch'
import { useMobileTabBar } from '@/hooks/useMobileTabBar'
import { cn } from '@/lib/utils'

const tabClass = (active: boolean) =>
  cn(
    'flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-2 py-1.5 text-xs font-medium',
    'outline-none transition-colors',
    'focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    active ? 'text-brand' : 'text-muted-foreground hover:text-foreground',
  )

export const MobileTabBar = () => {
  const {
    homeActive,
    goHome,
    goWatchlist,
    searchButtonRef,
    searchOpen,
    searchPanelId,
    shellRef,
    toggleSearch,
    watchlistActive,
  } = useMobileTabBar()

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
            onClick={toggleSearch}
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

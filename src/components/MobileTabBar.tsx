import { Bookmark, Home, Search, X } from 'lucide-react'
import { MovieSearch } from '@/components/Search/MovieSearch'
import { Button } from '@/components/ui/button'
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
    closeSearch,
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
          aria-labelledby={`${searchPanelId}-heading`}
          className={cn(
            'pointer-events-auto fixed inset-x-0 top-14 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-[60]',
            'flex min-h-0 flex-col gap-3 border-y border-border/80 bg-background px-4 py-3 shadow-xl',
            'sm:hidden',
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-3">
            <h2
              id={`${searchPanelId}-heading`}
              className="m-0 text-base font-semibold text-foreground"
            >
              Search movies &amp; TV
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close search"
              onPress={() => closeSearch(true)}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          <MovieSearch layout="mobile-panel" />
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

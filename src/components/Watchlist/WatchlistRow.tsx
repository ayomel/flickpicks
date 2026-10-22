import { MediaRow } from '@/components/Row/MediaRow'
import { PosterCard } from '@/components/Row/PosterCard'
import {
  useWatchlistTitles,
  type WatchlistTitle,
} from '@/hooks/useWatchlistQuery'
import type { WatchlistStatus } from '@/types/watchlist'
import { WatchlistReviewDialog } from './WatchlistReviewDialog'

const emptyTitles: WatchlistTitle[] = []

export const WatchlistRow = () => {
  const { titles, isLoadingTitles, isError, entriesQuery } =
    useWatchlistTitles()
  const entriesByTitle = new Map(
    (entriesQuery.data ?? []).map((entry) => [
      `${entry.media_type}:${entry.tmdb_id}`,
      entry,
    ]),
  )
  const titlesWithEntries = titles.flatMap((title) => {
    const entry = entriesByTitle.get(`${title.media_type}:${title.id}`)
    return entry ? [{ title, entry }] : []
  })

  const renderSection = (
    status: WatchlistStatus,
    label: string,
    title: string,
  ) => {
    const sectionTitles = titlesWithEntries.filter(
      ({ entry }) => entry.status === status,
    )

    if (sectionTitles.length === 0) return null

    return (
      <MediaRow
        label={label}
        title={title}
        items={sectionTitles}
        getKey={({ title: itemTitle }) =>
          `${itemTitle.media_type}:${itemTitle.id}`
        }
        footer={
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            {sectionTitles.length} title
            {sectionTitles.length === 1 ? '' : 's'}
          </p>
        }
        renderItem={(
          { title: itemTitle, entry },
          { tabIndex, onFocus, eager },
        ) => (
          <div className="w-36 shrink-0 sm:w-40">
            <PosterCard
              movie={itemTitle}
              tabIndex={tabIndex}
              onFocus={onFocus}
              eager={eager}
            />
            <WatchlistReviewDialog entry={entry} title={itemTitle.title} />
          </div>
        )}
      />
    )
  }

  if (isLoadingTitles) {
    return (
      <MediaRow
        label="Your watchlist"
        title="Saved to watch"
        items={emptyTitles}
        getKey={(title) => `${title.media_type}:${title.id}`}
        isLoading
        renderItem={() => null}
      />
    )
  }

  if (isError) {
    return (
      <MediaRow
        label="Your watchlist"
        title="Saved to watch"
        items={emptyTitles}
        getKey={(title) => `${title.media_type}:${title.id}`}
        isError
        errorMessage="Couldn't load your watchlist."
        renderItem={() => null}
      />
    )
  }

  if (titlesWithEntries.length === 0) {
    return (
      <p className="px-4 py-6 font-mono text-sm text-muted-foreground sm:px-6">
        Nothing saved yet — browse trending and add your first title
      </p>
    )
  }

  return (
    <>
      {renderSection('want', 'Your watchlist', 'Saved to watch')}
      {renderSection('watched', 'Your history', 'Already watched')}
    </>
  )
}

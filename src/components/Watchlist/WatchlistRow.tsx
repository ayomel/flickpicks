import { MediaRow } from '@/components/Row/MediaRow'
import { PosterCard } from '@/components/Row/PosterCard'
import { useWatchlistTitles } from '@/hooks/useWatchlistQuery'

export const WatchlistRow = () => {
  const { titles, isLoadingTitles, isError, entriesQuery } = useWatchlistTitles()

  if (!isLoadingTitles && titles.length === 0) {
    return null
  }

  return (
    <MediaRow
      label="Your watchlist"
      title="Saved to watch"
      items={titles}
      getKey={(title) => `${title.media_type}:${title.id}`}
      isLoading={isLoadingTitles}
      isError={isError}
      errorMessage="Couldn't load your watchlist."
      footer={
        !isLoadingTitles && !isError && entriesQuery.data?.length ? (
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            {titles.length} title{titles.length === 1 ? '' : 's'}
          </p>
        ) : null
      }
      renderItem={(title, { tabIndex, onFocus, eager }) => (
        <PosterCard
          movie={title}
          tabIndex={tabIndex}
          onFocus={onFocus}
          eager={eager}
        />
      )}
    />
  )
}

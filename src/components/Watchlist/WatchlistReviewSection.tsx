import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAddToWatchlistMutation } from '@/hooks/useAddToWatchlistMutation'
import { useWatchlistQuery } from '@/hooks/useWatchlistQuery'
import type { WatchlistMediaType } from '@/types/watchlist'
import { WatchlistReviewEditor } from './WatchlistReviewEditor'

type WatchlistReviewSectionProps = {
  tmdbId: number
  mediaType: WatchlistMediaType
  title: string
  posterPath?: string | null
}

export const WatchlistReviewSection = ({
  tmdbId,
  mediaType,
  title,
  posterPath,
}: WatchlistReviewSectionProps) => {
  const entriesQuery = useWatchlistQuery()
  const entry = entriesQuery.data?.find(
    (candidate) =>
      candidate.tmdb_id === tmdbId && candidate.media_type === mediaType,
  )
  const addMutation = useAddToWatchlistMutation()

  return (
    <section
      aria-labelledby="your-review-title"
      className="rounded-lg border border-brand/20 bg-card p-5 shadow-sm shadow-black/10 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <Star aria-hidden className="size-4 text-brand" />
        <h2 id="your-review-title" className="text-lg font-semibold">
          Your movie journal
        </h2>
      </div>
      <p className="mb-4 mt-0 text-sm text-muted-foreground">
        A private rating and review, just for you.
      </p>

      {entriesQuery.isLoading ? (
        <p role="status" className="m-0 text-sm text-muted-foreground">
          Loading your watchlist…
        </p>
      ) : entriesQuery.isError ? (
        <p role="alert" className="m-0 text-sm text-destructive">
          Couldn’t load your watchlist. Try again in a moment.
        </p>
      ) : !entry ? (
        <div className="space-y-3">
          <p className="m-0 text-sm text-muted-foreground">
            Add this title to your watchlist to mark it watched and leave a
            review.
          </p>
          <Button
            onPress={() =>
              addMutation.mutate({ tmdb_id: tmdbId, media_type: mediaType })
            }
            isDisabled={addMutation.isPending}
          >
            {addMutation.isPending ? 'Adding…' : 'Add to watchlist'}
          </Button>
          {addMutation.isError ? (
            <p role="alert" className="m-0 text-sm text-destructive">
              Couldn’t add this title. Try again.
            </p>
          ) : null}
        </div>
      ) : (
        <WatchlistReviewEditor
          key={entry.id}
          entry={entry}
          title={title}
          posterPath={posterPath}
        />
      )}
    </section>
  )
}

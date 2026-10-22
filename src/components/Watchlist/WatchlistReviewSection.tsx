import { Star } from 'lucide-react'
import { AddToWatchlistButton } from '@/components/MovieDetails/AddToWatchlistButton'
import { Button } from '@/components/ui/button'
import { useUpdateWatchlistEntryMutation } from '@/hooks/useUpdateWatchlistEntryMutation'
import { useWatchlistQuery } from '@/hooks/useWatchlistQuery'
import type { WatchlistMediaType } from '@/types/watchlist'
import { WatchlistReviewEditor } from './WatchlistReviewEditor'

type WatchlistReviewSectionProps = {
  tmdbId: number
  mediaType: WatchlistMediaType
  title: string
}

export const WatchlistReviewSection = ({
  tmdbId,
  mediaType,
  title,
}: WatchlistReviewSectionProps) => {
  const entriesQuery = useWatchlistQuery()
  const entry = entriesQuery.data?.find(
    (candidate) =>
      candidate.tmdb_id === tmdbId && candidate.media_type === mediaType,
  )
  const mutation = useUpdateWatchlistEntryMutation()

  return (
    <section
      aria-labelledby="your-review-title"
      className="rounded-md border border-border bg-card p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <Star aria-hidden className="size-4 text-brand" />
        <h2 id="your-review-title" className="text-lg font-semibold">
          Your review
        </h2>
      </div>

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
          <AddToWatchlistButton tmdbId={tmdbId} mediaType={mediaType} />
        </div>
      ) : entry.status === 'watched' ? (
        <WatchlistReviewEditor key={entry.id} entry={entry} title={title} />
      ) : (
        <div className="space-y-3">
          <p className="m-0 text-sm text-muted-foreground">
            Mark this title as watched before adding a rating or review.
          </p>
          <Button
            onPress={() =>
              mutation.mutate({
                id: entry.id,
                tmdbId,
                mediaType,
                update: { status: 'watched' },
              })
            }
            isDisabled={mutation.isPending}
          >
            {mutation.isPending ? 'Marking watched…' : 'Mark as watched'}
          </Button>
          {mutation.isError ? (
            <p role="alert" className="m-0 text-sm text-destructive">
              Couldn’t update this title. Try again.
            </p>
          ) : null}
        </div>
      )}
    </section>
  )
}

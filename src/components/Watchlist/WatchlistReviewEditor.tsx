import { useState, type FormEvent } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUpdateWatchlistEntryMutation } from '@/hooks/useUpdateWatchlistEntryMutation'
import type { WatchlistEntryRead } from '@/types/watchlist'

type WatchlistReviewEditorProps = {
  entry: WatchlistEntryRead
  title: string
  onClose?: () => void
}

export const WatchlistReviewEditor = ({
  entry,
  title,
  onClose,
}: WatchlistReviewEditorProps) => {
  const [rating, setRating] = useState<number | null>(entry.rating)
  const [review, setReview] = useState(entry.review)
  const [saved, setSaved] = useState(false)
  const mutation = useUpdateWatchlistEntryMutation()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaved(false)
    try {
      await mutation.mutateAsync({
        id: entry.id,
        tmdbId: entry.tmdb_id,
        mediaType: entry.media_type,
        update: { rating, review },
      })
      setSaved(true)
    } catch {
      // The mutation state renders a recoverable message and keeps edits here.
    }
  }

  if (entry.status !== 'watched') {
    return (
      <div className="space-y-4">
        <p className="m-0 text-sm text-muted-foreground">
          Mark this title as watched before adding a rating or review.
        </p>
        <Button
          onPress={async () => {
            setSaved(false)
            try {
              await mutation.mutateAsync({
                id: entry.id,
                tmdbId: entry.tmdb_id,
                mediaType: entry.media_type,
                update: { status: 'watched' },
              })
            } catch {
              // The mutation state renders a recoverable message.
            }
          }}
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
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2 text-sm font-medium">Your rating</legend>
        <div
          role="radiogroup"
          aria-label="Your rating, from 1 to 10"
          className="flex flex-wrap gap-2"
        >
          {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
            <label
              key={value}
              className={`relative flex size-9 cursor-pointer items-center justify-center rounded-md border text-sm font-semibold focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring ${rating === value ? 'border-brand bg-brand text-primary-foreground' : 'border-border bg-background text-foreground hover:bg-muted'}`}
            >
              <input
                className="peer sr-only"
                type="radio"
                name={`rating-${entry.id}`}
                value={value}
                checked={rating === value}
                onChange={() => {
                  setRating(value)
                  setSaved(false)
                }}
                aria-label={`${value} out of 10`}
              />
              <span aria-hidden>{value}</span>
            </label>
          ))}
        </div>
        {rating !== null ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-1 px-0"
            onPress={() => {
              setRating(null)
              setSaved(false)
            }}
          >
            Clear rating
          </Button>
        ) : null}
      </fieldset>

      <div className="space-y-2">
        <label htmlFor={`review-${entry.id}`} className="text-sm font-medium">
          Your review
        </label>
        <textarea
          id={`review-${entry.id}`}
          value={review}
          onChange={(event) => {
            setReview(event.target.value)
            setSaved(false)
          }}
          rows={4}
          placeholder={`What did you think of ${title}?`}
          className="w-full resize-y rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" isDisabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save review'}
        </Button>
        {onClose ? (
          <Button type="button" variant="ghost" onPress={onClose}>
            Close
          </Button>
        ) : null}
        {saved && !mutation.isPending ? (
          <span
            role="status"
            className="flex items-center gap-1 text-sm text-muted-foreground"
          >
            <Check aria-hidden className="size-4" /> Saved
          </span>
        ) : null}
        {mutation.isError ? (
          <span role="alert" className="text-sm text-destructive">
            Couldn’t save your review. Try again.
          </span>
        ) : null}
      </div>
    </form>
  )
}

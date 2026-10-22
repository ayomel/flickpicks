import { useState, type FormEvent } from 'react'
import { Check } from 'lucide-react'
import { ShieldCheck } from 'lucide-react'
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
  const ratingLabel =
    rating === null
      ? 'Choose your rating'
      : rating <= 2
        ? 'Not for me'
        : rating <= 4
          ? 'A miss'
          : rating <= 6
            ? 'Worth a watch'
            : rating <= 8
              ? 'Loved it'
              : 'An all-time favorite'

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
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md border border-border bg-muted/40 p-4">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Your private journal
        </p>
        <p className="mb-0 mt-1 text-sm font-medium text-foreground">{title}</p>
        <p className="m-0 mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck aria-hidden className="size-3.5 text-brand" /> Only you
          can see your rating and review.
        </p>
      </div>
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2 text-sm font-medium">Your rating</legend>
        <div
          role="radiogroup"
          aria-label="Your rating, from 1 to 10"
          className="grid grid-cols-5 gap-2 sm:grid-cols-10"
        >
          {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
            <label
              key={value}
              className={`relative flex h-10 cursor-pointer items-center justify-center rounded-md border text-sm font-semibold transition-colors motion-reduce:transition-none focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring ${rating === value ? 'border-brand bg-brand text-primary-foreground shadow-[0_0_18px_var(--brand-soft)]' : 'border-border bg-background text-foreground hover:border-brand/60 hover:bg-muted'}`}
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
        <p
          aria-live="polite"
          className="m-0 mt-2 text-sm font-medium text-brand"
        >
          {ratingLabel}
        </p>
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
          rows={5}
          placeholder="What stayed with you after the credits?"
          className="w-full resize-y rounded-md border border-border bg-input px-3 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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

import { useRef, useState, type FormEvent } from 'react'
import { Check, Film, ShieldCheck, Tv } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUpdateWatchlistEntryMutation } from '@/hooks/useUpdateWatchlistEntryMutation'
import type { WatchlistEntryRead } from '@/types/watchlist'
import { getPosterPath } from '@/utils/getPosterPath'

type WatchlistReviewEditorProps = {
  entry: WatchlistEntryRead
  title: string
  posterPath?: string | null
  onClose?: () => void
}

export const WatchlistReviewEditor = ({
  entry,
  title,
  posterPath,
  onClose,
}: WatchlistReviewEditorProps) => {
  const [rating, setRating] = useState<number | null>(entry.rating)
  const [review, setReview] = useState(entry.review)
  const [saveStatus, setSaveStatus] = useState<'empty' | 'saved' | 'unsaved'>(
    () => (entry.rating !== null || entry.review.trim() ? 'saved' : 'empty'),
  )
  const [posterFailed, setPosterFailed] = useState(false)
  const ratingInputs = useRef<Array<HTMLInputElement | null>>([])
  const mutation = useUpdateWatchlistEntryMutation()
  const posterUrl = posterPath ? getPosterPath(posterPath) : null
  const PosterFallback = entry.media_type === 'tv' ? Tv : Film
  const journalContext = (
    <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 rounded-md border border-border bg-muted/40 p-3 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-4 sm:p-4">
      <div className="aspect-[2/3] overflow-hidden rounded border border-border bg-background">
        {posterUrl && !posterFailed ? (
          <img
            src={posterUrl}
            alt={`${title} poster`}
            width={160}
            height={240}
            loading="lazy"
            decoding="async"
            onError={() => setPosterFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PosterFallback
              aria-hidden
              className="size-6 text-muted-foreground"
            />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Your private journal
        </p>
        <p className="mb-0 mt-1 break-words text-sm font-medium text-foreground">
          {title}
        </p>
        <p className="m-0 mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck aria-hidden className="size-3.5 shrink-0 text-brand" />
          Only you can see your rating and review.
        </p>
      </div>
    </div>
  )
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
    setSaveStatus('unsaved')
    try {
      await mutation.mutateAsync({
        id: entry.id,
        tmdbId: entry.tmdb_id,
        mediaType: entry.media_type,
        update: { rating, review },
      })
      setSaveStatus('saved')
    } catch {
      // The mutation state renders a recoverable message and keeps edits here.
    }
  }

  if (entry.status !== 'watched') {
    return (
      <div className="space-y-4">
        {journalContext}
        <p className="m-0 text-sm text-muted-foreground">
          Mark this title as watched before adding a rating or review.
        </p>
        <Button
          onPress={async () => {
            setSaveStatus('unsaved')
            try {
              await mutation.mutateAsync({
                id: entry.id,
                tmdbId: entry.tmdb_id,
                mediaType: entry.media_type,
                update: { status: 'watched' },
              })
              setSaveStatus('empty')
            } catch {
              // The mutation state renders a recoverable message.
            }
          }}
          isDisabled={mutation.isPending}
        >
          {mutation.isPending ? 'Marking watched…' : 'Mark as watched'}
        </Button>
        {mutation.isPending ? (
          <p role="status" className="m-0 text-sm text-muted-foreground">
            Marking this title as watched…
          </p>
        ) : null}
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
      {journalContext}
      <fieldset
        disabled={mutation.isPending}
        className="m-0 min-w-0 border-0 p-0"
      >
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
                ref={(input) => {
                  ratingInputs.current[value - 1] = input
                }}
                checked={rating === value}
                onChange={() => {
                  setRating(value)
                  setSaveStatus('unsaved')
                }}
                onKeyDown={(event) => {
                  const isForward =
                    event.key === 'ArrowRight' || event.key === 'ArrowDown'
                  const isBackward =
                    event.key === 'ArrowLeft' || event.key === 'ArrowUp'
                  const isFirst = event.key === 'Home'
                  const isLast = event.key === 'End'

                  if (!isForward && !isBackward && !isFirst && !isLast) return

                  event.preventDefault()
                  const nextValue = isFirst
                    ? 1
                    : isLast
                      ? 10
                      : isForward
                        ? (value % 10) + 1
                        : ((value + 8) % 10) + 1

                  setRating(nextValue)
                  setSaveStatus('unsaved')
                  ratingInputs.current[nextValue - 1]?.focus()
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
              setSaveStatus('unsaved')
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
          disabled={mutation.isPending}
          onChange={(event) => {
            setReview(event.target.value)
            setSaveStatus('unsaved')
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
        {mutation.isPending ? (
          <span role="status" className="text-sm text-muted-foreground">
            Saving your review…
          </span>
        ) : null}
        {saveStatus === 'saved' && !mutation.isError && !mutation.isPending ? (
          <span
            role="status"
            className="flex items-center gap-1 text-sm text-muted-foreground"
          >
            <Check aria-hidden className="size-4" /> Saved
          </span>
        ) : null}
        {saveStatus === 'unsaved' &&
        !mutation.isPending &&
        !mutation.isError ? (
          <span role="status" className="text-sm text-muted-foreground">
            Unsaved changes
          </span>
        ) : null}
        {saveStatus === 'empty' && !mutation.isPending ? (
          <span role="status" className="text-sm text-muted-foreground">
            No review yet. Changes are saved when you choose Save review.
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

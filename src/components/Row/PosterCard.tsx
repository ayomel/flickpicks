import { useState, type FocusEventHandler } from 'react'
import { Film } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatReleaseYear } from '@/utils/formatMovie'
import type { PosterCardMedia } from '@/types/posterCard'
import {
  getPosterCardPath,
  getPosterSrcSet,
  POSTER_SIZES_CARD,
} from '@/utils/getPosterPath'

type PosterCardProps = {
  movie: PosterCardMedia
  tabIndex?: number
  onFocus?: FocusEventHandler<HTMLAnchorElement>
  eager?: boolean
  showMediaType?: boolean
}

const POSTER_WIDTH = 342
const POSTER_HEIGHT = 513

export const PosterCard = ({
  movie,
  tabIndex,
  onFocus,
  eager = false,
  showMediaType = false,
}: PosterCardProps) => {
  const [imageFailed, setImageFailed] = useState(false)
  const year = movie.release_date ? formatReleaseYear(movie.release_date) : null
  const posterPath = movie.poster_path
  const showImage = Boolean(posterPath) && !imageFailed
  const mediaTypeLabel = movie.media_type === 'tv' ? 'TV' : 'Movie'

  return (
    <Link
      to={movie.media_type === 'tv' ? `/tv/${movie.id}` : `/movies/${movie.id}`}
      tabIndex={tabIndex}
      onFocus={onFocus}
      className={cn(
        'group/card block w-36 shrink-0 snap-start sm:w-40',
        'outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      <div
        className={cn(
          'aspect-[2/3] overflow-hidden rounded-md border border-border bg-card',
          'transition-[border-color] duration-200 group-hover/card:border-brand/35',
        )}
      >
        {showImage && posterPath ? (
          <img
            src={getPosterCardPath(posterPath)}
            srcSet={getPosterSrcSet(posterPath)}
            sizes={POSTER_SIZES_CARD}
            alt={`${movie.title} poster`}
            width={POSTER_WIDTH}
            height={POSTER_HEIGHT}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setImageFailed(true)}
            className={cn(
              'size-full object-cover transition-transform duration-200',
              '[@media(hover:hover)]:group-hover/card:scale-105',
            )}
          />
        ) : (
          <div
            role="img"
            aria-label="Poster artwork unavailable"
            className="flex size-full flex-col justify-between bg-gradient-to-br from-muted via-card to-muted p-3 text-left"
          >
            <Film className="size-7 text-muted-foreground/80" aria-hidden />
            <p className="m-0 text-xs font-medium text-muted-foreground">
              Poster unavailable
            </p>
          </div>
        )}
      </div>
      <p className="m-0 mt-2 truncate text-sm font-medium text-foreground">
        {movie.title}
      </p>
      {showMediaType || !showImage ? (
        <p className="m-0 font-mono text-xs text-muted-foreground">
          {mediaTypeLabel}
        </p>
      ) : null}
      {year ? (
        <p className="m-0 font-mono text-xs text-muted-foreground">{year}</p>
      ) : null}
    </Link>
  )
}

import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { MovieDetails } from '@/types/movieDetails'
import {
  formatRating,
  formatReleaseYear,
  formatRuntime,
} from '@/utils/formatMovie'

type MovieMetadataProps = {
  movie: MovieDetails
}

export const MovieMetadata = ({ movie }: MovieMetadataProps) => {
  const year = formatReleaseYear(movie.release_date)
  const runtime = formatRuntime(movie.runtime)
  const metaParts = [year, runtime].filter(Boolean)
  const showRating = movie.vote_count > 0

  return (
    <div className="flex flex-col gap-2.5 sm:gap-3">
      <h1 className="m-0 max-w-2xl text-[clamp(2rem,5vw,3.5rem)] leading-none font-semibold tracking-[-0.035em] text-foreground [overflow-wrap:anywhere] drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
        {movie.title}
      </h1>
      {movie.tagline ? (
        <p className="m-0 font-sans text-lg font-medium text-foreground italic drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-xl">
          {movie.tagline}
        </p>
      ) : null}
      {showRating || metaParts.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          {showRating ? (
            <Badge
              variant="outline"
              className="h-6 gap-1 border-brand/30 bg-brand-soft px-2 text-brand"
            >
              <Star className="size-3 fill-brand text-brand" aria-hidden />
              {formatRating(movie.vote_average)}
            </Badge>
          ) : null}
          {metaParts.length > 0 ? (
            <p className="m-0 font-mono text-xs text-muted-foreground">
              {metaParts.join(' · ')}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { MovieDetails } from '@/types/movieDetails'
import { cn } from '@/lib/utils'
import { HeroBackdrop } from './HeroBackdrop'
import { MovieHeroOverlays } from './MovieHeroOverlays'
import { MovieMetadata } from './MovieMetadata'
import { MovieOverview } from './MovieOverview'
import { TrailerPlayer } from './TrailerPlayer'
import { AddToWatchlistButton } from './AddToWatchlistButton'
import { detailPageShell } from './detailPageLayout'

type MovieHeroProps = {
  movie: MovieDetails
}

const heroMinHeight =
  'min-h-[min(72svh,600px)] sm:min-h-[min(68svh,560px)] lg:min-h-[min(62svh,520px)]'

export const MovieHero = ({ movie }: MovieHeroProps) => {
  const backdropPath = movie.backdrop_path
  const absoluteUrl =
    !backdropPath && movie.backdrop?.startsWith('http') ? movie.backdrop : null

  return (
    <section className={cn('relative w-full bg-background', heroMinHeight)}>
      <HeroBackdrop backdropPath={backdropPath} absoluteUrl={absoluteUrl} />
      <MovieHeroOverlays />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-12 bg-linear-to-t from-background to-transparent"
        aria-hidden
      />
      <div
        className={cn(
          'relative z-10 flex flex-col justify-between pb-6 pt-16 sm:pb-8 sm:pt-20 lg:pb-10 lg:pt-24',
          heroMinHeight,
          detailPageShell,
        )}
      >
        <Link
          to="/"
          className={cn(
            'inline-flex w-fit items-center gap-2 rounded-full bg-background/85 px-3 py-1 text-sm font-medium text-foreground backdrop-blur-sm',
            'outline-none transition-colors',
            'focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to browse
        </Link>
        <div
          className={cn(
            "relative max-lg:before:pointer-events-none max-lg:before:absolute max-lg:before:-inset-x-6 max-lg:before:-top-24 max-lg:before:bottom-0 max-lg:before:content-['']",
            'max-lg:before:bg-linear-to-b max-lg:before:from-transparent max-lg:before:via-background/75 max-lg:before:via-45% max-lg:before:to-background',
            'sm:max-lg:before:-inset-x-8',
          )}
        >
          <div className="relative flex flex-col gap-3 sm:gap-3.5">
            <MovieMetadata movie={movie} />
            <div className="lg:hidden">
              <MovieOverview
                overview={movie.overview}
                clampLines
                showLabel={false}
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-0.5">
              <TrailerPlayer movie={movie} />
              <AddToWatchlistButton tmdbId={movie.id} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { TvDetails } from '@/types/tvDetails'
import { cn } from '@/lib/utils'
import { HeroBackdrop } from '@/components/MovieDetails/HeroBackdrop'
import { MovieHeroOverlays } from '@/components/MovieDetails/MovieHeroOverlays'
import { TvMetadata } from './TvMetadata'
import { TvWatchLink } from './TvWatchLink'

type TvHeroProps = {
  show: TvDetails
}

const heroMinHeight = 'min-h-[min(80svh,760px)]'

export const TvHero = ({ show }: TvHeroProps) => {
  const backdropPath = show.backdrop_path
  const absoluteUrl =
    !backdropPath && show.backdrop?.startsWith('http') ? show.backdrop : null

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden bg-background',
        heroMinHeight,
      )}
    >
      <HeroBackdrop backdropPath={backdropPath} absoluteUrl={absoluteUrl} />
      <MovieHeroOverlays />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-16 bg-linear-to-t from-background to-transparent"
        aria-hidden
      />
      <div
        className={cn(
          'relative z-10 flex flex-col justify-between px-6 pb-10 pt-20 sm:px-8 sm:pt-24 lg:px-10',
          heroMinHeight,
        )}
      >
        <div className="mx-auto w-full max-w-6xl">
          <Link
            to="/"
            className={cn(
              'inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-sm font-medium text-foreground/90 backdrop-blur-sm',
              'outline-none transition-colors hover:text-foreground',
              'focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to browse
          </Link>
        </div>
        <div
          className={cn(
            'relative mx-auto w-full max-w-6xl',
            "before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:bg-linear-to-b before:from-transparent before:via-background/85 before:via-25% before:to-background",
            'lg:before:hidden',
          )}
        >
          <div className="relative max-lg:pt-20">
            <div className="flex flex-col gap-4">
              <TvMetadata show={show} />
              <TvWatchLink showId={show.id} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

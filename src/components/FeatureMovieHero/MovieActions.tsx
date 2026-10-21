import { Info } from 'lucide-react'
import { AddToWatchlistButton } from '@/components/MovieDetails/AddToWatchlistButton'
import { buttonVariants } from '@/components/ui/button'
import type { FeaturedMovie } from '@/types/trending'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

type MovieActionsProps = {
  movie: FeaturedMovie
}

export const MovieActions = ({ movie }: MovieActionsProps) => {
  return (
    <div className="flex flex-wrap gap-3 pt-1">
      <Link to={`/movies/${movie.id}`} className={cn(buttonVariants())}>
        <Info data-icon="inline-start" />
        More info
      </Link>
      <AddToWatchlistButton tmdbId={movie.id} addLabel="Watchlist" />
    </div>
  )
}

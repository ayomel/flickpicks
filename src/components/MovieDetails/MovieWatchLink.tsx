import { ExternalLink, Play } from 'lucide-react'
import { LinkButton } from '@/components/ui/button'

type MovieWatchLinkProps = {
  movieId: number
}

const get7MoviesWatchUrl = (movieId: number) => {
  if (!Number.isSafeInteger(movieId) || movieId <= 0) return null

  return `https://7movies.ac/movie/${movieId}/watch`
}

export const MovieWatchLink = ({ movieId }: MovieWatchLinkProps) => {
  const watchUrl = get7MoviesWatchUrl(movieId)

  if (!watchUrl) return null

  return (
    <LinkButton
      href={watchUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Play (opens in a new tab)"
      className="w-fit"
    >
      <Play data-icon="inline-start" className="fill-current" />
      Play
      <ExternalLink aria-hidden="true" data-icon="inline-end" />
    </LinkButton>
  )
}

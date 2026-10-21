import { ExternalLink, Play } from 'lucide-react'
import { LinkButton } from '@/components/ui/button'

type MovieWatchLinkProps = {
  movieId: number
  baseUrl?: string
}

const getMovieWatchUrl = (movieId: number, baseUrl: string | undefined) => {
  if (!Number.isSafeInteger(movieId) || movieId <= 0 || !baseUrl) return null

  try {
    const url = new URL(baseUrl)
    const hasInvalidBasePath = url.pathname !== '/' && url.pathname !== ''

    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port ||
      hasInvalidBasePath ||
      url.search ||
      url.hash
    ) {
      return null
    }

    return `${url.origin}/movie/${movieId}/watch`
  } catch {
    return null
  }
}

export const MovieWatchLink = ({
  movieId,
  baseUrl = import.meta.env.VITE_MOVIE_WATCH_BASE_URL,
}: MovieWatchLinkProps) => {
  const watchUrl = getMovieWatchUrl(movieId, baseUrl)

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

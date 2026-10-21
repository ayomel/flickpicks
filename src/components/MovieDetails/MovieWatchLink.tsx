import { ExternalLink, Play } from 'lucide-react'
import { LinkButton } from '@/components/ui/button'

type MovieWatchLinkProps = {
  url?: string
}

const getTmdbWatchUrl = (value?: string) => {
  if (!value) return null

  try {
    const url = new URL(value)
    const isTmdbMovieWatchPage =
      url.protocol === 'https:' &&
      url.hostname === 'www.themoviedb.org' &&
      !url.username &&
      !url.password &&
      !url.port &&
      /^\/movie\/\d+(?:-[a-z\d-]+)?\/watch\/?$/i.test(url.pathname)

    return isTmdbMovieWatchPage ? url.href : null
  } catch {
    return null
  }
}

export const MovieWatchLink = ({ url }: MovieWatchLinkProps) => {
  const watchUrl = getTmdbWatchUrl(url)

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

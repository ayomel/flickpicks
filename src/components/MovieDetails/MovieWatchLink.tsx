import { Play } from 'lucide-react'
import { LinkButton } from '@/components/ui/button'
import { getWatchPageUrl } from '@/utils/getWatchPageUrl'

type MovieWatchLinkProps = {
  movieId: number
  baseUrl?: string
}

export const MovieWatchLink = ({
  movieId,
  baseUrl = import.meta.env.VITE_WATCH_BASE_URL,
}: MovieWatchLinkProps) => {
  const watchUrl = getWatchPageUrl('movie', movieId, baseUrl)

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
    </LinkButton>
  )
}

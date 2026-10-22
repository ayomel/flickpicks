import { Play } from 'lucide-react'
import { LinkButton } from '@/components/ui/button'
import { getWatchPageUrl } from '@/utils/getWatchPageUrl'

type TvWatchLinkProps = {
  showId: number
  baseUrl?: string
}

export const TvWatchLink = ({
  showId,
  baseUrl = import.meta.env.VITE_WATCH_BASE_URL,
}: TvWatchLinkProps) => {
  const watchUrl = getWatchPageUrl('tv', showId, baseUrl)

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

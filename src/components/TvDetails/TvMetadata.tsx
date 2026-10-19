import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { TvDetails } from '@/types/tvDetails'
import { formatRating } from '@/utils/formatMovie'
import {
  formatEpisodeRuntime,
  formatFirstAirYear,
  formatSeasonsEpisodes,
} from '@/utils/formatTv'

type TvMetadataProps = {
  show: TvDetails
}

export const TvMetadata = ({ show }: TvMetadataProps) => {
  const year = formatFirstAirYear(show.first_air_date)
  const seasonsEpisodes = formatSeasonsEpisodes(
    show.number_of_seasons,
    show.number_of_episodes,
  )
  const episodeRuntime = formatEpisodeRuntime(show.episode_run_time)
  const metaParts = [year, seasonsEpisodes, episodeRuntime].filter(Boolean)
  const showRating = show.vote_count > 0

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <h1 className="m-0 max-w-2xl text-[clamp(2rem,5vw,3.5rem)] leading-none font-semibold tracking-[-0.035em] text-foreground [overflow-wrap:anywhere] drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
        {show.name}
      </h1>
      {show.tagline ? (
        <p className="m-0 font-sans text-lg font-medium text-foreground italic drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-xl">
          {show.tagline}
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
              {formatRating(show.vote_average)}
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

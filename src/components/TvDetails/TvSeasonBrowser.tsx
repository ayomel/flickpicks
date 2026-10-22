import { useState } from 'react'
import { ChevronDown, ExternalLink, Play } from 'lucide-react'
import { Button, LinkButton } from '@/components/ui/button'
import type { TvEpisode, TvSeasonSummary } from '@/types/tvDetails'
import { formatFirstAirDate } from '@/utils/formatTv'
import { getTvEpisodeWatchPageUrl } from '@/utils/getTvEpisodeWatchPageUrl'
import { useTvSeasonQuery } from '@/hooks/useTvSeasonQuery'

type TvSeasonBrowserProps = {
  showId: number
  seasons: TvSeasonSummary[]
  watchBaseUrl?: string
}

type TvSeasonItemProps = {
  showId: number
  season: TvSeasonSummary
  watchBaseUrl?: string
}

const formatEpisodeDetails = (episode: TvEpisode) => {
  const airDate = episode.air_date ? formatFirstAirDate(episode.air_date) : null
  const runtime =
    episode.runtime && episode.runtime > 0 ? `${episode.runtime} min` : null

  return [airDate, runtime].filter(Boolean).join(' · ')
}

const episodeTitleIncludesNumber = (episode: TvEpisode) =>
  new RegExp(`^episode\\s+0*${episode.episode_number}\\b`, 'i').test(
    episode.name.trim(),
  )

const TvSeasonItem = ({ showId, season, watchBaseUrl }: TvSeasonItemProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { data, isLoading, isError, refetch } = useTvSeasonQuery(
    showId,
    season.season_number,
    isOpen,
  )
  const seasonName =
    season.season_number === 0 ? 'Specials' : `Season ${season.season_number}`

  return (
    <details
      className="group rounded-lg border border-border bg-card"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-5">
        <span className="min-w-0 flex-1 font-medium text-foreground">
          {seasonName}
        </span>
        <span className="text-sm text-muted-foreground">
          {season.episode_count}{' '}
          {season.episode_count === 1 ? 'episode' : 'episodes'}
        </span>
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>

      <div className="border-t border-border px-4 py-2 sm:px-5">
        {!isOpen ? null : isLoading ? (
          <p className="py-4 text-sm text-muted-foreground" role="status">
            Loading episodes…
          </p>
        ) : isError ? (
          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <p className="m-0 text-sm text-muted-foreground" role="alert">
              Episodes could not be loaded.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onPress={() => void refetch()}
            >
              Try again
            </Button>
          </div>
        ) : data?.episodes.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground" role="status">
            No episodes available for this season.
          </p>
        ) : (
          <ol className="m-0 list-none divide-y divide-border p-0">
            {data?.episodes.map((episode) => {
              const details = formatEpisodeDetails(episode)
              const watchUrl = getTvEpisodeWatchPageUrl(
                showId,
                season.season_number,
                episode.episode_number,
                watchBaseUrl,
              )

              return (
                <li key={episode.id} className="py-4 first:pt-3 last:pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                      {!episodeTitleIncludesNumber(episode) ? (
                        <span className="font-mono text-xs text-muted-foreground">
                          Episode {episode.episode_number}
                        </span>
                      ) : null}
                      <h3 className="m-0 text-base font-semibold text-foreground">
                        {episode.name}
                      </h3>
                    </div>
                    {watchUrl ? (
                      <LinkButton
                        href={watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outline"
                        size="sm"
                        aria-label={`Play episode ${episode.episode_number} (opens in a new tab)`}
                      >
                        <Play
                          data-icon="inline-start"
                          className="fill-current"
                          aria-hidden="true"
                        />
                        Play
                        <ExternalLink
                          aria-hidden="true"
                          data-icon="inline-end"
                        />
                      </LinkButton>
                    ) : null}
                  </div>
                  {details ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {details}
                    </p>
                  ) : null}
                  {episode.overview ? (
                    <p className="mb-0 mt-2 text-sm leading-relaxed text-muted-foreground">
                      {episode.overview}
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </details>
  )
}

export const TvSeasonBrowser = ({
  showId,
  seasons,
  watchBaseUrl = import.meta.env.VITE_WATCH_BASE_URL,
}: TvSeasonBrowserProps) => {
  if (seasons.length === 0) return null

  return (
    <section
      className="flex flex-col gap-4"
      aria-labelledby="tv-seasons-heading"
    >
      <h2
        id="tv-seasons-heading"
        className="m-0 text-xl font-semibold tracking-tight text-foreground"
      >
        Episodes & seasons
      </h2>
      <div className="flex flex-col gap-3">
        {seasons.map((season) => (
          <TvSeasonItem
            key={`${showId}-${season.season_number}`}
            showId={showId}
            season={season}
            watchBaseUrl={watchBaseUrl}
          />
        ))}
      </div>
    </section>
  )
}

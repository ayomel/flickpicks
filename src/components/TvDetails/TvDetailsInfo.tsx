import { useState } from 'react'
import { Tv } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SectionLabel } from '@/components/ui/section-label'
import type { TvDetails } from '@/types/tvDetails'
import {
  formatFirstAirDate,
  formatLastAirDate,
  formatSeasonsEpisodes,
  formatEpisodeRuntime,
  getCreatorNames,
  getNetworkNames,
  getTvCountryNames,
  getTvPrimaryLanguage,
  resolveTvPosterUrl,
} from '@/utils/formatTv'
import {
  getPosterPath,
  getPosterSrcSetDetail,
  POSTER_SIZES_DETAIL,
} from '@/utils/getPosterPath'

type DetailItemProps = {
  label: string
  value: string | null
}

const DetailItem = ({ label, value }: DetailItemProps) => {
  if (!value) return null

  return (
    <div className="flex flex-col gap-1">
      <dt className="font-mono text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="m-0 text-sm text-foreground">{value}</dd>
    </div>
  )
}

type TvDetailsInfoProps = {
  show: TvDetails
}

export const TvDetailsInfo = ({ show }: TvDetailsInfoProps) => {
  const [posterFailed, setPosterFailed] = useState(false)
  const posterPath = show.poster_path
  const absolutePoster =
    !posterPath && show.poster?.startsWith('http') ? show.poster : null
  const posterUrl = posterPath
    ? getPosterPath(posterPath)
    : (absolutePoster ?? resolveTvPosterUrl(show))
  const showPoster = Boolean(posterUrl) && !posterFailed
  const countries = getTvCountryNames(show)
  const creators = getCreatorNames(show)
  const networks = getNetworkNames(show)
  const firstAir = formatFirstAirDate(show.first_air_date)
  const lastAir = formatLastAirDate(show.last_air_date)
  const seasonsEpisodes = formatSeasonsEpisodes(
    show.number_of_seasons,
    show.number_of_episodes,
  )
  const episodeRuntime = formatEpisodeRuntime(show.episode_run_time)
  const language = getTvPrimaryLanguage(show)
  const status = show.status?.trim() || null
  const hasGenres = show.genres.length > 0

  const renderGenres = () =>
    hasGenres ? (
      <div>
        <SectionLabel className="mb-3">Genres</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {show.genres.map((genre) => (
            <Badge
              key={genre.id}
              variant="secondary"
              className="border border-border"
            >
              {genre.name}
            </Badge>
          ))}
        </div>
      </div>
    ) : null

  const renderDetails = () => (
    <dl className="m-0 flex flex-col gap-4">
      <DetailItem label="First air date" value={firstAir} />
      <DetailItem label="Last air date" value={lastAir} />
      <DetailItem label="Seasons & episodes" value={seasonsEpisodes} />
      <DetailItem label="Episode length" value={episodeRuntime} />
      <DetailItem label="Status" value={status} />
      <DetailItem label="Language" value={language} />
      <DetailItem label="Countries" value={countries} />
      <DetailItem label="Created by" value={creators} />
      <DetailItem label="Networks" value={networks} />
    </dl>
  )

  const renderPoster = (loading: 'eager' | 'lazy') =>
    showPoster && posterUrl ? (
      <img
        src={posterUrl}
        srcSet={posterPath ? getPosterSrcSetDetail(posterPath) : undefined}
        sizes={posterPath ? POSTER_SIZES_DETAIL : undefined}
        alt={`${show.name} poster`}
        width={342}
        height={513}
        loading={loading}
        decoding="async"
        onError={() => setPosterFailed(true)}
        className="aspect-[2/3] w-full object-cover"
      />
    ) : (
      <div className="flex aspect-[2/3] w-full items-center justify-center bg-muted">
        <Tv className="size-10 text-muted-foreground" aria-hidden />
      </div>
    )

  return (
    <aside className="flex flex-col gap-6">
      <div className="grid grid-cols-[110px_1fr] gap-4 rounded-lg bg-card p-5 lg:hidden">
        <div className="self-start overflow-hidden rounded-md border border-border bg-muted">
          {renderPoster('lazy')}
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          {renderGenres()}
          {renderDetails()}
        </div>
      </div>

      <div className="hidden flex-col gap-6 lg:flex">
        <div className="overflow-hidden rounded-md border border-border bg-card">
          {renderPoster('eager')}
        </div>
        {renderGenres()}
        {renderDetails()}
      </div>
    </aside>
  )
}

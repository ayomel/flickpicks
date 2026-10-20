import { useState } from 'react'
import { Film } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SectionLabel } from '@/components/ui/section-label'
import type { MovieDetails } from '@/types/movieDetails'
import {
  formatBudget,
  formatReleaseDate,
  formatRuntime,
  getCountryNames,
  getPrimaryLanguage,
  getStudioNames,
  resolvePosterUrl,
} from '@/utils/formatMovie'
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
    <div className="grid grid-cols-[minmax(0,5.75rem)_1fr] items-baseline gap-x-2 py-0.5 lg:flex lg:flex-col lg:gap-1 lg:py-0">
      <dt className="font-mono text-[0.6875rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="m-0 text-right text-sm text-foreground lg:text-left">
        {value}
      </dd>
    </div>
  )
}

type MovieDetailsInfoProps = {
  movie: MovieDetails
}

export const MovieDetailsInfo = ({ movie }: MovieDetailsInfoProps) => {
  const [posterFailed, setPosterFailed] = useState(false)
  const posterPath = movie.poster_path
  const absolutePoster =
    !posterPath && movie.poster?.startsWith('http') ? movie.poster : null
  const posterUrl = posterPath
    ? getPosterPath(posterPath)
    : (absolutePoster ?? resolvePosterUrl(movie))
  const showPoster = Boolean(posterUrl) && !posterFailed
  const countries = getCountryNames(movie)
  const studios = getStudioNames(movie)
  const budget = formatBudget(movie.budget)
  const releaseDate = formatReleaseDate(movie.release_date)
  const runtime = formatRuntime(movie.runtime)
  const language = getPrimaryLanguage(movie)
  const status = movie.status?.trim() || null
  const hasGenres = movie.genres.length > 0

  const renderGenres = () =>
    hasGenres ? (
      <div>
        <SectionLabel className="mb-2 lg:mb-3">Genres</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {movie.genres.map((genre) => (
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
    <dl className="m-0 flex flex-col gap-0 lg:gap-4">
      <DetailItem label="Release date" value={releaseDate} />
      <DetailItem label="Runtime" value={runtime} />
      <DetailItem label="Status" value={status} />
      <DetailItem label="Language" value={language} />
      <DetailItem label="Countries" value={countries} />
      <DetailItem label="Studios" value={studios} />
      <DetailItem label="Budget" value={budget} />
    </dl>
  )

  const renderPoster = (loading: 'eager' | 'lazy') =>
    showPoster && posterUrl ? (
      <img
        src={posterUrl}
        srcSet={posterPath ? getPosterSrcSetDetail(posterPath) : undefined}
        sizes={posterPath ? POSTER_SIZES_DETAIL : undefined}
        alt={`${movie.title} poster`}
        width={342}
        height={513}
        loading={loading}
        decoding="async"
        onError={() => setPosterFailed(true)}
        className="aspect-[2/3] w-full object-cover"
      />
    ) : (
      <div className="flex aspect-[2/3] w-full items-center justify-center bg-muted">
        <Film className="size-10 text-muted-foreground" aria-hidden />
      </div>
    )

  return (
    <aside className="flex flex-col gap-6">
      <div className="grid grid-cols-[92px_1fr] gap-2.5 rounded-lg bg-card p-3 lg:hidden">
        <div className="self-start overflow-hidden rounded-md border border-border bg-muted">
          {renderPoster('lazy')}
        </div>
        <div className="flex min-w-0 flex-col gap-3">
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

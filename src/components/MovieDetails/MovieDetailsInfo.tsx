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

const MOBILE_POSTER_WIDTH = 72

type DetailItemProps = {
  label: string
  value: string | null
  compact?: boolean
}

const DetailItem = ({ label, value, compact = false }: DetailItemProps) => {
  if (!value) return null

  return (
    <div
      className={
        compact
          ? 'grid grid-cols-[minmax(0,4.75rem)_1fr] items-baseline gap-x-1.5'
          : 'flex flex-col gap-1'
      }
    >
      <dt
        className={
          compact
            ? 'font-mono text-[0.625rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase'
            : 'font-mono text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase'
        }
      >
        {label}
      </dt>
      <dd
        className={
          compact
            ? 'm-0 text-right text-xs leading-snug text-foreground'
            : 'm-0 text-sm text-foreground'
        }
      >
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

  const renderGenres = (compact: boolean) =>
    hasGenres ? (
      <div>
        <SectionLabel className={compact ? 'mb-1' : 'mb-2 lg:mb-3'}>
          Genres
        </SectionLabel>
        <div
          className={
            compact
              ? 'flex max-h-9 flex-wrap gap-1 overflow-hidden'
              : 'flex flex-wrap gap-2'
          }
        >
          {movie.genres.map((genre) => (
            <Badge
              key={genre.id}
              variant="secondary"
              className={
                compact
                  ? 'h-5 border border-border px-1.5 text-[0.625rem]'
                  : 'border border-border'
              }
            >
              {genre.name}
            </Badge>
          ))}
        </div>
      </div>
    ) : null

  const renderDetails = (compact: boolean) => (
    <dl
      className={
        compact ? 'm-0 flex flex-col gap-0' : 'm-0 flex flex-col gap-4'
      }
    >
      <DetailItem compact={compact} label="Release date" value={releaseDate} />
      <DetailItem compact={compact} label="Runtime" value={runtime} />
      <DetailItem compact={compact} label="Status" value={status} />
      <DetailItem compact={compact} label="Language" value={language} />
      <DetailItem compact={compact} label="Countries" value={countries} />
      <DetailItem compact={compact} label="Studios" value={studios} />
      <DetailItem compact={compact} label="Budget" value={budget} />
    </dl>
  )

  const renderPoster = (loading: 'eager' | 'lazy', width?: number) =>
    showPoster && posterUrl ? (
      <img
        src={posterUrl}
        srcSet={posterPath ? getPosterSrcSetDetail(posterPath) : undefined}
        sizes={posterPath ? POSTER_SIZES_DETAIL : undefined}
        alt={`${movie.title} poster`}
        width={width ?? 342}
        height={width ? Math.round(width * 1.5) : 513}
        loading={loading}
        decoding="async"
        onError={() => setPosterFailed(true)}
        className="aspect-[2/3] w-full object-cover"
      />
    ) : (
      <div className="flex aspect-[2/3] w-full items-center justify-center bg-muted">
        <Film
          className={
            width
              ? 'size-7 text-muted-foreground'
              : 'size-10 text-muted-foreground'
          }
          aria-hidden
        />
      </div>
    )

  return (
    <aside className="flex flex-col gap-6">
      <div className="grid grid-cols-[72px_1fr] gap-2 rounded-lg bg-card p-2 lg:hidden">
        <div className="self-start overflow-hidden rounded-md border border-border bg-muted">
          {renderPoster('lazy', MOBILE_POSTER_WIDTH)}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          {renderGenres(true)}
          {renderDetails(true)}
        </div>
      </div>

      <div className="hidden flex-col gap-6 lg:flex">
        <div className="overflow-hidden rounded-md border border-border bg-card">
          {renderPoster('eager')}
        </div>
        {renderGenres(false)}
        {renderDetails(false)}
      </div>
    </aside>
  )
}

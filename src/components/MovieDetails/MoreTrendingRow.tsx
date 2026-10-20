import { MediaRow, type MediaRowItemOptions } from '@/components/Row/MediaRow'
import { PosterCard } from '@/components/Row/PosterCard'
import { useTrendingQuery } from '@/hooks/useTrendingQuery'
import type { TrendingMovie } from '@/types/trending'

type MoreTrendingRowProps = {
  excludeId: number
  detailGutter?: boolean
}

const renderPoster = (movie: TrendingMovie, options: MediaRowItemOptions) => (
  <PosterCard
    movie={movie}
    tabIndex={options.tabIndex}
    onFocus={options.onFocus}
    eager={options.eager}
  />
)

export const MoreTrendingRow = ({
  excludeId,
  detailGutter = false,
}: MoreTrendingRowProps) => {
  const { data, isLoading, isError } = useTrendingQuery()
  const movies = (data?.results ?? []).filter((movie) => movie.id !== excludeId)

  return (
    <MediaRow
      label="More like this"
      title="More trending"
      items={movies}
      getKey={(movie) => movie.id}
      isLoading={isLoading}
      isError={isError}
      emptyMessage="No other trending titles right now."
      errorMessage="Couldn't load trending movies."
      renderItem={renderPoster}
      detailGutter={detailGutter}
    />
  )
}

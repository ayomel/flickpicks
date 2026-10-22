import { MediaRow, type MediaRowItemOptions } from '@/components/Row/MediaRow'
import { PosterCard } from '@/components/Row/PosterCard'
import { useGenreDiscoveryQueries } from '@/hooks/useGenreDiscoveryQueries'
import { useTrendingQuery } from '@/hooks/useTrendingQuery'
import type { PosterCardMedia } from '@/types/posterCard'
import { MIN_GENRE_ROW_COUNT } from '@/utils/tmdbGenres'

const renderPoster = (movie: PosterCardMedia, options: MediaRowItemOptions) => (
  <PosterCard
    movie={movie}
    tabIndex={options.tabIndex}
    onFocus={options.onFocus}
    eager={options.eager}
  />
)

export const TrendingRows = () => {
  const { data, isLoading, isError } = useTrendingQuery()
  const genreRows = useGenreDiscoveryQueries()
  const movies = data?.results ?? []

  return (
    <>
      <MediaRow
        label="Trending"
        title="Popular this week"
        items={movies}
        getKey={(movie) => movie.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No trending movies right now."
        errorMessage="Couldn't load trending movies."
        showHeading={isLoading || isError || movies.length > 0}
        eagerCount={4}
        renderItem={renderPoster}
      />

      {genreRows.map((row) => {
        if (
          !row.isLoading &&
          !row.isError &&
          row.items.length < MIN_GENRE_ROW_COUNT
        ) {
          return null
        }

        return (
          <MediaRow
            key={row.id}
            label="Genre"
            title={row.title}
            items={row.items}
            getKey={(movie) => `${row.id}-${movie.media_type}-${movie.id}`}
            isLoading={row.isLoading}
            isError={row.isError}
            emptyMessage="No titles in this genre right now."
            errorMessage="Couldn't load this genre row."
            renderItem={renderPoster}
          />
        )
      })}
    </>
  )
}

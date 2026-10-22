import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useTvDetailsQuery } from '@/hooks/useTvDetailsQuery'
import { TvHero } from '@/components/TvDetails/TvHero'
import { MovieOverview } from '@/components/MovieDetails/MovieOverview'
import { TvDetailsInfo } from '@/components/TvDetails/TvDetailsInfo'
import { TrailerPlayer } from '@/components/MovieDetails/TrailerPlayer'
import { MovieDetailsSkeleton } from '@/components/MovieDetails/MovieDetailsSkeleton'
import { MovieDetailsError } from '@/components/MovieDetails/MovieDetailsError'
import { Seo } from '@/components/Seo'
import { isNumericMovieId } from '@/utils/isNumericMovieId'
import { absoluteUrl, mediaOgImageUrl } from '@/utils/seo'
import { WatchlistReviewSection } from '@/components/Watchlist/WatchlistReviewSection'

export const TvDetails = () => {
  const { id } = useParams()
  const idIsValid = isNumericMovieId(id)
  const { data, isLoading, isError, error } = useTvDetailsQuery(id)

  if (!idIsValid) {
    return <MovieDetailsError notFound />
  }

  if (isLoading) {
    return <MovieDetailsSkeleton />
  }

  const isNotFound =
    isError && axios.isAxiosError(error) && error.response?.status === 404

  if (isNotFound) {
    return <MovieDetailsError notFound />
  }

  if (isError || !data) {
    return <MovieDetailsError />
  }

  const description =
    data.overview?.trim() || `Details for ${data.name} on FlickPick.`

  return (
    <div className="min-h-svh bg-background pb-8 text-foreground sm:pb-0">
      <Seo
        title={`${data.name} · FlickPick`}
        description={description}
        canonical={absoluteUrl(`/tv/${data.id}`)}
        ogType="video.tv_show"
        ogImage={mediaOgImageUrl(data)}
        shareable
      />
      <TvHero show={data} />

      <div className="px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="flex min-w-0 flex-col gap-8">
            <MovieOverview overview={data.overview} />
            <div className="flex flex-wrap gap-3">
              <TrailerPlayer
                media={{
                  title: data.name,
                  trailer: data.trailer,
                  videos: data.videos,
                }}
              />
            </div>
          </div>

          <TvDetailsInfo show={data} />
        </div>
        <div className="mx-auto mt-8 w-full max-w-6xl">
          <WatchlistReviewSection
            tmdbId={data.id}
            mediaType="tv"
            title={data.name}
          />
        </div>
      </div>
    </div>
  )
}

export default TvDetails

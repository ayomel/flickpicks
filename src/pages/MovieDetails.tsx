import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useMovieDetailsQuery } from '@/hooks/useMovieDetailsQuery'
import { MovieHero } from '@/components/MovieDetails/MovieHero'
import { MovieOverview } from '@/components/MovieDetails/MovieOverview'
import { WatchProviders } from '@/components/MovieDetails/WatchProviders'
import { MovieDetailsInfo } from '@/components/MovieDetails/MovieDetailsInfo'
import { MovieDetailsSkeleton } from '@/components/MovieDetails/MovieDetailsSkeleton'
import { MovieDetailsError } from '@/components/MovieDetails/MovieDetailsError'
import { VideosRow } from '@/components/MovieDetails/VideosRow'
import { MoreTrendingRow } from '@/components/MovieDetails/MoreTrendingRow'
import { Seo } from '@/components/Seo'
import { isNumericMovieId } from '@/utils/isNumericMovieId'
import { absoluteUrl, movieOgImageUrl } from '@/utils/seo'
import { detailPageShell } from '@/components/MovieDetails/detailPageLayout'
import { cn } from '@/lib/utils'

export const MovieDetails = () => {
  const { id } = useParams()
  const idIsValid = isNumericMovieId(id)
  const { data, isLoading, isError, error } = useMovieDetailsQuery(id)

  if (!idIsValid) {
    return <MovieDetailsError notFound />
  }

  if (isLoading) {
    return <MovieDetailsSkeleton detailLayout />
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
    data.overview?.trim() || `Details for ${data.title} on FlickPick.`

  return (
    <div className="min-h-svh bg-background pb-8 text-foreground sm:pb-0">
      <Seo
        title={`${data.title} · FlickPick`}
        description={description}
        canonical={absoluteUrl(`/movies/${data.id}`)}
        ogType="video.movie"
        ogImage={movieOgImageUrl(data)}
        shareable
      />
      <MovieHero movie={data} />

      <div className={cn(detailPageShell, 'py-8 lg:py-10')}>
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="hidden min-w-0 lg:block">
            <MovieOverview overview={data.overview} />
          </div>

          <MovieDetailsInfo movie={data} />
        </div>
      </div>

      <VideosRow movie={data} detailGutter />
      <WatchProviders providers={data.streaming_providers} />
      <MoreTrendingRow excludeId={data.id} detailGutter />
    </div>
  )
}

export default MovieDetails

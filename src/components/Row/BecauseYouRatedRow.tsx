import { useQueries } from '@tanstack/react-query'
import { MediaRow, type MediaRowItemOptions } from '@/components/Row/MediaRow'
import { PosterCard } from '@/components/Row/PosterCard'
import { apiClient } from '../../../services/apiClient'
import type { WatchlistTitle } from '@/hooks/useWatchlistQuery'
import type { WatchlistEntryRead, WatchlistMediaType } from '@/types/watchlist'
import type { PosterCardMedia } from '@/types/posterCard'

export const HIGH_RATING_THRESHOLD = 8

type RecommendationMedia = {
  id: number
  media_type: WatchlistMediaType
  poster_path: string | null
  title?: string
  release_date?: string
  name?: string
  first_air_date?: string
}

type RecommendationsResponse = {
  results: RecommendationMedia[]
}

type RatedSeed = {
  id: number
  media_type: WatchlistMediaType
  rating: number
  title: string
}

type BecauseYouRatedRowProps = {
  entries: WatchlistEntryRead[]
  titles: WatchlistTitle[]
}

const identityKey = (mediaType: WatchlistMediaType, id: number) =>
  `${mediaType}:${id}`

const makeSeeds = (
  entries: WatchlistEntryRead[],
  titles: WatchlistTitle[],
): RatedSeed[] => {
  const titleByIdentity = new Map(
    titles.map((title) => [identityKey(title.media_type, title.id), title]),
  )

  return entries
    .filter(
      (entry): entry is WatchlistEntryRead & { rating: number } =>
        entry.status === 'watched' &&
        entry.rating !== null &&
        entry.rating >= HIGH_RATING_THRESHOLD,
    )
    .map((entry) => {
      const mediaType = entry.media_type ?? 'movie'
      const title = titleByIdentity.get(identityKey(mediaType, entry.tmdb_id))
      if (!title) return null

      return {
        id: entry.tmdb_id,
        media_type: mediaType,
        rating: entry.rating,
        title: title.title,
      }
    })
    .filter((seed): seed is RatedSeed => seed !== null)
    .sort((left, right) => right.rating - left.rating)
}

const posterCardMovie = (item: RecommendationMedia): PosterCardMedia | null => {
  if (item.media_type === 'tv') {
    if (!item.name) return null
    return {
      id: item.id,
      title: item.name,
      poster_path: item.poster_path,
      release_date: item.first_air_date,
      media_type: 'tv',
    }
  }

  if (!item.title) return null
  return {
    id: item.id,
    title: item.title,
    poster_path: item.poster_path,
    release_date: item.release_date,
    media_type: 'movie',
  }
}

const renderRecommendation = (
  item: RecommendationMedia,
  options: MediaRowItemOptions,
) => {
  const movie = posterCardMovie(item)
  if (!movie) return null

  return (
    <PosterCard
      movie={movie}
      tabIndex={options.tabIndex}
      onFocus={options.onFocus}
      eager={options.eager}
      showMediaType
    />
  )
}

export const BecauseYouRatedRow = ({
  entries,
  titles,
}: BecauseYouRatedRowProps) => {
  const seeds = makeSeeds(entries, titles)
  const savedTitles = new Set(
    entries.map((entry) =>
      identityKey(entry.media_type ?? 'movie', entry.tmdb_id),
    ),
  )

  const recommendationQueries = useQueries({
    queries: seeds.map((seed) => ({
      queryKey: ['recommendations', seed.media_type, seed.id],
      queryFn: async () => {
        const path =
          seed.media_type === 'tv'
            ? `/tv/${seed.id}/recommendations`
            : `/movies/${seed.id}/recommendations`
        const { data } = await apiClient.get<RecommendationsResponse>(path)
        return data.results ?? []
      },
    })),
  })

  if (seeds.length === 0) return null

  const seen = new Set<string>()
  const recommendations = recommendationQueries.flatMap((query) =>
    (query.data ?? []).filter((item) => {
      const key = identityKey(item.media_type, item.id)
      if (savedTitles.has(key) || seen.has(key)) return false
      if (!posterCardMovie(item)) return false
      seen.add(key)
      return true
    }),
  )
  const primarySeed = seeds[0]
  const otherSeeds = seeds.slice(1)
  const isLoading = recommendationQueries.some((query) => query.isLoading)
  const isError = recommendationQueries.every((query) => query.isError)

  return (
    <MediaRow
      label="Recommended for you"
      title="Because you rated it highly"
      items={recommendations}
      getKey={(item) => identityKey(item.media_type, item.id)}
      isLoading={isLoading}
      isError={isError}
      emptyMessage="No recommendations for those titles yet."
      errorMessage="Couldn't load recommendations right now."
      eagerCount={4}
      renderItem={renderRecommendation}
      footer={
        <p className="m-0 text-sm text-muted-foreground">
          Because you rated {primarySeed.title} {primarySeed.rating}/10.
          {otherSeeds.length > 0
            ? ` Also based on your ${otherSeeds
                .map((seed) => `${seed.rating}/10 rating of ${seed.title}`)
                .join(', ')}.`
            : null}
        </p>
      }
    />
  )
}

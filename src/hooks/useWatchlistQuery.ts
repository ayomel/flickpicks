import { useQueries, useQuery } from '@tanstack/react-query'
import { apiClient } from '../../services/apiClient'
import { getVisitorId } from '../../services/visitorId'
import type { MovieDetails } from '@/types/movieDetails'
import type { TvDetails } from '@/types/tvDetails'
import type {
  WatchlistEntryRead,
  WatchlistMediaType,
} from '@/types/watchlist'

export const watchlistQueryKey = ['watchlist', getVisitorId()] as const

export const useWatchlistQuery = () => {
  return useQuery({
    queryKey: watchlistQueryKey,
    queryFn: async () => {
      const { data } = await apiClient.get<WatchlistEntryRead[]>('/entry')
      return data
    },
  })
}

export const useIsOnWatchlist = (
  tmdbId: number,
  mediaType: WatchlistMediaType = 'movie',
) => {
  const { data, isLoading, isFetching } = useWatchlistQuery()
  const isOnWatchlist =
    data?.some(
      (entry) =>
        entry.tmdb_id === tmdbId && (entry.media_type ?? 'movie') === mediaType,
    ) ?? false

  return {
    isOnWatchlist,
    isLoading: isLoading || isFetching,
  }
}

export type WatchlistTitle = {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  media_type: WatchlistMediaType
}

const uniqueOrderedEntries = (entries: WatchlistEntryRead[]) => {
  const seen = new Set<string>()
  return entries.filter((entry) => {
    const key = `${entry.media_type ?? 'movie'}:${entry.tmdb_id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export const useWatchlistTitles = () => {
  const entriesQuery = useWatchlistQuery()
  const entries = uniqueOrderedEntries(entriesQuery.data ?? [])

  const titleQueries = useQueries({
    queries: entries.map((entry) => {
      const mediaType = entry.media_type ?? 'movie'
      const id = entry.tmdb_id
      return {
        queryKey: ['watchlist-detail', mediaType, String(id)],
        queryFn: async (): Promise<WatchlistTitle> => {
          if (mediaType === 'tv') {
            const { data } = await apiClient.get<TvDetails>(`/tv/${id}`)
            return {
              id: data.id,
              title: data.name,
              poster_path: data.poster_path,
              release_date: data.first_air_date,
              media_type: mediaType,
            }
          }

          const { data } = await apiClient.get<MovieDetails>(`/movies/${id}`)
          return {
            id: data.id,
            title: data.title,
            poster_path: data.poster_path,
            release_date: data.release_date,
            media_type: mediaType,
          }
        },
      }
    }),
  })

  const titles = titleQueries
    .map((query) => query.data)
    .filter((title): title is WatchlistTitle => Boolean(title))

  const isLoadingTitles =
    entriesQuery.isLoading ||
    (entries.length > 0 && titleQueries.some((query) => query.isLoading))

  return {
    entriesQuery,
    titles,
    isLoadingTitles,
    isError: entriesQuery.isError || titleQueries.some((query) => query.isError),
  }
}

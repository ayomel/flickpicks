import { useQueries } from '@tanstack/react-query'
import { apiClient } from '../../services/apiClient'
import type {
  GenreDiscoveryResponse,
  GenreDiscoveryResult,
} from '@/types/genreDiscovery'
import type { PosterCardMedia } from '@/types/posterCard'
import { TRENDING_GENRE_ROWS } from '@/utils/tmdbGenres'

export type GenreDiscoveryRow = {
  id: string
  title: string
  items: PosterCardMedia[]
  isLoading: boolean
  isError: boolean
}

const toPosterCardMedia = (
  result: GenreDiscoveryResult,
): PosterCardMedia | null => {
  if (result.media_type === 'tv') {
    if (!result.name) return null
    return {
      id: result.id,
      title: result.name,
      release_date: result.first_air_date,
      poster_path: result.poster_path,
      media_type: 'tv',
    }
  }

  if (!result.title) return null
  return {
    id: result.id,
    title: result.title,
    release_date: result.release_date,
    poster_path: result.poster_path,
    media_type: 'movie',
  }
}

const identityKey = (movie: PosterCardMedia) =>
  `${movie.media_type === 'tv' ? 'tv' : 'movie'}:${movie.id}`

export const useGenreDiscoveryQueries = (): GenreDiscoveryRow[] => {
  const queries = useQueries({
    queries: TRENDING_GENRE_ROWS.flatMap((row) => [
      {
        queryKey: ['genre-discovery', 'movie', row.id, row.movieGenreIds],
        queryFn: async () => {
          const { data } = await apiClient.get<GenreDiscoveryResponse>(
            '/movies/discover',
            { params: { with_genres: row.movieGenreIds.join('|') } },
          )
          return data.results ?? []
        },
      },
      {
        queryKey: ['genre-discovery', 'tv', row.id, row.tvGenreIds],
        queryFn: async () => {
          const { data } = await apiClient.get<GenreDiscoveryResponse>(
            '/tv/discover',
            { params: { with_genres: row.tvGenreIds.join('|') } },
          )
          return data.results ?? []
        },
      },
    ]),
  })

  return TRENDING_GENRE_ROWS.map((row, index) => {
    const movieQuery = queries[index * 2]
    const tvQuery = queries[index * 2 + 1]
    const seen = new Set<string>()
    const items = [...(movieQuery.data ?? []), ...(tvQuery.data ?? [])]
      .map(toPosterCardMedia)
      .filter((movie): movie is PosterCardMedia => movie !== null)
      .filter((movie) => {
        const key = identityKey(movie)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

    return {
      id: row.id,
      title: row.title,
      items,
      isLoading: movieQuery.isPending || tvQuery.isPending,
      isError: movieQuery.isError && tvQuery.isError,
    }
  })
}

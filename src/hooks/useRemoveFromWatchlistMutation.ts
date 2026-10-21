import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../services/apiClient'
import type {
  WatchlistEntryIdentity,
  WatchlistEntryRead,
} from '@/types/watchlist'
import { watchlistQueryKey } from '@/hooks/useWatchlistQuery'

const getWatchlistEntries = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  const cached =
    queryClient.getQueryData<WatchlistEntryRead[]>(watchlistQueryKey)
  if (cached) return cached
  const { data } = await apiClient.get<WatchlistEntryRead[]>('/entry')
  return data
}

export const useRemoveFromWatchlistMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tmdb_id, media_type }: WatchlistEntryIdentity) => {
      const entries = await getWatchlistEntries(queryClient)
      const matching = entries.find(
        (entry) =>
          entry.tmdb_id === tmdb_id &&
          (entry.media_type ?? 'movie') === media_type,
      )
      if (matching) await apiClient.delete(`/entry/${matching.id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchlistQueryKey })
    },
  })
}

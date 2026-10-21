import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../services/apiClient'
import type {
  WatchlistEntryCreate,
  WatchlistEntryIdentity,
  WatchlistEntryRead,
} from '@/types/watchlist'
import { watchlistQueryKey } from '@/hooks/useWatchlistQuery'

export const useAddToWatchlistMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tmdb_id, media_type }: WatchlistEntryIdentity) => {
      const body: WatchlistEntryCreate = {
        tmdb_id,
        media_type,
        status: 'want',
      }
      const { data } = await apiClient.post<WatchlistEntryRead>('/entry', body)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchlistQueryKey })
    },
  })
}

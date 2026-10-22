import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../services/apiClient'
import type {
  WatchlistEntryRead,
  WatchlistEntryUpdate,
  WatchlistMediaType,
} from '@/types/watchlist'
import { watchlistQueryKey } from '@/hooks/useWatchlistQuery'

type UpdateWatchlistEntryVariables = {
  id: number
  tmdbId: number
  mediaType: WatchlistMediaType
  update: WatchlistEntryUpdate
}

export const useUpdateWatchlistEntryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, update }: UpdateWatchlistEntryVariables) => {
      const { data } = await apiClient.patch<WatchlistEntryRead>(
        `/entry/${id}`,
        update,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchlistQueryKey })
    },
  })
}

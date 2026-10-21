import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../services/apiClient'
import type { TvSeason } from '@/types/tvDetails'

export const useTvSeasonQuery = (
  showId: number,
  seasonNumber: number,
  enabled: boolean,
) =>
  useQuery({
    queryKey: ['tv-season', showId, seasonNumber],
    enabled,
    queryFn: async () => {
      const { data } = await apiClient.get<TvSeason>(
        `/tv/${showId}/season/${seasonNumber}`,
      )
      return data
    },
    retry: false,
  })

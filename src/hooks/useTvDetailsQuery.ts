import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../services/apiClient'
import type { TvDetails } from '@/types/tvDetails'
import { isNumericMovieId } from '@/utils/isNumericMovieId'

export const useTvDetailsQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: ['tv', id],
    enabled: isNumericMovieId(id),
    queryFn: async () => {
      const { data } = await apiClient.get<TvDetails>(`/tv/${id}`)
      return data
    },
    retry: false,
  })
}

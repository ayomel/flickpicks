import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../services/apiClient'
import type { SearchMediaResult, SearchResponse } from '@/types/search'

export const MIN_SEARCH_LENGTH = 2

export const useSearchQuery = (query: string) => {
  const trimmed = query.trim()

  return useQuery({
    queryKey: ['search', trimmed],
    enabled: trimmed.length >= MIN_SEARCH_LENGTH,
    queryFn: async () => {
      const { data } = await apiClient.get<SearchResponse>('/search', {
        params: { query: trimmed },
      })
      return data.results ?? []
    },
  })
}

export type { SearchMediaResult }

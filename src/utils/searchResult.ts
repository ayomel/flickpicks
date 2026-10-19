import type { SearchMediaResult } from '@/types/search'
import { formatReleaseYear } from '@/utils/formatMovie'

export const getSearchResultTitle = (item: SearchMediaResult) => {
  return item.media_type === 'movie' ? item.title : item.name
}

export const getSearchResultYear = (item: SearchMediaResult) => {
  const date =
    item.media_type === 'movie' ? item.release_date : item.first_air_date
  return formatReleaseYear(date ?? '')
}

export const getSearchResultKey = (item: SearchMediaResult) => {
  return `${item.media_type}-${item.id}`
}

export const getSearchResultPath = (item: SearchMediaResult) =>
  item.media_type === 'movie' ? `/movies/${item.id}` : `/tv/${item.id}`

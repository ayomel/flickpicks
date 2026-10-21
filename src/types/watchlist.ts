export type WatchlistStatus = 'want' | 'watched'
export type WatchlistMediaType = 'movie' | 'tv'

export type WatchlistEntryIdentity = {
  tmdb_id: number
  media_type: WatchlistMediaType
}

export type WatchlistEntryCreate = WatchlistEntryIdentity & {
  status?: WatchlistStatus
  rating?: number | null
  review?: string
  added_by?: string
}

export type WatchlistEntryRead = {
  id: number
  tmdb_id: number
  media_type: WatchlistMediaType
  status: WatchlistStatus
  rating: number | null
  review: string
  added_by: string
  created_at: string
  updated_at: string
}

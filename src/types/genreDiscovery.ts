export type GenreDiscoveryMovieResult = {
  id: number
  media_type: 'movie'
  title: string
  release_date: string
  poster_path: string | null
}

export type GenreDiscoveryTvResult = {
  id: number
  media_type: 'tv'
  name: string
  first_air_date: string
  poster_path: string | null
}

export type GenreDiscoveryResult =
  GenreDiscoveryMovieResult | GenreDiscoveryTvResult

export type GenreDiscoveryResponse = {
  results: GenreDiscoveryResult[]
}

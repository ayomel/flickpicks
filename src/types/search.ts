export type MovieGenre = {
  id: number
  name: string
}

export type MovieCollection = {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
}

export type ProductionCompany = {
  id: number
  logo_path: string | null
  name: string
  origin_country: string
}

export type ProductionCountry = {
  iso_3166_1: string
  name: string
}

export type SpokenLanguage = {
  english_name: string
  iso_639_1: string
  name: string
}

export type SearchMovie = {
  adult: boolean
  backdrop_path: string | null
  belongs_to_collection: MovieCollection | null
  budget: number
  genres: MovieGenre[]
  homepage: string
  id: number
  imdb_id: string | null
  origin_country: string[]
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string | null
  production_companies: ProductionCompany[]
  production_countries: ProductionCountry[]
  release_date: string
  revenue: number
  runtime: number
  softcore: boolean
  spoken_languages: SpokenLanguage[]
  status: string
  tagline: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
}

type SearchResultBase = {
  adult: boolean
  backdrop_path: string | null
  genre_ids: number[]
  id: number
  original_language: string
  overview: string
  popularity: number
  poster_path: string | null
  softcore: boolean
  vote_average: number
  vote_count: number
}

/** TMDB multi-search movie hit (`GET /search`). */
export type SearchMovieResult = SearchResultBase & {
  media_type: 'movie'
  original_title: string
  release_date: string
  title: string
  video: boolean
}

/** TMDB multi-search TV hit (`GET /search`). */
export type SearchTvResult = SearchResultBase & {
  media_type: 'tv'
  first_air_date: string
  name: string
  original_name: string
  origin_country?: string[]
}

export type SearchMediaResult = SearchMovieResult | SearchTvResult

export type SearchResponse = {
  page: number
  results: SearchMediaResult[]
  total_pages?: number
  total_results?: number
}

/** @deprecated Use SearchResponse */
export type SearchMoviesResponse = SearchResponse

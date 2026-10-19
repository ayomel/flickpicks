import type {
  MovieGenre,
  ProductionCompany,
  ProductionCountry,
  SpokenLanguage,
} from './search'
import type { MovieVideos, StreamingProviders } from './movieDetails'

export type TvCreator = {
  id: number
  credit_id: string
  name: string
  gender: number
  profile_path: string | null
}

export type TvNetwork = {
  id: number
  logo_path: string | null
  name: string
  origin_country: string
}

export type TvShow = {
  adult: boolean
  backdrop_path: string | null
  created_by: TvCreator[]
  episode_run_time: number[]
  first_air_date: string
  genres: MovieGenre[]
  homepage: string
  id: number
  in_production: boolean
  languages: string[]
  last_air_date: string
  name: string
  networks: TvNetwork[]
  number_of_episodes: number
  number_of_seasons: number
  origin_country: string[]
  original_language: string
  original_name: string
  overview: string
  popularity: number
  poster_path: string | null
  production_companies: ProductionCompany[]
  production_countries: ProductionCountry[]
  softcore: boolean
  spoken_languages: SpokenLanguage[]
  status: string
  tagline: string
  type: string
  vote_average: number
  vote_count: number
}

export type TvDetails = TvShow & {
  trailer?: string | null
  backdrop?: string | null
  poster?: string | null
  videos?: MovieVideos
  streaming_providers?: StreamingProviders
}

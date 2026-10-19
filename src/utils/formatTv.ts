import type { TvDetails } from '@/types/tvDetails'
import { getBackdropPath, getPosterPath } from '@/utils/getPosterPath'
import {
  formatReleaseDate,
  formatReleaseYear,
  formatRuntime,
} from '@/utils/formatMovie'

export const formatFirstAirYear = (date: string) => formatReleaseYear(date)

export const formatFirstAirDate = (date: string) => formatReleaseDate(date)

export const formatLastAirDate = (date: string) => formatReleaseDate(date)

export const formatSeasonsEpisodes = (
  seasons: number,
  episodes: number,
): string | null => {
  if (!seasons && !episodes) return null
  const seasonPart =
    seasons === 1 ? '1 season' : seasons > 0 ? `${seasons} seasons` : null
  const episodePart =
    episodes === 1 ? '1 episode' : episodes > 0 ? `${episodes} episodes` : null
  if (seasonPart && episodePart) return `${seasonPart} · ${episodePart}`
  return seasonPart ?? episodePart
}

export const formatEpisodeRuntime = (minutes: number[]) => {
  const first = minutes.find((m) => m > 0)
  if (!first) return null
  const formatted = formatRuntime(first)
  return formatted ? `${formatted} / ep` : null
}

export const getCreatorNames = (show: TvDetails) => {
  const names = show.created_by?.map((c) => c.name).filter(Boolean)
  if (!names?.length) return null
  return names.join(', ')
}

export const getNetworkNames = (show: TvDetails) => {
  const names = show.networks?.map((n) => n.name).filter(Boolean)
  if (!names?.length) return null
  return names.join(', ')
}

export const getTvPrimaryLanguage = (show: TvDetails) => {
  const spoken = show.spoken_languages?.[0]?.english_name
  if (spoken) return spoken
  return show.original_language?.toUpperCase() ?? null
}

export const getTvCountryNames = (show: TvDetails) => {
  const fromProduction = show.production_countries
    ?.map((c) => c.name)
    .filter(Boolean)
  if (fromProduction?.length) return fromProduction.join(', ')
  const codes = show.origin_country?.filter(Boolean)
  if (!codes?.length) return null
  return codes.join(', ')
}

export const resolveTvBackdropUrl = (show: TvDetails) => {
  if (show.backdrop?.startsWith('http')) return show.backdrop
  if (show.backdrop_path) return getBackdropPath(show.backdrop_path)
  return null
}

export const resolveTvPosterUrl = (show: TvDetails) => {
  if (show.poster?.startsWith('http')) return show.poster
  if (show.poster_path) return getPosterPath(show.poster_path)
  return null
}

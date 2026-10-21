import type { MovieDetails } from '@/types/movieDetails'
import { getBackdropPath, getPosterPath } from '@/utils/getPosterPath'

export const formatRuntime = (minutes: number) => {
  if (!minutes || minutes <= 0) return null
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export const formatReleaseDate = (date: string) => {
  if (!date) return null
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatReleaseYear = (date: string) => {
  if (!date) return null
  return date.slice(0, 4)
}

export const formatRating = (voteAverage: number) => {
  return voteAverage.toFixed(1)
}

export const extractYoutubeVideoId = (url: string) => {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1).split('/')[0] || null
    }
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v')
      if (v) return v
      const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/)
      if (embedMatch?.[1]) return embedMatch[1]
    }
  } catch {
    return null
  }
  return null
}

export const resolveTrailerVideoId = (
  movie: Pick<MovieDetails, 'trailer' | 'videos'>,
) => {
  if (movie.trailer) {
    const fromTrailer = extractYoutubeVideoId(movie.trailer)
    if (fromTrailer) return fromTrailer
  }

  const videos = movie.videos?.results ?? []
  const trailers = videos.filter(
    (v) => v.site === 'YouTube' && v.type === 'Trailer',
  )
  const official = trailers.find((v) => v.official)
  if (official?.key) return official.key
  if (trailers[0]?.key) return trailers[0].key
  return null
}

export const resolveTrailerUrl = (movie: MovieDetails) => {
  if (movie.trailer) return movie.trailer
  const videoId = resolveTrailerVideoId(movie)
  if (videoId) return `https://www.youtube.com/watch?v=${videoId}`
  return null
}

export const getYoutubeEmbedUrl = (videoId: string) => {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
}

export const getYoutubeThumbUrl = (videoId: string) => {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

const youtubeVideoGroup = (video: { type: string; official: boolean }) => {
  if (video.type === 'Trailer' && video.official) return 0
  if (video.type === 'Teaser') return 1
  return 2
}

export const getYoutubeVideos = (movie: MovieDetails) => {
  return (movie.videos?.results ?? [])
    .filter((video) => video.site === 'YouTube' && Boolean(video.key))
    .slice()
    .sort((a, b) => {
      const groupDiff = youtubeVideoGroup(a) - youtubeVideoGroup(b)
      if (groupDiff !== 0) return groupDiff
      return (b.published_at ?? '').localeCompare(a.published_at ?? '')
    })
}

export const resolveBackdropUrl = (movie: MovieDetails) => {
  if (movie.backdrop?.startsWith('http')) return movie.backdrop
  if (movie.backdrop_path) return getBackdropPath(movie.backdrop_path)
  return null
}

export const getProviderLogoUrl = (logoPath: string) => {
  return `https://image.tmdb.org/t/p/w92${logoPath}`
}

export const getPrimaryLanguage = (movie: MovieDetails) => {
  const spoken = movie.spoken_languages?.[0]?.english_name
  if (spoken) return spoken
  return movie.original_language?.toUpperCase() ?? null
}

export const getStudioNames = (movie: MovieDetails) => {
  const names = movie.production_companies?.map((c) => c.name).filter(Boolean)
  if (!names?.length) return null
  return names.join(', ')
}

export const getCountryNames = (movie: MovieDetails) => {
  const names = movie.production_countries?.map((c) => c.name).filter(Boolean)
  if (!names?.length) return null
  return names.join(', ')
}

export const formatBudget = (budget: number) => {
  if (!budget || budget <= 0) return null
  if (budget >= 1_000_000_000) {
    const billions = budget / 1_000_000_000
    const formatted = Number.isInteger(billions)
      ? String(billions)
      : billions.toFixed(1).replace(/\.0$/, '')
    return `$${formatted}B`
  }
  if (budget >= 1_000_000) {
    const millions = budget / 1_000_000
    const formatted = Number.isInteger(millions)
      ? String(millions)
      : millions.toFixed(1).replace(/\.0$/, '')
    return `$${formatted}M`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(budget)
}

export const resolvePosterUrl = (movie: MovieDetails) => {
  if (movie.poster?.startsWith('http')) return movie.poster
  if (movie.poster_path) return getPosterPath(movie.poster_path)
  return null
}

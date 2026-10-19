/** Same production origin the Worker uses for canonical and og:url. */
export const SITE_ORIGIN = 'https://flickpick.mel-2cb.workers.dev'

export const mediaOgImageUrl = (media: {
  backdrop_path?: string | null
  poster_path?: string | null
}) => {
  const path = media.backdrop_path || media.poster_path
  if (!path) return null
  return `https://image.tmdb.org/t/p/w780${path}`
}

export const movieOgImageUrl = mediaOgImageUrl

export const absoluteUrl = (pathname: string) => {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${SITE_ORIGIN}${path}`
}

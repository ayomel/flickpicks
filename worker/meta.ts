export const DEFAULT_API_ORIGIN = 'https://flickpicks.fastapicloud.dev'
export const SITE_ORIGIN = 'https://flickpick.mel-2cb.workers.dev'
const TMDB_OG_IMAGE = 'https://image.tmdb.org/t/p/w780'
const CACHE_TTL_SECONDS = 60 * 60
const FETCH_TIMEOUT_MS = 1500

export type MovieMetaSource = {
  id: number
  title: string
  overview?: string | null
  poster_path?: string | null
  backdrop_path?: string | null
}

export type TvMetaSource = {
  id: number
  name: string
  overview?: string | null
  poster_path?: string | null
  backdrop_path?: string | null
}

export const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

export const moviePageTitle = (title: string) => `${title} · FlickPick`

export const movieCanonicalUrl = (id: number, origin = SITE_ORIGIN) =>
  `${origin}/movies/${id}`

export const movieDescription = (movie: MovieMetaSource) =>
  (movie.overview ?? '').trim() || `Details for ${movie.title} on FlickPick.`

export const movieOgImage = (movie: MovieMetaSource) => {
  const path = movie.backdrop_path || movie.poster_path
  if (!path) return null
  return `${TMDB_OG_IMAGE}${path}`
}

export const buildMetaTagsHtml = (movie: MovieMetaSource) => {
  const title = escapeHtml(moviePageTitle(movie.title))
  const description = escapeHtml(movieDescription(movie))
  const canonical = escapeHtml(movieCanonicalUrl(movie.id))
  const image = movieOgImage(movie)
  const imageTag = image
    ? `<meta property="og:image" content="${escapeHtml(image)}" />`
    : ''

  return [
    `<meta property="og:type" content="video.movie" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    imageTag,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<link rel="canonical" href="${canonical}" />`,
  ]
    .filter(Boolean)
    .join('')
}

export type FetchMovieMetaResult = MovieMetaSource | 'not_found' | null

export const fetchMovieMeta = async (
  id: string,
  apiOrigin = DEFAULT_API_ORIGIN,
): Promise<FetchMovieMetaResult> => {
  try {
    const response = await fetch(
      `${apiOrigin.replace(/\/$/, '')}/movies/${id}`,
      {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        cf: {
          cacheTtl: CACHE_TTL_SECONDS,
          cacheEverything: true,
        },
      },
    )
    if (response.status === 404) return 'not_found'
    if (!response.ok) return null
    const data = (await response.json()) as MovieMetaSource
    if (!data?.id || !data?.title) return null
    return data
  } catch {
    return null
  }
}

export const withoutCacheValidators = (response: Response) => {
  const headers = new Headers(response.headers)
  headers.delete('ETag')
  headers.delete('Last-Modified')
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

const injectShellMeta = async (
  shell: Response,
  title: string,
  description: string,
  tags: string,
) => {
  const rewritten = await new HTMLRewriter()
    .on('title', {
      element(element) {
        element.setInnerContent(title)
      },
    })
    .on('meta[name="description"]', {
      element(element) {
        element.setAttribute('content', description)
      },
    })
    .on('head', {
      element(element) {
        element.append(tags, { html: true })
      },
    })
    .transform(shell)

  return withoutCacheValidators(rewritten)
}

export const injectMovieMeta = async (
  shell: Response,
  movie: MovieMetaSource,
) => {
  return injectShellMeta(
    shell,
    moviePageTitle(movie.title),
    movieDescription(movie),
    buildMetaTagsHtml(movie),
  )
}

export const tvPageTitle = (name: string) => `${name} · FlickPick`

export const tvCanonicalUrl = (id: number, origin = SITE_ORIGIN) =>
  `${origin}/tv/${id}`

export const tvDescription = (show: TvMetaSource) =>
  (show.overview ?? '').trim() || `Details for ${show.name} on FlickPick.`

export const tvOgImage = (show: TvMetaSource) => {
  const path = show.backdrop_path || show.poster_path
  if (!path) return null
  return `${TMDB_OG_IMAGE}${path}`
}

export const buildTvMetaTagsHtml = (show: TvMetaSource) => {
  const title = escapeHtml(tvPageTitle(show.name))
  const description = escapeHtml(tvDescription(show))
  const canonical = escapeHtml(tvCanonicalUrl(show.id))
  const image = tvOgImage(show)
  const imageTag = image
    ? `<meta property="og:image" content="${escapeHtml(image)}" />`
    : ''

  return [
    `<meta property="og:type" content="video.tv_show" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    imageTag,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<link rel="canonical" href="${canonical}" />`,
  ]
    .filter(Boolean)
    .join('')
}

export type FetchTvMetaResult = TvMetaSource | 'not_found' | null

export const fetchTvMeta = async (
  id: string,
  apiOrigin = DEFAULT_API_ORIGIN,
): Promise<FetchTvMetaResult> => {
  try {
    const response = await fetch(`${apiOrigin.replace(/\/$/, '')}/tv/${id}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cf: {
        cacheTtl: CACHE_TTL_SECONDS,
        cacheEverything: true,
      },
    })
    if (response.status === 404) return 'not_found'
    if (!response.ok) return null
    const data = (await response.json()) as TvMetaSource
    if (!data?.id || !data?.name) return null
    return data
  } catch {
    return null
  }
}

export const injectTvMeta = async (shell: Response, show: TvMetaSource) => {
  return injectShellMeta(
    shell,
    tvPageTitle(show.name),
    tvDescription(show),
    buildTvMetaTagsHtml(show),
  )
}

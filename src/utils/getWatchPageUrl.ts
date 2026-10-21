export type WatchMediaType = 'movie' | 'tv'

export const getWatchPageUrl = (
  mediaType: WatchMediaType,
  mediaId: number,
  baseUrl: string | undefined,
) => {
  if (!Number.isSafeInteger(mediaId) || mediaId <= 0 || !baseUrl) return null

  try {
    const url = new URL(baseUrl)
    const hasInvalidBasePath = url.pathname !== '/' && url.pathname !== ''

    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port ||
      hasInvalidBasePath ||
      url.search ||
      url.hash
    ) {
      return null
    }

    return `${url.origin}/${mediaType}/${mediaId}/watch`
  } catch {
    return null
  }
}

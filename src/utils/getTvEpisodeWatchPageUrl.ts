import { getWatchPageUrl } from './getWatchPageUrl'

export const getTvEpisodeWatchPageUrl = (
  showId: number,
  seasonNumber: number,
  episodeNumber: number,
  baseUrl: string | undefined,
) => {
  if (
    !Number.isSafeInteger(seasonNumber) ||
    seasonNumber < 0 ||
    !Number.isSafeInteger(episodeNumber) ||
    episodeNumber <= 0
  ) {
    return null
  }

  const showWatchUrl = getWatchPageUrl('tv', showId, baseUrl)
  if (!showWatchUrl) return null

  const url = new URL(showWatchUrl)
  url.searchParams.set('episode', String(episodeNumber))
  url.searchParams.set('open', `tv-${showId}`)
  url.searchParams.set('season', String(seasonNumber))
  url.searchParams.set('watch', '1')

  return url.toString()
}

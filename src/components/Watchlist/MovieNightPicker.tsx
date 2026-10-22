import { useState } from 'react'
import { Film } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MovieWatchLink } from '@/components/MovieDetails/MovieWatchLink'
import { TrailerPlayer } from '@/components/MovieDetails/TrailerPlayer'
import { TvWatchLink } from '@/components/TvDetails/TvWatchLink'
import { Button } from '@/components/ui/button'
import { useWatchlistTitles } from '@/hooks/useWatchlistQuery'
import { cn } from '@/lib/utils'
import type { WatchlistTitle } from '@/hooks/useWatchlistQuery'
import {
  formatReleaseYear,
  formatRuntime,
  getProviderLogoUrl,
} from '@/utils/formatMovie'
import { getBackdropPath, getPosterCardPath } from '@/utils/getPosterPath'
import { uniqueProviders } from '@/utils/watchProviders'

const titleKey = (title: Pick<WatchlistTitle, 'id' | 'media_type'>) =>
  `${title.media_type}:${title.id}`

const pickRandomTitle = (titles: WatchlistTitle[]) =>
  titles[Math.floor(Math.random() * titles.length)]

const getRuntime = (title: WatchlistTitle) => {
  if (title.media_type === 'tv') {
    const episodeRuntime = title.episode_run_time?.find(
      (runtime) => runtime > 0,
    )
    const formatted = episodeRuntime ? formatRuntime(episodeRuntime) : null
    return formatted ? `${formatted} per episode` : null
  }

  return formatRuntime(title.runtime ?? 0)
}

const getProviders = (title: WatchlistTitle) =>
  uniqueProviders([
    ...(title.streaming_providers?.flatrate ?? []),
    ...(title.streaming_providers?.rent ?? []),
    ...(title.streaming_providers?.buy ?? []),
  ])

export const MovieNightPicker = () => {
  const { titles, isLoadingTitles, isError, entriesQuery } =
    useWatchlistTitles()
  const [pickedKey, setPickedKey] = useState<string | null>(null)
  const entriesByTitle = new Map(
    (entriesQuery.data ?? []).map((entry) => [
      `${entry.media_type}:${entry.tmdb_id}`,
      entry,
    ]),
  )
  const wantTitles = titles.filter(
    (title) => entriesByTitle.get(titleKey(title))?.status === 'want',
  )
  const currentPick = wantTitles.find((title) => titleKey(title) === pickedKey)
  const nextPicks = wantTitles.filter((title) => titleKey(title) !== pickedKey)
  const providers = currentPick ? getProviders(currentPick) : []
  const year = currentPick ? formatReleaseYear(currentPick.release_date) : null
  const runtime = currentPick ? getRuntime(currentPick) : null
  const metadata = [year, runtime].filter(Boolean).join(' · ')

  const pickTitle = () => {
    if (nextPicks.length === 0) return
    const nextTitle = pickRandomTitle(nextPicks)
    if (nextTitle) setPickedKey(titleKey(nextTitle))
  }

  return (
    <section
      aria-labelledby="movie-night-picker-title"
      className="mx-4 mb-8 overflow-hidden rounded-xl border border-border bg-card sm:mx-6"
      aria-busy={isLoadingTitles}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="m-0 font-mono text-xs font-semibold tracking-[0.08em] text-brand uppercase">
            Movie night
          </p>
          <h2
            id="movie-night-picker-title"
            className="m-0 mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
          >
            Pick for us tonight
          </h2>
          <p className="m-0 mt-1 text-sm text-muted-foreground">
            Let your saved-to-watch list make the call.
          </p>
        </div>
        {wantTitles.length > 0 ? (
          <Button
            onPress={pickTitle}
            isDisabled={isLoadingTitles || nextPicks.length === 0}
          >
            {currentPick ? 'Pick again' : 'Pick for us tonight'}
          </Button>
        ) : null}
      </div>

      {isLoadingTitles ? (
        <p
          role="status"
          className="m-0 border-t border-border px-5 py-4 text-sm text-muted-foreground sm:px-6"
        >
          Loading your watchlist…
        </p>
      ) : isError ? (
        <p
          role="status"
          className="m-0 border-t border-border px-5 py-4 text-sm text-muted-foreground sm:px-6"
        >
          Couldn’t load your watchlist. Try again in a moment.
        </p>
      ) : wantTitles.length === 0 ? (
        <div className="border-t border-border px-5 py-5 sm:px-6">
          <p className="m-0 text-sm text-muted-foreground">
            Save a few titles to your watchlist to give the picker something to
            choose from.
          </p>
          <Link
            to="/#browse"
            className="mt-3 inline-flex rounded-sm text-sm font-semibold text-foreground underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Browse trending movies
          </Link>
        </div>
      ) : currentPick ? (
        <div
          role="region"
          aria-label="Tonight’s pick"
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            'relative isolate overflow-hidden border-t border-border bg-background',
            'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300',
          )}
        >
          {currentPick.backdrop_path ? (
            <img
              src={getBackdropPath(currentPick.backdrop_path)}
              alt=""
              aria-hidden
              className="absolute inset-0 -z-10 size-full object-cover opacity-25"
            />
          ) : null}
          <div
            className="absolute inset-0 -z-10 bg-linear-to-r from-background via-background/95 to-background/65"
            aria-hidden
          />
          <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-7">
            <div className="aspect-[2/3] w-32 shrink-0 overflow-hidden rounded-md border border-border bg-muted shadow-lg sm:w-40">
              {currentPick.poster_path ? (
                <img
                  src={getPosterCardPath(currentPick.poster_path)}
                  alt={`${currentPick.title} poster`}
                  width={342}
                  height={513}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Film className="size-8 text-muted-foreground" aria-hidden />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 font-mono text-xs font-semibold tracking-[0.08em] text-brand uppercase">
                Tonight’s pick
              </p>
              <h3 className="m-0 mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {currentPick.title}
              </h3>
              {metadata ? (
                <p className="m-0 mt-2 font-mono text-sm text-muted-foreground">
                  {metadata}
                </p>
              ) : null}
              {currentPick.genres?.length ? (
                <ul
                  aria-label="Genres"
                  className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0"
                >
                  {currentPick.genres.map((genre) => (
                    <li
                      key={genre.id}
                      className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-foreground"
                    >
                      {genre.name}
                    </li>
                  ))}
                </ul>
              ) : null}
              {providers.length > 0 ? (
                <div className="mt-4">
                  <p className="m-0 mb-2 font-mono text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    Where to watch
                  </p>
                  <ul
                    aria-label="Streaming providers"
                    className="m-0 flex list-none flex-wrap gap-2 p-0"
                  >
                    {providers.map((provider) => (
                      <li
                        key={provider.provider_id}
                        className="inline-flex items-center gap-2 rounded-md border border-border bg-background/70 px-2 py-1.5 text-sm text-foreground"
                      >
                        <img
                          src={getProviderLogoUrl(provider.logo_path)}
                          alt=""
                          aria-hidden="true"
                          width={32}
                          height={32}
                          onError={(event) => {
                            event.currentTarget.hidden = true
                          }}
                          className="size-8 rounded-sm object-contain"
                        />
                        <span>{provider.provider_name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-3">
                {currentPick.media_type === 'tv' ? (
                  <TvWatchLink showId={currentPick.id} />
                ) : (
                  <MovieWatchLink movieId={currentPick.id} />
                )}
                <TrailerPlayer
                  media={{
                    title: currentPick.title,
                    trailer: currentPick.trailer,
                    videos: currentPick.videos,
                  }}
                />
                <Link
                  to={
                    currentPick.media_type === 'tv'
                      ? `/tv/${currentPick.id}`
                      : `/movies/${currentPick.id}`
                  }
                  aria-label={`Open ${currentPick.title} details`}
                  className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-foreground/70"
                >
                  View details
                </Link>
              </div>
              {pickedKey && nextPicks.length === 0 ? (
                <p className="m-0 mt-3 text-sm text-muted-foreground">
                  Only one title is saved to watch, so there isn’t another pick
                  yet.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

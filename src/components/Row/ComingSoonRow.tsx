import { BackdropCard } from '@/components/Row/BackdropCard'
import { MediaRow } from '@/components/Row/MediaRow'
import { useUpcomingQuery } from '@/hooks/useUpcomingQuery'
import type { UpcomingMovie } from '@/types/upcoming'

const localTodayIso = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isReleasedOnOrAfterToday = (movie: UpcomingMovie, today: string) => {
  if (!movie.release_date) return false
  return movie.release_date >= today
}

export const ComingSoonRow = () => {
  const { data, isLoading, isError } = useUpcomingQuery()
  const today = localTodayIso()
  const movies = (data?.results ?? []).filter((movie) =>
    isReleasedOnOrAfterToday(movie, today),
  )

  return (
    <MediaRow
      label="Coming soon"
      title="Upcoming movies"
      variant="backdrop"
      items={movies}
      getKey={(movie) => movie.id}
      isLoading={isLoading}
      isError={isError}
      emptyMessage="No upcoming titles right now."
      errorMessage="Couldn't load upcoming movies."
      renderItem={(movie, { tabIndex, onFocus }) => (
        <BackdropCard movie={movie} tabIndex={tabIndex} onFocus={onFocus} />
      )}
    />
  )
}

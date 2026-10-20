import { SectionLabel } from '@/components/ui/section-label'
import { cn } from '@/lib/utils'

type MovieOverviewProps = {
  overview: string
  clampLines?: boolean
  showLabel?: boolean
}

export const MovieOverview = ({
  overview,
  clampLines = false,
  showLabel = true,
}: MovieOverviewProps) => {
  if (!overview) return null

  return (
    <section>
      {showLabel ? (
        <SectionLabel className="mb-2">Overview</SectionLabel>
      ) : null}
      <p
        className={cn(
          'm-0 text-sm leading-relaxed text-muted-foreground sm:text-base',
          clampLines && 'line-clamp-3',
        )}
      >
        {overview}
      </p>
    </section>
  )
}

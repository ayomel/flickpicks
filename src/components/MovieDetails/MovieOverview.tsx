import { SectionLabel } from '@/components/ui/section-label'
import { cn } from '@/lib/utils'

type MovieOverviewProps = {
  overview: string
  className?: string
  clampLines?: boolean
  showLabel?: boolean
}

export const MovieOverview = ({
  overview,
  className,
  clampLines = false,
  showLabel = true,
}: MovieOverviewProps) => {
  if (!overview) return null

  return (
    <section className={className}>
      {showLabel ? (
        <SectionLabel className="mb-2">Overview</SectionLabel>
      ) : null}
      <p
        className={cn(
          'm-0 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base',
          clampLines && 'line-clamp-3 lg:line-clamp-none',
        )}
      >
        {overview}
      </p>
    </section>
  )
}

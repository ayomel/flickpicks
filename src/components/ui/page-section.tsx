import type { ReactNode } from 'react'
import { detailPageShell } from '@/components/MovieDetails/detailPageLayout'
import { cn } from '@/lib/utils'

type PageSectionProps = {
  children: ReactNode
  className?: string
  bordered?: boolean
}

export const PageSection = ({
  children,
  className,
  bordered = true,
}: PageSectionProps) => {
  return (
    <section
      className={cn('py-10', bordered && 'border-t border-border', className)}
    >
      <div className={detailPageShell}>{children}</div>
    </section>
  )
}

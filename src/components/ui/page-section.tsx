import type { ReactNode } from 'react'
import { detailPageShell } from '@/components/MovieDetails/detailPageLayout'
import { cn } from '@/lib/utils'

type PageSectionProps = {
  children: ReactNode
  className?: string
  bordered?: boolean
  /** Align with movie detail page `max-w-6xl` gutter. */
  contentInset?: 'default' | 'detail'
}

export const PageSection = ({
  children,
  className,
  bordered = true,
  contentInset = 'default',
}: PageSectionProps) => {
  if (contentInset === 'detail') {
    return (
      <section
        className={cn(
          'py-10',
          bordered && 'border-t border-border',
          className,
        )}
      >
        <div className={detailPageShell}>{children}</div>
      </section>
    )
  }

  return (
    <section
      className={cn(
        'px-6 py-10 sm:px-8 lg:px-10',
        bordered && 'border-t border-border',
        className,
      )}
    >
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  )
}

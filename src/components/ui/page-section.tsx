import type { ReactNode } from 'react'
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
  return (
    <section
      className={cn(
        'px-6 py-10 sm:px-8 lg:px-10',
        bordered && 'border-t border-border',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto w-full',
          contentInset === 'detail' ? 'max-w-6xl' : 'max-w-5xl',
        )}
      >
        {children}
      </div>
    </section>
  )
}

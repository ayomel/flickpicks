import type { FocusEventHandler, ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/ui/section-label'
import { Skeleton } from '@/components/ui/skeleton'
import { useMediaRowNavigation } from '@/hooks/useMediaRowNavigation'
import { cn } from '@/lib/utils'
import {
  detailPageShell,
  detailPageTrackPad,
} from '@/components/MovieDetails/detailPageLayout'

export type MediaRowItemOptions = {
  tabIndex: number
  onFocus: FocusEventHandler<HTMLElement>
  eager: boolean
}

type MediaRowProps<T> = {
  label: string
  title: string
  items: T[]
  getKey: (item: T) => string | number
  renderItem: (item: T, options: MediaRowItemOptions) => ReactNode
  isLoading?: boolean
  isError?: boolean
  emptyMessage?: string
  errorMessage?: string
  footer?: ReactNode
  className?: string
  variant?: 'poster' | 'backdrop'
  showHeading?: boolean
  /** First N cards load eagerly for LCP on above-the-fold rows. */
  eagerCount?: number
  detailGutter?: boolean
}

const rowPad = (detailGutter: boolean) =>
  detailGutter
    ? detailPageTrackPad
    : 'px-6 scroll-px-6 sm:px-8 sm:scroll-px-8 lg:px-10 lg:scroll-px-10'

const headingWrap = (detailGutter: boolean) =>
  detailGutter ? detailPageShell : 'px-6 sm:px-8 lg:px-10'

const MediaRowSkeleton = ({
  variant,
  detailGutter = false,
}: {
  variant: 'poster' | 'backdrop'
  detailGutter?: boolean
}) => {
  const cardClass =
    variant === 'backdrop' ? 'w-64 shrink-0 sm:w-80' : 'w-36 shrink-0 sm:w-40'
  const aspectClass = variant === 'backdrop' ? 'aspect-video' : 'aspect-[2/3]'

  return (
    <div
      className={cn('flex gap-3 overflow-hidden py-2', rowPad(detailGutter))}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className={cardClass}>
          <Skeleton className={cn(aspectClass, 'w-full rounded-md')} />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>
      ))}
    </div>
  )
}

type ArrowSlotProps = {
  show: boolean
  label: string
  onPress: () => void
  side: 'left' | 'right'
  children: ReactNode
}

const ArrowSlot = ({
  show,
  label,
  onPress,
  side,
  children,
}: ArrowSlotProps) => {
  if (!show) return null

  return (
    <Button
      size="icon"
      variant="secondary"
      excludeFromTabOrder
      aria-label={label}
      className={cn(
        'absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 sm:inline-flex',
        side === 'left' ? 'left-2' : 'right-2',
      )}
      onPress={onPress}
    >
      {children}
    </Button>
  )
}

export function MediaRow<T>({
  label,
  title,
  items,
  getKey,
  renderItem,
  isLoading = false,
  isError = false,
  emptyMessage = 'Nothing here yet.',
  errorMessage = "Couldn't load this row.",
  footer,
  className,
  variant = 'poster',
  showHeading = true,
  eagerCount = 0,
  detailGutter = false,
}: MediaRowProps<T>) {
  const itemCount = items.length
  const isEmpty = !isLoading && !isError && itemCount === 0
  const {
    activeIndex,
    canScrollLeft,
    canScrollRight,
    listRef,
    onItemFocus,
    onListKeyDown,
    scrollByCards,
  } = useMediaRowNavigation({
    itemCount,
    enabled: !isLoading && !isError && !isEmpty,
  })
  const skipId = `after-${label}-${title}`.toLowerCase().replace(/\s+/g, '-')

  return (
    <section className={cn('relative z-10 py-8', className)}>
      {showHeading ? (
        <div className={headingWrap(detailGutter)}>
          <SectionLabel className="mb-2">{label}</SectionLabel>
          <h2 className="mb-5 text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
        </div>
      ) : null}

      {isLoading ? (
        <MediaRowSkeleton variant={variant} detailGutter={detailGutter} />
      ) : isError ? (
        <p
          className={cn(
            'm-0 text-sm text-muted-foreground',
            headingWrap(detailGutter),
          )}
        >
          {errorMessage}
        </p>
      ) : isEmpty ? (
        <p
          className={cn(
            'm-0 text-sm text-muted-foreground',
            headingWrap(detailGutter),
          )}
        >
          {emptyMessage}
        </p>
      ) : (
        <>
          <a
            href={`#${skipId}`}
            className="sr-only focus:not-sr-only focus:absolute focus:z-30 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:text-foreground focus:ring-2 focus:ring-foreground/70"
          >
            Skip {title}
          </a>

          <div className="relative">
            <ArrowSlot
              show={canScrollLeft}
              label={`Scroll ${title} left`}
              side="left"
              onPress={() => scrollByCards(-1)}
            >
              <ChevronLeft />
            </ArrowSlot>

            <ul
              ref={listRef}
              aria-label={title}
              className={cn(
                'm-0 flex w-full list-none gap-3 overflow-x-auto py-3',
                'snap-x snap-mandatory scroll-smooth [scrollbar-width:thin]',
                rowPad(detailGutter),
              )}
              onKeyDown={onListKeyDown}
            >
              {items.map((item, index) => (
                <li
                  key={getKey(item)}
                  data-row-index={index}
                  className="contents"
                >
                  {renderItem(item, {
                    tabIndex: index === activeIndex ? 0 : -1,
                    onFocus: () => onItemFocus(index),
                    eager: index < eagerCount,
                  })}
                </li>
              ))}
            </ul>

            <ArrowSlot
              show={canScrollRight}
              label={`Scroll ${title} right`}
              side="right"
              onPress={() => scrollByCards(1)}
            >
              <ChevronRight />
            </ArrowSlot>
          </div>

          <div id={skipId} />
        </>
      )}

      {footer ? (
        <div className={headingWrap(detailGutter)}>{footer}</div>
      ) : null}
    </section>
  )
}

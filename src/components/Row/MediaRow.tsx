import {
  useEffect,
  useRef,
  useState,
  type FocusEventHandler,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/ui/section-label'
import { Skeleton } from '@/components/ui/skeleton'
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
  contentInset?: 'default' | 'detail'
}

const rowPad = (contentInset: 'default' | 'detail') =>
  contentInset === 'detail'
    ? detailPageTrackPad
    : 'px-6 scroll-px-6 sm:px-8 sm:scroll-px-8 lg:px-10 lg:scroll-px-10'

const headingWrap = (contentInset: 'default' | 'detail') =>
  contentInset === 'detail' ? detailPageShell : 'px-6 sm:px-8 lg:px-10'

const MediaRowSkeleton = ({
  variant,
  contentInset = 'default',
}: {
  variant: 'poster' | 'backdrop'
  contentInset?: 'default' | 'detail'
}) => {
  const cardClass =
    variant === 'backdrop' ? 'w-64 shrink-0 sm:w-80' : 'w-36 shrink-0 sm:w-40'
  const aspectClass = variant === 'backdrop' ? 'aspect-video' : 'aspect-[2/3]'

  return (
    <div
      className={cn('flex gap-3 overflow-hidden py-2', rowPad(contentInset))}
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
  contentInset = 'default',
}: MediaRowProps<T>) {
  const listRef = useRef<HTMLUListElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const itemCount = items.length
  const isEmpty = !isLoading && !isError && itemCount === 0
  const skipId = `after-${label}-${title}`.toLowerCase().replace(/\s+/g, '-')

  const updateScrollState = () => {
    const list = listRef.current
    if (!list) return
    const maxScroll = list.scrollWidth - list.clientWidth
    const nextLeft = list.scrollLeft > 1
    const nextRight = maxScroll > 1 && list.scrollLeft < maxScroll - 1
    setCanScrollLeft((prev) => (prev === nextLeft ? prev : nextLeft))
    setCanScrollRight((prev) => (prev === nextRight ? prev : nextRight))
  }

  useEffect(() => {
    if (isLoading || isError || isEmpty) return
    const list = listRef.current
    if (!list) return

    updateScrollState()
    list.addEventListener('scroll', updateScrollState, { passive: true })
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(list)

    return () => {
      list.removeEventListener('scroll', updateScrollState)
      observer.disconnect()
    }
  }, [isLoading, isError, isEmpty, itemCount])

  const scrollByCards = (direction: 1 | -1) => {
    const list = listRef.current
    if (!list) return
    const delta = Math.max(200, Math.floor(list.clientWidth * 0.8))
    list.scrollBy({ left: direction * delta, behavior: 'smooth' })
  }

  const focusItem = (index: number) => {
    if (itemCount === 0) return
    const nextIndex = Math.min(itemCount - 1, Math.max(0, index))
    setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex))
    const item = listRef.current?.querySelector(
      `[data-row-index="${nextIndex}"]`,
    )
    const target =
      item instanceof HTMLElement
        ? (item.querySelector<HTMLElement>('a[href], button, [tabindex]') ??
          item)
        : null
    target?.focus()
    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusItem(activeIndex + 1)
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusItem(activeIndex - 1)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      focusItem(0)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      focusItem(itemCount - 1)
    }
  }

  return (
    <section className={cn('relative z-10 py-8', className)}>
      {showHeading ? (
        <div className={headingWrap(contentInset)}>
          <SectionLabel className="mb-2">{label}</SectionLabel>
          <h2 className="mb-5 text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
        </div>
      ) : null}

      {isLoading ? (
        <MediaRowSkeleton variant={variant} contentInset={contentInset} />
      ) : isError ? (
        <p
          className={cn(
            'm-0 text-sm text-muted-foreground',
            headingWrap(contentInset),
          )}
        >
          {errorMessage}
        </p>
      ) : isEmpty ? (
        <p
          className={cn(
            'm-0 text-sm text-muted-foreground',
            headingWrap(contentInset),
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
                rowPad(contentInset),
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
                    onFocus: () =>
                      setActiveIndex((prev) => (prev === index ? prev : index)),
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
        <div className={headingWrap(contentInset)}>{footer}</div>
      ) : null}
    </section>
  )
}

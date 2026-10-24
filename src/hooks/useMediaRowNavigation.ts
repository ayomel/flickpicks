import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'

type UseMediaRowNavigationOptions = {
  itemCount: number
  enabled: boolean
}

export const useMediaRowNavigation = ({
  itemCount,
  enabled,
}: UseMediaRowNavigationOptions) => {
  const listRef = useRef<HTMLUListElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const list = listRef.current
    if (!list) return

    const maxScroll = list.scrollWidth - list.clientWidth
    const nextLeft = list.scrollLeft > 1
    const nextRight = maxScroll > 1 && list.scrollLeft < maxScroll - 1

    setCanScrollLeft((previous) =>
      previous === nextLeft ? previous : nextLeft,
    )
    setCanScrollRight((previous) =>
      previous === nextRight ? previous : nextRight,
    )
  }, [])

  useEffect(() => {
    if (!enabled) return

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
  }, [enabled, itemCount, updateScrollState])

  const scrollByCards = useCallback((direction: 1 | -1) => {
    const list = listRef.current
    if (!list) return

    const delta = Math.max(200, Math.floor(list.clientWidth * 0.8))
    list.scrollBy({ left: direction * delta, behavior: 'smooth' })
  }, [])

  const focusItem = useCallback(
    (index: number) => {
      if (itemCount === 0) return

      const nextIndex = Math.min(itemCount - 1, Math.max(0, index))
      setActiveIndex((previous) =>
        previous === nextIndex ? previous : nextIndex,
      )

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
    },
    [itemCount],
  )

  const onListKeyDown = useCallback(
    (event: KeyboardEvent<HTMLUListElement>) => {
      const target = event.target
      if (
        event.defaultPrevented ||
        !(target instanceof Node) ||
        !event.currentTarget.contains(target) ||
        (target instanceof HTMLElement &&
          (target.isContentEditable ||
            target.matches('input, textarea, select')))
      ) {
        return
      }

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
    },
    [activeIndex, focusItem, itemCount],
  )

  const onItemFocus = useCallback((index: number) => {
    setActiveIndex((previous) => (previous === index ? previous : index))
  }, [])

  return {
    activeIndex,
    canScrollLeft,
    canScrollRight,
    focusItem,
    listRef,
    onItemFocus,
    onListKeyDown,
    scrollByCards,
  }
}

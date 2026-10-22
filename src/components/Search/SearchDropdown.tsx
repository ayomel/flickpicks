import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export type SearchDropdownPlacement = 'top' | 'bottom' | 'inline'

type SearchDropdownProps = {
  listboxId: string
  isOpen: boolean
  children: ReactNode
  placement?: SearchDropdownPlacement
}

export const SearchDropdown = ({
  listboxId,
  isOpen,
  children,
  placement = 'bottom',
}: SearchDropdownProps) => {
  const reducedMotion = usePrefersReducedMotion()

  if (!isOpen) return null

  return (
    <div
      id={listboxId}
      role="listbox"
      className={cn(
        'w-full overflow-y-auto rounded-lg border border-border bg-card',
        placement === 'inline'
          ? 'static mt-3 flex min-h-0 flex-1 flex-col overscroll-contain'
          : 'absolute z-[60]',
        placement === 'top' &&
          'bottom-[calc(100%+6px)] max-h-[min(20rem,60svh)]',
        placement === 'bottom' && 'top-[calc(100%+6px)] max-h-80',
        !reducedMotion && 'animate-in fade-in duration-150',
      )}
    >
      {children}
    </div>
  )
}

type SearchDropdownMessageProps = {
  children: ReactNode
}

export const SearchDropdownMessage = ({
  children,
}: SearchDropdownMessageProps) => {
  return (
    <p className="m-0 px-3 py-4 text-sm text-muted-foreground">{children}</p>
  )
}

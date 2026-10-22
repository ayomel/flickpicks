import type { KeyboardEvent, RefObject } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  onFocus: () => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  listboxId: string
  isExpanded: boolean
  activeOptionId?: string
  inputRef?: RefObject<HTMLInputElement | null>
  autoFocus?: boolean
}

export const SearchInput = ({
  value,
  onChange,
  onFocus,
  onKeyDown,
  listboxId,
  isExpanded,
  activeOptionId,
  inputRef,
  autoFocus = false,
}: SearchInputProps) => {
  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        ref={inputRef}
        autoFocus={autoFocus}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder="Search movies & TV…"
        autoComplete="off"
        role="combobox"
        aria-label="Search movies and TV"
        aria-expanded={isExpanded}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        className={cn(
          'h-11 w-full rounded-md border border-border bg-input py-2 pr-14 pl-9 text-sm text-foreground',
          'placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow]',
          'focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/15',
        )}
      />
      <kbd
        className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground sm:inline"
        aria-hidden
      >
        ⌘K
      </kbd>
    </div>
  )
}

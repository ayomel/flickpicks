import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { ComponentProps } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import {
  MIN_SEARCH_LENGTH,
  useSearchQuery,
  type SearchMediaResult,
} from '@/hooks/useSearchQuery'
import { getSearchResultKey, getSearchResultPath } from '@/utils/searchResult'
import { SearchDropdown, SearchDropdownMessage } from './SearchDropdown'
import { SearchInput } from './SearchInput'
import { SearchResultRow } from './SearchResultRow'

const LISTBOX_ID = 'movie-search-listbox'

export const MovieSearch = () => {
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const instanceId = useId()

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const debouncedQuery = useDebouncedValue(query, 300)
  const {
    data: results = [],
    isLoading,
    isError,
  } = useSearchQuery(debouncedQuery)

  const trimmedDebounced = debouncedQuery.trim()
  const showDropdown = open && trimmedDebounced.length >= MIN_SEARCH_LENGTH

  const selectedIndex =
    results.length === 0 ? 0 : Math.min(activeIndex, results.length - 1)

  const selectResult = useCallback(
    (item: SearchMediaResult) => {
      navigate(getSearchResultPath(item))
      setQuery('')
      setOpen(false)
      setActiveIndex(0)
    },
    [navigate],
  )

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setActiveIndex(0)
  }

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (!rootRef.current?.contains(target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleInputKeyDown: ComponentProps<typeof SearchInput>['onKeyDown'] = (
    event,
  ) => {
    if (event.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
      return
    }

    if (!showDropdown || results.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = results[selectedIndex]
      if (item) selectResult(item)
    }
  }

  const activeItem = showDropdown ? results[selectedIndex] : undefined
  const activeOptionId = activeItem
    ? `search-option-${instanceId}-${getSearchResultKey(activeItem)}`
    : undefined

  return (
    <div ref={rootRef} className="relative w-full">
      <SearchInput
        inputRef={inputRef}
        value={query}
        onChange={handleQueryChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleInputKeyDown}
        listboxId={LISTBOX_ID}
        isExpanded={showDropdown}
        activeOptionId={activeOptionId}
      />

      <SearchDropdown listboxId={LISTBOX_ID} isOpen={showDropdown}>
        {isLoading ? (
          <SearchDropdownMessage>Searching…</SearchDropdownMessage>
        ) : isError ? (
          <SearchDropdownMessage>
            Couldn&apos;t load results. Try again.
          </SearchDropdownMessage>
        ) : results.length === 0 ? (
          <SearchDropdownMessage>No results found.</SearchDropdownMessage>
        ) : (
          results.map((item, index) => (
            <SearchResultRow
              key={getSearchResultKey(item)}
              item={item}
              optionId={`search-option-${instanceId}-${getSearchResultKey(item)}`}
              isActive={index === selectedIndex}
              onSelect={selectResult}
              onHover={() => setActiveIndex(index)}
            />
          ))
        )}
      </SearchDropdown>
    </div>
  )
}

import { useMovieSearch } from '@/hooks/useMovieSearch'
import { cn } from '@/lib/utils'
import { getSearchResultKey } from '@/utils/searchResult'
import { SearchDropdown, SearchDropdownMessage } from './SearchDropdown'
import { SearchInput } from './SearchInput'
import { SearchResultRow } from './SearchResultRow'

type MovieSearchProps = {
  layout?: 'popover' | 'mobile-panel'
}

export const MovieSearch = ({ layout = 'popover' }: MovieSearchProps) => {
  const {
    activeOptionId,
    handleInputFocus,
    handleInputKeyDown,
    handleQueryChange,
    handleResultHover,
    instanceId,
    inputRef,
    isError,
    isExpanded,
    isLoading,
    listboxId,
    query,
    results,
    rootRef,
    selectedIndex,
    selectResult,
  } = useMovieSearch()

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative w-full',
        layout === 'mobile-panel' && 'flex min-h-0 flex-1 flex-col',
      )}
    >
      <SearchInput
        inputRef={inputRef}
        value={query}
        onChange={handleQueryChange}
        onFocus={handleInputFocus}
        onKeyDown={handleInputKeyDown}
        listboxId={listboxId}
        isExpanded={isExpanded}
        activeOptionId={activeOptionId}
        autoFocus={layout === 'mobile-panel'}
      />

      {!isExpanded && layout === 'mobile-panel' ? (
        <p
          role="status"
          className="m-0 px-1 pt-3 text-sm text-muted-foreground"
        >
          Enter at least two characters to find a movie or show.
        </p>
      ) : null}

      <SearchDropdown
        listboxId={listboxId}
        isOpen={isExpanded}
        placement={layout === 'mobile-panel' ? 'inline' : 'bottom'}
      >
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
              onHover={() => handleResultHover(index)}
            />
          ))
        )}
      </SearchDropdown>
    </div>
  )
}

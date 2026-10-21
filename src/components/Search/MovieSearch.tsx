import { useMovieSearch } from '@/hooks/useMovieSearch'
import { getSearchResultKey } from '@/utils/searchResult'
import { SearchDropdown, SearchDropdownMessage } from './SearchDropdown'
import { SearchInput } from './SearchInput'
import { SearchResultRow } from './SearchResultRow'

export const MovieSearch = () => {
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
    <div ref={rootRef} className="relative w-full">
      <SearchInput
        inputRef={inputRef}
        value={query}
        onChange={handleQueryChange}
        onFocus={handleInputFocus}
        onKeyDown={handleInputKeyDown}
        listboxId={listboxId}
        isExpanded={isExpanded}
        activeOptionId={activeOptionId}
      />

      <SearchDropdown listboxId={listboxId} isOpen={isExpanded}>
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

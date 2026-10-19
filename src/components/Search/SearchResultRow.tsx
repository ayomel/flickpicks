import { Film, Tv } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SearchMediaResult } from '@/types/search'
import { getPosterThumbPath } from '@/utils/getPosterPath'
import {
  getSearchResultTitle,
  getSearchResultYear,
} from '@/utils/searchResult'
import { formatSearchGenreLabels } from '@/utils/tmdbGenres'

type SearchResultRowProps = {
  item: SearchMediaResult
  optionId: string
  isActive: boolean
  onSelect: (item: SearchMediaResult) => void
  onHover: () => void
}

export const SearchResultRow = ({
  item,
  optionId,
  isActive,
  onSelect,
  onHover,
}: SearchResultRowProps) => {
  const title = getSearchResultTitle(item)
  const year = getSearchResultYear(item)
  const genres = formatSearchGenreLabels(item.media_type, item.genre_ids)
  const typeLabel = item.media_type === 'tv' ? 'TV' : 'Movie'
  const meta = [typeLabel, year, genres].filter(Boolean).join(' · ')

  return (
    <button
      type="button"
      id={optionId}
      role="option"
      aria-selected={isActive}
      onMouseEnter={onHover}
      onClick={() => onSelect(item)}
      className={cn(
        'flex w-full items-center gap-3 border-b border-border/60 px-3 py-2.5 text-left transition-colors last:border-b-0',
        isActive ? 'bg-muted' : 'hover:bg-muted/70',
      )}
    >
      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
        {item.poster_path ? (
          <img
            src={getPosterThumbPath(item.poster_path)}
            alt=""
            className="size-full object-cover"
          />
        ) : item.media_type === 'tv' ? (
          <Tv className="size-5 text-muted-foreground" aria-hidden />
        ) : (
          <Film className="size-5 text-muted-foreground" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="m-0 truncate text-sm font-medium text-foreground">
            {title}
          </p>
          {item.media_type === 'tv' ? (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              TV
            </Badge>
          ) : null}
        </div>
        {meta ? (
          <p className="m-0 truncate font-mono text-xs text-muted-foreground">
            {meta}
          </p>
        ) : null}
      </div>
    </button>
  )
}

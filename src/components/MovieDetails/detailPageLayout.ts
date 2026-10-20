/** Aligns with movie detail page sections (hero, body, row headings, PageSection). */
export const detailPageShell = 'mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10'

const detailTrackInset = 'calc((100% - min(100%, 72rem)) / 2)'

const detailTrackPl = (pad: string) => `max(${pad},${detailTrackInset}+${pad})`

/**
 * Left padding for full-bleed horizontal scroll tracks so the first card lines up
 * with `detailPageShell` (uses 100% of the row width, not 100vw).
 */
export const detailPageTrackPad = [
  `pl-[${detailTrackPl('1.5rem')}]`,
  'pr-6',
  `scroll-pl-[${detailTrackPl('1.5rem')}]`,
  `sm:pl-[${detailTrackPl('2rem')}]`,
  'sm:pr-8',
  `sm:scroll-pl-[${detailTrackPl('2rem')}]`,
  `lg:pl-[${detailTrackPl('2.5rem')}]`,
  'lg:pr-10',
  `lg:scroll-pl-[${detailTrackPl('2.5rem')}]`,
].join(' ')

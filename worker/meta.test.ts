import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildMetaTagsHtml,
  buildTvMetaTagsHtml,
  escapeHtml,
  fetchMovieMeta,
  fetchTvMeta,
  injectMovieMeta,
  movieCanonicalUrl,
  moviePageTitle,
  SITE_ORIGIN,
  tvCanonicalUrl,
  tvPageTitle,
} from './meta'

describe('escapeHtml', () => {
  it('escapes characters that break attribute and text context', () => {
    expect(escapeHtml(`A & B <C> "D" 'E'`)).toBe(
      'A &amp; B &lt;C&gt; &quot;D&quot; &#39;E&#39;',
    )
  })
})

describe('movie meta helpers', () => {
  it('builds title and canonical urls from the live origin', () => {
    expect(moviePageTitle('The Matrix')).toBe('The Matrix · FlickPick')
    expect(movieCanonicalUrl(603)).toBe(`${SITE_ORIGIN}/movies/603`)
  })

  it('builds escaped meta tags for crawlers', () => {
    const html = buildMetaTagsHtml({
      id: 603,
      title: 'The Matrix & Co',
      overview: 'A <hacker> joins "rebels".',
      backdrop_path: '/tlm.jpg',
    })

    expect(html).toContain('The Matrix &amp; Co · FlickPick')
    expect(html).toContain('A &lt;hacker&gt; joins &quot;rebels&quot;.')
    expect(html).toContain(`content="${SITE_ORIGIN}/movies/603"`)
    expect(html).toContain('property="og:type" content="video.movie"')
    expect(html).toContain('property="og:image"')
    expect(html).toContain('https://image.tmdb.org/t/p/w780/tlm.jpg')
    expect(html).toContain('name="twitter:card"')
    expect(html).toContain('rel="canonical"')
    expect(html).not.toContain('name="description"')
  })

  it('passes a raw description to setAttribute and relies on rewriter escaping', async () => {
    const setAttribute = vi.fn()
    class CapturingRewriter {
      on(
        selector: string,
        handlers: {
          element: (el: {
            setInnerContent?: (v: string) => void
            setAttribute?: (name: string, value: string) => void
            append?: (html: string, opts: { html: boolean }) => void
          }) => void
        },
      ) {
        if (selector === 'meta[name="description"]') {
          handlers.element({ setAttribute })
        } else {
          handlers.element({
            setInnerContent: () => {},
            append: () => {},
          })
        }
        return this
      }
      transform(response: Response) {
        return response
      }
    }
    vi.stubGlobal('HTMLRewriter', CapturingRewriter)

    const shell = new Response(
      '<!doctype html><html><head><title>FlickPick</title><meta name="description" content="old" /></head><body></body></html>',
      { headers: { 'content-type': 'text/html' } },
    )

    await injectMovieMeta(shell, {
      id: 603,
      title: 'The Matrix',
      overview: 'A <hacker> joins "rebels".',
    })

    expect(setAttribute).toHaveBeenCalledWith(
      'content',
      'A <hacker> joins "rebels".',
    )
    expect(escapeHtml('A <hacker> joins "rebels".')).toBe(
      'A &lt;hacker&gt; joins &quot;rebels&quot;.',
    )

    vi.unstubAllGlobals()
  })
})

describe('tv meta helpers', () => {
  it('builds title and canonical urls for tv shows', () => {
    expect(tvPageTitle('Breaking Bad')).toBe('Breaking Bad · FlickPick')
    expect(tvCanonicalUrl(1396)).toBe(`${SITE_ORIGIN}/tv/1396`)
  })

  it('builds escaped meta tags for tv crawlers', () => {
    const html = buildTvMetaTagsHtml({
      id: 1396,
      name: 'Breaking Bad & Co',
      overview: 'A <teacher> cooks.',
      backdrop_path: '/bb.jpg',
    })

    expect(html).toContain('Breaking Bad &amp; Co · FlickPick')
    expect(html).toContain('A &lt;teacher&gt; cooks.')
    expect(html).toContain(`content="${SITE_ORIGIN}/tv/1396"`)
    expect(html).toContain('property="og:type" content="video.tv_show"')
    expect(html).toContain('https://image.tmdb.org/t/p/w780/bb.jpg')
  })
})

describe('fetchMovieMeta', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns not_found when the API responds 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('missing', { status: 404 })),
    )

    await expect(fetchMovieMeta('999999')).resolves.toBe('not_found')
  })

  it('returns null when the API responds 5xx', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('error', { status: 500 })),
    )

    await expect(fetchMovieMeta('603')).resolves.toBeNull()
  })
})

describe('fetchTvMeta', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns not_found when the API responds 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('missing', { status: 404 })),
    )

    await expect(fetchTvMeta('999999')).resolves.toBe('not_found')
  })

  it('returns null when the API responds 5xx', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('error', { status: 500 })),
    )

    await expect(fetchTvMeta('1396')).resolves.toBeNull()
  })
})

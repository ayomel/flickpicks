import { describe, expect, it } from 'vitest'
import { isAppShellPath, isStaticAssetPath } from './routes'

describe('isAppShellPath', () => {
  it('allows home and numeric movie and tv routes', () => {
    expect(isAppShellPath('/')).toBe(true)
    expect(isAppShellPath('/movies/550')).toBe(true)
    expect(isAppShellPath('/movies/0')).toBe(true)
    expect(isAppShellPath('/tv/1396')).toBe(true)
    expect(isAppShellPath('/tv/0')).toBe(true)
  })

  it('rejects unknown or non-numeric movie paths', () => {
    expect(isAppShellPath('/nope')).toBe(false)
    expect(isAppShellPath('/movies')).toBe(false)
    expect(isAppShellPath('/movies/')).toBe(false)
    expect(isAppShellPath('/movies/abc')).toBe(false)
    expect(isAppShellPath('/movies/55a')).toBe(false)
    expect(isAppShellPath('/movies/550/extra')).toBe(false)
    expect(isAppShellPath('/tv')).toBe(false)
    expect(isAppShellPath('/tv/abc')).toBe(false)
    expect(isAppShellPath('/tv/1396/extra')).toBe(false)
  })
})

describe('isStaticAssetPath', () => {
  it('detects extensioned assets and skips html', () => {
    expect(isStaticAssetPath('/assets/index-abc.js')).toBe(true)
    expect(isStaticAssetPath('/favicon.svg')).toBe(true)
    expect(isStaticAssetPath('/index.html')).toBe(false)
    expect(isStaticAssetPath('/movies/550')).toBe(false)
  })
})

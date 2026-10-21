import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export const useMobileTabBar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const searchPanelId = useId()
  const shellRef = useRef<HTMLDivElement>(null)
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const locationKey = `${location.pathname}${location.hash}`
  const [indexedLocationKey, setIndexedLocationKey] = useState(locationKey)
  const [searchOpen, setSearchOpen] = useState(false)

  if (locationKey !== indexedLocationKey) {
    setIndexedLocationKey(locationKey)
    if (searchOpen) setSearchOpen(false)
  }

  const onHome = location.pathname === '/'
  const onWatchlist = onHome && location.hash === '#watchlist'
  const homeActive = onHome && !onWatchlist && !searchOpen
  const watchlistActive = onWatchlist && !searchOpen

  const closeSearch = useCallback((restoreFocus = false) => {
    setSearchOpen(false)
    if (restoreFocus) {
      queueMicrotask(() => searchButtonRef.current?.focus())
    }
  }, [])

  useEffect(() => {
    if (!searchOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeSearch(true)
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (shellRef.current?.contains(target)) return
      closeSearch()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [closeSearch, searchOpen])

  const goHome = () => {
    setSearchOpen(false)
    if (!onHome) {
      navigate('/')
      return
    }
    if (location.hash) {
      navigate('/')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goWatchlist = () => {
    setSearchOpen(false)
    if (onWatchlist) {
      document.getElementById('watchlist')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      return
    }
    navigate('/#watchlist')
  }

  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) {
        queueMicrotask(() => searchButtonRef.current?.focus())
      }
      return !open
    })
  }

  return {
    homeActive,
    goHome,
    goWatchlist,
    searchButtonRef,
    searchOpen,
    searchPanelId,
    shellRef,
    toggleSearch,
    watchlistActive,
  }
}

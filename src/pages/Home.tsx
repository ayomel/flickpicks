import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import FeatureMovieHero from '../components/FeatureMovieHero/FeatureMovieHero'
import { ComingSoonRow } from '@/components/Row/ComingSoonRow'
import { TrendingRows } from '@/components/Row/TrendingRows'
import { WatchlistRow } from '@/components/Watchlist/WatchlistRow'
import { Seo } from '@/components/Seo'
import { useTrendingQuery } from '@/hooks/useTrendingQuery'
import { useUpcomingQuery } from '@/hooks/useUpcomingQuery'
import { useWatchlistTitles } from '@/hooks/useWatchlistQuery'
import { absoluteUrl } from '@/utils/seo'

export const Home = () => {
  const location = useLocation()
  const trendingQuery = useTrendingQuery()
  const upcomingQuery = useUpcomingQuery()
  const { isLoadingTitles, titles } = useWatchlistTitles()

  const rowsSettled =
    !trendingQuery.isLoading && !upcomingQuery.isLoading && !isLoadingTitles

  useEffect(() => {
    if (location.hash !== '#watchlist') return
    if (!rowsSettled) return

    const frame = window.requestAnimationFrame(() => {
      document.getElementById('watchlist')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [location.hash, rowsSettled, titles.length])

  return (
    <div className="min-h-svh bg-background">
      <Seo
        title="FlickPick"
        description="Browse trending movies, coming soon titles, and a shared watchlist."
        canonical={absoluteUrl('/')}
        ogType="website"
        shareable
      />
      <FeatureMovieHero />
      <div className="relative z-10 pb-8 sm:pb-16">
        <TrendingRows />
        <ComingSoonRow />
        <div id="watchlist" className="scroll-mt-20">
          <WatchlistRow />
        </div>
      </div>
    </div>
  )
}

export default Home

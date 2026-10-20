import { useState } from 'react'
import { Play } from 'lucide-react'
import { MediaRow, type MediaRowItemOptions } from '@/components/Row/MediaRow'
import type { MovieDetails, MovieVideo } from '@/types/movieDetails'
import { getYoutubeThumbUrl, getYoutubeVideos } from '@/utils/formatMovie'
import { cn } from '@/lib/utils'
import { VideoModal } from './VideoModal'

type VideosRowProps = {
  movie: MovieDetails
  contentInset?: 'default' | 'detail'
}

type VideoCardProps = {
  video: MovieVideo
  tabIndex: number
  onFocus: MediaRowItemOptions['onFocus']
  onSelect: (video: MovieVideo) => void
}

const videoActionLabel = (video: MovieVideo) => {
  const parts = [`Play ${video.name}`, video.type]
  if (video.official) parts.push('Official')
  return parts.join(', ')
}

const VideoCard = ({ video, tabIndex, onFocus, onSelect }: VideoCardProps) => {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <button
      type="button"
      tabIndex={tabIndex}
      onFocus={onFocus}
      onClick={() => onSelect(video)}
      aria-label={videoActionLabel(video)}
      className={cn(
        'group/card relative block w-64 shrink-0 snap-start overflow-hidden rounded-md border border-border bg-card text-left sm:w-80',
        'outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {!imageFailed ? (
          <img
            src={getYoutubeThumbUrl(video.key)}
            alt=""
            width={480}
            height={270}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className={cn(
              'size-full object-cover transition-transform duration-200',
              '[@media(hover:hover)]:group-hover/card:scale-105',
            )}
          />
        ) : null}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/25">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            <Play className="size-5 fill-current" aria-hidden />
          </span>
        </span>
      </div>
      <div className="px-3 py-2">
        <p className="m-0 truncate text-sm font-medium text-foreground">
          {video.name}
        </p>
        <p className="m-0 font-mono text-xs text-muted-foreground">
          {video.type}
          {video.official ? ' · Official' : ''}
        </p>
      </div>
    </button>
  )
}

export const VideosRow = ({
  movie,
  contentInset = 'default',
}: VideosRowProps) => {
  const videos = getYoutubeVideos(movie)
  const [activeVideo, setActiveVideo] = useState<MovieVideo | null>(null)

  if (videos.length === 0) return null

  return (
    <>
      <MediaRow
        label="Videos"
        title="Trailers & clips"
        variant="backdrop"
        contentInset={contentInset}
        items={videos}
        getKey={(video) => video.id}
        renderItem={(video, { tabIndex, onFocus }) => (
          <VideoCard
            video={video}
            tabIndex={tabIndex}
            onFocus={onFocus}
            onSelect={setActiveVideo}
          />
        )}
      />
      <VideoModal
        videoId={activeVideo?.key ?? null}
        title={activeVideo?.name ?? `${movie.title} video`}
        isOpen={Boolean(activeVideo)}
        onOpenChange={(open) => {
          if (!open) setActiveVideo(null)
        }}
      />
    </>
  )
}

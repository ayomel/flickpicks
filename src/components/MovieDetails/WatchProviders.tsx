import { useState } from 'react'
import { PageSection } from '@/components/ui/page-section'
import type { StreamingProviders, WatchProvider } from '@/types/movieDetails'
import { getProviderLogoUrl } from '@/utils/formatMovie'
import { providerInitials, uniqueProviders } from '@/utils/watchProviders'
import { cn } from '@/lib/utils'

type WatchProvidersProps = {
  providers?: StreamingProviders
  contentInset?: 'default' | 'detail'
}

const PROVIDER_LOGO_SIZE = 92

const ProviderTile = ({
  provider,
  failed,
  onImageError,
}: {
  provider: WatchProvider
  failed: boolean
  onImageError: () => void
}) => {
  return (
    <div
      className="flex size-11 items-center justify-center overflow-hidden rounded-md border border-border bg-card p-1.5 transition-colors hover:bg-muted"
      title={provider.provider_name}
    >
      {failed ? (
        <span
          role="img"
          aria-label={provider.provider_name}
          className="font-mono text-xs font-semibold tracking-wide text-muted-foreground uppercase"
        >
          {providerInitials(provider.provider_name)}
        </span>
      ) : (
        <img
          src={getProviderLogoUrl(provider.logo_path)}
          alt={provider.provider_name}
          width={PROVIDER_LOGO_SIZE}
          height={PROVIDER_LOGO_SIZE}
          loading="lazy"
          decoding="async"
          onError={onImageError}
          className="max-h-full max-w-full object-contain"
        />
      )}
    </div>
  )
}

const ProviderGroup = ({
  label,
  items,
}: {
  label: string
  items: WatchProvider[]
}) => {
  const providers = uniqueProviders(items)
  const [failedIds, setFailedIds] = useState(() => new Set<number>())

  if (!providers.length) return null

  return (
    <div className="flex flex-col gap-3">
      <h3 className="m-0 font-mono text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </h3>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {providers.map((provider) => (
          <li key={`${label}-${provider.provider_id}`}>
            <ProviderTile
              provider={provider}
              failed={failedIds.has(provider.provider_id)}
              onImageError={() => {
                setFailedIds((prev) => {
                  if (prev.has(provider.provider_id)) return prev
                  const next = new Set(prev)
                  next.add(provider.provider_id)
                  return next
                })
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

const Attribution = ({
  link,
  className,
}: {
  link?: string
  className?: string
}) => {
  return (
    <p className={cn('m-0 font-mono text-xs text-muted-foreground', className)}>
      US availability via JustWatch
      {' · '}
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:text-foreground hover:underline"
        >
          TMDB
        </a>
      ) : (
        'TMDB'
      )}
      .
    </p>
  )
}

export const WatchProviders = ({
  providers,
  contentInset = 'default',
}: WatchProvidersProps) => {
  const stream = providers?.flatrate ?? []
  const rent = providers?.rent ?? []
  const buy = providers?.buy ?? []
  const hasAny =
    uniqueProviders(stream).length > 0 ||
    uniqueProviders(rent).length > 0 ||
    uniqueProviders(buy).length > 0

  if (!hasAny) {
    return (
      <PageSection contentInset={contentInset}>
        <h2 className="mb-3 font-mono text-xs font-semibold tracking-[0.08em] text-brand uppercase">
          Where to watch
        </h2>
        <div className="rounded-lg border border-border bg-card px-4 py-5">
          <p className="m-0 text-sm text-foreground">
            No streaming options listed yet.
          </p>
          <Attribution link={providers?.link} className="mt-3" />
        </div>
      </PageSection>
    )
  }

  return (
    <PageSection contentInset={contentInset}>
      <h2 className="mb-6 font-mono text-xs font-semibold tracking-[0.08em] text-brand uppercase">
        Where to watch
      </h2>
      <div className="flex flex-col gap-8 sm:flex-row sm:flex-wrap sm:gap-12">
        <ProviderGroup label="Stream" items={stream} />
        <ProviderGroup label="Rent" items={rent} />
        <ProviderGroup label="Buy" items={buy} />
      </div>
      <Attribution link={providers?.link} className="mt-6" />
    </PageSection>
  )
}

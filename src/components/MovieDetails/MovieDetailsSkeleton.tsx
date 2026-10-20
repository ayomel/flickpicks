import { Skeleton } from '@/components/ui/skeleton'
import { detailPageShell } from './detailPageLayout'

export const MovieDetailsSkeleton = () => {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div
        className={`relative min-h-[min(72svh,600px)] ${detailPageShell} flex flex-col justify-between pb-6 pt-16 sm:pb-8 sm:pt-20`}
      >
        <Skeleton className="absolute inset-0 rounded-none bg-muted" />
        <div className="relative z-10">
          <Skeleton className="h-4 w-32 bg-muted-foreground/20" />
        </div>
        <div className="relative z-10 space-y-3">
          <Skeleton className="h-12 w-full max-w-xl bg-muted-foreground/20" />
          <Skeleton className="h-16 w-full max-w-2xl bg-muted-foreground/20" />
          <Skeleton className="h-10 w-48 bg-muted-foreground/20" />
        </div>
      </div>
      <div className={`${detailPageShell} py-8 lg:py-10`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <Skeleton className="hidden h-24 max-w-2xl bg-muted-foreground/20 lg:block" />
          <Skeleton className="aspect-[2/3] w-full max-w-[110px] bg-muted-foreground/20 lg:max-w-none" />
        </div>
      </div>
    </div>
  )
}

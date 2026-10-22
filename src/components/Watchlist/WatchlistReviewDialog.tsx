import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { WatchlistEntryRead } from '@/types/watchlist'
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components'
import { WatchlistReviewEditor } from './WatchlistReviewEditor'

type WatchlistReviewDialogProps = {
  entry: WatchlistEntryRead
  title: string
}

export const WatchlistReviewDialog = ({
  entry,
  title,
}: WatchlistReviewDialogProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="mt-2 w-full"
        onPress={() => setIsOpen(true)}
      >
        {entry.rating !== null ? (
          <>
            <Star aria-hidden className="size-3.5 fill-brand text-brand" />
            {entry.rating}/10 · Edit review
          </>
        ) : entry.review.trim() ? (
          'Edit review'
        ) : entry.status === 'watched' ? (
          'Add review'
        ) : (
          'Mark watched · review'
        )}
      </Button>

      <ModalOverlay
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        isDismissable
        className={cn(
          'fixed inset-0 z-[80] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm',
          'entering:animate-in entering:fade-in entering:duration-150',
          'exiting:animate-out exiting:fade-out exiting:duration-100',
        )}
      >
        <Modal className="w-full max-w-lg outline-none">
          <Dialog
            aria-label={`Your review for ${title}`}
            className="outline-none"
          >
            {({ close }) => (
              <div className="max-h-[min(90svh,44rem)] overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-lg sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <Heading slot="title" className="text-lg font-semibold">
                      Your review
                    </Heading>
                    <p className="m-0 mt-1 text-sm text-muted-foreground">
                      {title}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Close review"
                    onPress={close}
                  >
                    <X />
                  </Button>
                </div>
                <WatchlistReviewEditor
                  key={entry.id}
                  entry={entry}
                  title={title}
                  onClose={close}
                />
              </div>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  )
}

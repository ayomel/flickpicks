export const HeroOverlay = () => {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-x-0 top-0 h-44 bg-linear-to-b from-background via-background/80 to-transparent sm:h-56" />
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-linear-to-t from-background via-background/90 to-transparent sm:h-[58%]" />
      <div className="absolute inset-y-0 left-0 w-[60%] bg-linear-to-r from-background/95 via-background/70 to-transparent" />
    </div>
  )
}

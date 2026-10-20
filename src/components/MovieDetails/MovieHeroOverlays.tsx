export const MovieHeroOverlays = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      <div
        className="absolute inset-0 bg-linear-to-t from-background from-15% via-background/65 via-45% to-transparent to-72% lg:hidden"
        aria-hidden
      />

      <div
        className="absolute inset-y-0 left-0 hidden w-full lg:block"
        style={{
          background: `linear-gradient(to right,
            var(--background) 0%,
            var(--background) 35%,
            color-mix(in srgb, var(--background) 72%, transparent) 52%,
            color-mix(in srgb, var(--background) 28%, transparent) 62%,
            transparent 68%)`,
        }}
        aria-hidden
      />

      <div
        className="absolute inset-x-0 bottom-0 h-[32%] bg-linear-to-t from-background via-background/45 to-transparent lg:h-[24%]"
        aria-hidden
      />
    </div>
  )
}

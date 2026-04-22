/**
 * Premium accents on the rental hero — desktop only, confined to the left column and
 * lower band so the right side of the photograph stays clear.
 */
export function GeRentalPremiumHeroOverlay() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[6] hidden overflow-hidden md:block">
      <div className="absolute inset-x-0 bottom-0 h-[min(48%,380px)] bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-[min(55%,520px)] bg-gradient-to-r from-gs-gold/[0.07] via-gs-gold/[0.02] to-transparent mix-blend-soft-light" />
      <div className="absolute inset-0 shadow-[inset_48px_0_90px_-12px_rgba(6,59,42,0.42),inset_0_-36px_100px_-18px_rgba(0,0,0,0.32)]" />
      <div
        className="absolute top-0 bottom-0 left-0 w-[min(70%,640px)] opacity-[0.11] mix-blend-overlay contrast-[1.12] [mask-image:linear-gradient(90deg,black_0%,black_55%,transparent_92%)]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)' opacity='0.4'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  )
}

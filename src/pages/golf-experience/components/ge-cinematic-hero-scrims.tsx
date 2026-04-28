export type GeCinematicHeroScrimCoverage = 'full' | 'left'

interface GeCinematicHeroScrimsProps {
  /**
   * `full` — uniform veil + gradients (transport / default).
   * `left` — readability only on the leading side; right side of the photo stays clear.
   */
  readonly coverage?: GeCinematicHeroScrimCoverage
}

/**
 * Desktop-only scrims for transport-style heroes.
 * `full`: uniform veil across the frame plus directional emphasis.
 * `left`: left-weighted + lower falloff only so the hero photograph stays visible on the right.
 */
export function GeCinematicHeroScrims({ coverage = 'full' }: GeCinematicHeroScrimsProps = {}) {
  if (coverage === 'left') {
    return (
      <>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[5] hidden w-[min(100%,58%)] bg-gradient-to-r from-gs-dark/78 via-gs-dark/28 to-transparent md:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] hidden h-[min(52%,420px)] bg-gradient-to-t from-gs-dark/50 via-gs-dark/12 to-transparent md:block"
        />
      </>
    )
  }

  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] hidden bg-gs-dark/42 md:block" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] hidden bg-gradient-to-r from-gs-dark/52 via-gs-dark/24 to-gs-dark/30 md:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] hidden bg-gradient-to-t from-gs-dark/58 via-gs-dark/12 to-gs-dark/38 md:block"
      />
    </>
  )
}

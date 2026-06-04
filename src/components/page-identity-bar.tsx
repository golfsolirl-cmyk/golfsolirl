import type { ReactNode } from 'react'
import { GsolGoldCornerAccents } from './gsol-gold-corner-accents'
import { GeGoldDividerLineAbsoluteTop } from './ge-gold-divider-line'
import { cx } from '../lib/utils'

type PageIdentityTone = 'forest' | 'ge'

interface PageIdentityBarProps {
  readonly label: string
  readonly eyebrow?: string
  readonly description?: string
  readonly offsetHeader?: boolean
  readonly compact?: boolean
  /**
   * `ge` — sits on a soft cream cradle, plaque keeps full forest depth.
   * `forest` — sits on a near-white surface, slightly higher contrast.
   *
   * Visually similar in the new "engraved brass nameplate" design — the
   * tone prop is preserved for API compatibility with all call sites.
   */
  readonly tone?: PageIdentityTone
  readonly rightSlot?: ReactNode
  readonly className?: string
}

const headerOffsetClassName = 'pt-[var(--ge-fixed-header-h)]'

/**
 * Page identity nameplate — the slim "Currently viewing" marker that sits
 * just above the page hero on every public page.
 *
 * Replaces the previous full-width gold band + glass pill with a single
 * engraved brass nameplate flanked by chrome rules. The design draws from
 * Mediterranean hotel / golf-club signage:
 *
 *   ─── ✦ ─── ┃ TRANSPORT SERVICE ┃ ─── ✦ ───
 *
 * Rules:
 *  - No / glass anywhere.
 *  - Forest gradient plaque with hairline gold rim and chrome ring.
 *  - Cream-gold uppercase tracked label (with subtle gradient on lg+).
 *  - Two thin chrome-gold hairlines extending out either side of the
 *    plaque — feels engraved into the page rather than slabbed on top.
 *  - Optional eyebrow ("Currently viewing") and supporting description
 *    sit centred above and below the plaque so structure reads even on
 *    pages with minimal hero copy.
 *  - Same prop API as before — drop-in replacement on every call site.
 */
export function PageIdentityBar({
  label,
  eyebrow = 'Currently viewing',
  description,
  offsetHeader = false,
  compact = false,
  tone = 'forest',
  rightSlot,
  className
}: PageIdentityBarProps) {
  const surface =
    tone === 'ge'
      ? 'bg-[linear-gradient(180deg,#FAF8F4_0%,#FFFFFF_100%)]'
      : 'bg-[linear-gradient(180deg,#FFFFFF_0%,#F8F4EB_100%)]'

  return (
    <section
      aria-label={`${label} page nameplate`}
      className={cx(
        /** z-20: stay below cinematic heroes (z-[38]) and fixed nav (z-40). */
        'page-nameplate relative z-20 overflow-hidden',
        surface,
        offsetHeader && headerOffsetClassName,
        className
      )}
    >
      <GsolGoldCornerAccents preset="section" celticCorners={['tl', 'br']} arcCorners={['tl', 'br']} />
      {/* Top + bottom chrome-gold hairlines anchor the band so it never
          feels like a floating slab. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(217,190,122,0.35) 22%, rgba(19,96,71,0.55) 50%, rgba(217,190,122,0.35) 78%, transparent 100%)'
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(19,96,71,0.4) 25%, rgba(217,190,122,0.45) 50%, rgba(19,96,71,0.4) 75%, transparent 100%)'
        }}
      />

      <div className="relative z-[1] mx-auto max-w-[1180px] px-4 sm:px-6 md:px-8">
        <div
          className={cx(
            'relative flex flex-col items-center gap-3 py-4 md:flex-row md:items-center md:justify-center md:gap-5 md:py-5',
            compact && 'py-3 md:py-3.5'
          )}
        >
          {/* Left chrome-rule wing — fades into the plaque */}
          <span
            aria-hidden="true"
            className="hidden h-px flex-1 md:block"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(19,96,71,0.18) 30%, rgba(217,190,122,0.55) 100%)'
            }}
          />

          {/* —— The plaque —— */}
          <div className="relative flex max-w-full items-stretch">
            {/* Plaque body */}
            <div
              className={cx(
                'relative inline-flex min-w-0 flex-col items-center rounded-[1.25rem] border border-[#d9be7a]/55 px-5 py-2.5 text-center shadow-[0_14px_30px_rgba(6,59,42,0.32),0_0_22px_rgba(217,190,122,0.18),inset_0_1px_0_rgba(255,255,255,0.16)] ring-1 ring-white/8 sm:px-7 sm:py-3',
                compact && 'px-4 py-2 sm:px-6 sm:py-2.5'
              )}
              style={{
                background:
                  'linear-gradient(135deg, #0d3a2a 0%, #0a2d20 50%, #08231a 100%)'
              }}
            >
              {/* Inner gold hairline along the top edge — completes the
                  engraved feel without looking glassy. */}
              <GeGoldDividerLineAbsoluteTop />
              {/* Soft inner glow */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-80"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 0%, rgba(244,223,166,0.14), transparent 55%)'
                }}
              />

              {eyebrow ? (
                <span
                  className={cx(
                    'page-nameplate-eyebrow relative font-ge text-[0.6rem] font-extrabold uppercase tracking-[0.32em] sm:text-[0.64rem]',
                    compact && 'text-[0.58rem] sm:text-[0.6rem]'
                  )}
                  data-keep-color
                  style={{ color: '#fbe8b5', letterSpacing: '0.32em' }}
                >
                  <span
                    aria-hidden="true"
                    className="mr-2 inline-block h-1 w-1 rounded-full align-middle"
                    style={{
                      backgroundColor: '#f4dfa6',
                      boxShadow: '0 0 8px rgba(244,223,166,0.65)'
                    }}
                  />
                  {eyebrow}
                </span>
              ) : null}

              <p
                className={cx(
                  'page-nameplate-label relative mt-1 max-w-[42ch] truncate font-ge text-[0.94rem] font-extrabold uppercase leading-tight tracking-[0.16em] sm:text-[1.05rem] md:text-[1.1rem]',
                  compact && 'text-[0.86rem] sm:text-[0.94rem] md:text-[1rem]'
                )}
                data-keep-color
                style={{ color: '#ffffff' }}
              >
                {label}
              </p>
            </div>

            {/* Side ornaments — tiny gold caps on the plaque shoulders */}
            <span
              aria-hidden="true"
              className="absolute left-[-9px] top-1/2 hidden -translate-y-1/2 sm:block"
            >
              <span
                className="block h-2 w-2 rotate-45 border border-[#d9be7a]/65"
                style={{
                  background:
                    'linear-gradient(135deg, #fff5cf 0%, #f4dfa6 50%, #d9be7a 100%)',
                  boxShadow: '0 0 10px rgba(244,223,166,0.55)'
                }}
              />
            </span>
            <span
              aria-hidden="true"
              className="absolute right-[-9px] top-1/2 hidden -translate-y-1/2 sm:block"
            >
              <span
                className="block h-2 w-2 rotate-45 border border-[#d9be7a]/65"
                style={{
                  background:
                    'linear-gradient(135deg, #fff5cf 0%, #f4dfa6 50%, #d9be7a 100%)',
                  boxShadow: '0 0 10px rgba(244,223,166,0.55)'
                }}
              />
            </span>
          </div>

          {/* Right chrome-rule wing */}
          <span
            aria-hidden="true"
            className="hidden h-px flex-1 md:block"
            style={{
              background:
                'linear-gradient(90deg, rgba(217,190,122,0.55) 0%, rgba(19,96,71,0.18) 70%, transparent 100%)'
            }}
          />

          {rightSlot ? (
            <div className="shrink-0 md:ml-2">{rightSlot}</div>
          ) : null}
        </div>

        {description ? (
          <p
            className={cx(
              'page-nameplate-description -mt-1 mb-3 max-w-3xl px-2 text-center font-ge text-[0.86rem] font-medium leading-snug text-gs-dark/72 sm:text-[0.92rem] md:mx-auto md:mb-4',
              compact && 'mb-2.5 text-[0.82rem] sm:text-[0.88rem] md:mb-3'
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
    </section>
  )
}

import type { ReactNode } from 'react'
import { cx } from '../../lib/utils'
import { GeFooter } from '../../pages/golf-experience/sections/ge-footer'
import { GeNavbar } from '../../pages/golf-experience/sections/ge-navbar'
import { PageIdentityBar } from '../page-identity-bar'

/**
 * Premium Page Shell — the standard navbar + identity bar + footer wrapper
 * used by every public page. Keeps page-level wiring (focus skip link,
 * `ge-page` token activation, navbar, footer) in one place so every page
 * inherits the same chrome.
 *
 * Pages render their own hero + sections as `children`.
 */

interface PremiumPageShellProps {
  readonly children: ReactNode
  /** Identity bar copy — shown below the hero on most public pages. */
  readonly identityLabel: string
  readonly identityDescription: string
  /** Hide the identity bar entirely. */
  readonly hideIdentityBar?: boolean
  /** Hide the navbar (rare — used on cinematic/standalone screens). */
  readonly hideNavbar?: boolean
  /** Hide the footer (rare). */
  readonly hideFooter?: boolean
  readonly mainClassName?: string
}

export function PremiumPageShell({
  children,
  identityLabel,
  identityDescription,
  hideIdentityBar = false,
  hideNavbar = false,
  hideFooter = false,
  mainClassName
}: PremiumPageShellProps) {
  return (
    <div className="ge-page flex min-h-screen flex-col overflow-x-hidden bg-white font-ge text-gs-dark">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-brand-700 focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-white"
      >
        Skip to content
      </a>

      {!hideNavbar ? <GeNavbar /> : null}

      <div id="main" className={cx('relative flex flex-1 flex-col', mainClassName)}>
        {children}
      </div>

      {!hideIdentityBar ? (
        <PageIdentityBar
          compact
          description={identityDescription}
          label={identityLabel}
          offsetHeader={false}
          tone="ge"
        />
      ) : null}

      {!hideFooter ? <GeFooter /> : null}
    </div>
  )
}

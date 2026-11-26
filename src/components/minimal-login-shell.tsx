import type { ReactNode } from 'react'
import { BrandLogoPicture } from './brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_INTRINSIC } from '../lib/brand-logo-assets'
import { createWhatsAppLink } from '../lib/whatsapp'

type MinimalLoginShellProps = {
  readonly title: string
  /** Optional single helper line under the heading. */
  readonly helper?: string
  readonly children: ReactNode
  readonly whatsappMessage?: string
}

/**
 * Clean centred login card — logo, short heading, optional helper, fields, primary action, WhatsApp help.
 * No hero photos, marketing panels, or dark-on-dark text.
 */
export function MinimalLoginShell({
  title,
  helper,
  children,
  whatsappMessage = 'Hi Golf Sol Ireland — I need help signing in to my portal.'
}: MinimalLoginShellProps) {
  const whatsappHref = createWhatsAppLink(whatsappMessage)

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#f4f7f5] px-4 py-10 sm:px-6 sm:py-14">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="rounded-3xl border border-forest-200/80 bg-white p-6 shadow-sm sm:p-8">
          <a className="inline-flex" href="/" aria-label="Golf Sol Ireland home">
            <BrandLogoPicture
              alt="Golf Sol Ireland"
              className="h-12 w-auto object-contain object-left"
              height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
              ignoreTestVariant
              width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
            />
          </a>
          <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-forest-950">{title}</h1>
          {helper ? <p className="mt-2 font-ge text-base leading-7 text-forest-700">{helper}</p> : null}
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-center font-ge text-sm text-forest-600">
            Need help?{' '}
            <a
              className="font-semibold text-forest-900 underline underline-offset-2 hover:text-gs-green"
              href={whatsappHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              WhatsApp us
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}

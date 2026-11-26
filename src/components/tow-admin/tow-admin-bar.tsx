import { BrandLogoPicture } from '../brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_HEADER_SIZES, GOLFSOL_BRAND_LOGO_INTRINSIC } from '../../lib/brand-logo-assets'
import { BRAND_KIT_ADMIN_PATH } from '../../lib/brand-kit-catalog'
import { cx } from '../../lib/utils'

export type TowAdminTab = 'enquiries' | 'customers' | 'signature' | 'offer' | 'emails' | 'brand'

const TABS: { id: TowAdminTab; label: string; href: string }[] = [
  { id: 'enquiries', label: 'Enquiries', href: '/admin' },
  { id: 'customers', label: 'Customers', href: '/admin/customers' },
  { id: 'brand', label: 'Brand Kit', href: BRAND_KIT_ADMIN_PATH },
  { id: 'signature', label: 'Signature', href: '/admin/signature' },
  { id: 'offer', label: 'Offer', href: '/admin/offer' },
  { id: 'emails', label: 'Emails', href: '/admin/emails' }
]

type Props = { readonly active: TowAdminTab }

/** TOW-style sticky admin top nav — Golf Sol crest + forest active pill. */
export function TowAdminBar({ active }: Props) {
  const tabClass = (id: TowAdminTab) =>
    cx(
      'shrink-0 rounded-lg px-3 py-2 font-ge text-sm font-semibold transition whitespace-nowrap sm:px-3.5 sm:py-2.5',
      active === id ? 'bg-gs-dark text-white' : 'text-slate-600 hover:bg-slate-100'
    )

  const signOut = async () => {
    await fetch('/api/admin-logout', { method: 'POST', credentials: 'include' }).catch(() => undefined)
    window.location.href = '/admin/login'
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3.5 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-3 sm:gap-5">
          <a
            href="/admin"
            className="flex min-w-0 shrink-0 items-center gap-3 font-ge font-bold text-gs-dark sm:gap-4"
            aria-label="Golf Sol Ireland admin home"
          >
            {/*
              BrandLogoPicture wraps <picture>; size the picture box explicitly so the crest
              cannot be flex-squashed and keeps a 1:1 aspect with object-contain.
            */}
            <span
              className={cx(
                'relative block h-14 w-14 shrink-0 overflow-visible sm:h-16 sm:w-16',
                '[&_picture]:block [&_picture]:h-full [&_picture]:w-full [&_picture]:max-w-none',
                '[&_img]:!h-full [&_img]:!w-full [&_img]:max-w-none [&_img]:object-contain [&_img]:object-center'
              )}
            >
              <BrandLogoPicture
                alt="GolfSol Ireland"
                decoding="async"
                height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
                ignoreTestVariant
                sizes={GOLFSOL_BRAND_LOGO_HEADER_SIZES}
                width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
              />
            </span>
            <span className="hidden border-l border-slate-200 pl-3 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-slate-500 sm:inline sm:pl-4">
              Admin
            </span>
          </a>

          <nav className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2" aria-label="Admin utilities">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg px-3 py-2.5 font-ge text-sm text-slate-600 hover:bg-slate-100 md:inline"
            >
              View site ↗
            </a>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-lg border border-slate-300 px-3.5 py-2.5 font-ge text-sm font-semibold text-gs-dark hover:bg-slate-100"
            >
              Sign out
            </button>
          </nav>
        </div>

        <nav
          className="-mx-4 flex items-center gap-1 overflow-x-auto overscroll-x-contain px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-0 sm:gap-1.5 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
          aria-label="Admin sections"
        >
          {TABS.map((t) => (
            <a key={t.id} href={t.href} className={tabClass(t.id)}>
              {t.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

export function TowAdminShell({
  active,
  children
}: {
  readonly active: TowAdminTab
  readonly children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <TowAdminBar active={active} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}

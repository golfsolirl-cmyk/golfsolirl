import { BrandLogoPicture } from '../brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_INTRINSIC } from '../../lib/brand-logo-assets'
import { BRAND_KIT_ADMIN_PATH } from '../../lib/brand-kit-catalog'
import { cx } from '../../lib/utils'

export type TowAdminTab = 'enquiries' | 'customers' | 'signature' | 'offer' | 'emails'

const TABS: { id: TowAdminTab; label: string; href: string }[] = [
  { id: 'enquiries', label: 'Enquiries', href: '/admin' },
  { id: 'customers', label: 'Customers', href: '/admin/customers' },
  { id: 'signature', label: 'Signature', href: '/admin/signature' },
  { id: 'offer', label: 'Offer', href: '/admin/offer' },
  { id: 'emails', label: 'Emails', href: '/admin/emails' }
]

type Props = { readonly active: TowAdminTab }

/** TOW-style sticky admin top nav — Golf Sol crest + forest active pill. */
export function TowAdminBar({ active }: Props) {
  const tabClass = (id: TowAdminTab) =>
    cx(
      'rounded-lg px-3 py-2 font-ge text-sm font-semibold transition',
      active === id ? 'bg-gs-dark text-white' : 'text-slate-600 hover:bg-slate-100'
    )

  const signOut = async () => {
    await fetch('/api/admin-logout', { method: 'POST', credentials: 'include' }).catch(() => undefined)
    window.location.href = '/admin/login'
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6">
        <a href="/admin" className="flex items-center gap-2.5 font-ge font-bold text-gs-dark">
          <BrandLogoPicture
            alt="GolfSol Ireland"
            className="h-8 w-auto"
            height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
            width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
          />
          <span className="hidden sm:inline">Dashboard</span>
        </a>
        <nav className="flex flex-wrap items-center gap-1" aria-label="Admin sections">
          {TABS.map((t) => (
            <a key={t.id} href={t.href} className={tabClass(t.id)}>
              {t.label}
            </a>
          ))}
        </nav>
        <nav className="ml-auto flex items-center gap-1 sm:gap-2" aria-label="Admin utilities">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg px-3 py-2 font-ge text-sm text-slate-600 hover:bg-slate-100 sm:block"
          >
            View site ↗
          </a>
          <a
            href={BRAND_KIT_ADMIN_PATH}
            className="hidden rounded-lg px-3 py-2 font-ge text-sm text-slate-600 hover:bg-slate-100 md:block"
          >
            Brand sheet
          </a>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-lg border border-slate-300 px-3 py-2 font-ge text-sm font-semibold text-gs-dark hover:bg-slate-100"
          >
            Sign out
          </button>
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

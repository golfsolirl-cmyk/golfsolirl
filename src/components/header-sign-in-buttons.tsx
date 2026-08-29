import { integrationRegistry } from '../config/integrations'
import { cx } from '../lib/utils'
import { useAuth } from '../providers/auth-provider'

type HeaderSignInButtonsProps = {
  readonly tone?: 'light' | 'dark'
  readonly layout?: 'cluster' | 'menu'
  readonly onNavigate?: () => void
}

export function HeaderSignInButtons({
  tone = 'light',
  layout = 'cluster',
  onNavigate
}: HeaderSignInButtonsProps) {
  const { session, profile, isLoading } = useAuth()

  if (!integrationRegistry.supabase.enabled) return null

  const isAdmin = profile?.role === 'admin'
  const isMenu = layout === 'menu'
  const isDark = tone === 'dark'
  const clientHref = session ? '/dashboard' : '/dashboard/login'
  const adminHref = session && isAdmin ? '/dashboard/admin' : '/dashboard/admin/login'
  const clientLabel = session ? 'Trip desk' : isMenu ? 'Client sign-in' : 'Client'
  const adminLabel = session && isAdmin ? 'Admin desk' : isMenu ? 'Admin sign-in' : 'Admin'
  const clientAria = session ? 'Open your trip desk' : 'Client sign-in'
  const adminAria = session && isAdmin ? 'Open admin desk' : 'Admin sign-in'

  const shell = cx(
    'flex items-stretch',
    isMenu ? 'w-full gap-2' : 'rounded-full p-[3px]',
    !isMenu && (isDark ? 'border border-white/18 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]' : 'border border-forest-200/80 bg-white shadow-[0_1px_2px_rgba(8,46,35,0.06)]')
  )

  const baseBtn =
    'inline-flex items-center justify-center rounded-full font-ge font-bold uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fairway-400 focus-visible:ring-offset-2'

  const size = isMenu
    ? 'min-h-12 flex-1 px-4 text-[0.78rem]'
    : 'min-h-0 px-3.5 py-2 text-[0.62rem] xl:px-4 xl:text-[0.68rem]'

  const clientClass = cx(
    baseBtn,
    size,
    isDark
      ? 'bg-gradient-to-r from-brand-800 to-brand-600 text-white shadow-[0_6px_16px_rgba(19,96,71,0.35)] hover:from-brand-700 hover:to-brand-500'
      : 'bg-forest-900 text-white shadow-[0_4px_12px_rgba(8,46,35,0.18)] hover:bg-forest-800'
  )

  const adminClass = cx(
    baseBtn,
    size,
    isDark
      ? 'border border-white/25 bg-transparent text-white hover:border-brand-300/70 hover:bg-white/10'
      : 'border border-transparent text-forest-800 hover:bg-cream hover:text-forest-950'
  )

  if (isLoading) {
    return (
      <div aria-hidden className={cx(shell, isMenu ? 'h-12' : 'h-10 w-[11.5rem]')} />
    )
  }

  return (
    <div aria-label="Sign in" className={shell} role="group">
      <a aria-label={clientAria} className={clientClass} href={clientHref} onClick={onNavigate}>
        {clientLabel}
      </a>
      <a aria-label={adminAria} className={adminClass} href={adminHref} onClick={onNavigate}>
        {adminLabel}
      </a>
    </div>
  )
}

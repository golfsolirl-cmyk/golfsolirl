import { useEffect } from 'react'
import { MinimalLoginShell } from '../components/minimal-login-shell'
import { useAuth } from '../providers/auth-provider'

export function LoggedOutPage() {
  const { session, profile, isLoading } = useAuth()
  const idleLogout =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('reason') === 'idle'

  useEffect(() => {
    if (isLoading || !session) {
      return
    }
    window.location.replace(profile?.role === 'admin' ? '/dashboard/admin' : '/dashboard')
  }, [isLoading, session, profile?.role])

  if (isLoading) {
    return (
      <MinimalLoginShell title="Signed out">
        <p className="font-ge text-sm text-forest-600">Loading…</p>
      </MinimalLoginShell>
    )
  }

  return (
    <MinimalLoginShell
      helper={idleLogout ? 'Signed out after inactivity.' : 'Session cleared on this device.'}
      title="You're signed out"
    >
      <a
        className="inline-flex w-full min-h-12 items-center justify-center rounded-xl bg-forest-900 px-4 py-3.5 font-ge text-base font-bold text-white transition hover:bg-forest-800"
        href="/portal"
      >
        Open your portal
      </a>
    </MinimalLoginShell>
  )
}

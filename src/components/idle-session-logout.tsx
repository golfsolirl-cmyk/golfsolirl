import { useEffect, useRef } from 'react'
import { IDLE_ACTIVITY_EVENTS, idleTimeoutMsForRole } from '../lib/idle-session'
import { useAuth } from '../providers/auth-provider'

/**
 * Signs the user out after a period of no pointer/keyboard/touch activity.
 * Applies to admin, client, and driver sessions.
 */
export function IdleSessionLogout() {
  const { session, profile, signOut, isLoading } = useAuth()
  const lastActivityRef = useRef(Date.now())
  const signingOutRef = useRef(false)

  useEffect(() => {
    if (isLoading || !session) {
      return
    }

    const path = window.location.pathname.replace(/\/+$/, '') || '/'
    if (path === '/auth/callback' || path === '/logged-out') {
      return
    }

    const idleMs = idleTimeoutMsForRole(profile?.role)
    signingOutRef.current = false
    lastActivityRef.current = Date.now()

    const markActivity = () => {
      lastActivityRef.current = Date.now()
    }

    let moveThrottle = 0
    const onMove = () => {
      const now = Date.now()
      if (now - moveThrottle < 1500) {
        return
      }
      moveThrottle = now
      markActivity()
    }

    for (const evt of IDLE_ACTIVITY_EVENTS) {
      window.addEventListener(evt, evt === 'mousemove' ? onMove : markActivity, {
        passive: true,
        capture: true
      })
    }
    document.addEventListener('visibilitychange', markActivity)

    const tick = window.setInterval(() => {
      if (signingOutRef.current) {
        return
      }
      if (document.visibilityState === 'hidden') {
        // Still count idle time while the tab is in the background.
      }
      if (Date.now() - lastActivityRef.current < idleMs) {
        return
      }
      signingOutRef.current = true
      void signOut({ reason: 'idle' })
    }, 15_000)

    return () => {
      window.clearInterval(tick)
      for (const evt of IDLE_ACTIVITY_EVENTS) {
        window.removeEventListener(evt, evt === 'mousemove' ? onMove : markActivity, true)
      }
      document.removeEventListener('visibilitychange', markActivity)
    }
  }, [session, profile?.role, isLoading, signOut])

  return null
}

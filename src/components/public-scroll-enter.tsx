import { useEffect } from 'react'
import { enablePublicScrollEnter } from '../lib/public-scroll-enter'

/** Boots CSS scroll-enter / fly-in progressive enhancement on public marketing pages. */
export function PublicScrollEnter() {
  useEffect(() => {
    let cleanup = enablePublicScrollEnter()
    const onNav = () => {
      cleanup()
      cleanup = enablePublicScrollEnter()
    }
    window.addEventListener('popstate', onNav)
    return () => {
      cleanup()
      window.removeEventListener('popstate', onNav)
    }
  }, [])
  return null
}

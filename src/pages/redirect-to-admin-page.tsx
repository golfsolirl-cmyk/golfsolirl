import { useEffect } from 'react'

/** Fold legacy `/dashboard/admin` bookmarks into the TOW admin at `/admin`. */
export function RedirectToAdminPage() {
  useEffect(() => {
    const { search, hash } = window.location
    window.location.replace(`/admin${search}${hash}`)
  }, [])

  return (
    <main className="flex min-h-[40vh] items-center justify-center bg-slate-100 px-5 font-ge text-sm text-slate-600">
      Taking you to the admin desk…
    </main>
  )
}

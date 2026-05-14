/**
 * Auth + Supabase hydrate immediately on these paths so `useAuth().isLoading` and session restore
 * behave correctly. Marketing shell routes defer the Supabase bundle until idle to speed first paint.
 */
export function pathnameNeedsImmediateSupabaseHydration(normalizedPath: string): boolean {
  const p = normalizedPath === '/' ? '/' : normalizedPath.replace(/\/+$/, '')
  return (
    p.startsWith('/dashboard') ||
    p.startsWith('/driver') ||
    p.startsWith('/documents') ||
    p === '/auth/callback' ||
    p === '/login' ||
    p === '/logged-out' ||
    p === '/packages' ||
    p === '/package' ||
    p.startsWith('/packages-admin') ||
    p.startsWith('/package-admin')
  )
}

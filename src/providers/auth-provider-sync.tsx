import { useMemo, type ReactNode } from 'react'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { AuthProviderImpl } from './auth-state'

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  return <AuthProviderImpl supabase={supabase}>{children}</AuthProviderImpl>
}

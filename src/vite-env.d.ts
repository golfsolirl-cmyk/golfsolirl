/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string
  readonly VITE_RESEND_AUDIENCE_ID?: string
  /** When `"true"`, admin page shows workflow strip, transfer builder, manual proposal, trip workspace. */
  readonly VITE_SHOW_ADMIN_WORKSPACE?: string
  /** Client-visible build gate for `/packages-admin` only — not a substitute for Supabase admin auth. */
  readonly VITE_PACKAGE_ADMIN_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

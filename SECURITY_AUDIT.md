# Golf Sol Ireland — Security audit summary

**Scope:** Vite + React SPA, Vercel `api/gateway.mjs`, `server/*.mjs`, Supabase Postgres migrations, Resend-backed flows.  
**Date:** 2026-05-14  

---

## Executive summary

The codebase follows several strong patterns: **Supabase service role and Resend keys stay server-side**, admin APIs use **`requireAdminFromBearer`** (`server/auth-verify-admin.mjs`), magic-link **`redirectTo` is allow-listed** (`server/magic-link-service.mjs`), cron sweeps require **`CRON_SECRET`** (`server/transfer-booking-no-driver-service.mjs`, `server/transfer-payment-service.mjs`), and Stripe webhooks use **`constructEvent`** (`server/stripe-webhook-service.mjs`).  

Remediation applied in-repo (see **Fixes applied** below): removal of a **guessable default client-side admin passphrase**, **`build.sourcemap: false`** for production bundles, **HTTP security headers** on static routes (**`vercel.json`**) and **baseline headers on all gateway responses** (`api/gateway.mjs`).  

**Production readiness score (qualitative): 72 / 100** — solid server/API posture and RLS on migrated tables; remaining gaps are **client-side secrets embedded via `VITE_*`**, **implicit Supabase browser flow trade-offs**, and **dependency audit blocked locally** (TLS to npm registry).  

---

## Vulnerabilities and findings

| ID | Severity | Topic | Files / area | Status |
|----|----------|-------|----------------|--------|
| SEC-001 | **High** | Guessable default **internal package studio** passphrase shipped in client bundle | `src/pages/packages.tsx` | **Fixed** — no default; gate disabled unless `VITE_PACKAGE_ADMIN_KEY` set |
| SEC-002 | **High** | Any `VITE_*` “secret” is **extractable from compiled JS** | Build pipeline | **Risk accepted / documented** — treat `VITE_PACKAGE_ADMIN_KEY` as obscurity only |
| SEC-003 | **Medium** | **Implicit** OAuth session flow in browser (`flowType: 'implicit'`) — intentional for cross-device magic links; weaker than PKCE in-tab | `src/lib/supabase-client.ts` | **Documented** — product trade-off |
| SEC-004 | **Medium** | Missing **global security headers** on SPA + API | `vercel.json`, `api/gateway.mjs` | **Fixed** (CSP + standard headers; tune per third-party needs) |
| SEC-005 | **Low** | Production **source maps** default | `vite.config.ts` | **Fixed** — `build.sourcemap: false` |
| SEC-006 | Info | **`npm audit`** not verified in CI this run | `package.json` | **Open** — registry TLS failure on audit host; run `npm audit` where CA chain works |
| SEC-007 | Info | **Edge Functions** folder absent — N/A | — | — |

---

## Fixes applied (code)

1. **`src/pages/packages.tsx`** — Removed fallback `'gsol-admin'`; internal `/packages-admin` studio requires explicit `VITE_PACKAGE_ADMIN_KEY` and clears stale session unlock state when unset.  
2. **`vite.config.ts`** — `build.sourcemap: false`.  
3. **`vercel.json`** — `headers` for CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.  
4. **`api/gateway.mjs`** — `applyApiSecurityHeaders()` on JSON, HTML preview, and PDF responses.  
5. **`src/vite-env.d.ts`** — Documented `VITE_PACKAGE_ADMIN_KEY`.

---

## Remaining risks (prioritised)

1. **Tune CSP** after smoke-testing every route (maps, Stripe Checkout, Supabase signed URLs, PDFs). Adjust `img-src` / `frame-src` / `connect-src` if a feature breaks.  
2. **Replace client-only protection** on `/packages-admin` with **Supabase admin session** or remove the route from public deployments.  
3. **Run `npm audit fix`** (or Dependabot) where registry TLS allows; review breaking upgrades manually.  
4. **Periodic Supabase review**: RLS on new tables, Storage bucket policies, Auth redirect URLs, leaked keys in logs.

---

## References

- `SUPABASE_SECURITY_REPORT.md` — database / RLS / storage notes  
- `AUTH_SECURITY_REPORT.md` — magic link, sessions, gateway auth  
- `RLS_POLICIES.sql` — verification queries + inventory  
- `DEPENDENCY_AUDIT.md` — npm audit caveat  
- `PRODUCTION_HARDENING.md` — headers, build, operational checklist  

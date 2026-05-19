# Production hardening checklist

---

## Applied in repository

| Item | Detail |
|------|--------|
| **No JS source maps** | `vite.config.ts` → `build.sourcemap: false` |
| **Static security headers** | `vercel.json` → CSP, frame protection, HSTS, referrer policy |
| **API response headers** | `api/gateway.mjs` → `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` |
| **Weak client passphrase removed** | `/packages-admin` no longer defaults to `gsol-admin` |

---

## Content-Security-Policy (CSP)

The deployed policy allows:

- **Supabase** REST + Realtime (`https://*.supabase.co`, `wss://*.supabase.co`)
- **Stripe** Checkout / JS (`https://js.stripe.com`, `https://hooks.stripe.com`, `https://checkout.stripe.com`, `https://api.stripe.com`)
- **OpenStreetMap** tiles (`https://*.tile.openstreetmap.org`)
- **Bunny fonts** (`https://fonts.bunny.net`)
- **`worker-src 'self' blob:`** for libraries that spawn workers

**After deploy:** smoke-test maps, Stripe Checkout, magic-link callback, PDF flows, and any signed Supabase URLs in iframes. Tighten directives if you add new third-party origins.

---

## HSTS + preload

`Strict-Transport-Security` includes **`preload`**. Only keep preload if:

- All production hosts serve HTTPS forever  
- You intend to submit the domain to the **HSTS preload list**

Otherwise shorten to `max-age=…; includeSubDomains` without `preload`.

---

## Secrets hygiene

| Never in Git | OK in Vercel / server env | OK in client (`VITE_*`) |
|--------------|---------------------------|-------------------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Never** |
| `RESEND_API_KEY` | Yes | **Never** |
| `STRIPE_SECRET_KEY`, webhook secret | Yes | **Never** |
| `CRON_SECRET`, `ADMIN_OPERATOR_PASSCODE` | Yes | **Never** — quote in `.env`/Vercel if the value contains `#` or `$`; restart dev after local changes |
| `VITE_SUPABASE_ANON_KEY` | Build env | Yes (public anon key) |

---

## Operational monitoring

- Track **401/403 spikes** on `/api/gateway` routes  
- Alert on **Stripe webhook** failures and **Resend** bounce rates  
- Rotate keys promptly if **anon** or **service_role** ever leak  

---

## Production readiness (ops slice)

**Score: 75 / 100** — headers and build tightened; finalize CSP/HSTS after staged QA and dependency audit.

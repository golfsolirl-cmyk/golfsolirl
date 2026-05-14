# Dependency audit

**Tool:** `npm audit`  
**Result (2026-05-14):** Audit **could not be completed** in this environment — npm reported **`unable to verify the first certificate`** when calling the registry advisories API (local CA / TLS interception).

---

## Recommended actions

1. On a trusted developer machine or CI runner with working registry TLS, run:
   - `npm audit`
   - `npm audit fix` (patch/minor only first), then review breaking majors manually.
2. Enable **Dependabot** or **Renovate** on GitHub for ongoing alerts.
3. Watch **Supabase JS**, **Stripe**, **Vite**, **React** for security releases — these power auth, payments, and the bundle surface.

---

## Direct dependencies (inventory)

| Package | Role |
|---------|------|
| `@supabase/supabase-js` | Auth + data client |
| `stripe` | Payments / webhooks |
| `resend` | Transactional email (server) |
| `@vercel/functions` | `waitUntil` where used |
| `vite`, `@vitejs/plugin-react` | Build |
| `framer-motion`, `leaflet`, `jspdf`, `pdf-lib`, `html2canvas` | UI / PDF / maps |

---

## Production readiness (dependency slice)

**Score: Not scored** — rerun audit where TLS succeeds; treat current state as **unknown** until advisories load.

# Authentication & session security report

---

## Magic link (`/api/auth/magic-link`)

**Implementation:** `server/magic-link-service.mjs`, invoked from `api/gateway.mjs` and Vite dev middleware.

| Control | Status |
|---------|--------|
| **`redirectTo` allow-list** | Uses `SITE_URL`, localhost, `VERCEL_URL`, `MAGIC_LINK_REDIRECT_ORIGINS` |
| **Rate limiting** | `MAGIC_LINK_RATE_LIMIT_PER_WINDOW` / `MAGIC_LINK_RATE_WINDOW_MS` |
| **Admin operator gate** | Optional `ADMIN_OPERATOR_PASSCODE` + `operatorCode` for `portal: admin` |
| **Email abuse** | `isAuthEmailBlocked` integration |
| **Service role for link generation** | Server-only — correct |

**Residual risk:** Magic links remain **phishable** like any email link — rely on short TTL, user education, and optional step-up for sensitive admin actions.

---

## Browser Supabase client

**File:** `src/lib/supabase-client.ts`

- **`flowType: 'implicit'`** — supports opening magic links on another device/in-app browser; tokens appear in URL hash on redirect. **Mitigation:** callback handler should normalize session and avoid logging URLs.  
- **Persistence:** `localStorage` — XSS in same origin could steal session; CSP + React hygiene reduces but does not eliminate risk.

---

## Gateway authorization patterns

- **Admin actions:** `requireAdminFromBearer` validates JWT then **`profiles.role === 'admin'`** via service client — appropriate for server-side gate.  
- **Cron:** `handleTransferBookingNoDriverSweep` / `handleTransferBalanceReminderSweep` require **`CRON_SECRET`**; if unset, handlers reject (**fail-closed** when secret empty and caller uses Bearer compare).  

---

## Stripe

**File:** `server/stripe-webhook-service.mjs` — **`stripe.webhooks.constructEvent`** validates signature — **good**.

---

## Open redirects

- Magic link **`redirectTo`** is restricted (see above).  
- App routing uses internal path checks in places like `src/lib/internal-redirect.ts` — keep new features aligned with that pattern.

---

## Production readiness (auth slice)

**Score: 74 / 100** — solid server checks; improve long-term by evaluating **PKCE** where same-tab flows dominate, and tightening **admin** flows beyond email-only factors if threat model requires it.

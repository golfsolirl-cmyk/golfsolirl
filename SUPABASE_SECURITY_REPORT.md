# Supabase security report

**Scope:** `supabase/migrations/*.sql` (no separate `edge-functions/` tree in this repo).  

---

## Strengths observed

- **RLS enabled** on core CRM tables in `20260330120000_init_auth_and_crm.sql` (`profiles`, `enquiries`, `proposals`) with `is_admin()` **SECURITY DEFINER** helper to avoid recursive policy bugs.  
- Subsequent migrations consistently call **`alter table ... enable row level security`** for portal, transfers, drivers, invoices, interest tickets, documents, etc. (see `RLS_POLICIES.sql` inventory).  
- **`service_role`** elevated paths appear limited to server automation / webhook contexts in recent transfer-booking migrations (JWT role checks).  

---

## Areas to verify in Dashboard (ongoing)

| Area | Action |
|------|--------|
| **Auth redirect URLs** | Match production origin + `/auth/callback`; avoid wildcards beyond needed hosts. |
| **Leaked JWT settings** | Ensure anon key only in frontend; rotate if ever committed. |
| **Storage buckets** | Confirm `client-portal-pdfs` (and others) are **not public** unless intended; validate signed URL TTL in app (`createSignedUrl`). |
| **Realtime** | Review channels enabled in `20260505240000_realtime_client_portal_dashboard.sql` — publication should expose minimum columns. |
| **New tables** | Every new table: **enable RLS** + policies before merge; add migration tests where possible. |

---

## False sense of security

- **Postgres RLS does not protect** routes that use **`SUPABASE_SERVICE_ROLE_KEY`** — those bypass RLS. All such handlers must enforce **admin JWT**, **cron secret**, **Stripe signature**, or equivalent **before** mutating data.

---

## Severity snapshot

| Finding | Severity | Notes |
|---------|----------|--------|
| Service role used widely server-side | **Expected** | Correct pattern if gated per-handler |
| Client uses anon key only | **Good** | Verified via `src/lib/supabase-client.ts` |
| RLS on listed tables | **Good** | See inventory SQL |

---

## Production readiness (Supabase slice)

**Score: 78 / 100** — migrations show disciplined RLS rollout; remaining points require live-dashboard verification (Storage, Realtime, Auth URLs) and regression testing after policy changes.

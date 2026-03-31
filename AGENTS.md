# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Golf Sol Ireland is a Vite + React SPA (TypeScript, Tailwind CSS) with Vercel Serverless Functions for the backend. Supabase provides database/auth, Resend handles transactional email. See `package.json` for available scripts.

### Development

- **Dev server:** `npm run dev` — starts Vite on port 5173. API routes (`/api/*`) are served via custom Vite middleware plugins defined in `vite.config.ts`, so no separate backend process is needed.
- **Type check:** `npm run build` runs `tsc --noEmit && vite build`. For type-checking only, use `npx tsc --noEmit`.
- **No linter or test runner** is configured in the repo (no ESLint, Prettier, Jest, or Vitest config). Type checking via `tsc --noEmit` is the primary correctness check.
- **No README** exists in the repo.

### Environment variables

Copy `.env.example` to `.env` for local dev. The app starts fine without real API keys — Supabase-dependent features (auth, dashboards) and Resend-dependent features (enquiry email, magic links) will return clear error messages when keys are missing. The frontend renders fully without them.

### Routing

Client-side routing is in `src/main.tsx` — `resolvePage()` maps URL paths to page components. There is no react-router; navigation is path-based with full page resolves.

### Key caveats

- `sharp` is a native dependency. `npm install` handles it, but if the platform changes (e.g. ARM vs x86), a clean reinstall of `node_modules` may be needed.
- The Vite dev middleware in `vite.config.ts` imports `.mjs` files from `server/` — these run in Node.js context during dev, not in the browser.

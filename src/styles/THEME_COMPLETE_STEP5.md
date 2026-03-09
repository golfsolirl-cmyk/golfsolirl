# Theme system — completion summary (Steps 3–5)

## Done

- **Step 3A** — `src/styles/theme.css`: full light/dark token set, legacy aliases, logo shadows, typography/spacing/radius/motion, `.theme-transition`.
- **Step 3B** — No-flash script in `src/app/layout.tsx`: `Script` with `strategy="beforeInteractive"` runs before paint, reads `localStorage.getItem('golf-sol-theme')` / `prefers-color-scheme`, sets `document.documentElement.setAttribute('data-theme', theme)`. Theme CSS imported before globals.
- **Step 3C** — `ThemeContext`: initial theme from `document.documentElement.getAttribute('data-theme')` after mount; syncs `data-theme` + `localStorage`; exposes `isSystemTheme` (true when no stored override and theme matches system).
- **Step 3D** — `src/components/ui/ThemeToggle/index.tsx`: 36×36px, rounded-full, `--color-surface-raised` / `--color-border`; sun/moon with rotate+fade; `aria-label` "Switch to dark/light mode"; focus `--color-focus-ring`. Used in Header (desktop + mobile).
- **Step 3E** — `globals.css`: removed duplicate `:root` colors; logo, package-step-card, step-card-icon, newsletter outline, buttons, skip-link, focus use `var(--color-*)` / theme shadows. Logo filter vars in theme.css.
- **Step 3F** — Card/Modal/Input/Button: surface-raised, overlay, focus ring `--color-focus-ring`, Modal shadow-xl.
- **Step 4** — `tailwind.config.ts`: `darkMode: ['selector', '[data-theme="dark"]']`; extended colors (bg, surface, text, border, focus-ring, accent, status, legacy aliases); boxShadow (sm–xl + primary + card/hero/button); borderRadius and transitionDuration from theme vars.

## Storage key

- `golf-sol-theme` (layout script + ThemeContext).

## Files touched

- `src/app/layout.tsx` — theme.css, no-flash script, body.theme-transition
- `src/context/ThemeContext.tsx` — DOM initial theme, isSystemTheme, data-theme only
- `src/components/ui/ThemeToggle/index.tsx` — new
- `src/components/layout/Header.tsx` — ThemeToggle
- `src/app/globals.css` — hex → vars
- `src/styles/theme.css` — logo-shadow vars, ease-spring/bounce
- `src/components/ui/Modal/index.tsx` — overlay/surface/shadow/focus ring
- `src/components/ui/Input/index.tsx` — surface, border, focus ring
- `src/components/ui/Button/index.tsx` — focus ring
- `tailwind.config.ts` — darkMode selector, extend colors/shadows/radius/duration

## Checklist (manual)

- [ ] Toggle light ↔ dark: correct
- [ ] Hard refresh: no flash (light and dark)
- [ ] Focus rings use `--color-focus-ring`
- [ ] Buttons/inputs/cards/modals correct in both themes
- [ ] Status and muted text readable

Theme system complete.

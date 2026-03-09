# Step 2 — Palette Design

## Design anchor
- **Dominant brand:** `#123811` (dark green) — primary buttons, nav, section titles, trust/golf.
- **Secondary brand:** `#E07B39` (orange) — highlights, “perfect golf tour”, some CTAs.
- **Tertiary:** `#F5C842` (yellow) — Newsletter, badges, dark-mode nav hover.

Token naming: `--color-accent` = **green** (main brand). Orange and yellow kept as semantic/secondary tokens where needed.

---

## Light theme

**Philosophy:** Warm off-white base, soft green-tinted surfaces, warm shadows, no pure black.

| Token | Value | Notes |
|-------|--------|------|
| **Backgrounds** | | |
| `--color-bg` | `#f8f6f2` | Warm off-white (not pure white). |
| `--color-surface` | `#f2efe8` | Slightly cooler warm grey. |
| `--color-surface-raised` | `#ffffff` | Cards, inputs. |
| `--color-surface-overlay` | `rgba(0,0,0,0.35)` | Modal backdrop. |
| `--color-surface-subtle` | `#ebe8e2` | Inputs, subtle areas. |
| **Text** | | |
| `--color-text` | `#1a2418` | Near-black, green tint (AAA on bg). |
| `--color-text-secondary` | `#2d3829` | Body/secondary (AA). |
| `--color-text-muted` | `#5c6b5c` | Placeholder, captions (≥3:1). |
| `--color-text-disabled` | `#9ca89c` | Disabled state. |
| `--color-text-inverse` | `#f8f6f2` | On dark (e.g. footer). |
| **Borders** | | |
| `--color-border` | `#e2dfd8` | Default borders. |
| `--color-border-subtle` | `#ebe8e2` | Very soft. |
| `--color-border-strong` | `#b5b0a6` | Emphasis. |
| `--color-focus-ring` | `#123811` | Focus ring (green). |
| **Brand (accent = green)** | | |
| `--color-accent` | `#123811` | Primary green. |
| `--color-accent-hover` | `#1e4a1a` | Slightly lighter green. |
| `--color-accent-active` | `#0d2d0d` | Pressed. |
| `--color-accent-foreground` | `#ffffff` | Text on accent (≥4.5:1). |
| `--color-accent-subtle` | `#e8f0e9` | Light green bg. |
| **Status** | | |
| `--color-success` | `#15803d` | Success. |
| `--color-success-subtle` | `#dcfce7` | Success bg. |
| `--color-error` | `#b91c1c` | Error. |
| `--color-error-subtle` | `#fee2e2` | Error bg. |
| `--color-warning` | `#b45309` | Warning. |
| `--color-warning-subtle` | `#fef3c7` | Warning bg. |
| `--color-info` | `#1d4ed8` | Info. |
| `--color-info-subtle` | `#dbeafe` | Info bg. |
| **Shadows (warm-tinted)** | | |
| `--shadow-sm` | `0 1px 2px rgba(18,56,17,0.06)` | |
| `--shadow-md` | `0 4px 12px rgba(18,56,17,0.08)` | |
| `--shadow-lg` | `0 12px 32px rgba(18,56,17,0.1)` | |
| `--shadow-xl` | `0 24px 48px rgba(18,56,17,0.12)` | |

**Secondary brand (for highlights, Newsletter, etc.):**
- Orange: `#E07B39` (use in components; can add `--color-highlight` later).
- Yellow: `#F5C842` (same; or map to warning if desired).

---

## Dark theme

**Philosophy:** Near-black with green tint, elevation = lighter steps, opacity-only shadows, warm cream text, accent slightly lighter/saturated.

| Token | Value | Notes |
|-------|--------|------|
| **Backgrounds** | | |
| `--color-bg` | `#0f120e` | Near-black, green tint. |
| `--color-surface` | `#161a14` | +~4% lighter. |
| `--color-surface-raised` | `#1c2118` | Cards. |
| `--color-surface-overlay` | `rgba(0,0,0,0.6)` | Modal. |
| `--color-surface-subtle` | `#1a1f16` | Inputs. |
| **Text** | | |
| `--color-text` | `#f0ede6` | Warm cream (AAA on bg). |
| `--color-text-secondary` | `#d8d4cc` | Secondary. |
| `--color-text-muted` | `#a8a89e` | Muted (≥3:1). |
| `--color-text-disabled` | `#6b6b62` | Disabled. |
| `--color-text-inverse` | `#0f120e` | On light in dark mode. |
| **Borders** | | |
| `--color-border` | `rgba(240,237,230,0.18)` | |
| `--color-border-subtle` | `rgba(240,237,230,0.1)` | |
| `--color-border-strong` | `rgba(240,237,230,0.35)` | |
| `--color-focus-ring` | `#4a9e55` | Lighter green focus. |
| **Brand** | | |
| `--color-accent` | `#2d6b3a` | Lighter green (pops on dark). |
| `--color-accent-hover` | `#3d8b4a` | |
| `--color-accent-active` | `#1e4a1a` | |
| `--color-accent-foreground` | `#f0ede6` | Cream on accent. |
| `--color-accent-subtle` | `rgba(45,107,58,0.2)` | |
| **Status** | | |
| `--color-success` | `#22c55e` | |
| `--color-success-subtle` | `rgba(34,197,94,0.15)` | |
| `--color-error` | `#ef4444` | |
| `--color-error-subtle` | `rgba(239,68,68,0.15)` | |
| `--color-warning` | `#eab308` | |
| `--color-warning-subtle` | `rgba(234,179,8,0.15)` | |
| `--color-info` | `#3b82f6` | |
| `--color-info-subtle` | `rgba(59,130,246,0.15)` | |
| **Shadows (opacity only)** | | |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.25)` | |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.35)` | |
| `--shadow-lg` | `0 12px 40px rgba(0,0,0,0.4)` | |
| `--shadow-xl` | `0 24px 56px rgba(0,0,0,0.5)` | |

**Secondary in dark:** Orange `#E07B39` / `#f59e4a` (hover), Yellow `#F5C842` — keep for Newsletter, badges, nav hover.

---

## Contrast (targets)

| Pair | Light | Dark |
|------|--------|------|
| text on bg | #1a2418 on #f8f6f2 → **~12:1** ✓ | #f0ede6 on #0f120e → **~14:1** ✓ |
| text-secondary on bg | #2d3829 on #f8f6f2 → **~8:1** ✓ | #d8d4cc on #0f120e → **~10:1** ✓ |
| text-muted on bg | #5c6b5c on #f8f6f2 → **~4.5:1** ✓ | #a8a89e on #0f120e → **~5:1** ✓ |
| accent-foreground on accent | #fff on #123811 → **~8:1** ✓ | #f0ede6 on #2d6b3a → **~5:1** ✓ |

---

## Typography, spacing, radius, motion (shared)

Same for both themes (as per spec):

- **Font:** `--font-sans` (DM Sans), `--font-display` (Playfair), `--font-script` (Dancing Script).
- **Size scale:** `--text-xs` (11px) … `--text-5xl` (48px).
- **Spacing:** `--space-1` (4px) … `--space-20` (80px).
- **Radius:** `--radius-sm` (4px) … `--radius-full` (9999px).
- **Motion:** `--duration-fast` (100ms), `--duration-normal` (200ms), `--duration-slow` (350ms), `--ease-default`, `--ease-in`, `--ease-out`.

---

## Migration map (existing → new tokens)

| Current (codebase) | New token |
|--------------------|-----------|
| `--color-background` | `--color-bg` |
| `--color-background-elevated` | `--color-surface-raised` |
| `--color-background-overlay` | `--color-surface-overlay` |
| `--color-text-primary` / body | `--color-text` / `--color-text-secondary` |
| `--color-text-muted` | `--color-text-muted` |
| `--color-border` | `--color-border` |
| `--color-primary-500` (green) | `--color-accent` |
| `--color-primary-foreground` | `--color-accent-foreground` |
| Tailwind `bg-background` | `bg-[var(--color-bg)]` or Tailwind theme `bg` → `var(--color-bg)` |
| Tailwind `text-primary` (green) | `var(--color-accent)` or `text-accent` |

Orange/yellow stay as component-level or extra tokens (`--color-highlight`, `--color-yellow`) for Newsletter, badges, etc.

---

**Next:** Step 3 — Implementation (theme.css, no-flash script, ThemeContext, ThemeToggle, replace hardcoded values, Tailwind config).

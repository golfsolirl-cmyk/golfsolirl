# Golf Sol Ireland — Brand Guidelines

**Step 1 (Brand Guardian):** Single source of truth for colour, typography, logo, and voice. Implement in code via `src/styles/brand.css`; theme and components consume these tokens.

---

## 1. Brand foundation

| | |
|---|---|
| **Purpose** | Premium golf holiday and tour company for Irish golfers — Costa del Sol focus. Tailor-made packages, tee times, accommodation, transfers. |
| **Values** | Trust, expertise, Irish warmth, premium experience, clarity. |
| **Personality** | Prestigious but approachable; professional but warm; aspirational (world-class golf) and grounded (no jargon, clear booking). |
| **Audience** | Golf enthusiasts, 35–65, UK/Ireland/Europe, often group bookings. |

---

## 2. Colour palette

All hex values live in `src/styles/brand.css` as `--brand-*` variables. Theme maps them to semantic `--color-*` for light/dark.

### Primary (green)

| Token | Hex | Use | WCAG (on white/cream) |
|-------|-----|-----|------------------------|
| `--brand-primary` | `#123811` | Main CTAs, nav links, primary buttons, key headings | 4.5:1+ on #f8f6f2 |
| `--brand-primary-hover` | `#1e4a1a` | Hover state | 4.5:1+ |
| `--brand-primary-active` | `#0d2d0d` | Active/pressed | 7:1+ |
| `--brand-primary-foreground` | `#ffffff` | Text on primary buttons | 4.5:1+ on #123811 |
| `--brand-primary-subtle` | `#e8f0e9` | Light green backgrounds, highlights | — |

### Secondary (orange)

| Token | Hex | Use |
|-------|-----|-----|
| `--brand-secondary` | `#e07b39` | Newsletter, badges, secondary CTAs, warmth accents |
| `--brand-secondary-hover` | `#c96828` | Hover |
| `--brand-secondary-active` | `#b45309` | Active |

### Gold

| Token | Hex | Use |
|-------|-----|-----|
| `--brand-gold` | `#f5c842` | Heritage accents, script/secondary type, dark-mode nav hover |
| `--brand-gold-muted` | `#b8860b` | Muted gold (borders, subtle) |

### Neutrals (light)

| Token | Hex | Use |
|-------|-----|-----|
| `--brand-neutral-cream` | `#f8f6f2` | Page background |
| `--brand-neutral-surface` | `#f2efe8` | Cards, panels |
| `--brand-neutral-raised` | `#ffffff` | Modals, header when scrolled |
| `--brand-neutral-ink` | `#1a2418` | Primary text |
| `--brand-neutral-ink-secondary` | `#2d3829` | Body text |
| `--brand-neutral-muted` | `#5c6b5c` | Captions, placeholders |
| `--brand-neutral-border` | `#e2dfd8` | Borders |
| `--brand-neutral-border-strong` | `#b5b0a6` | Strong borders, dividers |

### Dark theme base

| Token | Hex | Use |
|-------|-----|-----|
| `--brand-dark-bg` | `#0d120c` | Page background |
| `--brand-dark-surface` | `#141a12` | Cards, panels |
| `--brand-dark-raised` | `#1c2319` | Elevated surfaces |
| `--brand-dark-ink` | `#f0ede6` | Primary text |
| `--brand-dark-ink-secondary` | `#d8d4cc` | Secondary text |
| `--brand-dark-muted` | `#9ca89c` | Muted text |
| `--brand-primary-on-dark` | `#2d6b3a` | Accent green on dark (buttons, links) |

**Rule:** Never introduce new colours in components. Add a `--brand-*` token and map it in `theme.css` if needed.

---

## 3. Typography

| Role | CSS variable | Font stack | Use |
|------|----------------|------------|-----|
| Display | `--brand-font-display` | Playfair Display (700–900) | Headlines, section titles |
| Body | `--brand-font-body` | DM Sans (300–600) | Body copy, UI |
| Script | `--brand-font-script` | Dancing Script (600–700) | Decorative sublines, Irish feel |
| Accent | `--brand-font-accent` | Outfit (600–800) | Badges, labels, sporty UI |

Fonts are loaded in `app/layout.tsx` and exposed as `--font-playfair`, `--font-dm-sans`, `--font-dancing`, `--font-outfit`. Brand tokens reference these.

---

## 4. Logo usage

- **Lockup:** Prefer “Golf Sol” + “Ireland” (with shamrock) + tagline. Use the `Logo` component; do not recreate manually.
- **Concepts:** Header uses `irish-script` (script + gold Ireland). Footer on green uses cream/gold. Other concepts (e.g. `premium`, `minimal`) for marketing as needed.
- **Spacing:** Minimum clear space around logo = height of “Golf Sol” (or 1x the icon height).
- **Sizes:** Scale via container; avoid stretching. Min height ~32px for inline/header; hero can be larger.
- **Backgrounds:** Use on cream, white, or brand green. On photos use a subtle shadow or backing so wordmark stays readable.
- **Don’t:** Change colours outside the defined lockup variants; add effects (e.g. skew, 3D) not in the design system; place on busy imagery without contrast.

---

## 5. Brand voice (copy)

- **Tone:** Professional but warm; aspirational but clear. Confident, not salesy.
- **Style:** Short sentences where it helps clarity. Use “you” and “your”. Avoid jargon; explain golf/tour terms if needed.
- **Examples:**  
  - Good: “Your tailor-made golf break in the Costa del Sol.”  
  - Avoid: “Leverage our premium tee-time solutions.”
- **CTAs:** Action-oriented: “Enquire”, “Plan your trip”, “View courses”. Avoid “Submit”, “Click here”.

---

## 6. Implementation checklist

- [x] **brand.css** — All `--brand-*` tokens defined; no theme-specific logic.
- [x] **theme.css** — Light/dark map `--brand-*` to `--color-accent`, `--color-text`, etc.
- [x] **tokens.css** — Does not override `--color-accent` or `--color-yellow`; theme owns semantic colour.
- [ ] **Components** — Use `--color-*` (semantic) or Tailwind theme colours that point at these tokens.
- [ ] **New UI** — Add new hues to `brand.css` first, then theme/tokens if needed.

To re-theme the site (e.g. new green or gold), change only `src/styles/brand.css` and ensure contrast still meets WCAG AA (4.5:1 for normal text, 3:1 for large).

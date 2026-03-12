# Golf Sol Ireland — Component Library (Step 3: UI Designer)

Base UI components use **brand tokens** (Step 1) and **design tokens** (tokens.css). Every interactive component has defined states; 44px minimum touch target for primary actions; WCAG AA contrast.

---

## Design tokens reference

| Token | Use |
|-------|-----|
| `--color-focus-ring` | Focus outline (2px, offset 2px). 4.5:1 on background. |
| `--color-accent` / `--color-primary-500` | Primary buttons, links (green). |
| `--color-accent-foreground` | Text on primary buttons (white). |
| `--color-surface-raised` | Input/textarea/card/modal background. |
| `--color-border` | Default border. |
| `--color-text` / `--color-text-muted` | Input text / placeholder. |
| `--touch-min` (44px) | Minimum touch target for buttons and controls. |
| `--spacing-*` (4–128px) | 8pt grid: 4, 8, 16, 24, 32, 48, 64, 96, 128. |
| `--radius-md` / `--radius-lg` | Buttons, inputs, cards (12px / 16px). |
| `--duration-normal` | Transitions (200ms). |

---

## Button

**File:** `src/components/ui/Button/index.tsx`

| State | Behaviour |
|-------|-----------|
| Default | Background from variant; rounded-lg; font-bold uppercase. |
| Hover | Darker/lift per variant (e.g. primary: -translate-y-0.5, shadow-4-primary). |
| Active | scale(0.98), translate-y-0. |
| Focus | focus-visible: outline 2px, offset 2px, --color-focus-ring. |
| Disabled | opacity-50, pointer-events-none. |
| Loading | Spinner + "Loading…", aria-busy, same dimensions. |

**Sizes (min height × min width):**

| Size | Min height | Use |
|------|------------|-----|
| xs | 32px | Dense UI only (not primary CTAs). |
| sm | 40px | Secondary actions. |
| **md** | **44px** | **Primary CTAs (WCAG touch target).** |
| lg | 48px | Hero/mobile CTAs. |
| xl | 52px | Large feature CTAs. |

**Variants:** primary | secondary | ghost | danger | success | outline | submit | white | green (primary alias).

**A11y:** Use `aria-label` when `iconOnly`. Link when `href`; button when `onClick`/submit. Focus ring on focus-visible only.

---

## Input

**File:** `src/components/ui/Input/index.tsx`

| State | Behaviour |
|-------|-----------|
| Default | Border --color-border; bg --color-surface-raised; min-h 44px. |
| Hover | Border unchanged (optional: border-neutral-400). |
| Focus | focus-visible: ring 2px --color-focus-ring. |
| Disabled | opacity-50, cursor-not-allowed. |
| Error | border-error, focus:ring-error, error message role=alert. |
| Valid / Warning | validationState: ring-success / ring-warning. |

**Spacing:** 8pt: padding py-3 (12px), px-4 (16px). Label: text-sm, 4px gap to input (space-y-1).

**A11y:** label[htmlFor], aria-invalid, aria-describedby (error + helper). Password: show/hide button with aria-label.

---

## Textarea

**File:** `src/components/ui/Textarea/index.tsx`

Same states and tokens as Input. Min-height 88px. Optional maxLength + showCount (aria-live="polite"). resize-y.

---

## Card

**File:** `src/components/ui/Card/index.tsx`

| Variant | Use |
|---------|-----|
| default | Bordered, shadow-1. |
| elevated | Stronger shadow (shadow-3). |
| outlined | Transparent bg, border-2. |
| ghost | Transparent, no border. |
| interactive | Hover: lift -translate-y-0.5, shadow-3; cursor-pointer. |

**Padding (8pt):** CardHeader/CardFooter: px-6 py-4 (24px, 16px). CardBody: p-6 (24px). CardMedia: rounded-t-xl only.

**A11y:** When interactive (e.g. whole card is a link), ensure inner focusable has focus-visible ring. Use `as="article"` for feed items.

---

## Modal

**File:** `src/components/ui/Modal/index.tsx`

| Size | Max width |
|------|-----------|
| sm | 400px |
| md | 560px |
| lg | 720px |
| xl | 960px |
| full | 100vw × 100vh |

**Behaviour:** role="dialog", aria-modal="true", aria-labelledby / aria-describedby. Focus trap; Escape closes; backdrop click closes (optional). Body scroll locked when open.

**Close button:** 44×44px hit area (p-2 + min dimensions or padding). aria-label="Close". focus-visible: ring --color-focus-ring.

**Overlay:** --color-surface-overlay. Panel: --color-surface-raised, --shadow-xl.

---

## Responsive breakpoints

Use for component layout (e.g. stack vs grid): **640** (sm) | **768** (md) | **1024** (lg) | **1280** (xl). Design mobile-first; scale up.

---

## Dark mode

All components use semantic tokens (--color-*). theme.css and tokens.css define [data-theme="dark"] overrides. No component-specific dark classes required unless a one-off override.

---

## Checklist for new components

- [ ] Uses --color-* or --brand-* (no raw hex for brand/semantic colours).
- [ ] Interactive: default, hover, active, focus-visible, disabled (and loading/error if applicable).
- [ ] Primary actions: min 44px height/width (--touch-min).
- [ ] Focus: 2px outline, 2px offset, --color-focus-ring; focus-visible only.
- [ ] ARIA: label, aria-invalid, aria-describedby, aria-label for icon-only.
- [ ] Spacing: 8pt grid (4, 8, 16, 24, 32px).

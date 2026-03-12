# Header — Design spec & developer handoff

## Design tokens (see `tokens.css`)

| Token | Light | Dark |
|-------|--------|------|
| `--header-min-height` | 72px | 72px |
| `--header-padding-y` | 16px | 16px |
| `--header-padding-x` | 24px | 24px |
| `--header-z` | 99 | 99 |
| `--header-bg` | rgba(255,255,255,0.98) | rgba(13,18,12,0.85) |
| `--header-bg-scrolled` | #ffffff | var(--color-background-elevated) |
| `--header-border` | var(--color-border) | rgba(240,237,230,0.12) |
| `--touch-min` | 44px | 44px |

## Spacing (8pt grid)

- Container horizontal: 16px (mobile), 24px (sm), 32px (lg), 40px (xl)
- Nav link gap (desktop): 24px (md), 32px (lg)
- Vertical padding (header bar): 16px top/bottom
- Mobile menu: 24px padding, 16px vertical per link (py-4)

## Breakpoints

- **&lt; 768px**: Mobile — hamburger, full-width drawer menu
- **768px+**: Desktop — inline nav links + Enquire + Theme toggle

## Component states

| Element | Default | Hover | Active | Focus | Disabled |
|---------|---------|--------|--------|--------|----------|
| Nav link | primary-500 / white (dark) | primary-400 / yellow (dark) | opacity 0.9 | 2px ring, offset 2px, --color-focus-ring | N/A |
| Menu button | bg neutral-100, border | bg neutral-200 | scale(0.98) | 2px ring, offset 2px | N/A |
| Enquire (Button) | primary | primary-400, lift | scale(0.98) | 2px ring | opacity 50%, no pointer |
| Theme toggle | surface-raised, border | neutral-200 / white/20 (dark) | scale(0.98) | 2px ring | N/A |

## Accessibility

- **Touch targets**: All interactive elements ≥ 44×44px (--touch-min).
- **Focus**: Visible 2px outline, 2px offset, `--color-focus-ring`. No focus outline on mouse click only (focus-visible).
- **ARIA**: `<header role="banner">`, `<nav aria-label="Main navigation">`, menu button `aria-expanded`, `aria-controls="nav-menu"`, `aria-label="Open menu"` / `"Close menu"`. Mobile panel has `aria-label="Main menu"`.
- **Keyboard**: Escape closes mobile menu; focus trap when menu open (Tab cycles within menu).
- **Contrast**: Nav text on header bg meets WCAG AA (4.5:1). Primary #123811 on white/cream passes.

## Measurements (pixel)

- Header bar min height: 72px
- Logo–nav spacer (desktop): clamp(16rem, 20vw, 24rem)
- Menu icon: 24×24px (wrapper 44×44px)
- Mobile link row: min-height 44px, padding 16px 4px
- Enquire button: min 44×44px (md), 48px height (lg on mobile)

## Dark mode

Trigger: `[data-theme="dark"]` on `<html>`. All header tokens have dark overrides in `tokens.css`. Nav and CTA use `dark:` Tailwind variants where needed.

# Golf Sol Ireland — Whimsy & Motion (Step 5: Whimsy Injector)

Purposeful delight only. Every animation supports usability or emotion; all respect `prefers-reduced-motion`. Sophisticated, not cartoonish.

---

## 1. Timing

| Purpose | Duration | Use |
|---------|----------|-----|
| **Fast (feedback)** | ~150ms | Button active, toggle states |
| **Medium (transitions)** | 200–300ms | Hover lift, colour/opacity, focus |
| **Slow (reveals)** | 500–700ms | Scroll reveal, hero word stagger, focal image |

Current implementation: button active 0.1s; most transitions 0.25s (250ms); reveal 0.7s; hero words 0.6s; hero focal 0.8s.

---

## 2. Interaction moments & purpose

| Element | Motion | Emotional/functional purpose |
|---------|--------|------------------------------|
| **Hero headline words** | Staggered fade-in (0.6s) | Anticipation; guides eye left → right. |
| **Hero subline** | Fade + slide (0.6s, 0.95s delay) | Reinforces headline; feels like a payoff. |
| **Hero subline shimmer** | Gradient sweep (3.5s loop) | Premium, “live” feel without distraction. |
| **Hero focal (circle)** | Scale-in (0.8s, 0.4s delay) | Single visual reward; “this is the moment.” |
| **Hero blobs** | Float + morph + breathe (8s / 10s / 6s) | Organic depth; reinforces “green, living.” |
| **Hero bubble (“Play in the sun!”)** | Pulse (2.2s) | Playful anchor; draws eye to CTA area. |
| **Hero wave** | Float + morph (5–6s) | Soft transition into next section. |
| **Scroll reveal** | Fade + translateY (0.7s) | Content appears as you scroll; reduces overwhelm. |
| **Button hover** | Lift + shadow (0.25s) | Affordance: “this is clickable.” |
| **Button active** | Scale down + flash (0.1s / 0.35s) | Tactile feedback: “I was pressed.” |
| **Card / image hover** | Lift + image zoom (0.4s) | “This card is interactive; peek inside.” |
| **Package step cards** | Hover lift, step number scale, arrow slide | Guides attention to steps; reward on hover. |
| **Step card icon** | Pulse (2s) | Draws eye to “design your package” flow. |
| **Newsletter headline** | Glow pulse + shimmer (2.2s / 4s) | Stands out; “sign up” moment. |
| **Contact pop-in** | Scale + pop (0.6s, stagger) | Reward for reaching contact; “we’re here.” |

---

## 3. prefers-reduced-motion

All of the above are disabled or neutralised when the user has **Reduce motion** enabled (system or browser).

**globals.css** includes a single block (see `src/app/globals.css`):

```css
@media (prefers-reduced-motion: reduce) {
  .hero-focal { animation: none; }
  .reveal { opacity: 1; transform: none; transition: none; }
  .reveal-delay-1, .reveal-delay-2, .reveal-delay-3 { transition-delay: 0s; }
  .blob-animate { animation: none; }
  .hero-headline-word { animation: none; opacity: 1; transform: none; }
  .hero-subline { animation: none; opacity: 1; transform: none; }
  .hero-subline-shine { animation: none; }
  .hero-bubble-pulse { animation: none; }
  .hero-wave-svg, .hero-wave-path, .hero-wave-path-2 { animation: none; }
  .step-card-icon { animation: none; }
  .newsletter-headline-outline { animation: none; }
  .contact-pop-in .contact-pop-line { animation: none; opacity: 1; transform: none; }
  button::after, input[type="submit"]::after, .btn-animated::after { animation: none; }
  html { scroll-behavior: auto; }
  .img-zoom { transition: none; }
  .card-hover:hover .img-zoom, .img-zoom:hover { transform: none; }
}
```

- **Reveal:** With reduced motion, `.reveal` is shown immediately (opacity 1, no transform). Content is visible even if JS never runs.
- **Scroll:** `scroll-behavior: auto` so instant jump instead of smooth scroll.
- **No-JS fallback:** `<html>` has class `no-js` by default; a beforeInteractive script removes it when JS runs. So `.no-js .reveal { opacity: 1; transform: none; }` in globals.css ensures scroll-reveal content is visible when JS is disabled (no dependency on reduced-motion).

---

## 4. Graceful degradation

- **Scroll reveal:** Implemented with Intersection Observer (JS). If JS is disabled, elements with only `.reveal` stay hidden. With `prefers-reduced-motion: reduce`, `.reveal` is forced visible, so content is readable even without JS.
- **Hero:** Word and subline animations are CSS-only; with reduced motion they show at full opacity immediately.
- **No motion-dependent content:** No critical copy or CTAs exist only inside an animation; everything is readable with motion off.

---

## 5. Checklist for new whimsy

When adding motion, ensure:

- [ ] Serves a clear function (feedback, guidance, reward) or emotional beat.
- [ ] Timing: fast (≈150ms) / medium (≈300ms) / slow (≈500ms+) as in section 1.
- [ ] `@media (prefers-reduced-motion: reduce)` disables or simplifies the motion (add to the single block in `globals.css`).
- [ ] Content remains available and usable with motion disabled and, where relevant, without JS.

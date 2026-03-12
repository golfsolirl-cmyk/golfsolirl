# Golf Sol Ireland — Image Prompt Engineer + UI Designer Rules

Single source of truth for sourcing, placing, and implementing photography. Pixel-perfect placement + strong accessibility.

**Context:** Golf Sol Ireland sells **Costa del Sol** golf holidays (Málaga–Gibraltar) to **Irish golfers**. All imagery = Mediterranean Spain. This is NOT an Irish landscape site.

---

## Brand visual rules (never break)

| Rule | Value |
|------|--------|
| **Style** | Golf Digest–level photography meets Mediterranean tourism. Cinematic, never stock. |
| **Palette** | Deep greens (fairway, olive), golden hour gold, cream/sand, soft blue (sea/sky), terracotta/white. **NO** cold grey, **NO** neon. |
| **Mood** | Aspirational, calm, premium. Empty courses or small groups only — no crowded scenes. |
| **Lighting** | Golden hour or late afternoon only. Never midday harsh sun or overcast grey sky. |

---

## Component → image map (code reference)

| Component | Image use | Alt / implementation |
|-----------|-----------|----------------------|
| **Hero.tsx** | Background: full-bleed decorative | `alt=""` |
| | Focal: circular image | `alt="Golf ball on the lip of the hole, Costa del Sol, golden hour."` |
| **RepeatHeadline.tsx** | Main 4:3 + small overlay | Main: "Costa del Sol golf course at golden hour, fairway and sea view." / Overlay: "Golf holiday in the sun, Mediterranean coast." |
| **GolfCourses.tsx** | One card image per course (4:3) | "Costa del Sol golf course, coastal fairway, golden hour." (or variant: coastline and sea view / fairway and greens) |
| **Accommodation** | Card image per property | Use `imageAlt` from `constants.ts` (e.g. "Golf and beach resort, Costa del Sol, pool and sea view.") |
| **HowItWorks.tsx** | Step imagery | Per-step: place + action (e.g. "Costa del Sol golf course, coastal fairway, golden hour.") |
| **Testimonials.tsx** | Author avatar (small circular) | `alt="Avatar for [author], [location]."` |
| **Newsletter.tsx** | Side/background | `alt=""` if purely atmospheric; else "Golf courses and deals for Irish golfers." |
| **ContactSection.tsx** | Supporting visual | "Golf course Costa del Sol — tailor-made holidays for Irish golfers." |

---

## Image dimensions by use

| Use | Aspect ratio | Notes |
|-----|--------------|--------|
| Hero background | 16:9 or full viewport | Full-bleed |
| Hero focal circle | 1:1 | Cropped to circle via `border-radius: 50%` |
| Course cards | 4:3 | `object-fit: cover` |
| Lifestyle / people | 4:5 or 4:3 | |
| Social / avatar | 1:1 | Circular crop |
| Texture / abstract | 3:2 or 1:1 | Often decorative `alt=""` |

---

## AI image prompt library

Use these when generating new assets. **Universal negative prompt:**  
`crowds, people in foreground, cloudy grey sky, winter, snow, neon, cartoon, logo, text, watermark, oversaturated, flat lighting, cold blue tint, overcast, large groups`

### Hero

**Midjourney (v6):**
```
golf ball on the lip of the hole ::1.2, immaculate green ::1, Costa del Sol coastal golf course ::1.2, Mediterranean sea in soft bokeh background ::0.8, golden hour sunlight ::1.2, warm and aspirational mood ::0.8, shallow depth of field 85mm ::1, professional golf photography ::1, deep green fairway cream sand golden light ::1.2 --ar 16:9 --style raw --v 6
```
```
wide landscape empty fairway rolling toward sea ::1.2, Costa del Sol Spain ::1, dramatic sky golden hour ::1.2, single golfer silhouette in distance ::0.6, cinematic mood ::1, shot on medium format ::1, rich greens golden light misty coast ::1.2 --ar 16:9 --style raw --v 6
```

**DALL·E:**  
"A single golf ball resting on the lip of the hole on a perfect green, Costa del Sol golf course, Mediterranean coast blurred in the background, golden hour sunlight, warm and aspirational, professional golf photography, shallow depth of field, deep green and cream and soft gold tones."

### Course card thumbnails (4:3)

**Midjourney:**  
`par 3 hole over water ::1.2, Costa del Sol golf course ::1, turquoise hazard green fairway ::1, late afternoon sun ::1, serene aspirational ::0.8, aerial angle 30 degrees ::1, professional golf course photography ::1, deep green golden hour Mediterranean palette ::1 --ar 4:3 --style raw --v 6`

**DALL·E:**  
"Scenic par 3 golf hole over a turquoise water hazard, Costa del Sol, green fairway and deep blue water, late afternoon sun, serene and aspirational, slight aerial angle, professional golf course photography."

### People / lifestyle (4:5)

**DALL·E:**  
"Four friends on a golf club terrace, Costa del Sol Spain, laughing and relaxed, golden hour backlight, Mediterranean clubhouse in background, candid lifestyle photography, warm skin tones, deep green and cream."

### Clubhouse / accommodation

**DALL·E:**  
"Mediterranean golf clubhouse terrace, white walls and terracotta pots, empty tables with sea view, Costa del Sol, golden hour, peaceful and luxurious, wide angle, travel magazine style, cream white deep green and blue sea."

### Abstract / texture (decorative)

**Midjourney:**  
`close-up putting green grass texture ::1.2, morning dew drops ::1, shallow dof ::1, deep green and cream ::1.2, abstract minimal ::0.8, macro photography ::1, soft natural light ::1 --ar 3:2 --style raw --v 6`  
→ Use `alt=""` when used as background.

---

## Accessibility rules for all images

- **Decorative** (backgrounds, textures, overlays): `alt=""`.
- **Informational**: `alt` = place + mood + subject (e.g. "Costa del Sol golf course, empty fairway and sea view, golden hour.").
- **Avatar**: `alt="Avatar for [name], [location]."`
- **Never omit `alt`** — always include the attribute, even if empty.
- In data: use an `imageAlt` (or equivalent) field per record.

### Ready-to-paste alt text

| Use | Alt |
|-----|-----|
| Hero focal | `alt="Golf ball on the lip of the hole, Costa del Sol, golden hour."` |
| Course card | `alt="Costa del Sol golf course, empty fairway and sea view, golden hour."` |
| Lifestyle terrace | `alt="Friends on golf club terrace, Costa del Sol, golden hour."` |
| Clubhouse | `alt="Mediterranean golf clubhouse terrace with sea view, Costa del Sol."` |
| Grass texture (decorative) | `alt=""` |

---

## Implementation checklist

- [x] All `<Image>` components have explicit `alt` (or `alt={imageAlt}` from data).
- [x] Hero background = decorative → `alt=""`.
- [x] Course / accommodation cards use 4:3 (or aspect-[4/3]) and `object-fit: cover`.
- [x] Hero focal: 1:1 container (320px/420px), circle via `rounded-full`; `priority` for LCP.
- [ ] New assets: generate from prompts above; apply universal negative prompt.
- [x] Constants: `imageAlt` per accommodation in `constants.ts`.

**Audit (current codebase):** Hero, RepeatHeadline, GolfCourses, Accommodation, HowItWorks, Testimonials, Newsletter, ContactSection — alt text and sizing match this doc. Hero background + focal use `priority`; below-fold images rely on default lazy loading.

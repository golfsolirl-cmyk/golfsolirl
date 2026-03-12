# Golf Sol Ireland — AI Image Prompts (Step 7: Image Prompt Engineer)

**Context:** Golf Sol Ireland sells **Costa del Sol** golf holidays (Málaga–Gibraltar) to Irish golfers. Imagery = Mediterranean Spain: coastal courses, golden hour, warm and aspirational. Cohesive set: same colour temperature and style across hero, cards, and social.

**Prompt structure:** [Subject] + [Action/Pose] + [Setting/Location] + [Lighting] + [Mood/Atmosphere] + [Camera/Lens] + [Style] + [Colour Palette] + [Quality]

---

## Brand visual rules

- **Style:** Golf Digest–level golf photography meets Mediterranean tourism. Cinematic, not stock.
- **Colour palette:** Deep greens (fairway, olive), golden hour warmth, cream/sand, soft blue (sea/sky), terracotta/white (architecture). No cold or flat grey.
- **Mood:** Aspirational, calm, premium. Empty or small groups; no crowded scenes.
- **Use:** Hero = full-bleed or circular crop; cards = 4:3; social = 1:1 or 4:5.

---

## 1. Hero images

**Use:** Homepage hero background and/or circular focal image. Wide or medium; works with cream/green overlay.

### Midjourney (v6)

```
golf ball on the lip of the hole ::1.2, immaculate green ::1, Costa del Sol coastal golf course ::1.2, Mediterranean sea in soft bokeh background ::0.8, golden hour sunlight ::1.2, warm and aspirational mood ::0.8, shallow depth of field 85mm ::1, professional golf photography ::1, deep green fairway cream sand golden light ::1.2 --ar 16:9 --style raw --v 6
```

```
wide landscape empty fairway rolling toward sea ::1.2, Costa del Sol Spain ::1, dramatic sky golden hour ::1.2, single golfer silhouette in distance ::0.6, cinematic mood ::1, shot on medium format ::1, rich greens golden light misty coast ::1.2 --ar 16:9 --style raw --v 6
```

### DALL·E (natural language)

**Hero — ball on hole:**  
A single golf ball resting on the lip of the hole on a perfect green, Costa del Sol golf course, Mediterranean coast blurred in the background, golden hour sunlight, warm and aspirational, professional golf photography, shallow depth of field, deep green and cream and soft gold tones.

**Hero — landscape:**  
Wide dramatic landscape of an empty golf fairway rolling down toward the Mediterranean sea, Costa del Sol Spain, golden hour with soft mist, one distant golfer silhouette, cinematic golf magazine style, rich greens and golden light.

### Negative prompt (Stable Diffusion / Midjourney --no)

```
crowds, people in foreground, cloudy grey sky, winter, snow, neon, cartoon, logo, text, watermark, oversaturated, flat lighting, cold blue tint
```

---

## 2. Course thumbnails

**Use:** Golf course cards, “Costa del Sol only” section. 4:3 or 16:9. One strong image per course/card.

### Midjourney

```
par 3 hole over water ::1.2, Costa del Sol golf course ::1, turquoise hazard green fairway ::1, late afternoon sun ::1, serene aspirational ::0.8, aerial angle 30 degrees ::1, professional golf course photography ::1, deep green golden hour Mediterranean palette ::1 --ar 4:3 --style raw --v 6
```

```
golf fairway between olive trees ::1, Mediterranean hills sea in distance ::1.2, golden hour long shadow ::1, empty course premium mood ::0.8, 24mm wide angle ::1, editorial golf photography ::1, warm greens earth tones cream sky ::1.2 --ar 4:3 --style raw --v 6
```

### DALL·E

**Thumbnail — hole over water:**  
Scenic par 3 golf hole over a turquoise water hazard, Costa del Sol, green fairway and deep blue water, late afternoon sun, serene and aspirational, slight aerial angle, professional golf course photography, deep greens and golden hour tones.

**Thumbnail — fairway and olives:**  
Golf fairway winding between old olive trees, Mediterranean hills and sea in the distance, Costa del Sol Spain, golden hour with long shadows, empty course, premium editorial style, warm greens and earth tones.

### Negative prompt

```
crowds, golf carts in foreground, overcast, winter, text, logo, distorted greens, neon colors
```

---

## 3. People photography

**Use:** Testimonials, “how it works”, lifestyle. Relatable golfers; small groups; post-round warmth.

### Midjourney

```
four friends on golf course terrace ::1.2, Costa del Sol Spain ::1, laughing relaxed pose ::1, golden hour backlight ::1, Mediterranean clubhouse behind ::0.8, candid lifestyle photography ::1, warm skin tones deep green and cream ::1.2 --ar 4:5 --style raw --v 6
```

```
golfer walking down fairway carrying bag ::1, Costa del Sol coastal course ::1.2, silhouette or side profile ::0.8, golden hour ::1, solitary aspirational mood ::1, 85mm portrait style ::1, rich green and gold palette ::1 --ar 3:4 --style raw --v 6
```

### DALL·E

**Group — terrace:**  
Four friends on a golf club terrace, Costa del Sol Spain, laughing and relaxed, golden hour backlight, Mediterranean clubhouse in background, candid lifestyle photography, warm skin tones, deep green and cream.

**Solo — fairway:**  
Single golfer walking down a fairway with bag, Costa del Sol coastal course, side profile or soft silhouette, golden hour, solitary and aspirational, 85mm style, rich green and gold tones.

### Negative prompt

```
formal pose, suits, large crowds, winter clothes, overcast, flash photography, cold tones, text
```

---

## 4. Lifestyle shots

**Use:** Accommodation, “after the round”, clubhouse, newsletter or editorial.

### Midjourney

```
Mediterranean golf clubhouse terrace ::1.2, white walls terracotta pots ::1, empty tables sea view ::1, golden hour ::1.2, peaceful luxury mood ::0.8, wide angle 24mm ::1, travel magazine style ::1, cream white deep green blue sea golden light ::1.2 --ar 16:9 --style raw --v 6
```

```
post-round drinks on terrace ::1, two golfers relaxed ::1, Costa del Sol clubhouse ::1, sunset warm light ::1, candid lifestyle ::0.8, 50mm ::1, editorial photography ::1, warm skin tones olive green cream ::1 --ar 4:3 --style raw --v 6
```

### DALL·E

**Clubhouse:**  
Mediterranean golf clubhouse terrace, white walls and terracotta pots, empty tables with sea view, Costa del Sol, golden hour, peaceful and luxurious, wide angle, travel magazine style, cream white deep green and blue sea.

**Post-round:**  
Two golfers with post-round drinks on a terrace, relaxed and smiling, Costa del Sol clubhouse, sunset light, candid lifestyle, editorial photography, warm skin tones and olive green and cream.

### Negative prompt

```
crowded, night club, neon, winter, snow, cold, text, logo
```

---

## 5. Abstract / texture backgrounds

**Use:** Section backgrounds, overlays, subtle patterns. No people; colour and texture only.

### Midjourney

```
close-up putting green grass texture ::1.2, morning dew drops ::1, shallow dof ::1, deep green and cream ::1.2, abstract minimal ::0.8, macro photography ::1, soft natural light ::1 --ar 3:2 --style raw --v 6
```

```
golf flag in hole ::1, soft motion blur ::0.6, fairway bokeh background ::1, golden hour ::1, minimalist mood ::0.8, 85mm ::1, deep green gold cream ::1.2 --ar 1:1 --style raw --v 6
```

### DALL·E

**Grass texture:**  
Close-up texture of putting green grass with morning dew, shallow depth of field, deep green and cream, abstract and minimal, macro photography, soft natural light.

**Flag:**  
Single golf flag in the hole, slight motion blur, fairway blurred in background, golden hour, minimalist, 85mm style, deep green gold and cream.

### Negative prompt

```
people, full course, busy, text, logo, oversaturated
```

---

## 6. Consistency checklist

- **Same lighting:** Prefer golden hour or late afternoon; avoid midday harsh sun or grey overcast.
- **Same palette:** Deep greens, cream/sand, gold, soft blue (sea/sky), terracotta/white. No neon or cold blue.
- **Same mood:** Aspirational, calm, premium. Empty or small groups.
- **Usage:** Note in filenames or CMS: hero, card-4x3, lifestyle, texture. Alt text: describe place and mood (e.g. “Costa del Sol golf course at golden hour, empty fairway and sea view”).

---

## 7. Tool-specific tips

| Tool | Notes |
|------|------|
| **Midjourney** | Use `::weight` to stress subject/location/light. `--ar 16:9` for hero, `--ar 4:3` for cards. `--style raw` for more photographic. |
| **DALL·E** | Natural sentences; include subject, place, time of day, mood, and “professional / editorial / cinematic” for style. |
| **Stable Diffusion** | Use negative prompt block above; keep positive prompt under ~75 tokens for stability. |

---

## 8. Where images go + alt text

Map generated assets to components. Alt text = place + mood (and subject if not obvious). Decorative images use `alt=""`. **Implemented** in codebase: `Hero.tsx`, `RepeatHeadline.tsx`, `GolfCourses.tsx`, `HowItWorks.tsx`, `constants.ts` (ACCOMMODATIONS.imageAlt), `Testimonials.tsx`, `Newsletter.tsx`, `ContactSection.tsx`.

| Component | Image use | Suggested alt (if not decorative) |
|-----------|-----------|-----------------------------------|
| **Hero** (`Hero.tsx`) | Background (decorative), circular focal | Background: `alt=""`. Focal: "Golf ball on the lip of the hole, Costa del Sol, golden hour." |
| **RepeatHeadline** | Main 4:3 + small overlay | "Costa del Sol golf course at golden hour, fairway and sea view." / "Golf holiday in the sun, Mediterranean coast." |
| **GolfCourses** | Course cards (one per card) | "Costa del Sol golf course, coastal fairway, golden hour." |
| **Accommodation** | Card image per accommodation | Use `imageAlt` from data; e.g. "Hotel [name], Costa del Sol, pool and sea view." |
| **HowItWorks** | Step imagery | "Golf and coast — plan your Costa del Sol trip." / per-step alt. |
| **Testimonials** | Author avatar | "Avatar for [author], [location]." |
| **Newsletter** | Side/background | "Golf courses and deals for Irish golfers." or decorative `alt=""` if purely atmospheric. |
| **ContactSection** | Supporting visual | "Golf course Costa del Sol — tailor-made holidays for Irish golfers." |

**Alt text examples (copy-paste ready):**

- Hero focal: `Golf ball on the lip of the hole, Costa del Sol, golden hour.`
- Course card: `Costa del Sol golf course, empty fairway and sea view, golden hour.`
- Lifestyle/terrace: `Friends on golf club terrace, Costa del Sol, golden hour, relaxed.`
- Clubhouse: `Mediterranean golf clubhouse terrace with sea view, Costa del Sol.`
- Texture (if used as bg): `alt=""` (decorative) or `Close-up putting green grass, morning dew, deep green.`

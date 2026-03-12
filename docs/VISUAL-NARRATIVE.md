# Golf Sol Ireland — Visual Narrative (Step 4: Visual Storyteller)

Emotion first, then information. Every section advances the brand story: **thrill of world-class golf → warmth of Irish hospitality → confidence we deliver**.

---

## 1. Emotional narrative by section

| Section | Feeling to evoke | Story beat |
|--------|-------------------|------------|
| **Hero** | Desire + ease | "This is for me — and it's simple." Tailor-made + no hassle. First impression = aspiration (golf in the sun) without overwhelm. |
| **Golf Packages** | Agency + clarity | "I can shape my trip." Four steps = control. Trust that the company handles the rest. |
| **Costa del Sol only** | Expertise + place | "They know this region." One destination = specialist. Irish golfers = "people like me." |
| **Statement** | Confidence + calm | "Sun. Fairways. No hassle." Three words = promise. Short copy = no fine print. |
| **Golf Courses** | Choice + quality | "So many courses — and they're real." Imagery and names build desire. |
| **Accommodation** | Comfort + trust | "I'll stay somewhere good." Hotels/resorts = holiday, not just golf. |
| **How it works** | Simplicity | "A few steps and I'm done." Reduce anxiety about booking. |
| **Testimonials** | Social proof | "Others like me had a great time." |
| **Newsletter** | Insider access | "I'm in the loop." Benefits = exclusivity. |
| **Contact** | Approachability | "I can just ask." One form, one CTA. |

---

## 2. Image / visual strategy

### Hero
- **Purpose:** Stop the scroll. One clear "visual moment": the circular hero image (golf ball / hole or golfer in landscape) as the reward; blobs and overlay support, don't compete.
- **Asset:** Single strong image (golf ball on lip of hole, or wide coastal course at golden hour). Warm, aspirational, uncluttered.
- **Composition:** Full-bleed background with cream/green overlay for legibility. Circular crop for the "hero moment" — focus the eye, then to headline and CTAs.
- **Mood:** Golden hour, warmth, calm excitement. No busy crowds; empty fairway or single ball = premium.

### Costa del Sol (RepeatHeadline)
- **Purpose:** Place + expertise. Editorial collage = crafted, not stock.
- **Assets:** Main = course/coastal (4:3); secondary = detail (golfer, clubhouse, or landscape). Same colour temperature as hero (warm).
- **Composition:** Overlapping tilted frames + badge ("We do the rest!") = human, confident. Avoid symmetry; slight rotation adds energy.

### Statement
- **Purpose:** Pause. No image = emphasis on three words and one short line. Typography and whitespace carry the moment.

### Golf Courses / Accommodation
- **Purpose:** Desire + specificity. One strong image per card; consistent aspect ratio (e.g. 4:3). Alt text and captions support SEO and screen readers; avoid generic "golf course" — name the place or mood.

### General rules
- **Colour temperature:** Warm (golden hour, cream, green). No cold blue unless sea/sky in photo.
- **People:** Use sparingly; when used, happy golfers or relaxed groups, not posed. Irish audience = relatable, not celebrity.
- **Contrast:** Text on imagery always with overlay or panel so contrast meets WCAG AA.

---

## 3. Visual hierarchy (eye flow)

- **Large → medium → small:** Section title (largest) → eyebrow/label → body → CTA.
- **Light → dark:** Cream/light sections alternate with primary green or surface-alt so the page breathes; dark sections = emphasis (e.g. newsletter, footer).
- **Motion → stillness:** Hero uses motion (word reveal, blob float, bubble pulse, subline shimmer); Statement is still. Use motion to pull attention to one moment per section, then let the next section be calmer.

**Hero order:** Eyebrow (script) → H1 (display) → Subline (script, shimmer) → CTAs. Image + bubble = single focal cluster on the right.

---

## 4. Copy direction (complement the visual)

| Element | Direction | Example |
|---------|-----------|---------|
| **Hero eyebrow** | Invitation, not label | "Design your golf package" or "Your golf holiday, your way" |
| **Hero headline** | You + benefit + ease | "Your tailor-made golf holiday" (keep) |
| **Hero subline** | Three short beats | "Costa del Sol only · Irish golfers · No hassle" (keep) |
| **CTAs** | Action + outcome | "Enquire now" / "Design your package" (keep) |
| **Section labels** | One clear idea | "Your tailor-made golf holiday starts here" / "Costa del Sol — only" |
| **Statement** | Three words + one line | "Sun. Fairways. No hassle." + one sentence (keep) |
| **Body** | Short sentences, "you" and "we" | Confident, warm. Avoid jargon. |

Tone: **Professional but warm; aspirational but clear.** Copy should feel like a knowledgeable friend, not a brochure.

---

## 5. Animations and transitions (narrative support)

- **Hero:** Word reveal (stagger) = anticipation. Blob float/morph = organic, living. Bubble pulse = play. Subline shimmer = premium touch. Keep durations subtle (0.6s word, 2–8s blobs) so the page doesn’t feel slow.
- **Sections:** `.reveal` on scroll = content appears as you go; one section = one reveal group so the eye isn’t split.
- **Costa del Sol collage:** Hover on frames (slight rotate/scale) = interactive, crafted. Don’t animate the badge on every scroll — only on hover if at all.
- **Cards (packages, courses, accommodation):** Hover lift + shadow = "this is clickable and valuable." Image zoom (e.g. scale 1.03) = depth.

Respect `prefers-reduced-motion`: reduce or disable blob/bubble and word stagger; keep layout and colour.

---

## 6. Implementation checklist

- [x] Hero: one h1, one focal image cluster, clear hierarchy (eyebrow → headline → subline → CTAs).
- [x] Costa del Sol: editorial collage with clear main + secondary image; badge supports "we do the rest."
- [x] Statement: no image; type and space only.
- [ ] Imagery: replace or add alt text so each image names place/mood (e.g. "Valderrama-style course, Costa del Sol").
- [x] Motion: `prefers-reduced-motion` for all animations (see docs/WHIMSY.md and globals.css).

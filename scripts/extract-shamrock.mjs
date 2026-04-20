import sharp from 'sharp';

/**
 * Extract just the shamrock pixels from the GolfSol Ireland header crest
 * and save as a transparent PNG, then upscale clean.
 *
 * Pixel analysis of source crop showed:
 *   shamrock leaf body  → R≈180, G≈210, B≈5  (G > R, low B)
 *   shamrock highlight  → R≈220, G≈220, B≈5  (G ≈ R, low B)
 *   forest background   → R≈40,  G≈120, B≈0  (very dark, fails brightness)
 *   gold wheat          → R≈248, G≈181, B≈2  (R > G, fails greenness)
 *   ribbon dark         → R≈36,  G≈29,  B≈2  (fails brightness)
 *
 * Mask = bright + green-leaning + low blue.
 */

const SRC = 'public/golfsol-crest-header.png';
const OUT = 'public/shamrock-from-logo.png';

const left = 168, top = 348, width = 70, height = 80;

const { data, info } = await sharp(SRC)
  .extract({ left, top, width, height })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = info.width, h = info.height;
const out = Buffer.from(data);

for (let i = 0; i < out.length; i += 4) {
  const r = out[i], g = out[i + 1], b = out[i + 2];
  const brightness = r + g + b;
  const greenLean = g - r;        // > 0 → green leaf, < 0 → gold wheat
  const lowBlue = b < 70;

  // Keep ONLY pixels where green dominates red (the lime-green shamrock).
  // Gold wheat has R >> G so will be rejected by `greenLean > 5`.
  // Forest background fails brightness > 320.
  const keep =
    lowBlue &&
    brightness > 320 &&
    greenLean > 5 &&
    g > 150;

  if (!keep) {
    out[i + 3] = 0;
  }
}

const baseBuf = await sharp(out, { raw: { width: w, height: h, channels: 4 } })
  .png()
  .toBuffer();

// Trim transparent borders, then upscale 4x with smooth interpolation,
// then write the clean shamrock.
const trimmed = await sharp(baseBuf).trim({ threshold: 5 }).toBuffer();
const trimmedMeta = await sharp(trimmed).metadata();
console.log('trimmed:', trimmedMeta.width, 'x', trimmedMeta.height);

await sharp(trimmed)
  .resize({
    width: trimmedMeta.width * 6,
    kernel: sharp.kernel.lanczos3
  })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log('final:', meta.width, 'x', meta.height);

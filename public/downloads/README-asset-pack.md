# GolfSol Ireland — Social Media Asset Pack

## Download

**ZIP:** [`golfsol-ireland-asset-pack.zip`](./golfsol-ireland-asset-pack.zip)

## Quality sources (v2)

Exports are built from:

- **Hero / covers / post:** `public/images/88054e80-6dd1-483f-8557-cdc45caa2442.png` (1672×941 — branded fleet + golf course)
- **Logo:** `public/golfsol-crest-brand.png` (transparent PNG)

The ChatGPT layout sheet (`assets/golfsol-brand-asset-sheet.png`) is only **1024×682** and must not be used for final exports.

## Regenerate

```bash
node scripts/generate-brand-asset-pack.mjs
```

## Limits

- **Vehicle PNGs** are tight crops from the hero photo (not cut-out isolations). For print-quality isolated vans, you need separate studio shots or a background-removal pass.
- **Maximum sharpness** for banners is capped by the 1672px-wide hero source. For 4K masters, re-export the original design at full resolution and rerun the script.

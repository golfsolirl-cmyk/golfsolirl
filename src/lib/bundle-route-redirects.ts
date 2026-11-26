/**
 * Old package / option URLs fold into the single golf holiday bundles structure.
 * Keys are normalised paths (no trailing slash).
 */
/**
 * Hub aliases only. Keep SEO package landings (3/5/7-night, society, group)
 * as real GeContentPage routes — do not redirect those away from crawlable HTML.
 */
export const BUNDLE_ROUTE_REDIRECTS: Readonly<Record<string, string>> = {
  '/packages': '/bundles',
  '/package': '/bundles',
  '/golf-packages': '/bundles',
  '/golf-packages/4-night-golf-breaks': '/golf-packages/3-night-golf-breaks',
  '/golf-packages/bespoke-golf-packages': '/contact',
  '/incentive-packages': '/bundles',
  '/accommodation-tiers': '/bundles'
}

export function bundleRedirectForPath(path: string): string | null {
  return BUNDLE_ROUTE_REDIRECTS[path] ?? null
}

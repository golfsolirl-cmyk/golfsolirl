/**
 * Old package / option URLs fold into the single golf holiday bundles structure.
 * Keys are normalised paths (no trailing slash).
 */
export const BUNDLE_ROUTE_REDIRECTS: Readonly<Record<string, string>> = {
  '/packages': '/bundles',
  '/package': '/bundles',
  '/golf-packages': '/bundles',
  '/golf-packages/3-night-golf-breaks': '/bundles#3-night',
  '/golf-packages/4-night-golf-breaks': '/bundles#3-night',
  '/golf-packages/5-night-golf-holidays': '/bundles#5-night',
  '/golf-packages/7-night-golf-holidays': '/bundles#7-night',
  '/golf-packages/golf-society-packages': '/bundles',
  '/golf-packages/group-golf-holidays': '/bundles',
  '/golf-packages/bespoke-golf-packages': '/contact',
  '/incentive-packages': '/bundles',
  '/accommodation-tiers': '/bundles'
}

export function bundleRedirectForPath(path: string): string | null {
  return BUNDLE_ROUTE_REDIRECTS[path] ?? null
}

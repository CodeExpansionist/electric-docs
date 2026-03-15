/**
 * Centralized constants for domain references and CDN URLs.
 * All external domain strings should be defined here to avoid
 * scattered hardcoded URLs throughout the codebase.
 */

/** The site's own canonical URL (for SEO, meta tags, JSON-LD) */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Standard delivery cost when order is below free delivery threshold */
export const DEFAULT_DELIVERY_FEE = 3.99;

/** Next-day delivery pricing */
export const NEXT_DAY_ALL_DAY = 5.99;
export const NEXT_DAY_WEEKDAY_SLOT = 9.99;
export const NEXT_DAY_WEEKEND_ALL_DAY = 6.99;
export const NEXT_DAY_WEEKEND_SLOT = 10.99;

/** Order subtotal at or above which delivery is free */
export const FREE_DELIVERY_THRESHOLD = 40;

/**
 * Rewrite scraped/legacy internal links that point to pages this clone
 * doesn't implement yet.  Maps to the closest existing route.
 */
const LINK_REWRITES: [RegExp, string][] = [
  // Old .html-style service URLs → clean service routes
  [/^\/services\/ways-to-pay\/trade-in\.html/, "/services/price-promise"],
  [/^\/services\/expert-advice\/shoplive\.html/, "/services/shoplive"],
  [/^\/services\/shopping-with-us\/price-promise\.html/, "/services/price-promise"],
  [/^\/services\/shopping-with-us\/returns-refunds\.html/, "/services/returns"],
  [/^\/services\/care-services\/care-repair\.html/, "/services/instant-replacement"],
  [/^\/services\/care-and-repair\/instant-replacement\.html/, "/services/instant-replacement"],
  [/^\/services\/care-and-repair\/mobile-insurance\.html/, "/services/tablet-insurance"],
  [/^\/services\/care-and-repair\/tablet-insurance\.html/, "/services/tablet-insurance"],
  [/^\/services\/care-and-repair\.html/, "/services/instant-replacement"],
  [/^\/services\/delivery-installation\/.*/, "/services/delivery"],
  [/^\/services\/our-experts-love\.html/, "/services/shoplive"],
  [/^\/services\/shoplive\.html/, "/services/shoplive"],
  // Deals pages → TV & Audio hub
  [/^\/deals-on-tv-and-audio\//, "/tv-and-audio"],
  [/^\/deals-on-appliances\//, "/tv-and-audio"],
  [/^\/deals-on-computing\//, "/tv-and-audio"],
  [/^\/deals-on-phones\//, "/tv-and-audio"],
  [/^\/deals-on-gaming\//, "/tv-and-audio"],
  [/^\/deals-on-smart-tech\//, "/tv-and-audio"],
  // Brand landing pages
  [/^\/brand\//, "/tv-and-audio"],
  // Out-of-scope categories
  [/^\/computing\//, "/tv-and-audio"],
  [/^\/phones\//, "/tv-and-audio"],
  // Buying guides → techtalk
  [/^\/buying-guides\//, "/techtalk"],
  // Techtalk sub-pages
  [/^\/techtalk\/tv-advice/, "/techtalk"],
  [/^\/techtalk\/audio/, "/techtalk"],
  // Misc
  [/^\/store-finder/, "/contact-us"],
  [/^\/loved-by-electriz\//, "/tv-and-audio"],
];

export function sanitizeInternalLink(path: string): string {
  for (const [pattern, replacement] of LINK_REWRITES) {
    if (pattern.test(path)) return replacement;
  }
  return path;
}

/**
 * Strip the external domain from scraped URLs to make them relative,
 * then rewrite any known-broken paths to working alternatives.
 */
export function stripDomain(url: string): string {
  const relative = url
    .replace("https://www.electriz.co.uk", "")
    .replace("https://www.currys.co.uk", "");
  return sanitizeInternalLink(relative);
}

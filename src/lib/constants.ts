/**
 * Centralized constants for domain references and CDN URLs.
 * All external domain strings should be defined here to avoid
 * scattered hardcoded URLs throughout the codebase.
 */

/** The site's own canonical URL (for SEO, meta tags, JSON-LD) */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";


/**
 * Strip the external domain from scraped URLs to make them relative.
 * Scraped JSON data may contain full domain URLs — this converts
 * them to relative paths for internal routing.
 */
export function stripDomain(url: string): string {
  return url
    .replace("https://www.electriz.co.uk", "")
    .replace("https://www.currys.co.uk", "");
}

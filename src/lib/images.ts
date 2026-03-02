/**
 * Maps product image identifiers to local paths.
 * For the MVP we downloaded Curry's product images locally instead of
 * sourcing them directly from the CDN.
 */

const localImages: Record<string, string> = {
  // Samsung S90F gallery images
  "10282706": "/images/products/samsung-s90f-main.jpg",
  "10282706_000": "/images/products/samsung-s90f-alt1.jpg",
  "10282706_001": "/images/products/samsung-s90f-alt2.jpg",
  "10282706_002": "/images/products/samsung-s90f-alt3.jpg",
  "10282706_003": "/images/products/samsung-s90f-alt4.jpg",
  "10282706_004": "/images/products/samsung-s90f-alt5.jpg",
  "10282706_005": "/images/products/samsung-s90f-alt6.jpg",
  "10282706_006": "/images/products/samsung-s90f-alt7.jpg",
};

const thumbImages: Record<string, string> = {
  "10282706": "/images/products/samsung-s90f-thumb-main.jpg",
  "10282706_000": "/images/products/samsung-s90f-thumb1.jpg",
  "10282706_001": "/images/products/samsung-s90f-thumb2.jpg",
  "10282706_002": "/images/products/samsung-s90f-thumb3.jpg",
  "10282706_003": "/images/products/samsung-s90f-thumb4.jpg",
  "10282706_004": "/images/products/samsung-s90f-thumb5.jpg",
  "10282706_005": "/images/products/samsung-s90f-thumb6.jpg",
};

/**
 * Convert a Curry's CDN image URL to a local path.
 * Falls back to the original URL if no local mapping exists.
 */
export function toLocalImage(cdnUrl: string): string {
  // Extract the product ID from the CDN URL
  // URL format: https://media.currys.biz/i/currysprod/10282706_003?$l-large$&fmt=auto
  const match = cdnUrl.match(/currysprod\/(\d+(?:_\d+)?)\?/);
  if (match) {
    const id = match[1];
    // Check if it's a thumbnail URL
    if (cdnUrl.includes("$t-thumbnail$")) {
      return thumbImages[id] || localImages[id] || cdnUrl;
    }
    return localImages[id] || cdnUrl;
  }
  return cdnUrl;
}

/**
 * Convert an array of CDN URLs to local paths.
 */
export function toLocalImages(cdnUrls: string[]): string[] {
  return cdnUrls.map(toLocalImage);
}

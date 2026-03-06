/**
 * Maps product CDN image URLs to local paths.
 * Convention-based: /images/products/{productId}/{type}.webp
 *
 * Types:
 *   main.webp         - listing image ($g-small$ transform)
 *   large.webp        - gallery main ($l-large$)
 *   gallery_001.webp  - gallery variant 1 ($l-large$ variant)
 *   thumb.webp        - thumbnail ($t-thumbnail$)
 *   thumb_001.webp    - thumbnail variant 1
 */

/**
 * Convert an Electriz CDN image URL to a local path.
 * Falls back to the original URL if no local mapping can be derived.
 */
export function toLocalImage(cdnUrl: string): string {
  if (!cdnUrl) return cdnUrl;

  // Extract product ID and variant from scraped CDN URL patterns.
  // Matches both legacy (currysprod) and current (electrizprod) data formats.
  // Standard:  ...prod/{id}?$transform$
  // Variant:   ...prod/{id}_{003}?$transform$
  // M-prefix:  ...prod/M{id}_{color}?$transform$
  const match = cdnUrl.match(/(?:currysprod|electrizprod)\/M?(\d{7,8})(?:_[a-zA-Z]+)?(?:_(\d{3}))?\?/);
  if (!match) return cdnUrl;

  const productId = match[1];
  const variant = match[2]; // e.g., "001", "002", or undefined

  // Determine image type from the transform token
  const isThumbnail = cdnUrl.includes("$t-thumbnail$");
  const isSmall = cdnUrl.includes("$g-small$") || cdnUrl.includes("$s-swatch$");

  let filename: string;
  if (isThumbnail) {
    filename = variant ? `thumb_${variant}.webp` : "thumb.webp";
  } else if (isSmall) {
    filename = "main.webp";
  } else {
    // Large / gallery
    filename = variant ? `gallery_${variant}.webp` : "large.webp";
  }

  return `/images/products/${productId}/${filename}`;
}

/**
 * Convert an array of CDN URLs to local paths.
 */
export function toLocalImages(cdnUrls: string[]): string[] {
  return cdnUrls.map(toLocalImage);
}

/**
 * Extract sort key from a CDN image URL based on its variant suffix.
 * Base image (no suffix) = 0, _001 = 1, _002 = 2, etc.
 * Non-standard URLs (video frames, etc.) sort last.
 */
export function getImageSortKey(cdnUrl: string): number {
  const match = cdnUrl.match(/(?:currysprod|electrizprod)\/M?\d{7,8}(?:_[a-zA-Z]+)?(?:_(\d{3}))?\?/);
  if (!match) return 9999;
  return match[1] ? parseInt(match[1], 10) : 0;
}

/**
 * Get the local listing image path for a product ID.
 */
export function getListingImage(productId: string): string {
  return `/images/products/${productId}/main.webp`;
}

/**
 * Get the local large image path for a product ID.
 */
export function getLargeImage(productId: string): string {
  return `/images/products/${productId}/large.webp`;
}

/**
 * Build gallery image paths for a product (main + variants).
 * Generates paths for up to `count` gallery variants.
 */
export function getGalleryImages(productId: string, count = 6): string[] {
  const images = [`/images/products/${productId}/large.webp`];
  for (let i = 1; i <= count; i++) {
    images.push(`/images/products/${productId}/gallery_${String(i).padStart(3, "0")}.webp`);
  }
  return images;
}

/**
 * Build thumbnail image paths for a product (main + variants).
 */
export function getThumbnailImages(productId: string, count = 6): string[] {
  const thumbs = [`/images/products/${productId}/thumb.webp`];
  for (let i = 1; i <= count; i++) {
    thumbs.push(`/images/products/${productId}/thumb_${String(i).padStart(3, "0")}.webp`);
  }
  return thumbs;
}

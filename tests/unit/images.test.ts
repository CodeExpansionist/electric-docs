import { describe, it, expect } from "vitest";
import {
  toLocalImage,
  getImageSortKey,
  getListingImage,
  getGalleryImages,
  getThumbnailImages,
  PLACEHOLDER_IMAGE,
} from "@/lib/images";

describe("PLACEHOLDER_IMAGE", () => {
  it("points to a local SVG path", () => {
    expect(PLACEHOLDER_IMAGE).toBe("/images/placeholder-product.svg");
  });
});

describe("toLocalImage", () => {
  it("converts standard CDN URL with $g-small$ to main.webp", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890?$g-small$";
    expect(toLocalImage(url)).toBe("/images/products/10267890/main.webp");
  });

  it("converts CDN URL with $l-large$ to large.webp", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890?$l-large$";
    expect(toLocalImage(url)).toBe("/images/products/10267890/large.webp");
  });

  it("converts CDN URL with variant suffix to gallery_NNN.webp", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890_003?$l-large$";
    expect(toLocalImage(url)).toBe("/images/products/10267890/gallery_003.webp");
  });

  it("converts $t-thumbnail$ to thumb.webp", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890?$t-thumbnail$";
    expect(toLocalImage(url)).toBe("/images/products/10267890/thumb.webp");
  });

  it("converts thumbnail with variant to thumb_NNN.webp", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890_002?$t-thumbnail$";
    expect(toLocalImage(url)).toBe("/images/products/10267890/thumb_002.webp");
  });

  it("handles legacy currysprod URLs", () => {
    const url = "https://media.currysprod.com/i/currysprod/10267890?$g-small$";
    expect(toLocalImage(url)).toBe("/images/products/10267890/main.webp");
  });

  it("handles M-prefix Amplience URLs", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/M10267890_black?$g-small$";
    expect(toLocalImage(url)).toBe("/images/products/10267890/main.webp");
  });

  it("passes through already-local paths", () => {
    expect(toLocalImage("/images/products/123/main.webp")).toBe("/images/products/123/main.webp");
  });

  it("returns empty string for unrecognised non-local URLs", () => {
    expect(toLocalImage("https://example.com/random-image.jpg")).toBe("");
  });

  it("handles empty/falsy input", () => {
    expect(toLocalImage("")).toBe("");
  });

  it("handles $s-swatch$ as small/main", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890?$s-swatch$";
    expect(toLocalImage(url)).toBe("/images/products/10267890/main.webp");
  });
});

describe("getImageSortKey", () => {
  it("returns 0 for base image (no variant suffix)", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890?$l-large$";
    expect(getImageSortKey(url)).toBe(0);
  });

  it("returns variant number for suffixed images", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890_003?$l-large$";
    expect(getImageSortKey(url)).toBe(3);
  });

  it("returns 9999 for unrecognised URLs", () => {
    expect(getImageSortKey("https://example.com/video.mp4")).toBe(9999);
  });
});

describe("getListingImage", () => {
  it("returns the main.webp path for a product ID", () => {
    expect(getListingImage("10267890")).toBe("/images/products/10267890/main.webp");
  });
});

describe("getGalleryImages", () => {
  it("returns large + N gallery variants", () => {
    const images = getGalleryImages("10267890", 3);
    expect(images).toEqual([
      "/images/products/10267890/large.webp",
      "/images/products/10267890/gallery_001.webp",
      "/images/products/10267890/gallery_002.webp",
      "/images/products/10267890/gallery_003.webp",
    ]);
  });

  it("defaults to 6 variants", () => {
    expect(getGalleryImages("123")).toHaveLength(7); // 1 large + 6 variants
  });
});

describe("getThumbnailImages", () => {
  it("returns thumb + N thumbnail variants", () => {
    const thumbs = getThumbnailImages("10267890", 3);
    expect(thumbs).toEqual([
      "/images/products/10267890/thumb.webp",
      "/images/products/10267890/thumb_001.webp",
      "/images/products/10267890/thumb_002.webp",
      "/images/products/10267890/thumb_003.webp",
    ]);
  });

  it("defaults to 6 variants", () => {
    expect(getThumbnailImages("123")).toHaveLength(7);
  });
});

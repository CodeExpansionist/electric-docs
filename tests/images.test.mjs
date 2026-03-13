import { describe, it } from "node:test";
import assert from "node:assert/strict";

const {
  toLocalImage,
  getImageSortKey,
  getListingImage,
  getGalleryImages,
  getThumbnailImages,
  PLACEHOLDER_IMAGE,
} = await import("../.test-build/lib/images.js");

describe("PLACEHOLDER_IMAGE", () => {
  it("points to a local SVG path", () => {
    assert.equal(PLACEHOLDER_IMAGE, "/images/placeholder-product.svg");
  });
});

describe("toLocalImage", () => {
  it("converts standard CDN URL with $g-small$ to main.webp", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890?$g-small$";
    assert.equal(toLocalImage(url), "/images/products/10267890/main.webp");
  });

  it("converts CDN URL with $l-large$ to large.webp", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890?$l-large$";
    assert.equal(toLocalImage(url), "/images/products/10267890/large.webp");
  });

  it("converts CDN URL with variant suffix to gallery_NNN.webp", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890_003?$l-large$";
    assert.equal(toLocalImage(url), "/images/products/10267890/gallery_003.webp");
  });

  it("converts $t-thumbnail$ to thumb.webp", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890?$t-thumbnail$";
    assert.equal(toLocalImage(url), "/images/products/10267890/thumb.webp");
  });

  it("converts thumbnail with variant to thumb_NNN.webp", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890_002?$t-thumbnail$";
    assert.equal(toLocalImage(url), "/images/products/10267890/thumb_002.webp");
  });

  it("handles legacy currysprod URLs", () => {
    const url = "https://media.currysprod.com/i/currysprod/10267890?$g-small$";
    assert.equal(toLocalImage(url), "/images/products/10267890/main.webp");
  });

  it("handles M-prefix Amplience URLs", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/M10267890_black?$g-small$";
    assert.equal(toLocalImage(url), "/images/products/10267890/main.webp");
  });

  it("passes through already-local paths", () => {
    assert.equal(toLocalImage("/images/products/123/main.webp"), "/images/products/123/main.webp");
  });

  it("returns empty string for unrecognised non-local URLs", () => {
    assert.equal(toLocalImage("https://example.com/random-image.jpg"), "");
  });

  it("handles empty/falsy input", () => {
    assert.equal(toLocalImage(""), "");
  });

  it("handles $s-swatch$ as small/main", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890?$s-swatch$";
    assert.equal(toLocalImage(url), "/images/products/10267890/main.webp");
  });
});

describe("getImageSortKey", () => {
  it("returns 0 for base image (no variant suffix)", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890?$l-large$";
    assert.equal(getImageSortKey(url), 0);
  });

  it("returns variant number for suffixed images", () => {
    const url = "https://media.electrizprod.com/i/electrizprod/10267890_003?$l-large$";
    assert.equal(getImageSortKey(url), 3);
  });

  it("returns 9999 for unrecognised URLs", () => {
    assert.equal(getImageSortKey("https://example.com/video.mp4"), 9999);
  });
});

describe("getListingImage", () => {
  it("returns the main.webp path for a product ID", () => {
    assert.equal(getListingImage("10267890"), "/images/products/10267890/main.webp");
  });
});

describe("getGalleryImages", () => {
  it("returns large + N gallery variants", () => {
    const images = getGalleryImages("10267890", 3);
    assert.deepEqual(images, [
      "/images/products/10267890/large.webp",
      "/images/products/10267890/gallery_001.webp",
      "/images/products/10267890/gallery_002.webp",
      "/images/products/10267890/gallery_003.webp",
    ]);
  });

  it("defaults to 6 variants", () => {
    assert.equal(getGalleryImages("123").length, 7);
  });
});

describe("getThumbnailImages", () => {
  it("returns thumb + N thumbnail variants", () => {
    const thumbs = getThumbnailImages("10267890", 3);
    assert.deepEqual(thumbs, [
      "/images/products/10267890/thumb.webp",
      "/images/products/10267890/thumb_001.webp",
      "/images/products/10267890/thumb_002.webp",
      "/images/products/10267890/thumb_003.webp",
    ]);
  });

  it("defaults to 6 variants", () => {
    assert.equal(getThumbnailImages("123").length, 7);
  });
});

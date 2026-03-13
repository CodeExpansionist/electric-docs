import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { stripDomain, DEFAULT_DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, SITE_URL } =
  await import("../.test-build/lib/constants.js");

describe("stripDomain", () => {
  it("strips electriz.co.uk domain from URL", () => {
    assert.equal(stripDomain("https://www.electriz.co.uk/tv-and-audio"), "/tv-and-audio");
  });

  it("strips currys.co.uk domain from URL", () => {
    assert.equal(stripDomain("https://www.currys.co.uk/tv-and-audio"), "/tv-and-audio");
  });

  it("leaves relative URLs unchanged", () => {
    assert.equal(stripDomain("/tv-and-audio/tvs"), "/tv-and-audio/tvs");
  });

  it("leaves unrecognised domains unchanged", () => {
    assert.equal(stripDomain("https://www.example.com/page"), "https://www.example.com/page");
  });

  it("handles empty string", () => {
    assert.equal(stripDomain(""), "");
  });
});

describe("delivery constants", () => {
  it("DEFAULT_DELIVERY_FEE is 5", () => {
    assert.equal(DEFAULT_DELIVERY_FEE, 5);
  });

  it("FREE_DELIVERY_THRESHOLD is 40", () => {
    assert.equal(FREE_DELIVERY_THRESHOLD, 40);
  });

  it("threshold is greater than delivery fee", () => {
    assert.ok(FREE_DELIVERY_THRESHOLD > DEFAULT_DELIVERY_FEE);
  });
});

describe("SITE_URL", () => {
  it("has a default value when env is not set", () => {
    assert.ok(SITE_URL);
    assert.equal(typeof SITE_URL, "string");
  });
});

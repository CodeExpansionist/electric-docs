import { describe, it, expect } from "vitest";
import { stripDomain, DEFAULT_DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, SITE_URL } from "@/lib/constants";

describe("stripDomain", () => {
  it("strips electriz.co.uk domain from URL", () => {
    expect(stripDomain("https://www.electriz.co.uk/tv-and-audio")).toBe("/tv-and-audio");
  });

  it("strips currys.co.uk domain from URL", () => {
    expect(stripDomain("https://www.currys.co.uk/tv-and-audio")).toBe("/tv-and-audio");
  });

  it("leaves relative URLs unchanged", () => {
    expect(stripDomain("/tv-and-audio/tvs")).toBe("/tv-and-audio/tvs");
  });

  it("leaves unrecognised domains unchanged", () => {
    expect(stripDomain("https://www.example.com/page")).toBe("https://www.example.com/page");
  });

  it("handles empty string", () => {
    expect(stripDomain("")).toBe("");
  });
});

describe("delivery constants", () => {
  it("DEFAULT_DELIVERY_FEE is 5", () => {
    expect(DEFAULT_DELIVERY_FEE).toBe(5);
  });

  it("FREE_DELIVERY_THRESHOLD is 40", () => {
    expect(FREE_DELIVERY_THRESHOLD).toBe(40);
  });

  it("threshold is greater than delivery fee", () => {
    expect(FREE_DELIVERY_THRESHOLD).toBeGreaterThan(DEFAULT_DELIVERY_FEE);
  });
});

describe("SITE_URL", () => {
  it("has a default value when env is not set", () => {
    expect(SITE_URL).toBeTruthy();
    expect(typeof SITE_URL).toBe("string");
  });
});

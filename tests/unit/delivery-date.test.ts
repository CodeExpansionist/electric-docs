import { describe, it, expect } from "vitest";
import { formatDeliveryDate, getNextDeliveryDate } from "../../src/lib/delivery-date";

describe("formatDeliveryDate", () => {
  it("formats a known date correctly", () => {
    // 15 Mar 2026 is a Sunday
    const date = new Date(2026, 2, 15);
    const result = formatDeliveryDate(date);
    expect(result).toContain("Sun");
    expect(result).toContain("15");
    expect(result).toContain("Mar");
  });

  it("returns a non-empty string", () => {
    const date = new Date(2026, 0, 1);
    const result = formatDeliveryDate(date);
    expect(result.length).toBeGreaterThan(0);
  });

  it("formats a weekday date correctly", () => {
    // 16 Mar 2026 is a Monday
    const date = new Date(2026, 2, 16);
    const result = formatDeliveryDate(date);
    expect(result).toContain("Mon");
    expect(result).toContain("16");
    expect(result).toContain("Mar");
  });
});

describe("getNextDeliveryDate", () => {
  it("returns a Date object", () => {
    const result = getNextDeliveryDate();
    expect(result).toBeInstanceOf(Date);
  });

  it("returns a date in the future", () => {
    const now = new Date();
    const result = getNextDeliveryDate();
    expect(result.getTime()).toBeGreaterThan(now.getTime());
  });

  it("never returns a Sunday", () => {
    const result = getNextDeliveryDate();
    expect(result.getDay()).not.toBe(0);
  });
});

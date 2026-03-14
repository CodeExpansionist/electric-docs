import { describe, it, expect } from "vitest";
import {
  luhnCheck,
  getCardType,
  formatCardNumber,
  formatExpiry,
} from "../../src/lib/payment-utils";

describe("luhnCheck", () => {
  it("returns true for a valid Visa number", () => {
    expect(luhnCheck("4111111111111111")).toBe(true);
  });

  it("returns false for an invalid number", () => {
    expect(luhnCheck("1234567890123456")).toBe(false);
  });
});

describe("getCardType", () => {
  it("detects Visa", () => {
    expect(getCardType("4111111111111111")).toBe("Visa");
  });

  it("detects Mastercard starting with 5", () => {
    expect(getCardType("5500000000000004")).toBe("Mastercard");
  });

  it("detects Mastercard starting with 2", () => {
    expect(getCardType("2221000000000000")).toBe("Mastercard");
  });

  it("detects Amex", () => {
    expect(getCardType("378282246310005")).toBe("Amex");
  });

  it("returns null for unknown prefix", () => {
    expect(getCardType("9999999999999999")).toBeNull();
  });
});

describe("formatCardNumber", () => {
  it("groups 16 digits into 4-digit blocks", () => {
    expect(formatCardNumber("4111111111111111")).toBe("4111 1111 1111 1111");
  });

  it("handles partial input", () => {
    expect(formatCardNumber("41111")).toBe("4111 1");
  });

  it("strips non-digit characters before formatting", () => {
    expect(formatCardNumber("4111-1111-1111-1111")).toBe(
      "4111 1111 1111 1111"
    );
  });

  it("truncates beyond 16 digits", () => {
    expect(formatCardNumber("41111111111111119999")).toBe(
      "4111 1111 1111 1111"
    );
  });
});

describe("formatExpiry", () => {
  it("formats a full 4-digit expiry", () => {
    expect(formatExpiry("1228")).toBe("12/28");
  });

  it("returns single digit as-is", () => {
    expect(formatExpiry("1")).toBe("1");
  });

  it("inserts slash after 2 digits", () => {
    expect(formatExpiry("12")).toBe("12/");
  });

  it("handles 3 digits", () => {
    expect(formatExpiry("122")).toBe("12/2");
  });

  it("strips non-digit characters", () => {
    expect(formatExpiry("12/28")).toBe("12/28");
  });
});

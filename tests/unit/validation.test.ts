import { describe, it, expect } from "vitest";
import { isValidUKPostcode, isValidUKPhone } from "../../src/lib/validation";

describe("isValidUKPostcode", () => {
  it("accepts standard UK postcodes with space", () => {
    expect(isValidUKPostcode("SW1A 1AA")).toBe(true);
    expect(isValidUKPostcode("EC1A 1BB")).toBe(true);
    expect(isValidUKPostcode("W1A 0AX")).toBe(true);
    expect(isValidUKPostcode("M1 1AE")).toBe(true);
  });

  it("accepts postcode without space", () => {
    expect(isValidUKPostcode("SW1A1AA")).toBe(true);
  });

  it("accepts lowercase postcodes", () => {
    expect(isValidUKPostcode("sw1a 1aa")).toBe(true);
  });

  it("rejects numeric-only strings", () => {
    expect(isValidUKPostcode("12345")).toBe(false);
  });

  it("rejects alpha-only strings", () => {
    expect(isValidUKPostcode("ABCDE")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidUKPostcode("")).toBe(false);
  });

  it("rejects reversed format", () => {
    expect(isValidUKPostcode("123 ABC")).toBe(false);
  });
});

describe("isValidUKPhone", () => {
  it("accepts landline with spaces", () => {
    expect(isValidUKPhone("020 7946 0958")).toBe(true);
  });

  it("accepts mobile with spaces", () => {
    expect(isValidUKPhone("07700 900123")).toBe(true);
  });

  it("accepts +44 prefix", () => {
    expect(isValidUKPhone("+44 7700 900123")).toBe(true);
  });

  it("rejects too-short numbers", () => {
    expect(isValidUKPhone("0123")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidUKPhone("")).toBe(false);
  });

  it("rejects alphabetic input", () => {
    expect(isValidUKPhone("abc")).toBe(false);
  });
});

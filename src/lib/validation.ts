/** UK postcode regex — matches formats like SW1A 1AA, EC1A 1BB, W1A 0AX */
const UK_POSTCODE_RE =
  /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

/** UK phone — starts with 0 or +44, 10-11 digits total */
const UK_PHONE_RE =
  /^(?:(?:\+44\s?|0)\d{4}\s?\d{6}|\(?0\d{4}\)?\s?\d{6}|(?:\+44\s?|0)\d{3}\s?\d{3}\s?\d{4}|\(?0\d{3}\)?\s?\d{3}\s?\d{4}|(?:\+44\s?|0)\d{2}\s?\d{4}\s?\d{4}|\(?0\d{2}\)?\s?\d{4}\s?\d{4}|(?:\+44\s?|0)\d{10})$/;

/** Basic email format check */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidUKPostcode(value: string): boolean {
  return UK_POSTCODE_RE.test(value.trim());
}

export function isValidUKPhone(value: string): boolean {
  const digits = value.replace(/[\s\-()]/g, "");
  // Must have between 10-13 chars (including +44 prefix)
  if (digits.length < 10 || digits.length > 13) return false;
  return UK_PHONE_RE.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/**
 * Luhn algorithm — validates credit card numbers.
 * Strips spaces and dashes, then checks the checksum.
 */
export function isValidCardNumber(value: string): boolean {
  const digits = value.replace(/[\s-]/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;

  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

/**
 * Validates MM/YY expiry — must be a future date.
 */
export function isValidExpiry(value: string): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const expiry = new Date(year, month); // first day of month AFTER expiry
  return expiry > now;
}

/**
 * Validates CVV — 3 or 4 digits.
 */
export function isValidCVV(value: string): boolean {
  return /^\d{3,4}$/.test(value.trim());
}

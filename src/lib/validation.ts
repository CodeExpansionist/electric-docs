/** UK postcode regex — matches formats like SW1A 1AA, EC1A 1BB, W1A 0AX */
const UK_POSTCODE_RE =
  /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

/** UK phone — starts with 0 or +44, 10-11 digits total */
const UK_PHONE_RE =
  /^(?:(?:\+44\s?|0)\d{4}\s?\d{6}|\(?0\d{4}\)?\s?\d{6}|(?:\+44\s?|0)\d{3}\s?\d{3}\s?\d{4}|\(?0\d{3}\)?\s?\d{3}\s?\d{4}|(?:\+44\s?|0)\d{2}\s?\d{4}\s?\d{4}|\(?0\d{2}\)?\s?\d{4}\s?\d{4}|(?:\+44\s?|0)\d{10})$/;

export function isValidUKPostcode(value: string): boolean {
  return UK_POSTCODE_RE.test(value.trim());
}

export function isValidUKPhone(value: string): boolean {
  const digits = value.replace(/[\s\-()]/g, "");
  // Must have between 10-13 chars (including +44 prefix)
  if (digits.length < 10 || digits.length > 13) return false;
  return UK_PHONE_RE.test(value.trim());
}

/** Shared payment utilities used by PaymentStep and checkout/payment page. */

export function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, "").split("").reverse().map(Number);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function getCardType(num: string): string | null {
  const clean = num.replace(/\D/g, "");
  if (clean.startsWith("4")) return "Visa";
  if (clean.startsWith("5") || clean.startsWith("2")) return "Mastercard";
  if (clean.startsWith("3")) return "Amex";
  return null;
}

export function formatCardNumber(value: string): string {
  const v = value.replace(/\D/g, "").slice(0, 16);
  const parts = [];
  for (let i = 0; i < v.length; i += 4) {
    parts.push(v.slice(i, i + 4));
  }
  return parts.join(" ");
}

export function formatExpiry(value: string): string {
  const v = value.replace(/\D/g, "").slice(0, 4);
  if (v.length >= 2) return v.slice(0, 2) + "/" + v.slice(2);
  return v;
}

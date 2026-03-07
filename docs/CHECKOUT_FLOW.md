# Checkout Flow

## Overview

The checkout implements a 5-step flow. All state is component-local (not in React Context). Form submission is mocked — no real payment processing occurs.

## Steps

```
/checkout → Welcome → Delivery → Customer → /checkout/payment → /checkout/confirmation
```

### Step 1: Welcome (`/checkout`)

- Sign in option (non-functional, visual only)
- "Continue as Guest" button to proceed
- Order summary sidebar with basket items

### Step 2: Delivery (same page, next section)

- UK address form:
  - Full name
  - Address line 1 & 2
  - City/Town
  - Postcode (validated against UK format)
  - Phone number (validated against UK format)
- Delivery option selection (standard/next-day/time-slot)
- Postcode lookup button (visual only)

### Step 3: Customer (`/checkout` — `CustomerStep.tsx`)

- Email address (validated)
- Confirm email
- Marketing preferences checkboxes
- Billing address (same as delivery or separate form)

### Step 4: Payment (`/checkout/payment`)

- Payment method selection:
  - Card payment (card number with Luhn check, expiry, CVV)
  - Apple Pay button (visual only)
  - PayPal button (visual only)
- Card form fields:
  - Card number (16 digits, Luhn validated, card type detection)
  - Cardholder name
  - Expiry date (MM/YY format)
  - CVV (3-4 digits)
- "Pay Now" button triggers mock submission

### Step 5: Confirmation (`/checkout/confirmation`)

- Generated order number (format: `ELZ-{random}`)
- Order summary
- Delivery address recap
- "Continue Shopping" link back to homepage

## Validation Rules

| Field | Validation |
|-------|-----------|
| Postcode | UK format: `AA9A 9AA`, `A9A 9AA`, `AA9 9AA`, `A9 9AA`, `AA99 9AA`, `A99 9AA` |
| Phone | UK format: starts with `0` or `+44`, 10-11 digits |
| Email | Standard email regex (`user@domain.tld`) |
| Card number | 16 digits, passes Luhn algorithm |
| Expiry | MM/YY format, not in the past |
| CVV | 3 digits (Visa/Mastercard) or 4 digits (Amex) |

## Mock Submission

The "Pay Now" button:

1. Shows a loading spinner (1.5 second delay)
2. Generates an order number: `ELZ-${random 6 chars}`
3. Moves basket items to order history (via `OrdersContext`)
4. Clears the basket (via `BasketContext`)
5. Redirects to `/checkout/confirmation`

No actual payment processing, API calls, or server-side validation occurs.

## Delivery Pricing

| Method | Price | Condition |
|--------|-------|-----------|
| Standard delivery | Free | Basket total >= £40 |
| Standard delivery | £4.99 | Basket total < £40 |
| Next-day delivery | £6.99 | Always |
| Time-slot delivery | £9.99 | Always |
| Next-day time-slot | £14.99 | Always |

The £40 free delivery threshold is implemented in `basket-context.tsx` → `calculateTotals()`.

## Key Files

| File | Purpose |
|------|---------|
| `src/app/checkout/page.tsx` | Main checkout page (Welcome, Delivery, Customer steps) |
| `src/app/checkout/payment/page.tsx` | Payment step |
| `src/app/checkout/confirmation/page.tsx` | Order confirmation |
| `src/app/checkout/layout.tsx` | Checkout-specific layout (minimal header) |
| `src/components/checkout/CustomerStep.tsx` | Customer details form component |
| `src/lib/basket-context.tsx` | Basket state, delivery calculation |
| `src/lib/orders-context.tsx` | Order history state |

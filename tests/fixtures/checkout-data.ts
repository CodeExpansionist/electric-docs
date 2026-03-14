/**
 * Controlled checkout data for E2E tests.
 * Valid UK address, test card details, promo code.
 */

export const DELIVERY_ADDRESS = {
  firstName: "Test",
  lastName: "Customer",
  addressLine1: "10 Downing Street",
  city: "London",
  postcode: "SW1A 2AA",
  phone: "020 7946 0958",
};

export const CUSTOMER_DETAILS = {
  email: "test@electriz.co.uk",
};

/** Test card that passes Luhn check */
export const PAYMENT_CARD = {
  number: "4111 1111 1111 1111",
  expiry: "12/28",
  cvv: "123",
  name: "Test Customer",
  type: "Visa",
};

/** Promo code with known discount (if the app supports it) */
export const PROMO_CODE = {
  code: "TEST10",
  discountType: "percentage" as const,
  discountValue: 10,
};

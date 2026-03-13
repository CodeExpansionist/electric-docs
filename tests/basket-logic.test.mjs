import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { DEFAULT_DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } =
  await import("../.test-build/lib/constants.js");

/**
 * calculateTotals is internal to basket-context.tsx (React context).
 * We re-implement the pure calculation logic here to verify the business rules
 * match the constants, without needing a React testing environment.
 */
function calculateTotals(items, promoDiscount) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCost = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE;
  const discount = promoDiscount || 0;
  return { subtotal, deliveryCost, total: Math.max(0, subtotal + deliveryCost - discount) };
}

describe("basket calculation logic", () => {
  describe("subtotal", () => {
    it("sums price * quantity for all items", () => {
      const result = calculateTotals([
        { price: 100, quantity: 2 },
        { price: 50, quantity: 1 },
      ]);
      assert.equal(result.subtotal, 250);
    });

    it("returns 0 for empty basket", () => {
      assert.equal(calculateTotals([]).subtotal, 0);
    });

    it("handles single item", () => {
      assert.equal(calculateTotals([{ price: 799, quantity: 1 }]).subtotal, 799);
    });
  });

  describe("delivery cost", () => {
    it("is free when subtotal >= threshold", () => {
      const result = calculateTotals([{ price: FREE_DELIVERY_THRESHOLD, quantity: 1 }]);
      assert.equal(result.deliveryCost, 0);
    });

    it("is free when subtotal is well above threshold", () => {
      const result = calculateTotals([{ price: 500, quantity: 1 }]);
      assert.equal(result.deliveryCost, 0);
    });

    it("charges default fee when subtotal is below threshold", () => {
      const result = calculateTotals([{ price: FREE_DELIVERY_THRESHOLD - 1, quantity: 1 }]);
      assert.equal(result.deliveryCost, DEFAULT_DELIVERY_FEE);
    });

    it("charges default fee for empty basket", () => {
      const result = calculateTotals([]);
      assert.equal(result.deliveryCost, DEFAULT_DELIVERY_FEE);
    });

    it("is exactly at boundary (subtotal = threshold)", () => {
      const result = calculateTotals([{ price: 20, quantity: 2 }]);
      assert.equal(result.deliveryCost, 0);
    });

    it("charges fee just below boundary", () => {
      const result = calculateTotals([{ price: 39.99, quantity: 1 }]);
      assert.equal(result.deliveryCost, DEFAULT_DELIVERY_FEE);
    });
  });

  describe("total", () => {
    it("equals subtotal when delivery is free and no promo", () => {
      const result = calculateTotals([{ price: 100, quantity: 1 }]);
      assert.equal(result.total, 100);
    });

    it("includes delivery fee in total", () => {
      const result = calculateTotals([{ price: 10, quantity: 1 }]);
      assert.equal(result.total, 10 + DEFAULT_DELIVERY_FEE);
    });

    it("subtracts promo discount from total", () => {
      const result = calculateTotals([{ price: 100, quantity: 1 }], 20);
      assert.equal(result.total, 80);
    });

    it("never goes below zero", () => {
      const result = calculateTotals([{ price: 10, quantity: 1 }], 9999);
      assert.equal(result.total, 0);
    });

    it("handles promo with delivery fee", () => {
      const result = calculateTotals([{ price: 30, quantity: 1 }], 10);
      // subtotal: 30, delivery: 5, promo: 10 → total: 25
      assert.equal(result.total, 25);
    });
  });
});

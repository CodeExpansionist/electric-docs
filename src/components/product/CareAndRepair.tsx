"use client";

import { useState } from "react";
import type { CareAndRepairPlan } from "@/lib/product-data";

interface CareAndRepairProps {
  plans: CareAndRepairPlan[];
  benefits?: string[];
}

export default function CareAndRepair({ plans, benefits }: CareAndRepairProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (plans.length === 0) return null;

  return (
    <div className="border border-border rounded-lg p-4 mb-4">
      <h3 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4C12A1"
          strokeWidth="1.8"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Add Care &amp; Repair
      </h3>
      <p className="text-xs text-text-secondary mb-3">
        Breakdown support when you need it
      </p>

      <div className="space-y-2 mb-3">
        {plans.map((plan) => (
          <label
            key={plan.plan}
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              selected === plan.plan
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
          >
            <input
              type="radio"
              name="care-plan"
              value={plan.plan}
              checked={selected === plan.plan}
              onChange={() => setSelected(plan.plan)}
              className="w-4 h-4 accent-primary"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-primary">
                  {plan.plan}
                </span>
                {plan.mostPopular && (
                  <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded">
                    Most popular
                  </span>
                )}
              </div>
              {plan.savings && (
                <p className="text-[10px] text-sale">{plan.savings}</p>
              )}
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-text-primary">
                £{(plan.price ?? 0).toFixed(2)}
              </span>
              <span className="text-[10px] text-text-secondary block">
                {plan.period}
              </span>
            </div>
          </label>
        ))}
      </div>

      {benefits && benefits.length > 0 && (
        <div className="pt-2 border-t border-border">
          <ul className="space-y-1">
            {benefits.map((benefit, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-[10px] text-text-secondary"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4C12A1"
                  strokeWidth="2"
                  className="mt-0.5 flex-shrink-0"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

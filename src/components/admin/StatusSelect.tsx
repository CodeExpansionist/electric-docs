"use client";

import type { Order } from "@/lib/orders-context";

interface StatusSelectProps {
  currentStatus: Order["status"];
  onStatusChange: (newStatus: Order["status"]) => void;
}

const statuses: Order["status"][] = ["confirmed", "processing", "dispatched", "delivered"];

export default function StatusSelect({ currentStatus, onStatusChange }: StatusSelectProps) {
  return (
    <select
      value={currentStatus}
      onChange={(e) => onStatusChange(e.target.value as Order["status"])}
      className="border border-input-border rounded-md px-3 py-1.5 text-sm bg-white focus:border-primary focus:outline-none"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}

"use client";

import { useState } from "react";
import type { EssentialService } from "@/lib/product-data";

interface EssentialServicesProps {
  services: EssentialService[];
}

export default function EssentialServices({ services }: EssentialServicesProps) {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    new Set()
  );

  if (services.length === 0) return null;

  const toggleService = (name: string) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold text-text-primary mb-3">
        Essential services
      </h3>
      <div className="space-y-2">
        {services.map((service) => (
          <label
            key={service.name}
            className="flex items-center justify-between p-3 bg-light-purple border border-border rounded-lg cursor-pointer hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedServices.has(service.name)}
                onChange={() => toggleService(service.name)}
                className="w-5 h-5 accent-primary rounded"
              />
              <span className="text-xs text-text-primary">{service.name}</span>
            </div>
            <span className="text-xs font-bold text-text-primary">
              £{service.price.toFixed(2)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

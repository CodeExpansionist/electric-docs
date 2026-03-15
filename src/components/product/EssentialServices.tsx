"use client";

import { useState, useCallback } from "react";
import type { EssentialService } from "@/lib/product-data";
import { useBasket } from "@/lib/basket-context";
import type { Product } from "@/lib/types";

interface EssentialServicesProps {
  services: EssentialService[];
}

const INSTALL_KEYWORDS = ["install tv to stand", "install tv to wall"];

function isInstallService(name: string): boolean {
  const lower = name.toLowerCase();
  return INSTALL_KEYWORDS.some((k) => lower.includes(k));
}

function toServiceProduct(service: EssentialService): Product {
  const id = `service-${service.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  return {
    id,
    slug: id,
    title: service.name,
    brand: "Electriz",
    category: "Services",
    subcategory: "",
    price: { current: service.price },
    images: { main: "", gallery: [], thumbnail: "" },
    rating: { average: 0, count: 0 },
    specs: {},
    keySpecs: [],
    description: "",
    deliveryInfo: { freeDelivery: true, estimatedDate: "" },
    badges: [],
    tags: [],
    offers: [],
    inStock: true,
  };
}

export default function EssentialServices({ services }: EssentialServicesProps) {
  const { basket, addItem, removeItem } = useBasket();

  const isInBasket = useCallback(
    (service: EssentialService) => {
      const id = toServiceProduct(service).id;
      return basket.items.some((item) => item.product.id === id);
    },
    [basket.items]
  );

  const toggleService = useCallback(
    (service: EssentialService) => {
      const product = toServiceProduct(service);
      const alreadyIn = basket.items.some((item) => item.product.id === product.id);

      if (alreadyIn) {
        removeItem(product.id);
      } else {
        // If this is an install service, remove the other install service first
        if (isInstallService(service.name)) {
          for (const other of services) {
            if (other.name !== service.name && isInstallService(other.name)) {
              const otherId = toServiceProduct(other).id;
              if (basket.items.some((item) => item.product.id === otherId)) {
                removeItem(otherId);
              }
            }
          }
        }
        addItem(product);
      }
    },
    [basket.items, services, addItem, removeItem]
  );

  if (services.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-bold text-text-primary mb-3">
        Essential services
      </h3>
      <div className="space-y-1">
        {services.map((service) => {
          const checked = isInBasket(service);
          return (
            <div
              key={service.name}
              className="flex items-center justify-between py-2 cursor-pointer select-none"
              onClick={() => toggleService(service)}
              role="checkbox"
              aria-checked={checked}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  toggleService(service);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 flex-shrink-0 border rounded flex items-center justify-center transition-colors ${
                    checked
                      ? "bg-primary border-primary"
                      : "bg-white border-[#56707a]"
                  }`}
                >
                  {checked && (
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-text-primary">{service.name}</span>
              </div>
              <span className="text-xs font-bold text-text-primary">
                £{service.price.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { FilterGroup } from "@/lib/category-data";

interface FilterSidebarProps {
  filters: FilterGroup[];
  onFilterChange?: (filters: Record<string, string[]>) => void;
  activeFilters?: Record<string, string[]>;
}

function StarRow({ filled }: { filled: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= filled ? "#E8A317" : "#E0E0E0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function FilterGroupComponent({
  group,
  activeFilters,
  onToggle,
}: {
  group: FilterGroup;
  activeFilters: string[];
  onToggle: (label: string) => void;
}) {
  const [expanded, setExpanded] = useState(group.isExpanded);

  if (group.type === "toggle") {
    return null; // Toggle is handled separately
  }

  return (
    <div className="border-b border-border py-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-semibold text-text-primary">{group.name}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-text-secondary transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && group.options.length > 0 && (
        <div className="mt-3 space-y-2.5">
          {/* Price range inputs */}
          {group.type === "range" && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center border border-input-border rounded-md px-2 py-1.5 flex-1">
                <span className="text-xs text-text-muted mr-1">£</span>
                <input type="text" placeholder="Min" className="w-full text-xs outline-none" />
              </div>
              <span className="text-xs text-text-muted">to</span>
              <div className="flex items-center border border-input-border rounded-md px-2 py-1.5 flex-1">
                <span className="text-xs text-text-muted mr-1">£</span>
                <input type="text" placeholder="Max" className="w-full text-xs outline-none" />
              </div>
              <button className="bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-md">
                Apply
              </button>
            </div>
          )}

          {group.options.map((option) => (
            <label key={option.label} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={activeFilters.includes(option.label)}
                onChange={() => onToggle(option.label)}
                className="w-4 h-4 rounded border-border-light accent-primary"
              />
              <span className="flex items-center gap-1.5 text-sm text-text-primary">
                {group.type === "rating" ? (
                  <>
                    <StarRow filled={parseInt(option.label)} />
                    <span>{option.label}</span>
                  </>
                ) : (
                  option.label
                )}
                <span className="text-text-muted">({option.count})</span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterSidebar({ filters, onFilterChange, activeFilters = {} }: FilterSidebarProps) {
  const [hideOutOfStock, setHideOutOfStock] = useState(false);

  const handleToggle = (groupName: string, label: string) => {
    const current = activeFilters[groupName] || [];
    const updated = current.includes(label)
      ? current.filter((l) => l !== label)
      : [...current, label];

    onFilterChange?.({
      ...activeFilters,
      [groupName]: updated,
    });
  };

  return (
    <aside className="w-[240px] flex-shrink-0">
      <div className="card p-4">
        <h2 className="text-lg font-bold text-text-primary mb-4">Filters</h2>
        {/* Hide out of stock toggle */}
        <div className="flex items-center justify-between border-b border-border py-3">
          <span className="text-xs text-text-primary">Hide out of stock</span>
          <button
            onClick={() => {
              setHideOutOfStock(!hideOutOfStock);
              onFilterChange?.({
                ...activeFilters,
                _hideOutOfStock: hideOutOfStock ? [] : ["true"],
              });
            }}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              hideOutOfStock ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                hideOutOfStock ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {/* Filter groups — ordered to match reference: Rating, Brand, then rest */}
        {[...filters]
          .sort((a, b) => {
            const order = ["Customer Rating", "Brand", "Price", "Type", "Screen Size", "Screen technology", "Resolution", "Refresh rate", "Smart platform", "Smart TV apps", "Voice control", "Gaming", "Gaming Technology", "Sound enhancement", "Picture & contrast enhancement", "Design features", "LED backlighting", "Tuner", "Energy rating", "Colour", "Guarantee", "Year", "Loved by Electriz", "Accessibility features", "Premium audio technology", "Sound bar design", "Connections", "Design", "Features", "Compatible voice assistant", "Popular screen sizes", "VESA", "Max. weight", "Suitable for curved TVs", "Length", "Number of devices controlled", "4K Ultra HD", "Recording"];
            const ai = order.indexOf(a.name);
            const bi = order.indexOf(b.name);
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
          })
          .map((group) => (
          <FilterGroupComponent
            key={group.name}
            group={group}
            activeFilters={activeFilters[group.name] || []}
            onToggle={(label) => handleToggle(group.name, label)}
          />
        ))}
      </div>
    </aside>
  );
}

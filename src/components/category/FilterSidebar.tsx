"use client";

import { useState } from "react";
import type { FilterGroup } from "@/lib/category-data";

interface FilterSidebarProps {
  filters: FilterGroup[];
  onFilterChange?: (filters: Record<string, string[]>) => void;
  activeFilters?: Record<string, string[]>;
}

/** Filters that are always expanded at the top of the sidebar. */
const ALWAYS_EXPANDED = ["Customer Rating", "Type", "Price"];

/** Canonical sort order — matches reference site layout per category. */
const FILTER_ORDER = [
  "Customer Rating", "Type", "Price", "Brand", "Screen Size",
  "Sound enhancement", "Smart TV apps", "Screen technology",
  "Picture & contrast enhancement", "Gaming", "Refresh rate", "Tuner",
  "Resolution", "Design features", "Energy rating", "Smart platform",
  "Voice control", "Colour", "LED backlighting", "Guarantee", "Year",
  "Gaming Technology", "Loved by Electriz", "Accessibility features",
  "Premium audio technology", "Sound bar design", "Connections", "Design",
  "Features", "Compatible voice assistant", "Popular screen sizes", "VESA",
  "Max. weight", "Suitable for curved TVs", "Length",
  "Number of devices controlled", "4K Ultra HD", "Recording",
];

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
  initialExpanded,
}: {
  group: FilterGroup;
  activeFilters: string[];
  onToggle: (label: string) => void;
  initialExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const activeCount = activeFilters.length;

  if (group.type === "toggle") {
    return null; // Toggle is handled separately
  }

  return (
    <div className="border-b border-border py-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-semibold text-text-primary">
          {group.name}
          {activeCount > 0 && (
            <span className="text-text-muted font-normal"> ({activeCount})</span>
          )}
        </span>
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

  const hasPreSelected = Object.values(activeFilters).some((v) => v.length > 0);

  // Collect all active filter entries (excluding internal keys like _hideOutOfStock)
  const appliedEntries: { group: string; value: string }[] = [];
  for (const [group, values] of Object.entries(activeFilters)) {
    if (group.startsWith("_")) continue;
    for (const v of values) {
      appliedEntries.push({ group, value: v });
    }
  }
  const totalActiveCount = appliedEntries.length;

  const handleRemoveFilter = (group: string, value: string) => {
    const current = activeFilters[group] || [];
    onFilterChange?.({
      ...activeFilters,
      [group]: current.filter((v) => v !== value),
    });
  };

  const handleClearAll = () => {
    // Preserve internal keys like _hideOutOfStock
    const preserved: Record<string, string[]> = {};
    for (const [key, val] of Object.entries(activeFilters)) {
      if (key.startsWith("_")) preserved[key] = val;
    }
    onFilterChange?.(preserved);
  };

  return (
    <aside className="w-[240px] flex-shrink-0 self-start sticky top-0 max-h-screen overflow-y-auto scrollbar-visible">
      <div className="card p-4">
        {/* Filters heading — sticky within sidebar scroll */}
        <div className="sticky top-0 bg-white z-10 pb-3 -mx-4 px-4 -mt-4 pt-4 border-b border-border mb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Filters</h2>
            {totalActiveCount > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-primary hover:underline"
              >
                Clear all({totalActiveCount})
              </button>
            )}
          </div>
        </div>

        {/* Applied filters pills */}
        {totalActiveCount > 0 && (
          <div className="border-b border-border pb-3 mb-1">
            <span className="text-[11px] text-text-muted block mb-2">Applied filters</span>
            <div className="flex flex-wrap gap-1.5">
              {appliedEntries.map(({ group, value }) => (
                <span
                  key={`${group}-${value}`}
                  className="inline-flex items-center gap-1 bg-surface text-xs text-text-primary px-2 py-1 rounded"
                >
                  {value}
                  <button
                    onClick={() => handleRemoveFilter(group, value)}
                    className="text-text-muted hover:text-text-primary"
                    aria-label={`Remove ${value} filter`}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hide out of stock toggle */}
        <div className="flex items-center gap-2 border-b border-border py-3">
          <button
            onClick={() => {
              setHideOutOfStock(!hideOutOfStock);
              onFilterChange?.({
                ...activeFilters,
                _hideOutOfStock: hideOutOfStock ? [] : ["true"],
              });
            }}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              hideOutOfStock ? "bg-primary" : "bg-[#9E9E9E]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                hideOutOfStock ? "translate-x-5" : ""
              }`}
            />
          </button>
          <span className="text-xs text-text-primary">Hide out of stock</span>
        </div>

        {/* Filter groups — sorted to match reference site order */}
        {[...filters]
          .sort((a, b) => {
            const ai = FILTER_ORDER.indexOf(a.name);
            const bi = FILTER_ORDER.indexOf(b.name);
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
          })
          .map((group) => {
            const groupActive = activeFilters[group.name] || [];
            // Expanded if: always-expanded group, has active selections,
            // or no pre-selected filters (normal category page — use scraped state)
            const shouldExpand = ALWAYS_EXPANDED.includes(group.name)
              || groupActive.length > 0
              || (!hasPreSelected && group.isExpanded);

            return (
              <FilterGroupComponent
                key={group.name}
                group={group}
                activeFilters={groupActive}
                onToggle={(label) => handleToggle(group.name, label)}
                initialExpanded={shouldExpand}
              />
            );
          })}
      </div>
    </aside>
  );
}

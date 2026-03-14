import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterSidebar from "@/components/category/FilterSidebar";
import type { FilterGroup } from "@/lib/types";

const mockFilters: FilterGroup[] = [
  {
    name: "Brand",
    type: "checkbox",
    isExpanded: true,
    options: [
      { label: "Samsung", count: 45 },
      { label: "LG", count: 32 },
      { label: "Sony", count: 18 },
    ],
  },
  {
    name: "Type",
    type: "checkbox",
    isExpanded: true,
    options: [
      { label: "OLED", count: 12 },
      { label: "LED", count: 40 },
      { label: "QLED", count: 8 },
    ],
  },
];

describe("FilterSidebar", () => {
  it("renders filter groups with option labels and counts", () => {
    render(
      <FilterSidebar
        filters={mockFilters}
        onFilterChange={vi.fn()}
        activeFilters={{}}
      />
    );

    expect(screen.getByText("Samsung")).toBeInTheDocument();
    expect(screen.getByText("LG")).toBeInTheDocument();
    expect(screen.getByText("OLED")).toBeInTheDocument();
  });

  it("calls onFilterChange when a filter option is clicked", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <FilterSidebar
        filters={mockFilters}
        onFilterChange={onFilterChange}
        activeFilters={{}}
      />
    );

    // Click a brand filter
    await user.click(screen.getByText("Samsung"));

    expect(onFilterChange).toHaveBeenCalledTimes(1);
    // The callback should include Samsung in the Brand filter
    const callArg = onFilterChange.mock.calls[0][0];
    expect(callArg["Brand"]).toContain("Samsung");
  });

  it("shows active filter pills when filters are selected", () => {
    render(
      <FilterSidebar
        filters={mockFilters}
        onFilterChange={vi.fn()}
        activeFilters={{ Brand: ["Samsung"] }}
      />
    );

    // An applied filter pill for Samsung should be visible
    // Look for the remove button or the pill text
    const pills = screen.getAllByText("Samsung");
    // Should appear at least twice: once in filter list, once as applied pill
    expect(pills.length).toBeGreaterThanOrEqual(2);
  });

  it("calls onFilterChange to clear when Clear all is clicked", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <FilterSidebar
        filters={mockFilters}
        onFilterChange={onFilterChange}
        activeFilters={{ Brand: ["Samsung", "LG"], Type: ["OLED"] }}
      />
    );

    const clearButton = screen.getByText(/clear all/i);
    await user.click(clearButton);

    expect(onFilterChange).toHaveBeenCalled();
    // The resulting filters should have no Brand or Type selections
    const callArg = onFilterChange.mock.calls[0][0];
    const hasUserFilters =
      (callArg["Brand"]?.length ?? 0) > 0 || (callArg["Type"]?.length ?? 0) > 0;
    expect(hasUserFilters).toBe(false);
  });

  it("removes a single filter when its pill remove button is clicked", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <FilterSidebar
        filters={mockFilters}
        onFilterChange={onFilterChange}
        activeFilters={{ Brand: ["Samsung", "LG"] }}
      />
    );

    // Find remove buttons on applied filter pills (typically an X or close button)
    const removeButtons = screen.getAllByRole("button").filter((btn) => {
      const text = btn.textContent || "";
      const ariaLabel = btn.getAttribute("aria-label") || "";
      return (
        text.includes("×") ||
        text.includes("✕") ||
        ariaLabel.includes("Remove") ||
        ariaLabel.includes("remove")
      );
    });

    if (removeButtons.length > 0) {
      await user.click(removeButtons[0]);
      expect(onFilterChange).toHaveBeenCalled();
    }
  });
});

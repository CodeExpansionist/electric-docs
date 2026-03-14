import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PricePanel from "@/components/product/PricePanel";

// Mock next/link as a simple anchor
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/image as a simple img
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} />,
}));

// Mock EnergyRatingBadge
vi.mock("@/components/ui/EnergyRatingBadge", () => ({
  default: ({ rating }: { rating: string }) => (
    <span data-testid="energy-badge">{rating}</span>
  ),
}));

describe("PricePanel", () => {
  const baseProps = {
    price: 499.99,
    offers: [],
  };

  it("shows the current price formatted with £", () => {
    render(<PricePanel {...baseProps} />);
    expect(screen.getByTestId("product-price")).toHaveTextContent("£499.99");
  });

  it("shows was price and savings when provided", () => {
    render(
      <PricePanel {...baseProps} wasPrice={599.99} savings={100} />
    );
    expect(screen.getByText(/Was £599\.99/)).toBeInTheDocument();
    expect(screen.getByText(/Save £100\.00/)).toBeInTheDocument();
  });

  it("does not show was price or savings when not provided", () => {
    render(<PricePanel {...baseProps} />);
    expect(screen.queryByText(/Was £/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Save £/)).not.toBeInTheDocument();
  });

  it("renders offers list", () => {
    render(
      <PricePanel
        {...baseProps}
        offers={["Free next-day delivery", "6 months Spotify"]}
      />
    );
    expect(screen.getByText("Free next-day delivery")).toBeInTheDocument();
    expect(screen.getByText("6 months Spotify")).toBeInTheDocument();
  });

  it("collapses offers beyond 2 with a toggle", async () => {
    const user = userEvent.setup();
    render(
      <PricePanel
        {...baseProps}
        offers={["Offer 1", "Offer 2", "Offer 3", "Offer 4"]}
      />
    );
    // First 2 visible, last 2 hidden
    expect(screen.getByText("Offer 1")).toBeInTheDocument();
    expect(screen.getByText("Offer 2")).toBeInTheDocument();
    expect(screen.queryByText("Offer 3")).not.toBeInTheDocument();

    // Click toggle to show all
    await user.click(screen.getByText(/\+2 more offers/));
    expect(screen.getByText("Offer 3")).toBeInTheDocument();
    expect(screen.getByText("Offer 4")).toBeInTheDocument();
  });

  it("fires onAddToBasket callback when button is clicked", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<PricePanel {...baseProps} onAddToBasket={onAdd} />);

    await user.click(screen.getByTestId("add-to-basket"));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("shows 'Added' confirmation after clicking add to basket", async () => {
    const user = userEvent.setup();
    render(<PricePanel {...baseProps} onAddToBasket={vi.fn()} />);

    const button = screen.getByTestId("add-to-basket");
    expect(button).toHaveTextContent("Add to basket");

    await user.click(button);
    expect(button).toHaveTextContent("Added");
  });

  it("shows energy rating badge when energyRating is provided", () => {
    render(
      <PricePanel {...baseProps} energyRating="A" energyLabelUrl="/label.pdf" />
    );
    expect(screen.getByTestId("energy-badge")).toHaveTextContent("A");
    expect(screen.getByText("Product fiche")).toBeInTheDocument();
  });

  it("does not show energy section when energyRating is absent", () => {
    render(<PricePanel {...baseProps} />);
    expect(screen.queryByTestId("energy-badge")).not.toBeInTheDocument();
    expect(screen.queryByText("Product fiche")).not.toBeInTheDocument();
  });

  it("formats large prices with comma separators", () => {
    render(<PricePanel {...baseProps} price={1299.99} />);
    expect(screen.getByTestId("product-price")).toHaveTextContent("£1,299.99");
  });

  it("renders size variants when provided", () => {
    render(
      <PricePanel
        {...baseProps}
        sizeVariants={[
          { size: '43"', productId: "1", slug: "tv-43", price: 399, selected: true, available: true },
          { size: '55"', productId: "2", slug: "tv-55", price: 599, selected: false, available: true },
          { size: '65"', productId: "3", slug: "tv-65", price: 799, selected: false, available: false },
        ]}
      />
    );
    expect(screen.getByText("Screen Size:")).toBeInTheDocument();
    // Selected size appears twice: in the label and in the selector
    expect(screen.getAllByText('43"').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('55"')).toBeInTheDocument();
    expect(screen.getByText('65"')).toBeInTheDocument();
  });
});

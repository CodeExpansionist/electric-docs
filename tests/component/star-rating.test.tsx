import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StarRating from "@/components/ui/StarRating";

describe("StarRating", () => {
  it("renders 5 star SVGs", () => {
    const { container } = render(<StarRating rating={3} />);
    const stars = container.querySelectorAll("svg");
    expect(stars).toHaveLength(5);
  });

  it("fills correct number of stars for integer rating", () => {
    const { container } = render(<StarRating rating={4} />);
    const paths = container.querySelectorAll("path");
    // 4 gold (#E8A317), 1 grey (#E0E0E0)
    const gold = Array.from(paths).filter((p) => p.getAttribute("fill") === "#E8A317");
    const grey = Array.from(paths).filter((p) => p.getAttribute("fill") === "#E0E0E0");
    expect(gold).toHaveLength(4);
    expect(grey).toHaveLength(1);
  });

  it("uses half-fill gradient for fractional rating", () => {
    const { container } = render(<StarRating rating={3.5} count={10} />);
    // Should have a linearGradient for the half star
    const gradients = container.querySelectorAll("linearGradient");
    expect(gradients.length).toBeGreaterThanOrEqual(1);
    // 3 fully gold, 1 gradient, 1 grey
    const paths = container.querySelectorAll("path");
    const gold = Array.from(paths).filter((p) => p.getAttribute("fill") === "#E8A317");
    expect(gold).toHaveLength(3);
  });

  it("shows rating text and review count when showText is true", () => {
    render(<StarRating rating={4.2} count={156} />);
    expect(screen.getByText("4.2/5")).toBeInTheDocument();
    expect(screen.getByText("156 reviews")).toBeInTheDocument();
  });

  it("hides text when showText is false", () => {
    render(<StarRating rating={4.2} count={156} showText={false} />);
    expect(screen.queryByText("4.2/5")).not.toBeInTheDocument();
    expect(screen.queryByText("156 reviews")).not.toBeInTheDocument();
  });

  it("does not show review count when count is 0", () => {
    render(<StarRating rating={3} count={0} />);
    expect(screen.queryByText(/reviews/)).not.toBeInTheDocument();
  });

  it("does not show review count when count is omitted", () => {
    render(<StarRating rating={3} />);
    expect(screen.queryByText(/reviews/)).not.toBeInTheDocument();
  });

  it("handles 0 rating — all stars grey", () => {
    const { container } = render(<StarRating rating={0} />);
    const paths = container.querySelectorAll("path");
    const grey = Array.from(paths).filter((p) => p.getAttribute("fill") === "#E0E0E0");
    expect(grey).toHaveLength(5);
  });

  it("handles 5 rating — all stars gold", () => {
    const { container } = render(<StarRating rating={5} />);
    const paths = container.querySelectorAll("path");
    const gold = Array.from(paths).filter((p) => p.getAttribute("fill") === "#E8A317");
    expect(gold).toHaveLength(5);
  });

  it("has accessible aria-label with rating", () => {
    render(<StarRating rating={4.5} />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "4.5 out of 5 stars");
  });

  it("formats large review counts with locale separators", () => {
    render(<StarRating rating={4} count={1500} />);
    expect(screen.getByText("1,500 reviews")).toBeInTheDocument();
  });
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Price Promise | Electriz",
  description:
    "We'll price match against any other UK retailer, online or in-store.",
  alternates: { canonical: "/services/price-promise" },
  openGraph: {
    title: "Price Promise | Electriz",
    description:
      "We'll price match against any other UK retailer, online or in-store.",
  },
};

export default function PricePromiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

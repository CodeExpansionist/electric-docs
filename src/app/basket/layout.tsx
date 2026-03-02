import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Basket",
  description:
    "Review the items in your Currys basket. Free delivery on orders over £40.",
  alternates: { canonical: "/basket" },
  robots: { index: false, follow: true },
};

export default function BasketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

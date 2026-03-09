import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Reviews",
  description:
    "Our approach to reviews and ratings published on our site.",
  alternates: { canonical: "/product-reviews" },
  openGraph: {
    title: "Product Reviews | Electriz",
    description:
      "Our approach to reviews and ratings published on our site.",
  },
};

export default function ProductReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

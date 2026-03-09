import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Recalls",
  description:
    "Important product safety and recall information.",
  alternates: { canonical: "/product-recalls" },
  openGraph: {
    title: "Product Recalls | Electriz",
    description:
      "Important product safety and recall information.",
  },
};

export default function ProductRecallsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

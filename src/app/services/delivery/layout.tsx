import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delivery Options",
  description:
    "Currys delivery options: free standard delivery over £40, next-day delivery, and premium large-item delivery to any room.",
  alternates: { canonical: "/services/delivery" },
  openGraph: {
    title: "Delivery Options | Currys",
    description: "Free delivery on orders over £40. Next-day delivery available.",
  },
};

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

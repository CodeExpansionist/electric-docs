import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track My Order",
  description:
    "Track your Currys delivery. Enter your order number to see the latest status of your order.",
  alternates: { canonical: "/track-your-order" },
  openGraph: {
    title: "Track My Order | Currys",
    description: "Track your Currys delivery status.",
  },
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Cancellations",
  description:
    "Currys returns policy: return most products within 30 days for a full refund. Start your return online or in-store.",
  alternates: { canonical: "/services/returns" },
  openGraph: {
    title: "Returns & Cancellations | Currys",
    description: "Return most products within 30 days for a full refund.",
  },
};

export default function ReturnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tablet Insurance | Electriz",
  description:
    "Protect your tablet with Electriz Tablet Insurance. Comprehensive coverage against accidental damage, theft and breakdowns.",
  alternates: { canonical: "/services/tablet-insurance" },
  openGraph: {
    title: "Tablet Insurance | Electriz",
    description:
      "Protect your tablet with Electriz Tablet Insurance. Comprehensive coverage against accidental damage, theft and breakdowns.",
  },
};

export default function TabletInsuranceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

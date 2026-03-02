import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift Cards",
  description:
    "Buy Currys gift cards for the tech lover in your life. Available in a range of values, redeemable online and in-store.",
  alternates: { canonical: "/services/gift-cards" },
  openGraph: {
    title: "Gift Cards | Currys",
    description: "Buy Currys gift cards, redeemable online and in-store.",
  },
};

export default function GiftCardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

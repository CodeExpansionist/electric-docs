import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description: "Complete your Currys order securely. Multiple payment options available.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

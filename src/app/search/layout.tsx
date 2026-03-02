import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Results",
  description: "Search for products at Currys. Find TVs, laptops, phones, tablets and more.",
  robots: { index: false, follow: true },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

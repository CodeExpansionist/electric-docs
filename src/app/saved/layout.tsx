import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Items",
  description: "View your saved items at Currys. Add them to your basket when you are ready.",
  alternates: { canonical: "/saved" },
  robots: { index: false, follow: true },
};

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

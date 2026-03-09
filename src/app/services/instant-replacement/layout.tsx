import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instant Replacement | Electriz",
  description:
    "3 years of unlimited replacements if your tech breaks down.",
  alternates: { canonical: "/services/instant-replacement" },
  openGraph: {
    title: "Instant Replacement | Electriz",
    description:
      "3 years of unlimited replacements if your tech breaks down.",
  },
};

export default function InstantReplacementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

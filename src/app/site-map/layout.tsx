import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Browse all pages on the Electriz website.",
  alternates: { canonical: "/site-map" },
  openGraph: {
    title: "Sitemap | Electriz",
    description: "Browse all pages on the Electriz website.",
  },
};

export default function SitemapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

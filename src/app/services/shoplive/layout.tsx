import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShopLive | Electriz",
  description:
    "Get expert advice before you buy with ShopLive video calls.",
  alternates: { canonical: "/services/shoplive" },
  openGraph: {
    title: "ShopLive | Electriz",
    description:
      "Get expert advice before you buy with ShopLive video calls.",
  },
};

export default function ShopLiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

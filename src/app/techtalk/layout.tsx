import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TechTalk",
  description:
    "Visit our Electriz TechTalk blog for the latest tech tips, reviews and inspiration.",
  alternates: { canonical: "/techtalk" },
  openGraph: {
    title: "TechTalk | Electriz",
    description:
      "Visit our Electriz TechTalk blog for the latest tech tips, reviews and inspiration.",
  },
};

export default function TechTalkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

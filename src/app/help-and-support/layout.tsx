import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & Support",
  description:
    "Get help with your Electriz order, delivery, returns and more. Contact our customer service team.",
  alternates: { canonical: "/help-and-support" },
  openGraph: {
    title: "Help & Support | Electriz",
    description:
      "Get help with your Electriz order, delivery, returns and more.",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

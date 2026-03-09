import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Cookies Policy",
  description:
    "Our privacy policy explains what personal information we collect and how we use it.",
  alternates: { canonical: "/privacy-cookies-policy" },
  openGraph: {
    title: "Privacy & Cookies Policy | Electriz",
    description:
      "Our privacy policy explains what personal information we collect and how we use it.",
  },
};

export default function PrivacyCookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

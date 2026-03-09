import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Help & Support",
  description:
    "Get help with your Electriz order, delivery, returns and more. Contact our customer service team.",
  alternates: { canonical: "/contact-us" },
  openGraph: {
    title: "Contact Us | Electriz",
    description:
      "Get help with your Electriz order, delivery, returns and more. Contact our customer service team.",
  },
};

export { default } from "@/app/help-and-support/page";

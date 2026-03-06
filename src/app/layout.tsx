import type { Metadata } from "next";
import "./globals.css";
import { BasketProvider } from "@/lib/basket-context";
import { SavedProvider } from "@/lib/saved-context";
import { OrdersProvider } from "@/lib/orders-context";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Electriz | Electrical Appliances, TVs, Laptops & More",
    template: "%s | Electriz",
  },
  description:
    "Discover the latest tech with Electriz. Shop TVs, laptops, phones, tablets, home appliances and more. Free delivery available.",
  icons: {
    icon: [
      { url: "/images/brand-electriz-logo.svg", type: "image/svg+xml" },
    ],
    apple: "/images/brand-electriz-logo.svg",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Electriz",
    title: "Electriz | Electrical Appliances, TVs, Laptops & More",
    description:
      "Discover the latest tech with Electriz. Shop TVs, laptops, phones, tablets, home appliances and more.",
    images: [
      {
        url: "/images/brand-electriz-logo.svg",
        width: 512,
        height: 512,
        alt: "Electriz logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Electriz | Electrical Appliances, TVs, Laptops & More",
    description:
      "Discover the latest tech with Electriz. Shop TVs, laptops, phones, tablets, home appliances and more.",
    images: ["/images/brand-electriz-logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <BasketProvider>
          <SavedProvider>
            <OrdersProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </OrdersProvider>
          </SavedProvider>
        </BasketProvider>
      </body>
    </html>
  );
}

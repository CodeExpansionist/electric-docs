import type { Metadata } from "next";
import "./globals.css";
import { BasketProvider } from "@/lib/basket-context";
import { SavedProvider } from "@/lib/saved-context";
import { OrdersProvider } from "@/lib/orders-context";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

export const metadata: Metadata = {
  title: "Currys | Electrical Appliances, TVs, Laptops & More",
  description:
    "Discover the latest tech with Currys. Shop TVs, laptops, phones, tablets, home appliances and more. Free delivery available.",
  icons: {
    icon: "https://www.currys.co.uk/on/demandware.static/Sites-curryspcworlduk-Site/-/default/dw2dbb4f18/images/favicons/favicon.ico",
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

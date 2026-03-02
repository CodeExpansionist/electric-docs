"use client";

import { usePathname } from "next/navigation";
import AnnouncementBar from "./AnnouncementBar";
import SecondaryNav from "./SecondaryNav";
import Header from "./Header";
import MainNav from "./MainNav";
import USPBar from "./USPBar";
import Footer from "./Footer";
import SubFooter from "./SubFooter";
import CheckoutHeader from "./CheckoutHeader";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCheckout = pathname.startsWith("/checkout");

  if (isCheckout) {
    return (
      <div className="min-h-screen bg-surface">
        <AnnouncementBar />
        <CheckoutHeader />
        <main>{children}</main>
      </div>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <SecondaryNav />
      <Header />
      <MainNav />
      <USPBar />
      <main>{children}</main>
      <Footer />
      <SubFooter />
    </>
  );
}

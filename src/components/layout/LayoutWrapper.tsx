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
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isCheckout = pathname.startsWith("/checkout");
  const isProduct = pathname.startsWith("/products/");

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-surface flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <AdminHeader />
          <main id="main-content" className="flex-1 min-w-0 p-6">{children}</main>
        </div>
      </div>
    );
  }

  if (isCheckout) {
    return (
      <div className="min-h-screen bg-surface">
        <AnnouncementBar />
        <CheckoutHeader />
        <main id="main-content">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <SecondaryNav />
      <Header />
      <MainNav />
      {pathname === "/" && <USPBar />}
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <SubFooter />
    </div>
  );
}

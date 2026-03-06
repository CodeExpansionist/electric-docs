"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = decodeURIComponent(seg)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { label, href };
  });

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <nav className="flex items-center gap-1.5 text-xs text-text-secondary">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-border">/</span>}
            {i === crumbs.length - 1 ? (
              <span className="text-text-primary font-medium">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-primary no-underline text-text-secondary">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
      <Link
        href="/"
        className="text-xs text-text-secondary hover:text-primary no-underline flex items-center gap-1"
      >
        View store
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </Link>
    </header>
  );
}

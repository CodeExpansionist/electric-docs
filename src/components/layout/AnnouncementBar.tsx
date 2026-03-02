"use client";

import { useState } from "react";
import Link from "next/link";

const data = {
  text: "Free delivery on orders over \u00A340! Next day delivery available 7 days a week",
  url: "/services/delivery",
};

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-announcement text-white text-xs py-2 relative">
      <div className="container-main text-center">
        <Link href={data.url} className="text-white hover:underline no-underline">
          {data.text}
        </Link>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:opacity-70 transition-opacity"
          aria-label="Close announcement"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

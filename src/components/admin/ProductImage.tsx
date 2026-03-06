"use client";

import { useState } from "react";
import Image from "next/image";


interface ProductImageProps {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

/** Extract product ID from a scraped CDN URL for local image fallback */
function extractProductId(url: string): string | undefined {
  const match = url.match(/(?:currysprod|electrizprod)\/(\d+)/);
  return match ? match[1] : undefined;
}

function localImagePath(productId: string): string {
  return `/images/products/${productId}/large.webp`;
}

export default function ProductImage({ src, alt, width, height, className = "" }: ProductImageProps) {
  const [error, setError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  if (!src || (error && fallbackError)) {
    return (
      <div
        className={`bg-surface rounded flex items-center justify-center text-text-secondary ${className}`}
        style={{ width, height }}
      >
        <svg className="w-1/2 h-1/2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
    );
  }

  // If primary src failed, try CDN fallback from product ID
  if (error && src) {
    const pid = extractProductId(src);
    if (pid) {
      return (
        <Image
          src={localImagePath(pid)}
          alt={alt}
          width={width}
          height={height}
          className={`object-contain ${className}`}
          unoptimized
          onError={() => setFallbackError(true)}
        />
      );
    }
    // No product ID to extract — show placeholder
    return (
      <div
        className={`bg-surface rounded flex items-center justify-center text-text-secondary ${className}`}
        style={{ width, height }}
      >
        <svg className="w-1/2 h-1/2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`object-contain ${className}`}
      unoptimized
      onError={() => setError(true)}
    />
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  thumbnails: string[];
  alt: string;
}

export default function ProductGallery({ images, thumbnails, alt }: ProductGalleryProps) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-[4/3] bg-white border border-border rounded-[5px] overflow-hidden mb-3">
        <Image
          src={images[current]}
          alt={`${alt} - Image ${current + 1}`}
          fill
          className="object-contain p-4"
          priority
        />
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-md
                     flex items-center justify-center hover:bg-gray-50 border border-border"
          aria-label="Previous image"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-md
                     flex items-center justify-center hover:bg-gray-50 border border-border"
          aria-label="Next image"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-text-secondary bg-white/80 px-2 py-0.5 rounded">
          {current + 1} / {images.length}
        </span>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2.5 overflow-x-auto">
        {thumbnails.slice(0, 7).map((thumb, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-[80px] h-[80px] flex-shrink-0 border rounded overflow-hidden ${
              i === current ? "border-primary border-2" : "border-border"
            }`}
          >
            <Image
              src={thumb}
              alt={`Thumbnail ${i + 1}`}
              width={80}
              height={80}
              className="object-contain w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

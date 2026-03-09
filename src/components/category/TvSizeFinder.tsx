"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface SizeOption {
  label: string;
  url: string;
}

interface TvSizeFinderProps {
  heading: string;
  description: string;
  sizeOptions: SizeOption[];
  assets: {
    tvImage: string;
    cabinetImage: string;
    sofaImage: string;
  };
  learnMoreUrl?: string;
}

function TvIllustration({ scale }: { scale: number }) {
  const tvW = 36 + scale * 14;
  const tvH = 22 + scale * 8;
  const standW = 16 + scale * 4;
  const standH = 3;
  const baseW = 24 + scale * 6;
  const cabinetW = 50 + scale * 10;
  const cabinetH = 18 + scale * 2;
  const totalH = tvH + standH + 4 + cabinetH + 8;
  const totalW = Math.max(tvW, cabinetW) + 20;
  const cx = totalW / 2;

  return (
    <svg
      width={totalW}
      height={totalH}
      viewBox={`0 0 ${totalW} ${totalH}`}
      fill="none"
      className="mx-auto"
    >
      {/* TV screen */}
      <rect
        x={cx - tvW / 2}
        y={4}
        width={tvW}
        height={tvH}
        rx={2}
        stroke="#333"
        strokeWidth={1.5}
        fill="white"
      />
      {/* Stand neck */}
      <rect
        x={cx - 2}
        y={4 + tvH}
        width={4}
        height={standH}
        fill="#333"
      />
      {/* Stand base */}
      <rect
        x={cx - standW / 2}
        y={4 + tvH + standH}
        width={standW}
        height={2}
        rx={1}
        fill="#333"
      />
      {/* Cabinet / TV unit */}
      <rect
        x={cx - cabinetW / 2}
        y={4 + tvH + standH + 6}
        width={cabinetW}
        height={cabinetH}
        rx={3}
        stroke="#CDD8DF"
        strokeWidth={1}
        fill="#F5F5F5"
      />
      {/* Cabinet legs */}
      <line
        x1={cx - cabinetW / 2 + 4}
        y1={4 + tvH + standH + 6 + cabinetH}
        x2={cx - cabinetW / 2 + 4}
        y2={4 + tvH + standH + 6 + cabinetH + 4}
        stroke="#CDD8DF"
        strokeWidth={1.5}
      />
      <line
        x1={cx + cabinetW / 2 - 4}
        y1={4 + tvH + standH + 6 + cabinetH}
        x2={cx + cabinetW / 2 - 4}
        y2={4 + tvH + standH + 6 + cabinetH + 4}
        stroke="#CDD8DF"
        strokeWidth={1.5}
      />
      {/* Base line */}
      <line
        x1={cx - baseW / 2}
        y1={totalH - 2}
        x2={cx + baseW / 2}
        y2={totalH - 2}
        stroke="#E5E5E5"
        strokeWidth={0.5}
      />
    </svg>
  );
}

export default function TvSizeFinder({
  heading,
  sizeOptions,
  assets,
  learnMoreUrl,
}: TvSizeFinderProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [distance, setDistance] = useState(160);

  const cycleSize = (dir: "prev" | "next") => {
    setSelectedIdx((prev) => {
      if (prev === null) return dir === "next" ? 0 : sizeOptions.length - 1;
      const next = dir === "next" ? prev + 1 : prev - 1;
      if (next < 0) return sizeOptions.length - 1;
      if (next >= sizeOptions.length) return 0;
      return next;
    });
  };

  return (
    <section className="mb-10">
      <div className="card p-6 md:p-8">
        <h2 className="text-xl font-bold text-text-primary text-center mb-2">
          {heading}
        </h2>
        <p className="text-sm text-text-secondary text-center mb-8">
          Enter the distance{" "}
          <span className="text-primary font-semibold">
            between your sofa and your TV
          </span>{" "}
          to find the perfect screen size for you:
        </p>

        {/* Room illustration with distance input */}
        <div className="flex items-end justify-center gap-3 md:gap-6 mb-8 px-2 md:px-4">
          {/* TV with arrows */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <button
                onClick={() => cycleSize("prev")}
                className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-border bg-white flex items-center justify-center hover:border-primary transition-colors"
                aria-label="Previous size"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="relative w-16 h-12 md:w-24 md:h-16">
                <Image
                  src={assets.tvImage}
                  alt="TV"
                  fill
                  className="object-contain"
                />
              </div>
              <button
                onClick={() => cycleSize("next")}
                className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-border bg-white flex items-center justify-center hover:border-primary transition-colors"
                aria-label="Next size"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
            <div className="relative w-14 h-10 md:w-20 md:h-14 -mt-1">
              <Image
                src={assets.cabinetImage}
                alt="TV cabinet"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Distance input */}
          <div className="flex flex-col items-center flex-shrink-0 mb-6">
            <div className="flex items-center gap-2">
              <div className="h-px w-6 md:w-10 bg-border" />
              <div className="relative">
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-20 md:w-24 text-center text-lg font-bold border-2 border-border rounded-lg py-1.5 pr-8 focus:border-primary focus:ring-0 transition-colors"
                  min={50}
                  max={500}
                  aria-label="Distance in cm"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary font-medium">
                  cm
                </span>
              </div>
              <div className="h-px w-6 md:w-10 bg-border" />
            </div>
          </div>

          {/* Sofa */}
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-14 md:w-28 md:h-20">
              <Image
                src={assets.sofaImage}
                alt="Sofa"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* "or Choose a TV size" separator */}
        <p className="text-sm text-text-secondary text-center mb-6">
          or{" "}
          <span className="text-primary font-bold">Choose a TV size</span>{" "}
          to see the best viewing distance:
        </p>

        {/* Size option cards with TV illustrations */}
        <div className="flex gap-3 md:gap-4 mb-6 overflow-x-auto scrollbar-hide pb-2 px-1">
          {sizeOptions.map((option, idx) => (
            <Link
              key={option.label}
              href={option.url}
              onClick={() => setSelectedIdx(idx)}
              onMouseEnter={() => setSelectedIdx(idx)}
              onMouseLeave={() => setSelectedIdx(null)}
              className={`flex flex-col items-center flex-shrink-0 rounded-lg border-2 px-3 pt-3 pb-2 no-underline transition-colors min-w-[90px] md:min-w-[110px] ${
                selectedIdx === idx
                  ? "border-primary bg-primary/5"
                  : "border-border bg-white hover:border-primary/50"
              }`}
            >
              <div className="flex-1 flex items-end justify-center mb-2">
                <TvIllustration scale={Math.min(idx, 6)} />
              </div>
              <span className={`text-[11px] md:text-xs font-semibold text-center whitespace-nowrap ${
                selectedIdx === idx ? "text-primary" : "text-text-primary"
              }`}>
                {option.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Learn more link */}
        {learnMoreUrl && (
          <p className="text-center">
            <Link
              href={learnMoreUrl}
              className="text-xs text-text-secondary hover:text-primary underline"
            >
              Learn more about how we calculate screen size
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}

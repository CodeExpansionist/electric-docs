"use client";

import Image from "next/image";
import { useState, useCallback, useRef, useEffect } from "react";

interface SizeOption {
  label: string;
  url: string;
  image?: string;
}

interface TvSizeFinderProps {
  heading: string;
  description: string;
  sizeOptions: SizeOption[];
  assets: {
    tvImage: string;
    cabinetImage: string;
    sofaImage: string;
    cabinetMedium?: string;
    cabinetLarge?: string;
    sofaMedium?: string;
    sofaLarge?: string;
    rugLeft?: string;
    rugCenter?: string;
    rugRight?: string;
  };
  learnMoreUrl?: string;
}

/* ── Real formula from reference ─────────────────────────────────
   Optimal viewing distance = 2× TV diagonal.
   So: TV diagonal (inches) = distance_cm / 2 / 2.54
   Then match to size range boundaries (midpoints between ranges). */

const SIZE_BOUNDARIES = [
  { max: 31.5 },  // 24"-31"
  { max: 38.5 },  // 32"-38"
  { max: 45.5 },  // 39"-45"
  { max: 54.5 },  // 46"-54"
  { max: 64.5 },  // 55"-64"
  { max: 74.5 },  // 65"-74"
  { max: 79.5 },  // 75"-79"
  { max: 84.5 },  // 80"-84"
  { max: 89.5 },  // 85"-89"
];
// Index 9 (90" or more) is the fallback when above all boundaries.

function distanceToSizeIdx(cm: number): number {
  const diagonalInches = cm / 2 / 2.54;
  for (let i = 0; i < SIZE_BOUNDARIES.length; i++) {
    if (diagonalInches < SIZE_BOUNDARIES[i].max) return i;
  }
  return SIZE_BOUNDARIES.length; // 90" or more
}

/* Reverse: size index → recommended viewing distance */
const SIZE_AVERAGES_INCHES = [27, 35, 42, 50, 60, 70, 77, 82, 87, 95];

function sizeIdxToDistanceCm(idx: number): number {
  return Math.round(SIZE_AVERAGES_INCHES[idx] * 2 * 2.54);
}

/* TV visual scale factor (CSS transform) — unchanged from original */
function getTvScale(idx: number, total: number): number {
  const minScale = 0.5;
  const maxScale = 1.0;
  return minScale + (idx / Math.max(total - 1, 1)) * (maxScale - minScale);
}

/* Sofa/cabinet image variant based on viewing distance thresholds */
function getVariantSuffix(cmValue: number): "small" | "medium" | "large" {
  if (cmValue < 200) return "small";
  if (cmValue < 400) return "medium";
  return "large";
}

export default function TvSizeFinder({
  heading,
  sizeOptions,
  assets,
}: TvSizeFinderProps) {
  const [distance, setDistance] = useState(160);
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [manualIdx, setManualIdx] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState<"unset" | "distanceFirst" | "tvFirst">("unset");
  const [showLearnMore, setShowLearnMore] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const cmValue = unit === "cm" ? distance : Math.round(distance * 2.54);
  const selectedIdx = manualIdx ?? distanceToSizeIdx(cmValue);
  const tvScale = getTvScale(selectedIdx, sizeOptions.length);
  const effectiveCm = manualIdx !== null ? sizeIdxToDistanceCm(manualIdx) : cmValue;
  const variant = getVariantSuffix(effectiveCm);

  /* Pick the right sofa/cabinet image variant */
  const cabinetSrc =
    variant === "large" && assets.cabinetLarge ? assets.cabinetLarge :
    variant === "medium" && assets.cabinetMedium ? assets.cabinetMedium :
    assets.cabinetImage;
  const sofaSrc =
    variant === "large" && assets.sofaLarge ? assets.sofaLarge :
    variant === "medium" && assets.sofaMedium ? assets.sofaMedium :
    assets.sofaImage;

  const toggleUnit = useCallback((newUnit: "cm" | "in") => {
    if (newUnit === unit) return;
    if (newUnit === "in") {
      setDistance(Math.round(distance / 2.54));
    } else {
      setDistance(Math.round(distance * 2.54));
    }
    setUnit(newUnit);
    setManualIdx(null);
  }, [unit, distance]);

  const handleDistanceChange = useCallback((val: number) => {
    setDistance(val);
    setManualIdx(null);
    setSelectionMode("distanceFirst");
  }, []);

  const handleSizeClick = useCallback((idx: number) => {
    setManualIdx(idx);
    setSelectionMode("tvFirst");
  }, []);

  const scrollCarousel = (dir: "prev" | "next") => {
    if (!carouselRef.current) return;
    const card = carouselRef.current.querySelector("button");
    const amount = card ? card.offsetWidth + 8 : 180;
    carouselRef.current.scrollBy({
      left: dir === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  /* Close modal on Escape */
  useEffect(() => {
    if (!showLearnMore) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLearnMore(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showLearnMore]);

  /* Build recommendation text */
  const selectedLabel = sizeOptions[selectedIdx]?.label ?? "";
  const recommendedDistanceForSize = sizeIdxToDistanceCm(selectedIdx);
  const recommendedDisplay = unit === "cm"
    ? recommendedDistanceForSize
    : Math.round(recommendedDistanceForSize / 2.54);

  return (
    <section className="mb-10">
      <div className="rounded-lg overflow-hidden bg-light-purple">
        {/* Heading */}
        <div className="pt-8 md:pt-10 px-6 md:px-12 text-center">
          <h2 className="text-4xl font-bold text-text-primary my-4 max-lg:px-4 text-balance">
            {heading}
          </h2>
          <h3 className="max-lg:px-4 text-base text-text-primary text-balance">
            Enter the distance{" "}
            <strong className="text-badge font-bold">
              between your sofa and your TV
            </strong>{" "}
            to find the perfect screen size for you:
          </h3>
        </div>

        {/* Room illustration */}
        <div className="flex items-end justify-center px-[5%] py-6 md:py-8 max-w-5xl mx-auto">
          {/* TV + Cabinet (left) */}
          <div className="relative flex-1 shrink-0 h-[280px] md:h-[460px] flex justify-end">
            <div className="relative h-full flex items-center justify-center">
              <Image
                src={assets.tvImage}
                alt="TV"
                width={47}
                height={216}
                className="w-auto"
                style={{
                  height: `${tvScale * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Center: distance input overlay */}
          <div className="flex-1 relative flex items-center h-[280px] md:h-[460px] min-w-[120px]">
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col gap-3 items-center justify-center">
              {/* cm/in toggle pill */}
              <button
                className="pointer-events-auto flex relative gap-1 p-2 rounded-full bg-white border-2 border-primary cursor-pointer items-center"
                onClick={() => toggleUnit(unit === "cm" ? "in" : "cm")}
                aria-label={`Switch to ${unit === "cm" ? "inches" : "centimetres"}`}
              >
                <span className={`relative z-10 rounded-full px-3 pt-0.5 pb-1 text-base transition-all duration-300 ${unit === "cm" ? "text-white" : "text-text-primary"}`}>
                  cm
                </span>
                <span className={`relative z-10 rounded-full px-4 pt-0.5 pb-1 text-base transition-all duration-300 ${unit === "in" ? "text-white" : "text-text-primary"}`}>
                  in
                </span>
                <div
                  className="absolute h-[calc(100%-0.5em)] rounded-full w-[calc(50%-0.5em)] m-2 bg-primary transition-all duration-300"
                  style={{ left: unit === "cm" ? 0 : "calc(50% - 0.5em)" }}
                />
              </button>

              {/* Distance number input */}
              <div className="pointer-events-auto">
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => handleDistanceChange(Number(e.target.value))}
                  className="h-14 text-center text-[30px] rounded-lg border-2 border-primary bg-white text-text-primary p-2 w-40 focus:ring-0 focus:outline-none"
                  min={unit === "cm" ? 50 : 20}
                  max={unit === "cm" ? 500 : 200}
                  aria-label={`Distance in ${unit}`}
                />
              </div>
            </div>
          </div>

          {/* Sofa (right) */}
          <div className="relative flex-1 shrink-0 h-[280px] md:h-[460px] flex justify-start">
            <Image
              src={sofaSrc}
              alt="Sofa"
              width={177}
              height={386}
              className="h-full w-auto object-contain object-bottom"
            />
          </div>
        </div>

        {/* Dynamic recommendation text */}
        <h3 className="text-base text-text-primary text-center pb-4 px-4 text-balance">
          {selectionMode === "unset" && (
            <>
              or{" "}
              <strong className="text-badge font-bold">Choose a TV size</strong>{" "}
              to see the best viewing distance:
            </>
          )}
          {selectionMode === "distanceFirst" && (
            <>
              If you sit{" "}
              <strong className="text-badge font-bold">{distance}{unit}</strong>{" "}
              away, you should consider a TV size{" "}
              <strong className="text-badge font-bold">{selectedLabel}</strong>
            </>
          )}
          {selectionMode === "tvFirst" && (
            <>
              A TV{" "}
              <strong className="text-badge font-bold">{selectedLabel}</strong>{" "}
              is best enjoyed at a distance of{" "}
              <strong className="text-badge font-bold">{recommendedDisplay}{unit}</strong>
            </>
          )}
        </h3>

        {/* Size cards carousel */}
        <div className="relative w-full px-6 max-w-6xl mx-auto pb-6 md:pb-10">
          {/* Left arrow */}
          <button
            onClick={() => scrollCarousel("prev")}
            className="group absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center transition-opacity"
            aria-label="Previous sizes"
          >
            <svg width="39" height="39" viewBox="0 0 39 39" fill="none">
              <circle cx="19.5" cy="19.5" r="19.5" className="fill-[#56707A]/80 group-hover:fill-[#303f44] transition-colors duration-200" />
              <path d="M22 13l-6 6 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Scrollable cards */}
          <div
            ref={carouselRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory mx-auto md:max-w-[830px]"
          >
            {sizeOptions.map((option, idx) => (
              <button
                key={option.label}
                onClick={() => handleSizeClick(idx)}
                className={`p-2 rounded-lg flex-shrink-0 snap-start
                  w-[calc((100%-16px)/3)] min-[500px]:w-[calc((100%-24px)/4)] min-[600px]:w-[calc((100%-32px)/5)] min-[1200px]:w-[calc((100%-40px)/6)]
                  border-2 cursor-pointer transition-colors duration-300 bg-light-purple ${
                  selectedIdx === idx
                    ? "border-primary"
                    : "border-badge/50 hover:border-primary/60"
                }`}
              >
                {option.image ? (
                  <div
                    className="w-full aspect-square bg-cover bg-center mix-blend-darken"
                    style={{ backgroundImage: `url(${option.image})` }}
                  />
                ) : (
                  <div className="w-full aspect-square" />
                )}
                <p className="max-md:text-sm md:text-base text-text-primary text-center mt-1">
                  {option.label}
                </p>
              </button>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scrollCarousel("next")}
            className="group absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center transition-opacity"
            aria-label="Next sizes"
          >
            <svg width="39" height="39" viewBox="0 0 39 39" fill="none">
              <circle cx="19.5" cy="19.5" r="19.5" className="fill-[#56707A]/80 group-hover:fill-[#303f44] transition-colors duration-200" />
              <path d="M17 13l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Learn more — opens modal */}
        <p className="text-center pb-8">
          <button
            onClick={() => setShowLearnMore(true)}
            className="text-xs text-text-secondary hover:text-primary underline cursor-pointer"
          >
            Learn more about how we calculate screen size
          </button>
        </p>
      </div>

      {/* Learn more modal overlay */}
      {showLearnMore && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-badge/60 backdrop-blur-lg"
          onClick={() => setShowLearnMore(false)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-2xl w-[90%] max-h-[90vh] overflow-auto p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Back button */}
            <button
              onClick={() => setShowLearnMore(false)}
              className="flex items-center gap-2 text-primary font-semibold mb-6 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>

            {/* Infographic */}
            <Image
              src="/images/tv-size-finder/infographic-desktop.png"
              alt="Optimal viewing distance is 2 times the TV's diagonal screen width"
              width={1500}
              height={969}
              className="w-full h-auto hidden md:block"
            />
            <Image
              src="/images/tv-size-finder/infographic-mobile.png"
              alt="Optimal viewing distance is 2 times the TV's diagonal screen width"
              width={969}
              height={1500}
              className="w-full h-auto md:hidden"
            />
          </div>
        </div>
      )}
    </section>
  );
}

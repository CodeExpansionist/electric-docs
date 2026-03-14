/**
 * Shared filter matching logic used by both:
 *   - category-data.ts (countMatchingProducts for filter option counts)
 *   - category page (filteredProducts useMemo for display filtering)
 *
 * Single source of truth — any filter logic change only needs to happen here.
 */

import type { CategoryProduct, FilterGroup } from "./category-data";

/** Helper: full text built from product name + specs + badges. */
function fullText(product: CategoryProduct): string {
  return (product.name + " " + product.specs.join(" ") + " " + product.badges.join(" ")).toLowerCase();
}

/**
 * Tests whether a single product matches a single filter option.
 *
 * @param product - The product to test
 * @param groupName - The filter group name (e.g., "Brand", "Price", "Screen Size")
 * @param label - The filter option label (e.g., "Samsung", "£200 to £400", "55\" - 64\"")
 * @returns true if the product matches the filter option
 */
export function doesProductMatchFilter(
  product: CategoryProduct,
  groupName: string,
  label: string
): boolean {
  // Brand — case-insensitive exact match
  if (groupName === "Brand") {
    return product.brand.toLowerCase() === label.toLowerCase();
  }

  // Price — range parsing (handles multiple label formats)
  if (groupName === "Price") {
    if (label.startsWith("Up to") || label.startsWith("Under")) {
      const max = parseFloat(label.replace(/[^0-9.]/g, ""));
      return product.price.current > 0 && product.price.current <= max;
    }
    if (label.includes("and above") || label.includes("and over") || label.startsWith("Over")) {
      const min = parseFloat(label.replace(/[^0-9.]/g, ""));
      return product.price.current >= min;
    }
    const parts = label.match(/£([\d,.]+)\s*(?:to|-)\s*£([\d,.]+)/);
    if (parts) {
      const min = parseFloat(parts[1].replace(",", ""));
      const max = parseFloat(parts[2].replace(",", ""));
      return product.price.current >= min && product.price.current <= max;
    }
    return false;
  }

  // Customer Rating — minimum threshold
  if (groupName === "Customer Rating") {
    const stars = parseInt(label);
    return product.rating.average >= stars;
  }

  // Screen Size — extract inches from product name
  if (groupName === "Screen Size") {
    const size = extractScreenSize(product.name);
    if (!size) return false;
    if (label.includes("or more")) {
      const min = parseInt(label.match(/(\d+)/)?.[1] || "0");
      return size >= min;
    }
    const rangeParts = label.match(/(\d+)[\s"]*\s*[-–]\s*(\d+)/);
    if (rangeParts) return size >= parseInt(rangeParts[1]) && size <= parseInt(rangeParts[2]);
    return false;
  }

  // Type — multi-category handler
  if (groupName === "Type") {
    return matchType(product, label);
  }

  // Screen technology — word-boundary matching to distinguish LED/OLED/QLED
  if (groupName === "Screen technology" || groupName === "TV Technology") {
    if (label === "LED") return /\bLED\b/.test(product.name) && !/(OLED|QLED|Mini\s*LED)/i.test(product.name);
    if (label === "QLED") return /QLED/i.test(product.name) && !/Neo\s*QLED/i.test(product.name);
    if (label === "Mini LED" || label === "Mini-LED") return /Mini[\s-]?LED|Miniled/i.test(product.name);
    return product.name.toLowerCase().includes(label.toLowerCase());
  }

  // Resolution — normalize partial matches
  if (groupName === "Resolution") {
    const name = product.name.toLowerCase();
    if (label.includes("4K")) return /\b4k\b/i.test(product.name);
    if (label.includes("Full HD") || label.includes("1080")) return name.includes("full hd") || name.includes("1080");
    if (label.includes("HD Ready")) return name.includes("hd ready") || name.includes("720");
    return name.includes(label.toLowerCase());
  }

  // Refresh rate — extract Hz value from specs
  if (groupName === "Refresh rate" || groupName === "Refresh Rate") {
    const text = product.specs.join(" ") + " " + product.name;
    const hzMatch = label.match(/(\d+)\s*Hz/i);
    if (!hzMatch) return false;
    const hz = hzMatch[1];
    return text.includes(hz + " Hz") || text.includes(hz + "Hz");
  }

  // Number of HDMI Ports — parse "HDMI x N" from specs
  if (groupName === "Number of HDMI Ports") {
    const specsText = product.specs.join(" ");
    const hdmiMatch = specsText.match(/HDMI\s*\d*\.?\d*\s*x\s*(\d)/i);
    if (!hdmiMatch) return false;
    const fc = parseInt(label.match(/(\d)/)?.[1] || "0");
    return parseInt(hdmiMatch[1]) === fc;
  }

  // Year — match year string in product name
  if (groupName === "Year" || groupName === "Year of Release") {
    return product.name.includes(label);
  }

  // Smart platform — match in name + specs
  if (groupName === "Smart platform" || groupName === "Smart TV Platform") {
    return (product.name + " " + product.specs.join(" ")).toLowerCase().includes(label.toLowerCase());
  }

  // Energy rating — match exact rating letter
  if (groupName === "Energy rating") {
    if (!product.energyRating) return false;
    return product.energyRating.toUpperCase() === label.toUpperCase();
  }

  // Loved by brand — check badges array
  if (groupName === "Loved by Electriz") {
    return product.badges.some((b) => b.toLowerCase().includes("loved by"));
  }

  // Popular screen sizes — range matching for wall brackets
  if (groupName === "Popular screen sizes") {
    const size = extractScreenSize(product.name);
    if (!size) return false;
    if (label.includes("or more") || label.includes("and above")) {
      const min = parseInt(label.match(/(\d+)/)?.[1] || "0");
      return size >= min;
    }
    const rangeParts = label.match(/(\d+)[\s"]*\s*[-–]\s*(\d+)/);
    if (rangeParts) return size >= parseInt(rangeParts[1]) && size <= parseInt(rangeParts[2]);
    const exact = parseInt(label.match(/(\d+)/)?.[1] || "0");
    if (exact) return size === exact;
    return false;
  }

  // Guarantee — match year count in specs
  if (groupName === "Guarantee") {
    const specsText = product.specs.join(" ").toLowerCase();
    const yearMatch = label.match(/(\d+)\s*year/i);
    if (yearMatch) {
      const n = yearMatch[1];
      return specsText.includes(n + " year") || specsText.includes(n + "-year");
    }
    return specsText.includes(label.toLowerCase());
  }

  // Gaming — editorial badge labels
  if (groupName === "Gaming") {
    const text = fullText(product);
    return text.includes(label.toLowerCase());
  }

  // Gaming Technology — keyword extraction
  if (groupName === "Gaming Technology") {
    const text = fullText(product);
    if (label === "HDMI 2.1 or above") return /hdmi\s*2\.[1-9]/i.test(text);
    if (label === "AMD FreeSync") return /freesync/i.test(text);
    if (label === "NVIDIA G-Sync") return /g[\s-]?sync/i.test(text);
    if (label === "Cloud gaming") return /cloud\s*gaming/i.test(text);
    if (label === "AI enhancement") return /ai\s*(enhancement|game|gaming)/i.test(text);
    return text.includes(label.toLowerCase());
  }

  // Sound enhancement — keyword matching
  if (groupName === "Sound enhancement") {
    const text = fullText(product);
    if (label === "AI sound enhancement") return /ai\s*sound/i.test(text);
    if (label === "Object Tracking Sound") return /object\s*tracking/i.test(text) || /ots/i.test(text);
    if (label === "DTS Virtual:X") return /dts\s*virtual/i.test(text);
    if (label === "Sound by Bowers and Wilkins") return /bowers/i.test(text);
    if (label === "Built-in sound bar") return /built[\s-]*in\s*sound/i.test(text);
    return text.includes(label.toLowerCase());
  }

  // Connections — normalize label variants
  if (groupName === "Connections") {
    const text = fullText(product);
    if (label === "HDMI with eARC") return /earc/i.test(text);
    if (label === "Aux-in") return /aux[\s-]?in|3\.5\s*mm/i.test(text);
    if (label === "Co-axial") return /co[\s-]?axial|coaxial/i.test(text);
    if (label === "Apple AirPlay") return /airplay/i.test(text);
    if (label === "4K pass-through") return /4k\s*pass/i.test(text);
    if (label === "Spotify Connect") return /spotify/i.test(text);
    return text.includes(label.toLowerCase());
  }

  // Sound bar design — keyword extraction from descriptive labels
  if (groupName === "Sound bar design") {
    const text = fullText(product);
    if (label === "All-in-one sound bar") return /all[\s-]*in[\s-]*one/i.test(text);
    if (label === "Cinematic sound bar") return /cinematic/i.test(text);
    if (label === "Compact sound bar") return /compact/i.test(text);
    if (label === "Single sound bar") return /single/i.test(text) && /sound\s*bar/i.test(text);
    if (label === "Sound bar with rear speakers") return /rear\s*speaker/i.test(text);
    if (label === "Sound bar with wireless sub") return /wireless\s*sub/i.test(text);
    if (label === "Sound bar with wired sub") return /wired\s*sub/i.test(text);
    if (label === "Wall mountable sound bar") return /wall\s*mount/i.test(text);
    return text.includes(label.toLowerCase());
  }

  // Premium audio technology — keyword matching
  if (groupName === "Premium audio technology") {
    const text = fullText(product);
    if (label === "Speech enhancement tech") return /speech\s*enhance|voice\s*enhance|dialogue\s*enhance/i.test(text);
    if (label === "Upward-firing speakers") return /upward[\s-]*firing|up[\s-]*firing/i.test(text);
    if (label === "Smart sound multi-room") return /multi[\s-]*room/i.test(text);
    if (label === "High-Resolution Audio") return /hi[\s-]*res|high[\s-]*res/i.test(text);
    return text.includes(label.toLowerCase());
  }

  // Number of devices controlled — parse digit from label
  if (groupName === "Number of devices controlled") {
    const text = fullText(product);
    if (label.includes("or more")) {
      const min = parseInt(label.match(/(\d+)/)?.[1] || "0");
      const devMatch = text.match(/(\d+)\s*device/i);
      return devMatch ? parseInt(devMatch[1]) >= min : false;
    }
    return text.includes(label + " device") || text.includes(label + "-device");
  }

  // VESA — pattern matching for "NxN" patterns in specs
  if (groupName === "VESA") {
    const text = fullText(product);
    return text.includes(label.toLowerCase()) || text.includes("vesa " + label.toLowerCase());
  }

  // Max. weight — range parsing
  if (groupName === "Max. weight") {
    const text = fullText(product);
    const kgMatch = label.match(/(\d+)\s*kg/i);
    if (kgMatch) {
      const weightPatterns = text.match(/(\d+(?:\.\d+)?)\s*kg/gi);
      if (!weightPatterns) return false;
      const maxKg = parseInt(kgMatch[1]);
      const isOrMore = label.includes("or more");
      return weightPatterns.some((wp) => {
        const w = parseFloat(wp);
        return isOrMore ? w >= maxKg : w <= maxKg;
      });
    }
    return text.includes(label.toLowerCase());
  }

  // Generic text match — covers Colour, Design, Features,
  // Voice control, Tuner, Smart TV apps, Picture & contrast enhancement,
  // LED backlighting, Accessibility features, 4K Ultra HD, Recording, etc.
  const searchText = fullText(product);
  return searchText.includes(label.toLowerCase());
}

/**
 * Type filter — handles TV types, soundbar types, headphone types, etc.
 * Strips trailing category words and matches by core term.
 */
function matchType(product: CategoryProduct, label: string): boolean {
  const name = product.name;
  const text = fullText(product);

  // Handle "Smart TV projectors" before core extraction —
  // otherwise "Smart" core matches ALL smart TVs
  if (label === "Smart TV projectors") return /projector/i.test(text);

  // Strip trailing category words to get core term
  const core = label
    .replace(/\s+TV(?:s| projectors)?$/i, "")
    .replace(/\s+soundbars?$/i, "")
    .replace(/\s+headphones?$/i, "")
    .trim();

  // --- TV Type patterns ---
  if (core === "OLED") return /\bOLED\b/.test(name) && !/QD.?OLED/i.test(name);
  if (core === "LED") return /\bLED\b/.test(name) && !/(OLED|QLED|Mini\s*LED)/i.test(name);
  if (core === "QLED") return /QLED/i.test(name) && !/Neo\s*QLED/i.test(name);
  if (core === "Mini LED") return /Mini\s*LED|Miniled/i.test(name);
  if (core === "Neo QLED") return /Neo\s*QLED/i.test(name);
  if (core === "Smart") return /smart\s*tv/i.test(name) || text.includes("smart tv");
  if (core === "4K HDR") return /\b4k\b/i.test(name) && /\bhdr\b/i.test(name);
  if (core === "4K ultra HD") return /\b4k\b/i.test(name);
  if (core === "Full HD") return /full\s*hd|1080/i.test(name);
  if (core === "HD ready") return /hd\s*ready|720p/i.test(name);
  if (core === "8K") return /\b8k\b/i.test(name);
  if (core === "QD-OLED") return /QD.?OLED/i.test(name);
  if (core === "Laser") return /laser/i.test(text);
  if (core === "Frame") return /frame\s*tv|the\s*frame/i.test(text);
  if (core === "Lifestyle") return /lifestyle|the\s*frame|the\s*serif/i.test(text);
  if (core === "Freely") return /freely/i.test(text);
  if (core === "QNED") return /QNED/i.test(name);
  if (core === "NanoCell") return /NanoCell/i.test(name);

  // --- Soundbar Type patterns ---
  if (core === "Sound bars" || label === "Sound bars") return /sound\s*bar/i.test(text);
  if (core === "Bluetooth") return /bluetooth/i.test(text);
  if (core === "Wall mounted") return /wall\s*mount/i.test(text);
  if (core === "Dolby Atmos") return /dolby\s*atmos/i.test(text);
  if (core === "Wireless") return /wireless|wi[\s-]?fi/i.test(text);
  if (core === "Soundbar subwoofers" || label === "Soundbar subwoofers") return /subwoofer/i.test(text);
  if (core === "All in one") return /all[\s-]*in[\s-]*one/i.test(text);
  if (core === "5.1 surround sound") return /5\.1|surround/i.test(text);
  if (core === "AV separates" || label === "AV separates") return /av\s*separate|av\s*receiver/i.test(text);
  if (core === "Home cinema speakers" || label === "Home cinema speakers") return /home\s*cinema.*speaker/i.test(text);
  if (core === "Home cinema systems" || label === "Home cinema systems") return /home\s*cinema.*system/i.test(text);
  if (core === "Wired") return /wired/i.test(text) && !/wireless/i.test(text);

  // --- Headphone Type patterns ---
  if (core === "Wireless and bluetooth" || label === "Wireless and bluetooth headphones") return /wireless|bluetooth/i.test(text);
  if (core === "Noise cancelling") return /noise\s*cancel/i.test(text);
  if (core === "Wired") return /wired/i.test(text);
  if (core === "Open ear") return /open[\s-]*ear/i.test(text);
  if (core === "Ambient") return /ambient/i.test(text);
  if (core === "Waterproof") return /waterproof|water[\s-]*resist|ip[x]?\d/i.test(text);
  if (core === "Headphone accessories" || label === "Headphone accessories") return /accessor/i.test(text);

  // --- Blu-ray/DVD Type patterns ---
  if (label === "Blu-ray players") return /blu[\s-]*ray/i.test(text) && !/4k.*blu|uhd.*blu/i.test(text);
  if (label === "4K Ultra HD Blu-ray players") return /4k.*blu|uhd.*blu/i.test(text);
  if (label === "DVD players") return /dvd\s*player/i.test(text);
  if (label === "Portable DVD players") return /portable.*dvd/i.test(text);
  if (label === "3D Blu-ray players") return /3d.*blu/i.test(text);
  if (label === "Blu-ray recorders") return /blu[\s-]*ray.*record/i.test(text);
  if (label === "4K Ultra HD Blu-ray recorders") return /4k.*record/i.test(text);
  if (label === "DVD recorders") return /dvd.*record/i.test(text);

  // --- Radio Type patterns ---
  if (label === "FM radios") return /\bfm\b/i.test(text);
  if (label === "DAB radios") return /\bdab\b/i.test(text);
  if (label === "Retro radios") return /retro/i.test(text);
  if (label === "Clock radios") return /clock/i.test(text);
  if (label === "Boomboxes") return /boombox/i.test(text);
  if (label === "Smart internet radio") return /internet\s*radio|smart\s*radio/i.test(text);
  if (label === "Analogue radios") return /analogue/i.test(text);
  if (label === "Car radios & adapters") return /car\s*radio|car\s*adapter|car\s*dab/i.test(text);

  // --- Cables Type patterns ---
  if (label === "HDMI cables") return /hdmi/i.test(text);
  if (label === "Adapters & splitters") return /adapter|splitter/i.test(text);
  if (label === "Aerial cables") return /aerial/i.test(text);
  if (label === "Audio visual cables") return /audio.*visual|av\s*cable/i.test(text);
  if (label === "Audio cables") return /audio.*cable|3\.5\s*mm|rca/i.test(text);
  if (label === "Optical cables") return /optical/i.test(text);
  if (label === "Satellite cables") return /satellite/i.test(text);
  if (label === "SCART cables") return /scart/i.test(text);

  // --- TV Accessories Type patterns ---
  if (label === "Universal remotes") return /universal/i.test(text);
  if (label === "Sky remotes") return /sky/i.test(text);
  if (label === "Indoor TV Aerials") return /indoor/i.test(text);
  if (label === "Outdoor TV Aerials") return /outdoor/i.test(text);

  // --- Wall Bracket Type patterns ---
  if (label === "Full Motion TV Brackets") return /full\s*motion/i.test(text);
  if (label === "Tilt TV Brackets") return /\btilt\b/i.test(text) && !/swivel/i.test(text);
  if (label === "Fixed TV Brackets") return /\bfixed\b/i.test(text);
  if (label === "Tilt & Swivel TV Brackets") return /tilt.*swivel|swivel.*tilt/i.test(text);
  if (label === "Soundbar Brackets") return /soundbar\s*bracket/i.test(text);

  // Fallback: check all words in core appear in text
  const words = core.toLowerCase().split(/\s+/);
  return words.every((w) => text.includes(w));
}

/**
 * Filter an array of products by multiple active filter groups.
 * Each group uses OR logic (match any selected value), groups use AND logic.
 *
 * @param products - Products to filter
 * @param activeFilters - Map of group name → selected filter values
 * @returns Filtered product array
 */
export function filterProducts(
  products: CategoryProduct[],
  activeFilters: Record<string, string[]>
): CategoryProduct[] {
  let result = [...products];

  Object.entries(activeFilters).forEach(([group, values]) => {
    if (values.length === 0) return;
    // Skip non-product filters
    if (group === "_hideOutOfStock" || group === "Hide out of stock" || group === "Availability") return;

    // Customer Rating special case: use minimum of selected values
    if (group === "Customer Rating") {
      const minRating = Math.min(...values.map((r) => parseInt(r)));
      result = result.filter((p) => p.rating.average >= minRating);
      return;
    }

    // All other groups: product matches if ANY selected value matches (OR logic)
    result = result.filter((p) =>
      values.some((val) => doesProductMatchFilter(p, group, val))
    );
  });

  return result;
}

/**
 * Recalculate filter option counts using the cross-count pattern.
 * For each filter group, counts are computed against products filtered
 * by all active groups EXCEPT that group itself.
 */
export function recalculateFilterCounts(
  filters: FilterGroup[],
  allProducts: CategoryProduct[],
  activeFilters: Record<string, string[]>
): FilterGroup[] {
  return filters.map((group) => {
    const otherFilters: Record<string, string[]> = {};
    for (const [key, vals] of Object.entries(activeFilters)) {
      if (key === group.name) continue;
      if (key.startsWith("_")) continue;
      if (!vals?.length) continue;
      otherFilters[key] = vals;
    }
    const baseProducts = filterProducts(allProducts, otherFilters);

    return {
      ...group,
      options: group.options.map((option) => ({
        ...option,
        count: baseProducts.filter((p) =>
          doesProductMatchFilter(p, group.name, option.label)
        ).length,
      })),
    };
  });
}

/**
 * Extract screen size in inches from a product name.
 * Returns the first plausible size (20-120 inches) or null.
 */
function extractScreenSize(name: string): number | null {
  const sizeMatches = Array.from(name.matchAll(/\b(\d{2,3})(?:"|″|\s)/g));
  return sizeMatches.map((m) => parseInt(m[1])).find((n) => n >= 20 && n <= 120) ?? null;
}

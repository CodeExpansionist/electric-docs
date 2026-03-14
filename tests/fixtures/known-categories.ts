/**
 * Representative category URLs for smoke and regression testing.
 * Uses stable expectations (at least N products) rather than exact counts.
 */

export const CATEGORIES = {
  tvs: {
    url: "/tv-and-audio/televisions/tvs",
    name: "Televisions",
    minProducts: 50,
  },
  headphones: {
    url: "/tv-and-audio/headphones/headphones",
    name: "Headphones",
    minProducts: 20,
  },
  cables: {
    url: "/tv-and-audio/tv-accessories/cables-and-accessories",
    name: "Cables & Accessories",
    minProducts: 10,
  },
};

/** All 14 category URLs for smoke loop testing */
export const ALL_CATEGORY_URLS = [
  "/tv-and-audio/televisions/tvs",
  "/tv-and-audio/dvd-blu-ray-and-home-cinema",
  "/tv-and-audio/dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars",
  "/tv-and-audio/speakers-and-hi-fi-systems",
  "/tv-and-audio/tv-accessories",
  "/tv-and-audio/digital-and-smart-tv",
  "/tv-and-audio/headphones/headphones",
  "/tv-and-audio/tv-accessories/tv-wall-brackets-and-stands/tv-wall-brackets",
  "/tv-and-audio/tv-accessories/cables-and-accessories",
  "/tv-and-audio/tv-accessories/remote-controls",
  "/tv-and-audio/tv-accessories/tv-aerials",
  "/tv-and-audio/radios",
  "/tv-and-audio/dvd-blu-ray-and-home-cinema/blu-ray-and-dvd-players",
  "/tv-and-audio/dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/home-cinema-systems",
];

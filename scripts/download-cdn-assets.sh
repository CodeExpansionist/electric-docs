#!/bin/bash
# Download all CDN banner images and SVG icons locally
# so the site has zero external dependencies at runtime.

set -e

BANNER_DIR="public/images/banners"
ICON_DIR="public/images/icons"
CDN_MEDIA="https://media.electriz.biz/i/electrizprod"
CDN_STATIC="https://electrizprod.a.bigcontent.io/v1/static"

mkdir -p "$BANNER_DIR" "$ICON_DIR"

echo "=== Downloading banner/promo images ==="

# All unique CDN_MEDIA slugs used in source code
MEDIA_SLUGS=(
  # HeroCarousel desktop + mobile
  "wk44-hp-hero-CE-trade-in-hisense-desktop"
  "wk44-hp-hero-CE-trade-in-hisense-mobile"
  "wk44-hp-hero-WG-trade-in-appliances-desktop"
  "wk44-hp-hero-WG-trade-in-appliances-mobile"
  "wk40-hp-hero-WG-efficiency-campaign-desktop"
  "wk40-hp-hero-WG-efficiency-campaign-mobile"
  "wk43-hp-hero-mob-samsung-S26-Ultra-desktop"
  "wk43-hp-hero-mob-samsung-S26-Ultra-mobile"
  # DiscoverOffers
  "wk41-block-QC-RYPC-v1"
  "wk43-block-Samsung-Your-Gift-v1"
  "wk43-block-Chromebook-TV-v1"
  "wk42-block-Free-Delivery-v1"
  "wk43-block-samsung-S26-Base"
  "wk43-block-samsung-book6-pro-laptop"
  "wk40-block-Efficiency-campaign-Samsung-Generic"
  "wk43-block-samsung-buds4-pro"
  "wk42-block-Efficiency-campaign-Hoover"
  # BigBrandDeals
  "wk43-block-XBOX-Console-Game-Pass-v2"
  "wk39-block-Samsung-Strava"
  "wk43-block-Shark-Floorcare"
  "wk43-block-Mac-Trade-In-Top-up"
  "wk37-apple-iphone-17-air-BNPL-9"
  "wk43-block-Dyson-ASOTV-v2"
  "wk43-block-LG-IFC24-v2"
  "wk43-block-Save-up-to-50-on-HB"
  "wk43-block-HP-M110W"
  # Category banners
  "wk43-Banner-CE-Samsung-Your-Gift-Desktop"
  "wk43-Banner-CE-Samsung-Tech-Desktop"
  "wk43-banner-samsung-buds4-pro-FAT-CAT-desktop"
  "pdp-trade-in-header-desktop"
  # Admin logo
  "cb-logo-electriz"
)

downloaded=0
failed=0

for slug in "${MEDIA_SLUGS[@]}"; do
  outfile="$BANNER_DIR/${slug}.webp"
  if [ -f "$outfile" ]; then
    echo "  [skip] $slug (exists)"
    continue
  fi
  url="${CDN_MEDIA}/${slug}?fmt=webp&\$q-large\$"
  echo "  [GET] $slug"
  if curl -sS -L -o "$outfile" -H "Accept: image/webp,image/*" "$url" 2>/dev/null; then
    # Check if we got a real image (not an error page)
    filesize=$(wc -c < "$outfile" | tr -d ' ')
    if [ "$filesize" -lt 1000 ]; then
      echo "  [WARN] $slug seems too small (${filesize} bytes), may be an error"
      failed=$((failed + 1))
    else
      echo "  [OK] $slug (${filesize} bytes)"
      downloaded=$((downloaded + 1))
    fi
  else
    echo "  [FAIL] $slug"
    failed=$((failed + 1))
  fi
done

echo ""
echo "=== Downloading SVG icons ==="

# All unique CDN_STATIC slugs
STATIC_SLUGS=(
  "returns-purple-circle-svg"
  "delivery-purple-circle-svg"
  "repairs-purple-circle-svg"
  "installation-purple-circle-svg"
  "call-center-svg"
  "chat-svg"
  "email-svg"
  "delivery-svg"
)

for slug in "${STATIC_SLUGS[@]}"; do
  outfile="$ICON_DIR/${slug}.svg"
  if [ -f "$outfile" ]; then
    echo "  [skip] $slug (exists)"
    continue
  fi
  url="${CDN_STATIC}/${slug}"
  echo "  [GET] $slug"
  if curl -sS -L -o "$outfile" "$url" 2>/dev/null; then
    filesize=$(wc -c < "$outfile" | tr -d ' ')
    if [ "$filesize" -lt 100 ]; then
      echo "  [WARN] $slug seems too small (${filesize} bytes)"
      failed=$((failed + 1))
    else
      echo "  [OK] $slug (${filesize} bytes)"
      downloaded=$((downloaded + 1))
    fi
  else
    echo "  [FAIL] $slug"
    failed=$((failed + 1))
  fi
done

echo ""
echo "=== Done: $downloaded downloaded, $failed failed ==="

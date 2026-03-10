#!/bin/bash
# Download product images from Curry's CDN for missing products
# Usage: ./scripts/download-images.sh <product-ids-file> [start] [end]

IDS_FILE="${1:-/tmp/missing-product-ids.txt}"
START="${2:-0}"
END="${3:-999999}"
BASE_DIR="/Users/jamesharden/Gucci/donclaw/10/9. Electric/electriz/public/images/products"
CDN="https://media.electriz.biz/i/electrizprod"

downloaded=0
failed=0
line_num=0

while IFS= read -r pid; do
  line_num=$((line_num + 1))
  if [ "$line_num" -le "$START" ] || [ "$line_num" -gt "$END" ]; then
    continue
  fi

  dir="$BASE_DIR/$pid"
  mkdir -p "$dir"

  # Download main listing image
  curl -s -f -L "$CDN/${pid}?fmt=webp&\$g-small\$" -o "$dir/main.webp" 2>/dev/null
  if [ ! -s "$dir/main.webp" ]; then
    rm -f "$dir/main.webp"
  fi

  # Download large image
  curl -s -f -L "$CDN/${pid}?fmt=webp&\$l-large\$" -o "$dir/large.webp" 2>/dev/null
  if [ ! -s "$dir/large.webp" ]; then
    rm -f "$dir/large.webp"
  fi

  # Download thumbnail
  curl -s -f -L "$CDN/${pid}?fmt=webp&\$t-thumbnail\$" -o "$dir/thumb.webp" 2>/dev/null
  if [ ! -s "$dir/thumb.webp" ]; then
    rm -f "$dir/thumb.webp"
  fi

  # Download gallery variants (001-012) and thumbnails
  for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
    variant=$(printf "%03d" "$i")

    # Gallery image
    curl -s -f -L "$CDN/${pid}_${variant}?fmt=webp&\$l-large\$" -o "$dir/gallery_${variant}.webp" 2>/dev/null
    if [ ! -s "$dir/gallery_${variant}.webp" ]; then
      rm -f "$dir/gallery_${variant}.webp"
      break  # Stop when we hit a missing variant
    fi

    # Thumbnail for this variant
    curl -s -f -L "$CDN/${pid}_${variant}?fmt=webp&\$t-thumbnail\$" -o "$dir/thumb_${variant}.webp" 2>/dev/null
    if [ ! -s "$dir/thumb_${variant}.webp" ]; then
      rm -f "$dir/thumb_${variant}.webp"
    fi
  done

  file_count=$(ls "$dir"/*.webp 2>/dev/null | wc -l | tr -d ' ')
  if [ "$file_count" -gt 0 ]; then
    downloaded=$((downloaded + 1))
  else
    failed=$((failed + 1))
    rmdir "$dir" 2>/dev/null
  fi

  # Progress every 25 products
  if [ $((downloaded + failed)) -ne 0 ] && [ $(((downloaded + failed) % 25)) -eq 0 ]; then
    echo "Progress: $((downloaded + failed)) processed ($downloaded ok, $failed failed)"
  fi

done < "$IDS_FILE"

echo "DONE: $downloaded downloaded, $failed failed"

#!/usr/bin/env python3
"""
Parse Currys product page markdown into structured JSON.
Used by the recovery pipeline when firecrawl JSON extraction fails.

Usage:
  python3 scripts/parse-product-markdown.py <input_markdown_file> <output_json_file> <product_id>

  Or as a module:
  from parse_product_markdown import parse_product_markdown
  result = parse_product_markdown(markdown_text, product_id)
"""

import re
import json
import sys
import os


def normalize_md(md: str) -> str:
    """Normalize markdown text — handle escaped newlines from JSON serialization."""
    # The firecrawl result wraps markdown in JSON, which double-escapes newlines.
    # The text contains literal \\n (2 chars: backslash + n) instead of real newlines.
    # Replace ALL literal \\n with real newlines.
    md = md.replace('\\n', '\n')
    # Handle escaped quotes and backslashes
    md = md.replace('\\"', '"')
    md = md.replace('\\\\', '\\')
    return md


def parse_product_markdown(md: str, product_id: str) -> dict:
    """Parse a Currys product page markdown into structured product data."""

    md = normalize_md(md)

    result = {
        "id": product_id,
        "name": "",
        "brand": "",
        "price": {"current": 0, "was": 0, "savings": 0},
        "rating": {"average": 0, "count": 0},
        "description": {"main": "", "features": [], "goodToKnow": []},
        "images": {"gallery": [], "thumbnails": []},
        "keySpecs": [],
        "specifications": {},
        "deliveryInfo": {},
        "sizeVariants": [],
        "crossSellProducts": [],
        "careAndRepair": [],
        "offers": [],
        "badges": [],
        "energyRating": "",
        "category": ""
    }

    # === NAME ===
    # First H1 heading
    h1_match = re.search(r'^# (.+)$', md, re.MULTILINE)
    if h1_match:
        result["name"] = h1_match.group(1).strip()
    else:
        # Fallback: extract from og:title in metadata context or URL
        title_match = re.search(r'ogTitle.*?Buy (.+?) \|', md)
        if title_match:
            result["name"] = title_match.group(1).strip()

    # === BRAND ===
    if result["name"]:
        known_brands = ["LG", "Samsung", "Sony", "Panasonic", "Hisense", "TCL", "Philips",
                       "JVC", "Toshiba", "Sharp", "Bush", "Bose", "Sonos", "JBL", "Sennheiser",
                       "Audio-Technica", "Beats", "Marshall", "Denon", "Yamaha", "KEF",
                       "Bang & Olufsen", "B&O", "SANDSTROM", "LOGIK", "KENWOOD", "Pioneer",
                       "Harman Kardon", "Google", "Amazon", "Apple", "Roku"]
        name_upper = result["name"].upper()
        for brand in known_brands:
            if name_upper.startswith(brand.upper()):
                result["brand"] = brand
                break
        if not result["brand"]:
            result["brand"] = result["name"].split()[0] if result["name"] else ""

    # === RATING ===
    # Pattern: [4.6/5\\n112 reviews] or 4.6/5\n112 reviews
    rating_match = re.search(r'(\d+\.?\d*)/5\s*\\+\s*(\d+)\s*reviews?', md)
    if not rating_match:
        rating_match = re.search(r'(\d+\.?\d*)/5\s*\n\s*(\d+)\s*reviews?', md)
    if not rating_match:
        # Handle escaped backslashes: 4.6/5\\\\\\n112
        rating_match = re.search(r'(\d+\.?\d*)/5[\\n\s]+(\d+)\s*reviews?', md)
    if rating_match:
        result["rating"]["average"] = float(rating_match.group(1))
        result["rating"]["count"] = int(rating_match.group(2))

    # === PRICE ===
    # Pattern: £499.00\n\nSave £100.00\n\nWas £599.00
    price_block = re.search(r'£([\d,]+\.?\d*)\s*\n+\s*Save\s*£([\d,]+\.?\d*)\s*\n+\s*Was\s*£([\d,]+\.?\d*)', md)
    if price_block:
        result["price"]["current"] = float(price_block.group(1).replace(",", ""))
        result["price"]["savings"] = float(price_block.group(2).replace(",", ""))
        result["price"]["was"] = float(price_block.group(3).replace(",", ""))
    else:
        # No sale - look for standalone price after delivery line
        price_match = re.search(r'delivery[^\n]*\n+\*[* ]*\*\s*\n+\s*£([\d,]+\.?\d*)\s*\n', md)
        if not price_match:
            # Try finding first prominent price
            price_match = re.search(r'\n\n£([\d,]+\.?\d*)\n\n', md)
        if price_match:
            result["price"]["current"] = float(price_match.group(1).replace(",", ""))

    # === ENERGY RATING ===
    energy_match = re.search(r'\[!\[([A-G])\]', md)
    if not energy_match:
        energy_match = re.search(r'img-energy-class-([A-G])\.svg', md)
    if energy_match:
        result["energyRating"] = energy_match.group(1)

    # === IMAGES ===
    # Gallery images (large format)
    gallery_urls = re.findall(r'https://cdn\.media\.amplience\.net/i/currysprod/\d+(?:_\d+)?\?\$l-large\$[^\s\)\"\]\\]*', md)
    seen = set()
    unique_gallery = []
    for url in gallery_urls:
        clean = url.rstrip(')')
        if clean not in seen:
            seen.add(clean)
            unique_gallery.append(clean)
    result["images"]["gallery"] = unique_gallery

    # Thumbnail images
    thumb_urls = re.findall(r'https://cdn\.media\.amplience\.net/i/currysprod/\d+(?:_\d+)?\?\$t-thumbnail\$[^\s\)\"\]\\]*', md)
    seen = set()
    unique_thumbs = []
    for url in thumb_urls:
        clean = url.rstrip(')')
        if clean not in seen:
            seen.add(clean)
            unique_thumbs.append(clean)
    result["images"]["thumbnails"] = unique_thumbs

    # === DESCRIPTION ===
    desc_match = re.search(r'Product code:\s*\d+\s*\n+(.+?)(?=\n\n\*\*Good to know\*\*|\n\nGet a 360|View More|View Less)', md, re.DOTALL)
    if desc_match:
        desc_text = desc_match.group(1).strip()
        # Remove markdown bold
        desc_text = re.sub(r'\*\*([^*]+)\*\*', r'\1', desc_text)
        # Remove links
        desc_text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', desc_text)
        # Clean excessive whitespace
        desc_text = re.sub(r'\n{3,}', '\n\n', desc_text).strip()
        result["description"]["main"] = desc_text

    # Good to know
    gtk_match = re.search(r'\*\*Good to know\*\*\s*(.+?)(?=\n\n_{2,}|\n\n\*\*Please note|\n\nGet a 360|\n\n\*\*-)', md, re.DOTALL)
    if gtk_match:
        gtk_text = gtk_match.group(1)
        items = re.findall(r'[-\\]+ (.+?)(?=\n[-\\]|$)', gtk_text)
        if not items:
            items = re.findall(r'[-] (.+)', gtk_text)
        result["description"]["goodToKnow"] = [
            re.sub(r'\*\*([^*]+)\*\*', r'\1', item.strip())
            for item in items if item.strip() and len(item.strip()) > 5
        ]

    # === SPECIFICATIONS ===
    specs_start = md.find('### Technical specifications')
    if specs_start < 0:
        specs_start = md.find('Specifications**]')
        if specs_start > 0:
            # Move forward to find the actual specs content
            next_h3 = md.find('### ', specs_start + 10)
            if next_h3 > 0:
                specs_start = next_h3

    if specs_start > 0:
        # Find end of specs: look for non-spec sections
        specs_end = len(md)
        for end_marker in ['### Delivery', '[**Delivery', "### What's in the box",
                          '### Returns', 'bought together', '### Similar products']:
            pos = md.find(end_marker, specs_start + 100)
            if 0 < pos < specs_end:
                specs_end = pos

        specs_text = md[specs_start:specs_end]

        # Split by ### section headers
        sections = re.split(r'### ([A-Z][A-Z &/\-]+)', specs_text)
        i = 1
        while i < len(sections) - 1:
            section_name = sections[i].strip()
            section_content = sections[i + 1]

            if section_name in ['Delivery', 'Returns', 'DELIVERY', 'RETURNS']:
                break

            # Skip the "Technical specifications for..." header
            if section_name.startswith('Technical'):
                i += 2
                continue

            specs_dict = {}
            # Split content into blocks separated by double newlines
            blocks = re.split(r'\n\n+', section_content.strip())
            j = 0
            while j < len(blocks):
                key = blocks[j].strip()
                # Skip empty, decorative, or non-text blocks
                if not key or key in ['\\', '*', '---', '* * *'] or key.startswith('[') or key.startswith('!'):
                    j += 1
                    continue

                # Next block is the value
                if j + 1 < len(blocks):
                    value = blocks[j + 1].strip()
                    # Clean up value
                    value = re.sub(r'^\\- ', '- ', value)
                    value = value.replace('\\-', '-')
                    value = value.replace('\\n', '\n')

                    if value and value not in ['\\', '*', '---'] and not value.startswith('[') and not value.startswith('!'):
                        specs_dict[key] = value
                        j += 2
                        continue

                j += 1

            if specs_dict:
                result["specifications"][section_name] = specs_dict
            i += 2

    # === CROSS-SELL ===
    crosssell_start = md.find('bought together')
    if crosssell_start > 0:
        crosssell_end = md.find('### Similar', crosssell_start)
        if crosssell_end < 0:
            crosssell_end = md.find('### Recently viewed', crosssell_start)
        if crosssell_end < 0:
            crosssell_end = crosssell_start + 5000

        crosssell_text = md[crosssell_start:crosssell_end]
        cross_products = re.findall(
            r'\[([^\]]+)\]\(https://www\.currys\.co\.uk/products/[^)]+?-(\d+)\.html',
            crosssell_text
        )
        seen_ids = set()
        for name, pid in cross_products:
            if pid != product_id and pid not in seen_ids:
                seen_ids.add(pid)
                name_clean = name.split('\\')[0].strip()
                if name_clean and len(name_clean) > 5:
                    result["crossSellProducts"].append({
                        "id": pid,
                        "name": name_clean
                    })

    # === CARE AND REPAIR ===
    care_match = re.search(r'Care & Repair.*?From\s*£([\d.]+)/mo', md, re.DOTALL)
    if care_match:
        result["careAndRepair"].append({
            "type": "Care & Repair",
            "pricePerMonth": float(care_match.group(1))
        })

    # === CATEGORY ===
    breadcrumb_match = re.search(r'\[TV & Audio\].*?\[([^\]]+)\].*?\[([^\]]+)\]', md)
    if breadcrumb_match:
        result["category"] = breadcrumb_match.group(1)
    elif re.search(r'\b(?:TV|Television|OLED|QLED|LED|LCD)\b', result["name"], re.IGNORECASE):
        result["category"] = "Televisions"
    elif re.search(r'\b(?:Headphone|Earphone|Earbud)\b', result["name"], re.IGNORECASE):
        result["category"] = "Headphones"
    elif re.search(r'\b(?:Soundbar)\b', result["name"], re.IGNORECASE):
        result["category"] = "Soundbars"
    elif re.search(r'\b(?:Speaker|Hi-Fi)\b', result["name"], re.IGNORECASE):
        result["category"] = "Speakers & Hi-Fi"

    # === DELIVERY INFO ===
    if 'Free standard delivery' in md:
        result["deliveryInfo"]["standard"] = "Free standard delivery on orders over £40"
    if 'Next day delivery' in md or 'next day' in md.lower():
        result["deliveryInfo"]["nextDay"] = "Next day delivery available"

    # === OFFERS/BADGES ===
    if result["price"]["savings"] > 0:
        result["offers"].append(f"Save \u00a3{result['price']['savings']:.2f}")

    return result


def parse_from_firecrawl_result(filepath: str, product_id: str) -> dict:
    """Parse a firecrawl tool result file (JSON array format)."""
    with open(filepath) as f:
        data = json.load(f)

    md = ""
    if isinstance(data, list) and data:
        md = data[0].get("text", "")
    elif isinstance(data, dict):
        md = data.get("markdown", "")

    return parse_product_markdown(md, product_id)


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 parse-product-markdown.py <input_file> <output_file> <product_id>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    product_id = sys.argv[3]

    result = parse_from_firecrawl_result(input_file, product_id)

    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2)

    print(f"Parsed: {result['name']}")
    print(f"  Price: \u00a3{result['price']['current']}")
    print(f"  Rating: {result['rating']['average']}/5 ({result['rating']['count']} reviews)")
    print(f"  Gallery images: {len(result['images']['gallery'])}")
    print(f"  Spec sections: {len(result['specifications'])}")
    for section, specs in result['specifications'].items():
        print(f"    {section}: {len(specs)} items")

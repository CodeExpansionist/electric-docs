#!/usr/bin/env python3
"""
Parse product data from Firecrawl markdown output.
Reads a Firecrawl tool result JSON file and extracts product information.

Usage: python3 scripts/parse-markdown-products.py <input_json> [output_json]
"""

import json
import sys
import re


def normalize_text(text):
    """Normalize escaped characters in Firecrawl markdown."""
    text = text.replace('\\\\\\\\\\n', '\n')
    text = text.replace('\\\\\\n', '\n')
    text = text.replace('\\\\n', '\n')
    text = text.replace('\\n', '\n')
    return text


BRAND_LIST = [
    'Samsung', 'LG', 'Sony', 'Hisense', 'TCL', 'Philips', 'Panasonic',
    'JVC', 'Toshiba', 'Sharp', 'Logik', 'Loewe', 'Bose', 'Sonos',
    'JBL', 'Marshall', 'Bang & Olufsen', 'Sennheiser', 'Apple',
    'Google', 'Amazon', 'Beats', 'Jabra', 'Bowers & Wilkins',
    'Audio-Technica', 'Skullcandy', 'Denon', 'Yamaha', 'KEF',
    'Roberts', 'Pure', 'Belkin', 'Vogels', 'One For All',
    'AVF', 'Sanus', 'Monster', 'Roku', 'NOW', 'Sandstrom',
    'Groov-e', 'Majority', 'Klipsch', 'Edifier', 'Harman Kardon',
    'Cambridge Audio', 'Wharfedale', 'Q Acoustics', 'Dali',
    'Mission', 'Monitor Audio', 'Focal', 'Ruark', 'Naim',
    'OTTIE', 'Sky', 'Cello', 'Grundig', 'Nokia', 'Finlux',
    'Bang', 'B&W', 'Ultimate Ears', 'UE', 'Technics', 'Marantz',
    'JLab', 'Anker', 'Nothing', 'Google Pixel', 'OnePlus',
    'Shokz', 'SteelSeries', 'HyperX', 'Corsair', 'Razer',
    'Turtle Beach', 'Astro', 'Plantronics', 'Poly',
]


def extract_brand(name):
    """Extract brand from product name."""
    name_upper = name.upper()
    for brand in BRAND_LIST:
        if name_upper.startswith(brand.upper()):
            return brand
    # Fallback: first word if capitalized
    parts = name.split()
    if parts and parts[0][0].isupper() and len(parts[0]) > 1:
        return parts[0]
    return ''


def parse_markdown_products(raw_text):
    """Extract products from Firecrawl markdown text."""
    text = normalize_text(raw_text)
    products = {}

    # Step 1: Extract all product names and URLs
    product_pattern = re.compile(
        r'\[\*\*(.+?)\*\*\]\(https://www\.electriz\.co\.uk(/products/[^\)]+?-(\d{7,8})\.html)\)'
    )
    for m in product_pattern.finditer(text):
        name, url, pid = m.group(1), m.group(2), m.group(3)
        if pid not in products:
            products[pid] = {
                'name': name,
                'url': url,
                'productId': pid,
                'brand': extract_brand(name),
                'price': {'current': 0, 'was': None, 'savings': None},
                'rating': {'average': 0, 'count': 0},
                'imageUrl': f"https://media.electriz.biz/i/electrizprod/{pid}?$g-small$&fmt=auto",
                'specs': [],
                'badges': [],
                'offers': [],
                'deliveryFree': True,
                'energyRating': None,
            }

    # Step 2: Extract prices from price blocks
    # Pattern: [£PRICE ... per month ... ](URL_with_productId)
    price_block_pattern = re.compile(
        r'\[£([\d,]+\.?\d*)\s*\n.*?-(\d{7,8})\.html\)',
        re.DOTALL
    )
    for m in price_block_pattern.finditer(text):
        price_str, pid = m.group(1), m.group(2)
        if pid in products and products[pid]['price']['current'] == 0:
            products[pid]['price']['current'] = float(price_str.replace(',', ''))

    # Also look for standalone price links without "per month"
    price_standalone = re.compile(
        r'\[£([\d,]+\.?\d*)\]\(https://www\.electriz\.co\.uk/products/[^\)]*-(\d{7,8})\.html\)'
    )
    for m in price_standalone.finditer(text):
        price_str, pid = m.group(1), m.group(2)
        if pid in products and products[pid]['price']['current'] == 0:
            products[pid]['price']['current'] = float(price_str.replace(',', ''))

    # Step 3: Extract was prices and savings
    was_pattern = re.compile(r'Was\s*£([\d,]+\.?\d*).*?-(\d{7,8})\.html', re.DOTALL)
    for m in was_pattern.finditer(text):
        was_str, pid = m.group(1), m.group(2)
        if pid in products:
            products[pid]['price']['was'] = float(was_str.replace(',', ''))

    save_pattern = re.compile(r'Save\s*£([\d,]+\.?\d*).*?-(\d{7,8})\.html', re.DOTALL)
    for m in save_pattern.finditer(text):
        save_str, pid = m.group(1), m.group(2)
        if pid in products:
            products[pid]['price']['savings'] = float(save_str.replace(',', ''))

    # Step 4: Extract ratings and reviews
    # Pattern: [X.XX\nout of 5 stars ... N reviews](URL_with_productId)
    rating_pattern = re.compile(
        r'\[(\d+\.?\d*)\s*\nout of 5 stars.*?(\d+)\s*reviews?\]\(https://www\.electriz\.co\.uk/products/[^\)]*-(\d{7,8})\.html\)',
        re.DOTALL
    )
    for m in rating_pattern.finditer(text):
        rating, reviews, pid = float(m.group(1)), int(m.group(2)), m.group(3)
        if pid in products and products[pid]['rating']['average'] == 0:
            products[pid]['rating']['average'] = rating
            products[pid]['rating']['count'] = reviews

    # Step 5: Extract specs - find bullet points between product name and price
    for pid, p in products.items():
        # Find a block that has this product's specs
        url_pattern = re.escape(pid + '.html)')
        for m in re.finditer(url_pattern, text):
            pos = m.start()
            chunk = text[pos:pos + 2500]
            lines = chunk.split('\n')
            specs = []
            for line in lines:
                line = line.strip()
                if line.startswith('- ') and len(line) > 5:
                    spec = line[2:].strip()
                    if not any(x in spec.lower() for x in [
                        'refine by', 'delivery', 'collect from', 'hide out',
                        'show result', 'clear all', 'tvs(', 'show all',
                    ]):
                        specs.append(spec)
            if specs and not p['specs']:
                p['specs'] = specs[:8]

    # Step 6: Extract offers
    offer_pattern = re.compile(
        r'\[([^\]]*(?:cashback|more offers|free gift|claim|trade-in|TRADE)[^\]]*)\]\(https://www\.electriz\.co\.uk/products/[^\)]*-(\d{7,8})\.html\)',
        re.IGNORECASE
    )
    for m in offer_pattern.finditer(text):
        offer_text, pid = m.group(1).strip(), m.group(2)
        if pid in products and not products[pid]['offers']:
            if 5 < len(offer_text) < 200:
                products[pid]['offers'] = [offer_text]

    # Step 7: For products still missing prices, try a broader search
    for pid, p in products.items():
        if p['price']['current'] == 0:
            # Search backwards from each product occurrence for nearest price
            for m in re.finditer(re.escape(pid), text):
                pos = m.start()
                after = text[pos:pos + 3000]
                # Find £PRICE that looks like a product price (> £10)
                for pm in re.finditer(r'£([\d,]+\.?\d*)', after):
                    price = float(pm.group(1).replace(',', ''))
                    if price >= 10:  # Filter out cashback amounts like £5, £10
                        p['price']['current'] = price
                        break
                if p['price']['current'] > 0:
                    break

    return products


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 parse-markdown-products.py <input_json> [output_json]")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    with open(input_file, 'r') as f:
        data = json.load(f)

    if isinstance(data, list):
        text = data[0].get('text', '')
    elif isinstance(data, dict):
        text = data.get('markdown', data.get('text', ''))
    else:
        text = str(data)

    products = parse_markdown_products(text)

    total = len(products)
    with_price = sum(1 for p in products.values() if p['price']['current'] > 0)
    with_rating = sum(1 for p in products.values() if p['rating']['average'] > 0)
    with_specs = sum(1 for p in products.values() if p['specs'])
    with_offers = sum(1 for p in products.values() if p['offers'])

    print(f"Total: {total} | Price: {with_price} | Rating: {with_rating} | Specs: {with_specs} | Offers: {with_offers}")

    if output_file:
        with open(output_file, 'w') as f:
            json.dump(list(products.values()), f, indent=2)
        print(f"Saved to {output_file}")
    else:
        for i, (pid, p) in enumerate(products.items()):
            if i >= 5:
                break
            print(f"  {p['brand']:12s} £{p['price']['current']:>8.2f}  {p['rating']['average']}/5 ({p['rating']['count']:>4d})  {p['name'][:55]}")


if __name__ == '__main__':
    main()

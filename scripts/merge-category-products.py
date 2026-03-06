#!/usr/bin/env python3
"""
Merge parsed product JSON files into category JSON files.
Deduplicates by productId, preserves existing data structure.

Usage: python3 scripts/merge-category-products.py
"""

import json
import os
import sys

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'scrape')

# Category definitions: category file -> list of parsed JSON files to merge
CATEGORIES = {
    'category-tvs.json': {
        'sources': [
            '/tmp/tvs-page1.json',
            '/tmp/tvs-page2.json',
            '/tmp/tvs-page3.json',
            '/tmp/tvs-page4.json',
            '/tmp/tvs-page5.json',
        ],
        'categoryName': 'TVs',
        'categorySlug': 'televisions/tvs',
    },
    'headphones.json': {
        'sources': [
            '/tmp/headphones-page1.json',
            '/tmp/headphones-page2.json',
            '/tmp/headphones-page3.json',
            '/tmp/headphones-page4.json',
            '/tmp/headphones-page5.json',
            '/tmp/headphones-page6.json',
            '/tmp/headphones-page7.json',
            '/tmp/headphones-page8.json',
            '/tmp/headphones-page9.json',
        ],
        'categoryName': 'Headphones',
        'categorySlug': 'headphones/headphones',
    },
    'soundbars.json': {
        'sources': [
            '/tmp/soundbars-page1.json',
            '/tmp/soundbars-page2.json',
        ],
        'categoryName': 'Sound Bars',
        'categorySlug': 'dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars',
    },
    'speakers-hifi.json': {
        'sources': [
            '/tmp/speakers-page1.json',
            '/tmp/speakers-page2.json',
            '/tmp/speakers-page3.json',
            '/tmp/speakers-page4.json',
            '/tmp/speakers-page5.json',
        ],
        'categoryName': 'HiFi & Speakers',
        'categorySlug': 'speakers-and-hi-fi-systems',
    },
    'tv-accessories.json': {
        'sources': [
            '/tmp/tvaccess-wallbrackets.json',
            '/tmp/tvaccess-stands.json',
            '/tmp/tvaccess-remotes.json',
            '/tmp/tvaccess-aerials.json',
            '/tmp/tvaccess-cables.json',
        ],
        'categoryName': 'TV Accessories',
        'categorySlug': 'tv-accessories',
    },
    'dvd-blu-ray.json': {
        'sources': [
            '/tmp/dvd-players.json',
            '/tmp/home-cinema.json',
        ],
        'categoryName': 'DVD, Blu-ray & Home Cinema',
        'categorySlug': 'dvd-blu-ray-and-home-cinema',
    },
    'digital-smart-tv.json': {
        'sources': [
            '/tmp/digital-smarttv.json',
        ],
        'categoryName': 'Digital & Smart TV',
        'categorySlug': 'digital-and-smart-tv',
    },
}


def load_existing_category(filepath):
    """Load existing category JSON and extract products + filters."""
    if not os.path.exists(filepath):
        return {'products': [], 'filters': []}
    with open(filepath, 'r') as f:
        data = json.load(f)
    return data


def merge_products(existing_products, new_products):
    """Merge products, deduplicating by productId. New data wins for conflicts."""
    by_id = {}

    # First add existing products
    for p in existing_products:
        pid = p.get('productId', '')
        if pid:
            by_id[pid] = p

    # Then add/override with new products
    for p in new_products:
        pid = p.get('productId', '')
        if pid:
            # If existing product has more data (e.g., from detailed scrape), merge carefully
            if pid in by_id:
                existing = by_id[pid]
                # Keep existing data if it has fields the new one doesn't
                merged = {**p}
                # Preserve existing price if new one is 0
                if merged['price']['current'] == 0 and existing.get('price', {}).get('current', 0) > 0:
                    merged['price'] = existing['price']
                # Preserve existing rating if new one is 0
                if merged['rating']['average'] == 0 and existing.get('rating', {}).get('average', 0) > 0:
                    merged['rating'] = existing['rating']
                # Preserve existing specs if new one is empty
                if not merged.get('specs') and existing.get('specs'):
                    merged['specs'] = existing['specs']
                by_id[pid] = merged
            else:
                by_id[pid] = p

    return list(by_id.values())


def main():
    print("Merging parsed products into category JSONs...\n")

    total_products = 0

    for filename, config in CATEGORIES.items():
        filepath = os.path.join(DATA_DIR, filename)

        # Load existing category data
        existing_data = load_existing_category(filepath)
        existing_products = existing_data.get('products', [])
        existing_filters = existing_data.get('filters', [])

        # Load all new source files
        new_products = []
        for src in config['sources']:
            if os.path.exists(src):
                with open(src, 'r') as f:
                    products = json.load(f)
                new_products.extend(products)
                print(f"  Loaded {len(products)} from {os.path.basename(src)}")
            else:
                print(f"  WARNING: {src} not found, skipping")

        # Merge
        merged = merge_products(existing_products, new_products)

        # Build output structure matching existing format
        output = {
            'categoryName': config['categoryName'],
            'categorySlug': config['categorySlug'],
            'totalProducts': len(merged),
            'filters': existing_filters,  # Preserve existing filters
            'products': merged,
        }

        # Preserve any extra fields from existing data
        for key in existing_data:
            if key not in output:
                output[key] = existing_data[key]

        # Write output
        with open(filepath, 'w') as f:
            json.dump(output, f, indent=2)

        print(f"  {config['categoryName']}: {len(existing_products)} existing + {len(new_products)} new -> {len(merged)} unique products")
        print(f"  Saved to {filepath}\n")
        total_products += len(merged)

    print(f"\nTotal: {total_products} products across all categories")


if __name__ == '__main__':
    main()

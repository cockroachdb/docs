#!/usr/bin/env python3
"""
audit.py

An audit script that:
1) Finds cross-version links (categorized by location).
2) Finds cockroachlabs.com non-docs links.
3) Finds external (non-cockroachlabs.com) links.
4) Audits image/CSS/JS/font usage, categorizing them as present, missing, or external.

**This version** uses a "fallback" approach in asset_status() so
we do *not* unconditionally remove "/docs/" from the path. Instead,
we generate multiple candidate paths and see if any match the disk.
"""

import os
import sys
import re
import argparse
from bs4 import BeautifulSoup
from urllib.parse import urlparse

def is_cross_version_link(url, current_version):
    """
    Return (True, found_version) if `url` is a docs link pointing to a different version.
    E.g. /docs/v19.2/... vs current_version v21.1
    """
    match = re.search(r'/docs/(v\d+\.\d+)', url)
    if match:
        version = match.group(1)
        return (version != current_version, version)
    return (False, None)

def categorize_cross_version_link(tag):
    """
    For cross-version links, figure out if they're in the sidebar, version-switcher, or body.
    """
    if tag.find_parent(id="sidebar"):
        return "Sidebar Navigation"
    elif tag.find_parent(id="version-switcher"):
        return "Version Switcher"
    else:
        return "Content Body"

def find_assets(soup):
    """
    Return a dict: { "images": set(), "css": set(), "js": set(), "fonts": set() }
    by scanning <img>, <link rel="stylesheet">, <script src>, and known font links.
    """
    assets = {"images": set(), "css": set(), "js": set(), "fonts": set()}

    # IMAGES
    for img in soup.find_all('img'):
        src = img.get('src')
        if src:
            assets["images"].add(src)

    # CSS (<link rel="stylesheet" href="...">)
    for link in soup.find_all('link', rel=lambda x: x and "stylesheet" in x.lower()):
        href = link.get('href')
        if href:
            assets["css"].add(href)

    # JS (<script src="...">)
    for script in soup.find_all('script'):
        src = script.get('src')
        if src:
            assets["js"].add(src)

    # FONT references: Google Fonts or fonts.gstatic.com
    for link in soup.find_all('link'):
        href = link.get('href')
        if href and ("fonts.googleapis.com" in href or "fonts.gstatic.com" in href):
            assets["fonts"].add(href)

    return assets

def asset_status(url, base_dir):
    """
    Decide if 'url' is external (http/https), present, or missing.

    We:
      - If scheme is http/https => "external"
      - Otherwise, we generate fallback paths, see if *any* exist in base_dir.
    """
    parsed = urlparse(url)
    if parsed.scheme in ['http', 'https']:
        return "external"

    # The path from the URL (no query, no fragment).
    # e.g. /docs/images/icons/icon-envelope.png
    raw_path = parsed.path or ""
    # e.g. some might not have path at all, fallback to empty.

    # We'll build candidate paths. For example, if raw_path is:
    #    /docs/images/icons/icon-envelope.png
    # We'll try each of these:
    #
    # 1)  "docs/images/icons/icon-envelope.png"    (just remove leading slash)
    # 2)  "images/icons/icon-envelope.png"         (if #1 starts with 'docs/')
    # 3)  "images/docs/images/icons/icon-envelope.png"  (prefix images/ if #1 doesn't start with 'images/')
    # 4)  "images/images/icons/icon-envelope.png"        (prefix images/ if #2 doesn't start with 'images/')
    #
    # The idea is that we do not forcibly remove '/docs/', but we try a version with it and a version without it.
    # Then we see which one actually exists.

    candidates = set()

    # candidate A: strip leading slash
    candA = raw_path.lstrip('/')  # e.g. "docs/images/icons/icon-envelope.png"
    if candA:
        candidates.add(candA)

        # candidate B: if candA starts with "docs/", remove it
        if candA.startswith("docs/"):
            candB = candA[len("docs/"):]  # e.g. "images/icons/icon-envelope.png"
            candidates.add(candB)

    # We'll also build a new set that includes "images/" prefix if not present
    # because some doc sites reference "/docs/images/foo" but on disk
    # it's literally "images/foo" or "docs/images/foo".
    all_with_images = set()
    for c in candidates:
        if not c.startswith("images/"):
            all_with_images.add("images/" + c)
    # Merge them in.
    candidates = candidates.union(all_with_images)

    # Now see if any candidate path actually exists in base_dir.
    if isinstance(base_dir, list):
        for d in base_dir:
            d_abs = os.path.abspath(d)
            for c in candidates:
                full = os.path.join(d_abs, c)
                if os.path.exists(full):
                    return "present"
    else:
        d_abs = os.path.abspath(base_dir)
        for c in candidates:
            full = os.path.join(d_abs, c)
            if os.path.exists(full):
                return "present"

    return "missing"

def audit_html_file(file_path, current_version, asset_base_dirs):
    """
    Parse a single HTML file to find cross-version links, cockroachlabs.com non-docs,
    external links, and asset usage statuses.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()
    soup = BeautifulSoup(html, 'html.parser')

    # Cross-version links
    cross_version_links = []
    for a in soup.find_all('a'):
        href = a.get('href')
        if not href:
            continue
        cross, ver = is_cross_version_link(href, current_version)
        if cross:
            cat = categorize_cross_version_link(a)
            cross_version_links.append((href, ver, cat))

    # cockroachlabs.com non-docs & external
    cockroachlabs_non_docs_links = []
    external_links = []
    for a in soup.find_all('a'):
        href = a.get('href')
        if not href:
            continue
        parsed = urlparse(href)
        if parsed.netloc:
            if 'cockroachlabs.com' in parsed.netloc:
                # If the path is not under /docs/ => non-docs link
                if not parsed.path.startswith("/docs/"):
                    cockroachlabs_non_docs_links.append(href)
            else:
                external_links.append(href)

    # Assets
    assets_found = find_assets(soup)
    asset_details = {
        "images": {"present": set(), "missing": set(), "external": set()},
        "css":    {"present": set(), "missing": set(), "external": set()},
        "js":     {"present": set(), "missing": set(), "external": set()},
        "fonts":  {"present": set(), "missing": set(), "external": set()}
    }
    for asset_type, urls in assets_found.items():
        base = asset_base_dirs.get(asset_type)
        for url in urls:
            st = asset_status(url, base)
            asset_details[asset_type][st].add(url)

    return {
        "file": file_path,
        "cross_version_links": cross_version_links,
        "cockroachlabs_non_docs_links": cockroachlabs_non_docs_links,
        "external_links": external_links,
        "asset_details": asset_details,
    }

def audit_directory(directory, current_version, asset_base_dirs):
    """
    Recursively scan all *.html in `directory`. Return a list of per-file results.
    """
    results = []
    for root, dirs, files in os.walk(directory):
        for filename in files:
            if filename.endswith('.html'):
                path = os.path.join(root, filename)
                try:
                    info = audit_html_file(path, current_version, asset_base_dirs)
                    results.append(info)
                except Exception as e:
                    print(f"Error processing {path}: {e}")
    return results

def generate_summary_report(results, output_file, current_version):
    """
    Summarize:
      1) Big picture
      2) Detailed aggregated data
      3) Per-file detail
    """
    total_cross = 0
    cross_by_category = {}
    cockroachlabs_non_docs_counter = {}
    external_links_counter = {}

    aggregated_assets = {
        "images": {"present": {}, "missing": {}, "external": {}},
        "css":    {"present": {}, "missing": {}, "external": {}},
        "js":     {"present": {}, "missing": {}, "external": {}},
        "fonts":  {"present": {}, "missing": {}, "external": {}},
    }

    # Aggregate
    for r in results:
        # Cross-version
        total_cross += len(r["cross_version_links"])
        for (_, ver, cat) in r["cross_version_links"]:
            cross_by_category[cat] = cross_by_category.get(cat, 0) + 1

        # Non-docs
        for link in r["cockroachlabs_non_docs_links"]:
            cockroachlabs_non_docs_counter[link] = cockroachlabs_non_docs_counter.get(link, 0) + 1

        # External
        for link in r["external_links"]:
            external_links_counter[link] = external_links_counter.get(link, 0) + 1

        # Assets
        for asset_type, detail in r["asset_details"].items():
            for st in ["present", "missing", "external"]:
                for url in detail[st]:
                    aggregated_assets[asset_type][st][url] = \
                        aggregated_assets[asset_type][st].get(url, 0) + 1

    with open(output_file, 'w', encoding='utf-8') as f:
        # 1) Big Picture
        f.write("="*60 + "\n")
        f.write("                    AUDIT SUMMARY REPORT\n")
        f.write("="*60 + "\n\n")
        f.write(f"Docs version audited: {current_version}\n\n")

        # Cross-version summary
        f.write("--------- Cross-Version Links ---------\n")
        f.write(f"Total cross-version links: {total_cross}\n")
        f.write("Breakdown by category:\n")
        for cat, cnt in cross_by_category.items():
            f.write(f"  {cat}: {cnt}\n")
        f.write("\n")

        # Cockroachlabs.com Non-Docs
        total_crl = sum(cockroachlabs_non_docs_counter.values())
        f.write("--------- Cockroachlabs.com Non-Docs Links ---------\n")
        f.write(f"Total cockroachlabs.com links that are non-docs: {total_crl}\n\n")

        # External
        total_ext = sum(external_links_counter.values())
        f.write("--------- External Links (non-cockroachlabs.com) ---------\n")
        f.write(f"Total external links: {total_ext}\n\n")

        # Assets summary
        f.write("--------- Assets Summary ---------\n")
        for asset_type, st_dict in aggregated_assets.items():
            total_ref = sum(st_dict[s].get(u, 0) for s in st_dict for u in st_dict[s])
            present_count = sum(st_dict["present"].values())
            missing_count = sum(st_dict["missing"].values())
            external_count = sum(st_dict["external"].values())
            f.write(f"{asset_type.upper()}:\n")
            f.write(f"  Total referenced: {total_ref}\n")
            f.write(f"  Present locally: {present_count}\n")
            f.write(f"  Missing (referenced but not found locally): {missing_count}\n")
            f.write(f"  External (absolute URLs): {external_count}\n\n")

        # 2) Detailed Aggregated Data
        f.write("="*60 + "\n")
        f.write("               DETAILED AGGREGATED DATA\n")
        f.write("="*60 + "\n\n")

        # Non-docs
        f.write("--------- Cockroachlabs.com Non-Docs Links ---------\n")
        f.write("Detailed list (URL: occurrence count):\n")
        for link, cnt in sorted(cockroachlabs_non_docs_counter.items(), key=lambda x: x[1], reverse=True):
            f.write(f"  {link}: {cnt}\n")
        f.write("\n")

        # External
        f.write("--------- External Links (non-cockroachlabs.com) ---------\n")
        f.write("Detailed list (URL: occurrence count):\n")
        for link, cnt in sorted(external_links_counter.items(), key=lambda x: x[1], reverse=True):
            f.write(f"  {link}: {cnt}\n")
        f.write("\n")

        # Assets detail
        for asset_type, st_dict in aggregated_assets.items():
            f.write(f"--------- {asset_type.upper()} ---------\n")
            for st in ["present", "missing", "external"]:
                f.write(f"{st.capitalize()} (URL: occurrence count):\n")
                for url, cnt in sorted(st_dict[st].items(), key=lambda x: x[1], reverse=True):
                    f.write(f"  {url}: {cnt}\n")
                f.write("\n")

        # 3) Per-File Data
        f.write("="*60 + "\n")
        f.write("              DETAILED PER-FILE AUDIT DATA\n")
        f.write("="*60 + "\n\n")
        for r in results:
            f.write(f"File: {r['file']}\n")
            # Cross-version
            f.write("  Cross-version links:\n")
            if r["cross_version_links"]:
                for (link, ver, cat) in r["cross_version_links"]:
                    f.write(f"    [{cat}] {link} (target version: {ver})\n")
            else:
                f.write("    None\n")

            # Non-docs
            f.write("  Cockroachlabs.com non-docs links:\n")
            if r["cockroachlabs_non_docs_links"]:
                for link in r["cockroachlabs_non_docs_links"]:
                    f.write(f"    {link}\n")
            else:
                f.write("    None\n")

            # External
            f.write("  External links:\n")
            if r["external_links"]:
                for link in r["external_links"]:
                    f.write(f"    {link}\n")
            else:
                f.write("    None\n")

            # Asset details
            f.write("  Asset details:\n")
            for asset_type, detail in r["asset_details"].items():
                f.write(f"    {asset_type.upper()}:\n")
                for st in ["present", "missing", "external"]:
                    items = detail[st]
                    f.write(f"      {st.capitalize()}: {len(items)}\n")
                    for u in sorted(items):
                        f.write(f"        {u}\n")
            f.write("\n")

    print(f"Audit report written to: {output_file}")

def main():
    parser = argparse.ArgumentParser(
        description="Audit rendered docs for cross-version links, external links, and asset usage."
    )
    parser.add_argument("directory", help="Path to the HTML files directory (e.g. /_site/docs/v19.2)")
    parser.add_argument("current_version", help="Docs version (e.g. v19.2)")
    parser.add_argument("--output", default="audit_report.txt",
                        help="Output file for the audit report.")
    parser.add_argument("--assets-dir", help="Dir for CSS, JS, fonts. (optional)")
    parser.add_argument("--images-dir", help="Comma-separated list of images directories.")
    args = parser.parse_args()

    if args.assets_dir:
        base_assets_dir = os.path.abspath(args.assets_dir)
    else:
        # default fallback: two levels up
        base_assets_dir = os.path.abspath(
            os.path.join(args.directory, os.pardir, os.pardir)
        )

    # parse images dirs
    if args.images_dir:
        images_dirs = [os.path.abspath(x.strip()) for x in args.images_dir.split(',')]
    else:
        images_dirs = [base_assets_dir]

    # prepare the base dir mapping
    asset_base_dirs = {
        "images": images_dirs,
        "css": base_assets_dir,
        "js": base_assets_dir,
        "fonts": base_assets_dir,
    }

    results = audit_directory(args.directory, args.current_version, asset_base_dirs)
    generate_summary_report(results, args.output, args.current_version)

if __name__ == "__main__":
    main()

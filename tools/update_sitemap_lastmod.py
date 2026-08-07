#!/usr/bin/env python3
"""Update sitemap lastmod values for HTML paths received on stdin."""

from __future__ import annotations

import sys
import xml.etree.ElementTree as ET
from datetime import date
from pathlib import Path


SITE = "https://www.bespringchem.com"
ROOT = Path(__file__).resolve().parents[1]
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
ET.register_namespace("", NS)


def url_for(relative: str) -> str:
    relative = relative.replace("\\", "/").lstrip("./")
    if relative == "index.html":
        return SITE + "/"
    if relative.endswith("/index.html"):
        return SITE + "/" + relative[: -len("index.html")]
    return SITE + "/" + relative


def main() -> None:
    changed = {
        url_for(line.strip().strip('"'))
        for line in sys.stdin
        if line.strip().strip('"').endswith(".html")
    }
    sitemap = ROOT / "sitemap.xml"
    tree = ET.parse(sitemap)
    updated = 0
    for node in tree.getroot().findall(f"{{{NS}}}url"):
        loc = node.find(f"{{{NS}}}loc")
        if loc is None or loc.text not in changed:
            continue
        lastmod = node.find(f"{{{NS}}}lastmod")
        if lastmod is None:
            lastmod = ET.SubElement(node, f"{{{NS}}}lastmod")
        lastmod.text = date.today().isoformat()
        updated += 1
    tree.write(sitemap, encoding="utf-8", xml_declaration=True)
    print(f"Updated {updated} sitemap lastmod entries.")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Regression audit for the nine requested Spanish food-product pages."""

from __future__ import annotations

import json
import urllib.parse
import xml.etree.ElementTree as ET
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.bespringchem.com"
SLUGS = (
    "diammonium-phosphate-dap", "food-phosphate-blends", "phosphoric-acid-85",
    "monoammonium-phosphate-map", "sodium-diacetate", "sodium-benzoate",
    "calcium-sorbate", "silicon-dioxide", "gellan-gum",
)


def main() -> None:
    issues: list[str] = []
    sitemap = ET.parse(ROOT / "sitemap.xml")
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [node.text for node in sitemap.findall(".//s:loc", ns)]
    listing = html.parse(str(ROOT / "es/products/food-ingredients.html"), parser=html.HTMLParser(encoding="utf-8"))
    listing_hrefs = set(listing.xpath("//a/@href"))

    for slug in SLUGS:
        rel = f"products/food-ingredients/{slug}.html"
        path = ROOT / "es" / rel
        if not path.exists():
            issues.append(f"missing: es/{rel}")
            continue
        raw = path.read_text(encoding="utf-8")
        doc = html.fromstring(raw)
        expected = f"{BASE}/es/{rel}"
        if doc.get("lang") != "es": issues.append(f"lang: {slug}")
        if doc.xpath("string(//link[@rel='canonical']/@href)") != expected: issues.append(f"canonical: {slug}")
        alternates = {n.get("hreflang"): n.get("href") for n in doc.xpath("//link[@rel='alternate']")}
        if alternates.get("es") != expected or alternates.get("en") != f"{BASE}/{rel}": issues.append(f"hreflang: {slug}")
        if not doc.xpath("string(//title)").strip() or not doc.xpath("string(//meta[@name='description']/@content)").strip(): issues.append(f"metadata: {slug}")
        if len(doc.xpath("//h1")) != 1: issues.append(f"h1: {slug}")
        if urls.count(expected) != 1: issues.append(f"sitemap x{urls.count(expected)}: {slug}")
        if f"food-ingredients/{slug}.html" not in listing_hrefs: issues.append(f"listing link: {slug}")
        if any(marker in raw for marker in ("Please email", "Thank you. Your request", "Food Grade", "�", "premezclaes")): issues.append(f"language residue: {slug}")
        for block in doc.xpath("//script[@type='application/ld+json']"):
            try: json.loads(block.text or "")
            except json.JSONDecodeError: issues.append(f"JSON-LD: {slug}")
        for node in doc.xpath("//*[@href or @src]"):
            value = node.get("href") or node.get("src") or ""
            if value.startswith(("http://", "https://", "//", "#", "mailto:", "tel:", "javascript:", "data:")): continue
            target = (path.parent / urllib.parse.urlsplit(value).path).resolve()
            if not target.exists(): issues.append(f"broken local link: {slug} -> {value}")

        source = ROOT / rel
        source_raw = source.read_text(encoding="utf-8")
        if f'hreflang="es" href="{expected}"' not in source_raw: issues.append(f"English return hreflang: {slug}")

    print(f"Audited {len(SLUGS)} requested Spanish pages; issues: {len(issues)}")
    for issue in issues: print("-", issue)
    raise SystemExit(1 if issues else 0)


if __name__ == "__main__":
    main()

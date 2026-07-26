#!/usr/bin/env python3
"""Audit requested Russian product dossiers, SEO data and directory links."""

from __future__ import annotations

import json
import re
import sys
import urllib.parse
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.bespringchem.com"
sys.path.insert(0, str(ROOT / "tools"))
import build_russian_product_pages as build


def resolve(page: Path, value: str) -> Path | None:
    if not value or value.startswith(
        ("http://", "https://", "//", "#", "mailto:", "tel:", "javascript:", "data:")
    ):
        return None
    return (page.parent / urllib.parse.urlsplit(value).path).resolve()


def main() -> None:
    rels = build.scope.english_sources()
    issues, warnings = [], []
    titles = Counter()
    sitemap = ET.parse(ROOT / "sitemap.xml")
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemap_urls = {node.text for node in sitemap.findall(".//s:loc", ns)}

    for rel in rels:
        page = ROOT / "ru" / rel
        if not page.exists():
            issues.append(f"missing page: ru/{rel}")
            continue
        raw = page.read_text(encoding="utf-8")
        doc = html.fromstring(raw)
        if doc.get("lang") != "ru":
            issues.append(f"wrong html lang: ru/{rel}")
        expected = f"{BASE}/ru/{rel}"
        if doc.xpath("string(//link[@rel='canonical']/@href)") != expected:
            issues.append(f"wrong canonical: ru/{rel}")
        alternates = {
            node.get("hreflang"): node.get("href")
            for node in doc.xpath("//link[@rel='alternate']")
        }
        required = {
            "en": f"{BASE}/{rel}",
            "es": f"{BASE}/es/{rel}",
            "pt-BR": f"{BASE}/pt/{rel}",
            "ru": expected,
            "x-default": f"{BASE}/{rel}",
        }
        if any(alternates.get(key) != value for key, value in required.items()):
            issues.append(f"hreflang mismatch: ru/{rel}")
        title = doc.xpath("string(//title)").strip()
        description = doc.xpath("string(//meta[@name='description']/@content)").strip()
        titles[title] += 1
        if not 30 <= len(title) <= 90:
            warnings.append(f"title length {len(title)}: ru/{rel}")
        if not 90 <= len(description) <= 180:
            warnings.append(f"description length {len(description)}: ru/{rel}")
        if "�" in raw or re.search(r"(?:Ã.|Â.|â€|ðŸ)", raw):
            issues.append(f"encoding artifact: ru/{rel}")
        for script in doc.xpath("//script[@type='application/ld+json']"):
            try:
                json.loads(script.text or "")
            except json.JSONDecodeError as exc:
                issues.append(f"invalid JSON-LD: ru/{rel}: {exc}")
        for node in doc.xpath("//*[@href or @src]"):
            value = node.get("href") if node.get("href") is not None else node.get("src")
            target = resolve(page, value)
            if target is not None and not target.exists():
                issues.append(f"broken local link: ru/{rel} -> {value}")
        if expected not in sitemap_urls:
            issues.append(f"missing sitemap URL: ru/{rel}")
        for phrase in (
            "Request specification", "Request a quote", "On this page",
            "Buyer-intent guide", "Application screening", "Technical selection",
            "Private technical documentation", "Continue product qualification",
            "Last reviewed",
        ):
            if phrase in raw:
                issues.append(f"untranslated boilerplate {phrase!r}: ru/{rel}")

    for title, count in titles.items():
        if title and count > 1:
            issues.append(f"duplicate title x{count}: {title}")

    for category in build.CATEGORIES:
        source = html.parse(
            str(ROOT / "products" / f"{category}.html"),
            parser=html.HTMLParser(encoding="utf-8"),
        )
        target = html.parse(
            str(ROOT / "ru" / "products" / f"{category}.html"),
            parser=html.HTMLParser(encoding="utf-8"),
        )
        expected_links = {
            Path(node.xpath("./a")[0].get("href")).stem
            for node in source.xpath("//li[@data-product][a]")
            if f"products/{category}/{Path(node.xpath('./a')[0].get('href')).name}" in rels
        }
        linked = {
            Path(node.get("href")).stem
            for node in target.xpath("//li[@data-product]/a[@href]")
        }
        missing = sorted(expected_links - linked)
        if missing:
            issues.append(f"{category} index missing links: {', '.join(missing)}")

    counts = Counter(rel.split("/")[1] for rel in rels)
    print(f"Audited {len(rels)} requested Russian pages: {dict(counts)}")
    print(f"Issues: {len(issues)}")
    for issue in issues[:100]:
        print("-", issue)
    print(f"SEO length warnings: {len(warnings)}")
    for warning in warnings[:30]:
        print("-", warning)
    raise SystemExit(1 if issues else 0)


if __name__ == "__main__":
    main()

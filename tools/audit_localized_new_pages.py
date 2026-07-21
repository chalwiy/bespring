#!/usr/bin/env python3
"""Audit the five-language counterparts of the latest English detail pages."""

from __future__ import annotations

import json
import argparse
import re
import sys
import urllib.parse
import xml.etree.ElementTree as ET
from pathlib import Path

from lxml import html

SCHEMA_TYPES = {
    "Answer", "Brand", "BreadcrumbList", "BusinessAudience", "FAQPage",
    "ImageObject", "ListItem", "Organization", "PostalAddress", "Product",
    "PropertyValue", "Question", "Service", "WebPage", "WebSite",
}

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.bespringchem.com"
LANGS = {"de": "de", "es": "es", "pt": "pt-BR", "ru": "ru", "ar": "ar"}


def import_manifest():
    sys.path.insert(0, str(ROOT / "tools"))
    import localize_new_pages as localizer
    products, solutions, _ = localizer.target_pages()
    return products + solutions


def resolve_local(page: Path, value: str):
    value = urllib.parse.urlsplit(value).path
    if not value:
        return None
    if value.startswith("/"):
        return ROOT / value.lstrip("/")
    return (page.parent / value).resolve()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--langs", default="pt")
    args = parser.parse_args()
    selected = {code: LANGS[code] for code in args.langs.split(",") if code in LANGS}
    rels = import_manifest()
    issues, warnings = [], []
    sitemap = ET.parse(ROOT / "sitemap.xml")
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemap_urls = {node.text for node in sitemap.findall("s:url/s:loc", ns)}
    titles = {lang: {} for lang in selected}

    for rel in rels:
        expected_alternates = {"en": f"{BASE}/{rel}", "x-default": f"{BASE}/{rel}"}
        expected_alternates.update({hreflang: f"{BASE}/{lang}/{rel}" for lang, hreflang in selected.items()})
        for lang, hreflang in [("en", "en"), *selected.items()]:
            page = ROOT / rel if lang == "en" else ROOT / lang / rel
            if not page.exists():
                issues.append(f"missing page: {page.relative_to(ROOT)}")
                continue
            doc = html.parse(str(page), parser=html.HTMLParser(encoding="utf-8"))
            root = doc.getroot()
            expected_lang = "en" if lang == "en" else hreflang
            if root.get("lang") != expected_lang:
                issues.append(f"wrong html lang: {page.relative_to(ROOT)} -> {root.get('lang')!r}")
            if lang == "ar" and root.get("dir") != "rtl":
                issues.append(f"Arabic page lacks dir=rtl: {page.relative_to(ROOT)}")

            canonical = doc.xpath("string(//link[@rel='canonical']/@href)")
            expected_canonical = f"{BASE}/{rel}" if lang == "en" else f"{BASE}/{lang}/{rel}"
            if canonical != expected_canonical:
                issues.append(f"wrong canonical: {page.relative_to(ROOT)} -> {canonical}")
            alternates = {node.get("hreflang"): node.get("href") for node in doc.xpath("//link[@rel='alternate'][@hreflang]")}
            if alternates != expected_alternates:
                issues.append(f"hreflang cluster mismatch: {page.relative_to(ROOT)}")

            title = doc.xpath("string(//title)").strip()
            description = doc.xpath("string(//meta[@name='description']/@content)").strip()
            if not title or not description:
                issues.append(f"missing SEO title/description: {page.relative_to(ROOT)}")
            if lang != "en":
                if title in titles[lang]:
                    issues.append(f"duplicate {lang} title: {title!r}")
                titles[lang][title] = rel
                if not 25 <= len(title) <= 85:
                    warnings.append(f"title length {len(title)}: {page.relative_to(ROOT)}")
                if not 90 <= len(description) <= 190:
                    warnings.append(f"description length {len(description)}: {page.relative_to(ROOT)}")

            selectors = doc.xpath("//*[contains(concat(' ',normalize-space(@class),' '),' bs-seo-language ')]/a")
            if len(selectors) != len(selected) + 1:
                issues.append(f"language selector count {len(selectors)}: {page.relative_to(ROOT)}")

            raw = page.read_text(encoding="utf-8")
            if "�" in raw or re.search(r"(?:Ã[‚ƒ„…†‡ˆ‰Š‹ŒŽ]|Â[  ·]|â€|ðŸ)", raw):
                issues.append(f"encoding artifact: {page.relative_to(ROOT)}")
            for script in doc.xpath("//script[@type='application/ld+json']"):
                try:
                    data = json.loads(script.text or "")
                except json.JSONDecodeError as exc:
                    issues.append(f"invalid JSON-LD: {page.relative_to(ROOT)} ({exc})")
                    continue
                languages = []
                schema_types = []

                def walk(value):
                    if isinstance(value, dict):
                        for key, item in value.items():
                            if key == "inLanguage":
                                languages.append(item)
                            if key == "@type":
                                schema_types.extend(item if isinstance(item, list) else [item])
                            walk(item)
                    elif isinstance(value, list):
                        for item in value:
                            walk(item)

                walk(data)
                if lang != "en" and languages and any(value != hreflang for value in languages):
                    issues.append(f"JSON-LD language mismatch: {page.relative_to(ROOT)}")
                invalid_types = sorted({value for value in schema_types if value not in SCHEMA_TYPES})
                if invalid_types:
                    issues.append(f"invalid/localized JSON-LD @type {invalid_types}: {page.relative_to(ROOT)}")

            for node in doc.xpath("//*[@href or @src]"):
                attr = "href" if node.get("href") is not None else "src"
                value = node.get(attr)
                if not value or value.startswith(("http://", "https://", "//", "mailto:", "tel:", "javascript:", "data:", "#")):
                    continue
                target = resolve_local(page, value)
                if target is not None and not target.exists():
                    issues.append(f"broken {attr}: {page.relative_to(ROOT)} -> {value}")
            if expected_canonical not in sitemap_urls:
                issues.append(f"missing sitemap URL: {expected_canonical}")

    total_languages = len(selected) + 1
    print(
        f"Audited {len(rels)} source pages x {total_languages} languages "
        f"= {len(rels) * total_languages} pages"
    )
    print(f"Issues: {len(issues)}")
    for issue in issues[:100]:
        print("-", issue)
    print(f"SEO length warnings: {len(warnings)}")
    for warning in warnings[:40]:
        print("-", warning)
    raise SystemExit(1 if issues else 0)


if __name__ == "__main__":
    main()

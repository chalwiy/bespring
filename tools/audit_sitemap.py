#!/usr/bin/env python3
"""Synchronize and validate sitemap.xml against indexable HTML canonicals."""

from __future__ import annotations

import argparse
import re
import sys
import xml.etree.ElementTree as ET
from datetime import date
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SITEMAP = ROOT / "sitemap.xml"
SITE = "https://www.bespringchem.com"
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
ET.register_namespace("", NS)


class HeadMetadata(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.canonicals: list[str] = []
        self.noindex = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): (value or "") for key, value in attrs}
        if tag.lower() == "link" and "canonical" in values.get("rel", "").lower().split():
            if values.get("href"):
                self.canonicals.append(values["href"].strip())
        if tag.lower() == "meta" and values.get("name", "").lower() == "robots":
            directives = re.split(r"[\s,]+", values.get("content", "").lower())
            self.noindex = "noindex" in directives


def page_inventory() -> tuple[dict[str, Path], list[str]]:
    pages: dict[str, Path] = {}
    errors: list[str] = []
    for path in sorted(ROOT.rglob("*.html")):
        parser = HeadMetadata()
        parser.feed(path.read_text(encoding="utf-8", errors="replace"))
        rel = path.relative_to(ROOT).as_posix()
        if parser.noindex:
            continue
        if len(parser.canonicals) != 1:
            errors.append(f"{rel}: expected one canonical, found {len(parser.canonicals)}")
            continue
        canonical = parser.canonicals[0]
        if not (canonical == SITE + "/" or canonical.startswith(SITE + "/")):
            errors.append(f"{rel}: off-site or invalid canonical {canonical!r}")
            continue
        if canonical in pages:
            errors.append(
                f"duplicate canonical {canonical}: "
                f"{pages[canonical].relative_to(ROOT).as_posix()} and {rel}"
            )
            continue
        pages[canonical] = path
    return pages, errors


def read_sitemap() -> tuple[dict[str, str], list[str]]:
    entries: dict[str, str] = {}
    errors: list[str] = []
    try:
        root = ET.parse(SITEMAP).getroot()
    except (ET.ParseError, OSError) as exc:
        return {}, [f"cannot parse sitemap.xml: {exc}"]
    if root.tag != f"{{{NS}}}urlset":
        errors.append(f"unexpected root element: {root.tag}")
    for pos, node in enumerate(root.findall(f"{{{NS}}}url"), 1):
        loc = (node.findtext(f"{{{NS}}}loc") or "").strip()
        lastmod = (node.findtext(f"{{{NS}}}lastmod") or "").strip()
        if not loc:
            errors.append(f"entry {pos}: missing loc")
            continue
        if loc in entries:
            errors.append(f"duplicate sitemap URL: {loc}")
        entries[loc] = lastmod
    return entries, errors


def validate(pages: dict[str, Path], entries: dict[str, str]) -> list[str]:
    errors: list[str] = []
    missing = sorted(set(pages) - set(entries))
    extra = sorted(set(entries) - set(pages))
    errors.extend(f"missing from sitemap: {url}" for url in missing)
    errors.extend(f"non-indexable or unknown sitemap URL: {url}" for url in extra)
    today = date.today()
    for url, value in entries.items():
        if not DATE_RE.fullmatch(value):
            errors.append(f"missing or invalid lastmod for {url}: {value!r}")
            continue
        try:
            parsed = date.fromisoformat(value)
        except ValueError:
            errors.append(f"invalid calendar date for {url}: {value!r}")
            continue
        if parsed > today:
            errors.append(f"future lastmod for {url}: {value}")
    return errors


def write_sitemap(pages: dict[str, Path], existing: dict[str, str]) -> None:
    today = date.today().isoformat()
    root = ET.Element(f"{{{NS}}}urlset")
    for url in sorted(pages, key=lambda value: (value != SITE + "/", value)):
        node = ET.SubElement(root, f"{{{NS}}}url")
        ET.SubElement(node, f"{{{NS}}}loc").text = url
        old = existing.get(url, "")
        try:
            valid_old = DATE_RE.fullmatch(old) and date.fromisoformat(old) <= date.today()
        except ValueError:
            valid_old = False
        ET.SubElement(node, f"{{{NS}}}lastmod").text = old if valid_old else today
    ET.indent(root, space="  ")
    ET.ElementTree(root).write(SITEMAP, encoding="utf-8", xml_declaration=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="synchronize sitemap before checking")
    args = parser.parse_args()
    pages, page_errors = page_inventory()
    entries, sitemap_errors = read_sitemap()
    if args.write and not page_errors:
        write_sitemap(pages, entries)
        entries, sitemap_errors = read_sitemap()
    errors = page_errors + sitemap_errors + validate(pages, entries)
    print(f"HTML files: {sum(1 for _ in ROOT.rglob('*.html'))}")
    print(f"Indexable canonical pages: {len(pages)}")
    print(f"Sitemap URLs: {len(entries)}")
    print(f"Errors: {len(errors)}")
    for error in errors:
        print(f"- {error}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())

"""Structural and localization audit for the Arabic website."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

from lxml import etree


ROOT = Path(__file__).resolve().parent.parent
AR_ROOT = ROOT / "ar"
LOCALES = {"ar", "de", "es", "pt", "ru", "zh-cn", "zh-tw"}
IGNORED_SOURCE = {"products/food-ingredients1 - 拷贝.html"}
BAD_TEXT = re.compile(
    r"ZXQSEP|�|賲|丕賱|Phone / واتساب|Buyer دليل|Read Full|"
    r"الشركة Profile|Key caution|>Category<|خام الغ ore|مسار التنقلList"
)


def source_pages() -> set[str]:
    pages: set[str] = set()
    for path in ROOT.rglob("*.html"):
        relative = path.relative_to(ROOT).as_posix()
        if relative in IGNORED_SOURCE or relative.split("/", 1)[0] in LOCALES:
            continue
        pages.add(relative)
    return pages


def local_target(page: Path, value: str) -> Path | None:
    if not value or value.startswith(("#", "//", "data:")):
        return None
    parsed = urlsplit(value)
    if parsed.scheme in {"http", "https", "mailto", "tel", "javascript"}:
        return None
    clean = unquote(parsed.path)
    if not clean:
        return None
    target = (page.parent / clean).resolve()
    try:
        target.relative_to(ROOT.resolve())
    except ValueError:
        return None
    return target


def walk_types(value):
    if isinstance(value, dict):
        if "@type" in value:
            yield value["@type"]
        for item in value.values():
            yield from walk_types(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk_types(item)


def main() -> int:
    pages = sorted(AR_ROOT.rglob("*.html"))
    expected = source_pages()
    actual = {page.relative_to(AR_ROOT).as_posix() for page in pages}
    issues: list[str] = []
    canonicals: dict[str, str] = {}

    if actual != expected:
        for missing in sorted(expected - actual):
            issues.append(f"missing Arabic page: {missing}")
        for extra in sorted(actual - expected):
            issues.append(f"unexpected Arabic page: {extra}")

    parser = etree.HTMLParser(remove_comments=False, recover=True)
    for page in pages:
        relative = page.relative_to(ROOT).as_posix()
        raw = page.read_text(encoding="utf-8")
        if BAD_TEXT.search(raw):
            issues.append(f"{relative}: untranslated/corrupt text marker")
        try:
            tree = etree.parse(str(page), parser)
        except etree.XMLSyntaxError as error:
            issues.append(f"{relative}: HTML parse error: {error}")
            continue

        html = tree.getroot()
        if html.get("lang") != "ar" or html.get("dir") != "rtl":
            issues.append(f"{relative}: missing lang=ar or dir=rtl")

        title = tree.findtext(".//title", default="").strip()
        if not title:
            issues.append(f"{relative}: missing title")
        descriptions = tree.xpath(
            '//meta[translate(@name,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")="description"]/@content'
        )
        if not descriptions or not descriptions[0].strip():
            issues.append(f"{relative}: missing meta description")

        canonical = tree.xpath('//link[@rel="canonical"]/@href')
        if len(canonical) != 1 or "/ar/" not in canonical[0]:
            issues.append(f"{relative}: invalid canonical")
        elif canonical[0] in canonicals:
            issues.append(
                f"{relative}: duplicate canonical shared with {canonicals[canonical[0]]}"
            )
        else:
            canonicals[canonical[0]] = relative

        if not tree.xpath('//link[@rel="alternate" and @hreflang="ar"]'):
            issues.append(f"{relative}: missing Arabic hreflang")

        for script in tree.xpath('//script[@type="application/ld+json"]'):
            try:
                data = json.loads(script.text or "")
            except json.JSONDecodeError as error:
                issues.append(f"{relative}: invalid JSON-LD: {error}")
                continue
            for schema_type in walk_types(data):
                values = schema_type if isinstance(schema_type, list) else [schema_type]
                for value in values:
                    if isinstance(value, str) and re.search(r"[\u0600-\u06ff]", value):
                        issues.append(f"{relative}: translated Schema @type: {value}")

        for element in tree.iter():
            if not isinstance(element.tag, str):
                continue
            for attr in ("href", "src"):
                target = local_target(page, element.get(attr, ""))
                if target is not None and not target.exists():
                    issues.append(
                        f"{relative}: broken {attr} {element.get(attr)}"
                    )

    print(f"Arabic pages: {len(pages)}")
    print(f"Expected public pages: {len(expected)}")
    print(f"Unique canonicals: {len(canonicals)}")
    print(f"Issues: {len(issues)}")
    for issue in issues:
        print(f"- {issue}")
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())

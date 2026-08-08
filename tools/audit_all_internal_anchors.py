#!/usr/bin/env python3
"""Audit every local HTML fragment link and duplicate target id."""
from pathlib import Path
from urllib.parse import unquote, urlsplit
from collections import Counter
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
IGNORED_SCHEMES = {"http", "https", "mailto", "tel", "javascript", "data"}

def resolve_page(source: Path, raw_path: str) -> Path:
    decoded = unquote(raw_path)
    if not decoded:
        return source
    if decoded.startswith("/"):
        target = ROOT / decoded.lstrip("/")
    else:
        target = source.parent / decoded
    if target.is_dir() or decoded.endswith("/"):
        target = target / "index.html"
    return target.resolve()

def main() -> None:
    pages = sorted(ROOT.rglob("*.html"))
    docs = {}
    ids = {}
    issues = []
    fragment_links = 0
    for page in pages:
        try:
            doc = html.fromstring(page.read_text(encoding="utf-8"))
        except Exception as exc:
            issues.append((page, f"HTML parse error: {exc}"))
            continue
        docs[page.resolve()] = doc
        page_ids = [value for value in doc.xpath('//*[@id]/@id') if value]
        duplicate_ids = [value for value, count in Counter(page_ids).items() if count > 1]
        for value in duplicate_ids:
            issues.append((page, f"duplicate id #{value}"))
        ids[page.resolve()] = set(page_ids) | set(doc.xpath('//a[@name]/@name'))

    for source, doc in docs.items():
        for href in doc.xpath('//a[@href]/@href'):
            parts = urlsplit(href.strip())
            if parts.scheme.lower() in IGNORED_SCHEMES or parts.netloc or not parts.fragment:
                continue
            fragment_links += 1
            target = resolve_page(source, parts.path)
            try:
                target.relative_to(ROOT.resolve())
            except ValueError:
                issues.append((source, f"fragment target outside site: {href}")); continue
            if target not in docs:
                issues.append((source, f"missing target page: {href}")); continue
            fragment = unquote(parts.fragment)
            if fragment not in ids[target]:
                issues.append((source, f"missing fragment #{fragment} in {target.relative_to(ROOT)}"))

    print(f"HTML pages: {len(pages)}")
    print(f"Fragment links: {fragment_links}")
    print(f"Anchor issues: {len(issues)}")
    for page, issue in issues[:200]:
        print(f"{page.relative_to(ROOT).as_posix()} | {issue}")
    raise SystemExit(1 if issues else 0)

if __name__ == "__main__":
    main()

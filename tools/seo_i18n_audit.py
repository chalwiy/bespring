#!/usr/bin/env python3
"""Audit canonical, hreflang, sitemap, and language signals for the static site."""

from __future__ import annotations

import argparse
import json
import re
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse


SITE = "https://www.bespringchem.com"
LANG_DIRS = {"zh-cn", "zh-tw", "es", "pt", "ru", "de", "ar"}
REDIRECT_MARKERS = ("http-equiv=\"refresh\"", "http-equiv='refresh'", "location.replace(", "window.location")


def public_path(path: Path, root: Path) -> str:
    rel = path.relative_to(root).as_posix()
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[: -len("index.html")]
    return "/" + rel


def extract(pattern: str, text: str) -> str | None:
    match = re.search(pattern, text, flags=re.I | re.S)
    return match.group(1).strip() if match else None


def page_info(path: Path, root: Path) -> dict:
    text = path.read_text(encoding="utf-8", errors="replace")
    rel = path.relative_to(root).as_posix()
    lang = extract(r"<html\b[^>]*\blang=[\"']([^\"']+)", text)
    canonical = extract(r"<link\b[^>]*\brel=[\"']canonical[\"'][^>]*\bhref=[\"']([^\"']+)", text)
    if canonical is None:
        canonical = extract(r"<link\b[^>]*\bhref=[\"']([^\"']+)[\"'][^>]*\brel=[\"']canonical[\"']", text)
    alternates = re.findall(
        r"<link\b(?=[^>]*\brel=[\"']alternate[\"'])(?=[^>]*\bhreflang=[\"']([^\"']+)[\"'])(?=[^>]*\bhref=[\"']([^\"']+)[\"'])[^>]*>",
        text,
        flags=re.I,
    )
    title = extract(r"<title>(.*?)</title>", text)
    og_title = extract(r"<meta\b(?=[^>]*\bproperty=[\"']og:title[\"'])(?=[^>]*\bcontent=[\"']([^\"']*)[\"'])[^>]*>", text)
    twitter_title = extract(r"<meta\b(?=[^>]*\bname=[\"']twitter:title[\"'])(?=[^>]*\bcontent=[\"']([^\"']*)[\"'])[^>]*>", text)
    h1s = [re.sub(r"<[^>]+>", "", value).strip() for value in re.findall(r"<h1\b[^>]*>(.*?)</h1>", text, flags=re.I | re.S)]
    redirect = any(marker.lower() in text.lower() for marker in REDIRECT_MARKERS) and len(text) < 5000
    return {
        "file": rel,
        "url": SITE + public_path(path, root),
        "lang": lang,
        "canonical": canonical,
        "alternates": dict(alternates),
        "title": title,
        "og_title": og_title,
        "twitter_title": twitter_title,
        "h1s": h1s,
        "redirect_stub": redirect,
        "replacement_chars": text.count("�"),
    }


def url_to_file(url: str, root: Path) -> Path | None:
    parsed = urlparse(url)
    if parsed.netloc not in {"www.bespringchem.com", "bespringchem.com"}:
        return None
    path = parsed.path
    if path == "/":
        return root / "index.html"
    if path.endswith("/"):
        return root / path.lstrip("/") / "index.html"
    return root / path.lstrip("/")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--json", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    pages = [page_info(path, root) for path in sorted(root.rglob("*.html")) if ".git" not in path.parts]
    by_url = {p["url"]: p for p in pages}
    issues: list[dict] = []

    for page in pages:
        if page["redirect_stub"]:
            continue
        canonical = page["canonical"]
        if not canonical:
            if page["file"] != "404.html":
                issues.append({"type": "missing_canonical", "file": page["file"]})
        else:
            parsed = urlparse(canonical)
            if parsed.scheme != "https" or parsed.netloc != "www.bespringchem.com":
                issues.append({"type": "noncanonical_host", "file": page["file"], "value": canonical})
            target = url_to_file(canonical, root)
            if target is not None and not target.exists():
                issues.append({"type": "canonical_target_missing", "file": page["file"], "value": canonical})
            if canonical != page["url"]:
                issues.append({"type": "canonical_not_self", "file": page["file"], "expected": page["url"], "value": canonical})
        seen_targets = Counter(page["alternates"].values())
        for hreflang, url in page["alternates"].items():
            parsed = urlparse(url)
            if parsed.scheme != "https" or parsed.netloc != "www.bespringchem.com":
                issues.append({"type": "hreflang_noncanonical_host", "file": page["file"], "hreflang": hreflang, "value": url})
            target_file = url_to_file(url, root)
            if target_file is not None and not target_file.exists():
                issues.append({"type": "hreflang_target_missing", "file": page["file"], "hreflang": hreflang, "value": url})
            target_page = by_url.get(url)
            if target_page and not target_page["redirect_stub"]:
                return_links = target_page["alternates"]
                if page["url"] not in return_links.values():
                    issues.append({"type": "hreflang_missing_return", "file": page["file"], "hreflang": hreflang, "value": url})
        for target, count in seen_targets.items():
            if count > 2:  # one locale plus x-default may intentionally share a URL
                issues.append({"type": "hreflang_duplicate_target", "file": page["file"], "value": target, "count": count})
        if page["alternates"] and page["lang"] and page["lang"].lower() not in {x.lower() for x in page["alternates"]}:
            issues.append({"type": "hreflang_missing_self_language", "file": page["file"], "lang": page["lang"]})
        raw = (root / page["file"]).read_text(encoding="utf-8", errors="replace")
        for index, block in enumerate(re.findall(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', raw, flags=re.I | re.S), 1):
            try:
                json.loads(block)
            except json.JSONDecodeError as exc:
                issues.append({"type": "invalid_jsonld", "file": page["file"], "block": index, "error": str(exc)})

    sitemap_path = root / "sitemap.xml"
    sitemap_urls: list[str] = []
    if sitemap_path.exists():
        tree = ET.parse(sitemap_path)
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        sitemap_urls = [node.text.strip() for node in tree.findall(".//s:loc", ns) if node.text]
        for url in sitemap_urls:
            parsed = urlparse(url)
            if parsed.scheme != "https" or parsed.netloc != "www.bespringchem.com":
                issues.append({"type": "sitemap_noncanonical_host", "value": url})
            target = url_to_file(url, root)
            if target is not None and not target.exists():
                issues.append({"type": "sitemap_target_missing", "value": url})
        for url, count in Counter(sitemap_urls).items():
            if count > 1:
                issues.append({"type": "sitemap_duplicate", "value": url, "count": count})
        sitemap_set = set(sitemap_urls)
        for page in pages:
            if not page["redirect_stub"] and page["file"] != "404.html" and page["url"] not in sitemap_set:
                issues.append({"type": "indexable_page_missing_from_sitemap", "file": page["file"], "value": page["url"]})

    summary = {
        "root": str(root),
        "html_pages": len(pages),
        "indexable_pages": sum(not p["redirect_stub"] for p in pages),
        "redirect_stubs": sum(p["redirect_stub"] for p in pages),
        "sitemap_urls": len(sitemap_urls),
        "langs": Counter((p["lang"] or "missing") for p in pages),
        "issue_counts": Counter(i["type"] for i in issues),
        "issues": issues,
        "home": by_url.get(SITE + "/"),
    }
    output = json.dumps(summary, ensure_ascii=False, indent=2, default=dict)
    if args.json:
        args.json.write_text(output, encoding="utf-8")
    print(output)
    return 1 if issues else 0


if __name__ == "__main__":
    raise SystemExit(main())

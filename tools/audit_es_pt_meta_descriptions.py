#!/usr/bin/env python3
"""Audit ES/PT-BR meta descriptions for truncation and basic search quality."""
from pathlib import Path
import re
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
ENDINGS = {
    "es": re.compile(r"\b(?:una?|el|la|los|las|para|por|de|del|con|sin|y|o)\.?$", re.I),
    "pt": re.compile(r"\b(?:um|uma|o|a|os|as|para|por|de|do|da|com|sem|e|ou|em)\.?$", re.I),
}

def main():
    issues = []
    counts = {}
    for lang in ("es", "pt"):
        descriptions = {}
        pages = sorted((ROOT / lang).rglob("*.html"))
        counts[lang] = len(pages)
        for path in pages:
            raw = path.read_text(encoding="utf-8")
            try:
                doc = html.fromstring(raw)
            except Exception as exc:
                issues.append((path, f"HTML parse: {exc}")); continue
            values = doc.xpath('//meta[@name="description"]/@content')
            if len(values) != 1:
                robots = " ".join(doc.xpath('//meta[@name="robots"]/@content')).lower()
                refresh = doc.xpath('//meta[translate(@http-equiv,"REFRESH","refresh")="refresh"]')
                if not values and "noindex" in robots and refresh:
                    continue
                issues.append((path, f"meta description count={len(values)}")); continue
            value = values[0].strip()
            if ENDINGS[lang].search(value):
                issues.append((path, f"truncated ending: {value[-40:]}"))
            if len(value) < 70:
                issues.append((path, f"too short: {len(value)}"))
            descriptions.setdefault(value, []).append(path)
        for value, duplicates in descriptions.items():
            if len(duplicates) > 3:
                issues.append((duplicates[0], f"description duplicated {len(duplicates)} times"))
    print(f"Audited ES={counts['es']} and PT={counts['pt']} pages; issues: {len(issues)}")
    for path, issue in issues[:100]:
        print(f"{path.relative_to(ROOT).as_posix()} | {issue}")
    raise SystemExit(1 if issues else 0)

if __name__ == "__main__":
    main()

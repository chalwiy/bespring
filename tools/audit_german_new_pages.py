#!/usr/bin/env python3
"""Language and SEO checks for the newly added German detail pages."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import polish_german_new_pages as german


ENGLISH_PATTERNS = (
    r"\bRead\b", r"\bLast reviewed\b", r"\bRequest (?:a )?quote\b",
    r"\bPrepare an? RFQ\b", r"\bWhat each\b", r"\bHow to\b",
    r"\bWhich\b", r"\bThe\b", r"\band\b", r"\bwith\b", r"\bfor\b",
    r"\bbefore\b", r"\bafter\b", r"\bfrom\b", r"\byour\b",
    r"\bsupplier\b", r"\bFood Grade\b", r"\bEvidence plan\b", r"\bScale-up\b",
)
AWKWARD = (
    "Bereiten Sie ein RFQ", "Antragsspezifische Genehmigung", "Genehmigungsgrenze",
    "Screening-Karte", "Optionenrohstoff", "Einfrieren der zugelassenen Klasse",
    "Gestalten Sie den Vergleich", "Fordern Sie das Ergebnis heraus",
    "Kandidat", "Futtermühle", "Nahrungsmittelqualität",
)


def visible_strings(doc):
    for node in doc.iter():
        if not isinstance(node.tag, str) or node.tag.lower() in {"script", "style", "code", "pre"}:
            continue
        if node.text and node.text.strip():
            yield node.text.strip()
        if node.tail and node.tail.strip():
            yield node.tail.strip()
        for attr in ("alt", "title", "aria-label", "placeholder"):
            if node.get(attr):
                yield node.get(attr).strip()


def main():
    targets = []
    targets.extend((ROOT / "de/products/food-ingredients" / f"{slug}.html", name, "product") for slug, name in german.PRODUCTS.items())
    targets.extend((ROOT / "de/solutions" / f"{slug}.html", name, "solution") for slug, name in german.SOLUTIONS.items())
    issues = []
    for path, expected_name, kind in targets:
        doc = html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))
        h1 = doc.xpath("string(//h1)").strip()
        title = doc.xpath("string(//title)").strip()
        description = doc.xpath("string(//meta[@name='description']/@content)").strip()
        if h1 != expected_name:
            issues.append(f"unexpected H1: {path.relative_to(ROOT)} -> {h1!r}")
        if not 25 <= len(title) <= 85:
            issues.append(f"title length {len(title)}: {path.relative_to(ROOT)}")
        if not 90 <= len(description) <= 190:
            issues.append(f"description length {len(description)}: {path.relative_to(ROOT)}")
        if re.search(r"\b(?:für|zu|von|mit|und|oder|die|der|das)\.$", description, re.I):
            issues.append(f"truncated description: {path.relative_to(ROOT)}")
        text = "\n".join(visible_strings(doc))
        for pattern in ENGLISH_PATTERNS:
            if re.search(pattern, text):
                issues.append(f"English residual {pattern!r}: {path.relative_to(ROOT)}")
        for phrase in AWKWARD:
            if phrase in text:
                issues.append(f"awkward phrase {phrase!r}: {path.relative_to(ROOT)}")
        for node in doc.xpath("//script[@type='application/ld+json']"):
            try:
                data = json.loads(node.text or "")
            except json.JSONDecodeError as exc:
                issues.append(f"invalid JSON-LD: {path.relative_to(ROOT)} ({exc})")
                continue
            if json.dumps(data, ensure_ascii=False).count('"inLanguage": "de"') == 0:
                issues.append(f"missing German schema language: {path.relative_to(ROOT)}")
    print(f"German pages checked: {len(targets)}")
    print(f"Language/SEO issues: {len(issues)}")
    for issue in issues[:100]:
        print("-", issue)
    raise SystemExit(1 if issues else 0)


if __name__ == "__main__":
    main()

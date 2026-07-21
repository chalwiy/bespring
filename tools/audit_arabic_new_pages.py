#!/usr/bin/env python3
"""Language, RTL and SEO checks for the newly added Arabic detail pages."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import polish_arabic_new_pages as arabic


ENGLISH_PATTERNS = (
    r"\bLanguage selection\b", r"\bRead\b", r"\bLast reviewed\b",
    r"\bRequest (?:a )?quote\b", r"\bPrepare an? RFQ\b", r"\bWhat each\b",
    r"\bHow to\b", r"\bWhich\b", r"\bThe\b", r"\band\b", r"\bwith\b",
    r"\bfor\b", r"\bbefore\b", r"\bafter\b", r"\bfrom\b", r"\byour\b",
    r"\bsupplier\b", r"\bFood Grade\b", r"\bEvidence plan\b", r"\bScale-up\b",
)
AWKWARD = (
    "طلب الاقتباس", "الغذاء الصف", "درجة الغذاء", "المرشحون", "المرشحين",
    "المرشح", "خطة الأدلة", "خطة الإثبات", "خريطة الفرز", "تحدي النتيجة",
    "تجميد الدرجة المعتمدة", "تجميد الصف المعتمد", "وضع الفشل", "نمط الفشل",
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
    targets.extend((ROOT / "ar/products/food-ingredients" / f"{slug}.html", name) for slug, name in arabic.PRODUCTS.items())
    targets.extend((ROOT / "ar/solutions" / f"{slug}.html", name) for slug, name in arabic.SOLUTIONS.items())
    issues = []
    for path, expected_name in targets:
        doc = html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))
        root = doc.getroot()
        h1 = doc.xpath("string(//h1)").strip()
        title = doc.xpath("string(//title)").strip()
        description = doc.xpath("string(//meta[@name='description']/@content)").strip()
        if root.get("lang") != "ar" or root.get("dir") != "rtl":
            issues.append(f"wrong Arabic lang/dir: {path.relative_to(ROOT)}")
        if h1 != expected_name:
            issues.append(f"unexpected H1: {path.relative_to(ROOT)} -> {h1!r}")
        if not 25 <= len(title) <= 85:
            issues.append(f"title length {len(title)}: {path.relative_to(ROOT)}")
        if not 90 <= len(description) <= 190:
            issues.append(f"description length {len(description)}: {path.relative_to(ROOT)}")
        if re.search(r"\b(?:من|في|إلى|على|عن|مع|و|أو)\.$", description):
            issues.append(f"truncated description: {path.relative_to(ROOT)}")
        text = "\n".join(visible_strings(doc))
        raw = path.read_text(encoding="utf-8")
        arabic_letters = len(re.findall(r"[\u0600-\u06ff]", text))
        latin_words = re.findall(r"\b[A-Za-z]{3,}\b", text)
        if arabic_letters < 500:
            issues.append(f"insufficient Arabic content: {path.relative_to(ROOT)}")
        for pattern in ENGLISH_PATTERNS:
            if re.search(pattern, text, re.I):
                issues.append(f"English residual {pattern!r}: {path.relative_to(ROOT)}")
        for phrase in AWKWARD:
            if phrase in text:
                issues.append(f"awkward phrase {phrase!r}: {path.relative_to(ROOT)}")
        for phrase in (
            "Please email info@bespringchem.com.", "Thank you", "Food Grade",
            "Sending your request", "The form could not be sent", "The form service is temporarily unavailable",
        ):
            if phrase in raw:
                issues.append(f"English interaction text {phrase!r}: {path.relative_to(ROOT)}")
        # Technical acronyms and product names are expected; a very high count
        # instead signals that an English block survived localization.
        if len(latin_words) > 90:
            issues.append(f"excess Latin text ({len(latin_words)} words): {path.relative_to(ROOT)}")
        for node in doc.xpath("//script[@type='application/ld+json']"):
            try:
                data = json.loads(node.text or "")
            except json.JSONDecodeError as exc:
                issues.append(f"invalid JSON-LD: {path.relative_to(ROOT)} ({exc})")
                continue
            serialized = json.dumps(data, ensure_ascii=False)
            if '"inLanguage": "ar"' not in serialized:
                issues.append(f"missing Arabic schema language: {path.relative_to(ROOT)}")
    print(f"Arabic pages checked: {len(targets)}")
    print(f"Language/RTL/SEO issues: {len(issues)}")
    for issue in issues[:100]:
        print("-", issue)
    raise SystemExit(1 if issues else 0)


if __name__ == "__main__":
    main()

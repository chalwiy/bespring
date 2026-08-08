#!/usr/bin/env python3
"""Optimize localized titles by search intent, not a character quota."""
from pathlib import Path
from collections import Counter
import html as html_std
import re

ROOT = Path(__file__).resolve().parents[1]
LANG_DIRS = {"de":"de", "es":"es", "pt":"pt-BR", "ru":"ru", "ar":"ar"}

SPECIFIC = {
    "de/news/how-to-qualify-chemical-supplier-china.html": "Chemikalienlieferanten in China qualifizieren: Checkliste",
    "pt/news/fi-vietnam-2024.html": "Fi Vietnam 2024 em Ho Chi Minh | Participação da Bespring",
    "pt/news/vietfood-beverage-2023.html": "Vietfood & Beverage 2023 em Ho Chi Minh | Bespring",
    "ru/contact.html": "Контакты Bespring | Запрос цены и экспортная поддержка",
    "ru/about/company-profile.html": "О компании Bespring | Поставщик химического сырья из Китая",
}

SOLUTION_SUFFIXES = {
    "de": ((" | Technischer Leitfaden | Bespring", " | Technischer Leitfaden"), (" | Bespring", "")),
    "es": ((" | Guía técnica | Bespring", " | Guía técnica"), (" | Bespring", "")),
    "pt": ((" | Guia técnico | Bespring", " | Guia técnico"), (" | Bespring", "")),
    "ru": ((" | Техническое руководство | Bespring", " | Техническое руководство"), (" | Bespring", "")),
    "ar": ((" | دليل تقني | Bespring", " | دليل تقني"), (" | Bespring", "")),
}

PRODUCT_SUFFIXES = {
    "de": ((" | Lieferant | Bespring", " | Lieferant"),),
    "es": ((" | Bespring", ""),),
    "pt": ((" | Bespring", ""),),
    "ru": ((" | Bespring", ""),),
    "ar": ((" | Bespring", ""),),
}

NEWS_SUFFIXES = ((" | Bespring Chemical", ""), (" | Bespring", ""))

def extract_title(raw: str) -> str | None:
    match = re.search(r"<title>(.*?)</title>", raw, re.I | re.S)
    return html_std.unescape(match.group(1)).strip() if match else None

def replace_suffix(title: str, replacements) -> str:
    for old, new in replacements:
        if title.endswith(old):
            return title[:-len(old)] + new
    return title

def write_title(path: Path, old: str, new: str) -> bool:
    if new == old:
        return False
    raw = path.read_text(encoding="utf-8")
    old_e = html_std.escape(old, quote=True)
    new_e = html_std.escape(new, quote=True)
    out, n = re.subn(r"(<title>).*?(</title>)", lambda m: m.group(1) + new_e + m.group(2), raw, count=1, flags=re.I | re.S)
    if n != 1:
        raise RuntimeError(f"Missing title: {path}")
    for pattern in (
        r'(<meta property="og:title" content=")([^\"]*)(")',
        r'(<meta name="twitter:title" content=")([^\"]*)(")',
    ):
        out = re.sub(pattern, lambda m: m.group(1) + new_e + m.group(3) if html_std.unescape(m.group(2)) == old else m.group(0), out, count=1)
    path.write_text(out, encoding="utf-8", newline="")
    return True

def main() -> None:
    changes = Counter()
    for rel, title in SPECIFIC.items():
        path = ROOT / rel
        old = extract_title(path.read_text(encoding="utf-8"))
        if old and write_title(path, old, title):
            changes[LANG_DIRS.get(rel.split("/", 1)[0], "en")] += 1

    for directory, lang in LANG_DIRS.items():
        for path in sorted((ROOT / directory).rglob("*.html")):
            rel = path.relative_to(ROOT).as_posix()
            if rel in SPECIFIC:
                continue
            raw = path.read_text(encoding="utf-8")
            if "noindex" in raw[:2500].lower():
                continue
            old = extract_title(raw)
            if not old or len(old) <= 70:
                continue
            new = old
            relative = path.relative_to(ROOT / directory).as_posix()
            if relative.startswith("solutions/"):
                new = replace_suffix(new, SOLUTION_SUFFIXES[directory])
            elif relative.startswith("products/") and relative.count("/") >= 2:
                new = replace_suffix(new, PRODUCT_SUFFIXES[directory])
            elif relative.startswith("news/"):
                new = replace_suffix(new, NEWS_SUFFIXES)
            if write_title(path, old, new):
                changes[lang] += 1

    print("Changed titles:", dict(changes))

if __name__ == "__main__":
    main()

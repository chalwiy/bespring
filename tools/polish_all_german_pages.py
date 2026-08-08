#!/usr/bin/env python3
"""Post-edit every German page while preserving links and functionality."""

from __future__ import annotations

import html as html_std
import json
import re
import sys
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import polish_german_new_pages as base
from build_german_product_pages import TERM_FIXES

EXTRA = [
    ("Food Grade", "Lebensmittelqualität"), ("Feed Grade", "Futtermittelqualität"),
    ("Standard packing", "Standardverpackung"), ("Container loading", "Containerbeladung"),
    ("Please email info@bespringchem.com.", "Bitte schreiben Sie an info@bespringchem.com."),
    ("Thank you. Your request has been sent.", "Vielen Dank. Ihre Anfrage wurde gesendet."),
    ("Request a Quote", "Angebot anfordern"), ("Contact Sales", "Vertrieb kontaktieren"),
    ("Safety Data Sheet", "Sicherheitsdatenblatt (SDB)"), ("Technical Data Sheet", "Technisches Datenblatt (TDS)"),
    ("bulk quotation", "Angebot für Großmengen"), ("bulk price", "Preis für Großmengen"),
    ("Massenangebot", "Angebot für Großmengen"), ("Bulk-Angebot", "Angebot für Großmengen"),
    ("Lebensmittelklasse", "Lebensmittelqualität"), ("Futterklasse", "Futtermittelqualität"),
    ("Teilen Sie genaue", "Nennen Sie die genauen"), ("Teilen Sie die genaue", "Nennen Sie die genaue"),
    ("Kontaktverkäufe", "Vertrieb kontaktieren"), ("Kontaktieren Sie den Vertrieb", "Vertrieb kontaktieren"),
]


def polish(value: str) -> str:
    value = base.polish(value)
    for old, new in TERM_FIXES + EXTRA: value = value.replace(old, new)
    return value


def polish_json(value, description: str, h1: str):
    if isinstance(value, dict):
        result = {k: polish_json(v, description, h1) for k, v in value.items()}
        kind = result.get("@type")
        if kind == "WebPage" and "inLanguage" in result: result["inLanguage"] = "de"
        if isinstance(kind, str) and kind in {"WebPage", "Product", "Service"} and isinstance(result.get("description"), str):
            if re.search(r"\b(?:Source|Review|Supplier|Food Grade)\b", result["description"], re.I): result["description"] = description
        if kind == "Product" and h1 and isinstance(result.get("name"), str) and re.search(r"\b(?:Supplier|Food Grade)\b", result["name"], re.I): result["name"] = h1
        return result
    if isinstance(value, list): return [polish_json(v, description, h1) for v in value]
    if isinstance(value, str) and not value.startswith(("http://", "https://")): return polish(value)
    return value


def main() -> None:
    changed = 0
    for path in sorted((ROOT / "de").rglob("*.html")):
        raw = path.read_text(encoding="utf-8"); doc = html.fromstring(raw)
        h1 = doc.xpath("string(//h1)").strip(); description = doc.xpath("string(//meta[@name='description']/@content)").strip()
        for node in doc.iter():
            if not isinstance(node.tag, str) or node.tag.lower() in {"script", "style", "code", "pre"}: continue
            if node.text:
                node.text = polish(node.text)
                if node.text.strip() == "Product": node.text = node.text.replace("Product", "Produkt")
            if node.tail: node.tail = polish(node.tail)
            for attr in ("alt", "title", "aria-label", "placeholder"):
                if node.get(attr): node.set(attr, polish(node.get(attr)))
            if node.tag.lower() == "meta" and node.get("content"): node.set("content", polish(node.get("content")))
        for script in doc.xpath("//script[@type='application/ld+json']"):
            try: data = json.loads(script.text or "")
            except json.JSONDecodeError: continue
            script.text = json.dumps(polish_json(data, description, h1), ensure_ascii=False, separators=(",", ":"))
        if h1 and "/products/" in path.as_posix():
            for field in doc.xpath("//form//*[@name='product']"): field.set("value", h1)
        updated = html.tostring(doc, encoding="unicode", method="html", doctype="<!DOCTYPE html>")
        replacements = {
            "Please email info@bespringchem.com.": "Bitte schreiben Sie an info@bespringchem.com.",
            "Thank you. Your request has been sent.": "Vielen Dank. Ihre Anfrage wurde gesendet.",
            "Close navigation menu": "Navigationsmenü schließen", "Open navigation menu": "Navigationsmenü öffnen",
            "The form service is temporarily unavailable.": "Der Formulardienst ist vorübergehend nicht verfügbar.",
            "Sending your request...": "Ihre Anfrage wird gesendet...", "Sending your request…": "Ihre Anfrage wird gesendet…",
            "Thank you. Your request has been received and our team will contact you shortly.": "Vielen Dank. Wir haben Ihre Anfrage erhalten und melden uns in Kürze.",
            "We could not send your request. Please email info@bespringchem.com or try again.": "Die Anfrage konnte nicht gesendet werden. Schreiben Sie an info@bespringchem.com oder versuchen Sie es erneut.",
            "The form could not be sent. Please email info@bespringchem.com or try again.": "Das Formular konnte nicht gesendet werden. Schreiben Sie an info@bespringchem.com oder versuchen Sie es erneut.",
        }
        for old, new in replacements.items(): updated = updated.replace(old, new)
        updated = re.sub(r"Thank you\. Your [^.\"']+ (?:quote request|request|inquiry) has been sent(?: successfully)?\.", "Vielen Dank. Ihre Anfrage wurde erfolgreich gesendet.", updated)
        if h1 and "/products/" in path.as_posix():
            escaped = html_std.escape(h1, quote=True)
            updated = re.sub(r'value="(?:Food Grade|Lebensmittelqualität) [^"]+"', f'value="{escaped}"', updated)
            js = json.dumps(h1, ensure_ascii=False)
            updated = re.sub(r"((?:const|let|var)\s+product=)(['\"])[^'\"]+\2", r"\1" + js, updated)
            updated = re.sub(r"(,product=)(['\"])[^'\"]+\2", r"\1" + js, updated)
            updated = re.sub(r"(?:f|quoteForm)\.elements\.product\.value\s*=\s*(['\"])[^'\"]+\1", "quoteForm.elements.product.value=" + js, updated)
        if updated != raw:
            path.write_text(updated, encoding="utf-8", newline=""); changed += 1
    print(f"Post-edited {changed} German pages without changing href or src values.")


if __name__ == "__main__": main()

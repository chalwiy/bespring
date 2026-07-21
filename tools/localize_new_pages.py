#!/usr/bin/env python3
"""Localize recently added English product and solution detail pages.

The script deliberately limits writes to the new detail-page clusters, their
language selectors/SEO alternates, the corresponding localized index links,
and sitemap.xml. Existing localized prose outside those surfaces is preserved.
"""

from __future__ import annotations

import argparse
import copy
import html as html_std
import importlib.util
import json
import os
import posixpath
import re
import sys
import time
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path

from lxml import etree, html


ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.bespringchem.com"
LANGS = {
    "de": {"api": "de", "hreflang": "de", "og": "de_DE", "label": "DE"},
    "es": {"api": "es", "hreflang": "es", "og": "es_ES", "label": "ES"},
    "pt": {"api": "pt", "hreflang": "pt-BR", "og": "pt_BR", "label": "PT"},
    "ru": {"api": "ru", "hreflang": "ru", "og": "ru_RU", "label": "RU"},
    "ar": {"api": "ar", "hreflang": "ar", "og": "ar_AR", "label": "AR"},
}
ACTIVE_LANGS = list(LANGS)
CACHE_PATH = ROOT / "tools" / ".new-page-localization-cache.json"
VENDOR_DIR = ROOT / "tools" / "_vendor_argos"
ARGOS_DATA_DIR = Path(os.getenv("BESPRING_ARGOS_DATA", Path(os.getenv("TEMP", str(ROOT / "tools"))) / "bespring_argos_data"))
TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single"
SEPARATOR = " ||@@BS{index:05d}@@|| "
SEP_RE = re.compile(r"\s*\|\|@@BS\d{5}@@\|\|\s*")
SKIP_TAGS = {"script", "style", "code", "pre", "noscript"}
META_KEYS = {"description", "og:title", "og:description", "twitter:title", "twitter:description"}
JSON_TEXT_KEYS = {
    "name", "alternateName", "description", "category", "audienceType", "serviceType",
    "areaServed", "streetAddress", "addressLocality", "addressRegion", "addressCountry",
    "value",
}
ASSET_EXTENSIONS = {
    ".css", ".js", ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".ico",
    ".woff", ".woff2", ".ttf", ".pdf",
}
STATIC_EXACT = {
    "Bespring Chemical", "Bespring Chemical Co., Ltd.", "COA", "TDS", "SDS", "HACCP",
    "ISO", "Kosher", "Halal", "RFQ", "MOQ", "FAQ", "CAS", "Incoterm", "WhatsApp",
}
NEW_PRODUCT_SLUGS = (
    "calcium-citrate", "carrageenan", "dipotassium-phosphate-dkp", "disodium-phosphate-dsp",
    "guar-gum", "konjac-gum", "magnesium-carbonate", "magnesium-citrate",
    "monopotassium-phosphate-mkp", "potassium-citrate", "potassium-metaphosphate-kmp",
    "potassium-sorbate", "potassium-tripolyphosphate-ktpp", "sodium-acid-pyrophosphate-sapp",
    "sodium-alginate", "sodium-citrate", "sodium-dihydrogen-phosphate-msp", "sodium-propionate",
    "sodium-trimetaphosphate-stmp", "tetrasodium-pyrophosphate-tspp", "tricalcium-phosphate-tcp",
    "tripotassium-phosphate-tkp", "trisodium-phosphate-tsp", "xanthan-gum", "zinc-citrate",
)


def load_builder():
    spec = importlib.util.spec_from_file_location("industry_builder", ROOT / "tools" / "build_industry_application_pages.py")
    module = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(module)
    return module


def target_pages():
    products = [f"products/food-ingredients/{slug}.html" for slug in NEW_PRODUCT_SLUGS]
    builder = load_builder()
    solution_slugs = [p["slug"] for group in builder.GROUPS for p in group["pages"]]
    solutions = [f"solutions/{slug}.html" for slug in solution_slugs]
    return products, solutions, builder


def clean_source(value: str) -> str:
    return html_std.unescape(value).replace("\u00a0", " ").strip()


def is_translatable(value: str) -> bool:
    value = clean_source(value)
    if not value or value in STATIC_EXACT or len(value) == 1:
        return False
    if value.startswith(("http://", "https://", "mailto:", "tel:", "#")):
        return False
    if re.fullmatch(r"[\d\s.,%+\-<>=/():;'\"\u00b0\u00b7]+", value):
        return False
    if re.fullmatch(r"[A-Z0-9][A-Z0-9+\-./() ]{0,20}", value):
        return False
    return bool(re.search(r"[A-Za-z]{2,}", value))


def iter_json_strings(obj, parent_key=None):
    if isinstance(obj, dict):
        for key, value in obj.items():
            if isinstance(value, str) and key in JSON_TEXT_KEYS and is_translatable(value):
                yield value
            else:
                yield from iter_json_strings(value, key)
    elif isinstance(obj, list):
        for value in obj:
            if isinstance(value, str) and parent_key in JSON_TEXT_KEYS and is_translatable(value):
                yield value
            else:
                yield from iter_json_strings(value, parent_key)


def collect_strings(doc) -> set[str]:
    values: set[str] = set()
    for element in doc.iter():
        tag = element.tag.lower() if isinstance(element.tag, str) else ""
        if tag in SKIP_TAGS:
            if tag == "script" and element.get("type") == "application/ld+json" and element.text:
                try:
                    values.update(clean_source(v) for v in iter_json_strings(json.loads(element.text)))
                except json.JSONDecodeError:
                    pass
            continue
        for value in (element.text, element.tail):
            if value and is_translatable(value):
                values.add(clean_source(value))
        for attr in ("alt", "title", "aria-label", "placeholder"):
            value = element.get(attr)
            if value and is_translatable(value):
                values.add(clean_source(value))
        if tag == "meta":
            key = element.get("name") or element.get("property") or ""
            value = element.get("content")
            if key in META_KEYS and value and is_translatable(value):
                values.add(clean_source(value))
    return values


def load_cache():
    if not CACHE_PATH.exists():
        return {lang: {} for lang in LANGS}
    data = json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    return {lang: data.get(lang, {}) for lang in LANGS}


def save_cache(cache):
    CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")


def reliable_parallel_value(source: str, target: str, lang: str) -> bool:
    """Reject untranslated or English-heavy legacy text from translation memory."""
    if not target:
        return False
    if lang == "ar" and re.search(r"[A-Za-z]", source):
        arabic_letters = len(re.findall(r"[\u0600-\u06ff]", target))
        latin_letters = len(re.findall(r"[A-Za-z]", target))
        if arabic_letters == 0 or latin_letters > max(24, int(arabic_letters * 0.35)):
            return False
    return True


def seed_parallel_translation_memory(cache, selected_langs):
    """Reuse wording from the site's already-reviewed corresponding pages."""
    builder = load_builder()
    excluded = {f"products/food-ingredients/{slug}.html" for slug in NEW_PRODUCT_SLUGS}
    excluded.update(f"solutions/{page['slug']}.html" for group in builder.GROUPS for page in group["pages"])
    candidates = []
    for pattern in ("products/**/*.html", "applications/*.html", "solutions/*-solutions.html"):
        candidates.extend(ROOT.glob(pattern))
    candidates.extend([ROOT / "products.html", ROOT / "services.html", ROOT / "contact.html"])
    seeded = {lang: 0 for lang in selected_langs}
    for source_path in candidates:
        rel = source_path.relative_to(ROOT)
        if rel.as_posix() in excluded:
            continue
        if not all((ROOT / lang / rel).exists() for lang in selected_langs):
            continue
        try:
            source_doc = html.parse(str(source_path), parser=html.HTMLParser(encoding="utf-8"))
        except Exception:
            continue
        source_elements = [node for node in source_doc.iter() if isinstance(node.tag, str)]
        for lang in selected_langs:
            try:
                target_doc = html.parse(str(ROOT / lang / rel), parser=html.HTMLParser(encoding="utf-8"))
            except Exception:
                continue
            target_elements = [node for node in target_doc.iter() if isinstance(node.tag, str)]
            if len(source_elements) != len(target_elements):
                continue
            for source, target in zip(source_elements, target_elements):
                if source.tag.lower() != target.tag.lower():
                    continue
                for source_value, target_value in ((source.text, target.text), (source.tail, target.tail)):
                    if source_value and target_value and is_translatable(source_value):
                        key, value = clean_source(source_value), clean_source(target_value)
                        if reliable_parallel_value(key, value, lang) and key not in cache[lang]:
                            cache[lang][key] = value
                            seeded[lang] += 1
                for attr in ("alt", "title", "aria-label", "placeholder"):
                    source_value, target_value = source.get(attr), target.get(attr)
                    if source_value and target_value and is_translatable(source_value):
                        key, value = clean_source(source_value), clean_source(target_value)
                        if reliable_parallel_value(key, value, lang) and key not in cache[lang]:
                            cache[lang][key] = value
                            seeded[lang] += 1

    # Product names in category lists are keyed explicitly and remain reliable
    # even where older pages have small structural differences.
    source_category = html.parse(str(ROOT / "products" / "food-ingredients.html"), parser=html.HTMLParser(encoding="utf-8"))
    source_names = {node.get("data-product"): "".join(node.itertext()).strip() for node in source_category.xpath("//li[@data-product]")}
    for lang in selected_langs:
        target_category = html.parse(str(ROOT / lang / "products" / "food-ingredients.html"), parser=html.HTMLParser(encoding="utf-8"))
        target_names = {node.get("data-product"): "".join(node.itertext()).strip() for node in target_category.xpath("//li[@data-product]")}
        for key, source_value in source_names.items():
            target_value = target_names.get(key)
            if source_value and target_value and reliable_parallel_value(source_value, target_value, lang) and source_value not in cache[lang]:
                cache[lang][source_value] = target_value
                seeded[lang] += 1
    print("Translation-memory seeds: " + ", ".join(f"{lang}={seeded[lang]}" for lang in selected_langs), flush=True)


def make_batches(strings: list[str], limit: int = 5500, max_items: int = 48):
    batch, length = [], 0
    for value in sorted(strings, key=lambda s: (-len(s), s)):
        extra = len(value) + 24
        if batch and (length + extra > limit or len(batch) >= max_items):
            yield batch
            batch, length = [], 0
        batch.append(value)
        length += extra
    if batch:
        yield batch


_ARGOS_MODELS = {}
_GOOGLE_OPENER = urllib.request.build_opener()


def get_argos_model(target: str):
    """Load an installed Argos model without any online sentence-model lookup."""
    if target in _ARGOS_MODELS:
        return _ARGOS_MODELS[target]
    if not VENDOR_DIR.exists():
        raise RuntimeError(f"Offline Argos runtime not found: {VENDOR_DIR}")
    sys.path.insert(0, str(VENDOR_DIR))
    os.environ.setdefault("XDG_DATA_HOME", str(ARGOS_DATA_DIR))
    os.environ.setdefault("XDG_CONFIG_HOME", str(ARGOS_DATA_DIR.parent / "bespring_argos_config"))
    os.environ.setdefault("XDG_CACHE_HOME", str(ARGOS_DATA_DIR.parent / "bespring_argos_cache"))
    import argostranslate.translate as argos_translate
    import argostranslate.settings as argos_settings
    import ctranslate2

    languages = argos_translate.get_installed_languages()
    source = next((item for item in languages if item.code == "en"), None)
    destination = next((item for item in languages if item.code == target), None)
    if source is None or destination is None:
        raise RuntimeError(f"Offline Argos model en->{target} is not installed under {ARGOS_DATA_DIR}")
    wrapped = source.get_translation(destination)
    model = wrapped
    while not hasattr(model, "pkg") and hasattr(model, "underlying"):
        model = model.underlying
    if not hasattr(model, "pkg"):
        raise RuntimeError(f"Could not access offline Argos package en->{target}")
    translator = ctranslate2.Translator(
        str(model.pkg.package_path / "model"),
        device=argos_settings.device,
        inter_threads=getattr(argos_settings, "inter_threads", 1),
        intra_threads=getattr(argos_settings, "intra_threads", 0),
        compute_type=getattr(argos_settings, "compute_type", "default"),
    )
    _ARGOS_MODELS[target] = (model.pkg, translator, argos_settings)
    return _ARGOS_MODELS[target]


def translate_batch_offline(batch: list[str], target: str) -> list[str]:
    """Translate independent strings in one local CTranslate2 batch."""
    pkg, translator, settings = get_argos_model(target)
    tokenized = [pkg.tokenizer.encode(value) for value in batch]
    prefix = [[pkg.target_prefix]] * len(tokenized) if pkg.target_prefix else None
    results = translator.translate_batch(
        tokenized,
        target_prefix=prefix,
        replace_unknowns=True,
        max_batch_size=getattr(settings, "batch_size", 32),
        batch_type="tokens",
        beam_size=max(2, getattr(settings, "beam_size", 4)),
        num_hypotheses=1,
        length_penalty=0.2,
        return_scores=True,
    )
    output = []
    for result in results:
        value = pkg.tokenizer.decode(result.hypotheses[0]).strip()
        if pkg.target_prefix and value.startswith(pkg.target_prefix):
            value = value[len(pkg.target_prefix):].strip()
        output.append(value)
    return output


def google_translate_text(text: str, target: str, attempts: int = 10) -> str:
    payload = urllib.parse.urlencode({
        "client": "gtx", "sl": "en", "tl": target, "dt": "t", "q": text,
    }).encode("utf-8")
    request = urllib.request.Request(
        TRANSLATE_URL,
        data=payload,
        headers={"User-Agent": "Mozilla/5.0 BespringLocalization/1.0"},
    )
    for attempt in range(attempts):
        try:
            with _GOOGLE_OPENER.open(request, timeout=60) as response:
                data = json.loads(response.read().decode("utf-8"))
            result = "".join(part[0] for part in data[0] if part and part[0])
            time.sleep(2.5)
            return result
        except Exception as exc:
            if attempt == attempts - 1:
                raise RuntimeError(f"Google translation request failed for {target}: {exc}") from exc
            if isinstance(exc, urllib.error.HTTPError) and exc.code == 429:
                time.sleep(min(45, 15 + attempt * 5))
            else:
                time.sleep(min(30, 2 ** attempt))
    raise AssertionError("unreachable")


def translate_batch(batch: list[str], target: str) -> list[str]:
    """Translate a batch through the explicitly approved public-text service."""
    if os.getenv("BESPRING_OFFLINE_TRANSLATION") == "1":
        return translate_batch_offline(batch, target)
    if len(batch) == 1:
        return [google_translate_text(batch[0], target).strip()]
    source = "".join(
        value + (SEPARATOR.format(index=i) if i < len(batch) - 1 else "")
        for i, value in enumerate(batch)
    )
    translated = google_translate_text(source, target)
    parts = SEP_RE.split(translated)
    if len(parts) != len(batch):
        midpoint = len(batch) // 2
        return translate_batch(batch[:midpoint], target) + translate_batch(batch[midpoint:], target)
    return [part.strip() for part in parts]


def populate_translations(all_strings: set[str], cache, selected_langs):
    for lang in selected_langs:
        missing = [value for value in all_strings if value not in cache[lang]]
        batches = list(make_batches(missing))
        print(f"{lang}: {len(missing)} new strings in {len(batches)} batches", flush=True)
        for number, batch in enumerate(batches, 1):
            translated = translate_batch(batch, LANGS[lang]["api"])
            cache[lang].update(zip(batch, translated))
            if number % 10 == 0 or number == len(batches):
                save_cache(cache)
                print(f"  {lang}: translated batch {number}/{len(batches)}", flush=True)


def preserve_space(original: str, translated: str) -> str:
    prefix = re.match(r"^\s*", original).group(0)
    suffix = re.search(r"\s*$", original).group(0)
    return prefix + translated + suffix


def translated_json(obj, mapping, parent_key=None):
    if isinstance(obj, dict):
        return {key: translated_json(value, mapping, key) for key, value in obj.items()}
    if isinstance(obj, list):
        return [translated_json(value, mapping, parent_key) for value in obj]
    if isinstance(obj, str) and parent_key in JSON_TEXT_KEYS and clean_source(obj) in mapping:
        return mapping[clean_source(obj)]
    return obj


def translate_document(doc, mapping):
    for element in doc.iter():
        tag = element.tag.lower() if isinstance(element.tag, str) else ""
        if tag in SKIP_TAGS:
            if tag == "script" and element.get("type") == "application/ld+json" and element.text:
                try:
                    data = translated_json(json.loads(element.text), mapping)
                    element.text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
                except json.JSONDecodeError:
                    pass
            continue
        if element.text and clean_source(element.text) in mapping:
            element.text = preserve_space(element.text, mapping[clean_source(element.text)])
        if element.tail and clean_source(element.tail) in mapping:
            element.tail = preserve_space(element.tail, mapping[clean_source(element.tail)])
        for attr in ("alt", "title", "aria-label", "placeholder"):
            value = element.get(attr)
            if value and clean_source(value) in mapping:
                element.set(attr, mapping[clean_source(value)])
        if tag == "meta":
            key = element.get("name") or element.get("property") or ""
            value = element.get("content")
            if key in META_KEYS and value and clean_source(value) in mapping:
                element.set("content", mapping[clean_source(value)])


def page_url(rel: str, lang: str | None = None) -> str:
    prefix = f"/{lang}" if lang else ""
    return f"{BASE}{prefix}/{rel}"


def relative_from_page(rel: str, target: str) -> str:
    return posixpath.relpath(target, posixpath.dirname(rel))


def fix_asset_paths(doc):
    for element in doc.iter():
        for attr in ("href", "src"):
            value = element.get(attr)
            if not value or value.startswith(("http://", "https://", "//", "#", "mailto:", "tel:", "javascript:", "data:")):
                continue
            path = urllib.parse.urlsplit(value).path
            if Path(path).suffix.lower() in ASSET_EXTENSIONS:
                element.set(attr, "../" + value)
        srcset = element.get("srcset")
        if srcset:
            entries = []
            for item in srcset.split(","):
                bits = item.strip().split()
                if bits and not bits[0].startswith(("http://", "https://", "//", "data:")):
                    bits[0] = "../" + bits[0]
                entries.append(" ".join(bits))
            element.set("srcset", ", ".join(entries))


def set_alternates(doc, rel: str, lang: str):
    head = doc.find("head")
    for node in list(head.xpath("./link[@rel='canonical' or @rel='alternate']")):
        head.remove(node)
    insert_at = 0
    for index, child in enumerate(head):
        if child.tag == "meta":
            insert_at = index + 1
    links = []
    canonical = etree.Element("link", rel="canonical", href=page_url(rel, lang))
    links.append(canonical)
    links.append(etree.Element("link", rel="alternate", hreflang="en", href=page_url(rel)))
    for code in ACTIVE_LANGS:
        config = LANGS[code]
        links.append(etree.Element("link", rel="alternate", hreflang=config["hreflang"], href=page_url(rel, code)))
    links.append(etree.Element("link", rel="alternate", hreflang="x-default", href=page_url(rel)))
    for offset, node in enumerate(links):
        head.insert(insert_at + offset, node)


def localize_schema_urls(obj, rel: str, lang: str):
    if isinstance(obj, dict):
        return {key: localize_schema_urls(value, rel, lang) for key, value in obj.items()}
    if isinstance(obj, list):
        return [localize_schema_urls(value, rel, lang) for value in obj]
    if isinstance(obj, str) and obj.startswith(BASE + "/"):
        suffix = obj[len(BASE):]
        if suffix.startswith("/#"):
            return f"{BASE}/{lang}{suffix[1:]}"
        if not re.match(r"/(de|es|pt|ru|ar|zh-cn|zh-tw)/", suffix):
            return f"{BASE}/{lang}{suffix}"
    return obj


def set_locale_metadata(doc, rel: str, lang: str):
    root = doc.getroot()
    root.set("lang", LANGS[lang]["hreflang"])
    if lang == "ar":
        root.set("dir", "rtl")
    else:
        root.attrib.pop("dir", None)
    for meta in doc.xpath("//meta[@property='og:locale']"):
        meta.set("content", LANGS[lang]["og"])
    for meta in doc.xpath("//meta[@property='og:url']"):
        meta.set("content", page_url(rel, lang))
    for script in doc.xpath("//script[@type='application/ld+json']"):
        if not script.text:
            continue
        try:
            data = localize_schema_urls(json.loads(script.text), rel, lang)
            def set_language(value):
                if isinstance(value, dict):
                    for key in list(value):
                        if key == "inLanguage":
                            value[key] = LANGS[lang]["hreflang"]
                        else:
                            set_language(value[key])
                elif isinstance(value, list):
                    for item in value:
                        set_language(item)
            set_language(data)
            script.text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
        except json.JSONDecodeError:
            pass


def shorten_at_word(value: str, limit: int) -> str:
    if len(value) <= limit:
        return value
    shortened = value[: limit + 1].rsplit(" ", 1)[0].rstrip(" ,;:-–—")
    return (shortened or value[:limit]).rstrip(".") + "."


def normalize_seo_metadata(doc, lang: str):
    """Keep localized search snippets useful without keyword stuffing."""
    title_nodes = doc.xpath("//title")
    if title_nodes and title_nodes[0].text:
        title = title_nodes[0].text.strip()
        if len(title) < 25 and "Bespring" not in title:
            title += " | Bespring Chemical"
        title_nodes[0].text = shorten_at_word(title, 85)

    additions = {
        "de": " Technische Daten, Anwendungen, Verpackung und Angebotsinformationen prüfen.",
        "es": " Consulte especificaciones, aplicaciones, embalaje e información para solicitar una oferta.",
        "pt": " Consulte especificações, aplicações, embalagem e informações para cotação.",
        "ru": " Изучите характеристики, области применения, упаковку и данные для запроса цены.",
        "ar": " راجع المواصفات والاستخدامات والتعبئة والمعلومات اللازمة لطلب عرض سعر.",
    }
    for node in doc.xpath("//meta[@name='description' or @property='og:description' or @name='twitter:description']"):
        value = (node.get("content") or "").strip()
        if value and len(value) < 90:
            value += additions[lang]
        node.set("content", shorten_at_word(value, 180))


def language_selector(rel: str, lang: str, mapping):
    labels = [(None, "en", "EN")] + [
        (code, LANGS[code]["hreflang"], LANGS[code]["label"]) for code in ACTIVE_LANGS
    ]
    container = html.Element("div", {"class": "bs-seo-language", "aria-label": mapping.get("Language selection", "Language")})
    for code, html_lang, label in labels:
        target = rel if code is None else f"{code}/{rel}"
        current_rel = f"{lang}/{rel}"
        attrs = {"href": relative_from_page(current_rel, target), "lang": html_lang}
        if code == lang:
            attrs.update({"class": "active", "aria-current": "page"})
        anchor = html.Element("a", attrs)
        anchor.text = label
        container.append(anchor)
    return container


def install_language_selector(doc, rel: str, lang: str, mapping):
    existing = doc.xpath("//*[contains(concat(' ',normalize-space(@class),' '),' bs-seo-language ')]")
    selector = language_selector(rel, lang, mapping)
    if existing:
        existing[0].getparent().replace(existing[0], selector)
        return
    right = doc.xpath("//*[contains(concat(' ',normalize-space(@class),' '),' bs-seo-topbar-right ')]")
    if right:
        right[0].append(selector)


def write_html(path: Path, doc):
    path.parent.mkdir(parents=True, exist_ok=True)
    root = doc.getroot() if hasattr(doc, "getroot") else doc
    rendered = html.tostring(root, encoding="unicode", method="html", doctype="<!DOCTYPE html>")
    path.write_text(rendered, encoding="utf-8", newline="\n")


def localize_page(rel: str, lang: str, mapping):
    source = ROOT / rel
    doc = html.parse(str(source), parser=html.HTMLParser(encoding="utf-8"))
    translate_document(doc, mapping)
    fix_asset_paths(doc)
    set_alternates(doc, rel, lang)
    set_locale_metadata(doc, rel, lang)
    normalize_seo_metadata(doc, lang)
    install_language_selector(doc, rel, lang, mapping)
    write_html(ROOT / lang / rel, doc)


def english_alternate_markup(rel: str) -> str:
    parts = [f'<link rel="canonical" href="{page_url(rel)}">', f'<link rel="alternate" hreflang="en" href="{page_url(rel)}">']
    parts.extend(
        f'<link rel="alternate" hreflang="{LANGS[code]["hreflang"]}" href="{page_url(rel, code)}">'
        for code in ACTIVE_LANGS
    )
    parts.append(f'<link rel="alternate" hreflang="x-default" href="{page_url(rel)}">')
    return "".join(parts)


def update_english_seo(rel: str):
    path = ROOT / rel
    text = path.read_text(encoding="utf-8-sig")
    pattern = re.compile(r'<link rel="canonical"[^>]*>(?:\s*<link rel="alternate"[^>]*>)+')
    if not pattern.search(text):
        pattern = re.compile(r'<link rel="canonical"[^>]*>')
    text = pattern.sub(english_alternate_markup(rel), text, count=1)
    links = [(None, "en", "EN")] + [
        (code, LANGS[code]["hreflang"], LANGS[code]["label"]) for code in ACTIVE_LANGS
    ]
    selector_parts = ['<div class="bs-seo-language" aria-label="Language selection">']
    for code, html_lang, label in links:
        target = rel if code is None else f"{code}/{rel}"
        attrs = f' href="{relative_from_page(rel, target)}" lang="{html_lang}"'
        if code is None:
            attrs += ' class="active" aria-current="page"'
        selector_parts.append(f"<a{attrs}>{label}</a>")
    selector_parts.append("</div>")
    selector = "".join(selector_parts)
    selector_pattern = re.compile(r'<div class="bs-seo-language"[^>]*>.*?</div>', re.S)
    if selector_pattern.search(text):
        text = selector_pattern.sub(selector, text, count=1)
    else:
        topbar_right = re.compile(r'(<div class="bs-seo-topbar-right">.*?)(</div>)', re.S)
        text = topbar_right.sub(lambda match: match.group(1) + selector + match.group(2), text, count=1)
    path.write_text(text, encoding="utf-8", newline="\n")


def update_existing_locale_seo(rel: str, lang: str):
    """Expand reciprocal hreflang/selectors without retranslating existing prose."""
    path = ROOT / lang / rel
    if not path.exists():
        return
    doc = html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))
    set_alternates(doc, rel, lang)
    set_locale_metadata(doc, rel, lang)
    install_language_selector(doc, rel, lang, {})
    write_html(path, doc)


def wrap_text_with_link(li, href):
    if li.xpath("./a"):
        li.xpath("./a")[0].set("href", href)
        return
    anchor = html.Element("a", href=href)
    anchor.text = li.text
    li.text = None
    for child in list(li):
        li.remove(child)
        anchor.append(child)
    li.append(anchor)


def sync_product_indexes(lang: str, mapping):
    # Preserve the localized category prose; only synchronize product-detail links.
    en_path = ROOT / "products" / "food-ingredients.html"
    loc_path = ROOT / lang / "products" / "food-ingredients.html"
    en_doc = html.parse(str(en_path), parser=html.HTMLParser(encoding="utf-8"))
    loc_doc = html.parse(str(loc_path), parser=html.HTMLParser(encoding="utf-8"))
    hrefs = {}
    for li in en_doc.xpath("//li[@data-product][a]"):
        hrefs[li.get("data-product")] = li.xpath("./a")[0].get("href")
    for li in loc_doc.xpath("//li[@data-product]"):
        href = hrefs.get(li.get("data-product"))
        if href:
            wrap_text_with_link(li, href)
    for cls in ("pc-featured-grid",):
        source_nodes = en_doc.xpath(f"//*[contains(concat(' ',normalize-space(@class),' '),' {cls} ')]")
        target_nodes = loc_doc.xpath(f"//*[contains(concat(' ',normalize-space(@class),' '),' {cls} ')]")
        if source_nodes and target_nodes:
            replacement = copy.deepcopy(source_nodes[0])
            translate_document(replacement, mapping)
            target_nodes[0].getparent().replace(target_nodes[0], replacement)
    write_html(loc_path, loc_doc)

    # Synchronize the main product-page dossier list while preserving the rest.
    en_main = html.parse(str(ROOT / "products.html"), parser=html.HTMLParser(encoding="utf-8"))
    loc_main_path = ROOT / lang / "products.html"
    loc_main = html.parse(str(loc_main_path), parser=html.HTMLParser(encoding="utf-8"))
    source_nodes = en_main.xpath("//*[contains(concat(' ',normalize-space(@class),' '),' pp-product-links ')]")
    target_nodes = loc_main.xpath("//*[contains(concat(' ',normalize-space(@class),' '),' pp-product-links ')]")
    if source_nodes and target_nodes:
        replacement = copy.deepcopy(source_nodes[0])
        translate_document(replacement, mapping)
        target_nodes[0].getparent().replace(target_nodes[0], replacement)
        write_html(loc_main_path, loc_main)


def sync_solution_hubs(lang: str, builder, mapping):
    headings = {
        "de": "Detaillierte Anwendungsleitfäden",
        "es": "Guías detalladas de aplicación",
        "pt": "Guias detalhados de aplicação",
        "ru": "Подробные руководства по применению",
        "ar": "أدلة تطبيقية مفصلة",
    }
    for group in builder.GROUPS:
        path = ROOT / lang / "solutions" / group["hub"]
        doc = html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))
        cards = doc.xpath(f"//article[contains(concat(' ',normalize-space(@class),' '),' {group['card_class']} ')]")
        linked = doc.xpath(f"//a[contains(concat(' ',normalize-space(@class),' '),' {group['card_class']} ')]")
        if cards and len(cards) == len(group["pages"]):
            for card, page in zip(cards, group["pages"]):
                anchor = html.Element("a", {"class": group["card_class"], "href": page["slug"] + ".html", "aria-label": mapping.get("Read " + page["title"], mapping.get(page["title"], page["title"]))})
                anchor.text = card.text
                for child in list(card):
                    card.remove(child)
                    anchor.append(child)
                anchor.tail = card.tail
                card.getparent().replace(card, anchor)
        elif len(linked) == len(group["pages"]):
            for anchor, page in zip(linked, group["pages"]):
                anchor.set("href", page["slug"] + ".html")
        else:
            # Some older localized hubs intentionally use a compact editorial
            # layout instead of the English card grid. Preserve that layout and
            # add a concise, crawlable list of the corresponding detail pages.
            bodies = doc.xpath("//*[contains(concat(' ',normalize-space(@class),' '),' article-body ')]")
            if not bodies:
                raise RuntimeError(f"Unexpected hub structure in {path}: articles={len(cards)}, links={len(linked)}")
            body = bodies[0]
            for old in body.xpath(".//*[contains(concat(' ',normalize-space(@class),' '),' localized-solution-links ')]"):
                old.getparent().remove(old)
            heading = html.Element("h2", {"class": "localized-solution-links"})
            heading.text = headings[lang]
            body.append(heading)
            listing = html.Element("ul", {"class": "localized-solution-links"})
            for page in group["pages"]:
                item = html.Element("li")
                anchor = html.Element("a", href=page["slug"] + ".html")
                anchor.text = mapping.get(page["title"], page["title"])
                item.append(anchor)
                listing.append(item)
            body.append(listing)
        write_html(path, doc)


def rebuild_sitemap(builder):
    builder.rebuild_sitemap()


def main():
    global ACTIVE_LANGS
    parser = argparse.ArgumentParser()
    parser.add_argument("--langs", default=",".join(LANGS), help="Comma-separated language folders")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    selected_langs = [value.strip() for value in args.langs.split(",") if value.strip()]
    unknown = set(selected_langs) - set(LANGS)
    if unknown:
        raise SystemExit(f"Unknown languages: {', '.join(sorted(unknown))}")
    products, solutions, builder = target_pages()
    rels = products + solutions
    completed_langs = [
        code for code in LANGS
        if code not in selected_langs and all((ROOT / code / rel).exists() for rel in rels)
    ]
    ACTIVE_LANGS = [code for code in LANGS if code in selected_langs or code in completed_langs]
    print(f"Scope: {len(products)} product pages + {len(solutions)} solution pages = {len(rels)} English sources", flush=True)
    docs = [html.parse(str(ROOT / rel), parser=html.HTMLParser(encoding="utf-8")) for rel in rels]
    all_strings = set().union(*(collect_strings(doc) for doc in docs))
    # Index snippets and hub aria labels also need translations.
    all_strings.update({"Language selection"})
    for group in builder.GROUPS:
        for page in group["pages"]:
            all_strings.update({page["title"], "Read " + page["title"]})
    for index_file in (ROOT / "products.html", ROOT / "products" / "food-ingredients.html"):
        all_strings.update(collect_strings(html.parse(str(index_file), parser=html.HTMLParser(encoding="utf-8"))))
    print(f"Translation corpus: {len(all_strings)} unique strings, {sum(map(len, all_strings))} source characters", flush=True)
    if args.dry_run:
        return

    cache = load_cache()
    seed_parallel_translation_memory(cache, selected_langs)
    populate_translations(all_strings, cache, selected_langs)
    save_cache(cache)
    for rel in rels:
        update_english_seo(rel)
    for lang in selected_langs:
        for rel in rels:
            localize_page(rel, lang, cache[lang])
        sync_product_indexes(lang, cache[lang])
        sync_solution_hubs(lang, builder, cache[lang])
        print(f"{lang}: wrote {len(rels)} pages and synchronized localized indexes", flush=True)
    for lang in completed_langs:
        for rel in rels:
            update_existing_locale_seo(rel, lang)
        print(f"{lang}: expanded reciprocal hreflang and language selectors", flush=True)
    rebuild_sitemap(builder)
    print("Localization complete; sitemap rebuilt.", flush=True)


if __name__ == "__main__":
    main()

"""Complete the Arabic localization of all public HTML pages under /ar.

The existing Arabic pages already contain localized URLs, hreflang blocks and
RTL scaffolding.  This tool translates every remaining human-facing English
string while preserving the HTML structure and technical identifiers.
"""

from __future__ import annotations

import json
import os
import re
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from threading import Lock

from lxml import etree


ROOT = Path(__file__).resolve().parent.parent
AR_ROOT = ROOT / "ar"
CACHE_PATH = ROOT / "_notes" / "ar-translation-cache.json"
TRANSLATOR_PAGE = "https://www.bing.com/translator"
BING_TRANSLATE_URL = "https://www.bing.com/ttranslatev3"
USER_AGENT = "Mozilla/5.0 Bespring-Arabic-Localization/1.0"
BING_AUTH: dict[str, str] | None = None
BING_AUTH_LOCK = Lock()

SKIP_TAGS = {"style", "code", "pre", "svg", "math"}
TRANSLATABLE_ATTRIBUTES = {"alt", "title", "aria-label", "placeholder"}
META_KEYS = {
    "name",
    "headline",
    "description",
    "og:title",
    "og:description",
    "og:image:alt",
    "twitter:title",
    "twitter:description",
    "twitter:image:alt",
}
JSON_TEXT_KEYS = {
    "name",
    "headline",
    "description",
    "alternativeHeadline",
    "articleSection",
    "caption",
    "text",
    "slogan",
    "streetAddress",
    "addressLocality",
    "addressRegion",
    "contactType",
    "areaServed",
    "availableLanguage",
    "knowsAbout",
    "serviceType",
    "category",
    "audienceType",
    "value",
}

DO_NOT_TRANSLATE = {
    "Bespring",
    "Bespring Chemical",
    "STPP",
    "SHMP",
    "TKPP",
    "MCP",
    "DCP",
    "SALP",
    "CMC",
    "CAS",
    "COA",
    "TDS",
    "SDS",
    "MSDS",
    "ISO",
    "HACCP",
    "HALAL",
    "KOSHER",
    "REACH",
    "WhatsApp",
    "WeChat",
    "SGS",
    "BRC",
    "GMP",
    "FOB",
    "CIF",
    "CFR",
    "EXW",
}

ARABIC_GLOSSARY = {
    "بيسبرينج كيميكال": "Bespring Chemical",
    "بيسبرينغ كيميكال": "Bespring Chemical",
    "شركة بيسبرينج للكيماويات": "Bespring Chemical",
    "الصف الغذائي": "الدرجة الغذائية",
    "درجة الطعام": "الدرجة الغذائية",
    "جودة الطعام": "الدرجة الغذائية",
    "الصف الأعلاف": "الدرجة العلفية",
    "درجة التغذية": "الدرجة العلفية",
    "الدرجة الفنية": "الدرجة التقنية",
    "ورقة بيانات سلامة المواد": "صحيفة بيانات السلامة",
    "طلب عرض أسعار": "طلب عرض سعر",
    "اقتباس": "عرض سعر",
    "سلسلة التوريد العالمية": "سلسلة إمداد عالمية",
}

ENGLISH_UI_REPLACEMENTS = {
    "Open navigation menu": "فتح قائمة التنقل",
    "Close navigation menu": "إغلاق قائمة التنقل",
    "Toggle navigation menu": "تبديل قائمة التنقل",
    "Main navigation": "التنقل الرئيسي",
    "Language selection": "اختيار اللغة",
    "Breadcrumb": "مسار التنقل",
    "Previous slide": "الشريحة السابقة",
    "Next slide": "الشريحة التالية",
    "Back to top": "العودة إلى الأعلى",
    "Export Services and Chemical Procurement Support | Bespring Chemical": "خدمات تصدير وشراء المواد الكيميائية | Bespring Chemical",
    "Guide for chemical buyers": "دليل لمشتري المواد الكيميائية",
    "Key caution": "تنبيه مهم",
    "WhatsApp Sales": "مبيعات واتساب",
    "Calcium Carbonate": "كربونات الكالسيوم",
    "Carrageenan": "كاراجينان",
    "Calcium": "الكالسيوم",
    "Category": "الفئة",
    "خام الغ ore": "خام المعدن",
    "Phone / واتساب": "الهاتف / واتساب",
    "Chat on واتساب": "الدردشة عبر واتساب",
    "Discuss Your المتطلبات": "ناقش متطلباتك",
    "News &amp; Buyer دليلs": "الأخبار وأدلة المشترين",
    "Read Full دليل": "قراءة الدليل كاملاً",
    "MCP vs DCP Feed Phosphates: A Buyer’s Qualification دليل": "MCP مقابل DCP لفوسفات الأعلاف: دليل تأهيل المشتري",
    "الشركة Profile": "الملف التعريفي للشركة",
    "المتطلبات and safety margins vary by genetics, age, performance target and jurisdiction. A qualified nutritionist should approve the final formula.": "تختلف المتطلبات وهوامش السلامة باختلاف السلالة والعمر وهدف الأداء واللوائح المحلية. ويجب أن يعتمد اختصاصي تغذية مؤهل التركيبة النهائية.",
    "Fi Vietnam 2024 | Bespring Chemical": "معرض Fi Vietnam 2024 | Bespring Chemical",
    "Vietfood &amp; Beverage 2023 | Bespring Chemical": "معرض Vietfood &amp; Beverage 2023 | Bespring Chemical",
    '"@type":"مسار التنقلList"': '"@type":"BreadcrumbList"',
}

TECHNICAL_ONLY_RE = re.compile(
    r"^(?:[\s\d.,:;/%+()®™°×–—-]|"
    r"STPP|SHMP|TKPP|MCP|DCP|SALP|CMC|CAS|COA|TDS|SDS|MSDS|"
    r"ISO|HACCP|HALAL|KOSHER|REACH|SGS|BRC|GMP|FOB|CIF|CFR|EXW|"
    r"E\d{3}(?:\([ivx]+\))?|INS|pH|Na\d*[A-Za-z0-9()]*|"
    r"Ca[A-Za-z0-9()]*|K\d*[A-Za-z0-9()]*)+$",
    re.IGNORECASE,
)


def load_cache() -> dict[str, str]:
    if not CACHE_PATH.exists():
        return {}
    return json.loads(CACHE_PATH.read_text(encoding="utf-8"))


def save_cache(cache: dict[str, str]) -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(
        json.dumps(cache, ensure_ascii=False, indent=2, sort_keys=True),
        encoding="utf-8",
    )


def normalize_source(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def should_translate(value: str) -> bool:
    text = normalize_source(value)
    if not text or text in DO_NOT_TRANSLATE:
        return False
    # Existing Arabic strings often contain international brand names,
    # chemical abbreviations or standards. Sending those mixed strings with
    # an English source hint can translate the Arabic portion backwards.
    if re.search(r"[\u0600-\u06ff]", text):
        return False
    if text.startswith(("http://", "https://", "mailto:", "tel:")):
        return False
    if "@" in text and " " not in text:
        return False
    if TECHNICAL_ONLY_RE.fullmatch(text):
        return False
    words = re.findall(r"[A-Za-z][A-Za-z'-]*", text)
    return any(len(word) >= 2 for word in words)


def polish_arabic(value: str) -> str:
    out = value
    for source, target in ARABIC_GLOSSARY.items():
        out = out.replace(source, target)
    out = re.sub(r"\s+([،؛؟.!,:])", r"\1", out)
    out = re.sub(r"([،؛؟])(?=[^\s<])", r"\1 ", out)
    return out


def get_bing_auth(force_refresh: bool = False) -> dict[str, str]:
    global BING_AUTH
    with BING_AUTH_LOCK:
        if BING_AUTH is not None and not force_refresh:
            return BING_AUTH
        request = urllib.request.Request(
            TRANSLATOR_PAGE, headers={"User-Agent": USER_AGENT}
        )
        with urllib.request.urlopen(request, timeout=45) as response:
            page = response.read().decode("utf-8")
        ig_match = re.search(r'IG:"([^"]+)"', page)
        token_match = re.search(
            r"params_AbusePreventionHelper\s*=\s*\[(\d+),\"([^\"]+)\"",
            page,
        )
        iid_match = re.search(r'data-iid="([^"]*translator[^"]*)"', page)
        if not ig_match or not token_match:
            raise RuntimeError("Unable to read Bing translator session data")
        BING_AUTH = {
            "ig": ig_match.group(1),
            "key": token_match.group(1),
            "token": token_match.group(2),
            "iid": iid_match.group(1) if iid_match else "translator.5023.1",
        }
        return BING_AUTH


def translate_request(text: str, retries: int = 5) -> str:
    for attempt in range(retries):
        try:
            auth = get_bing_auth(force_refresh=attempt > 1)
            payload = urllib.parse.urlencode(
                {
                    "fromLang": "en",
                    "to": "ar",
                    "text": text,
                    "token": auth["token"],
                    "key": auth["key"],
                }
            ).encode("utf-8")
            url = (
                f"{BING_TRANSLATE_URL}?isVertical=1"
                f"&IG={urllib.parse.quote(auth['ig'])}"
                f"&IID={urllib.parse.quote(auth['iid'])}"
            )
            request = urllib.request.Request(
                url, data=payload, headers={"User-Agent": USER_AGENT}
            )
            with urllib.request.urlopen(request, timeout=45) as response:
                data = json.loads(response.read().decode("utf-8"))
            if not isinstance(data, list):
                raise RuntimeError(f"Unexpected Bing response: {str(data)[:300]}")
            translated = data[0]["translations"][0]["text"]
            return polish_arabic(translated)
        except Exception as error:
            if attempt == 0:
                print(f"Translation retry: {type(error).__name__}: {error}", flush=True)
            if attempt == retries - 1:
                raise
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError("Translation retries exhausted")


def make_batches(items: list[str], max_chars: int = 850, max_items: int = 10):
    batches: list[list[str]] = []
    current: list[str] = []
    current_size = 0
    for item in items:
        added = len(item) + 22
        if current and (len(current) >= max_items or current_size + added > max_chars):
            batches.append(current)
            current = []
            current_size = 0
        current.append(item)
        current_size += added
    if current:
        batches.append(current)
    return batches


def translate_batch(items: list[str]) -> dict[str, str]:
    if len(items) == 1:
        return {items[0]: translate_request(items[0])}
    combined = items[0]
    for index, item in enumerate(items[1:]):
        combined += f"\nZXQSEP{index:04d}ZXQ\n{item}"
    translated = translate_request(combined)
    parts = re.split(r"\s*ZXQSEP\d{4}ZXQ\s*", translated)
    if len(parts) != len(items):
        # A provider occasionally alters a separator. Fall back only for this
        # small batch, not for the full site.
        return {item: translate_request(item) for item in items}
    return {source: polish_arabic(target) for source, target in zip(items, parts)}


def translate_missing(texts: set[str], cache: dict[str, str]) -> None:
    pending = sorted(text for text in texts if text not in cache)
    print(f"Unique strings: {len(texts)}; uncached: {len(pending)}")
    if not pending:
        return

    batches = make_batches(pending)
    print(f"Translation batches: {len(batches)}")
    completed = 0
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(translate_batch, batch): batch for batch in batches}
        for future in as_completed(futures):
            cache.update(future.result())
            completed += 1
            if completed % 20 == 0:
                save_cache(cache)
                print(f"Translated batches {completed}/{len(batches)}")
    save_cache(cache)


def add_candidate(candidates: set[str], value: str | None) -> None:
    if value is None:
        return
    normalized = normalize_source(value)
    if should_translate(normalized):
        candidates.add(normalized)


def walk_json(value, candidates: set[str]) -> None:
    if isinstance(value, dict):
        for key, item in value.items():
            if key in JSON_TEXT_KEYS:
                walk_json_text(item, candidates)
            else:
                walk_json(item, candidates)
    elif isinstance(value, list):
        for item in value:
            walk_json(item, candidates)


def walk_json_text(value, candidates: set[str]) -> None:
    if isinstance(value, str):
        add_candidate(candidates, value)
    elif isinstance(value, list):
        for item in value:
            walk_json_text(item, candidates)
    elif isinstance(value, dict):
        for item in value.values():
            walk_json_text(item, candidates)


def collect_candidates(tree: etree._ElementTree, candidates: set[str]) -> None:
    for element in tree.iter():
        if not isinstance(element.tag, str):
            continue
        tag = element.tag.lower()
        if tag == "script" and element.get("type") == "application/ld+json":
            try:
                walk_json(json.loads(element.text or ""), candidates)
            except json.JSONDecodeError:
                pass
            continue
        if tag in SKIP_TAGS or tag == "script":
            continue

        add_candidate(candidates, element.text)
        for child in element:
            add_candidate(candidates, child.tail)

        for attr in TRANSLATABLE_ATTRIBUTES:
            add_candidate(candidates, element.get(attr))

        if tag == "meta":
            key = (
                element.get("name")
                or element.get("property")
                or element.get("itemprop")
                or ""
            ).lower()
            if key in META_KEYS:
                add_candidate(candidates, element.get("content"))
        if tag == "input" and (element.get("type") or "").lower() in {"submit", "button"}:
            add_candidate(candidates, element.get("value"))


def translate_preserving_space(value: str | None, cache: dict[str, str]) -> str | None:
    if value is None:
        return None
    normalized = normalize_source(value)
    if not should_translate(normalized) or normalized not in cache:
        return value
    leading = value[: len(value) - len(value.lstrip())]
    trailing = value[len(value.rstrip()) :]
    return f"{leading}{cache[normalized]}{trailing}"


def translate_json(value, cache: dict[str, str]):
    if isinstance(value, dict):
        result = {}
        for key, item in value.items():
            if key in JSON_TEXT_KEYS:
                result[key] = translate_json_text(item, cache)
            else:
                result[key] = translate_json(item, cache)
        return result
    if isinstance(value, list):
        return [translate_json(item, cache) for item in value]
    return value


def translate_json_text(value, cache: dict[str, str]):
    if isinstance(value, str):
        return translate_preserving_space(value, cache)
    if isinstance(value, list):
        return [translate_json_text(item, cache) for item in value]
    if isinstance(value, dict):
        return {key: translate_json_text(item, cache) for key, item in value.items()}
    return value


def apply_translations(tree: etree._ElementTree, cache: dict[str, str]) -> None:
    for element in tree.iter():
        if not isinstance(element.tag, str):
            continue
        tag = element.tag.lower()
        if tag == "script" and element.get("type") == "application/ld+json":
            try:
                data = json.loads(element.text or "")
                element.text = json.dumps(
                    translate_json(data, cache), ensure_ascii=False, separators=(",", ":")
                )
            except json.JSONDecodeError:
                pass
            continue
        if tag in SKIP_TAGS or tag == "script":
            continue

        element.text = translate_preserving_space(element.text, cache)
        for child in element:
            child.tail = translate_preserving_space(child.tail, cache)

        for attr in TRANSLATABLE_ATTRIBUTES:
            if element.get(attr):
                element.set(attr, translate_preserving_space(element.get(attr), cache))

        if tag == "meta":
            key = (
                element.get("name")
                or element.get("property")
                or element.get("itemprop")
                or ""
            ).lower()
            if key in META_KEYS and element.get("content"):
                element.set(
                    "content",
                    translate_preserving_space(element.get("content"), cache),
                )
        if tag == "input" and (element.get("type") or "").lower() in {"submit", "button"}:
            if element.get("value"):
                element.set(
                    "value",
                    translate_preserving_space(element.get("value"), cache),
                )


def fix_language_switcher(tree: etree._ElementTree, page: Path) -> None:
    locale_map = {
        "en": "",
        "zh-cn": "zh-cn",
        "zh-tw": "zh-tw",
        "es": "es",
        "pt": "pt",
        "ru": "ru",
        "de": "de",
        "ar": "ar",
    }
    relative = page.relative_to(AR_ROOT)
    relative_posix = relative.as_posix()
    switchers = tree.xpath(
        '//div[contains(concat(" ", normalize-space(@class), " "), " bs-seo-language ")]'
    )
    for switcher in switchers:
        for anchor in switcher.xpath(".//a[@lang]"):
            lang = anchor.get("lang", "").lower()
            locale = locale_map.get(lang)
            if locale is None:
                continue
            if locale == "ar":
                target = page
            else:
                base = ROOT / locale if locale else ROOT
                target = base / relative
                if not target.exists():
                    if relative_posix.startswith("products/food-ingredients/"):
                        target = base / "products" / "food-ingredients.html"
                    elif relative_posix.startswith("news/"):
                        target = base / "news.html"
                    else:
                        target = base / "index.html"
            anchor.set(
                "href",
                os.path.relpath(target, page.parent).replace("\\", "/"),
            )


def fix_known_assets(tree: etree._ElementTree) -> None:
    for image in tree.xpath('//img[contains(@src,"dicalcium-phosphate-dcp-food-grade.webp")]'):
        image.set(
            "src",
            "../../../images/dicalcium-phosphate-dcp-feed-grade-china-supplier.jpg",
        )


def parse_page(path: Path) -> etree._ElementTree:
    parser = etree.HTMLParser(remove_comments=False, recover=True)
    return etree.parse(str(path), parser)


def postprocess_html(html: str) -> str:
    out = html
    for source, target in ENGLISH_UI_REPLACEMENTS.items():
        out = out.replace(source, target)
    for source, target in ARABIC_GLOSSARY.items():
        out = out.replace(source, target)
    out = re.sub(
        r"<html([^>]*?)\blang=[\"'][^\"']*[\"']([^>]*)>",
        r'<html\1lang="ar" dir="rtl"\2>',
        out,
        count=1,
        flags=re.IGNORECASE,
    )
    out = re.sub(r'\sdir="rtl"(?=[^>]*\sdir="rtl")', "", out, count=1)
    out = re.sub(
        r'("@type"\s*:\s*")مسار التنقلList(")',
        r"\1BreadcrumbList\2",
        out,
    )
    out = re.sub(r'("@type"\s*:\s*")مكان(")', r"\1Place\2", out)
    corrupt_alias = '"alternateName": ["Bespring Chemical",'
    if corrupt_alias in out:
        start = out.index(corrupt_alias)
        end = out.find("\n", start)
        if end != -1:
            out = (
                out[:start]
                + '"alternateName": ["Bespring Chemical", "百泉化工有限公司"],'
                + out[end:]
            )
    return out


def main() -> None:
    pages = sorted(AR_ROOT.rglob("*.html"))
    cache = load_cache()
    trees: dict[Path, etree._ElementTree] = {}
    candidates: set[str] = set()

    for page in pages:
        tree = parse_page(page)
        trees[page] = tree
        collect_candidates(tree, candidates)

    translate_missing(candidates, cache)

    for page, tree in trees.items():
        apply_translations(tree, cache)
        fix_language_switcher(tree, page)
        fix_known_assets(tree)
        html = etree.tostring(
            tree,
            encoding="unicode",
            method="html",
            doctype="<!DOCTYPE html>",
            pretty_print=False,
        )
        page.write_text(postprocess_html(html), encoding="utf-8", newline="\n")

    print(f"Arabic pages completed: {len(pages)}")


if __name__ == "__main__":
    main()

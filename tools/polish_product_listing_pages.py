#!/usr/bin/env python3
"""Localize and post-edit the five product-listing page sets.

The script preserves page structure and hrefs. It translates only English
source strings still present in pt/es pages, applies a reviewed product-name
glossary, and makes the client-side product search bilingual.
"""

from __future__ import annotations

import importlib
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import localize_new_pages as localizer


LANG_MODULES = {
    "pt": "portuguese",
    "es": "spanish",
    "ru": "russian",
    "de": "german",
    "ar": "arabic",
}

LISTING_RELS = [
    "products.html",
    "products/agricultural-fertilizers.html",
    "products/animal-nutrition.html",
    "products/food-ingredients.html",
    "products/home-care-industrial-cleaning.html",
    "products/mining.html",
    "products/water-treatment.html",
]

# Human-reviewed corrections for terms that generic translation commonly gets
# wrong or that must follow established chemical/industry nomenclature.
PRODUCT_OVERRIDES = {
    "pt": {
        "cream of tartar (potassium bitartrate)": "cremor tártaro (bitartrato de potássio)",
        "shortening": "gordura vegetal para panificação (shortening)",
        "soda ash": "barrilha (carbonato de sódio)",
        "soda ash (sodium carbonate)": "barrilha (carbonato de sódio)",
        "faba protein": "proteína de fava",
        "sweet whey": "soro de leite doce",
        "clean whey": "soro de leite purificado",
        "acetylated distarch phosphate": "fosfato de diamido acetilado",
        "calcium sorbate": "sorbato de cálcio",
        "mono propylene glycol (mpg usp)": "monopropilenoglicol (MPG USP)",
        "mono propylene glycol (mpg)": "monopropilenoglicol (MPG)",
        "dicalcium phosphate (anhydrous)": "fosfato dicálcico (anidro)",
        "dicalcium phosphate (anhydrous) (dcp)": "fosfato dicálcico (anidro) (DCP)",
        "whey protein": "proteína do soro do leite",
        "quick lime / hydrated lime": "cal viva / cal hidratada",
        "quick lime / hydrated lime (cao / ca(oh)₂)": "cal viva / cal hidratada (CaO / Ca(OH)₂)",
        "sulfuric acid (h₂so₄)": "ácido sulfúrico (H₂SO₄)",
        "alum (aluminum sulfate)": "alúmen (sulfato de alumínio)",
        "mono- and diglycerides (mdg)": "mono e diglicerídeos (MDG)",
        "diacetyl tartaric acid esters of mono- and diglycerides (datem)":
            "ésteres diacetiltartáricos de mono e diglicerídeos (DATEM)",
        "dry dairy powders": "ingredientes lácteos em pó",
    },
    "es": {
        "cream of tartar (potassium bitartrate)": "crémor tártaro (bitartrato de potasio)",
        "shortening": "grasa vegetal para panificación (shortening)",
        "soda ash": "carbonato de sodio (soda ash)",
        "soda ash (sodium carbonate)": "carbonato de sodio",
        "faba protein": "proteína de haba",
        "sweet whey": "suero dulce",
        "clean whey": "suero purificado",
        "acetylated distarch phosphate": "fosfato de dialmidón acetilado",
        "calcium sorbate": "sorbato de calcio",
        "mono propylene glycol (mpg usp)": "monopropilenglicol (MPG USP)",
        "mono propylene glycol (mpg)": "monopropilenglicol (MPG)",
        "dextrose monohydrate": "dextrosa monohidratada",
        "quick lime / hydrated lime": "cal viva / cal hidratada",
        "quick lime / hydrated lime (cao / ca(oh)₂)": "cal viva / cal hidratada (CaO / Ca(OH)₂)",
        "sulfuric acid (h₂so₄)": "ácido sulfúrico (H₂SO₄)",
        "sodium metabisulfite (smbs)": "metabisulfito de sodio (SMBS)",
        "trichloroisocyanuric acid (tcca)": "ácido tricloroisocianúrico (TCCA)",
        "quaternary ammonium compounds (qacs)": "compuestos de amonio cuaternario (QACs)",
        "methoxypropylamine (mopa)": "metoxipropilamina (MOPA)",
        "alum (aluminum sulfate)": "alumbre (sulfato de aluminio)",
    },
    "ru": {
        "l-threonine": "L-треонин",
        "l-valine": "L-валин",
        "faba protein": "белок бобов фава",
        "cream of tartar (potassium bitartrate)": "винный камень (гидротартрат калия)",
        "shortening": "кондитерский жир (shortening)",
        "sweet whey": "сладкая молочная сыворотка",
        "ferrous lactate": "лактат железа(II)",
        "guar gum": "гуаровая камедь",
        "konjac gum": "конжаковая камедь",
        "gellan gum": "геллановая камедь",
        "xanthan gum": "ксантановая камедь",
        "sodium acid pyrophosphate (sapp)": "кислый пирофосфат натрия (SAPP)",
    },
    "de": {
        "l-valine": "L-Valin",
        "betaine": "Betain",
        "polysorbates": "Polysorbate",
        "carrageenan": "Carrageen",
        "gellan gum": "Gellangummi",
        "guar gum": "Guarkernmehl",
        "konjac gum": "Konjakgummi",
        "xanthan gum": "Xanthan",
        "sweet whey": "Süßmolke",
        "shortening": "Backfett (Shortening)",
        "soda ash": "Natriumcarbonat (Soda)",
        "soda ash (sodium carbonate)": "Natriumcarbonat (Soda)",
    },
    "ar": {
        "diammonium phosphate (dap)": "فوسفات ثنائي الأمونيوم (DAP)",
        "dicalcium phosphate (anhydrous)": "فوسفات ثنائي الكالسيوم (لا مائي)",
        "dicalcium phosphate (dihydrate)": "فوسفات ثنائي الكالسيوم ثنائي الهيدرات",
        "monocalcium phosphate (anhydrous)": "فوسفات أحادي الكالسيوم (لا مائي)",
        "sodium diacetate": "ثنائي أسيتات الصوديوم",
        "cream of tartar (potassium bitartrate)": "كريم التارتار (بيطرطرات البوتاسيوم)",
        "calcium sorbate": "سوربات الكالسيوم",
        "shortening": "دهن نباتي صلب (Shortening)",
        "acetylated distarch phosphate": "فوسفات ثنائي النشا المُؤستل",
        "zinc lactate": "لاكتات الزنك",
        "propylene glycol": "بروبيلين غليكول",
        "vanillin": "فانيلين",
        "faba protein": "بروتين الفول",
        "dextrose monohydrate": "ديكستروز أحادي الهيدرات",
    },
}

TEXT_REPLACEMENTS = {
    "pt": {
        "Breadcrumb": "Trilha de navegação",
        "Navegue por produtos por portfólio de materiais": "Explore os produtos por portfólio de materiais",
        "preparar um consulta comercial": "preparar uma consulta comercial",
        "Use-o para procurar": "Use esta página para localizar",
        "grau e documentação são confirmadas": "grau e documentação são confirmados",
        "aprovação de ações ou regulamentos universais": "aprovação universal de alegações ou conformidade regulatória",
        "Aditivos Alimentares e Nutrição Animal": "Aditivos para rações e nutrição animal",
        "Reagentes de flutuação": "Reagentes de flotação",
        "entradas de micronutrientes": "fontes de micronutrientes",
        "Ácido Sódico Pyrofosfato": "Pirofosfato ácido de sódio",
        "Fosfato de alumínio de sódio": "Fosfato de sódio e alumínio",
        "Pirofosfato de tetrassódio": "Pirofosfato tetrassódico",
        "Fosfato de di-hidrogénio de sódio": "Fosfato monossódico",
        "Carboximetilcelulose de sódio": "Carboximetilcelulose sódica",
        "Perfil de produto e aquisição": "Perfil técnico e de fornecimento",
        "janela de envio solicitado": "janela de envio solicitada",
        "Especificacao": "Especificação",
    },
    "es": {
        "Quimicos para tratamiento de agua": "Químicos para tratamiento de agua",
        "Quimicas clave para la compra de tratamiento de agua": "Productos químicos clave para el tratamiento de agua",
        "Especificacion-led inquiry": "Consulta basada en especificaciones",
        "Especificacion": "Especificación",
        "Enlaces Rapidos": "Enlaces rápidos",
        "Cal Rápida/ Cal Hidratada": "Cal viva / cal hidratada",
    },
    "ru": {},
    "de": {},
    "ar": {},
}


def direct_text(node) -> str:
    return " ".join(node.text_content().split())


def set_item_text(node, value: str) -> None:
    anchors = node.xpath("./a")
    target = anchors[0] if anchors else node
    for child in list(target):
        target.remove(child)
    target.text = value


def replace_text_fragments(doc, replacements: dict[str, str]) -> None:
    for element in doc.iter():
        if not isinstance(element.tag, str) or element.tag.lower() in localizer.SKIP_TAGS:
            continue
        if element.text:
            for source, target in replacements.items():
                element.text = element.text.replace(source, target)
        if element.tail:
            for source, target in replacements.items():
                element.tail = element.tail.replace(source, target)
        for attr in ("alt", "title", "aria-label", "placeholder"):
            value = element.get(attr)
            if value:
                for source, target in replacements.items():
                    value = value.replace(source, target)
                element.set(attr, value)


def source_product_names() -> dict[str, str]:
    names: dict[str, str] = {}
    for rel in LISTING_RELS[1:]:
        doc = html.parse(str(ROOT / rel), parser=html.HTMLParser(encoding="utf-8"))
        for node in doc.xpath("//li[@data-product]"):
            names[node.get("data-product")] = direct_text(node)
    return names


def exact_english_strings(rel: str, lang: str) -> set[str]:
    source = html.parse(str(ROOT / rel), parser=html.HTMLParser(encoding="utf-8"))
    target = html.parse(str(ROOT / lang / rel), parser=html.HTMLParser(encoding="utf-8"))
    source_strings = localizer.collect_strings(source)
    target_strings = localizer.collect_strings(target)
    return source_strings & target_strings


def batches(values: list[str], max_chars: int = 420, max_items: int = 12):
    batch: list[str] = []
    length = 0
    for value in sorted(values, key=lambda item: (len(item), item)):
        extra = len(value) + 1
        if batch and (length + extra > max_chars or len(batch) >= max_items):
            yield batch
            batch, length = [], 0
        batch.append(value)
        length += extra
    if batch:
        yield batch


def translate_public_batch(batch: list[str], lang: str, attempts: int = 6) -> list[str]:
    target = "pt-BR" if lang == "pt" else lang
    query = urllib.parse.urlencode({"q": "\n".join(batch), "langpair": f"en|{target}"})
    request = urllib.request.Request(
        "https://api.mymemory.translated.net/get?" + query,
        headers={"User-Agent": "BespringProductLocalization/1.0"},
    )
    payload = None
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                payload = json.loads(response.read().decode("utf-8"))
            break
        except Exception:
            if attempt == attempts - 1:
                raise
            time.sleep(2 + attempt * 2)
    assert payload is not None
    if payload.get("responseStatus") != 200 or payload.get("quotaFinished"):
        raise RuntimeError(payload.get("responseDetails") or "translation quota exhausted")
    translated = payload["responseData"]["translatedText"].splitlines()
    if len(translated) != len(batch):
        if len(batch) == 1:
            return [payload["responseData"]["translatedText"].strip()]
        midpoint = len(batch) // 2
        return translate_public_batch(batch[:midpoint], lang) + translate_public_batch(batch[midpoint:], lang)
    return [value.strip() for value in translated]


def populate_listing_translations(strings: set[str], cache, langs: tuple[str, ...]) -> None:
    for lang in langs:
        missing = [value for value in strings if value not in cache[lang]]
        work = list(batches(missing))
        print(f"{lang}: {len(missing)} new strings in {len(work)} reviewed batches", flush=True)
        for number, batch in enumerate(work, 1):
            translated = translate_public_batch(batch, lang)
            cache[lang].update(zip(batch, translated))
            localizer.save_cache(cache)
            if number % 5 == 0 or number == len(work):
                print(f"  {lang}: draft batch {number}/{len(work)}", flush=True)
            time.sleep(0.6)


def apply_new_product_names(doc, lang: str, module) -> None:
    for node in doc.xpath("//li[@data-product][a]"):
        anchor = node.xpath("./a")[0]
        slug = Path(anchor.get("href")).stem
        if slug in module.PRODUCTS:
            set_item_text(node, module.PRODUCTS[slug])


def apply_dossier_names(doc, lang: str) -> None:
    category = html.parse(
        str(ROOT / lang / "products" / "food-ingredients.html"),
        parser=html.HTMLParser(encoding="utf-8"),
    )
    names = {}
    for anchor in category.xpath("//li[@data-product]/a[@href]"):
        names[Path(anchor.get("href")).stem] = direct_text(anchor)
    for anchor in doc.xpath(
        "//*[contains(concat(' ',normalize-space(@class),' '),' pp-product-links ')]/a[@href]"
    ):
        strong = anchor.xpath("./strong")
        slug = Path(anchor.get("href")).stem
        if strong and slug in names:
            strong[0].text = names[slug]


def localize_search_terms(doc, english_names: dict[str, str]) -> None:
    for node in doc.xpath("//li[@data-product]"):
        key = node.get("data-product").rsplit(" | ", 1)[-1]
        localized = direct_text(node).casefold()
        english = english_names.get(key, key).casefold()
        node.set("data-product", f"{localized} | {english}")


def main() -> None:
    cache = localizer.load_cache()
    needed = set()
    for lang in ("pt", "es"):
        for rel in LISTING_RELS:
            needed.update(exact_english_strings(rel, lang))
    populate_listing_translations(needed, cache, ("pt", "es"))
    english_names = source_product_names()

    for lang, module_name in LANG_MODULES.items():
        module = importlib.import_module(f"polish_{module_name}_new_pages")
        mapping = cache[lang]
        for rel in LISTING_RELS:
            path = ROOT / lang / rel
            doc = html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))
            if lang in ("pt", "es"):
                localizer.translate_document(doc, mapping)
            if rel != "products.html":
                for node in doc.xpath("//li[@data-product]"):
                    key = node.get("data-product").rsplit(" | ", 1)[-1]
                    if key in PRODUCT_OVERRIDES[lang]:
                        set_item_text(node, PRODUCT_OVERRIDES[lang][key])
                    elif lang in ("pt", "es") and key in english_names:
                        translated = mapping.get(english_names[key])
                        if translated:
                            set_item_text(node, translated)
                apply_new_product_names(doc, lang, module)
                localize_search_terms(doc, english_names)
            else:
                apply_dossier_names(doc, lang)
            replace_text_fragments(doc, TEXT_REPLACEMENTS[lang])
            localizer.write_html(path, doc)
        print(f"{lang}: localized {len(LISTING_RELS)} product-listing pages")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Build and post-edit the 172 requested German product dossiers."""

from __future__ import annotations

import importlib
import sys
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build_spanish_product_pages as scope
import localize_new_pages as localizer
import polish_german_new_pages as german


CATEGORIES = {
    "food-ingredients": {
        "label": "Lebensmittelzutaten",
        "grade": "Lebensmittelqualität",
        "title": "{name} in Lebensmittelqualität | Lieferant | Bespring",
    },
    "animal-nutrition": {
        "label": "Tierernährung",
        "grade": "Futtermittelqualität",
        "title": "{name} in Futtermittelqualität | Lieferant | Bespring",
    },
    "home-care-industrial-cleaning": {
        "label": "Haushalts- und Industriereinigung",
        "grade": "technische Qualität",
        "title": "{name} für Industriereiniger | Lieferant | Bespring",
    },
    "water-treatment": {
        "label": "Wasseraufbereitung",
        "grade": "für die Wasseraufbereitung",
        "title": "{name} für Wasseraufbereitung | Lieferant | Bespring",
    },
    "agricultural-fertilizers": {
        "label": "Düngemittelrohstoffe",
        "grade": "Düngemittelqualität",
        "title": "{name} für Düngemittel | Lieferant | Bespring",
    },
    "mining": {
        "label": "Bergbauchemikalien",
        "grade": "technische Qualität für den Bergbau",
        "title": "{name} für den Bergbau | Lieferant | Bespring",
    },
}

SEO_NAMES = {
    "datem": "DATEM",
    "caustic-potash-potassium-hydroxide": "Kaliumhydroxid (KOH)",
    "labsa": "LABSA",
    "inorganic-organic-coagulant-blends": "Koagulanzienmischungen",
}

PRODUCT_NAMES = {
    "ferric-chloride": "Eisen(III)-chlorid",
    "ferrous-chloride": "Eisen(II)-chlorid",
    "ferric-sulfate": "Eisen(III)-sulfat",
    "ferrous-sulfate": "Eisen(II)-sulfat",
    "quick-lime-hydrated-lime": "Branntkalk / Kalkhydrat",
    "xanthates-pax-sipx-sibx": "Xanthate (PAX, SIPX, SIBX usw.)",
    "polyaluminum-chloride-pac": "Polyaluminiumchlorid (PAC)",
}

TERM_FIXES = [
    (
        "LABSA is an anionic surfactant acid intermediate neutralized to produce linear "
        "alkylbenzene sulfonates for detergents and cleaners; active matter, free acid and "
        "color are key variables. Suitability must be established in the complete formulation "
        "and intended use.",
        "LABSA ist ein anionisches Tensidsäure-Zwischenprodukt, das zur Herstellung linearer "
        "Alkylbenzolsulfonate für Wasch- und Reinigungsmittel neutralisiert wird. Aktivsubstanz, "
        "freie Säure und Farbe sind wichtige Prüfmerkmale; die Eignung ist in der vollständigen "
        "Formulierung und für den vorgesehenen Einsatz zu bestätigen.",
    ),
    ("Direkte Produktantwort", "Produkt kurz erklärt"),
    ("Direkte Antwort", "Produkt kurz erklärt"),
    ("Beschaffungsmomentaufnahme", "Beschaffungsübersicht"),
    ("Buyer-intent Guide", "Einkaufsleitfaden"),
    ("Käufer-Intent Guide", "Einkaufsleitfaden"),
    ("Leitfaden Käuferabsicht", "Einkaufsleitfaden"),
    ("Wie man ", "Wie Sie "),
    (" bezieht", " beziehen"),
    ("Apple Cider Essig", "Apfelessig"),
    ("in großen Mengen", "in Großmengen"),
    ("Massenangebot", "Angebot für eine Großmenge"),
    ("eine Hersteller", "einen Hersteller"),
    ("einen China-Lieferanten", "einen Lieferanten aus China"),
    ("einen chinesischen Lieferanten", "einen Lieferanten aus China"),
    ("Apfelessig Bulk Supplier", "Apfelessig-Großlieferant"),
    ("qualifizieren sollten", "prüfen sollten"),
    ("Trägerzutaten", "Trägerstoffe"),
    ("vom Verkauf geliefert", "vom Vertrieb bereitgestellt"),
    ("bestimmen die Bestellung", "sind für die Bestellung maßgeblich"),
    ("vollständigen Lebensmittelprozess", "vollständigen Herstellungsprozess"),
    ("Bestimmungen des Bestimmungsmarktes", "Vorschriften des Zielmarktes"),
    ("genaue Klasse", "genaue Qualität"),
    (", Ziel und", ", Bestimmungsland und"),
    ("Wie Quelle ", "Wie Sie "),
    ("Wie man Quelle ", "Wie Sie "),
    ("Wie Sie  kaufen", "Wie Sie kaufen"),
    ("Screening-Bereiche", "Prüfbereiche"),
    ("technische Screening", "technische Bewertung"),
    ("Long-Tail-Beschaffungsfragen", "spezifische Suchanfragen für den Einkauf"),
    ("Teilen Sie die genaue ", "Geben Sie die genaue "),
    ("Teilen Sie den genauen ", "Geben Sie den genauen "),
    ("Teilen Sie ", "Geben Sie "),
    ("Staat die genaue", "Geben Sie die genaue"),
    ("müssen qualifiziert werden", "müssen geprüft werden"),
    ("muss qualifiziert werden", "muss geprüft werden"),
    ("vorläufige Qualifikation", "vorläufige Bewertung"),
    ("Beschaffungsqualifikation", "Bewertung für den Einkauf"),
    ("Lieferantenqualifikation", "Lieferantenfreigabe"),
    ("Herstellerquelle", "Hersteller"),
    ("China Lieferant", "Lieferant aus China"),
    ("Verteilerangebot", "Angebot eines Händlers"),
    ("Massenzitat", "Angebot für eine Großlieferung"),
    ("Massenpreis", "Großhandelspreis"),
    ("Lebensmittelklasse", "Lebensmittelqualität"),
    ("Futterklasse", "Futtermittelqualität"),
    ("Futtermittelklasse", "Futtermittelqualität"),
    ("Feed Grade", "Futtermittelqualität"),
    ("Futtermittelqualität Futtermittelqualität", "Futtermittelqualität"),
    ("Mischeinheitlichkeit", "Mischhomogenität"),
    ("vollständigen Ernährung", "Gesamtration"),
    ("Lebenszyklus", "Lebensphase"),
    ("Massengutpreis", "Großhandelspreis"),
    ("Lieferfenster", "Lieferzeit"),
    ("Futterart", "Futtermittelart"),
    ("Verbindungsfutter", "Mischfutter"),
    ("Compound Feed", "Mischfutter"),
    ("Einschlussrate", "Einsatzmenge"),
    ("Mischgleichmäßigkeit", "Mischhomogenität"),
    ("Fütterungsregeln", "Futtermittelvorschriften"),
    ("vollständige Futterformulierung", "vollständige Futtermittelrezeptur"),
    ("Behandlungszug", "Aufbereitungsprozess"),
    ("Behandlungszüge", "Aufbereitungsprozesse"),
    ("Betriebshülle", "Betriebsbereich"),
    ("Betriebsrichtungen", "Betriebsanweisungen"),
    ("Wirksamkeitsansprüche", "Wirksamkeitsaussagen"),
    ("regieren den Auftrag", "sind für den Auftrag maßgeblich"),
    ("durch den Vertrieb geliefert", "vom Vertrieb bereitgestellt"),
    ("vollständiger Lebensmittelprozess", "vollständiger Herstellungsprozess"),
    ("Trägerinhaltsstoffe", "Trägerstoffe"),
    ("Fließhilfen", "Rieselhilfen"),
    ("repräsentative COA", "repräsentatives COA"),
    ("Batch COA", "Chargen-COA"),
    ("Apple Cider Vinegar", "Apfelessig"),
    ("Polyaluminum Chloride", "Polyaluminiumchlorid"),
    ("Chemische Wasserbehandlung", "Wasseraufbereitungschemikalie"),
    ("vorpolymerisierte Aluminiumkoagulanzfamilie", "Familie vorpolymerisierter Aluminiumkoagulanzien"),
    ("Zulaufchemie", "Rohwasserchemie"),
    ("Baumaterialien", "Werkstoffe"),
    ("Restmengen", "Reststoffgrenzwerten"),
    ("Gerichtsbarkeit", "Rechtsraum"),
    ("Wasseranwendung", "Anwendung in der Wasseraufbereitung"),
    ("Wasserausbringung", "Anwendung in der Wasseraufbereitung"),
    ("Masse Polyaluminiumchlorid", "Großhandelspreis für Polyaluminiumchlorid"),
    ("Soda Ash", "Natriumcarbonat"),
    ("Ätznatron", "Natriumhydroxid"),
    ("Caustic Potash", "Kaliumhydroxid"),
    ("Mono Propylene Glycol", "Monopropylenglykol"),
    ("Dithiophosphate", "Dithiophosphat"),
    ("Xanthates", "Xanthate"),
    ("xanthates", "Xanthate"),
    ("bulk ", "Großlieferung "),
    ("Vorlaufzeit", "Lieferzeit"),
    ("Bergbauchemie", "Bergbauchemikalie"),
    ("Sammler für Sulfidmineralefamilie", "Familie von Kollektoren für Sulfidminerale"),
    ("Sulfid-Mineral-Flotationssammlern", "Flotationskollektoren für Sulfidminerale"),
    ("jedes Mitglied", "jeder Produkttyp"),
    ("genauen kommerziellen Qualität", "genauen Handelsqualität"),
    ("Mineralogie, Freisetzung", "Mineralogie und Aufschlussgrad"),
    ("Zellstoff- und Recyclingwasserchemie", "Chemie der Pulpe und des Kreislaufwassers"),
    ("vor- und nachgelagerten Reagenzien", "Reagenzien in den vor- und nachgelagerten Prozessstufen"),
    ("eine Stichprobe", "ein Muster"),
    ("private Spezifikation", "aktuelle Spezifikation"),
    ("aktive oder Assay-Basis", "Wirkstoff- oder Analysenbasis"),
    ("Massen-Xanthate", "Xanthate in Großmengen"),
    ("Sulfid-Mineral-Sammler", "Sammler für Sulfidminerale"),
    ("Zellstoff- und Recycling-Wasserchemie", "Chemie der Pulpe und des Kreislaufwassers"),
    ("Beschaffungsscreening", "Bewertung für den Einkauf"),
    ("Test-Arbeitsbereiche", "Prüfbereiche"),
]


def parse(path: Path):
    return html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))


def direct_text(node) -> str:
    return " ".join(node.text_content().split())


def product_names() -> dict[tuple[str, str], str]:
    names = {}
    for category in CATEGORIES:
        doc = parse(ROOT / "de" / "products" / f"{category}.html")
        for node in doc.xpath("//li[@data-product]"):
            anchors = node.xpath("./a")
            if anchors:
                names[(category, Path(anchors[0].get("href")).stem)] = direct_text(node)
            key = (node.get("data-product") or "").rsplit(" | ", 1)[-1]
            names.setdefault((category, key), direct_text(node))
    return names


def listing_name(category: str, slug: str, names: dict[tuple[str, str], str]) -> str:
    if slug in PRODUCT_NAMES:
        return PRODUCT_NAMES[slug]
    if (category, slug) in names:
        return names[(category, slug)]
    source = parse(ROOT / "products" / f"{category}.html")
    for node in source.xpath("//li[@data-product]"):
        anchors = node.xpath("./a")
        if anchors and Path(anchors[0].get("href")).stem == slug:
            key = (node.get("data-product") or "").rsplit(" | ", 1)[-1]
            if (category, key) in names:
                return names[(category, key)]
    return slug.replace("-", " ")


def polish_text(value: str) -> str:
    value = german.polish(value)
    for source, target in TERM_FIXES:
        value = value.replace(source, target)
    return value


def polish_page(path: Path, rel: str, display_name: str, mapping: dict[str, str]) -> None:
    category = rel.split("/")[1]
    config = CATEGORIES[category]
    doc = parse(path)
    for node in doc.iter():
        if not isinstance(node.tag, str) or node.tag.lower() in {"script", "style", "code", "pre"}:
            continue
        if node.text:
            node.text = polish_text(node.text)
        if node.tail:
            node.tail = polish_text(node.tail)
        for attr in ("alt", "title", "aria-label", "placeholder"):
            if node.get(attr):
                node.set(attr, polish_text(node.get(attr)))
        if node.tag.lower() == "meta" and node.get("content"):
            node.set("content", polish_text(node.get("content")))

    h1 = doc.xpath("//h1")
    if h1:
        h1[0].text = display_name
    breadcrumb = doc.xpath("//main//nav//li[@aria-current='page']")
    if breadcrumb:
        breadcrumb[-1].text = display_name
    seo_name = SEO_NAMES.get(Path(rel).stem, display_name)
    title = config["title"].format(name=seo_name)
    description = localizer.shorten_at_word(
        f"Fordern Sie Spezifikation, COA, Dokumentation, Verpackungsangaben und ein Angebot für "
        f"{display_name} in {config['grade']} für B2B-Einkauf und internationale Lieferungen an.", 179
    )
    german.set_metadata(doc, title, description)
    overview = doc.xpath("//*[@id='overview']//h2")
    if overview:
        overview[0].text = f"Was ist {display_name} und wie wird es spezifiziert?"
    faq = doc.xpath("//*[@id='faq']//h2")
    if faq:
        faq[0].text = f"Häufige Fragen zu {display_name}"
    quote = doc.xpath("//*[@id='request-quote']//h2")
    if quote:
        quote[0].text = f"Spezifikation und Angebot für {display_name} anfordern"

    source_doc = parse(ROOT / rel)
    source_scripts = source_doc.xpath("//script[@type='application/ld+json']")
    for index, script in enumerate(doc.xpath("//script[@type='application/ld+json']")):
        if not script.text:
            continue
        data = localizer.json.loads(script.text)
        if index < len(source_scripts) and source_scripts[index].text:
            source_data = localizer.json.loads(source_scripts[index].text)
            data = german.translate_schema_from_source(source_data, data, mapping)

        def walk(value):
            if isinstance(value, dict):
                if value.get("@type") == "Product":
                    value["name"] = display_name
                    value["category"] = f"{config['label']} > {config['grade']}"
                if value.get("@type") == "WebPage":
                    value["name"] = display_name
                if value.get("@type") == "BreadcrumbList":
                    items = value.get("itemListElement") or []
                    if items:
                        items[-1]["name"] = display_name
                if "inLanguage" in value:
                    value["inLanguage"] = "de"
                for child in value.values():
                    walk(child)
            elif isinstance(value, list):
                for child in value:
                    walk(child)

        walk(data)
        script.text = localizer.json.dumps(
            german.polish_json(data), ensure_ascii=False, separators=(",", ":")
        )
    localizer.write_html(path, doc)


def sync_index(category: str) -> None:
    source = parse(ROOT / "products" / f"{category}.html")
    target_path = ROOT / "de" / "products" / f"{category}.html"
    target = parse(target_path)
    source_nodes = source.xpath("//li[@data-product]")
    target_nodes = target.xpath("//li[@data-product]")
    if len(source_nodes) == len(target_nodes):
        for source_node, target_node in zip(source_nodes, target_nodes):
            anchors = source_node.xpath("./a")
            if anchors:
                localizer.wrap_text_with_link(target_node, anchors[0].get("href"))
    else:
        hrefs = {}
        for node in source.xpath("//li[@data-product][a]"):
            key = (node.get("data-product") or "").rsplit(" | ", 1)[-1]
            hrefs[key] = node.xpath("./a")[0].get("href")
        for node in target_nodes:
            key = (node.get("data-product") or "").rsplit(" | ", 1)[-1]
            if key in hrefs:
                localizer.wrap_text_with_link(node, hrefs[key])
    localizer.write_html(target_path, target)


def main() -> None:
    localizer.ACTIVE_LANGS = ["es", "pt", "ru", "de"]
    rels = scope.english_sources()
    missing = [rel for rel in rels if not (ROOT / "de" / rel).exists()]
    print(f"English dossiers: {len(rels)}; existing German: {len(rels) - len(missing)}; to create: {len(missing)}")
    cache = localizer.load_cache()
    if missing:
        docs = [parse(ROOT / rel) for rel in missing]
        strings = set().union(*(localizer.collect_strings(doc) for doc in docs))
        strings.add("Language selection")
        localizer.seed_parallel_translation_memory(cache, ["de"])
        localizer.populate_translations(strings, cache, ["de"])
        localizer.save_cache(cache)

    names = product_names()
    for rel in missing:
        localizer.update_english_seo(rel)
        localizer.localize_page(rel, "de", cache["de"])
    for rel in rels:
        category, slug = rel.split("/")[1], Path(rel).stem
        polish_page(ROOT / "de" / rel, rel, listing_name(category, slug, names), cache["de"])
        for lang in ("es", "pt", "ru"):
            localizer.update_existing_locale_seo(rel, lang)

    for category in CATEGORIES:
        sync_index(category)
    builder = importlib.import_module("build_industry_application_pages")
    builder.rebuild_sitemap()
    print(
        f"Created {len(missing)} and post-edited {len(rels)} German product pages; "
        "synchronized six indexes, reciprocal hreflang and sitemap."
    )


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Post-edit the newly localized German product and solution pages."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import localize_new_pages as localizer


PRODUCTS = {
    "calcium-citrate": "Calciumcitrat",
    "carrageenan": "Carrageen",
    "dipotassium-phosphate-dkp": "Dikaliumphosphat (DKP)",
    "disodium-phosphate-dsp": "Dinatriumphosphat (DSP)",
    "guar-gum": "Guarkernmehl",
    "konjac-gum": "Konjakgummi",
    "magnesium-carbonate": "Magnesiumcarbonat",
    "magnesium-citrate": "Magnesiumcitrat",
    "monopotassium-phosphate-mkp": "Monokaliumphosphat (MKP)",
    "potassium-citrate": "Kaliumcitrat",
    "potassium-metaphosphate-kmp": "Kaliummetaphosphat (KMP)",
    "potassium-sorbate": "Kaliumsorbat",
    "potassium-tripolyphosphate-ktpp": "Kaliumtripolyphosphat (KTPP)",
    "sodium-acid-pyrophosphate-sapp": "Dinatriumdihydrogendiphosphat (SAPP)",
    "sodium-alginate": "Natriumalginat",
    "sodium-citrate": "Natriumcitrat",
    "sodium-dihydrogen-phosphate-msp": "Natriumdihydrogenphosphat (MSP)",
    "sodium-propionate": "Natriumpropionat",
    "sodium-trimetaphosphate-stmp": "Natriumtrimetaphosphat (STMP)",
    "tetrasodium-pyrophosphate-tspp": "Tetranatriumdiphosphat (TSPP)",
    "tricalcium-phosphate-tcp": "Tricalciumphosphat (TCP)",
    "tripotassium-phosphate-tkp": "Trikaliumphosphat (TKP)",
    "trisodium-phosphate-tsp": "Trinatriumphosphat (TSP)",
    "xanthan-gum": "Xanthan",
    "zinc-citrate": "Zinkcitrat",
}

SOLUTIONS = {
    "meat-poultry-phosphate-systems": "Phosphatsysteme für Fleisch- und Geflügelprodukte",
    "seafood-phosphate-selection": "Phosphatauswahl für Fisch und Meeresfrüchte",
    "bakery-leavening-phosphate-solutions": "Backtriebmittel und Phosphate für Backwaren",
    "dairy-cheese-ingredient-solutions": "Inhaltsstoffe für Molkereiprodukte und Käse",
    "beverage-formulation-ingredient-solutions": "Inhaltsstoffe für die Getränkeformulierung",
    "prepared-food-sauce-filling-solutions": "Inhaltsstoffe für Fertiggerichte, Saucen und Füllungen",
    "poultry-feed-phosphate-qualification": "Phosphatauswahl für Geflügelfutter",
    "swine-feed-phosphate-selection": "Phosphatauswahl für Schweinefutter",
    "ruminant-mineral-premix-phosphate-systems": "Phosphatsysteme für Mineralvormischungen für Wiederkäuer",
    "aquaculture-feed-ingredient-solutions": "Inhaltsstoffe für Aquakulturfutter",
    "feed-premix-flow-trace-mineral-compatibility": "Fließfähigkeit und Spurenelementverträglichkeit von Futtermittelvormischungen",
    "laundry-detergent-ingredient-solutions": "Inhaltsstoffe für Waschmittelformulierungen",
    "hard-surface-cleaner-ingredient-solutions": "Inhaltsstoffe für Hartflächenreiniger",
    "industrial-degreaser-formulation-ingredients": "Inhaltsstoffe für industrielle Entfetter",
    "acid-cleaner-descaler-ingredient-solutions": "Inhaltsstoffe für saure Reiniger und Entkalker",
    "institutional-cleaning-hygiene-ingredients": "Inhaltsstoffe für professionelle Reinigung und Hygiene",
    "industrial-plant-cleaning-chemical-systems": "Chemische Systeme für die industrielle Anlagenreinigung",
    "raw-water-clarification-coagulant-solutions": "Koagulanzien zur Rohwasserklärung",
    "industrial-wastewater-coagulant-selection": "Koagulanzien für industrielles Abwasser",
    "cooling-water-biofouling-control-chemicals": "Chemikalien zur Biofouling-Kontrolle im Kühlwasser",
    "industrial-water-intake-biofouling-control": "Biofouling-Kontrolle an industriellen Wasserentnahmen",
    "boiler-condensate-neutralizing-amine-solutions": "Neutralisierende Amine für Kessel- und Kondensatsysteme",
    "process-water-reuse-chemical-solutions": "Chemische Lösungen zur Wiederverwendung von Prozesswasser",
    "mine-water-treatment-chemical-solutions": "Chemikalien für die Grubenwasseraufbereitung",
    "mineral-leaching-chemical-solutions": "Chemikalien für die Laugung mineralischer Rohstoffe",
    "mineral-flotation-reagent-solutions": "Flotationsreagenzien für die Mineralaufbereitung",
    "smelting-electrowinning-chemical-inputs": "Chemikalien für Schmelzprozesse und Elektrogewinnung",
    "mineral-refining-processing-chemicals": "Chemikalien für Raffination und Mineralaufbereitung",
    "fertigation-phosphate-fertilizer-selection": "Phosphatdünger für die Fertigation",
    "foliar-phosphorus-potassium-solutions": "Phosphor- und Kaliumlösungen für die Blattdüngung",
    "water-soluble-fertilizer-raw-material-qualification": "Rohstoffe für wasserlösliche Düngemittel",
    "greenhouse-fertilizer-stock-tank-compatibility": "Kompatibilität von Düngemittel-Stammlösungen im Gewächshaus",
    "compound-fertilizer-phosphate-raw-materials": "Phosphatrohstoffe für Mehrnährstoffdünger",
    "specialty-crop-fertilizer-programs": "Düngeprogramme für Sonderkulturen",
}

SEO_SHORT = {
    "Fließfähigkeit und Spurenelementverträglichkeit von Futtermittelvormischungen": "Fließfähigkeit und Mineralstoffverträglichkeit von Vormischungen",
    "Kompatibilität von Düngemittel-Stammlösungen im Gewächshaus": "Kompatibilität von Düngemittel-Stammlösungen",
    "Biofouling-Kontrolle an industriellen Wasserentnahmen": "Biofouling-Kontrolle an Wasserentnahmen",
    "Chemische Lösungen zur Wiederverwendung von Prozesswasser": "Chemikalien zur Prozesswasser-Wiederverwendung",
    "Chemikalien für Schmelzprozesse und Elektrogewinnung": "Chemikalien für Schmelzen und Elektrogewinnung",
    "Inhaltsstoffe für Fertiggerichte, Saucen und Füllungen": "Inhaltsstoffe für Fertiggerichte und Saucen",
    "Phosphatsysteme für Mineralvormischungen für Wiederkäuer": "Phosphate für Wiederkäuer-Mineralvormischungen",
}


REPLACEMENTS = [
    ("Sprachenauswahl", "Sprachauswahl"),
    ("Language selection", "Sprachauswahl"),
    ("Fordern Sie ein Angebot an", "Angebot anfordern"),
    ("Angebot anfordern für", "Angebot anfordern: "),
    ("Lebensmittelqualität", "Lebensmittelqualität"),
    ("Nahrungsmittelqualität", "Lebensmittelqualität"),
    ("Food Grade", "Lebensmittelqualität"),
    ("Guar Gum", "Guarkernmehl"),
    ("Konjac Gum", "Konjakgummi"),
    ("Xanthan Gum", "Xanthan"),
    ("Kandidaten", "Optionen"),
    ("Kandidat", "Option"),
    ("Kandidatenliste", "Auswahlliste"),
    ("Shortlist", "Auswahlliste"),
    ("Beweisplan", "Prüfplan"),
    ("Validierungsplan", "Prüfplan"),
    ("Proof Plan", "Prüfplan"),
    ("Failure Mode", "Fehlerursache"),
    ("Fehlermodus", "Fehlerursache"),
    ("Scale-up", "Maßstabsübertragung"),
    ("Pickup", "Aufnahme"),
    ("Feed Mill", "Futtermittelwerk"),
    ("Futtermühle", "Futtermittelwerk"),
    ("Grade, COA, TDS, SDS und Logistik", "Qualität, COA, TDS, SDS und Logistik"),
    ("Güteklasse, COA, TDS, SDS und Logistik", "Qualität, COA, TDS, SDS und Logistik"),
    ("endgültige Formel", "fertige Rezeptur"),
    ("endgültige Formulierung", "fertige Rezeptur"),
    ("Suchfragen", "Häufige Fragen"),
    ("Suchantworten", "Häufige Fragen"),
    ("Anwendungsziel", "Ziel der Anwendung"),
    ("Lieferant Fragen", "Fragen an den Lieferanten"),
    ("technisch relevante Auswahlliste", "technisch begründete Auswahlliste"),
    ("professionelle institutionelle Reinigung", "professionelle Reinigung"),
    ("Bereiten Sie ein RFQ", "RFQ vorbereiten"),
    ("Bereiten Sie eine RFQ", "RFQ vorbereiten"),
    ("Antragsspezifische Genehmigung", "Anwendungsspezifische Freigabe"),
    ("Genehmigungsgrenze", "Freigabehinweis"),
    ("Funktionale Kandidatenliste", "Funktionale Auswahlliste"),
    (">Kandidat<", ">Option<"),
    ("Screening-Karte", "Orientierungshilfe"),
    ("nicht um eine Formel", "nicht um eine fertige Rezeptur"),
    ("Optionenrohstoff", "Rohstoffoption"),
    ("Assays", "Gehalte"),
    ("Studiennachweise", "Prüfnachweise"),
    ("Gestalten Sie den Vergleich", "Vergleich planen"),
    ("Fordern Sie das Ergebnis heraus", "Ergebnis unter realistischen Bedingungen prüfen"),
    ("Einfrieren der zugelassenen Klasse", "Freigegebene Qualität festschreiben"),
    ("Einfrieren der genehmigten Klasse", "Freigegebene Qualität festschreiben"),
    ("eine andere Klasse erfordert eine Überprüfung", "eine andere Qualität muss erneut geprüft werden"),
    ("in den Kauf", "in die Einkaufsspezifikation"),
    ("exakten Grad", "genaue Qualität"),
    ("genauen Grad", "genaue Qualität"),
    ("Nährstoff-, Puffer- oder Funktionsfuttermittel", "Nährstoffquelle, Puffer oder funktioneller Futtermittelzusatz"),
    ("Konservierungskandidat", "Konservierungsstoffoption"),
    ("technisch relevanten Kandidaten", "technisch geeigneten Optionen"),
    ("technisch relevante Kandidaten", "technisch geeignete Optionen"),
    ("letzte Überprüfung", "zuletzt geprüft"),
    ("Letzte Überprüfung", "Zuletzt geprüft"),
    ("Bereiten Sie Ihren RFQ vor", "RFQ vorbereiten"),
    ("Kontrollierte Beweise", "Kontrollierte Prüfungen"),
    ("Baseler-, Optionen- und Pilottests", "Referenz-, Vergleichs- und Pilotversuche"),
    ("Empfohlener Evidenzpfad", "Empfohlener Prüfplan"),
    ("beabsichtigten Beweise", "erforderlichen Nachweise"),
    ("Auswahlliste- und Evidenzplan", "Auswahl- und Prüfplan"),
    ("Auswahlliste und Evidenzplan", "Auswahl- und Prüfplan"),
    ("Endverwendungsgrad", "Qualität für die vorgesehene Anwendung"),
    ("den genaue Qualität", "die genaue Qualität"),
    ("den Leader", "die beste Option"),
    ("den Führer", "die beste Option"),
    ("Der Leader", "Die beste Option"),
    ("Der Führer", "Die beste Option"),
    ("Unterlagen und Beweismittel", "Unterlagen und Nachweise"),
    ("Zu beantragende Unterlagen", "Anzufordernde Unterlagen"),
    ("fit-for-purpose Wasserwiederverwendung", "zweckgerechte Wasserwiederverwendung"),
    ("Fit-for-Purpose Wasserqualitätsziel", "Zweckgerechtes Wasserqualitätsziel"),
    ("Bäckerei Zutaten & Formulierung Lösungen", "Backzutaten und Formulierungslösungen"),
    ("Teig oder Teig", "Teig oder Masse"),
    ("Schimmelpilze in Echtzeit", "Schimmelentwicklung bei Echtzeitlagerung"),
]


def polish(value: str) -> str:
    for old, new in REPLACEMENTS:
        value = value.replace(old, new)
    value = re.sub(r"\s+([,.;:!?])", r"\1", value)
    value = re.sub(r" {2,}", " ", value)
    return value


def shorten_at_word(value: str, limit: int) -> str:
    """Shorten cleanly without leaving a dangling preposition or punctuation."""
    if len(value) <= limit:
        return value
    shortened = value[:limit + 1].rsplit(" ", 1)[0].rstrip(" ,;:-–")
    return shortened.rstrip(".") + "."


def polish_json(value):
    if isinstance(value, dict):
        return {key: polish_json(item) for key, item in value.items()}
    if isinstance(value, list):
        return [polish_json(item) for item in value]
    if isinstance(value, str) and not value.startswith(("http://", "https://")):
        return polish(value)
    return value


def translate_schema_from_source(source, current, mapping, parent_key=None):
    if isinstance(source, dict) and isinstance(current, dict):
        return {key: translate_schema_from_source(source.get(key), value, mapping, key) for key, value in current.items()}
    if isinstance(source, list) and isinstance(current, list):
        return [translate_schema_from_source(source[i] if i < len(source) else None, value, mapping, parent_key) for i, value in enumerate(current)]
    if isinstance(source, str) and isinstance(current, str):
        if source.startswith(("http://", "https://")) or parent_key == "inLanguage":
            return current
        if parent_key in localizer.JSON_TEXT_KEYS | {"text"}:
            return mapping.get(localizer.clean_source(source), current)
        return source
    return current


def set_schema(data, display_name: str, kind: str, description: str):
    graph = data.get("@graph", []) if isinstance(data, dict) else []
    for item in graph:
        item_type = item.get("@type") if isinstance(item, dict) else None
        if item_type in ({"WebPage", "Service"} if kind == "solution" else {"WebPage", "Product"}):
            item["description"] = description
        if item_type in ({"WebPage", "Service"} if kind == "solution" else {"Product"}):
            item["name"] = display_name
        if item_type == "BreadcrumbList" and item.get("itemListElement"):
            item["itemListElement"][-1]["name"] = display_name


def set_metadata(doc, title: str, description: str):
    title_node = doc.xpath("//title")
    if title_node:
        title_node[0].text = title
    for node in doc.xpath("//meta[@name='description' or @property='og:description' or @name='twitter:description']"):
        node.set("content", description)
    for node in doc.xpath("//meta[@property='og:title' or @name='twitter:title']"):
        node.set("content", title.split(" | ", 1)[0])


def process(path: Path, display_name: str, kind: str, mapping):
    doc = html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))
    source_doc = html.parse(str(ROOT / path.relative_to(ROOT / "de")), parser=html.HTMLParser(encoding="utf-8"))
    for source_node, current_node in zip(source_doc.xpath("//script[@type='application/ld+json']"), doc.xpath("//script[@type='application/ld+json']")):
        if source_node.text and current_node.text:
            data = translate_schema_from_source(json.loads(source_node.text), json.loads(current_node.text), mapping)
            current_node.text = json.dumps(polish_json(data), ensure_ascii=False, separators=(",", ":"))

    for node in doc.iter():
        if not isinstance(node.tag, str) or node.tag.lower() in {"style", "code", "pre", "script"}:
            continue
        if node.text:
            node.text = polish(node.text)
        if node.tail:
            node.tail = polish(node.tail)
        for attr in ("alt", "title", "aria-label", "placeholder"):
            if node.get(attr):
                node.set(attr, polish(node.get(attr)))
        if node.tag.lower() == "meta" and node.get("content"):
            node.set("content", polish(node.get("content")))

    h1 = doc.xpath("//h1")
    if h1:
        h1[0].text = display_name

    if kind == "product":
        title = f"{display_name} in Lebensmittelqualität | Lieferant | Bespring"
        description = f"{display_name} in Lebensmittelqualität von Bespring Chemical: Spezifikation, Anwendungen, Verpackung sowie COA-, TDS- und SDS-Unterlagen für Einkauf und Anfrage."
        fixed_headings = {
            "overview": f"{display_name}: Spezifikation und Eigenschaften",
            "applications": f"Anwendungen von {display_name}",
            "faq": f"Häufige Fragen zu {display_name}",
            "request-quote": f"Angebot für {display_name} anfordern",
        }
        for section_id, heading in fixed_headings.items():
            nodes = doc.xpath(f"//*[@id='{section_id}']//h2")
            if nodes:
                nodes[0].text = heading
        kickers = {
            "overview": "Produktprofil",
            "applications": "Anwendungsbereiche",
            "request-quote": "Lieferung nach vereinbarter Spezifikation",
        }
        for section_id, text_value in kickers.items():
            nodes = doc.xpath(f"//*[@id='{section_id}']//p[contains(@class,'kicker')]")
            if nodes:
                nodes[0].text = text_value
        callout = doc.xpath("//*[@id='overview']//*[contains(@class,'callout')]//h3")
        if callout:
            callout[0].text = "Hinweise für den Einkauf"
        for field in doc.xpath("//form//*[@name='product']"):
            field.set("value", display_name)
    else:
        seo_name = SEO_SHORT.get(display_name, display_name)
        title = f"{seo_name} | Bespring"
        description = f"Leitfaden für {seo_name}: Auswahl, Funktionen, Risiken, Prüfmethoden und Angaben für eine belastbare Lieferantenanfrage."
        fixed_headings = {
            "selection": "Was die einzelnen Optionen leisten – und was zu prüfen ist",
            "validation": "Technische Annahmen mit reproduzierbaren Versuchen prüfen",
            "metrics": "Messgrößen für die Freigabe",
            "rfq": "Welche Angaben Lieferanten für ein belastbares Angebot benötigen",
            "faq": f"Häufige Fragen: {display_name}",
        }
        for section_id, heading in fixed_headings.items():
            nodes = doc.xpath(f"//*[@id='{section_id}']//h2")
            if nodes:
                nodes[0].text = heading
        variable_intro = doc.xpath("//*[@id='variables']//header/p")
        if variable_intro:
            variable_intro[0].text = "Diese Daten sollten vor dem Vergleich der Optionen festgehalten oder gemessen werden."

    set_metadata(doc, title, description)
    breadcrumbs = doc.xpath("//nav[contains(@class,'breadcrumb')]//li[last()]")
    for breadcrumb in breadcrumbs:
        breadcrumb.text = display_name
    for node in doc.xpath("//script[@type='application/ld+json']"):
        if node.text:
            data = json.loads(node.text)
            set_schema(data, display_name, kind, description)
            node.text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    path.write_text(html.tostring(doc.getroot(), encoding="unicode", method="html", doctype="<!DOCTYPE html>"), encoding="utf-8", newline="\n")


def polish_hub(path: Path):
    doc = html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))
    for node in doc.iter():
        if not isinstance(node.tag, str) or node.tag.lower() in {"style", "code", "pre", "script"}:
            continue
        if node.text:
            node.text = polish(node.text)
        if node.tail:
            node.tail = polish(node.tail)
        for attr in ("alt", "title", "aria-label", "placeholder"):
            if node.get(attr):
                node.set(attr, polish(node.get(attr)))
    for slug, title in SOLUTIONS.items():
        for anchor in doc.xpath(f"//a[@href='{slug}.html']"):
            anchor.set("aria-label", f"Leitfaden lesen: {title}")
            headings = anchor.xpath(".//h3 | .//strong")
            if headings:
                headings[0].text = title
    path.write_text(html.tostring(doc.getroot(), encoding="unicode", method="html", doctype="<!DOCTYPE html>"), encoding="utf-8", newline="\n")


def main():
    mapping = localizer.load_cache()["de"]
    for slug, name in PRODUCTS.items():
        process(ROOT / "de/products/food-ingredients" / f"{slug}.html", name, "product", mapping)
    for slug, name in SOLUTIONS.items():
        process(ROOT / "de/solutions" / f"{slug}.html", name, "solution", mapping)
    for filename in (
        "agriculture-solutions.html", "animal-nutrition-solutions.html", "food-industry-solutions.html",
        "industrial-cleaning-solutions.html", "mining-solutions.html", "water-treatment-solutions.html",
    ):
        polish_hub(ROOT / "de/solutions" / filename)
    print(f"Polished {len(PRODUCTS)} product pages and {len(SOLUTIONS)} solution pages in German.")


if __name__ == "__main__":
    main()

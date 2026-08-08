#!/usr/bin/env python3
"""Build the three final requested German food-ingredient pages."""

from __future__ import annotations

import importlib
from pathlib import Path

from build_final_spanish_food_pages import PRODUCTS as SOURCE
from build_requested_german_food_pages import BASE, page

ROOT = Path(__file__).resolve().parents[1]

DE = {
    "encapsulated-sorbic-acid": {
        "name": "Verkapselte Sorbinsäure",
        "title": "Verkapselte Sorbinsäure in Lebensmittelqualität | Lieferant",
        "description": "Verkapselte Sorbinsäure in Lebensmittelqualität mit 83–87 % Wirkstoff. Hülle, Freisetzung, Korngröße, COA und B2B-Angebot prüfen.",
        "summary": "Verkapselte Sorbinsäure ist eine Konservierungsmittel-Formulierung, bei der Sorbinsäure mit einem lebensmitteltauglichen Fettträger umhüllt wird. Die Hülle kann den Kontakt mit dem Teig verzögern und vorzeitige Wechselwirkungen mindern; das tatsächliche Freisetzungsprofil ist im Prozess des Käufers zu validieren.",
        "functions": ["Kontrollierte Bereitstellung von Sorbinsäure als Wirkstoff gegen Schimmel", "Zeitliche Steuerung der Freisetzung durch eine Lipidhülle", "Verringerung vorzeitiger Wechselwirkungen mit Hefe oder empfindlichen Zutaten nach anwendungsspezifischem Nachweis", "Unterstützung eines validierten Haltbarkeitskonzepts"],
        "applications": ["Backwaren und fermentierte Teige", "Trockene Backvormischungen", "Füllungen und Lebensmittel mit mittlerer Feuchte", "Weitere zugelassene Lebensmittel nach Prüfung der Wirkstofffreisetzung"],
        "criteria": ["Gehalt an aktiver Sorbinsäure und Bezugsbasis der Analyse", "Art und Deklaration der Umhüllung einschließlich Lebensmitteleignung", "Freisetzungsmethode oder -kurve unter realen Misch- und Backbedingungen", "Partikelgrößenverteilung, Homogenität, Mikrobiologie und Stabilität"],
        "note": "Das Handelsprodukt ist eine formulierte Mischung: E200/INS 200 und CAS 110-44-1 bezeichnen den Sorbinsäure-Wirkstoff, nicht eine universelle Identität des gesamten verkapselten Partikels. Zusammensetzung, Kennzeichnung und Zulässigkeit sind für den Zielmarkt zu prüfen.",
    },
    "monosodium-glutamate-msg": {
        "name": "Mononatriumglutamat (MSG)",
        "title": "Mononatriumglutamat E621 in Lebensmittelqualität | Lieferant",
        "description": "Mononatriumglutamat MSG E621 in Lebensmittelqualität mit ≥99 % Gehalt. Korngröße, Reinheit, COA, Verpackung und B2B-Angebot prüfen.",
        "summary": "L-Mononatriumglutamat, kurz Mononatriumglutamat oder MSG, ist das Natriumsalz der L-Glutaminsäure. Es wird als Geschmacksverstärker für den Umami-Eindruck in geeigneten herzhaften Rezepturen eingesetzt, sofern die Vorgaben des Zielmarktes eingehalten werden.",
        "functions": ["Verstärkung des Umami-Geschmacks", "Abrundung herzhafter und fleischähnlicher Geschmacksprofile", "Sensorische Unterstützung in Gewürz- und Würzmischungen", "Intensivierung des Geschmackseindrucks ohne Ersatz einer ausgewogenen Rezeptur"],
        "applications": ["Gewürze und trockene Würzmischungen", "Suppen, Brühen und Saucen", "Instantnudeln und Snacks", "Verarbeitete Fleisch-, Fisch- oder Gemüseprodukte"],
        "criteria": ["Natriumglutamat-Gehalt, spezifische Drehung und Transmission", "Vereinbarte Korngröße für Dosierung, Mischung und Auflösung", "Trocknungsverlust, pH-Wert sowie Metall- und Fremdstoffgrenzen", "Sensorische Prüfung im Endprodukt und Berücksichtigung des Natriumbeitrags"],
        "note": "Im Einkauf werden MSG, Mononatriumglutamat, Natriumglutamat und E621 verwendet. Für die Freigabe ist zu bestätigen, dass die Spezifikation L-Mononatriumglutamat-Monohydrat betrifft; die Korngröße sollte vertraglich festgelegt werden.",
    },
    "sodium-metabisulfite": {
        "name": "Natriummetabisulfit",
        "title": "Natriummetabisulfit E223 in Lebensmittelqualität | Lieferant",
        "description": "Natriummetabisulfit E223 in Lebensmittelqualität für B2B. Na₂S₂O₅, SO₂, pH, Sulfite, Chargen-COA, 25-kg-Säcke und Angebot prüfen.",
        "summary": "Natriummetabisulfit, auch Natriumdisulfit oder Natriumpyrosulfit genannt, ist ein Sulfit, das in zugelassenen Lebensmittelkategorien als Antioxidationsmittel, Mittel gegen enzymatische Bräunung, Konservierungsstoff oder Mehlbehandlungsmittel dienen kann.",
        "functions": ["Antioxidative Wirkung in geeigneten Prozessen", "Kontrolle der Bräunung in zugelassenen Anwendungen", "Freisetzung von Schwefeldioxid unter Einsatzbedingungen", "Konservierende Unterstützung nach technologischer und rechtlicher Prüfung"],
        "applications": ["Verarbeitetes Obst und Gemüse in zugelassenen Kategorien", "Kartoffelerzeugnisse und andere bräunungsanfällige Matrizes", "Bestimmte Weinbereitungs- und Getränkeprozesse", "Zugelassene Anwendungen in Backwaren oder bei der Lebensmittelbehandlung"],
        "criteria": ["Gehalt als Na₂S₂O₅, SO₂-Anteil, pH-Wert und wasserunlösliche Bestandteile", "Eisen, Arsen, Blei und weitere Grenzwerte mit eindeutigen Einheiten und Vergleichszeichen", "Feuchte, Stabilität und Barriereverpackung gegen Luft und Wasser", "Höchstmenge, SO₂-Rückstand und erforderliche Sulfitkennzeichnung im Endprodukt"],
        "note": "Schwefeldioxid und Sulfite sind kennzeichnungsrelevant. In der EU gilt nach Verordnung (EU) Nr. 1169/2011 ein Schwellenwert von mehr als 10 mg/kg beziehungsweise 10 mg/l, berechnet als insgesamt vorhandenes SO₂; Kategorie, Verwendung und aktuelle Rechtslage sind stets am Endprodukt zu prüfen.",
    },
}


def add_de_hreflang(slug: str) -> None:
    path = ROOT / "products" / "food-ingredients" / f"{slug}.html"
    text = path.read_text(encoding="utf-8")
    if 'hreflang="de"' not in text:
        link = f'<link rel="alternate" hreflang="de" href="{BASE}/de/products/food-ingredients/{slug}.html">'
        text = text.replace('<link rel="alternate" hreflang="x-default"', link + '<link rel="alternate" hreflang="x-default"', 1)
        path.write_text(text, encoding="utf-8")


def update_listing() -> None:
    path = ROOT / "de" / "products" / "food-ingredients.html"
    text = path.read_text(encoding="utf-8")
    additions = {
        '<li data-product="kalziumsorbat | calcium sorbate"><a href="food-ingredients/calcium-sorbate.html">Kalziumsorbat</a></li>':
            '<li data-product="kalziumsorbat | calcium sorbate"><a href="food-ingredients/calcium-sorbate.html">Kalziumsorbat</a></li><li data-product="verkapselte sorbinsäure | mikroverkapselte sorbinsäure | encapsulated sorbic acid | e200"><a href="food-ingredients/encapsulated-sorbic-acid.html">Verkapselte Sorbinsäure</a></li><li data-product="natriummetabisulfit | natriumdisulfit | natriumpyrosulfit | sodium metabisulfite | smbs | e223"><a href="food-ingredients/sodium-metabisulfite.html">Natriummetabisulfit</a></li>',
        '<li data-product="vanillin | vanillin"><a href="food-ingredients/vanillin.html">Vanillin</a></li>':
            '<li data-product="vanillin | vanillin"><a href="food-ingredients/vanillin.html">Vanillin</a></li><li data-product="mononatriumglutamat | natriumglutamat | monosodium glutamate | msg | e621"><a href="food-ingredients/monosodium-glutamate-msg.html">Mononatriumglutamat (MSG)</a></li>',
    }
    for anchor, replacement in additions.items():
        if replacement not in text:
            if anchor not in text:
                raise RuntimeError(f"Listing anchor not found: {anchor}")
            text = text.replace(anchor, replacement, 1)
    text = text.replace('<span>9 Materialien</span>', '<span>11 Materialien</span>', 1)
    marker = '<article class="pc-family" id="flavors-dairy-powders"'
    before, after = text.split(marker, 1)
    after = after.replace('<span>3 Materialien</span>', '<span>4 Materialien</span>', 1)
    path.write_text(before + marker + after, encoding="utf-8")


def main() -> None:
    out = ROOT / "de" / "products" / "food-ingredients"
    for slug, product in DE.items():
        (out / f"{slug}.html").write_text(page(slug, product, SOURCE[slug]), encoding="utf-8")
        add_de_hreflang(slug)
    update_listing()
    importlib.import_module("build_industry_application_pages").rebuild_sitemap()
    print(f"Built {len(DE)} German pages, updated listing and sitemap")


if __name__ == "__main__":
    main()

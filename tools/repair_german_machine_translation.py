#!/usr/bin/env python3
"""Repair confirmed German localization defects without changing URLs or markup."""

from pathlib import Path
import re
import html as html_std

ROOT = Path(__file__).resolve().parents[1]

GLOBAL = {
    "in technische Qualität": "in technischer Qualität",
    "für B2B-Einkauf und internationale.": "für den B2B-Einkauf und die internationale Beschaffung an.",
    "für B2B-Einkauf und internationale Lieferungen": "für den B2B-Einkauf und die internationale Beschaffung",
    "quellenspezifische": "lieferantenspezifische",
    "quellenspezifischen": "lieferantenspezifischen",
    "quellenspezifisches": "lieferantenspezifisches",
    "quellenspezifischer": "lieferantenspezifischer",
    "kontaktiert den Vertrieb für": "fordert beim Vertrieb",
    "kontaktiert den Vertrieb": "bittet den Vertrieb",
    ", sondern fordert beim Vertrieb": ". Fordern Sie beim Vertrieb",
    ", sondern bittet den Vertrieb": ". Fordern Sie beim Vertrieb",
    "Vertrieb kontaktieren für": "Fordern Sie beim Vertrieb",
    "kontaktieren Sie den Verkauf": "wenden Sie sich an den Vertrieb",
    "Kontaktieren Sie den Verkauf": "Wenden Sie sich an den Vertrieb",
    "Anfordern Sie": "Fordern Sie",
    "Private technische Dokumentation": "Technische Dokumentation",
    "Feed-Käufer": "Einkäufer von Futtermittelzusatzstoffen",
    "Feed-Additive-Hersteller": "Hersteller von Futtermittelzusatzstoffen",
    "Feed Spezifikation": "Futtermittelspezifikation",
    "Feed-Spezifikation": "Futtermittelspezifikation",
    "in Großmengen beziehen": "für den gewerblichen Bedarf beschaffen",
    "Verwenden Sie diese spezifische Suchanfragen für den Einkauf": "Nutzen Sie diese Angaben für eine präzise Lieferantenanfrage",
    "ein Muster- oder Angebot für eine Großmenge": "ein Muster oder ein Angebot für eine Handelsmenge",
    "ein Händlerangebot oder ein Angebot für eine Großmenge": "ein Händlerangebot oder ein Angebot für eine Handelsmenge",
    "Mass Dap Dünger Preis": "DAP-Dünger: Preis für Handelsmengen",
    "Dap Dünger": "DAP-Dünger",
    "l Valin": "L-Valin",
    "L-Valine": "L-Valin",
    "I-Valin": "L-Valin",
    "Futtermittel-I-Valin": "Futtermittel-L-Valin",
    "COA-, Batch-COA-": "COA und chargenbezogenes COA sowie",
    "repräsentative und Chargen-COA": "ein repräsentatives COA und das chargenbezogene COA",
    "repräsentatives COA und Chargen-COA": "ein repräsentatives COA und ein chargenbezogenes COA",
    "TDS-, SDS-": "TDS, SDS",
    "Überprüfung <a": "Prüfen Sie <a",
    "</a>Überprüfen Sie": "</a>. Prüfen Sie",
    "Zuletzt überprüft 2026-07-26 von Bespring Chemical technischen und Export-Team.": "Zuletzt geprüft am 26. Juli 2026 durch das Technik- und Exportteam von Bespring Chemical.",
    "China-basierter Anbieter": "In China ansässiger Anbieter",
    "aktuellen privaten Spezifikation": "aktuell vereinbarten Spezifikation",
    "aktuellen privaten Spezifikationen": "aktuell vereinbarten Spezifikationen",
    "aktuelle private Spezifikation": "aktuell vereinbarte Spezifikation",
    "Formblatt": "Handelsform",
    "Formel und Zuständigkeit spezifisch": "abhängig von Rezeptur und Rechtsraum",
    "Bodenentfernung": "Schmutzentfernung",
    "Arbeiterkontrollen": "Arbeitsschutzmaßnahmen",
    "aktuelle aktuelle": "aktuelle",
    "Verkaufsteam": "Vertriebsteam",
    "Versorgungsdienste": "Beschaffungsservice",
    "Quellen-Wasser-Daten": "Rohwasserdaten",
    "Quellwasserdaten": "Rohwasserdaten",
    "Behandlungsstraßen": "Aufbereitungsprozesse",
    "Behandlungsstrecken": "Aufbereitungsprozesse",
    "Behandlungstrakt": "Aufbereitungsprozess",
    "Bestimmungsmarktanforderungen": "Anforderungen des Zielmarktes",
    "Genehmigungsprozess": "Freigabeprozess",
    "Herkunfts-, Rückverfolgbarkeits-, Futtermittelsicherheits-, Qualitäts-, Herkunfts- und Standortdokumente": "Dokumente zu Herkunft, Rückverfolgbarkeit, Futtermittelsicherheit, Qualität und Produktionsstandort",
    "Zulieferbetriebene Magnesiumlieferanten": "Lieferant für Magnesiumquellen in Futtermittelqualität",
    "Zulieferbetriebene Manganlieferanten": "Lieferant für Manganquellen in Futtermittelqualität",
    "Futtermittel der Kategorie 1 Valin": "L-Valin in Futtermittelqualität",
    ">Führer<": ">Leitfaden<",
    "Home Pflege & Industrielle Reinigung": "Haushalts- und Industriereinigung",
    "Quellbeutel für die häusliche Pflege und die industrielle Reinigung": "Bezugsquelle für SLES zur Haushalts- und Industriereinigung",
    "für die aktuelle Spezifikation": "nach der aktuellen Spezifikation",
    "Warum gibt es keine öffentliche Spezifikation?": "Warum ist keine allgemeine Spezifikation angegeben?",
    "Bespring Chemical veröffentlicht keine Spezifikationen für diese industrielle Reinigungszutat online, sondern bittet den Vertrieb": "Bespring Chemical veröffentlicht für diesen Rohstoff keine pauschale Spezifikation. Fordern Sie beim Vertrieb",
    "Bespring Chemical veröffentlicht keine Spezifikationen für diesen Futtermittelbestandteil online, sondern bittet den Vertrieb": "Bespring Chemical veröffentlicht für diesen Futtermittelzusatzstoff keine pauschale Spezifikation. Fordern Sie beim Vertrieb",
}

SLES = {
    "Tensid und antimikrobieller Rohstoff": "anionischer Tensid-Rohstoff",
    "zum Schäumen, Benetzen und Waschen": "für Schaumbildung, Benetzung und Reinigungsleistung",
    "Formblatt": "Handelsform",
    "Ethoxylierung und aktive Konzentration - bestätigen": "Ethoxylierungsgrad und Aktivstoffgehalt bestätigen",
    "Formulierung und marktspezifisch": "abhängig von Rezeptur und Zielmarkt",
    "Anforderungsspezifikation und Angebot": "Spezifikation und Angebot anfordern",
    "Geben Sie die genaue Form, Konzentration, Formulierung, Menge, Bestimmungsort und Dokumente.": "Nennen Sie Handelsform, Aktivstoffgehalt, Anwendung, Menge, Bestimmungsort und benötigte Unterlagen.",
    "Sodium Lauryl Ether Sulfate (SLES) Rohstoffe für die häusliche Pflege und industrielle Reinigung": "Natriumlaurylethersulfat (SLES) für Haushalts- und Industriereiniger",
    "Aktuelles Dokument verfügbar vom Verkauf": "Aktuelle Unterlagen beim Vertrieb erhältlich",
    "Verwenden Sie aktuelle SDS und Arbeitsplatzkontrollen": "Aktuelles SDS und betriebliche Schutzmaßnahmen beachten",
    "Aktueller COA für gelieferte Lose verfügbar": "Chargenbezogenes COA für gelieferte Partien erhältlich",
    "Arbeiterkontrollen": "Arbeitsschutzmaßnahmen",
    "Tensid und antimikrobielle Rohstoffe": "anionische Tenside",
    "Formel und Zuständigkeit spezifisch": "abhängig von Rezeptur und Rechtsraum",
    "Öffentliche Spezifikation": "Spezifikationsgrundlage",
    "Nicht veröffentlicht – Vertrieb kontaktieren": "Aktuelle Spezifikation beim Vertrieb anfordern",
    "ein Muster oder ein Angebot für eine Großmenge": "ein Muster oder ein Angebot für eine Handelsmenge",
    "Lieferanten für Reinigungsmittel": "SLES-Lieferant für Reinigungsmittel",
    "Großhandelspreis": "SLES-Preis für Handelsmengen",
    "Sles für Waschmittelformulierungen": "SLES für Waschmittelformulierungen",
    "Sles Hersteller SDS und COA": "SLES-Hersteller: SDS und COA",
    "Geben Sie die vollständige Formel, den Prozess, die Zielfunktion, das Substrat, die Kompatibilitätsanforderungen und die Fertigprodukttests.": "Nennen Sie die vollständige Rezeptur, den Prozess, die gewünschte Funktion, das Substrat, die Kompatibilitätsanforderungen und die Prüfungen am Endprodukt.",
    "Formulierung-Prüfbereiche": "Prüfbereiche für Rezepturen",
    "Reiniger mit harten Oberflächen": "Hartflächenreiniger",
    "Bodenentfernungssysteme": "Schmutzentfernungssysteme",
    "Bestimmungsmarktes": "Zielmarktes",
    "Fragen, die vor der Genehmigung von SLES zu lösen sind": "Fragen, die vor der Freigabe von SLES zu klären sind",
    "Genauer Homolog, Ethoxylierung oder aktive Konzentration": "Homologenprofil, Ethoxylierungsgrad und Aktivstoffgehalt",
    "Die genaue Homologisierung, Ethoxylierung oder aktive Konzentration wird": "Homologenprofil, Ethoxylierungsgrad und Aktivstoffgehalt werden",
    "Biozid-Zulassung und Fertigprodukt-Ansprüche": "Regulatorische Aussagen zum Endprodukt",
    "Bewerten Sie die Zulassung von Bioziden und die Angaben zum Fertigprodukt": "Prüfen Sie zulässige Aussagen und erforderliche Nachweise für das Endprodukt",
    "Anfordern der aktuellen SLES Produktspezifikation": "Aktuelle SLES-Produktspezifikation anfordern",
    "online. kontaktieren Sie den Vertrieb": "online. Wenden Sie sich an den Vertrieb",
    "dass ihre Überarbeitung, Methoden und Kriterien": "ob Revisionsstand, Prüfmethoden und Annahmekriterien",
    "</a>Bei Angaben": "</a>. Bei Angaben",
    "ist das genaue registrierte Etikett des Fertigerzeugnisses durch": "sind die genehmigte Kennzeichnung und Registrierung des Endprodukts anhand der Vorgaben der",
    "Angaben:</strong> Eine Rohstoffidentität begründet keine Desinfektionsmittel-, Desinfektionsmittel- oder Pathogenangaben": "Hinweis zu Wirksamkeitsaussagen:</strong> Aus der Identität des Rohstoffs lassen sich keine Aussagen zur Desinfektion oder zu Krankheitserregern",
    "Handle SLES unter dem aktuellen SDS": "Handhabung gemäß aktuellem Sicherheitsdatenblatt (SDS)",
    "<strong>Quelle:</strong>": "<strong>Herstellerhinweise</strong>",
    "Aktuelle aktuelle Spezifikation": "Aktuelle Spezifikation",
    "Repräsentativer COA und Chargen-COA": "Repräsentatives und chargenbezogenes COA",
    "Quellenspezifische Dokumente": "Lieferantenspezifische Dokumente",
    "Kontaktieren Sie das Verkaufsteam": "Vertrieb kontaktieren",
    "Versorgungsdienste": "Beschaffungsservice",
    "Überprüfung der Beschaffung und Exportunterstützung": "Informationen zu Beschaffung und Exportunterstützung",
}

NEWS = {
    "Ausstellungsarchiv": "Messearchiv",
    "an dieser internationalen Ausstellung": "an dieser internationalen Fachmesse",
    "Die Ausstellung bot die Gelegenheit": "Die Fachmesse bot Gelegenheit",
    "<span>Kabine ": "<span>Stand ",
    "Zutatenhändler": "Händler für Inhaltsstoffe",
    "Zielvorgaben": "Zielspezifikationen",
    "Ziel-Markt-Dokumentation": "Dokumentation für den Zielmarkt",
    "Die Diskussion wird fortgesetzt": "Weitere Abstimmung",
    "im Vergleich zum aktuellen Lieferumfang prüfen": "anhand unseres aktuellen Lieferprogramms prüfen",
    "Durchstöbern Sie Produktportfolios": "Produktportfolio ansehen",
    "als faktische Aufzeichnung der Ausstellungsteilnahmen": "als dokumentierter Nachweis der Messeteilnahmen",
    "Portfolio-Fokus": "Gezeigte Produktbereiche",
}


def apply(path: Path, mapping: dict[str, str]) -> bool:
    raw = path.read_text(encoding="utf-8")
    out = raw
    for old, new in mapping.items():
        out = out.replace(old, new)
    # Common machine-generated handling headings retain the product name in English.
    out = re.sub(
        r">(?:Handle\s+[^<]+?|[^<]+?\s+Handle)\s+under the current SDS<",
        ">Handhabung gemäß aktuellem Sicherheitsdatenblatt (SDS)<",
        out,
        flags=re.IGNORECASE,
    )
    out = re.sub(
        r"Bespring Chemical veröffentlicht keine Produktspezifikationen für ([^<.]+) online, fordert beim Vertrieb die ([^<]+?) und bestätigt deren Überarbeitung, Methoden und Akzeptanzkriterien\.",
        r"Bespring Chemical veröffentlicht keine Produktspezifikationen für \1 online. Fordern Sie beim Vertrieb die \2 an und prüfen Sie Revisionsstand, Prüfmethoden und Annahmekriterien.",
        out,
    )
    out = re.sub(
        r">Anfordern der aktuellen ([^<]+?) Produktspezifikation<",
        r">Aktuelle Produktspezifikation für \1 anfordern<",
        out,
    )
    if out != raw:
        path.write_text(out, encoding="utf-8")
        return True
    return False


def optimize_product_meta(path: Path) -> bool:
    """Write concise, category-specific German snippets without touching URLs."""
    relative = path.relative_to(ROOT / "de")
    if len(relative.parts) != 3 or relative.parts[0] != "products":
        return False
    raw = path.read_text(encoding="utf-8")
    match = re.search(r"<h1[^>]*>([^<]+)</h1>", raw)
    if not match:
        return False
    name = html_std.unescape(match.group(1)).strip()
    templates = {
        "food-ingredients": f"{name}: Spezifikation, Lebensmittelqualität, COA, Verpackung und Angebot für den internationalen B2B-Einkauf anfordern.",
        "animal-nutrition": f"{name}: Spezifikation, Futtermittelqualität, COA, Verpackung und Angebot für den internationalen B2B-Einkauf anfordern.",
        "home-care-industrial-cleaning": f"{name} für Reinigungsmittel: Spezifikation, technische Qualität, COA, Verpackung und B2B-Angebot anfordern.",
        "water-treatment": f"{name} für die Wasseraufbereitung: Spezifikation, technische Qualität, COA, Verpackung und B2B-Angebot anfordern.",
        "mining": f"{name} für Bergbau und Aufbereitung: Spezifikation, technische Qualität, COA, Verpackung und B2B-Angebot anfordern.",
        "agricultural-fertilizers": f"{name} für Düngemittel: Spezifikation, Nährstoffanalyse, COA, Verpackung und B2B-Angebot anfordern.",
    }
    description = templates.get(relative.parts[1])
    if not description:
        return False
    escaped = html_std.escape(description, quote=True)
    out = raw
    for selector in (
        r'(<meta name="description" content=")[^"]*(")',
        r'(<meta property="og:description" content=")[^"]*(")',
        r'(<meta name="twitter:description" content=")[^"]*(")',
    ):
        out = re.sub(selector, lambda m: m.group(1) + escaped + m.group(2), out, count=1)
    if out != raw:
        path.write_text(out, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = 0
    for path in (ROOT / "de").rglob("*.html"):
        changed += apply(path, GLOBAL)
    for path in (ROOT / "de" / "news").glob("*.html"):
        changed += apply(path, NEWS)
    changed += apply(ROOT / "de" / "products" / "home-care-industrial-cleaning" / "sles.html", SLES)
    for path in (ROOT / "de" / "products").glob("*/*.html"):
        changed += optimize_product_meta(path)
    print(f"Repaired {changed} German HTML files")


if __name__ == "__main__":
    main()

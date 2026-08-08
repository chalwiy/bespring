#!/usr/bin/env python3
"""Build the nine requested German food-product dossiers."""

from __future__ import annotations

import importlib
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build_requested_portuguese_food_pages as template
from build_requested_spanish_food_pages import PRODUCTS as SOURCE

BASE = "https://www.bespringchem.com"

DE = {
    "diammonium-phosphate-dap": {
        "name": "Diammoniumphosphat in Lebensmittelqualität (DAP)",
        "title": "Diammoniumphosphat DAP Lebensmittelqualität | Lieferant E342(ii)",
        "description": "Diammoniumphosphat DAP in Lebensmittelqualität, E342(ii): Gehalt, P₂O₅, Stickstoff, pH, COA, 25-kg-Verpackung und Angebot für Großmengen.",
        "summary": "Diammoniumphosphat in Lebensmittelqualität ist ein wasserlösliches Phosphatsalz. In zugelassenen Verfahren kann es als Nährstoff für Hefen, Säureregulator und Bestandteil von Backtriebmittelsystemen eingesetzt werden.",
        "functions": ["Stickstoff- und Phosphorquelle für kontrollierte Fermentationen", "Säureregulierung und Pufferwirkung", "Bestandteil geeigneter Backtriebmittelsysteme", "Phosphatquelle in kompatiblen Trockenmischungen"],
        "applications": ["Lebensmittel- und Getränkefermentation", "Backwaren und Backmischungen", "Hefeproduktion", "Trockene Formulierungen mit löslicher Phosphatquelle"],
        "criteria": ["DAP-, P₂O₅- und Stickstoffgehalt mit vereinbarter Berechnungsbasis", "pH-Wert, Feuchte und wasserunlösliche Bestandteile", "Grenzwerte für Fluorid, Arsen, Blei und weitere Verunreinigungen", "Korngröße, Löseverhalten und Rezepturverträglichkeit"],
        "note": "DAP in Lebensmittelqualität darf nicht mit Düngemittelqualität verwechselt werden. Entscheidend sind die Spezifikation des konkreten Herstellers, Rückverfolgbarkeit, Qualitätssystem und Chargendokumente.",
    },
    "food-phosphate-blends": {
        "name": "Funktionelle Lebensmittelphosphat-Mischungen",
        "title": "Lebensmittelphosphat-Mischungen nach Anwendung | B2B-Lieferant",
        "description": "Funktionelle Lebensmittelphosphat-Mischungen für Fleisch, Käse und Backwaren: Zusammensetzung, pH, Löslichkeit, COA und Lieferung in Großmengen.",
        "summary": "Lebensmittelphosphat-Mischungen kombinieren Ortho-, Pyro- oder Polyphosphate in festgelegten Anteilen. Die Auswahl richtet sich nach Lebensmittelmatrix, Prozess, Zielmarkt und gewünschter technologischer Funktion.",
        "functions": ["Einstellung von pH-Wert und Pufferkapazität", "Wasserbindung und Textursteuerung in Proteinsystemen", "Steuerung der Reaktionsgeschwindigkeit in Backtriebmitteln", "Dispergierung, Ionensequestrierung oder Stabilisierung je nach Zusammensetzung"],
        "applications": ["Fleischwaren und Proteinsysteme", "Schmelzkäse und Molkereiprodukte", "Backwaren und Backtriebmittelmischungen", "Zugelassene Getränke- und Fruchtanwendungen"],
        "criteria": ["Qualitative und quantitative Zusammensetzung statt nur Handelsname", "pH, Löslichkeit, P₂O₅ und Korngröße nach vereinbarter Prüfmethode", "Prüfung in der realen Rezeptur unter Prozessbedingungen", "Kennzeichnung und Höchstmengen im Bestimmungsmarkt"],
        "note": "Zwei Phosphatmischungen sind nicht allein deshalb austauschbar, weil beide Phosphate enthalten. Zusammensetzung, pH, Kettenlänge und Korngrößenverteilung beeinflussen die Wirkung.",
    },
    "phosphoric-acid-85": {
        "name": "Phosphorsäure 85% in Lebensmittelqualität",
        "title": "Phosphorsäure 85% Lebensmittelqualität | Lieferant E338",
        "description": "Phosphorsäure 85% in Lebensmittelqualität, E338: Konzentration, Verunreinigungen, Spezifikation, Sicherheitsdatenblatt, Gebinde und Großmengenangebot.",
        "summary": "Phosphorsäure 85%, auch Orthophosphorsäure, ist eine konzentrierte H₃PO₄-Lösung. In zugelassenen Anwendungen dient sie als Säuerungsmittel, Säureregulator und Ausgangsstoff für Lebensmittelphosphate.",
        "functions": ["Ansäuerung und pH-Einstellung", "Definiertes Säureprofil in geeigneten Lebensmitteln", "Ausgangsstoff für Phosphatsalze", "Prozesskontrolle in zugelassenen Anwendungen"],
        "applications": ["Getränke, Konzentrate, Konfitüren und Saucen", "Zuckerraffination", "Herstellung von Lebensmittelphosphaten", "Prozesse mit kontrollierter Ansäuerung"],
        "criteria": ["Tatsächliche H₃PO₄-Konzentration und Prüfmethode", "Farbe, Klarheit, Metalle und kritische Anionen", "Thermische oder nasschemische Herkunft und Reinigungsgrad", "Gebindematerial, Anlagenverträglichkeit und Transportklassifizierung"],
        "note": "Das Produkt ist korrosiv. Persönliche Schutzausrüstung, Lagerung, Transport und Werkstoffauswahl müssen dem aktuellen Sicherheitsdatenblatt und den betrieblichen Vorgaben entsprechen.",
    },
    "monoammonium-phosphate-map": {
        "name": "Monoammoniumphosphat in Lebensmittelqualität (MAP)",
        "title": "Monoammoniumphosphat MAP Lebensmittelqualität | Lieferant E342(i)",
        "description": "Monoammoniumphosphat MAP in Lebensmittelqualität, E342(i): Gehalt, P₂O₅, Stickstoff, pH, COA, Verpackung und Angebot für Großmengen.",
        "summary": "Monoammoniumphosphat in Lebensmittelqualität ist ein saures, wasserlösliches Salz aus Ammonium und Phosphat. In zugelassenen Verfahren wird es als Hefenährstoff, Säureregulator oder Komponente von Backtriebmitteln bewertet.",
        "functions": ["Stickstoff- und Phosphorquelle für Fermentationen", "Säureregulierung", "Saure Komponente bestimmter Backtriebmittelsysteme", "Phosphatquelle in kompatiblen Trockenmischungen"],
        "applications": ["Fermentation und Hefenährstoffe", "Backwaren", "Lebensmittel-Premixe", "Prozesse, die ein saureres Ammoniumphosphat als DAP benötigen"],
        "criteria": ["Gehalt, P₂O₅ und Stickstoff", "pH, Feuchte, unlöslicher Anteil und Korngröße", "Verunreinigungsgrenzen des Zielmarktes", "Funktionsvergleich von MAP und DAP in der Originalrezeptur"],
        "note": "Nicht mit MAP-Düngemittelqualität verwechseln. Für Lebensmittel sind Qualität, Herkunft, Rückverfolgbarkeit, Spezifikation und Chargendokumentation zu bestätigen.",
    },
    "sodium-diacetate": {
        "name": "Natriumdiacetat in Lebensmittelqualität (E262(ii))",
        "title": "Natriumdiacetat E262(ii) kaufen | Lieferant für Großmengen",
        "description": "Natriumdiacetat E262(ii) in Lebensmittelqualität: Zusammensetzung, freie Essigsäure, pH, COA, 25-kg-Säcke und Angebot für gewerbliche Abnehmer.",
        "summary": "Natriumdiacetat ist ein Komplex aus Natriumacetat und Essigsäure. In zugelassenen Lebensmitteln kann es als Säureregulator, Konservierungsstoff und trockene Quelle einer Essignote dienen.",
        "functions": ["Säureregulierung und Pufferwirkung", "Unterstützung mikrobiologischer Hürdensysteme", "Essigähnliches Geschmacksprofil", "Trockener Bestandteil validierter Konservierungssysteme"],
        "applications": ["Snacks und Würzmischungen", "Backwaren", "Verarbeitete Fleischwaren", "Saucen, Marinaden und Fertiggerichte"],
        "criteria": ["Verhältnis von Natriumacetat zu freier Essigsäure", "pH, Feuchte, Geruch und Fließfähigkeit", "Partikelform und Verteilung im Premix", "Mikrobiologische, sensorische und rechtliche Prüfung des Endprodukts"],
        "note": "Die konservierende Wirkung hängt von pH, Wasseraktivität, Prozess, Verpackung und weiteren Hürden ab. Eine Dosierung allein belegt weder Haltbarkeit noch mikrobiologische Sicherheit.",
    },
    "sodium-benzoate": {
        "name": "Natriumbenzoat in Lebensmittelqualität (E211)",
        "title": "Natriumbenzoat E211 kaufen | Lieferant für Lebensmittelqualität",
        "description": "Natriumbenzoat E211 als Pulver oder Granulat: Reinheit, Korngröße, COA, 25-kg-Verpackung und Angebot für industrielle Großmengen.",
        "summary": "Natriumbenzoat ist das Natriumsalz der Benzoesäure und wird vor allem in sauren Getränken und Lebensmitteln konservierend eingesetzt. Die Wirksamkeit hängt vom pH-Wert und vom gesamten Konservierungssystem ab.",
        "functions": ["Kontrolle von Hefen, Schimmelpilzen und bestimmten Bakterien in sauren Medien", "Unterstützung der Haltbarkeit", "Besser lösliche Alternative zu Benzoesäure", "Einzel- oder Kombinationseinsatz nach rechtlicher und technischer Prüfung"],
        "applications": ["Saure Getränke und Konzentrate", "Saucen, Würzmittel und Konserven", "Fruchtzubereitungen", "Weitere im Zielmarkt zugelassene Lebensmittelkategorien"],
        "criteria": ["Reinheit, Feuchte, Säure oder Alkalität und Verunreinigungen", "Pulver, Granulat oder staubarme Ausführung", "pH und vollständige Zusammensetzung der Anwendung", "Höchstmenge, Kennzeichnung und Wechselwirkungen in der Rezeptur"],
        "note": "Natriumbenzoat ist keine Universallösung. pH, Rechtslage, Prozess, Verpackung, Lagerbedingungen und Haltbarkeit des Endprodukts sind zu validieren.",
    },
    "calcium-sorbate": {
        "name": "Calciumsorbat (E203)",
        "title": "Calciumsorbat E203 | Lieferant für zulässige Zielmärkte",
        "description": "Calciumsorbat E203 für Märkte, in denen der Stoff zugelassen ist: Reinheit, regulatorischer Status, COA, Verpackung und Angebotsanfrage.",
        "summary": "Calciumsorbat ist das Calciumsalz der Sorbinsäure und wurde gegen Hefen und Schimmel eingesetzt. Der regulatorische Status unterscheidet sich zwischen Märkten und muss vor Einkauf oder Rezepturentwicklung geprüft werden.",
        "functions": ["Wirkung gegen Hefen und Schimmel unter geeigneten Bedingungen", "Feste Sorbatform für besondere Anwendungen", "Bestandteil zugelassener Konservierungssysteme", "Technische Alternative unter Beachtung von Löslichkeit und Rechtslage"],
        "applications": ["Nur in zugelassenen Lebensmittelkategorien und Märkten", "Vergleichsversuche mit Sorbinsäure oder Kaliumsorbat", "Systeme mit nachgewiesenem Vorteil der Calciumform", "Entwicklungen für Märkte, die E203 zulassen"],
        "criteria": ["Aktuelle Zulassung nach Markt und Lebensmittelkategorie", "Gehalt, Feuchte, Verunreinigungen und Analysenmethode", "Löslichkeit und Verteilung in der Matrix", "Wirksamkeit, Kennzeichnung und Haltbarkeitsprüfung"],
        "note": "Die Europäische Union hat E203 im Jahr 2018 aus der Liste zugelassener Lebensmittelzusatzstoffe gestrichen. Für andere Zielmärkte ist die aktuelle Rechtslage vor der Verwendung zu prüfen.",
    },
    "silicon-dioxide": {
        "name": "Siliciumdioxid in Lebensmittelqualität (E551)",
        "title": "Siliciumdioxid E551 Lebensmittelqualität | Lieferant Antibackmittel",
        "description": "Amorphes Siliciumdioxid E551 in Lebensmittelqualität: Kieselsäuretyp, Feuchte, Korngröße, COA, 10–25-kg-Säcke und Großmengenangebot.",
        "summary": "Amorphes Siliciumdioxid in Lebensmittelqualität wird in zugelassenen Trockenprodukten als Trennmittel beziehungsweise Antibackmittel und zur Verbesserung der Fließfähigkeit eingesetzt.",
        "functions": ["Verringerung von Verklumpung und Anbacken in Pulvern", "Verbesserung der Fließfähigkeit beim Mischen, Dosieren und Abfüllen", "Kontrollierte Adsorption von Feuchte oder Flüssigkeiten", "Unterstützung homogener Trockenmischungen"],
        "applications": ["Gewürze und Trockenmischungen", "Instantgetränke und Premixe", "Salze, Zucker und hygroskopische Pulver", "Zugelassene Lebensmittelzutaten und Nahrungsergänzungsmittel"],
        "criteria": ["Gefällte amorphe Kieselsäure, Kieselgel oder vereinbarte Form", "Trocknungsverlust, Glühverlust und Reinheit", "Korngröße, Schüttdichte und Adsorptionsvermögen", "Fließverhalten im Originalprodukt und gesetzliche Höchstmengen"],
        "note": "Identität und physikalische Form sind entscheidend. Ein allgemeines Datenblatt für Siliciumdioxid belegt nicht automatisch die Eignung des konkreten Materials für Lebensmittel.",
    },
    "gellan-gum": {
        "name": "Gellan in Lebensmittelqualität (E418)",
        "title": "Gellan E418 kaufen | Hoch- und niederacylierte Qualität",
        "description": "Gellan E418 in hoch- oder niederacylierter Lebensmittelqualität: Hydratisierung, Gelstärke, COA, 25-kg-Säcke und Angebot für Großmengen.",
        "summary": "Gellan ist ein fermentativ hergestelltes Hydrokolloid. Hoch- und niederacylierte Qualitäten erzeugen unterschiedliche Texturen; die Auswahl hängt von Matrix, Ionen, pH, Wärmeprozess und gewünschter Sensorik ab.",
        "functions": ["Gelbildung und Strukturbildung", "Suspension von Partikeln, Mineralstoffen oder Kakao", "Stabilisierung und Verringerung der Phasentrennung", "Textursteuerung bei niedriger Einsatzmenge"],
        "applications": ["Pflanzliche und milchbasierte Getränke sowie Getränke mit Partikeln", "Fruchtzubereitungen, Gelees und Füllungen", "Desserts und Süßwaren", "Saucen und Systeme mit Suspensions- oder Gelbedarf"],
        "criteria": ["Hochacyliert für weichere elastische Texturen; niederacyliert für festere Gele", "Hydratisierungstemperatur und Zugabereihenfolge", "Einfluss von Calcium und anderen Ionen, pH und löslicher Trockenmasse", "Gelstärke, Viskosität, Mikrobiologie und Restlösemittel"],
        "note": "Gelstärken verschiedener Lieferanten sind nur bei identischer Prüfmethode, Konzentration, Wasserqualität, Ionenverhältnis und Temperatur vergleichbar.",
    },
}

STATIC = {
    'lang="pt-BR"': 'lang="de"', "pt-BR": "de", "pt_BR": "de_DE", "/pt/": "/de/",
    "Ingredientes alimentícios": "Lebensmittelzutaten", "Início": "Startseite", "Produtos": "Produkte", "Sobre nós": "Über uns", "Serviços": "Services", "Notícias": "Aktuelles", "Contato": "Kontakt",
    "Navegação principal": "Hauptnavigation", "Abrir menu de navegação": "Navigationsmenü öffnen", "Navegação estrutural": "Brotkrümelnavigation",
    "Ingrediente grau alimentício": "Lebensmittelqualität", "Fornecimento B2B de ingredientes alimentícios": "B2B-Lieferung von Lebensmittelzutaten", "Exportação internacional": "Internationale Lieferungen",
    "O que é e como especificar": "Produktidentität und Spezifikation",
    "Para compras industriais, o nome comercial não é suficiente. Solicite a especificação vigente da origem proposta, os métodos analíticos, um COA representativo e o certificado do lote. A conformidade deve ser avaliada para a aplicação, a norma acordada e o país onde o alimento será comercializado.": "Für einen industriellen Einkauf reicht der Handelsname nicht aus. Fordern Sie die aktuelle Herstellerspezifikation, Prüfmethoden, ein Muster-COA und das Analysezertifikat der Charge an. Die Konformität ist für die konkrete Anwendung, den vereinbarten Standard und den Absatzmarkt des Lebensmittels zu bewerten.",
    "Principais funções": "Wesentliche Funktionen", "Aplicações a serem avaliadas": "Zu prüfende Anwendungen",
    "As aplicações são orientativas, não autorizações gerais nem recomendações de dosagem. Confirme adequação técnica, limite de uso e rotulagem no produto final.": "Die Anwendungen sind Orientierungshilfen, keine allgemeine Zulassung oder Dosierungsempfehlung. Technische Eignung, Höchstmenge und Kennzeichnung im Endprodukt sind zu prüfen.",
    "Critérios de seleção para compras B2B": "Auswahlkriterien für den B2B-Einkauf", "Documentação, embalagem e logística": "Dokumentation, Verpackung und Logistik",
    "Para homologação do fornecedor, solicite especificação assinada, ficha técnica, FISPQ, modelo de COA, declarações regulatórias e certificados aplicáveis ao produto, à fábrica e ao período de fornecimento. Confirme peso líquido, material da embalagem e do revestimento interno, paletização, marcações, prazo de validade, armazenagem, porto de destino e Incoterm.": "Für die Lieferantenfreigabe sollten eine unterzeichnete Spezifikation, TDS, Sicherheitsdatenblatt, Muster-COA, regulatorische Erklärungen und gültige Zertifikate angefordert werden. Bestätigen Sie Nettogewicht, Verpackungs- und Inlinermaterial, Palettierung, Kennzeichnung, Haltbarkeit, Lagerung, Bestimmungsort und Incoterm.",
    "Referência técnica independente": "Unabhängige technische Referenz", "Consulte a ": "Nutzen Sie die ", "referência técnica oficial indicada para este produto": "angegebene offizielle technische Referenz",
    " como apoio à identidade e ao contexto regulatório. A especificação contratual e a legislação vigente do mercado de destino prevalecem em cada operação.": " zur Prüfung von Identität und regulatorischem Kontext. Maßgeblich bleiben die vertragliche Spezifikation und das geltende Recht des Zielmarktes.",
    "Perguntas frequentes": "Häufig gestellte Fragen", "Quais dados devo enviar para solicitar uma cotação?": "Welche Angaben werden für ein Angebot benötigt?",
    "Informe aplicação, norma e limites críticos, volume anual e por embarque, embalagem, destino, Incoterm, certificados e data necessária. Isso permite comparar propostas tecnicamente equivalentes.": "Nennen Sie Anwendung, Standard, kritische Grenzwerte, Jahres- und Liefermenge, Verpackung, Bestimmungsort, Incoterm, Zertifikate und Bedarfstermin. So lassen sich technisch vergleichbare Angebote erstellen.",
    "Como confirmar que o material é grau alimentício?": "Wie wird Lebensmittelqualität bestätigt?", "Verifique a especificação da origem exata, a documentação do sistema de qualidade, as declarações aplicáveis e o COA do lote. O nome do produto, isoladamente, não comprova o grau.": "Prüfen Sie die Spezifikation des konkreten Herstellers, die Dokumente des Qualitätssystems, anwendbare Erklärungen und das Chargen-COA. Der Produktname allein belegt keine Lebensmittelqualität.",
    "O produto pode ser usado em qualquer alimento ou país?": "Ist das Produkt in jedem Lebensmittel und jedem Land einsetzbar?", "Não. Confirme categoria de alimento, função, limite de uso e rotulagem na legislação vigente do mercado de destino.": "Nein. Lebensmittelkategorie, Funktion, Höchstmenge und Kennzeichnung sind nach dem geltenden Recht des Zielmarktes zu prüfen.",
    "Solicitar especificação e cotação": "Spezifikation und Angebot anfordern", "Informe produto, grau, limites críticos, quantidade, embalagem e destino.": "Nennen Sie Produkt, Qualität, kritische Grenzwerte, Menge, Verpackung und Bestimmungsort.",
    "Enviar requisitos": "Anforderungen senden", "Ver ingredientes alimentícios": "Weitere Lebensmittelzutaten", "Identificação": "Identität",
    "Fornecedor de ingredientes alimentícios, aditivos para nutrição animal e produtos químicos industriais.": "Lieferant für Lebensmittelzutaten, Futtermittelzusatzstoffe und Industriechemikalien.", "Links rápidos": "Direktlinks", "Solicitar informações": "Anfrage senden", "Todos os direitos reservados.": "Alle Rechte vorbehalten.",
}


def page(slug: str, p: dict, src: dict) -> str:
    raw = template.page(slug, p, src)
    for old, new in STATIC.items(): raw = raw.replace(old, new)
    return raw


def add_de_hreflang(slug: str) -> None:
    path = ROOT / "products/food-ingredients" / f"{slug}.html"; rel = path.relative_to(ROOT).as_posix()
    raw = subprocess.run(["git", "show", f"HEAD:{rel}"], cwd=ROOT, check=True, stdout=subprocess.PIPE).stdout.decode("utf-8")
    current = path.read_text(encoding="utf-8")
    for code, folder in (("es", "es"), ("pt-BR", "pt"), ("ru", "ru")):
        url = f"{BASE}/{folder}/products/food-ingredients/{slug}.html"
        if f'hreflang="{code}" href="{url}"' in current and f'hreflang="{code}"' not in raw:
            raw = raw.replace('<link rel="alternate" hreflang="x-default"', f'<link rel="alternate" hreflang="{code}" href="{url}"><link rel="alternate" hreflang="x-default"', 1)
    de = f"{BASE}/de/products/food-ingredients/{slug}.html"
    if 'hreflang="de"' not in raw: raw = raw.replace('<link rel="alternate" hreflang="x-default"', f'<link rel="alternate" hreflang="de" href="{de}"><link rel="alternate" hreflang="x-default"', 1)
    path.write_text(raw, encoding="utf-8")


def main() -> None:
    out = ROOT / "de/products/food-ingredients"; out.mkdir(parents=True, exist_ok=True)
    for slug, product in DE.items():
        (out / f"{slug}.html").write_text(page(slug, product, SOURCE[slug]), encoding="utf-8")
        add_de_hreflang(slug)
    importlib.import_module("build_industry_application_pages").rebuild_sitemap()
    print(f"Built {len(DE)} German product pages and rebuilt sitemap.xml")


if __name__ == "__main__": main()

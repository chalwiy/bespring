#!/usr/bin/env python3
"""Build only missing Spanish product dossiers from their English counterparts.

Existing Spanish detail pages are preserved. The script reuses the site's
translation memory, synchronizes all six Spanish product indexes, adds
reciprocal English/Spanish hreflang markup and rebuilds the sitemap.
"""

from __future__ import annotations

import copy
import html as html_std
import importlib
import re
import sys
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import localize_new_pages as localizer
import polish_spanish_new_pages as spanish


CATEGORIES = {
    "food-ingredients": {
        "label": "Ingredientes alimentarios",
        "grade": "grado alimentario",
        "title": "Proveedor de {name} de grado alimentario | Bespring",
    },
    "animal-nutrition": {
        "label": "Nutrición animal",
        "grade": "grado para alimentación animal",
        "title": "Proveedor de {name} para alimentación animal | Bespring",
    },
    "home-care-industrial-cleaning": {
        "label": "Limpieza doméstica e industrial",
        "grade": "grado técnico para formulación",
        "title": "Proveedor de {name} para limpieza industrial | Bespring",
    },
    "water-treatment": {
        "label": "Tratamiento de agua",
        "grade": "grado para tratamiento de agua",
        "title": "Proveedor de {name} para tratamiento de agua | Bespring",
    },
    "agricultural-fertilizers": {
        "label": "Fertilizantes agrícolas",
        "grade": "grado fertilizante",
        "title": "Proveedor de {name} de grado fertilizante | Bespring",
    },
    "mining": {
        "label": "Minería",
        "grade": "grado industrial para minería",
        "title": "Proveedor de {name} para minería | Bespring",
    },
}

FOOD_TARGETS = {
    "dicalcium-phosphate-dihydrate", "monocalcium-phosphate-anhydrous",
    "sorbic-acid", "edta-food-grade", "lactic-acid",
    "cream-of-tartar-potassium-bitartrate", "apple-cider-vinegar", "chocolate",
    "cocoa-powder", "distilled-monoglycerides-dmg", "mono-diglycerides-mdg",
    "polysorbates", "datem", "sodium-erythorbate", "gum-arabic",
    "oligofructose", "citrus-fiber", "inulin", "dry-dairy-powders",
    "fruit-crystals", "vanillin", "calcium-lactate", "calcium-carbonate",
    "calcium-chloride-anhydrous", "sodium-lactate", "potassium-lactate",
    "ferrous-lactate", "magnesium-lactate", "zinc-lactate",
    "potassium-carbonate", "canola-oil", "coconut-oil", "corn-oil",
    "shortening", "sunflower-oil", "sodium-bicarbonate", "propylene-glycol",
    "dairy-protein", "whey-protein", "clean-whey", "lactose", "sweet-whey",
    "faba-protein", "pea-protein", "soy-flour", "textured-soy-protein",
    "corn-syrup", "dextrose-glucose", "high-intensity-sweeteners", "maltitol",
    "maltodextrin", "granulated-sugar", "plant-derived-sugar",
    "dextrose-monohydrate", "erythritol", "sorbitol",
    "acetylated-distarch-phosphate", "cellulose-derivatives", "hydrocolloids",
    "pectin",
}

SEO_NAMES = {
    "datem": "DATEM",
    "caustic-potash-potassium-hydroxide": "potasa cáustica (KOH)",
    "labsa": "LABSA",
    "inorganic-organic-coagulant-blends": "mezclas de coagulantes",
}

TERM_FIXES = [
    ("Ingredente", "Ingrediente"),
    ("ingredente", "ingrediente"),
    ("Guía del comprador-intent", "Guía de compra"),
    ("Cómo fuente de ", "Cómo comprar "),
    ("Cómo fuente ", "Cómo comprar "),
    ("Cómo obtener ", "Cómo comprar "),
    ("áreas de detección técnica", "áreas de evaluación técnica"),
    ("áreas de detección", "áreas de evaluación"),
    ("preguntas de compra de cola larga", "consultas de compra específicas"),
    ("preguntas de compra al comparar", "criterios de compra al comparar"),
    ("Establece la ", "Indique la "),
    ("Establece el ", "Indique el "),
    ("Estado líquido o polvo", "Indique si se requiere formato líquido o en polvo"),
    ("Compartir el ", "Indique el "),
    ("Compartir la ", "Indique la "),
    ("Compartir formulario exacto", "Indique la forma exacta"),
    ("Compartir análisis", "Facilite el análisis"),
    ("Compartir los ", "Facilite los "),
    ("Compartir las ", "Facilite las "),
    ("calificar la forma", "verificar la forma"),
    ("deben ser calificados", "deben verificarse"),
    ("debe ser calificado", "debe verificarse"),
    ("calificación preliminar", "evaluación preliminar"),
    ("calificación de adquisición", "evaluación para compras"),
    ("calificación del proveedor", "homologación del proveedor"),
    ("fuente de fabricante", "fabricante"),
    ("fabricante de alimentos adicionales", "fabricante de aditivos para piensos"),
    ("oferta de distribuidores", "oferta de un distribuidor"),
    ("cotización masiva", "cotización para suministro a granel"),
    ("precio grueso", "precio a granel"),
    ("grueso (", "a granel ("),
    ("premezclaes", "premezclas"),
    ("premezclaes", "premezclas"),
    ("fuente-agua", "agua de origen"),
    ("datos fuente-agua", "datos del agua de origen"),
    ("removalación", "eliminación"),
    ("Aclaraciones de agua potable", "Clarificación de agua potable"),
    ("Tratamiento de agua química", "Producto químico para tratamiento de agua"),
    ("prepolímerizado", "prepolimerizado"),
    ("prepolímero", "prepolimerizado"),
    ("sobre operativo", "rango operativo"),
    ("direcciones operativas", "instrucciones operativas"),
    ("reclamaciones de eficacia", "declaraciones de eficacia"),
    ("rigen el orden", "rigen el pedido"),
    ("suministrados por las ventas", "facilitados por el equipo comercial"),
    ("proceso completo de alimentos", "proceso alimentario completo"),
    ("ingredientes portadores", "vehículos"),
    ("ayudas de flujo", "agentes antiapelmazantes"),
    ("sazones", "condimentos"),
    ("fabricante documentos", "documentación del fabricante"),
    ("por lotes", "de lote"),
    ("COA representativa", "COA representativo"),
    ("COA por lotes", "COA de lote"),
    ("calidad de alimento", "grado para alimentación animal"),
    ("alimento grado para alimentación animal", "grado para alimentación animal"),
    ("Aminoácido de grado alimentado", "Aminoácido de grado para alimentación animal"),
    ("de grado alimentado", "de grado para alimentación animal"),
    ("uniformidad mezcladora", "uniformidad de mezcla"),
    ("recomendación de tasa de inclusión", "recomendación de nivel de inclusión"),
    ("formulación completa de alimentos", "formulación completa del pienso"),
    ("tipo de alimentación", "tipo de pienso"),
    ("reglas de alimentación", "normativa aplicable a los piensos"),
    ("instrucciones de alimentación", "instrucciones de uso en piensos"),
    ("Equilibrio de aminoácidos alimentado por compuestos", "Equilibrio de aminoácidos en piensos compuestos"),
    ("aminoácidos alimentados por compuestos", "aminoácidos en piensos compuestos"),
    ("alimentación de aplicación", "aplicación en piensos"),
    ("guía de aplicación de alimentación", "guía de aplicación en piensos"),
    ("Feed Grade", "Grado para alimentación animal"),
    ("Apple Cider Vinegar", "vinagre de sidra de manzana"),
    ("polyaluminum Chloride", "cloruro de polialuminio"),
    ("Turbidity and color-removal programs", "Programas de eliminación de turbidez y color"),
    ("grado de alimentación", "grado para alimentación animal"),
    ("grado alimenticio", "grado alimentario"),
    ("alimentación animal grado", "grado para alimentación animal"),
    ("químicos de tratamiento de agua", "productos químicos para tratamiento de agua"),
    ("hoja de datos de seguridad", "ficha de datos de seguridad"),
    ("oferta a granel", "cotización para suministro a granel"),
    ("cita a granel", "cotización para suministro a granel"),
    ("Solicitar cotización y especificación", "Solicitar especificación y cotización"),
    ("precio mayorista", "precio para suministro a granel"),
    ("fabricante de China", "proveedor de China"),
    ("Ash Soda", "carbonato de sodio"),
    ("ceniza de soda", "carbonato de sodio"),
    ("soda cáustica", "sosa cáustica"),
    ("potasa cáustica", "potasa cáustica"),
    ("mono propilenglicol", "monopropilenglicol"),
    ("ácido labsa", "LABSA"),
    ("Sulfato de cobre", "sulfato de cobre"),
    ("Sulfato ferroso", "sulfato ferroso"),
    ("Sulfato férrico", "sulfato férrico"),
    ("cloruro férrico", "cloruro férrico"),
    ("policloruro de aluminio", "policloruro de aluminio"),
    ("polialuminio cloruro", "policloruro de aluminio"),
    ("polyaluminum", "polialuminio"),
    ("floculantes", "floculantes"),
    ("xantatos", "xantatos"),
    ("tiocarbamato", "tiocarbamato"),
    ("dithiophosphate", "ditiofosfato"),
    ("hidrosulfuro de sodio", "hidrosulfuro de sodio"),
    ("hipoclorito de calcio", "hipoclorito de calcio"),
    ("hipoclorito de sodio", "hipoclorito de sodio"),
    ("compuestos de amonio cuaternario", "compuestos de amonio cuaternario"),
    ("cloruro de colina", "cloruro de colina"),
    ("metionina DL", "DL-metionina"),
    ("lisina L", "L-lisina"),
    ("treonina L", "L-treonina"),
    ("valina L", "L-valina"),
]


def parse(path: Path):
    return html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))


def direct_text(node) -> str:
    return " ".join(node.text_content().split())


def english_sources() -> list[str]:
    rels = []
    for category in CATEGORIES:
        folder = ROOT / "products" / category
        paths = sorted(folder.glob("*.html"))
        if category == "food-ingredients":
            paths = [path for path in paths if path.stem in FOOD_TARGETS]
        rels.extend(path.relative_to(ROOT).as_posix() for path in paths)
    return rels


def missing_sources(rels: list[str]) -> list[str]:
    return [rel for rel in rels if not (ROOT / "es" / rel).exists()]


def product_names() -> dict[tuple[str, str], str]:
    names = {}
    for category in CATEGORIES:
        path = ROOT / "es" / "products" / f"{category}.html"
        doc = parse(path)
        for node in doc.xpath("//li[@data-product]"):
            anchors = node.xpath("./a")
            if anchors:
                slug = Path(anchors[0].get("href")).stem
                names[(category, slug)] = direct_text(node)
            key = (node.get("data-product") or "").rsplit(" | ", 1)[-1]
            names.setdefault((category, key), direct_text(node))
    return names


def listing_name(category: str, slug: str, names: dict[tuple[str, str], str]) -> str:
    if (category, slug) in names:
        return names[(category, slug)]
    english_listing = parse(ROOT / "products" / f"{category}.html")
    for node in english_listing.xpath("//li[@data-product]"):
        anchors = node.xpath("./a")
        if anchors and Path(anchors[0].get("href")).stem == slug:
            key = (node.get("data-product") or "").rsplit(" | ", 1)[-1]
            if (category, key) in names:
                return names[(category, key)]
    return slug.replace("-", " ")


def replace_fragments(value: str) -> str:
    value = spanish.polish(value)
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
            node.text = replace_fragments(node.text)
        if node.tail:
            node.tail = replace_fragments(node.tail)
        for attr in ("alt", "title", "aria-label", "placeholder"):
            if node.get(attr):
                node.set(attr, replace_fragments(node.get(attr)))
        if node.tag.lower() == "meta" and node.get("content"):
            node.set("content", replace_fragments(node.get("content")))

    h1 = doc.xpath("//h1")
    if h1:
        h1[0].text = display_name[0].upper() + display_name[1:]
    breadcrumb = doc.xpath("//main//nav//li[@aria-current='page']")
    if breadcrumb:
        breadcrumb[-1].text = display_name

    seo_name = SEO_NAMES.get(Path(rel).stem, display_name)
    title = config["title"].format(name=seo_name)
    description = localizer.shorten_at_word(
        f"Solicite especificación, COA, documentación, embalaje y cotización de {display_name} "
        f"{config['grade']} para compras B2B y suministro internacional.", 180
    )
    spanish.set_metadata(doc, title, description)

    overview = doc.xpath("//*[@id='overview']//h2")
    if overview:
        overview[0].text = f"¿Qué es {display_name} y cómo se especifica?"
    faq = doc.xpath("//*[@id='faq']//h2")
    if faq:
        faq[0].text = f"Preguntas frecuentes sobre {display_name}"
    quote = doc.xpath("//*[@id='request-quote']//h2")
    if quote:
        quote[0].text = f"Solicite especificación y cotización de {display_name}"

    # Keep JSON-LD translated but ensure the visible product identity and
    # language are exact after machine-assisted localization.
    source_doc = parse(ROOT / rel)
    source_scripts = source_doc.xpath("//script[@type='application/ld+json']")
    for index, script in enumerate(doc.xpath("//script[@type='application/ld+json']")):
        if not script.text:
            continue
        data = localizer.json.loads(script.text)
        if index < len(source_scripts) and source_scripts[index].text:
            source_data = localizer.json.loads(source_scripts[index].text)
            data = spanish.translate_schema_from_source(source_data, data, mapping)

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
                    value["inLanguage"] = "es"
                for child in value.values():
                    walk(child)
            elif isinstance(value, list):
                for child in value:
                    walk(child)

        walk(data)
        script.text = localizer.json.dumps(spanish.polish_json(data), ensure_ascii=False, separators=(",", ":"))
    localizer.write_html(path, doc)


def sync_index(category: str, mapping: dict[str, str]) -> None:
    source = parse(ROOT / "products" / f"{category}.html")
    target_path = ROOT / "es" / "products" / f"{category}.html"
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
    localizer.ACTIVE_LANGS = ["es"]
    rels = english_sources()
    missing = missing_sources(rels)
    print(f"English dossiers: {len(rels)}; existing Spanish: {len(rels) - len(missing)}; to create: {len(missing)}")
    cache = localizer.load_cache()
    if missing:
        docs = [parse(ROOT / rel) for rel in missing]
        strings = set().union(*(localizer.collect_strings(doc) for doc in docs))
        strings.add("Language selection")
        localizer.seed_parallel_translation_memory(cache, ["es"])
        localizer.populate_translations(strings, cache, ["es"])
        localizer.save_cache(cache)

    names = product_names()
    for rel in missing:
        localizer.update_english_seo(rel)
        localizer.localize_page(rel, "es", cache["es"])
    for rel in rels:
        category, slug = rel.split("/")[1], Path(rel).stem
        polish_page(ROOT / "es" / rel, rel, listing_name(category, slug, names), cache["es"])

    for category in CATEGORIES:
        sync_index(category, cache["es"])

    builder = importlib.import_module("build_industry_application_pages")
    builder.rebuild_sitemap()
    print(
        f"Created {len(missing)} and post-edited {len(rels)} Spanish product pages; "
        "synchronized six indexes and sitemap."
    )


if __name__ == "__main__":
    main()

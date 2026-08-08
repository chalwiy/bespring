#!/usr/bin/env python3
"""Build the three final requested Spanish food-ingredient pages."""

from __future__ import annotations

import importlib
from pathlib import Path

from build_requested_spanish_food_pages import BASE, page

ROOT = Path(__file__).resolve().parents[1]

PRODUCTS = {
    "encapsulated-sorbic-acid": {
        "name": "Ácido sórbico encapsulado", "code": "Activo: E200 / INS 200", "cas": "Activo: 110-44-1", "formula": "Ácido sórbico en vehículo lipídico alimentario",
        "title": "Proveedor de ácido sórbico encapsulado | Grado alimentario",
        "description": "Ácido sórbico encapsulado de grado alimentario con 83–87 % de activo. Consulte recubrimiento, liberación, granulometría, COA y cotización a granel.",
        "summary": "El ácido sórbico encapsulado es una formulación conservante en la que el ácido sórbico se recubre con una grasa alimentaria. El recubrimiento puede retrasar el contacto del activo con la masa y reducir interacciones prematuras; el perfil real de liberación debe comprobarse en el proceso del comprador.",
        "functions": ["Aporte controlado de ácido sórbico como activo antimohos", "Modificación del momento de liberación mediante un recubrimiento lipídico", "Menor interacción prematura con levaduras o ingredientes sensibles cuando la formulación lo demuestra", "Apoyo a una estrategia de vida útil validada"],
        "applications": ["Panificación y masas fermentadas", "Premezclas secas para hornear", "Rellenos y productos de humedad intermedia", "Otros alimentos autorizados donde se haya validado la liberación del activo"],
        "criteria": ["Porcentaje de ácido sórbico activo y base del ensayo", "Naturaleza y declaración del recubrimiento, incluida su idoneidad alimentaria", "Curva o método de liberación bajo las condiciones reales de mezcla y horneado", "Distribución granulométrica, homogeneidad, microbiología y estabilidad"],
        "note": "El producto terminado es una mezcla formulada: E200/INS 200 y CAS 110-44-1 identifican el ácido sórbico activo, no una identidad universal para toda la partícula encapsulada. Confirme composición, etiquetado y autorización en el mercado de destino.",
        "reference": "https://www.fao.org/fileadmin/user_upload/jecfa_additives/docs/Monograph1/Additive-430.pdf",
        "ref_label": "especificación JECFA del ácido sórbico activo",
    },
    "monosodium-glutamate-msg": {
        "name": "Glutamato monosódico (MSG)", "code": "E621 / INS 621", "cas": "6106-04-3", "formula": "C₅H₈NNaO₄ · H₂O",
        "title": "Proveedor de glutamato monosódico alimentario | MSG E621",
        "description": "Glutamato monosódico (MSG) E621 de grado alimentario con ensayo ≥99 %. Revise granulometría, pureza, COA, embalaje y cotización a granel.",
        "summary": "El L-glutamato monosódico, conocido como glutamato monosódico o MSG, es la sal sódica del ácido L-glutámico. Se emplea como potenciador del sabor umami en formulaciones saladas compatibles, siempre dentro de los usos y límites aplicables al mercado de destino.",
        "functions": ["Potenciación del sabor umami", "Redondeo del perfil salado y cárnico de una formulación", "Refuerzo sensorial en mezclas de condimentos", "Mejora de la percepción de sabor sin sustituir una formulación equilibrada"],
        "applications": ["Condimentos y sazonadores en polvo", "Sopas, caldos y salsas", "Fideos instantáneos y aperitivos", "Productos cárnicos, marinos o vegetales procesados"],
        "criteria": ["Contenido de glutamato de sodio, rotación específica y transmitancia", "Granulometría acordada para dosificación, mezcla y disolución", "Pérdida por secado, pH y límites de metales e impurezas", "Ensayo sensorial en la receta final y cómputo de su aporte de sodio"],
        "note": "La denominación comercial puede aparecer como MSG, GMS o glutamato de sodio. Para homologar una oferta, confirme que la especificación corresponde al L-glutamato monosódico monohidratado y defina la granulometría contractual.",
        "reference": "https://www.fao.org/food/food-safety-quality/scientific-advice/jecfa/jecfa-additives/detail/pt/c/141/",
        "ref_label": "registro JECFA del L-glutamato monosódico",
    },
    "sodium-metabisulfite": {
        "name": "Metabisulfito de sodio", "code": "E223 / INS 223", "cas": "7681-57-4", "formula": "Na₂S₂O₅",
        "title": "Proveedor de metabisulfito de sodio alimentario | E223",
        "description": "Metabisulfito de sodio E223 de grado alimentario para suministro B2B. Consulte ensayo, SO₂, pH, sulfitos, COA, sacos de 25 kg y cotización.",
        "summary": "El metabisulfito de sodio, también llamado disulfito de sodio o pirosulfito de sodio, es un sulfito que puede desempeñar funciones antioxidantes, antipardeamiento, conservantes o de tratamiento en categorías alimentarias autorizadas.",
        "functions": ["Acción antioxidante en procesos compatibles", "Control del pardeamiento en aplicaciones autorizadas", "Liberación de dióxido de azufre en condiciones de uso", "Apoyo conservante sujeto a validación y normativa"],
        "applications": ["Frutas y hortalizas procesadas en categorías autorizadas", "Productos de patata y otras matrices sensibles al pardeamiento", "Determinados procesos de vinificación o bebidas", "Aplicaciones de panificación o tratamiento permitidas por la legislación de destino"],
        "criteria": ["Ensayo como Na₂S₂O₅, contenido de SO₂, pH e insolubles", "Hierro, arsénico, plomo y demás límites con unidades y comparadores explícitos", "Humedad, estabilidad y envase barrera frente al aire y al agua", "Límite de uso, residuo de SO₂ y declaración obligatoria de sulfitos en el producto final"],
        "note": "Los sulfitos pueden requerir una declaración destacada en el etiquetado. En la Unión Europea, el dióxido de azufre y los sulfitos deben declararse cuando superan 10 mg/kg o 10 mg/l, expresados como SO₂; verifique siempre la norma vigente y la categoría concreta.",
        "reference": "https://www.fao.org/fileadmin/user_upload/jecfa_additives/docs/Monograph1/Additive-414.pdf",
        "ref_label": "especificación JECFA del metabisulfito de sodio",
    },
}


def add_spanish_hreflang(slug: str) -> None:
    path = ROOT / "products" / "food-ingredients" / f"{slug}.html"
    text = path.read_text(encoding="utf-8")
    if 'hreflang="es"' not in text:
        link = f'<link rel="alternate" hreflang="es" href="{BASE}/es/products/food-ingredients/{slug}.html">'
        text = text.replace('<link rel="alternate" hreflang="x-default"', link + '<link rel="alternate" hreflang="x-default"', 1)
        path.write_text(text, encoding="utf-8")


def update_listing() -> None:
    path = ROOT / "es" / "products" / "food-ingredients.html"
    text = path.read_text(encoding="utf-8")
    additions = {
        '<li data-product="sorbato de calcio | calcium sorbate"><a href="food-ingredients/calcium-sorbate.html">sorbato de calcio</a></li>':
            '<li data-product="sorbato de calcio | calcium sorbate"><a href="food-ingredients/calcium-sorbate.html">sorbato de calcio</a></li><li data-product="ácido sórbico encapsulado | encapsulated sorbic acid | e200"><a href="food-ingredients/encapsulated-sorbic-acid.html">Ácido sórbico encapsulado</a></li><li data-product="metabisulfito de sodio | disulfito de sodio | pirosulfito de sodio | sodium metabisulfite | smbs | e223"><a href="food-ingredients/sodium-metabisulfite.html">Metabisulfito de sodio</a></li>',
        '<li data-product="vainillina | vanillin"><a href="food-ingredients/vanillin.html">Vainillina</a></li>':
            '<li data-product="vainillina | vanillin"><a href="food-ingredients/vanillin.html">Vainillina</a></li><li data-product="glutamato monosódico | glutamato de sodio | monosodium glutamate | msg | gms | e621"><a href="food-ingredients/monosodium-glutamate-msg.html">Glutamato monosódico (MSG)</a></li>',
    }
    for anchor, replacement in additions.items():
        if replacement not in text:
            if anchor not in text:
                raise RuntimeError(f"Listing anchor not found: {anchor}")
            text = text.replace(anchor, replacement, 1)
    text = text.replace('<span>9 materiales</span>', '<span>11 materiales</span>', 1)
    # The first three-material family after preservatives is the flavour/dairy group.
    flavour = '<article class="pc-family" id="flavors-dairy-powders"'
    before, after = text.split(flavour, 1)
    after = after.replace('<span>3 materiales</span>', '<span>4 materiales</span>', 1)
    path.write_text(before + flavour + after, encoding="utf-8")


def main() -> None:
    out = ROOT / "es" / "products" / "food-ingredients"
    for slug, product in PRODUCTS.items():
        (out / f"{slug}.html").write_text(page(slug, product), encoding="utf-8")
        add_spanish_hreflang(slug)
    update_listing()
    builder = importlib.import_module("build_industry_application_pages")
    builder.rebuild_sitemap()
    print(f"Built {len(PRODUCTS)} Spanish pages, updated listing and sitemap")


if __name__ == "__main__":
    main()

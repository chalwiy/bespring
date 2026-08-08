#!/usr/bin/env python3
"""Build the nine requested Spanish food-ingredient dossiers locally."""

from __future__ import annotations

import html as h
import importlib
import json
import subprocess
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.bespringchem.com"

PRODUCTS = {
    "diammonium-phosphate-dap": {
        "name": "Fosfato diamónico (DAP)", "code": "INS 342(ii)", "cas": "7783-28-0", "formula": "(NH₄)₂HPO₄",
        "title": "Proveedor de fosfato diamónico alimentario | DAP a granel",
        "description": "Fosfato diamónico (DAP) de grado alimentario, INS 342(ii). Consulte especificación, P₂O₅, nitrógeno, pH, documentación y cotización a granel.",
        "summary": "El fosfato diamónico de grado alimentario es una sal fosfatada soluble en agua que puede aportar nitrógeno y fósforo en procesos autorizados de fermentación, además de actuar como regulador de la acidez o componente de sistemas leudantes.",
        "functions": ["Nutriente de levaduras en procesos de fermentación validados", "Regulación de la acidez y capacidad tampón", "Componente de sistemas leudantes y acondicionamiento de masas", "Aporte de fosfato en premezclas alimentarias compatibles"],
        "applications": ["Fermentación de bebidas y alimentos", "Panificación y premezclas para hornear", "Cultivos de levadura", "Formulaciones secas que requieran una fuente soluble de fosfato"],
        "criteria": ["Contenido de DAP, P₂O₅ y nitrógeno sobre la base acordada", "pH de la disolución, humedad y materia insoluble", "Límites de arsénico, plomo, fluoruro y otros contaminantes aplicables", "Granulometría, comportamiento de disolución y compatibilidad con la fórmula"],
        "note": "No debe confundirse con el DAP fertilizante. La denominación «grado alimentario» exige una especificación, trazabilidad y documentación correspondientes al origen concreto.",
        "reference": "https://www.fao.org/fileadmin/user_upload/jecfa_additives/docs/Monograph1/Additive-150-m1-corr.pdf",
        "ref_label": "especificación JECFA del fosfato diamónico",
    },
    "food-phosphate-blends": {
        "name": "Mezclas de fosfatos alimentarios", "code": "Composición a medida", "cas": "Según fórmula", "formula": "Mezcla",
        "title": "Mezclas de fosfatos alimentarios a medida | Proveedor B2B",
        "description": "Mezclas de fosfatos alimentarios formuladas según aplicación. Defina función, composición, solubilidad, pH, normativa, documentación y suministro a granel.",
        "summary": "Las mezclas de fosfatos alimentarios combinan ortofosfatos, pirofosfatos o polifosfatos en proporciones definidas para obtener un perfil funcional reproducible. La selección debe partir del alimento, el proceso, la legislación de destino y el resultado técnico esperado.",
        "functions": ["Ajuste de pH y capacidad tampón", "Gestión de proteínas, agua y textura en sistemas compatibles", "Control de velocidad de reacción en sistemas leudantes", "Dispersión, secuestro de iones o estabilización según la composición"],
        "applications": ["Productos cárnicos y preparados proteicos", "Quesos procesados y otras matrices lácteas", "Panificación y mezclas leudantes", "Bebidas, preparados de frutas y aplicaciones técnicas autorizadas"],
        "criteria": ["Composición cualitativa y cuantitativa, sin aceptar nombres comerciales ambiguos", "pH, solubilidad, P₂O₅ y granulometría con métodos acordados", "Ensayos en la fórmula real: agua, sal, proteínas, temperatura y orden de adición", "Declaración de ingredientes, límites legales y etiquetado del mercado de destino"],
        "note": "Una mezcla no es intercambiable con otra por compartir la palabra «fosfato». La composición, el pH y la longitud de cadena determinan su comportamiento.",
        "reference": "https://www.fao.org/gsfaonline/groups/details.html?id=18",
        "ref_label": "grupo de fosfatos de la GSFA del Codex",
    },
    "phosphoric-acid-85": {
        "name": "Ácido fosfórico al 85 %", "code": "E338 / INS 338", "cas": "7664-38-2", "formula": "H₃PO₄",
        "title": "Proveedor de ácido fosfórico 85 % alimentario | E338",
        "description": "Ácido fosfórico al 85 % de grado alimentario (E338) para suministro B2B. Revise concentración, impurezas, envase, documentación y cotización a granel.",
        "summary": "El ácido fosfórico al 85 % de grado alimentario es una disolución concentrada de ácido ortofosfórico utilizada, cuando la normativa lo permite, como acidulante, regulador de la acidez y materia prima para fosfatos alimentarios.",
        "functions": ["Acidificación y ajuste de pH", "Aporte de acidez de perfil limpio en bebidas compatibles", "Materia prima para sales fosfatadas", "Apoyo al control de proceso en aplicaciones alimentarias autorizadas"],
        "applications": ["Bebidas y concentrados", "Azúcar y otros procesos de refinación", "Preparación de fosfatos alimentarios", "Procesos alimentarios que requieran acidificación controlada"],
        "criteria": ["Concentración real de H₃PO₄ y método de ensayo", "Color, claridad, metales y aniones críticos", "Origen térmico o húmedo y nivel de purificación", "Material del envase, compatibilidad, ventilación y clasificación de transporte"],
        "note": "Es corrosivo. La manipulación, el transporte y la selección de materiales deben seguir la SDS vigente y los procedimientos de seguridad de la instalación.",
        "reference": "https://www.fao.org/fileadmin/user_upload/jecfa_additives/docs/Monograph1/Additive-312.pdf",
        "ref_label": "especificación JECFA del ácido fosfórico",
    },
    "monoammonium-phosphate-map": {
        "name": "Fosfato monoamónico (MAP)", "code": "INS 342(i)", "cas": "7722-76-1", "formula": "NH₄H₂PO₄",
        "title": "Proveedor de fosfato monoamónico alimentario | MAP a granel",
        "description": "Fosfato monoamónico (MAP) de grado alimentario, INS 342(i). Consulte pureza, P₂O₅, nitrógeno, pH, COA, embalaje y cotización a granel.",
        "summary": "El fosfato monoamónico de grado alimentario es una sal ácida y soluble que aporta amonio y fosfato. Puede evaluarse como nutriente de levaduras, regulador de la acidez o componente de sistemas leudantes en usos autorizados.",
        "functions": ["Aporte de nitrógeno y fósforo a fermentaciones controladas", "Regulación de la acidez", "Componente ácido de determinados sistemas leudantes", "Fuente de fosfato en mezclas secas compatibles"],
        "applications": ["Fermentación y nutrición de levaduras", "Panificación", "Premezclas alimentarias", "Procesos que requieran un fosfato amónico de reacción más ácida que el DAP"],
        "criteria": ["Ensayo, P₂O₅, nitrógeno y base de cálculo", "pH, humedad, insolubles y granulometría", "Impurezas y límites específicos del país de destino", "Comparación funcional MAP frente a DAP en la formulación real"],
        "note": "No debe confundirse con el MAP fertilizante. Para uso alimentario deben verificarse el grado, el origen, la trazabilidad y los documentos del lote.",
        "reference": "https://www.fao.org/fileadmin/user_upload/jecfa_additives/docs/Monograph1/Additive-023.pdf",
        "ref_label": "especificación JECFA del fosfato monoamónico",
    },
    "sodium-diacetate": {
        "name": "Diacetato de sodio", "code": "E262(ii) / INS 262(ii)", "cas": "126-96-5", "formula": "CH₃COONa · CH₃COOH",
        "title": "Proveedor de diacetato de sodio alimentario | E262(ii)",
        "description": "Diacetato de sodio E262(ii) de grado alimentario para formulaciones autorizadas. Consulte composición, pH, COA, embalaje y suministro a granel.",
        "summary": "El diacetato de sodio es un complejo de acetato de sodio y ácido acético. En alimentos autorizados puede actuar como regulador de la acidez, conservante y aportador de una nota avinagrada, especialmente en formulaciones secas o saladas.",
        "functions": ["Regulación de la acidez y efecto tampón", "Apoyo al control de determinados microorganismos", "Aporte de sabor avinagrado", "Ingrediente seco para sistemas de conservación validados"],
        "applications": ["Aperitivos y condimentos en polvo", "Panificación", "Productos cárnicos procesados", "Salsas, aderezos y comidas preparadas"],
        "criteria": ["Proporción de acetato de sodio y ácido acético libre", "pH, humedad, olor y fluidez", "Forma física y homogeneidad en premezclas", "Validación microbiológica, sensorial y legal en el alimento final"],
        "note": "La eficacia conservante depende del pH, la actividad de agua, el proceso, el envase y el resto de barreras; no debe inferirse a partir de la dosis de forma aislada.",
        "reference": "https://www.fao.org/gsfaonline/additives/details.html?id=253",
        "ref_label": "entrada del diacetato de sodio en la GSFA del Codex",
    },
    "sodium-benzoate": {
        "name": "Benzoato de sodio", "code": "E211 / INS 211", "cas": "532-32-1", "formula": "C₇H₅NaO₂",
        "title": "Proveedor de benzoato de sodio alimentario | E211 a granel",
        "description": "Benzoato de sodio E211 de grado alimentario, en polvo o granular. Revise pureza, forma física, documentación, embalaje y cotización a granel.",
        "summary": "El benzoato de sodio es la sal sódica del ácido benzoico y un conservante utilizado principalmente en alimentos y bebidas ácidos. Su rendimiento depende del pH y debe verificarse dentro de un sistema de conservación completo.",
        "functions": ["Control de levaduras, mohos y determinadas bacterias en medios ácidos", "Apoyo a la estabilidad durante la vida útil", "Alternativa soluble al ácido benzoico", "Uso individual o combinado cuando la normativa y la validación lo permitan"],
        "applications": ["Bebidas y concentrados ácidos", "Salsas, aderezos y encurtidos", "Preparados de frutas", "Otras categorías autorizadas por el mercado de destino"],
        "criteria": ["Pureza, humedad, acidez/alcalinidad e impurezas", "Polvo, gránulo o forma de baja generación de polvo", "pH y composición completa de la aplicación", "Límites de uso, etiquetado y posibles interacciones en la fórmula"],
        "note": "No es adecuado describirlo como solución universal. Deben validarse el pH, la dosis legal, el proceso, el envase y la vida útil del producto terminado.",
        "reference": "https://www.fao.org/fileadmin/user_upload/jecfa_additives/docs/Monograph1/Additive-393.pdf",
        "ref_label": "especificación JECFA del benzoato de sodio",
    },
    "calcium-sorbate": {
        "name": "Sorbato de calcio", "code": "E203 / INS 203", "cas": "7492-55-9", "formula": "C₁₂H₁₄CaO₄",
        "title": "Proveedor de sorbato de calcio alimentario | E203 a granel",
        "description": "Sorbato de calcio E203 de grado alimentario para mercados donde esté autorizado. Consulte pureza, normativa de destino, COA, embalaje y cotización.",
        "summary": "El sorbato de calcio es la sal cálcica del ácido sórbico. Históricamente se ha empleado como conservante contra mohos y levaduras, pero su situación regulatoria no es uniforme y debe comprobarse antes de cualquier compra o formulación.",
        "functions": ["Actividad frente a mohos y levaduras en condiciones adecuadas", "Fuente sólida de sorbato para aplicaciones específicas", "Apoyo a sistemas de conservación autorizados", "Alternativa técnica sujeta a solubilidad y normativa"],
        "applications": ["Solo categorías expresamente autorizadas en el país de venta", "Ensayos comparativos con ácido sórbico o sorbato de potasio", "Sistemas donde la forma cálcica aporte una ventaja validada", "Desarrollo para mercados no sujetos a la normativa de la Unión Europea"],
        "criteria": ["Autorización vigente en cada mercado y categoría alimentaria", "Ensayo, humedad, impurezas y método de análisis", "Solubilidad y distribución en la matriz", "Validación de eficacia, etiquetado y vida útil"],
        "note": "Atención regulatoria: la Unión Europea retiró el sorbato cálcico E203 de las listas de aditivos alimentarios autorizados en 2018. No se debe ofrecer para alimentos destinados a la UE sin una revisión legal actualizada.",
        "reference": "https://eur-lex.europa.eu/eli/reg/2018/98/oj",
        "ref_label": "Reglamento (UE) 2018/98 sobre el sorbato cálcico",
    },
    "silicon-dioxide": {
        "name": "Dióxido de silicio (sílice)", "code": "E551 / INS 551", "cas": "7631-86-9", "formula": "SiO₂",
        "title": "Proveedor de dióxido de silicio alimentario | E551",
        "description": "Dióxido de silicio E551 de grado alimentario para uso antiaglomerante. Revise tipo de sílice, humedad, granulometría, COA y suministro a granel.",
        "summary": "El dióxido de silicio amorfo de grado alimentario, también denominado sílice alimentaria, se utiliza como antiaglomerante o auxiliar de flujo en productos secos cuando la legislación lo permite.",
        "functions": ["Reducción del apelmazamiento en polvos", "Mejora del flujo durante mezcla, dosificación y envasado", "Adsorción controlada de humedad o líquidos en premezclas", "Soporte de homogeneidad en ingredientes secos"],
        "applications": ["Condimentos, especias y mezclas en polvo", "Bebidas instantáneas y premezclas", "Sales, azúcares y polvos higroscópicos", "Ingredientes y complementos alimenticios autorizados"],
        "criteria": ["Sílice amorfa precipitada, gel de sílice u otra forma especificada", "Pérdida por secado, pérdida por ignición y pureza", "Granulometría, densidad aparente y capacidad de adsorción", "Comportamiento de flujo en el producto real y límites regulatorios"],
        "note": "La identidad y el grado importan: una ficha de «dióxido de silicio» genérica no demuestra por sí sola que el material sea apto para uso alimentario.",
        "reference": "https://www.fao.org/fileadmin/user_upload/jecfa_additives/docs/monograph17/additive-385-m17.pdf",
        "ref_label": "especificación JECFA del dióxido de silicio",
    },
    "gellan-gum": {
        "name": "Goma gellan", "code": "E418 / INS 418", "cas": "71010-52-1", "formula": "Polisacárido de fermentación",
        "title": "Proveedor de goma gellan alimentaria | E418 alto y bajo acilo",
        "description": "Goma gellan E418 de grado alimentario, de alto o bajo acilo. Compare textura, hidratación, fuerza de gel, documentación, embalaje y cotización a granel.",
        "summary": "La goma gellan es un hidrocoloide obtenido por fermentación. Las variantes de alto y bajo acilo ofrecen perfiles de textura distintos, por lo que la elección debe basarse en la matriz, los iones, el pH, el proceso térmico y la experiencia sensorial buscada.",
        "functions": ["Gelificación y formación de estructura", "Suspensión de partículas, minerales o cacao", "Estabilización y control de separación", "Ajuste de textura con niveles de uso reducidos"],
        "applications": ["Bebidas vegetales, lácteas y bebidas con partículas", "Preparados de frutas, mermeladas y rellenos", "Postres y productos de confitería", "Salsas y otras formulaciones que requieran suspensión o gel"],
        "criteria": ["Alto acilo para texturas más blandas y elásticas; bajo acilo para geles más firmes", "Condiciones de hidratación, temperatura y orden de adición", "Sensibilidad a calcio y otros iones, pH y sólidos solubles", "Fuerza de gel, viscosidad, microbiología y disolventes residuales"],
        "note": "La fuerza de gel no debe compararse entre proveedores sin acordar previamente el método, la concentración, el agua, los iones y la temperatura de ensayo.",
        "reference": "https://www.fao.org/fileadmin/user_upload/jecfa_additives/docs/monograph16/additive-199-m16.pdf",
        "ref_label": "especificación JECFA de la goma gellan",
    },
}


def items(values: list[str]) -> str:
    return "".join(f"<li>{h.escape(value)}</li>" for value in values)


def schema(slug: str, p: dict[str, object]) -> str:
    url = f"{BASE}/es/products/food-ingredients/{slug}.html"
    data = {"@context": "https://schema.org", "@graph": [
        {"@type": "WebPage", "@id": url + "#webpage", "url": url, "name": p["title"], "description": p["description"], "inLanguage": "es", "dateModified": "2026-08-08"},
        {"@type": "Product", "@id": url + "#product", "name": p["name"], "description": p["summary"], "category": "Ingredientes alimentarios", "brand": {"@type": "Brand", "name": "Bespring Chemical"}, "url": url},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Inicio", "item": f"{BASE}/es/index.html"},
            {"@type": "ListItem", "position": 2, "name": "Productos", "item": f"{BASE}/es/products.html"},
            {"@type": "ListItem", "position": 3, "name": "Ingredientes alimentarios", "item": f"{BASE}/es/products/food-ingredients.html"},
            {"@type": "ListItem", "position": 4, "name": p["name"]},
        ]},
    ]}
    return json.dumps(data, ensure_ascii=False, separators=(",", ":"))


def page(slug: str, p: dict[str, object]) -> str:
    en_url = f"{BASE}/products/food-ingredients/{slug}.html"
    es_url = f"{BASE}/es/products/food-ingredients/{slug}.html"
    name = h.escape(str(p["name"])); title = h.escape(str(p["title"])); desc = h.escape(str(p["description"]), quote=True)
    return f'''<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><meta name="description" content="{desc}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="canonical" href="{es_url}"><link rel="alternate" hreflang="en" href="{en_url}"><link rel="alternate" hreflang="es" href="{es_url}"><link rel="alternate" hreflang="x-default" href="{en_url}">
<meta property="og:type" content="product"><meta property="og:site_name" content="Bespring Chemical"><meta property="og:locale" content="es_ES"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{es_url}"><meta property="og:image" content="{BASE}/images/food-ingredients-og-en-2026.jpg"><meta property="og:image:alt" content="Ingredientes alimentarios para suministro B2B"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{title}"><meta name="twitter:description" content="{desc}">
<link rel="icon" href="../../../images/favicon.ico"><link rel="preload" as="image" href="../../../images/food-ingredients.jpg" fetchpriority="high"><link rel="stylesheet" href="../../../css/style.css"><link rel="stylesheet" href="../../../css/site-pages.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"><script type="application/ld+json">{schema(slug,p)}</script></head>
<body class="editorial-page"><div class="bs-seo-topbar"><div class="container bs-seo-topbar-container"><div class="bs-seo-topbar-left"><span class="bs-seo-highlight"><i class="fas fa-industry"></i> Suministro B2B de ingredientes alimentarios</span><span class="bs-seo-divider">|</span><span><i class="fas fa-globe"></i> Exportación internacional</span></div><div class="bs-seo-topbar-right"><a href="mailto:info@bespringchem.com">info@bespringchem.com</a><a href="tel:+8613914896109">+86 139 1489 6109</a></div></div></div>
<header class="site-header"><div class="container nav-container"><div class="logo"><a href="../../index.html"><img src="../../../images/logo.png" alt="Bespring Chemical"></a></div><nav class="main-nav" aria-label="Navegación principal"><ul><li><a href="../../index.html">Inicio</a></li><li><a href="../../about/company-profile.html">Nosotros</a></li><li><a href="../../products.html" aria-current="page">Productos</a></li><li><a href="../../services.html">Servicios</a></li><li><a href="../../news.html">Noticias</a></li><li><a href="../../contact.html" class="btn-nav">Contacto</a></li></ul></nav><button class="hamburger" aria-label="Abrir el menú de navegación" aria-expanded="false"><i class="fas fa-bars"></i></button></div></header>
<main><article><header class="ep-hero" style="--ep-image:url('../../../images/foodadditivesbanner.jpg')"><div class="container"><nav class="ep-breadcrumb" aria-label="Migas de pan"><ol><li><a href="../../index.html">Inicio</a></li><li><a href="../../products.html">Productos</a></li><li><a href="../food-ingredients.html">Ingredientes alimentarios</a></li><li aria-current="page">{name}</li></ol></nav><p class="ep-eyebrow">Ingrediente de grado alimentario · {h.escape(str(p['code']))}</p><h1>{name}</h1><p class="ep-hero__lead">{h.escape(str(p['summary']))}</p></div></header>
<div class="container article-layout"><div class="article-body"><p class="lead"><strong>{name}</strong> · CAS {h.escape(str(p['cas']))} · {h.escape(str(p['code']))} · {h.escape(str(p['formula']))}</p>
<h2>Qué es y cómo especificarlo</h2><p>{h.escape(str(p['summary']))}</p><p>Para una compra industrial, el nombre comercial no basta. Solicite la especificación vigente del origen propuesto, los métodos de ensayo, un COA representativo y el COA del lote. La conformidad debe evaluarse frente a la aplicación, la norma acordada y el país donde se comercializará el alimento.</p>
<h2>Funciones principales</h2><ul>{items(p['functions'])}</ul>
<h2>Aplicaciones que conviene evaluar</h2><ul>{items(p['applications'])}</ul><p>Estas aplicaciones son orientativas, no autorizaciones generales ni recomendaciones de dosificación. La idoneidad técnica y legal debe confirmarse en el producto terminado.</p>
<h2>Criterios de selección para compras B2B</h2><ul>{items(p['criteria'])}</ul><p>{h.escape(str(p['note']))}</p>
<h2>Documentación, embalaje y logística</h2><p>Para homologar al proveedor, pida especificación firmada, TDS, SDS, modelo de COA, declaraciones regulatorias y certificados aplicables al producto, planta y periodo de suministro. Confirme peso neto, material del envase y del revestimiento interior, paletización, marcas, vida útil, condiciones de almacenamiento, puerto de destino e Incoterm.</p>
<h2>Referencia técnica independiente</h2><p>Consulte la <a href="{h.escape(str(p['reference']), quote=True)}" target="_blank" rel="noopener noreferrer">{h.escape(str(p['ref_label']))}</a> como referencia de identidad o contexto regulatorio. La especificación contractual y la legislación vigente del mercado de destino prevalecen para cada operación.</p>
<h2>Preguntas frecuentes</h2><details open><summary>¿Qué información debo incluir para solicitar una cotización?</summary><p>Indique aplicación, norma y límites críticos, cantidad anual y por envío, embalaje, destino, Incoterm, certificados y fecha requerida. Así se puede comparar una oferta técnicamente equivalente.</p></details><details><summary>¿Cómo se confirma que el producto es de grado alimentario?</summary><p>Mediante la especificación del origen exacto, la documentación del sistema de calidad, las declaraciones aplicables y el COA del lote. El nombre del producto por sí solo no demuestra el grado.</p></details><details><summary>¿Puede usarse en cualquier alimento y país?</summary><p>No. Deben comprobarse la categoría alimentaria, la función, el límite de uso y el etiquetado conforme a la normativa vigente del país de destino.</p></details>
</div><aside class="article-sidebar"><h2>Solicitar especificación y cotización</h2><p>Incluya producto, grado, límites críticos, cantidad, embalaje y destino.</p><a href="../../contact.html">Enviar requisitos &rarr;</a><a href="../food-ingredients.html">Ver ingredientes alimentarios &rarr;</a><p><strong>Identificación</strong><br>CAS {h.escape(str(p['cas']))}<br>{h.escape(str(p['code']))}</p></aside></div></article></main>
<footer class="crc-footer"><div class="container footer-grid"><div class="footer-col"><h3>Bespring Chemical</h3><p>Proveedor de ingredientes alimentarios, aditivos para piensos y productos químicos industriales.</p></div><div class="footer-col footer-links"><h3>Enlaces rápidos</h3><ul><li><a href="../../products.html">Productos</a></li><li><a href="../../services.html">Servicios</a></li><li><a href="../../news.html">Noticias</a></li></ul></div><div class="footer-col"><h3>Contacto</h3><p><a href="tel:+8613914896109">+86 139 1489 6109</a></p><p><a href="mailto:info@bespringchem.com">info@bespringchem.com</a></p><a href="../../contact.html" class="contact-btn-footer">Solicitar información</a></div></div><div class="footer-bottom">&copy; 2026 Bespring Chemical Co., Ltd. Todos los derechos reservados.</div></footer><script>const b=document.querySelector(".hamburger"),n=document.querySelector(".main-nav");b?.addEventListener("click",()=>{{const o=n.classList.toggle("active");b.setAttribute("aria-expanded",String(o))}});</script></body></html>'''


def add_spanish_hreflang(slug: str) -> None:
    path = ROOT / "products" / "food-ingredients" / f"{slug}.html"
    rel = path.relative_to(ROOT).as_posix()
    original = subprocess.run(
        ["git", "show", f"HEAD:{rel}"], cwd=ROOT, check=True,
        stdout=subprocess.PIPE,
    ).stdout.decode("utf-8")
    es_url = f"{BASE}/es/products/food-ingredients/{slug}.html"
    link = f'<link rel="alternate" hreflang="es" href="{es_url}">'
    if 'hreflang="es"' not in original:
        marker = '<link rel="alternate" hreflang="x-default"'
        original = original.replace(marker, link + marker, 1)
    path.write_text(original, encoding="utf-8")


def main() -> None:
    out = ROOT / "es" / "products" / "food-ingredients"
    out.mkdir(parents=True, exist_ok=True)
    for slug, product in PRODUCTS.items():
        (out / f"{slug}.html").write_text(page(slug, product), encoding="utf-8")
        add_spanish_hreflang(slug)
    builder = importlib.import_module("build_industry_application_pages")
    builder.rebuild_sitemap()
    print(f"Built {len(PRODUCTS)} Spanish product pages and rebuilt sitemap.xml")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Build and post-edit the 172 requested pt-BR product dossiers."""

from __future__ import annotations

import importlib
import sys
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build_spanish_product_pages as scope
import localize_new_pages as localizer
import polish_portuguese_new_pages as portuguese


CATEGORIES = {
    "food-ingredients": {
        "label": "Ingredientes alimentícios",
        "grade": "grau alimentício",
        "title": "Fornecedor de {name} de grau alimentício | Bespring",
    },
    "animal-nutrition": {
        "label": "Nutrição animal",
        "grade": "grau para alimentação animal",
        "title": "Fornecedor de {name} para nutrição animal | Bespring",
    },
    "home-care-industrial-cleaning": {
        "label": "Limpeza doméstica e industrial",
        "grade": "grau técnico para formulação",
        "title": "Fornecedor de {name} para limpeza industrial | Bespring",
    },
    "water-treatment": {
        "label": "Tratamento de água",
        "grade": "grau para tratamento de água",
        "title": "Fornecedor de {name} para tratamento de água | Bespring",
    },
    "agricultural-fertilizers": {
        "label": "Fertilizantes agrícolas",
        "grade": "grau fertilizante",
        "title": "Fornecedor de {name} de grau fertilizante | Bespring",
    },
    "mining": {
        "label": "Mineração",
        "grade": "grau industrial para mineração",
        "title": "Fornecedor de {name} para mineração | Bespring",
    },
}

SEO_NAMES = {
    "datem": "DATEM",
    "caustic-potash-potassium-hydroxide": "potassa cáustica (KOH)",
    "labsa": "LABSA",
    "inorganic-organic-coagulant-blends": "misturas de coagulantes",
}

TERM_FIXES = [
    ("Ingredente", "Ingrediente"),
    ("Resposta directa ao produto", "Resposta direta sobre o produto"),
    ("Guia de intenção do comprador", "Guia de compras"),
    ("Guia de comprador-intent", "Guia de compras"),
    ("Rastreamento da aplicação", "Avaliação da aplicação"),
    ("Como comprar Apple Cider Vinagre em massa", "Como comprar vinagre de maçã a granel"),
    ("Apple Cider Vinagre guia de aplicação de alimentos", "Guia de aplicação do vinagre de maçã em alimentos"),
    ("Apple Cider Vinagre", "vinagre de maçã"),
    ("Como fonte ", "Como comprar "),
    ("Como obter ", "Como comprar "),
    ("áreas de triagem técnica", "áreas de avaliação técnica"),
    ("áreas de triagem", "áreas de avaliação"),
    ("perguntas de aquisição de cauda longa", "consultas específicas de compra"),
    ("Estado líquido ou em pó", "Informe se é necessária a forma líquida ou em pó"),
    ("Estado líquido ou pó", "Informe se é necessária a forma líquida ou em pó"),
    ("Estado identidade exata", "Informe a identidade exata"),
    ("Indicar a ", "Informe a "),
    ("Indicar o ", "Informe o "),
    ("Compartilhar identidade", "Informe a identidade"),
    ("Compartilhar análise", "Forneça a análise"),
    ("Compartilhar formulário", "Informe a forma"),
    ("Compartilhar forma", "Informe a forma"),
    ("Compartilhar química", "Informe a composição química"),
    ("Compartilhar a ", "Informe a "),
    ("Compartilhar o ", "Informe o "),
    ("Partilhar a ", "Informe a "),
    ("Partilhar o ", "Informe o "),
    ("Compartilhe o ", "Informe o "),
    ("Compartilhe a ", "Informe a "),
    ("Compartilhe forma exata", "Informe a forma exata"),
    ("deve ser qualificado", "deve ser verificado"),
    ("devem ser qualificados", "devem ser verificados"),
    ("qualificação preliminar", "avaliação preliminar"),
    ("qualificação de aquisição", "avaliação para compras"),
    ("qualificação do fornecedor", "homologação do fornecedor"),
    ("fonte do fabricante", "fabricante"),
    ("oferta de distribuidor", "oferta de um distribuidor"),
    ("distribuidor oferta", "oferta de um distribuidor"),
    ("fonte fabricante China", "fabricante ou fornecedor da China"),
    ("fonte fabricante", "fabricante"),
    ("fornecedor China", "fornecedor da China"),
    ("fabricante aditivo de alimentação", "fabricante de aditivos para rações"),
    ("cotação a granel", "cotação para fornecimento a granel"),
    ("preço bruto", "preço a granel"),
    ("grau de alimentação", "grau para alimentação animal"),
    ("grau alimentado", "grau para alimentação animal"),
    ("qualidade de alimentação", "grau para alimentação animal"),
    ("qualidade alimentar", "grau alimentício"),
    ("classe de alimento", "grau para alimentação animal"),
    ("categoria de alimentação", "categoria de ração"),
    ("tipo de alimento", "tipo de ração"),
    ("alimentos compostos", "rações compostas"),
    ("alimentos para animais", "rações animais"),
    ("alimento acabado", "produto alimentício acabado"),
    ("Feed Grade", "Grau para alimentação animal"),
    ("tipo de alimentação", "tipo de ração"),
    ("formulação completa de alimentos", "formulação completa da ração"),
    ("instruções de alimentação", "instruções de uso em rações"),
    ("regras de alimentação", "normas aplicáveis a rações"),
    ("guia de aplicação para alimentação", "guia de aplicação em rações"),
    ("alimentação de alimentos para animais", "uso em rações animais"),
    ("taxa de inclusão", "nível de inclusão"),
    ("uniformidade misturadora", "uniformidade da mistura"),
    ("pré-misturaes", "pré-misturas"),
    ("água fonte", "água de origem"),
    ("dados fonte-água", "dados da água de origem"),
    ("esclarecimento de água", "clarificação da água"),
    ("Tratamento de água química", "Produto químico para tratamento de água"),
    ("faixa operacional", "faixa operacional"),
    ("direções operacionais", "instruções operacionais"),
    ("reivindicações de eficácia", "alegações de eficácia"),
    ("regem a ordem", "regem o pedido"),
    ("fornecido pelas vendas", "fornecido pela equipe comercial"),
    ("processo completo de alimentos", "processo alimentício completo"),
    ("regras de destino-mercado", "regras do mercado de destino"),
    ("fonte exata, função pretendida", "origem exata, função pretendida"),
    ("fornecido por vendas", "fornecido pela equipe comercial"),
    ("suporta a", "serve para a"),
    ("ingredientes transportadores", "carreadores"),
    ("necessidades de transporte", "necessidades de carreador"),
    ("identidade do portador", "identidade do carreador"),
    ("ajudas de fluxo", "agentes antiaglomerantes"),
    ("auxiliares de fluxo", "agentes antiaglomerantes"),
    ("alergénio", "alergênicos"),
    ("gama de dosagem", "faixa de dosagem"),
    ("certificado em lote", "COA do lote"),
    ("COA representativa", "COA representativo"),
    ("Apple Cider Vinegar", "vinagre de maçã"),
    ("polyaluminum Chloride", "policloreto de alumínio"),
    ("envelope operacional", "faixa operacional"),
    ("Produtos químicos de tratamento de água", "Produto químico para tratamento de água"),
    ("Mineração química", "Produto químico para mineração"),
    ("Família coletor", "Família de coletores"),
    ("xantathes", "xantatos"),
    ("Xantathes", "Xantatos"),
    ("xanthates", "xantatos"),
    ("Xanthates", "Xantatos"),
    ("bulk xantatos", "xantatos a granel"),
    ("bulk ", "a granel "),
    ("tempo de condução", "prazo de entrega"),
    ("equipementos", "equipamentos"),
    ("mineralogia, liberação, celulose e química", "mineralogia, liberação, química da polpa e"),
    ("triagem de aquisição", "avaliação para compras"),
    ("áreas de trabalho de teste", "áreas de ensaio"),
    ("aprovações de autorização", "autorizações regulatórias"),
    ("certificado em lote", "COA do lote"),
    ("Soda Ash", "barrilha"),
    ("cinza de soda", "barrilha"),
    ("soda cáustica", "soda cáustica"),
    ("Mono propilenoglicol", "monopropilenoglicol"),
    ("Dithiophosphate", "ditiofosfato"),
    ("Xanthates", "xantatos"),
]


def parse(path: Path):
    return html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))


def direct_text(node) -> str:
    return " ".join(node.text_content().split())


def product_names() -> dict[tuple[str, str], str]:
    names = {}
    for category in CATEGORIES:
        doc = parse(ROOT / "pt" / "products" / f"{category}.html")
        for node in doc.xpath("//li[@data-product]"):
            anchors = node.xpath("./a")
            if anchors:
                names[(category, Path(anchors[0].get("href")).stem)] = direct_text(node)
            key = (node.get("data-product") or "").rsplit(" | ", 1)[-1]
            names.setdefault((category, key), direct_text(node))
    return names


def listing_name(category: str, slug: str, names: dict[tuple[str, str], str]) -> str:
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
    value = portuguese.polish(value)
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
        h1[0].text = display_name[0].upper() + display_name[1:]
    breadcrumb = doc.xpath("//main//nav//li[@aria-current='page']")
    if breadcrumb:
        breadcrumb[-1].text = display_name

    seo_name = SEO_NAMES.get(Path(rel).stem, display_name)
    title = config["title"].format(name=seo_name)
    description = localizer.shorten_at_word(
        f"Solicite especificação, COA, documentação, embalagem e cotação de {display_name} "
        f"{config['grade']} para compras B2B e fornecimento internacional.", 180
    )
    portuguese.set_metadata(doc, title, description)
    overview = doc.xpath("//*[@id='overview']//h2")
    if overview:
        overview[0].text = f"O que é {display_name} e como especificá-lo?"
    faq = doc.xpath("//*[@id='faq']//h2")
    if faq:
        faq[0].text = f"Perguntas frequentes sobre {display_name}"
    quote = doc.xpath("//*[@id='request-quote']//h2")
    if quote:
        quote[0].text = f"Solicite especificação e cotação de {display_name}"

    source_doc = parse(ROOT / rel)
    source_scripts = source_doc.xpath("//script[@type='application/ld+json']")
    for index, script in enumerate(doc.xpath("//script[@type='application/ld+json']")):
        if not script.text:
            continue
        data = localizer.json.loads(script.text)
        if index < len(source_scripts) and source_scripts[index].text:
            source_data = localizer.json.loads(source_scripts[index].text)
            data = portuguese.translate_schema_from_source(source_data, data, mapping)

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
                    value["inLanguage"] = "pt-BR"
                for child in value.values():
                    walk(child)
            elif isinstance(value, list):
                for child in value:
                    walk(child)

        walk(data)
        script.text = localizer.json.dumps(
            portuguese.polish_json(data), ensure_ascii=False, separators=(",", ":")
        )
    localizer.write_html(path, doc)


def sync_index(category: str) -> None:
    source = parse(ROOT / "products" / f"{category}.html")
    target_path = ROOT / "pt" / "products" / f"{category}.html"
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
    localizer.ACTIVE_LANGS = ["es", "pt"]
    rels = scope.english_sources()
    missing = [rel for rel in rels if not (ROOT / "pt" / rel).exists()]
    print(f"English dossiers: {len(rels)}; existing Portuguese: {len(rels) - len(missing)}; to create: {len(missing)}")
    cache = localizer.load_cache()
    if missing:
        docs = [parse(ROOT / rel) for rel in missing]
        strings = set().union(*(localizer.collect_strings(doc) for doc in docs))
        strings.add("Language selection")
        localizer.seed_parallel_translation_memory(cache, ["pt"])
        localizer.populate_translations(strings, cache, ["pt"])
        localizer.save_cache(cache)

    names = product_names()
    for rel in missing:
        localizer.update_english_seo(rel)
        localizer.localize_page(rel, "pt", cache["pt"])
    for rel in rels:
        category, slug = rel.split("/")[1], Path(rel).stem
        polish_page(ROOT / "pt" / rel, rel, listing_name(category, slug, names), cache["pt"])
        localizer.update_existing_locale_seo(rel, "es")

    for category in CATEGORIES:
        sync_index(category)
    builder = importlib.import_module("build_industry_application_pages")
    builder.rebuild_sitemap()
    print(
        f"Created {len(missing)} and post-edited {len(rels)} Portuguese product pages; "
        "synchronized six indexes, reciprocal hreflang and sitemap."
    )


if __name__ == "__main__":
    main()

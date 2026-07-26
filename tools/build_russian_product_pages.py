#!/usr/bin/env python3
"""Build and post-edit the 172 requested Russian product dossiers."""

from __future__ import annotations

import importlib
import sys
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build_spanish_product_pages as scope
import localize_new_pages as localizer
import polish_russian_new_pages as russian


CATEGORIES = {
    "food-ingredients": {
        "label": "Пищевые ингредиенты",
        "grade": "пищевого качества",
        "title": "{name} пищевого качества — поставщик | Bespring",
    },
    "animal-nutrition": {
        "label": "Кормовые ингредиенты",
        "grade": "кормового качества",
        "title": "{name} кормового качества — поставщик | Bespring",
    },
    "home-care-industrial-cleaning": {
        "label": "Бытовая и промышленная химия",
        "grade": "технического качества",
        "title": "{name} для промышленной очистки — поставщик | Bespring",
    },
    "water-treatment": {
        "label": "Водоподготовка",
        "grade": "для водоподготовки",
        "title": "{name} для водоподготовки — поставщик | Bespring",
    },
    "agricultural-fertilizers": {
        "label": "Сырьё для удобрений",
        "grade": "для производства удобрений",
        "title": "{name} для удобрений — поставщик | Bespring",
    },
    "mining": {
        "label": "Горнодобывающая промышленность",
        "grade": "технического качества для горной промышленности",
        "title": "{name} для горной промышленности — поставщик | Bespring",
    },
}

SEO_NAMES = {
    "datem": "DATEM",
    "caustic-potash-potassium-hydroxide": "гидроксид калия (KOH)",
    "labsa": "LABSA",
    "inorganic-organic-coagulant-blends": "смесей коагулянтов",
}

PRODUCT_NAMES = {
    "ferric-chloride": "Хлорид железа(III)",
    "ferrous-chloride": "Хлорид железа(II)",
    "ferric-sulfate": "Сульфат железа(III)",
    "ferrous-sulfate": "Сульфат железа(II)",
    "quick-lime-hydrated-lime": "Негашёная / гашёная известь",
    "xanthates-pax-sipx-sibx": "Ксантогенаты (PAX, SIPX, SIBX и др.)",
    "polyaluminum-chloride-pac": "Полиалюминийхлорид (PAC)",
}

TERM_FIXES = [
    ("Прямой ответ на продукт", "Кратко о продукте"),
    ("Прямой ответ продукта", "Кратко о продукте"),
    ("Ответ прямого продукта", "Кратко о продукте"),
    ("Снимок закупок", "Краткая информация для закупки"),
    ("Руководство для покупателей", "Руководство для закупщика"),
    ("Руководство покупателя-намерения", "Руководство для закупщика"),
    ("Руководство покупателя", "Руководство для закупщика"),
    ("Как источник ", "Как купить "),
    ("Как исходить ", "Как купить "),
    ("Как получить ", "Как купить "),
    ("области скрининга", "области предварительной оценки"),
    ("технический скрининг", "техническая оценка"),
    ("длиннохвостые вопросы закупок", "целевые закупочные запросы"),
    ("вопросы о закупках с длинным хвостом", "целевые закупочные запросы"),
    ("вопросы закупок", "критерии закупки"),
    ("Поделиться точной ", "Укажите точную "),
    ("Поделиться точным ", "Укажите точный "),
    ("Поделитесь точной ", "Укажите точную "),
    ("Поделитесь точным ", "Укажите точный "),
    ("Поделитесь ", "Укажите "),
    ("Делитесь точной ", "Укажите точную "),
    ("Делитесь точным ", "Укажите точный "),
    ("Делитесь ", "Укажите "),
    ("Разделите ", "Предоставьте "),
    ("Поделиться ", "Укажите "),
    ("Государственная точная", "Укажите точную"),
    ("Государственный точный", "Укажите точный"),
    ("должны быть квалифицированы", "необходимо проверить"),
    ("должна быть квалифицирована", "необходимо проверить"),
    ("предварительная квалификация", "предварительная оценка"),
    ("квалификация закупок", "оценка для закупки"),
    ("квалификация поставщика", "аттестация поставщика"),
    ("источник производителя", "производитель"),
    ("поставщик Китая", "поставщик из Китая"),
    ("дистрибьюторское предложение", "предложение дистрибьютора"),
    ("массовая котировка", "коммерческое предложение на оптовую поставку"),
    ("оптовой котировки", "коммерческого предложения на оптовую поставку"),
    ("массовая цена", "оптовая цена"),
    ("объемный ", "оптовый "),
    ("объемные ", "оптовые "),
    ("пищевой класс", "пищевое качество"),
    ("кормовой класс", "кормовое качество"),
    ("кормового класса", "кормового качества"),
    ("кормовой сорт", "кормовое качество"),
    ("класс корма", "кормовое качество"),
    ("класс питания", "кормовое качество"),
    ("тип питания", "тип корма"),
    ("категорией кормов", "видом корма"),
    ("сложный корм", "комбикорм"),
    ("комплексный корм", "комбикорм"),
    ("премикс", "премикс"),
    ("коэффициент включения", "норма ввода"),
    ("смешивающая однородность", "однородность смешивания"),
    ("единообразие смешивания", "однородность смешивания"),
    ("правила кормления", "требования к кормам"),
    ("полный состав корма", "полная рецептура корма"),
    ("полного рациона питания", "полного рациона"),
    ("разрешенных диетах животных", "разрешённых рационах животных"),
    ("пищевой функции", "питательной функции"),
    ("исходная вода", "исходная вода"),
    ("поезда лечения", "технологическая схема водоподготовки"),
    ("лечебный поезд", "технологическая схема водоподготовки"),
    ("очистного поезда", "технологической схемы водоподготовки"),
    ("материалов строительства", "конструкционных материалов"),
    ("операционный конверт", "рабочий диапазон"),
    ("операционные направления", "эксплуатационные инструкции"),
    ("заявления об эффективности", "заявленные показатели эффективности"),
    ("управляют заказом", "являются основанием для заказа"),
    ("предоставляется продажами", "предоставляется отделом продаж"),
    ("поставляемые продажами", "предоставляемые отделом продаж"),
    ("регулируют заказ", "являются основанием для заказа"),
    ("полный пищевой процесс", "полный технологический процесс"),
    ("ингредиенты-носители", "носители"),
    ("несущие ингредиенты", "носители"),
    ("Состояние жидкости или порошка", "Укажите жидкую или порошкообразную форму"),
    ("потребности носителя", "требования к носителю"),
    ("расходные материалы", "вспомогательные вещества"),
    ("потоковые средства", "антислеживающие агенты"),
    ("репрезентативный COA", "типовой COA"),
    ("пакетный COA", "COA партии"),
    ("Apple Cider Vinegar", "яблочный уксус"),
    ("полного процесса питания", "полного технологического процесса"),
    ("правил рынка назначения", "требований рынка назначения"),
    ("квалифицировать форму", "проверить форму"),
    ("Запросить конкретную цитату", "Запросите коммерческое предложение"),
    ("окном доставки", "сроком поставки"),
    ("основу формулирования", "основу рецептуры"),
    ("композиционных кормов", "комбикормов"),
    ("правила подачи", "требования к кормам"),
    ("Кислородная аминокислота", "Кормовая аминокислота"),
    ("Polyaluminum Chloride", "полиалюминийхлорид"),
    ("Химическая обработка воды", "Реагент для водоподготовки"),
    ("Полиалюминиевый хлорид", "Полиалюминийхлорид"),
    ("полиалюминиевый хлорид", "полиалюминийхлорид"),
    ("предварительно полимеризованное семейство", "семейство предварительно полимеризованных"),
    ("содержания хлорида, основы", "содержания хлоридов, основности"),
    ("применением воды", "областью применения в водоподготовке"),
    ("точную личность", "точную идентичность"),
    ("применение воды", "назначение водоподготовки"),
    ("рабочую оболочку", "рабочий диапазон"),
    ("квалификация закупок", "оценка для закупки"),
    ("Soda Ash", "кальцинированная сода"),
    ("каустическая сода", "гидроксид натрия"),
    ("Caustic Potash", "гидроксид калия"),
    ("Mono Propylene Glycol", "монопропиленгликоль"),
    ("Dithiophosphate", "дитиофосфат"),
    ("Xanthates", "ксантогенаты"),
    ("xanthates", "ксантогенаты"),
    ("bulk ", "оптовая поставка "),
    ("время выполнения", "срок поставки"),
    ("горнодобывающая химия", "реагент для горной промышленности"),
    ("Горнодобывающая химия", "Реагент для горной промышленности"),
    ("Ксанти", "Ксантогенаты"),
    ("Ксантаты", "Ксантогенаты"),
    ("ксантаты", "ксантогенаты"),
    ("для майнинга", "для горной промышленности"),
    ("сульфидно-минеральных коллекторов", "собирателей для сульфидных минералов"),
    ("сульфидно-минеральный коллектор", "собиратель для сульфидных минералов"),
    ("минералогии, освобождения", "минералогии и степени раскрытия минералов"),
    ("целлюлоза и химия воды", "химия пульпы и оборотной воды"),
    ("химии целлюлозы и рециркулирующей воды", "химии пульпы и оборотной воды"),
    ("реагентов вверх и вниз по течению", "реагентов на предыдущих и последующих стадиях"),
    ("скрининг закупок", "оценку для закупки"),
    ("частную спецификацию", "актуальную спецификацию"),
    ("репрезентативную СОА", "типовой COA"),
    ("стадией текучести", "стадией технологической схемы"),
    ("приобретение скрининга", "оценка для закупки"),
    ("тестовые области", "направления испытаний"),
]


def parse(path: Path):
    return html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))


def direct_text(node) -> str:
    return " ".join(node.text_content().split())


def product_names() -> dict[tuple[str, str], str]:
    names = {}
    for category in CATEGORIES:
        doc = parse(ROOT / "ru" / "products" / f"{category}.html")
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
    value = russian.polish(value)
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
        f"Запросите спецификацию, COA, документацию, упаковку и цену на {display_name} "
        f"{config['grade']} для оптовых закупок и международных поставок.", 180
    )
    russian.set_metadata(doc, title, description)
    overview = doc.xpath("//*[@id='overview']//h2")
    if overview:
        overview[0].text = f"Что представляет собой {display_name} и как составить спецификацию?"
    faq = doc.xpath("//*[@id='faq']//h2")
    if faq:
        faq[0].text = f"Часто задаваемые вопросы: {display_name}"
    quote = doc.xpath("//*[@id='request-quote']//h2")
    if quote:
        quote[0].text = f"Запросить спецификацию и цену на {display_name}"

    source_doc = parse(ROOT / rel)
    source_scripts = source_doc.xpath("//script[@type='application/ld+json']")
    for index, script in enumerate(doc.xpath("//script[@type='application/ld+json']")):
        if not script.text:
            continue
        data = localizer.json.loads(script.text)
        if index < len(source_scripts) and source_scripts[index].text:
            source_data = localizer.json.loads(source_scripts[index].text)
            data = russian.translate_schema_from_source(source_data, data, mapping)

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
                    value["inLanguage"] = "ru"
                for child in value.values():
                    walk(child)
            elif isinstance(value, list):
                for child in value:
                    walk(child)

        walk(data)
        script.text = localizer.json.dumps(
            russian.polish_json(data), ensure_ascii=False, separators=(",", ":")
        )
    localizer.write_html(path, doc)


def sync_index(category: str) -> None:
    source = parse(ROOT / "products" / f"{category}.html")
    target_path = ROOT / "ru" / "products" / f"{category}.html"
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
    localizer.ACTIVE_LANGS = ["es", "pt", "ru"]
    rels = scope.english_sources()
    missing = [rel for rel in rels if not (ROOT / "ru" / rel).exists()]
    print(f"English dossiers: {len(rels)}; existing Russian: {len(rels) - len(missing)}; to create: {len(missing)}")
    cache = localizer.load_cache()
    if missing:
        docs = [parse(ROOT / rel) for rel in missing]
        strings = set().union(*(localizer.collect_strings(doc) for doc in docs))
        strings.add("Language selection")
        localizer.seed_parallel_translation_memory(cache, ["ru"])
        localizer.populate_translations(strings, cache, ["ru"])
        localizer.save_cache(cache)

    names = product_names()
    for rel in missing:
        localizer.update_english_seo(rel)
        localizer.localize_page(rel, "ru", cache["ru"])
    for rel in rels:
        category, slug = rel.split("/")[1], Path(rel).stem
        polish_page(ROOT / "ru" / rel, rel, listing_name(category, slug, names), cache["ru"])
        localizer.update_existing_locale_seo(rel, "es")
        localizer.update_existing_locale_seo(rel, "pt")

    for category in CATEGORIES:
        sync_index(category)
    builder = importlib.import_module("build_industry_application_pages")
    builder.rebuild_sitemap()
    print(
        f"Created {len(missing)} and post-edited {len(rels)} Russian product pages; "
        "synchronized six indexes, reciprocal hreflang and sitemap."
    )


if __name__ == "__main__":
    main()

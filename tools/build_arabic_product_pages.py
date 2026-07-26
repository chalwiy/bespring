#!/usr/bin/env python3
"""Build and post-edit the 172 requested Arabic product dossiers."""

from __future__ import annotations

import importlib
import re
import sys
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build_spanish_product_pages as scope
import localize_new_pages as localizer
import polish_arabic_new_pages as arabic


CATEGORIES = {
    "food-ingredients": {
        "label": "المكونات الغذائية",
        "grade": "بدرجة غذائية",
        "title": "{name} بدرجة غذائية | مورد | Bespring",
    },
    "animal-nutrition": {
        "label": "تغذية الحيوان",
        "grade": "بدرجة علفية",
        "title": "{name} بدرجة علفية | مورد | Bespring",
    },
    "home-care-industrial-cleaning": {
        "label": "التنظيف المنزلي والصناعي",
        "grade": "بدرجة تقنية",
        "title": "{name} للتنظيف الصناعي | مورد | Bespring",
    },
    "water-treatment": {
        "label": "معالجة المياه",
        "grade": "لمعالجة المياه",
        "title": "{name} لمعالجة المياه | مورد | Bespring",
    },
    "agricultural-fertilizers": {
        "label": "المواد الخام للأسمدة",
        "grade": "بدرجة سمادية",
        "title": "{name} للأسمدة | مورد | Bespring",
    },
    "mining": {
        "label": "كيماويات التعدين",
        "grade": "بدرجة تقنية للتعدين",
        "title": "{name} للتعدين | مورد | Bespring",
    },
}

SEO_NAMES = {
    "datem": "DATEM",
    "caustic-potash-potassium-hydroxide": "هيدروكسيد البوتاسيوم (KOH)",
    "labsa": "LABSA",
    "inorganic-organic-coagulant-blends": "خلطات مواد التخثير",
}

PRODUCT_NAMES = {
    "ferric-chloride": "كلوريد الحديديك",
    "ferrous-chloride": "كلوريد الحديدوز",
    "ferric-sulfate": "كبريتات الحديديك",
    "ferrous-sulfate": "كبريتات الحديدوز",
    "quick-lime-hydrated-lime": "الجير الحي / الجير المطفأ",
    "xanthates-pax-sipx-sibx": "الزانثات (PAX وSIPX وSIBX وغيرها)",
    "polyaluminum-chloride-pac": "بولي كلوريد الألومنيوم (PAC)",
}

TERM_FIXES = [
    ("جواب المنتج المباشر", "نبذة مباشرة عن المنتج"),
    ("دليل متعمد للمشتريات", "دليل المشتريات"),
    ("دليل نية المشتريات", "دليل المشتريات"),
    ("قنابل التفاح", "خل التفاح"),
    ("التفاح المُخصبة", "التفاح المخمّر"),
    ("التخمير الكحولي والمخنث", "التخمير الكحولي والخَلّي"),
    ("ينبغي للمشترين أن يؤهلوا", "ينبغي للمشترين التحقق من"),
    ("تقاسم الرتب والتطبيق والكمية والتعبئة والمقصد والوثائق المطلوبة",
     "حدّد الدرجة المطلوبة والتطبيق والكمية والتعبئة وبلد الوجهة والمستندات اللازمة"),
    ("المؤهلات الأولية", "التقييم الأولي"),
    ("التي توفرها المبيعات", "التي يقدمها فريق المبيعات"),
    ("سائل الدولة أو مسحوقها", "حدّد ما إذا كان المطلوب سائلاً أو مسحوقاً"),
    ("حاجات ناقلاتها", "متطلبات المادة الحاملة"),
    ("الوثائق المجهرية", "المستندات الميكروبيولوجية"),
    ("مصدر التفاح", "مصدر التفاح"),
    ("مكونات ناقلات", "مواد حاملة"),
    ("ويعتبر العلاج من مادة الدي إل - ميثيونين", "يُعد DL-ميثيونين بدرجة علفية"),
    ("الأمينو - أيكيد", "الأحماض الأمينية"),
    ("أن يُشفَى على أساس التعادل الإحيائي والتجانس", "التحقق من المحتوى وأساس التكافؤ الحيوي وتجانس الخلط"),
    ("غذاء الحيوانات", "علائق الحيوانات"),
    ("الوجبات الغذائية الكاملة", "التركيبة العلفية الكاملة"),
    ("توصية من فئة الإدراج", "توصية بمعدل الإضافة"),
    ("نافذة التسليم", "مدة التوريد"),
    ("كلوريد بوليالومينوم", "بولي كلوريد الألومنيوم"),
    ("كلوريد البوليلومينوم", "بولي كلوريد الألومنيوم"),
    ("أسرة مسببة للخشخاش من قبل البوليمرات",
     "عائلة من مواد التخثير الألومنيومية مسبقة البلمرة"),
    ("القطار العلاجي", "منظومة المعالجة"),
    ("مواد البناء", "مواد الإنشاء"),
    ("الولاية القضائية", "المتطلبات التنظيمية المحلية"),
    ("مؤهلات الشراء", "التقييم لأغراض الشراء"),
    ("تطبيق المياه", "تطبيق معالجة المياه"),
    ("الزانثات هي أسرة من جامعي السولفيد - العنان",
     "الزانثات عائلة من مجمّعات تعويم معادن الكبريتيد"),
    ("شركة الزانثات", "الزانثات"),
    ("لكل عضو", "ولكل نوع"),
    ("المستوى التجاري الدقيق", "الدرجة التجارية المحددة"),
    ("وعلم المعادن، والتحرير", "والتركيب المعدني ودرجة التحرر"),
    ("كيمياء المياه النقية وإعادة التدوير", "كيمياء اللب ومياه التدوير"),
    ("مفاعلات المجرى المائي", "الكواشف في المراحل السابقة واللاحقة"),
    ("فرز المشتريات", "التقييم لأغراض الشراء"),
    ("تعليمات تشغيل نباتية", "تعليمات تشغيل للمصنع"),
    ("هوية الدولة أو رتبها", "حدّد الهوية والدرجة"),
    ("سعر السائبة", "سعر التوريد بالجملة"),
    ("الإجابة المباشرة للمنتج", "نبذة مباشرة عن المنتج"),
    ("إجابة المنتج المباشر", "نبذة مباشرة عن المنتج"),
    ("لقطة المشتريات", "ملخص للمشتريات"),
    ("دليل نية المشتري", "دليل المشتريات"),
    ("دليل المشتري", "دليل المشتريات"),
    ("كيفية المصدر ", "كيفية شراء "),
    ("كيفية الحصول على ", "كيفية شراء "),
    ("مجالات الفحص", "مجالات التقييم"),
    ("الفحص الفني", "التقييم الفني"),
    ("أسئلة الشراء طويلة الذيل", "عبارات بحث شرائية متخصصة"),
    ("شارك الدرجة الدقيقة", "حدد الدرجة المطلوبة"),
    ("شارك الهوية الدقيقة", "حدد الهوية الدقيقة"),
    ("شارك الشكل الدقيق", "حدد الشكل المطلوب"),
    ("مشاركة الهوية الدقيقة", "حدد الهوية الدقيقة"),
    ("مشاركة ", "حدد "),
    ("يجب أن تكون مؤهلة", "يجب التحقق منها"),
    ("يجب أن يكون مؤهلا", "يجب التحقق منه"),
    ("التأهيل الأولي", "التقييم الأولي"),
    ("تأهيل المشتريات", "التقييم لأغراض الشراء"),
    ("تأهيل المورد", "اعتماد المورد"),
    ("مصدر الشركة المصنعة", "الشركة المصنعة"),
    ("مورد الصين", "مورد من الصين"),
    ("عرض الموزع", "عرض من موزع"),
    ("اقتباس بالجملة", "عرض سعر للتوريد بالجملة"),
    ("سعر بالجملة", "سعر التوريد بالجملة"),
    ("درجة الطعام", "بدرجة غذائية"),
    ("الغذاء الصف", "بدرجة غذائية"),
    ("درجة التغذية", "بدرجة علفية"),
    ("فئة الأعلاف", "نوع العلف"),
    ("معدل الإدراج", "معدل الإضافة"),
    ("توحيد الخلط", "تجانس الخلط"),
    ("قواعد التغذية", "متطلبات الأعلاف"),
    ("تركيبة التغذية الكاملة", "التركيبة العلفية الكاملة"),
    ("قطار المعالجة", "منظومة المعالجة"),
    ("قطارات المعالجة", "منظومات المعالجة"),
    ("المغلف التشغيلي", "نطاق التشغيل"),
    ("الاتجاهات التشغيلية", "تعليمات التشغيل"),
    ("مطالبات الفعالية", "ادعاءات الفعالية"),
    ("تحكم الطلب", "تحكم أمر الشراء"),
    ("المقدمة من المبيعات", "المقدمة من فريق المبيعات"),
    ("عملية الغذاء الكاملة", "عملية التصنيع الغذائي الكاملة"),
    ("مكونات الناقل", "المواد الحاملة"),
    ("مساعدات التدفق", "المواد المساعدة على الانسياب"),
    ("COA تمثيلي", "شهادة تحليل نموذجية"),
    ("دفعة COA", "شهادة تحليل الدفعة"),
    ("Apple Cider Vinegar", "خل التفاح"),
    ("Polyaluminum Chloride", "بولي كلوريد الألومنيوم"),
    ("Soda Ash", "كربونات الصوديوم"),
    ("Caustic Soda", "هيدروكسيد الصوديوم"),
    ("Caustic Potash", "هيدروكسيد البوتاسيوم"),
    ("Mono Propylene Glycol", "أحادي بروبيلين غليكول"),
    ("Dithiophosphate", "ثنائي ثيوفوسفات"),
    ("Xanthates", "الزانثات"),
    ("xanthates", "الزانثات"),
    ("bulk ", "بالجملة "),
    ("وقت الرصاص", "مدة التوريد"),
    ("كيمياء التعدين", "مادة كيميائية للتعدين"),
    ("جامع كبريتيد المعادن", "مجمّع لمعادن الكبريتيد"),
    ("كيمياء اللب والمياه المعاد تدويرها", "كيمياء اللب ومياه التدوير"),
    ("فحص المشتريات", "التقييم لأغراض الشراء"),
    ("مجالات عمل الاختبار", "مجالات الاختبار"),
]


def parse(path: Path):
    return html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))


def direct_text(node) -> str:
    return " ".join(node.text_content().split())


def product_names() -> dict[tuple[str, str], str]:
    names = {}
    for category in CATEGORIES:
        doc = parse(ROOT / "ar" / "products" / f"{category}.html")
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
    value = arabic.polish(value)
    for source, target in TERM_FIXES:
        value = value.replace(source, target)
    value = re.sub(r"How to source (.+?) in bulk", r"كيفية شراء \1 بالجملة", value)
    value = re.sub(r"How to source (.+?) for mining", r"كيفية شراء \1 للتعدين", value)
    value = re.sub(
        r"Use these (?:long-tail )?procurement questions when comparing .*",
        "استخدم معايير الشراء التالية عند مقارنة الموردين والمصنعين وعروض التوريد بالجملة.",
        value,
    )
    value = re.sub(
        r"Share exact .*",
        "حدّد الهوية والدرجة والشكل والتطبيق والكمية والتعبئة وبلد الوجهة والمستندات المطلوبة.",
        value,
    )
    value = re.sub(
        r"Compare .*",
        "قارن المواصفة وأساس التحليل والتعبئة وتصنيف النقل وشروط التجارة ومدة التوريد.",
        value,
    )
    value = re.sub(
        r"Provide .*",
        "قدّم بيانات التطبيق والكمية والتعبئة وبلد الوجهة والمتطلبات الفنية والمستندية.",
        value,
    )
    value = re.sub(
        r"Request .*",
        "اطلب المواصفة الحالية وشهادة التحليل ونشرة السلامة والمستندات الخاصة بالمصدر.",
        value,
    )
    value = re.sub(
        r"Confirm .*",
        "تحقق من الهوية والتركيز والشكل والمواصفة ومدى الملاءمة للتطبيق المقصود.",
        value,
    )
    return value


def polish_json_text(value):
    if isinstance(value, dict):
        return {key: polish_json_text(child) for key, child in value.items()}
    if isinstance(value, list):
        return [polish_json_text(child) for child in value]
    if isinstance(value, str) and not value.startswith(("http://", "https://")):
        return polish_text(value)
    return value


def polish_page(path: Path, rel: str, display_name: str, mapping: dict[str, str]) -> None:
    category = rel.split("/")[1]
    config = CATEGORIES[category]
    doc = parse(path)
    root = doc.getroot()
    root.set("lang", "ar")
    root.set("dir", "rtl")
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
        f"اطلب المواصفة وشهادة التحليل والمستندات وبيانات التعبئة وعرض سعر {display_name} "
        f"{config['grade']} للمشتريات بين الشركات والتوريد الدولي.", 179
    )
    arabic.set_metadata(doc, title, description)
    overview = doc.xpath("//*[@id='overview']//h2")
    if overview:
        overview[0].text = f"ما هو {display_name} وكيف تُحدَّد مواصفاته؟"
    faq = doc.xpath("//*[@id='faq']//h2")
    if faq:
        faq[0].text = f"الأسئلة الشائعة حول {display_name}"
    quote = doc.xpath("//*[@id='request-quote']//h2")
    if quote:
        quote[0].text = f"اطلب مواصفة وعرض سعر {display_name}"

    source_doc = parse(ROOT / rel)
    source_scripts = source_doc.xpath("//script[@type='application/ld+json']")
    for index, script in enumerate(doc.xpath("//script[@type='application/ld+json']")):
        if not script.text:
            continue
        data = localizer.json.loads(script.text)
        if index < len(source_scripts) and source_scripts[index].text:
            source_data = localizer.json.loads(source_scripts[index].text)
            data = arabic.translate_schema_from_source(source_data, data, mapping)

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
                    value["inLanguage"] = "ar"
                for child in value.values():
                    walk(child)
            elif isinstance(value, list):
                for child in value:
                    walk(child)

        walk(data)
        script.text = localizer.json.dumps(
            polish_json_text(data), ensure_ascii=False, separators=(",", ":")
        )
    localizer.write_html(path, doc)


def sync_index(category: str) -> None:
    source = parse(ROOT / "products" / f"{category}.html")
    target_path = ROOT / "ar" / "products" / f"{category}.html"
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
    localizer.ACTIVE_LANGS = ["es", "pt", "ru", "de", "ar"]
    rels = scope.english_sources()
    missing = [rel for rel in rels if not (ROOT / "ar" / rel).exists()]
    print(f"English dossiers: {len(rels)}; existing Arabic: {len(rels) - len(missing)}; to create: {len(missing)}")
    cache = localizer.load_cache()
    if missing:
        docs = [parse(ROOT / rel) for rel in missing]
        strings = set().union(*(localizer.collect_strings(doc) for doc in docs))
        strings.add("Language selection")
        localizer.seed_parallel_translation_memory(cache, ["ar"])
        localizer.populate_translations(strings, cache, ["ar"])
        localizer.save_cache(cache)

    names = product_names()
    for rel in missing:
        localizer.update_english_seo(rel)
        localizer.localize_page(rel, "ar", cache["ar"])
    for rel in rels:
        category, slug = rel.split("/")[1], Path(rel).stem
        polish_page(ROOT / "ar" / rel, rel, listing_name(category, slug, names), cache["ar"])
        for lang in ("es", "pt", "ru", "de"):
            localizer.update_existing_locale_seo(rel, lang)

    for category in CATEGORIES:
        sync_index(category)
    builder = importlib.import_module("build_industry_application_pages")
    builder.rebuild_sitemap()
    print(
        f"Created {len(missing)} and post-edited {len(rels)} Arabic product pages; "
        "synchronized six indexes, reciprocal hreflang and sitemap."
    )


if __name__ == "__main__":
    main()

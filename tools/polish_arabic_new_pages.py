#!/usr/bin/env python3
"""Post-edit the newly localized Arabic product and solution pages."""

from __future__ import annotations

import json
import re
import sys
import urllib.parse
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import localize_new_pages as localizer


PRODUCTS = {
    "calcium-citrate": "سترات الكالسيوم",
    "carrageenan": "الكاراجينان",
    "dipotassium-phosphate-dkp": "فوسفات ثنائي البوتاسيوم (DKP)",
    "disodium-phosphate-dsp": "فوسفات ثنائي الصوديوم (DSP)",
    "guar-gum": "صمغ الغوار",
    "konjac-gum": "صمغ الكونجاك",
    "magnesium-carbonate": "كربونات المغنيسيوم",
    "magnesium-citrate": "سترات المغنيسيوم",
    "monopotassium-phosphate-mkp": "فوسفات أحادي البوتاسيوم (MKP)",
    "potassium-citrate": "سترات البوتاسيوم",
    "potassium-metaphosphate-kmp": "ميتافوسفات البوتاسيوم (KMP)",
    "potassium-sorbate": "سوربات البوتاسيوم",
    "potassium-tripolyphosphate-ktpp": "ثلاثي بولي فوسفات البوتاسيوم (KTPP)",
    "sodium-acid-pyrophosphate-sapp": "بيروفوسفات الصوديوم الحمضي (SAPP)",
    "sodium-alginate": "ألجينات الصوديوم",
    "sodium-citrate": "سترات الصوديوم",
    "sodium-dihydrogen-phosphate-msp": "فوسفات ثنائي هيدروجين الصوديوم (MSP)",
    "sodium-propionate": "بروبيونات الصوديوم",
    "sodium-trimetaphosphate-stmp": "ثلاثي ميتافوسفات الصوديوم (STMP)",
    "tetrasodium-pyrophosphate-tspp": "بيروفوسفات رباعي الصوديوم (TSPP)",
    "tricalcium-phosphate-tcp": "فوسفات ثلاثي الكالسيوم (TCP)",
    "tripotassium-phosphate-tkp": "فوسفات ثلاثي البوتاسيوم (TKP)",
    "trisodium-phosphate-tsp": "فوسفات ثلاثي الصوديوم (TSP)",
    "xanthan-gum": "صمغ الزانثان",
    "zinc-citrate": "سترات الزنك",
}

SOLUTIONS = {
    "meat-poultry-phosphate-systems": "أنظمة الفوسفات لمنتجات اللحوم والدواجن",
    "seafood-phosphate-selection": "اختيار الفوسفات للأسماك والمأكولات البحرية",
    "bakery-leavening-phosphate-solutions": "مواد الرفع والفوسفات للمخبوزات",
    "dairy-cheese-ingredient-solutions": "مكونات منتجات الألبان والجبن",
    "beverage-formulation-ingredient-solutions": "مكونات تركيبات المشروبات",
    "prepared-food-sauce-filling-solutions": "مكونات الوجبات الجاهزة والصلصات والحشوات",
    "poultry-feed-phosphate-qualification": "اختيار الفوسفات لأعلاف الدواجن",
    "swine-feed-phosphate-selection": "اختيار الفوسفات لأعلاف الخنازير",
    "ruminant-mineral-premix-phosphate-systems": "أنظمة الفوسفات للخلطات المعدنية للمجترات",
    "aquaculture-feed-ingredient-solutions": "مكونات أعلاف الاستزراع المائي",
    "feed-premix-flow-trace-mineral-compatibility": "سيولة الخلطات العلفية وتوافق المعادن النزرة",
    "laundry-detergent-ingredient-solutions": "مكونات تركيبات منظفات الغسيل",
    "hard-surface-cleaner-ingredient-solutions": "مكونات منظفات الأسطح الصلبة",
    "industrial-degreaser-formulation-ingredients": "مكونات مزيلات الشحوم الصناعية",
    "acid-cleaner-descaler-ingredient-solutions": "مكونات المنظفات الحمضية ومزيلات الترسبات",
    "institutional-cleaning-hygiene-ingredients": "مكونات التنظيف المهني والنظافة الصحية",
    "industrial-plant-cleaning-chemical-systems": "أنظمة كيميائية لتنظيف المنشآت الصناعية",
    "raw-water-clarification-coagulant-solutions": "مواد التخثير لترويق المياه الخام",
    "industrial-wastewater-coagulant-selection": "مواد التخثير لمياه الصرف الصناعي",
    "cooling-water-biofouling-control-chemicals": "كيماويات مكافحة التلوث الحيوي في مياه التبريد",
    "industrial-water-intake-biofouling-control": "مكافحة التلوث الحيوي في مآخذ المياه الصناعية",
    "boiler-condensate-neutralizing-amine-solutions": "الأمينات المعادلة لأنظمة الغلايات والمكثفات",
    "process-water-reuse-chemical-solutions": "حلول كيميائية لإعادة استخدام مياه العمليات",
    "mine-water-treatment-chemical-solutions": "كيماويات معالجة مياه المناجم",
    "mineral-leaching-chemical-solutions": "كيماويات الاستخلاص بالإذابة للخامات المعدنية",
    "mineral-flotation-reagent-solutions": "كواشف تعويم الخامات المعدنية",
    "smelting-electrowinning-chemical-inputs": "كيماويات الصهر والاستخلاص الكهربائي",
    "mineral-refining-processing-chemicals": "كيماويات تنقية ومعالجة الخامات المعدنية",
    "fertigation-phosphate-fertilizer-selection": "أسمدة الفوسفات للتسميد عبر الري",
    "foliar-phosphorus-potassium-solutions": "محاليل الفوسفور والبوتاسيوم للتسميد الورقي",
    "water-soluble-fertilizer-raw-material-qualification": "مواد خام للأسمدة القابلة للذوبان في الماء",
    "greenhouse-fertilizer-stock-tank-compatibility": "توافق محاليل الأسمدة المركزة في البيوت المحمية",
    "compound-fertilizer-phosphate-raw-materials": "مواد فوسفاتية خام للأسمدة المركبة",
    "specialty-crop-fertilizer-programs": "برامج تسميد المحاصيل المتخصصة",
}

SEO_SHORT = {
    "مكونات الوجبات الجاهزة والصلصات والحشوات": "مكونات الوجبات الجاهزة والصلصات",
    "سيولة الخلطات العلفية وتوافق المعادن النزرة": "سيولة الخلطات العلفية وتوافق المعادن",
    "كيماويات مكافحة التلوث الحيوي في مياه التبريد": "مكافحة التلوث الحيوي في مياه التبريد",
    "مكافحة التلوث الحيوي في مآخذ المياه الصناعية": "مكافحة التلوث الحيوي في مآخذ المياه",
    "توافق محاليل الأسمدة المركزة في البيوت المحمية": "توافق محاليل الأسمدة المركزة",
}

REPLACEMENTS = [
    ("Language selection", "اختيار اللغة"),
    ("اختيار اللغات", "اختيار اللغة"),
    ("الغذاء الصف", "بدرجة غذائية"),
    ("درجة الغذاء", "بدرجة غذائية"),
    ("Food Grade", "بدرجة غذائية"),
    ("Guar Gum", "صمغ الغوار"),
    ("Konjac Gum", "صمغ الكونجاك"),
    ("Xanthan Gum", "صمغ الزانثان"),
    ("طلب الاقتباس", "طلب عرض سعر"),
    ("اقتباس", "عرض سعر"),
    ("تحضير RFQ", "إعداد طلب عرض سعر"),
    ("إعداد RFQ", "إعداد طلب عرض سعر"),
    ("المرشحون", "الخيارات"),
    ("المرشحين", "الخيارات"),
    ("المرشح", "الخيار"),
    ("قائمة قصيرة", "قائمة الخيارات"),
    ("خطة الأدلة", "خطة التحقق"),
    ("خطة الإثبات", "خطة التحقق"),
    ("مسار الأدلة الموصى به", "خطة التحقق الموصى بها"),
    ("الأدلة الخاضعة للرقابة", "اختبارات مضبوطة"),
    ("الخط الأساسي والمرشح والاختبارات التجريبية", "اختبارات مرجعية ومقارنة وتجريبية"),
    ("خريطة الفرز", "دليل مبدئي للاختيار"),
    ("وصفة ضمنية", "تركيبة نهائية"),
    ("تصميم المقارنة", "إعداد خطة المقارنة"),
    ("تحدي النتيجة", "اختبار النتيجة في ظروف واقعية"),
    ("تجميد الدرجة المعتمدة", "تثبيت الدرجة المعتمدة"),
    ("تجميد الصف المعتمد", "تثبيت الدرجة المعتمدة"),
    ("وضع الفشل", "سبب المشكلة"),
    ("نمط الفشل", "سبب المشكلة"),
    ("توسيع النطاق", "الانتقال إلى النطاق الصناعي"),
    ("مطحنة الأعلاف", "مصنع الأعلاف"),
    ("آخر مراجعة", "آخر تحديث"),
]


def polish(value: str) -> str:
    for old, new in REPLACEMENTS:
        value = value.replace(old, new)
    value = re.sub(r"\s+([،؛,.!?؟:])", r"\1", value)
    value = re.sub(r" {2,}", " ", value)
    return value


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
    title_nodes = doc.xpath("//title")
    if title_nodes:
        title_nodes[0].text = title
    for node in doc.xpath("//meta[@name='description' or @property='og:description' or @name='twitter:description']"):
        node.set("content", description)
    for node in doc.xpath("//meta[@property='og:title' or @name='twitter:title']"):
        node.set("content", title.split(" | ", 1)[0])


def process(path: Path, display_name: str, kind: str, mapping):
    doc = html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))
    root = doc.getroot()
    root.set("lang", "ar")
    root.set("dir", "rtl")
    source_doc = html.parse(str(ROOT / path.relative_to(ROOT / "ar")), parser=html.HTMLParser(encoding="utf-8"))
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
        title = f"{display_name} بدرجة غذائية | مورد | Bespring"
        description = f"{display_name} بدرجة غذائية من Bespring Chemical: المواصفات والاستخدامات والتعبئة والحد الأدنى للطلب، مع مستندات COA وTDS وSDS اللازمة للشراء وطلب عرض السعر."
        headings = {
            "overview": f"مواصفات وخصائص {display_name}",
            "applications": f"استخدامات {display_name}",
            "faq": f"أسئلة شائعة: {display_name}",
            "request-quote": f"طلب عرض سعر لـ {display_name}",
        }
        for section_id, heading in headings.items():
            nodes = doc.xpath(f"//*[@id='{section_id}']//h2")
            if nodes:
                nodes[0].text = heading
        kickers = {
            "overview": "نبذة عن المنتج",
            "applications": "مجالات الاستخدام",
            "request-quote": "توريد وفق المواصفات المتفق عليها",
        }
        for section_id, text_value in kickers.items():
            nodes = doc.xpath(f"//*[@id='{section_id}']//p[contains(@class,'kicker')]")
            if nodes:
                nodes[0].text = text_value
        callout = doc.xpath("//*[@id='overview']//*[contains(@class,'callout')]//h3")
        if callout:
            callout[0].text = "معلومات مهمة للمشتريات"
        for field in doc.xpath("//form//*[@name='product']"):
            field.set("value", display_name)
        whatsapp_text = urllib.parse.quote(f"مرحبًا، أود طلب عرض سعر لـ {display_name} بدرجة غذائية.")
        for anchor in doc.xpath("//a[starts-with(@href,'https://wa.me/')]"):
            anchor.set("href", anchor.get("href").split("?", 1)[0] + "?text=" + whatsapp_text)
        for script in doc.xpath("//script[not(@type='application/ld+json')]"):
            if not script.text:
                continue
            script.text = script.text.replace(
                "Please email info@bespringchem.com.", "يرجى مراسلتنا على info@bespringchem.com."
            ).replace(
                "Thank you. Your request has been sent.", "شكرًا لك. تم إرسال طلبك."
            ).replace(
                "Sending your request...", "جارٍ إرسال طلبك..."
            ).replace(
                "The form could not be sent. Please email info@bespringchem.com or try again.",
                "تعذر إرسال النموذج. يرجى مراسلتنا على info@bespringchem.com أو المحاولة مرة أخرى."
            ).replace(
                "The form service is temporarily unavailable. يرجى مراسلتنا على info@bespringchem.com.",
                "خدمة النموذج غير متاحة مؤقتًا. يرجى مراسلتنا على info@bespringchem.com."
            )
            script.text = re.sub(
                r'Thank you\. Your [^"\']+?(?:quote )?request has been sent(?: successfully)?\.',
                "شكرًا لك. تم إرسال طلب عرض السعر بنجاح.",
                script.text,
            )
            script.text = re.sub(
                r"product=(['\"])Food Grade .*?\1",
                "product=" + json.dumps(display_name, ensure_ascii=False),
                script.text,
            )
            script.text = re.sub(
                r'(\w+\.elements\.product\.value=)(["\']).*?\2',
                lambda match: match.group(1) + json.dumps(display_name, ensure_ascii=False),
                script.text,
            )
    else:
        seo_name = SEO_SHORT.get(display_name, display_name)
        title = f"{seo_name} | دليل فني | Bespring"
        description = f"دليل فني حول {seo_name}: معايير الاختيار والوظائف والمخاطر وطرق الاختبار وبيانات طلب عرض السعر اللازمة لاتخاذ قرار شراء موثوق."
        headings = {
            "selection": "وظيفة كل خيار وما ينبغي التحقق منه",
            "validation": "التحقق من الافتراضات الفنية باختبارات قابلة للتكرار",
            "metrics": "مؤشرات القياس اللازمة للاعتماد",
            "rfq": "البيانات التي يحتاجها المورد لإعداد عرض دقيق",
            "faq": f"أسئلة شائعة: {display_name}",
        }
        for section_id, heading in headings.items():
            nodes = doc.xpath(f"//*[@id='{section_id}']//h2")
            if nodes:
                nodes[0].text = heading
        variable_intro = doc.xpath("//*[@id='variables']//header/p")
        if variable_intro:
            variable_intro[0].text = "ينبغي تسجيل هذه البيانات أو قياسها قبل مقارنة الخيارات."

    set_metadata(doc, title, description)
    breadcrumbs = doc.xpath("//nav[contains(@class,'breadcrumb')]//li[last()]")
    for breadcrumb in breadcrumbs:
        breadcrumb.text = display_name
    for node in doc.xpath("//script[@type='application/ld+json']"):
        if node.text:
            data = json.loads(node.text)
            set_schema(data, display_name, kind, description)
            node.text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    path.write_text(html.tostring(root, encoding="unicode", method="html", doctype="<!DOCTYPE html>"), encoding="utf-8", newline="\n")


def polish_hub(path: Path):
    doc = html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))
    doc.getroot().set("lang", "ar")
    doc.getroot().set("dir", "rtl")
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
            anchor.set("aria-label", f"اقرأ الدليل: {title}")
            headings = anchor.xpath(".//h3 | .//strong")
            if headings:
                headings[0].text = title
    path.write_text(html.tostring(doc.getroot(), encoding="unicode", method="html", doctype="<!DOCTYPE html>"), encoding="utf-8", newline="\n")


def main():
    mapping = localizer.load_cache()["ar"] if localizer.CACHE_PATH.exists() else {}
    for slug, name in PRODUCTS.items():
        process(ROOT / "ar/products/food-ingredients" / f"{slug}.html", name, "product", mapping)
    for slug, name in SOLUTIONS.items():
        process(ROOT / "ar/solutions" / f"{slug}.html", name, "solution", mapping)
    for filename in (
        "agriculture-solutions.html", "animal-nutrition-solutions.html", "food-industry-solutions.html",
        "industrial-cleaning-solutions.html", "mining-solutions.html", "water-treatment-solutions.html",
    ):
        polish_hub(ROOT / "ar/solutions" / filename)
    print(f"Polished {len(PRODUCTS)} product pages and {len(SOLUTIONS)} solution pages in Arabic.")


if __name__ == "__main__":
    main()

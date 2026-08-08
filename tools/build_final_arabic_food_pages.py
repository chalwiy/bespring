#!/usr/bin/env python3
"""Build the three final requested Arabic food-ingredient pages."""

from __future__ import annotations

import importlib
from pathlib import Path

from build_final_spanish_food_pages import PRODUCTS as SOURCE
from build_requested_arabic_food_pages import BASE, page

ROOT = Path(__file__).resolve().parents[1]

AR = {
    "encapsulated-sorbic-acid": {
        "name": "حمض السوربيك المغلّف",
        "title": "حمض السوربيك المغلّف بدرجة غذائية | مورد بالجملة",
        "description": "حمض السوربيك المغلّف بدرجة غذائية وبمحتوى فعال 83–87%: مادة التغليف والتحرر وحجم الجسيمات وشهادة COA وعرض التوريد بالجملة.",
        "summary": "حمض السوربيك المغلّف تركيبة حافظة يُغطّى فيها حمض السوربيك بطبقة دهنية صالحة للاستخدام الغذائي. قد تؤخر الطبقة ملامسة المادة الفعالة للعجين وتحد من التفاعلات المبكرة، لكن يجب التحقق من منحنى التحرر في عملية العميل الفعلية.",
        "functions": ["إتاحة حمض السوربيك بصورة مضبوطة كمادة فعالة ضد العفن", "التحكم في توقيت التحرر بواسطة غلاف دهني", "الحد من التفاعل المبكر مع الخميرة أو المكونات الحساسة بعد إثبات ذلك في الوصفة", "دعم نظام موثّق للتحكم في مدة الصلاحية"],
        "applications": ["المخبوزات والعجائن المخمرة", "الخلطات الجافة للمخبوزات", "الحشوات والأغذية متوسطة الرطوبة", "تطبيقات غذائية أخرى مسموح بها بعد التحقق من تحرر المادة الفعالة"],
        "criteria": ["نسبة حمض السوربيك الفعال وأساس حساب النتيجة", "نوع مادة التغليف وبيان مكوناتها وملاءمتها الغذائية", "طريقة أو منحنى التحرر في ظروف الخلط والخبز الفعلية", "توزيع حجم الجسيمات والتجانس والمعايير الميكروبيولوجية والثبات"],
        "note": "المنتج النهائي خليط مُصاغ؛ فالرقمان E200/INS 200 ورقم CAS 110-44-1 يخصان حمض السوربيك الفعال ولا يمثلان هوية موحدة للجسيم المغلّف بكامله. يجب تأكيد التركيب والوسم والسماح بالاستخدام في سوق الوجهة.",
    },
    "monosodium-glutamate-msg": {
        "name": "غلوتامات أحادي الصوديوم (MSG)",
        "title": "غلوتامات أحادي الصوديوم MSG E621 | مورد غذائي بالجملة",
        "description": "غلوتامات أحادي الصوديوم MSG E621 بدرجة غذائية ومحتوى ≥99%: حجم الحبيبات والنقاوة وشهادة COA والتعبئة وعرض سعر للكميات التجارية.",
        "summary": "غلوتامات أحادي الصوديوم من النوع L، ويُعرف اختصاراً باسم MSG، هو ملح الصوديوم لحمض L-غلوتاميك. يُستخدم كمُعزّز لطعم الأومامي في التركيبات المالحة المناسبة ضمن الاستخدامات والحدود المعمول بها في سوق الوجهة.",
        "functions": ["تعزيز طعم الأومامي", "إضفاء توازن وامتلاء على المذاق المالح والنكهات الشبيهة باللحوم", "دعم الأداء الحسي في خلطات التوابل", "رفع وضوح النكهة دون أن يحل محل التوازن السليم للوصفة"],
        "applications": ["التوابل وخلطات النكهات الجافة", "الشوربات والمرق والصلصات", "المعكرونة سريعة التحضير والوجبات الخفيفة", "منتجات اللحوم والأسماك والخضروات المصنّعة"],
        "criteria": ["محتوى غلوتامات الصوديوم والدوران النوعي ونفاذية المحلول", "حجم الحبيبات المتفق عليه للجرعات والخلط والذوبان", "الفقد بالتجفيف وpH وحدود المعادن والشوائب", "الاختبار الحسي في المنتج النهائي واحتساب مساهمته في الصوديوم"],
        "note": "قد يظهر المنتج في عروض الشراء باسم MSG أو غلوتامات الصوديوم أو E621. عند تأهيل المورد، تأكد من أن المواصفة تخص L-غلوتامات أحادي الصوديوم أحادي الهيدرات، وحدد حجم الحبيبات تعاقدياً.",
    },
    "sodium-metabisulfite": {
        "name": "ميتابيسلفيت الصوديوم",
        "title": "ميتابيسلفيت الصوديوم الغذائي E223 | مورد بالجملة",
        "description": "ميتابيسلفيت الصوديوم E223 بدرجة غذائية للتوريد B2B: محتوى Na₂S₂O₅ وSO₂ وpH والكبريتيت وشهادة COA وأكياس 25 كجم.",
        "summary": "ميتابيسلفيت الصوديوم، ويُسمى أيضاً ثنائي كبريتيت الصوديوم أو بيروكبريتيت الصوديوم، مادة كبريتيتية يمكن أن تعمل في فئات الأغذية المسموح بها كمضاد أكسدة أو عامل لمنع الاسمرار أو مادة حافظة أو عامل لمعالجة الدقيق.",
        "functions": ["عمل مضاد للأكسدة في العمليات المناسبة", "الحد من الاسمرار في التطبيقات المسموح بها", "إطلاق ثاني أكسيد الكبريت في ظروف الاستخدام", "دعم الحفظ بعد التحقق التقني والتنظيمي"],
        "applications": ["الفواكه والخضروات المصنّعة ضمن الفئات المسموح بها", "منتجات البطاطس والمواد المعرضة للاسمرار", "بعض عمليات صناعة النبيذ والمشروبات", "تطبيقات المخبوزات أو المعالجة الغذائية المسموح بها"],
        "criteria": ["المحتوى محسوباً على أساس Na₂S₂O₅ ونسبة SO₂ وpH والمواد غير الذائبة", "الحديد والزرنيخ والرصاص بحدود ووحدات وعلامات مقارنة واضحة", "الرطوبة والثبات وعبوة حاجزة للهواء والماء", "الحد المسموح والمتبقي من SO₂ ومتطلبات بيان الكبريتيت على المنتج النهائي"],
        "note": "قد تتطلب مركبات الكبريتيت بياناً خاصاً على البطاقة، كما تستلزم الحذر لدى الأشخاص الحساسين لها. يجب مراجعة النظام الساري في بلد الوجهة وفئة الغذاء والكمية المتبقية محسوبة على أساس SO₂ قبل اعتماد الاستخدام أو الوسم.",
    },
}


def add_ar_hreflang(slug: str) -> None:
    path = ROOT / "products" / "food-ingredients" / f"{slug}.html"
    text = path.read_text(encoding="utf-8")
    if 'hreflang="ar"' not in text:
        link = f'<link rel="alternate" hreflang="ar" href="{BASE}/ar/products/food-ingredients/{slug}.html">'
        text = text.replace('<link rel="alternate" hreflang="x-default"', link + '<link rel="alternate" hreflang="x-default"', 1)
        path.write_text(text, encoding="utf-8")


def update_listing() -> None:
    path = ROOT / "ar" / "products" / "food-ingredients.html"
    text = path.read_text(encoding="utf-8")
    additions = {
        '<li data-product="سوربات الكالسيوم | calcium sorbate"><a href="food-ingredients/calcium-sorbate.html">سوربات الكالسيوم</a></li>':
            '<li data-product="سوربات الكالسيوم | calcium sorbate"><a href="food-ingredients/calcium-sorbate.html">سوربات الكالسيوم</a></li><li data-product="حمض السوربيك المغلف | حمض السوربيك المكبسل | encapsulated sorbic acid | e200"><a href="food-ingredients/encapsulated-sorbic-acid.html">حمض السوربيك المغلّف</a></li><li data-product="ميتابيسلفيت الصوديوم | ثنائي كبريتيت الصوديوم | بيروكبريتيت الصوديوم | sodium metabisulfite | smbs | e223"><a href="food-ingredients/sodium-metabisulfite.html">ميتابيسلفيت الصوديوم</a></li>',
        '<li data-product="فانيلين | vanillin"><a href="food-ingredients/vanillin.html">فانيلين</a></li>':
            '<li data-product="فانيلين | vanillin"><a href="food-ingredients/vanillin.html">فانيلين</a></li><li data-product="غلوتامات أحادي الصوديوم | جلوتامات أحادي الصوديوم | غلوتامات الصوديوم | monosodium glutamate | msg | e621"><a href="food-ingredients/monosodium-glutamate-msg.html">غلوتامات أحادي الصوديوم (MSG)</a></li>',
    }
    for anchor, replacement in additions.items():
        if replacement not in text:
            if anchor not in text:
                raise RuntimeError(f"Listing anchor not found: {anchor}")
            text = text.replace(anchor, replacement, 1)
    text = text.replace('<span>9 مواد</span>', '<span>11 مادة</span>', 1)
    marker = '<article class="pc-family" id="flavors-dairy-powders"'
    before, after = text.split(marker, 1)
    after = after.replace('<span>3 مواد</span>', '<span>4 مواد</span>', 1)
    path.write_text(before + marker + after, encoding="utf-8")


def main() -> None:
    out = ROOT / "ar" / "products" / "food-ingredients"
    for slug, product in AR.items():
        (out / f"{slug}.html").write_text(page(slug, product, SOURCE[slug]), encoding="utf-8")
        add_ar_hreflang(slug)
    update_listing()
    importlib.import_module("build_industry_application_pages").rebuild_sitemap()
    print(f"Built {len(AR)} Arabic pages, updated listing and sitemap")


if __name__ == "__main__":
    main()

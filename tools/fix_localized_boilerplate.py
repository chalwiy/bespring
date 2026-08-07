#!/usr/bin/env python3
"""Fix confirmed machine-translation residue in localized product templates."""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


EXACT_REPLACEMENTS = {
    "ar": {
        "Share identity, form or concentration, water application, water or system data, critical limits, quantity,packing, destination and document list.":
            "يرجى توضيح هوية المنتج وشكله أو تركيزه، وتطبيق معالجة المياه، وبيانات المياه أو النظام، والحدود الحرجة، والكمية، والتعبئة، والوجهة، والمستندات المطلوبة.",
        "Share identity, grade or concentration, process role, ore or water context, critical limits, quantity,packing, destination and documents.":
            "يرجى توضيح هوية المنتج ودرجته أو تركيزه، ودوره في العملية، وخصائص الخام أو المياه، والحدود الحرجة، والكمية، والتعبئة، والوجهة، والمستندات المطلوبة.",
        "Representative and batch COA": "شهادة تحليل نموذجية وشهادة تحليل خاصة بالدفعة (COA)",
        "SDS,packing and transport confirmation": "صحيفة بيانات السلامة (SDS) وتأكيد التعبئة والنقل",
        "المواصفات الخاصة الحالية أو TDS": "المواصفة الحالية للمنتج أو ورقة البيانات الفنية (TDS)",
        "الوثائق الخاصة بالمصدر عند الطلب": "المستندات الخاصة بجهة التصنيع عند الطلب",
        "الموارد الكيميائية التي تقودها المواصفات": "توريد المواد الكيميائية وفق المواصفات",
        "إمدادات التعدين التي تقودها المواصفات": "توريد مواد التعدين وفق المواصفات",
    },
    "es": {
        "Representative and batch COA": "COA representativo y certificado de análisis del lote",
        "Especificación privada actual o TDS": "Especificación vigente del producto o ficha técnica (TDS)",
        "Documentos específicos de la fuente solicitados": "Documentación específica del fabricante, si se solicita",
    },
}


DESCRIPTION_PATTERNS = {
    "ar": (
        re.compile(r'"description":"Source (.*?) - Review identity, applications, selection and documents; contact Bespring Chemical sales for the current specification\."'),
        r'"description":"توريد \1 — راجع هوية المنتج وتطبيقاته ومعايير الاختيار والمستندات، وتواصل مع فريق مبيعات Bespring Chemical للحصول على المواصفة الحالية."',
    ),
    "es": (
        re.compile(r'"description":"Source (.*?) - Review identity, applications, selection and documents; contact Bespring Chemical sales for the current specification\."'),
        r'"description":"Suministro de \1: consulte la identidad, las aplicaciones, los criterios de selección y la documentación; solicite a Bespring Chemical la especificación vigente."',
    ),
    "ru": (
        re.compile(r'"description":"Source (.*?) - Review identity, applications, selection and documents; contact Bespring Chemical sales for the current specification\."'),
        r'"description":"Поставка \1: сведения о продукте, применении, критериях выбора и документации; запросите актуальную спецификацию у отдела продаж Bespring Chemical."',
    ),
}


def main() -> None:
    changed = 0
    replacements = 0
    for lang in ("ar", "es", "ru"):
        for path in sorted((ROOT / lang).rglob("*.html")):
            text = path.read_text(encoding="utf-8")
            updated = text
            for old, new in EXACT_REPLACEMENTS.get(lang, {}).items():
                count = updated.count(old)
                if count:
                    updated = updated.replace(old, new)
                    replacements += count
            pattern, replacement = DESCRIPTION_PATTERNS[lang]
            updated, count = pattern.subn(replacement, updated)
            replacements += count
            if updated != text:
                path.write_text(updated, encoding="utf-8", newline="")
                changed += 1
    print(f"Changed {changed} files with {replacements} confirmed replacements.")


if __name__ == "__main__":
    main()

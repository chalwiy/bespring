#!/usr/bin/env python3
"""Post-edit every Russian page while preserving href/src and page behavior."""

from __future__ import annotations

import html as html_std
import json
import re
import sys
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import polish_russian_new_pages as base
from build_russian_product_pages import TERM_FIXES

EXTRA = [
    ("Food Grade", "Пищевое качество"),
    ("Feed Grade", "Кормовое качество"),
    ("Standard packing", "Стандартная упаковка"),
    ("Container loading", "Загрузка контейнера"),
    ("Please email info@bespringchem.com.", "Напишите на info@bespringchem.com."),
    ("Thank you. Your request has been sent.", "Спасибо. Ваш запрос отправлен."),
    ("Request a Quote", "Запросить предложение"),
    ("Contact Sales", "Связаться с отделом продаж"),
    ("Safety Data Sheet", "Паспорт безопасности (SDS)"),
    ("Technical Data Sheet", "Техническое описание (TDS)"),
    ("commercial email", "рабочий адрес электронной почты"),
    ("bulk quotation", "коммерческое предложение на оптовую поставку"),
    ("bulk price", "оптовая цена"),
    ("Специфицированный химический источник", "Поставка по согласованной спецификации"),
    ("Источник удобрений под руководством спецификации", "Удобрение по согласованной спецификации"),
    ("Текущая частная спецификация TDS", "Актуальная спецификация и TDS"),
    ("Представитель и партия COA", "Типовой COA и COA партии"),
    ("Конкретные исходные документы по запросу", "Документы на конкретное происхождение по запросу"),
    ("Укажите точный сортом, концентрацией или формой, применением, критическими ограничениями, количеством, упаковкой, пунктом назначения и списком документов для соответствующего предложения.", "Укажите требуемые качество, концентрацию или форму, применение, критичные пределы, количество, упаковку, пункт назначения и необходимые документы."),
    ("Поставщик кормов под руководством спецификации", "Кормовой ингредиент по согласованной спецификации"),
    ("Укажите точную формой, целевыми видами, видом корма, предполагаемой функцией, количеством, упаковкой, пунктом назначения и списком документов для соответствующего предложения.", "Укажите требуемую форму, виды животных, категорию корма, назначение, количество, упаковку, пункт назначения и необходимые документы."),
    ("Укажите точную формой", "Укажите требуемую форму"),
    ("Текущая спецификация для частных кормов или TDS", "Актуальная спецификация кормового продукта и TDS"),
    ("Укажите точный сортом, заявкой, количеством, упаковкой, пунктом назначения и необходимыми документами.", "Укажите требуемое качество, применение, количество, упаковку, пункт назначения и необходимые документы."),
    ("Запрос спецификации и цитаты", "Запросить спецификацию и цену"),
    ("запрос спецификации и цитаты", "запросить спецификацию и цену"),
    ("цитаты", "коммерческого предложения"),
    ("цитату", "коммерческое предложение"),
    ("Контактные продажи", "Запросите у отдела продаж"),
    ("Ингредиент пищевого класса", "Пищевой ингредиент"),
    ("пищевого класса", "пищевого качества"),
    ("Продовольственное обозначение", "Обозначение пищевой добавки"),
    ("антикокинга", "предотвращения слёживания"),
    ("Репрезентативное портфолио", "Пример ассортимента"),
    ("Репрезентативное ", "Типовое "),
]


def polish(value: str) -> str:
    value = base.polish(value)
    for old, new in TERM_FIXES + EXTRA:
        value = value.replace(old, new)
    return value


def polish_json(value, meta_description: str, h1: str):
    if isinstance(value, dict):
        result = {key: polish_json(item, meta_description, h1) for key, item in value.items()}
        schema_type = result.get("@type")
        description = result.get("description")
        if isinstance(schema_type, str) and schema_type in {"WebPage", "Product", "Service"}:
            if isinstance(description, str) and re.search(r"\b(?:Source|Review|Supplier|Food Grade)\b", description, re.I):
                result["description"] = meta_description
            if schema_type == "WebPage" and "inLanguage" in result:
                result["inLanguage"] = "ru"
        name = result.get("name")
        if schema_type == "Product" and h1 and isinstance(name, str) and re.search(r"\b(?:Supplier|Food Grade)\b", name, re.I):
            result["name"] = h1
        return result
    if isinstance(value, list):
        return [polish_json(item, meta_description, h1) for item in value]
    if isinstance(value, str) and not value.startswith(("http://", "https://")):
        return polish(value)
    return value


def main() -> None:
    changed = 0
    for path in sorted((ROOT / "ru").rglob("*.html")):
        raw = path.read_text(encoding="utf-8")
        doc = html.fromstring(raw)
        h1 = doc.xpath("string(//h1)").strip()
        meta_description = doc.xpath("string(//meta[@name='description']/@content)").strip()
        for node in doc.iter():
            if not isinstance(node.tag, str) or node.tag.lower() in {"script", "style", "code", "pre"}:
                continue
            if node.text:
                node.text = polish(node.text)
                if node.text.strip() == "Product":
                    node.text = node.text.replace("Product", "Продукт")
            if node.tail:
                node.tail = polish(node.tail)
            for attr in ("alt", "title", "aria-label", "placeholder"):
                if node.get(attr):
                    node.set(attr, polish(node.get(attr)))
            if node.tag.lower() == "meta" and node.get("content"):
                node.set("content", polish(node.get("content")))
        for script in doc.xpath("//script[@type='application/ld+json']"):
            try:
                data = json.loads(script.text or "")
            except json.JSONDecodeError:
                continue
            script.text = json.dumps(polish_json(data, meta_description, h1), ensure_ascii=False, separators=(",", ":"))

        updated = html.tostring(doc, encoding="unicode", method="html", doctype="<!DOCTYPE html>")
        replacements = {
            "Please email info@bespringchem.com.": "Напишите на info@bespringchem.com.",
            "Thank you. Your request has been sent.": "Спасибо. Ваш запрос отправлен.",
            "Close navigation menu": "Закрыть меню навигации",
            "Open navigation menu": "Открыть меню навигации",
            "The form service is temporarily unavailable.": "Сервис формы временно недоступен.",
            "Sending your request...": "Запрос отправляется...",
            "Sending your request…": "Запрос отправляется…",
            "Thank you. Your request has been received and our team will contact you shortly.": "Спасибо. Мы получили ваш запрос и свяжемся с вами в ближайшее время.",
            "Thank you. Your request has been received и our team will contact you shortly.": "Спасибо. Мы получили ваш запрос и свяжемся с вами в ближайшее время.",
            "We could not send your request. Please email info@bespringchem.com or try again.": "Не удалось отправить запрос. Напишите на info@bespringchem.com или повторите попытку.",
            "The form could not be sent. Please email info@bespringchem.com or try again.": "Не удалось отправить форму. Напишите на info@bespringchem.com или повторите попытку.",
        }
        for old, new in replacements.items():
            updated = updated.replace(old, new)
        updated = re.sub(r"Thank you\. Your [^.\"']+ quote request has been sent successfully\.", "Спасибо. Запрос коммерческого предложения успешно отправлен.", updated)
        updated = re.sub(r"Thank you\. Your [^.\"']+ request has been sent\.", "Спасибо. Ваш запрос отправлен.", updated)
        if h1 and "/products/" in path.as_posix():
            for field in doc.xpath("//form//*[@name='product']"):
                field.set("value", h1)
            # Serialize once more so the localized form value is retained.
            updated = html.tostring(doc, encoding="unicode", method="html", doctype="<!DOCTYPE html>")
            for old, new in replacements.items():
                updated = updated.replace(old, new)
            updated = re.sub(r"Thank you\. Your [^.\"']+ (?:request|inquiry) has been sent(?: successfully)?\.", "Спасибо. Ваш запрос успешно отправлен.", updated)
            escaped = html_std.escape(h1, quote=True)
            updated = re.sub(r'value="(?:Food Grade|Пищевое качество) [^"]+"', f'value="{escaped}"', updated)
            js_value = "quoteForm.elements.product.value=" + json.dumps(h1, ensure_ascii=False)
            updated = re.sub(r"(?:f|quoteForm)\.elements\.product\.value\s*=\s*(['\"])(?:Food Grade|Пищевое качество) .*?\1", js_value, updated)
            updated = re.sub(r"product=(['\"])(?:Food Grade|Пищевое качество) .*?\1", "product=" + json.dumps(h1, ensure_ascii=False), updated)
            updated = re.sub(r"((?:const|let|var)\s+product=)(['\"])[^'\"]+\2", r"\1" + json.dumps(h1, ensure_ascii=False), updated)
            updated = re.sub(r"(,product=)(['\"])[^'\"]+\2", r"\1" + json.dumps(h1, ensure_ascii=False), updated)
            updated = re.sub(r"(?:f|quoteForm)\.elements\.product\.value\s*=\s*(['\"])[^'\"]+\1", js_value, updated)
        if updated != raw:
            path.write_text(updated, encoding="utf-8", newline="")
            changed += 1
    print(f"Post-edited {changed} Russian pages without changing href or src values.")


if __name__ == "__main__":
    main()

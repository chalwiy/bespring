#!/usr/bin/env python3
"""Build the three final requested Russian food-ingredient pages."""

from __future__ import annotations

import importlib
from pathlib import Path

from build_final_spanish_food_pages import PRODUCTS as SOURCE
from build_requested_russian_food_pages import BASE, page

ROOT = Path(__file__).resolve().parents[1]

RU = {
    "encapsulated-sorbic-acid": {
        "name": "Инкапсулированная сорбиновая кислота",
        "title": "Инкапсулированная сорбиновая кислота | Поставщик оптом",
        "description": "Пищевая инкапсулированная сорбиновая кислота с 83–87% активного вещества. Покрытие, высвобождение, фракция, COA и оптовая поставка.",
        "summary": "Инкапсулированная сорбиновая кислота — это консервирующая композиция, в которой сорбиновая кислота покрыта пищевым жировым носителем. Оболочка может отсрочить контакт активного вещества с тестом и снизить преждевременное взаимодействие; фактический профиль высвобождения проверяют в конкретном процессе покупателя.",
        "functions": ["Контролируемое внесение сорбиновой кислоты как активного компонента против плесени", "Изменение момента высвобождения за счёт липидной оболочки", "Снижение преждевременного воздействия на дрожжи или чувствительные ингредиенты после подтверждения в рецептуре", "Поддержка валидированной системы обеспечения срока годности"],
        "applications": ["Хлебопечение и ферментированное тесто", "Сухие хлебопекарные смеси", "Начинки и продукты с промежуточной влажностью", "Другие разрешённые продукты после проверки высвобождения активного вещества"],
        "criteria": ["Содержание активной сорбиновой кислоты и база расчёта", "Состав и декларирование оболочки, включая её пищевой статус", "Метод или кривая высвобождения в реальных условиях смешивания и выпечки", "Гранулометрический состав, однородность, микробиология и стабильность"],
        "note": "Готовый продукт представляет собой композицию: E200/INS 200 и CAS 110-44-1 относятся к активной сорбиновой кислоте, а не задают универсальную идентичность всей инкапсулированной частицы. Уточняйте состав, маркировку и допустимость на рынке назначения.",
    },
    "monosodium-glutamate-msg": {
        "name": "Глутамат натрия (MSG)",
        "title": "Глутамат натрия пищевой E621 оптом | Поставщик MSG",
        "description": "Пищевой глутамат натрия MSG E621 с содержанием ≥99%. Проверьте фракцию, чистоту, COA, упаковку и условия оптовой поставки.",
        "summary": "L-глутамат натрия, известный как глутамат натрия или MSG, представляет собой натриевую соль L-глутаминовой кислоты. Его применяют как усилитель вкуса умами в подходящих солёных продуктах и смесях при соблюдении требований рынка назначения.",
        "functions": ["Усиление вкуса умами", "Формирование более полного солёного и мясного вкусового профиля", "Сенсорное усиление смесей приправ", "Повышение выраженности вкуса без замены сбалансированной рецептуры"],
        "applications": ["Приправы и сухие вкусоароматические смеси", "Супы, бульоны и соусы", "Лапша быстрого приготовления и снеки", "Переработанные мясные, рыбные и растительные продукты"],
        "criteria": ["Содержание глутамата натрия, удельное вращение и светопропускание", "Согласованная фракция для дозирования, смешивания и растворения", "Потери при высушивании, pH, металлы и другие примеси", "Сенсорные испытания в конечной рецептуре и учёт дополнительного натрия"],
        "note": "В коммерческих предложениях встречаются обозначения MSG, глутамат натрия и E621. При квалификации подтвердите, что спецификация относится к моногидрату L-глутамата натрия, и договоритесь о гранулометрии.",
    },
    "sodium-metabisulfite": {
        "name": "Метабисульфит натрия",
        "title": "Метабисульфит натрия пищевой E223 | Поставщик оптом",
        "description": "Пищевой метабисульфит натрия E223 для поставок B2B. Содержание Na₂S₂O₅ и SO₂, pH, сульфиты, COA, мешки 25 кг и оптовая цена.",
        "summary": "Метабисульфит натрия, также называемый пиросульфитом или дисульфитом натрия, — это сульфит, который в разрешённых категориях пищевой продукции может выполнять функции антиоксиданта, средства против потемнения, консерванта или улучшителя муки.",
        "functions": ["Антиоксидантное действие в совместимых процессах", "Сдерживание потемнения в разрешённых применениях", "Выделение диоксида серы в условиях использования", "Консервирующее действие при обязательной технологической и нормативной проверке"],
        "applications": ["Переработанные фрукты и овощи в разрешённых категориях", "Картофельные продукты и другие матрицы, склонные к потемнению", "Отдельные процессы виноделия и производства напитков", "Разрешённые хлебопекарные и технологические применения"],
        "criteria": ["Массовая доля Na₂S₂O₅, содержание SO₂, pH и нерастворимые вещества", "Железо, мышьяк, свинец и другие показатели с однозначными единицами и знаками предела", "Влага, стабильность и барьерная упаковка от воздуха и воды", "Допустимый уровень, остаточный SO₂ и требования к указанию сульфитов на этикетке"],
        "note": "Диоксид серы и сульфиты требуют особого внимания при маркировке. Для рынка ЕАЭС проверяйте действующую редакцию ТР ТС 022/2011, категорию продукта и суммарное содержание в пересчёте на SO₂; нормативное решение принимают по готовому продукту.",
    },
}


def add_ru_hreflang(slug: str) -> None:
    path = ROOT / "products" / "food-ingredients" / f"{slug}.html"
    text = path.read_text(encoding="utf-8")
    if 'hreflang="ru"' not in text:
        link = f'<link rel="alternate" hreflang="ru" href="{BASE}/ru/products/food-ingredients/{slug}.html">'
        text = text.replace('<link rel="alternate" hreflang="x-default"', link + '<link rel="alternate" hreflang="x-default"', 1)
        path.write_text(text, encoding="utf-8")


def update_listing() -> None:
    path = ROOT / "ru" / "products" / "food-ingredients.html"
    text = path.read_text(encoding="utf-8")
    additions = {
        '<li data-product="сорбат кальция | calcium sorbate"><a href="food-ingredients/calcium-sorbate.html">Сорбат кальция</a></li>':
            '<li data-product="сорбат кальция | calcium sorbate"><a href="food-ingredients/calcium-sorbate.html">Сорбат кальция</a></li><li data-product="инкапсулированная сорбиновая кислота | encapsulated sorbic acid | e200"><a href="food-ingredients/encapsulated-sorbic-acid.html">Инкапсулированная сорбиновая кислота</a></li><li data-product="метабисульфит натрия | пиросульфит натрия | дисульфит натрия | sodium metabisulfite | smbs | e223"><a href="food-ingredients/sodium-metabisulfite.html">Метабисульфит натрия</a></li>',
        '<li data-product="ванилин | vanillin"><a href="food-ingredients/vanillin.html">Ванилин</a></li>':
            '<li data-product="ванилин | vanillin"><a href="food-ingredients/vanillin.html">Ванилин</a></li><li data-product="глутамат натрия | l-глутамат натрия | monosodium glutamate | msg | e621"><a href="food-ingredients/monosodium-glutamate-msg.html">Глутамат натрия (MSG)</a></li>',
    }
    for anchor, replacement in additions.items():
        if replacement not in text:
            if anchor not in text:
                raise RuntimeError(f"Listing anchor not found: {anchor}")
            text = text.replace(anchor, replacement, 1)
    text = text.replace('<span>9 материалов</span>', '<span>11 материалов</span>', 1)
    marker = '<article class="pc-family" id="flavors-dairy-powders"'
    before, after = text.split(marker, 1)
    after = after.replace('<span>3 материала</span>', '<span>4 материала</span>', 1)
    path.write_text(before + marker + after, encoding="utf-8")


def main() -> None:
    out = ROOT / "ru" / "products" / "food-ingredients"
    for slug, product in RU.items():
        (out / f"{slug}.html").write_text(page(slug, product, SOURCE[slug]), encoding="utf-8")
        add_ru_hreflang(slug)
    update_listing()
    importlib.import_module("build_industry_application_pages").rebuild_sitemap()
    print(f"Built {len(RU)} Russian pages, updated listing and sitemap")


if __name__ == "__main__":
    main()

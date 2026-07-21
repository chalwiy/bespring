#!/usr/bin/env python3
"""Post-edit the newly localized Russian product and solution pages."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import localize_new_pages as localizer


PRODUCTS = {
    "calcium-citrate": "цитрат кальция",
    "carrageenan": "каррагинан",
    "dipotassium-phosphate-dkp": "фосфат калия двузамещённый (DKP)",
    "disodium-phosphate-dsp": "фосфат натрия двузамещённый (DSP)",
    "guar-gum": "гуаровая камедь",
    "konjac-gum": "конжаковая камедь",
    "magnesium-carbonate": "карбонат магния",
    "magnesium-citrate": "цитрат магния",
    "monopotassium-phosphate-mkp": "фосфат калия однозамещённый (MKP)",
    "potassium-citrate": "цитрат калия",
    "potassium-metaphosphate-kmp": "метафосфат калия (KMP)",
    "potassium-sorbate": "сорбат калия",
    "potassium-tripolyphosphate-ktpp": "триполифосфат калия (KTPP)",
    "sodium-acid-pyrophosphate-sapp": "кислый пирофосфат натрия (SAPP)",
    "sodium-alginate": "альгинат натрия",
    "sodium-citrate": "цитрат натрия",
    "sodium-dihydrogen-phosphate-msp": "фосфат натрия однозамещённый (MSP)",
    "sodium-propionate": "пропионат натрия",
    "sodium-trimetaphosphate-stmp": "триметафосфат натрия (STMP)",
    "tetrasodium-pyrophosphate-tspp": "тетранатрий пирофосфат (TSPP)",
    "tricalcium-phosphate-tcp": "фосфат кальция трёхзамещённый (TCP)",
    "tripotassium-phosphate-tkp": "фосфат калия трёхзамещённый (TKP)",
    "trisodium-phosphate-tsp": "фосфат натрия трёхзамещённый (TSP)",
    "xanthan-gum": "ксантановая камедь",
    "zinc-citrate": "цитрат цинка",
}

SOLUTIONS = {
    "meat-poultry-phosphate-systems": "Ингредиенты для мясной продукции и птицы",
    "seafood-phosphate-selection": "Ингредиенты для рыбы и морепродуктов",
    "bakery-leavening-phosphate-solutions": "Ингредиенты для хлебопекарной промышленности",
    "dairy-cheese-ingredient-solutions": "Ингредиенты для молочной продукции и сыров",
    "beverage-formulation-ingredient-solutions": "Ингредиенты для производства напитков",
    "prepared-food-sauce-filling-solutions": "Ингредиенты для готовых продуктов, соусов и начинок",
    "poultry-feed-phosphate-qualification": "Ингредиенты для кормов для птицы",
    "swine-feed-phosphate-selection": "Ингредиенты для кормов для свиней",
    "ruminant-mineral-premix-phosphate-systems": "Ингредиенты для кормления жвачных животных",
    "aquaculture-feed-ingredient-solutions": "Ингредиенты для кормов для аквакультуры",
    "feed-premix-flow-trace-mineral-compatibility": "Ингредиенты для премиксов и комбикормов",
    "laundry-detergent-ingredient-solutions": "Ингредиенты для средств машинной стирки",
    "hard-surface-cleaner-ingredient-solutions": "Ингредиенты для очистителей твёрдых поверхностей",
    "industrial-degreaser-formulation-ingredients": "Ингредиенты для промышленных обезжиривателей",
    "acid-cleaner-descaler-ingredient-solutions": "Ингредиенты для кислотных очистителей и средств удаления накипи",
    "institutional-cleaning-hygiene-ingredients": "Ингредиенты для профессиональной уборки и гигиены",
    "industrial-plant-cleaning-chemical-systems": "Химические системы для очистки промышленных установок",
    "raw-water-clarification-coagulant-solutions": "Коагулянты для осветления исходной воды",
    "industrial-wastewater-coagulant-selection": "Химическая очистка промышленных сточных вод",
    "cooling-water-biofouling-control-chemicals": "Контроль биообрастания в системах охлаждающей воды",
    "industrial-water-intake-biofouling-control": "Контроль биообрастания промышленных водозаборов",
    "boiler-condensate-neutralizing-amine-solutions": "Нейтрализующие амины для котлов и конденсата",
    "process-water-reuse-chemical-solutions": "Химические решения для оборотной технологической воды",
    "mine-water-treatment-chemical-solutions": "Химическая очистка шахтных и карьерных вод",
    "mineral-leaching-chemical-solutions": "Реагенты для выщелачивания минерального сырья",
    "mineral-flotation-reagent-solutions": "Реагенты для флотации минерального сырья",
    "smelting-electrowinning-chemical-inputs": "Химические реагенты для плавки и электроэкстракции",
    "mineral-refining-processing-chemicals": "Химикаты для рафинирования и переработки минерального сырья",
    "fertigation-phosphate-fertilizer-selection": "Фосфатные удобрения для фертигации",
    "foliar-phosphorus-potassium-solutions": "Фосфорно-калийные решения для листовой подкормки",
    "water-soluble-fertilizer-raw-material-qualification": "Сырьё для водорастворимых удобрений",
    "greenhouse-fertilizer-stock-tank-compatibility": "Питательные растворы для беспочвенного выращивания",
    "compound-fertilizer-phosphate-raw-materials": "Фосфатное сырьё для комплексных удобрений",
    "specialty-crop-fertilizer-programs": "Программы питания специальных культур",
}

SEO_SHORT = {
    "Ингредиенты для кислотных очистителей и средств удаления накипи": "Кислотные очистители и средства от накипи",
    "Контроль биообрастания в системах охлаждающей воды": "Контроль биообрастания охлаждающей воды",
    "Химикаты для рафинирования и переработки минерального сырья": "Химикаты для переработки минерального сырья",
    "Ингредиенты для готовых продуктов, соусов и начинок": "Ингредиенты для соусов и готовых продуктов",
    "Ингредиенты для профессиональной уборки и гигиены": "Ингредиенты для профессионального клининга",
    "Химические системы для очистки промышленных установок": "Очистка промышленных установок",
    "Химические решения для оборотной технологической воды": "Химикаты для оборотной воды",
    "Химические реагенты для плавки и электроэкстракции": "Реагенты для плавки и электроэкстракции",
    "Питательные растворы для беспочвенного выращивания": "Растворы для беспочвенного выращивания",
}

REPLACEMENTS = [
    ("Проблема первая", "Сначала определите проблему"),
    ("цель приложения", "цель применения"),
    ("Широкий скрининг", "Предварительный отбор"),
    ("Базовые, кандидатские и пилотные испытания", "Контрольные, сравнительные и пилотные испытания"),
    ("Класс, COA, TDS, SDS и логистика", "Марка, COA, TDS, SDS и логистика"),
    ("Специальное утверждение заявки", "Проверка для конкретного применения"),
    ("План доказывания", "План испытаний"),
    ("Ответы на поисковые вопросы", "Частые вопросы"),
    ("Скриншоты из игры Pickup And Equalization", "Поглощение и равномерность распределения рассола"),
    ("Решения Bakery Ingredient & Formulation", "Решения для хлебопекарной промышленности"),
    ("камедь Xanthan", "ксантановая камедь"), ("камедь Guar", "гуаровая камедь"),
    ("Премикс Flow, Caking and Storage Stability", "Текучесть, слёживаемость и стабильность премикса при хранении"),
    ("Premix & Compound Feed Ингредиенты", "Ингредиенты для премиксов и комбикормов"),
    ("Xanthan Gum", "ксантановая камедь"), ("Xanthan gum", "ксантановая камедь"),
    ("Guar Gum", "гуаровая камедь"), ("Konjac Gum", "конжаковая камедь"),
    ("Language selection", "Выбор языка"),
    ("кормовой мельницы", "комбикормового завода"), ("кормовой мельницы", "комбикормового завода"),
    ("кормовая мельница", "комбикормовый завод"),
    ("аквафедов", "кормов для аквакультуры"), ("аквафеидных", "кормов для аквакультуры"),
    ("поведение поплавка или раковины", "всплытие или погружение гранул"),
    ("минерал плохого размера", "минеральный ингредиент с неподходящим размером частиц"),
    ("шорт-лист", "перечень"), ("Шорт-лист", "Перечень"),
    ("Вклады, которые могут изменить это решение", "Данные, влияющие на это решение"),
    ("Они не являются общими полями формы", "Это не формальные поля анкеты"),
    ("Что делает каждый кандидат, и что должно быть оспорено", "Что даёт каждый вариант и что необходимо проверить"),
    ("Таблица связывает продукты с функциональной гипотезой. Это экранирующая карта, а не формула или подразумеваемое разрешение на использование каждого перечисленного материала.",
     "Таблица связывает каждый продукт с предполагаемой функцией. Она предназначена для первичного отбора, а не является рецептурой или разрешением на применение."),
    ("Преобразование технической гипотезы в повторяемые доказательства", "Проверка технической гипотезы воспроизводимыми испытаниями"),
    ("Диагностировать механизм", "Диагностика механизма"),
    ("Дизайн сравнения", "План сравнения"),
    ("Постройте контроль вокруг реального решения", "Постройте контрольное испытание вокруг реальной задачи"),
    ("Бросить вызов результату", "Проверка устойчивости результата"),
    ("Повторить лидера", "Повторите лучший вариант"), ("Повторите лидера", "Повторите лучший вариант"),
    ("Заморозить утвержденный класс", "Закрепление утверждённой марки"),
    ("другой класс требует проверки", "другая марка требует повторной проверки"),
    ("Измерять результаты, которые определяют одобрение", "Показатели, определяющие одобрение"),
    ("Используйте это в качестве первого диагностического сигнала.", "Используйте этот показатель как первый диагностический сигнал."),
    ("Сообщите об этом результате для контроля и каждого кандидата в соответствующих условиях.",
     "Зафиксируйте этот результат для контроля и каждого варианта в сопоставимых условиях."),
    ("Задайте поставщикам вопросы, которые влияют на процесс", "Задайте поставщикам вопросы, необходимые для принятия решения"),
    ("полезное исследование", "корректно составленный технический запрос"),
    ("механизм отказа", "причину проблемы"),
    ("предполагаемые доказательства", "необходимые подтверждающие данные"),
    ("а не только запросить", "а не ограничиваться запросом"),
    ("Точный контроль поставок", "Точные требования к поставке"),
    ("Запрос идентификации, оценки, анализа, критических примесей, физической формы, спецификации, последних COA, TDS, SDS и соответствующих деклараций.",
     "Запросите идентификацию, марку, содержание основного вещества, критические примеси, физическую форму, спецификацию, актуальный COA, TDS, SDS и необходимые декларации."),
    ("Судебное разбирательство и доставка", "Испытание и поставка"),
    ("выборочное и пилотное количество", "количество образца и пилотной партии"),
    ("окно доставки", "срок поставки"),
    ("Продолжайте портфолио продуктов", "Перейдите к каталогу продукции"),
    ("Используйте страницы продуктов для идентификации и спецификации, а также отраслевую страницу для более широкой карты приложений.",
     "На страницах продуктов приведены данные об идентификации и спецификациях, а в отраслевом разделе — другие области применения."),
    ("Поделитесь данными, стоящими за вашей целью приложения.", "Предоставьте исходные данные по вашей задаче."),
    ("Включите процесс, текущую проблему, целевой рынок, объем испытаний, годовой спрос и необходимые документы.",
     "Укажите процесс, текущую проблему, целевой рынок, объём испытаний, годовую потребность и необходимые документы."),
    ("Продукты питания, корма, очистка, очистка воды, добыча полезных ископаемых и сельскохозяйственные решения для международных поставок B2B.",
     "Сырьевые решения для пищевой и кормовой промышленности, клининга, водоочистки, горнодобывающей отрасли и сельского хозяйства на международном рынке B2B."),
    ("правовой статус", "нормативный статус"), ("точную оценку", "точную марку"),
    ("квалифицированного технического обзора", "квалифицированной технической проверки"),
    ("Продукты питания ксантановая камедь FAQ", "Частые вопросы о ксантановой камеди"),
    ("Пищевая марка ксантановая камедь", "Ксантановая камедь пищевого качества"),
    ("Обычные пищевые добавки ксантановая камедь", "Типичные области применения ксантановой камеди"),
    ("Желтухи и консервы", "Желе и консервированные продукты"),
    ("Пекарня и соусы", "Хлебобулочные изделия и соусы"),
    ("цепляния", "удержания воды"),
    ("пакетный COA", "COA на партию"), ("пакет COA", "COA на партию"),
    ("Запросить цитату из", "Запросить коммерческое предложение на"),
    ("поддонов", "паллет"),
    ("фертигация фосфатные удобрения растворы", "Фосфатные удобрения для фертигации"),
    ("Фертигация фосфатные удобрения растворы", "Фосфатные удобрения для фертигации"),
    ("оплодотворения", "фертигации"), ("Оплодотворения", "Фертигации"),
    ("блендеров удобрений", "производителей удобрений"),
    ("ирригационных инъекций", "внесения через систему орошения"),
    ("ирригационной инъекции", "внесения через систему орошения"),
    ("простой воде", "чистой воде"),
    ("исходную воду", "исходную поливную воду"), ("исходной воде", "исходной поливной воде"),
    ("концентрированный запас", "концентрированный маточный раствор"),
    ("концентрация запасов", "концентрация маточного раствора"),
    ("конструкции резервуара", "схеме приготовления маточного раствора"),
    ("конструкции источника воды и резервуара", "качеству исходной воды и схеме приготовления маточного раствора"),
    ("дизайн танка", "схема бака маточного раствора"),
    ("однородностью излучателя", "равномерностью работы эмиттеров"),
    ("равномерностью излучателя", "равномерностью работы эмиттеров"),
    ("давлением фильтра", "перепадом давления на фильтре"),
    ("ясностью", "прозрачностью"),
    ("стадия урожая", "фаза развития культуры"), ("стадия сбора урожая", "фаза развития культуры"),
    ("Урожай, стадия роста и питательная цель", "Культура, фаза развития и цель питания"),
    ("pH, Ec", "pH, электропроводность"),
    ("месторождения полезных ископаемых", "минеральные отложения"),
    ("идентифицированное месторождение", "выявленные отложения"),
    ("тюленевая совместимость", "совместимость с уплотнениями"),
    ("Базовая металлическая и тюленевая совместимость", "Совместимость с основным металлом и уплотнениями"),
    ("Spent-Bath pH и состояние промывания", "pH отработанного раствора и качество промывки"),
    ("кислотная прочность", "концентрация кислоты"),
    ("дескальирования", "удаления накипи"), ("дескалер", "средство для удаления накипи"),
    ("упаковка ингибиторов", "комплекс ингибиторов"), ("упаковка ингибитора", "комплекс ингибиторов"),
    ("путь разряда", "способ утилизации"), ("маршрут отходов", "способ утилизации отходов"),
    ("Центральное решение по поиску заключается в том", "Основной вопрос при выборе заключается в том"),
    ("Центральное решение по поиску источников заключается в том", "Основной вопрос при выборе заключается в том"),
    ("Центральное решение в отношении источников заключается в том", "Основной вопрос при выборе заключается в том"),
    ("Центральное решение о поиске заключается в том", "Основной вопрос при выборе заключается в том"),
    ("Воспроизводить это состояние во время скрининга.", "Воспроизведите эти условия при проверке."),
    ("Воспроизведите это состояние во время скрининга.", "Воспроизведите эти условия при проверке."),
    ("Записывайте обязательные юридические требования, правила безопасности и ограничения для клиентов до запроса образцов; никогда не делайте вывод о разрешении на использование названия продукта.",
     "До запроса образцов зафиксируйте обязательные нормативные требования, правила безопасности и ограничения заказчика; название продукта само по себе не означает разрешение на применение."),
    ("Передача проверенной личности, критических ограничений, методов, документов, правил упаковки и контроля изменений в покупку; другая марка требует повторной проверки.",
     "Зафиксируйте проверенную идентичность продукта, критические пределы, методы, документы, требования к упаковке и порядок управления изменениями; другая марка требует повторной проверки."),
    ("до расширения", "до масштабирования"),
    ("Определите шкалу перед выбором кислоты", "Определите состав отложений перед выбором кислоты"),
    ("промышленных обезвоживающих химических веществ для шкалы кальция и отложений ржавчины",
     "промышленных средств удаления накипи и ржавчины"),
    ("промышленные химикаты для масштабирования кальция и отложений ржавчины",
     "промышленные средства удаления накипи и ржавчины"),
    ("хлористую кислоту", "соляную кислоту"),
    ("Известковые, оксид железа и смешанные органически-минеральные отложения",
     "Известковые отложения, оксиды железа и смешанные органоминеральные загрязнения"),
    ("Известковый, оксид железа и смешанные органически-минеральные отложения",
     "Известковые отложения, оксиды железа и смешанные органоминеральные загрязнения"),
    ("Определите месторождение", "Определите состав отложений"),
    ("эволюцию газа", "газовыделение"),
    ("емкость отработанной ванны", "ресурс рабочего раствора"),
    ("конечную точку промывания", "качество промывки"),
    ("ополаскивайте конечную точку", "оцените качество промывки"),
    ("шкала коэффициента растворения", "Скорость растворения отложений"),
    ("Базовая металлическая и совместимость с уплотнениями", "Совместимость с основным металлом и уплотнениями"),
    ("какой средство для удаления накипи", "какое средство для удаления накипи"),
    ("Состав месторождения", "Состав отложений"),
    ("у каждого кандидата своя работа", "каждый из них выполняет свою функцию"),
    ("они не должны быть представлены в качестве взаимозаменяемых альтернатив", "их не следует считать взаимозаменяемыми"),
    ("они не должны представляться как взаимозаменяемые альтернативы", "их не следует считать взаимозаменяемыми"),
    ("Рекомендуемый путь доказательства", "Рекомендуемая схема проверки"),
    ("Применяют измеренные величины, а не предположения.", "Используйте измеренные значения, а не предположения."),
    ("Применять измеренные значения, а не предположения.", "Используйте измеренные значения, а не предположения."),
    ("Может ли эта страница предоставить окончательную формулу или дозировку?", "Можно ли использовать эту страницу как готовую рецептуру или указание дозировки?"),
    ("Нет. Он определяет технически релевантный перечень и план доказательств. Окончательный уровень использования и утверждение требуют точной оценки, фактических данных процесса, квалифицированной технической проверки и применимых местных правил.",
     "Нет. Здесь приведены технически обоснованный перечень вариантов и план проверки. Окончательная дозировка и утверждение требуют согласованной марки продукта, фактических технологических данных, квалифицированной технической оценки и соблюдения местных требований."),
    ("точной оценки, фактических данных процесса", "согласованной марки продукта, фактических технологических данных"),
]


def polish(value: str) -> str:
    for old, new in REPLACEMENTS:
        value = value.replace(old, new)
    value = re.sub(r"Точные требования к поставке(?: точные требования к поставке)+", "Точные требования к поставке", value)
    value = re.sub(
        r"(?:Это не формальные поля анкеты|Это не общие поля формы|Они не являются общими формовыми полями|Они не являются общими полями формы):.*?\.",
        "Эти данные необходимо зафиксировать или измерить до сравнения вариантов.", value,
    )
    value = value.replace("Последний обзор", "Актуализировано")
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


def set_schema_name(data, display_name: str, kind: str):
    graph = data.get("@graph", []) if isinstance(data, dict) else []
    for item in graph:
        item_type = item.get("@type") if isinstance(item, dict) else None
        if item_type in ({"WebPage", "Service"} if kind == "solution" else {"Product"}):
            item["name"] = display_name
        if item_type == "BreadcrumbList" and item.get("itemListElement"):
            item["itemListElement"][-1]["name"] = display_name


def set_schema_description(doc, display_name: str, kind: str, description: str):
    for node in doc.xpath("//script[@type='application/ld+json']"):
        if not node.text:
            continue
        data = json.loads(node.text)
        for item in data.get("@graph", []) if isinstance(data, dict) else []:
            item_type = item.get("@type") if isinstance(item, dict) else None
            if item_type in ({"WebPage", "Service"} if kind == "solution" else {"WebPage", "Product"}):
                item["description"] = description
                if item_type in {"Service", "Product"}:
                    item["name"] = display_name
        node.text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))


def set_metadata(doc, title: str, description: str):
    title_node = doc.xpath("//title")
    if title_node:
        title_node[0].text = title
    for node in doc.xpath("//meta[@name='description' or @property='og:description' or @name='twitter:description']"):
        node.set("content", description)
    for node in doc.xpath("//meta[@property='og:title' or @name='twitter:title']"):
        node.set("content", title.split(" | ", 1)[0])


def process(path: Path, display_name: str, kind: str, mapping):
    doc = html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))
    source_doc = html.parse(str(ROOT / path.relative_to(ROOT / "ru")), parser=html.HTMLParser(encoding="utf-8"))
    for source_node, current_node in zip(source_doc.xpath("//script[@type='application/ld+json']"), doc.xpath("//script[@type='application/ld+json']")):
        if source_node.text and current_node.text:
            data = translate_schema_from_source(json.loads(source_node.text), json.loads(current_node.text), mapping)
            set_schema_name(data, display_name, kind)
            current_node.text = json.dumps(polish_json(data), ensure_ascii=False, separators=(",", ":"))
    for node in doc.iter():
        if not isinstance(node.tag, str):
            continue
        if node.tag.lower() in {"style", "code", "pre", "script"}:
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
        h1[0].text = display_name[0].upper() + display_name[1:]
    if kind == "product":
        title = f"Поставщик: {display_name} пищевого качества | Bespring"
        description = f"Характеристики, применение, упаковка, минимальный заказ и документация на продукт «{display_name}» пищевого качества от Bespring Chemical."
        overview = doc.xpath("//*[@id='overview']//h2")
        if overview:
            overview[0].text = f"Характеристики продукта «{display_name}» пищевого качества"
        faq = doc.xpath("//*[@id='faq']//h2")
        if faq:
            faq[0].text = f"Частые вопросы: {display_name}"
        quote = doc.xpath("//*[@id='request-quote']//h2")
        if quote:
            quote[0].text = f"Запросить предложение на продукт «{display_name}»"
        fixed_text = {
            "overview": (".//p[contains(@class,'kicker')]", "Кратко о продукте"),
            "applications": (".//p[contains(@class,'kicker')]", "Области применения"),
            "request-quote": (".//p[contains(@class,'kicker')]", "Поставка по согласованной спецификации"),
        }
        for section_id, (xpath, text_value) in fixed_text.items():
            sections = doc.xpath(f"//*[@id='{section_id}']")
            if sections:
                nodes = sections[0].xpath(xpath)
                if nodes:
                    nodes[0].text = text_value
        callout = doc.xpath("//*[@id='overview']//*[contains(@class,'callout')]//h3")
        if callout:
            callout[0].text = "Информация для закупки"
        product_fields = doc.xpath("//form//*[@name='product']")
        for field in product_fields:
            field.set("value", display_name)
    else:
        seo_name = SEO_SHORT.get(display_name, display_name)
        title = f"{seo_name} | Техническое руководство | Bespring"
        description = localizer.shorten_at_word(
            f"Техническое руководство: {display_name.lower()}. Сравнение функций, рисков применения, методов проверки, требований и данных для запроса предложения.", 180
        )
    set_metadata(doc, title, description)
    set_schema_description(doc, display_name, kind, description)
    if kind == "solution":
        variable_intro = doc.xpath("//*[@id='variables']//header/p")
        if variable_intro:
            variable_intro[0].text = "Эти данные необходимо зафиксировать или измерить до сравнения вариантов."
        headings = {
            "selection": "Что даёт каждый вариант и что необходимо проверить",
            "validation": "Проверка технической гипотезы воспроизводимыми испытаниями",
            "metrics": "Показатели, определяющие одобрение",
            "rfq": "Какие данные запросить у поставщика",
            "faq": f"Частые вопросы по теме «{display_name}»",
        }
        for section_id, heading in headings.items():
            nodes = doc.xpath(f"//*[@id='{section_id}']//h2")
            if nodes:
                nodes[0].text = heading
    path.write_text(html.tostring(doc.getroot(), encoding="unicode", method="html", doctype="<!DOCTYPE html>"), encoding="utf-8", newline="\n")


def polish_hub(path: Path):
    doc = html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))
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
    path.write_text(html.tostring(doc.getroot(), encoding="unicode", method="html", doctype="<!DOCTYPE html>"), encoding="utf-8", newline="\n")


def main():
    mapping = localizer.load_cache()["ru"]
    for slug, name in PRODUCTS.items():
        process(ROOT / "ru/products/food-ingredients" / f"{slug}.html", name, "product", mapping)
    for slug, name in SOLUTIONS.items():
        process(ROOT / "ru/solutions" / f"{slug}.html", name, "solution", mapping)
    for filename in (
        "agriculture-solutions.html", "animal-nutrition-solutions.html", "food-industry-solutions.html",
        "industrial-cleaning-solutions.html", "mining-solutions.html", "water-treatment-solutions.html",
    ):
        polish_hub(ROOT / "ru/solutions" / filename)
    print(f"Polished {len(PRODUCTS)} product pages and {len(SOLUTIONS)} solution pages in Russian.")


if __name__ == "__main__":
    main()

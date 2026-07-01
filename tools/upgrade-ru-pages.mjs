import { mkdir, readFile, writeFile, access, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = "https://www.bespringchem.com";

const locales = [
  { dir: "", hreflang: "en", label: "EN" },
  { dir: "zh-cn", hreflang: "zh-CN", label: "简" },
  { dir: "zh-tw", hreflang: "zh-TW", label: "繁" },
  { dir: "es", hreflang: "es", label: "ES" },
  { dir: "pt", hreflang: "pt", label: "PT" },
  { dir: "ru", hreflang: "ru", label: "RU" },
  { dir: "de", hreflang: "de", label: "DE" },
  { dir: "ar", hreflang: "ar", label: "AR" }
];

const localeDirs = new Set(locales.filter((item) => item.dir).map((item) => item.dir));
const ignoredFiles = new Set(["products/food-ingredients1 - 拷贝.html"]);

const exactMirrorPages = new Set([
  "index.html",
  "products.html",
  "services.html",
  "news.html",
  "contact.html",
  "about/company-profile.html",
  "about/production-bases.html",
  "about/global-markets.html",
  "about/certifications.html",
  "about/core-values.html",
  "products/food-ingredients.html",
  "products/animal-nutrition.html",
  "products/home-care-industrial-cleaning.html",
  "products/water-treatment.html",
  "products/mining.html",
  "products/agricultural-fertilizers.html"
]);

const solutionFallbacks = new Map([
  ["Solutions/food-industry-solutions.html", "products/food-ingredients.html"],
  ["Solutions/animal-nutrition-solutions.html", "products/animal-nutrition.html"],
  ["Solutions/water-treatment-solutions.html", "products/water-treatment.html"],
  ["Solutions/industrial-cleaning-solutions.html", "products/home-care-industrial-cleaning.html"],
  ["Solutions/mining-solutions.html", "products/mining.html"],
  ["Solutions/agriculture-solutions.html", "products/agricultural-fertilizers.html"]
]);

const commonReplacements = [
  ["China-based chemical products supplier", "Китайский поставщик химической продукции"],
  ["China-based chemical ingredients supplier", "Китайский поставщик химических ингредиентов"],
  ["China-based chemical and ingredient supplier", "Китайский поставщик химии и ингредиентов"],
  ["China-based supplier of chemical products", "Китайский поставщик химической продукции"],
  ["China-based supplier of food, feed and industrial chemical raw materials for global B2B procurement.", "Китайский поставщик сырья для пищевой, кормовой и промышленной химии для глобальных B2B-закупок."],
  ["Exporting to 60+ Countries", "Экспорт в более чем 60 стран"],
  ["Exporting to 60+ countries", "Экспорт в более чем 60 стран"],
  [">Home<", ">Главная<"],
  [">About Us<", ">О компании<"],
  [">Products<", ">Продукция<"],
  [">Services<", ">Услуги<"],
  [">News<", ">Новости<"],
  [">Contact<", ">Контакты<"],
  [">Quick Links<", ">Быстрые ссылки<"],
  [">Get in Touch<", ">Связаться<"],
  ["Main navigation", "Основная навигация"],
  ["Main Navigation", "Основная навигация"],
  ["Open navigation menu", "Открыть меню навигации"],
  ["Close navigation menu", "Закрыть меню навигации"],
  ["Toggle Navigation Menu", "Переключить меню навигации"],
  ["News &amp; Insights", "Новости и аналитика"],
  ["Procurement guide", "Гид по закупкам"],
  ["Exhibition archive", "Архив выставок"],
  ["Read buyer guide", "Читать гид"],
  ["View event details", "Подробнее о событии"],
  ["Application case", "Кейс применения"],
  ["Application Cases", "Кейсы применения"],
  ["Industry Applications", "Отраслевые решения"],
  ["Reviewed by Bespring Chemical export team", "Проверено экспортной командой Bespring Chemical"],
  ["Guide", "Гид"],
  ["Request a Quote", "Запросить предложение"],
  ["Request a quote", "Запросить предложение"],
  ["Prepare an inquiry", "Подготовить запрос"],
  ["Prepare a product inquiry", "Подготовить продуктовый запрос"],
  ["General inquiries", "Общие запросы"],
  ["Quick conversation", "Быстрый контакт"],
  ["Chat on WhatsApp", "Написать в WhatsApp"],
  ["Request product information, samples, documentation or an export quote from our chemical supply team in Jiangsu, China.", "Запросите информацию о продукции, образцы, документы или экспортное предложение у нашей команды в Цзянсу, Китай."],
  ["Send the product, grade, specification and destination. We will respond with the information needed for a meaningful supply review.", "Отправьте продукт, класс, спецификацию и страну назначения. Мы ответим с информацией, необходимой для предметной коммерческой оценки."],
  ["Have a product question?", "Есть вопрос по продукту?"],
  ["Ask our export team", "Свяжитесь с нашей экспортной командой"],
  ["Latest insights", "Последние материалы"],
  ["Guides for chemical buyers", "Гиды для химических закупщиков"],
  ["Exhibitions archive", "Архив выставок"],
  ["Meetings with international buyers", "Встречи с международными покупателями"],
  ["Continue browsing", "Продолжить просмотр"],
  ["Related product portfolios", "Связанные продуктовые направления"],
  ["On this page", "На этой странице"],
  ["Overview", "Обзор"],
  ["Functions", "Функции"],
  ["Applications", "Применение"],
  ["Specification", "Спецификация"],
  ["Packing", "Упаковка"],
  ["Quote", "Запрос"],
  ["Quick answer", "Краткий ответ"],
  ["Product overview", "Обзор продукта"],
  ["Procurement snapshot", "Краткая закупочная сводка"],
  ["Business email", "Рабочий email"],
  ["Product or application", "Продукт или применение"],
  ["Destination country / port", "Страна / порт назначения"],
  ["Requirements", "Требования"],
  ["Send Quote Request", "Отправить запрос предложения"],
  ["Sales office", "Офис продаж"],
  ["Sales manager", "Менеджер по продажам"],
  ["Choose the easiest way to reach us", "Выберите удобный способ связаться с нами"],
  ["Talk to our sales team", "Свяжитесь с нашей командой продаж"],
  ["Tell us what you need", "Сообщите, что вам нужно"],
  ["Request a product quote", "Запросить коммерческое предложение"],
  ["Discuss Your Application", "Обсудить вашу задачу"],
  ["Browse Food Ingredients", "Смотреть пищевые ингредиенты"],
  ["Where ingredients perform", "Где работают ингредиенты"],
  ["Food processing solutions", "Решения для пищевого производства"],
  ["Food ingredient overview", "Обзор пищевых ингредиентов"],
  ["Browse product portfolios", "Смотреть продуктовые направления"],
  ["Request a product and supply review", "Запросить оценку продукта и поставки"],
  ["Send your requirements", "Отправить требования"],
  ["Contact export sales", "Связаться с экспортным отделом продаж"]
];

const pageSpecificReplacements = {
  "index.html": [
    ["<title>Bespring Chemical | Global Supplier of Food Ingredients, Feed Additives & Industrial Chemicals</title>", "<title>Bespring Chemical | Глобальный поставщик пищевых ингредиентов, кормовых добавок и промышленной химии</title>"],
    ['<meta name="description" content="Bespring Chemical is a global supplier of food ingredients, feed additives, phosphates, water treatment chemicals, mining chemicals and fertilizers. With 50+ years of experience and exports to 60+ countries, we provide reliable raw material solutions worldwide.">', '<meta name="description" content="Bespring Chemical поставляет пищевые ингредиенты, кормовые добавки, фосфаты, реагенты для водоподготовки, горной промышленности и удобрений. Более 50 лет опыта и экспорт в 60+ стран.">'],
    ["Bespring Chemical | China Phosphate Manufacturer Since the 1970s", "Bespring Chemical | Китайский производитель фосфатов с 1970-х годов"],
    ["Bespring Chemical | China Phosphate Manufacturer", "Bespring Chemical | Китайский производитель фосфатов"]
  ],
  "news.html": [
    ["<title>Chemical Industry Insights & Company News | Bespring</title>", "<title>Новости химической отрасли и материалы для закупщиков | Bespring</title>"],
    ['<meta name="description" content="Read procurement guides, chemical product comparisons, export documentation insights and company exhibition updates from Bespring Chemical.">', '<meta name="description" content="Читайте гайды по закупкам, сравнения химической продукции, заметки по экспортной документации и новости выставок Bespring Chemical.">'],
    ["Chemical Industry Insights & Company News | Bespring", "Новости химической отрасли и материалы для закупщиков | Bespring"],
    ["Procurement knowledge &amp; company updates", "Материалы по закупкам и новости компании"],
    ["Chemical Industry Insights &amp; News", "Аналитика и новости химической отрасли"],
    ["Practical product comparisons, supplier-qualification guidance, export documentation notes and verified updates from Bespring Chemical.", "Практические сравнения продуктов, рекомендации по квалификации поставщиков, заметки по экспортным документам и проверенные новости Bespring Chemical."],
    ["Browse Bespring Chemical's international exhibition record and open each event page for dates, location, booth and portfolio focus.", "Изучите международный выставочный архив Bespring Chemical и откройте страницы событий с датами, местом проведения, стендом и фокусом продуктового портфеля."]
  ],
  "contact.html": [
    ["<title>Contact Bespring Chemical | Product Quotes & Export Support</title>", "<title>Связаться с Bespring Chemical | Коммерческие предложения и экспортная поддержка</title>"],
    ['<meta name="description" content="Contact Bespring Chemical in China for food ingredients, feed additives, phosphates and industrial chemical quotes, samples, documents and export support.">', '<meta name="description" content="Свяжитесь с Bespring Chemical в Китае для получения предложений, образцов, документов и экспортной поддержки по пищевым ингредиентам, кормовым добавкам, фосфатам и промышленной химии.">'],
    ["Contact Bespring Chemical", "Связаться с Bespring Chemical"],
    ["Global sales &amp; export support", "Глобальные продажи и экспортная поддержка"],
    ["Let's discuss your ingredient or chemical requirements", "Обсудим ваши требования по ингредиентам и химической продукции"],
    ["Food, feed &amp; industrial grades", "Пищевые, кормовые и промышленные марки"],
    ["Worldwide export support", "Поддержка международного экспорта"],
    ["Technical documents available", "Технические документы доступны"]
  ],
  "services.html": [
    ["<title>Chemical Export & Procurement Support Services | Bespring</title>", "<title>Услуги по экспорту химии и поддержке закупок | Bespring</title>"],
    ['<meta name="description" content="Specification review, supplier coordination, documentation, packaging, warehousing and export logistics support for food, feed and industrial chemical buyers.">', '<meta name="description" content="Проверка спецификаций, координация поставщиков, документы, упаковка, складирование и экспортная логистика для закупщиков пищевой, кормовой и промышленной химии.">'],
    ["Chemical Export & Procurement Support Services | Bespring", "Услуги по экспорту химии и поддержке закупок | Bespring"],
    ["Procurement support beyond supply", "Поддержка закупок beyond supply"],
    ["From specification alignment and document coordination to packaging, warehousing and export logistics, we help international buyers manage the practical work between product selection and delivery.", "От согласования спецификаций и документов до упаковки, складирования и экспортной логистики: мы помогаем международным покупателям организовать практическую работу между выбором продукта и поставкой."]
  ],
  "products/food-ingredients.html": [
    ["<title>Food Ingredients &amp; Additives Supplier | Bespring</title>", "<title>Поставщик пищевых ингредиентов и добавок | Bespring</title>"],
    ['<meta name="description" content="Browse food-grade phosphates, preservatives, acidulants, hydrocolloids, proteins, sweeteners and other food ingredients supplied by Bespring Chemical.">', '<meta name="description" content="Изучите пищевые фосфаты, консерванты, подкислители, гидроколлоиды, белки, подсластители и другие пищевые ингредиенты Bespring Chemical.">'],
    ["Food Ingredients & Additives Supplier | Bespring", "Поставщик пищевых ингредиентов и добавок | Bespring"],
    ["Food Ingredients", "Пищевые ингредиенты"],
    ["Food-grade product portfolio", "Портфель продукции пищевого класса"],
    ["Pishchevye ingredienty i dobavki", "Пищевые ингредиенты и добавки"]
  ],
  "news/stpp-vs-shmp-selection-guide.html": [
    ["STPP vs SHMP: Buyer Comparison Guide | Bespring Chemical", "STPP и SHMP: руководство по сравнению для закупщиков | Bespring Chemical"],
    ["STPP vs SHMP: How Industrial Buyers Should Compare the Two Phosphates", "STPP и SHMP: как промышленным закупщикам сравнивать два фосфата"],
    ["Compare STPP and SHMP by chemical identity, function, grade, specification, physical form and supplier-qualification requirements.", "Сравните STPP и SHMP по химической идентичности, функции, классу, спецификации, физической форме и требованиям к квалификации поставщика."]
  ],
  "Solutions/food-industry-solutions.html": [
    ["Food Ingredient &amp; Processing Solutions | Bespring Chemical", "Решения для пищевых ингредиентов и процессов | Bespring Chemical"],
    ["Food Ingredient Solutions for Processing &amp; Formulation", "Решения по пищевым ингредиентам для производства и рецептур"],
    ["Food ingredient solutions for texture, stability, preservation, fortification and processing across bakery, dairy, beverage, meat and prepared foods.", "Решения по пищевым ингредиентам для текстуры, стабильности, сохранности, обогащения и производства в хлебопечении, молочной отрасли, напитках, мясной и готовой продукции."]
  ],
  "applications/food-grade-stpp-meat-processing.html": [
    ["Food Grade STPP for Meat Processing | Application Case", "Пищевой STPP для мясопереработки | Кейс применения"],
    ["Food Grade STPP for Meat Processing", "Пищевой STPP для мясопереработки"],
    ["See how food grade STPP supports moisture management, texture and emulsion stability in meat processing. Includes selection, validation and sourcing guidance.", "Посмотрите, как пищевой STPP помогает управлять влагой, текстурой и стабильностью эмульсии в мясопереработке. Включает рекомендации по выбору, валидации и закупке."]
  ]
};

const titleOverrides = {
  "index.html": "Bespring Chemical | Глобальный поставщик пищевых ингредиентов, кормовых добавок и промышленной химии",
  "news.html": "Новости химической отрасли и материалы для закупщиков | Bespring",
  "contact.html": "Связаться с Bespring Chemical | Коммерческие предложения и экспортная поддержка",
  "services.html": "Услуги по экспорту химии и поддержке закупок | Bespring",
  "products/food-ingredients.html": "Поставщик пищевых ингредиентов и добавок | Bespring",
  "products/food-ingredients/sodium-tripolyphosphate-stpp.html": "Поставщик пищевого STPP | Триполифосфат натрия",
  "products/food-ingredients/sodium-hexametaphosphate-shmp.html": "Поставщик пищевого SHMP | Гексаметафосфат натрия",
  "products/food-ingredients/tetrapotassium-pyrophosphate-tkpp.html": "Поставщик пищевого TKPP | INS 450(v)",
  "products/food-ingredients/calcium-propionate.html": "Поставщик пищевого пропионата кальция | E282",
  "products/food-ingredients/citric-acid.html": "Поставщик пищевой лимонной кислоты | E330",
  "products/food-ingredients/dicalcium-phosphate-dcp.html": "Поставщик пищевого дикальцийфосфата | DCP E341(ii)",
  "products/food-ingredients/monocalcium-phosphate-mcp.html": "Поставщик пищевого монокальцийфосфата | MCP E341(i)",
  "products/food-ingredients/sodium-aluminum-phosphate-salp.html": "Поставщик пищевого SALP | Натрий-алюминиевый фосфат",
  "products/food-ingredients/sodium-carboxymethyl-cellulose-cmc.html": "Поставщик пищевой CMC | Карбоксиметилцеллюлоза натрия",
  "news/stpp-vs-shmp-selection-guide.html": "STPP и SHMP: руководство по сравнению для закупщиков | Bespring Chemical",
  "news/mcp-vs-dcp-feed-phosphate-guide.html": "MCP и DCP для кормов: руководство по квалификации для закупщиков | Bespring Chemical",
  "news/chemical-export-document-checklist.html": "Чек-лист импортных документов для международных B2B-закупщиков химии | Bespring Chemical",
  "news/food-grade-vs-technical-grade-phosphates.html": "Пищевые и технические фосфаты: что должны проверить закупщики | Bespring Chemical",
  "news/how-to-qualify-chemical-supplier-china.html": "Как квалифицировать химического поставщика в Китае: практический чек-лист | Bespring Chemical",
  "news/global-ingredients-show-russia-2025.html": "Global Ingredients Show 2025 в Москве | Bespring Chemical",
  "news/global-ingredients-show-russia-2024.html": "Global Ingredients Show 2024 в Москве | Bespring Chemical",
  "news/fi-vietnam-2024.html": "Fi Vietnam 2024 | Bespring Chemical",
  "news/fi-europe-frankfurt-2023.html": "Fi Europe 2023 во Франкфурте | Bespring Chemical",
  "news/vietfood-beverage-2023.html": "Vietfood & Beverage 2023 | Bespring Chemical",
  "applications/food-grade-stpp-meat-processing.html": "Пищевой STPP для мясопереработки | Кейс применения",
  "applications/calcium-propionate-packaged-bread.html": "Пропионат кальция для упакованного хлеба | Кейс применения",
  "applications/mcp-phosphorus-source-poultry-feed.html": "MCP как источник фосфора в кормах для птицы | Кейс применения",
  "applications/shmp-industrial-process-water.html": "SHMP в промышленной технологической воде | Кейс применения",
  "applications/stpp-builder-powder-detergents.html": "STPP как builder в порошковых моющих средствах | Кейс применения",
  "applications/tkpp-frozen-seafood-processing.html": "TKPP для переработки замороженных морепродуктов | Кейс применения",
  "Solutions/food-industry-solutions.html": "Решения для пищевых ингредиентов и процессов | Bespring Chemical",
  "Solutions/animal-nutrition-solutions.html": "Решения для кормов и питания животных | Bespring Chemical",
  "Solutions/water-treatment-solutions.html": "Решения для водоподготовки | Bespring Chemical",
  "Solutions/industrial-cleaning-solutions.html": "Решения для промышленной и бытовой очистки | Bespring Chemical",
  "Solutions/mining-solutions.html": "Химические решения для горной промышленности | Bespring Chemical",
  "Solutions/agriculture-solutions.html": "Решения для сельского хозяйства и удобрений | Bespring Chemical"
};

const descriptionOverrides = {
  "index.html": "Bespring Chemical поставляет пищевые ингредиенты, кормовые добавки, фосфаты, реагенты для водоподготовки, горной промышленности и удобрения. Более 50 лет опыта и экспорт в 60+ стран.",
  "news.html": "Читайте гайды по закупкам, сравнения химической продукции, заметки по экспортной документации и новости выставок Bespring Chemical.",
  "contact.html": "Свяжитесь с Bespring Chemical в Китае для получения предложений, образцов, документов и экспортной поддержки по пищевым ингредиентам, кормовым добавкам, фосфатам и промышленной химии.",
  "services.html": "Проверка спецификаций, координация поставщиков, документы, упаковка, складирование и экспортная логистика для закупщиков пищевой, кормовой и промышленной химии.",
  "products/food-ingredients.html": "Изучите пищевые фосфаты, консерванты, подкислители, гидроколлоиды, белки, подсластители и другие пищевые ингредиенты Bespring Chemical.",
  "products/food-ingredients/sodium-tripolyphosphate-stpp.html": "Пищевой триполифосфат натрия (STPP/INS 451(i)) для мяса, морепродуктов и молочной продукции. Проверьте спецификацию, упаковку и загрузку контейнера.",
  "products/food-ingredients/sodium-hexametaphosphate-shmp.html": "Пищевой гексаметафосфат натрия для пищевых и напиточных применений. Проверьте идентичность, спецификацию, упаковку и документы.",
  "products/food-ingredients/tetrapotassium-pyrophosphate-tkpp.html": "Пищевой TKPP для морепродуктов, мясных и технологических применений. Проверьте спецификацию, формат и данные для запроса.",
  "products/food-ingredients/calcium-propionate.html": "Пищевой пропионат кальция для хлебопечения и управления сроком годности. Проверьте спецификацию, упаковку и коммерческие данные.",
  "products/food-ingredients/citric-acid.html": "Пищевая лимонная кислота для подкисления, вкуса и рецептур напитков или продуктов. Проверьте спецификацию и детали закупки.",
  "products/food-ingredients/dicalcium-phosphate-dcp.html": "Пищевой дикальцийфосфат для обогащения и пищевых рецептур. Проверьте спецификацию, упаковку и документальную поддержку.",
  "products/food-ingredients/monocalcium-phosphate-mcp.html": "Пищевой монокальцийфосфат для разрыхления и обогащения. Проверьте спецификации, упаковку и данные для коммерческого запроса.",
  "products/food-ingredients/sodium-aluminum-phosphate-salp.html": "Пищевой SALP для хлебопекарных систем и рецептур. Проверьте спецификацию, упаковку и доступные документы.",
  "products/food-ingredients/sodium-carboxymethyl-cellulose-cmc.html": "Пищевая CMC для текстуры, суспендирования и стабильности. Проверьте спецификацию, упаковку и коммерческую поддержку.",
  "news/stpp-vs-shmp-selection-guide.html": "Сравните STPP и SHMP по химической идентичности, функции, классу, спецификации, физической форме и требованиям к квалификации поставщика.",
  "applications/food-grade-stpp-meat-processing.html": "Узнайте, как пищевой STPP помогает управлять влагой, текстурой и стабильностью эмульсии в мясопереработке."
};

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

function normalizePath(value) {
  return value.replace(/\\/g, "/");
}

function pageUrl(dir, file) {
  return dir ? `${dir}/${file}` : file;
}

function buildTargetUrl(dir, file) {
  return `${site}/${file === "index.html" ? `${dir}/` : pageUrl(dir, file)}`.replace(/\/{2,}/g, "/").replace("https:/", "https://");
}

function ensureHtmlLang(html) {
  if (/<html[^>]*lang=/i.test(html)) {
    return html.replace(/<html([^>]*?)lang="[^"]*"/i, '<html$1lang="ru"');
  }
  return html.replace(/<html(.*?)>/i, '<html$1 lang="ru">');
}

function adjustSharedAssetPathsForClone(html) {
  return html
    .replace(/(["'(=])((?:\.\.\/)*)(images\/|css\/|js\/|webfonts\/)/g, '$1../$2$3')
    .replace(/url\((['"]?)(\.\.\/)*(images\/)/g, "url($1../$2$3");
}

function fixLinksForClonedPage(html) {
  return html
    .replace(/href="\.\.\/news\//g, 'href="news/')
    .replace(/href="\.\.\/applications\//g, 'href="applications/')
    .replace(/href="\.\.\/Solutions\//g, 'href="Solutions/')
    .replace(/href="\.\.\/products\/food-ingredients\//g, 'href="products/food-ingredients/');
}

function relativeHref(targetFile, localeDir) {
  if (!localeDir) {
    return targetFile === "index.html" ? "../index.html" : `../${targetFile}`;
  }
  if (targetFile === "index.html") {
    return `../${localeDir}/index.html`;
  }
  return `../${localeDir}/${targetFile}`;
}

function fallbackForLocale(file, localeDir) {
  if (exactMirrorPages.has(file)) {
    return relativeHref(file, localeDir);
  }
  if (file.startsWith("products/food-ingredients/")) {
    return relativeHref("products/food-ingredients.html", localeDir);
  }
  if (file.startsWith("Solutions/")) {
    return relativeHref(solutionFallbacks.get(file) || "products.html", localeDir);
  }
  if (file.startsWith("news/")) {
    return relativeHref("news.html", localeDir);
  }
  if (file.startsWith("applications/")) {
    return relativeHref("index.html", localeDir);
  }
  return relativeHref("index.html", localeDir);
}

function buildLanguageBlock(file) {
  const links = locales.map((locale) => {
    let href;
    if (locale.dir === "ru") {
      href = path.basename(file);
    } else if (locale.dir === "") {
      href = relativeHref(file, "");
    } else if (exactMirrorPages.has(file)) {
      href = relativeHref(file, locale.dir);
    } else {
      href = fallbackForLocale(file, locale.dir);
    }
    const active = locale.dir === "ru" ? ' class="active" aria-current="page"' : "";
    return `          <a href="${href}" lang="${locale.hreflang}"${active}>${locale.label}</a>`;
  }).join("\n");
  return `<div class="bs-seo-language" aria-label="Language selection">
${links}
        </div>`;
}

async function buildAlternateLinks(file) {
  const links = [];
  for (const locale of locales) {
    if (locale.dir === "ru") {
      links.push(`<link rel="alternate" hreflang="ru" href="${buildTargetUrl("ru", file)}">`);
      continue;
    }
    const exactPath = locale.dir ? `${locale.dir}/${file}` : file;
    if (await exists(exactPath)) {
      links.push(`<link rel="alternate" hreflang="${locale.hreflang}" href="${buildTargetUrl(locale.dir, file)}">`);
    }
  }
  links.push(`<link rel="alternate" hreflang="x-default" href="${buildTargetUrl("", file)}">`);
  return links.join("\n  ");
}

function applyReplacements(html, replacements) {
  let out = html;
  for (const [from, to] of replacements) {
    out = out.split(from).join(to);
  }
  return out;
}

function applyPageSpecific(html, file) {
  let out = html;
  if (pageSpecificReplacements[file]) {
    out = applyReplacements(out, pageSpecificReplacements[file]);
  }
  if (titleOverrides[file]) {
    out = out.replace(/<title>[^<]*<\/title>/i, `<title>${titleOverrides[file]}</title>`);
  }
  if (descriptionOverrides[file]) {
    out = out.replace(/<meta name="description"[\s\S]*?content="[^"]*"\s*\/?>/i, `<meta name="description" content="${descriptionOverrides[file]}">`);
  }
  return out;
}

function setCanonicalAndLocale(html, file) {
  const targetUrl = buildTargetUrl("ru", file);
  return html
    .replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${targetUrl}">`)
    .replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${targetUrl}">`)
    .replace(/<meta property="og:locale" content="[^"]*">/i, '<meta property="og:locale" content="ru_RU">')
    .replace(/"inLanguage"\s*:\s*"en"/g, '"inLanguage":"ru"');
}

function localizeJsonLdUrls(html, file) {
  if (file === "index.html") {
    return html;
  }
  const englishUrl = buildTargetUrl("", file);
  const russianUrl = buildTargetUrl("ru", file);
  return html.split(englishUrl).join(russianUrl);
}

function cleanupArtifacts(html) {
  return html
    .replace(/https:\/\/www\.bespringchem\.com\/ru\/ru\/zh-cn\//g, "https://www.bespringchem.com/zh-cn/")
    .replace(/https:\/\/www\.bespringchem\.com\/ru\/ru\/zh-tw\//g, "https://www.bespringchem.com/zh-tw/")
    .replace(/https:\/\/www\.bespringchem\.com\/ru\/ru\/es\//g, "https://www.bespringchem.com/es/")
    .replace(/https:\/\/www\.bespringchem\.com\/ru\/ru\/pt\//g, "https://www.bespringchem.com/pt/")
    .replace(/https:\/\/www\.bespringchem\.com\/ru\/ru\/de\//g, "https://www.bespringchem.com/de/")
    .replace(/https:\/\/www\.bespringchem\.com\/ru\/ru\/ar\//g, "https://www.bespringchem.com/ar/")
    .replace(/https:\/\/www\.bespringchem\.com\/ru\/ru\/ru\//g, "https://www.bespringchem.com/ru/")
    .replace(/https:\/\/www\.bespringchem\.com\/ru\/ru\/images\//g, "https://www.bespringchem.com/images/")
    .replace(/https:\/\/www\.bespringchem\.com\/ru\/ru\/search/g, "https://www.bespringchem.com/search")
    .replace(/https:\/\/www\.bespringchem\.com\/ru\/ru\//g, "https://www.bespringchem.com/ru/")
    .replace(/绠€/g, "简")
    .replace(/绻\?\/a>/g, '繁</a>')
    .replace(/鈫\?/g, "&rarr;")
    .replace(/路/g, "-")
    .replace(/Get in Touch/g, "Связаться")
    .replace(/Contact Us/g, "Контакты")
    .replace(/Breadcrumb/g, "Хлебные крошки")
    .replace(/aria-label="Language selector"/g, 'aria-label="Выбор языка"')
    .replace(/aria-label="Language selection"/g, 'aria-label="Выбор языка"');
}

async function transformPage(file, targetExisted) {
  const sourcePath = path.join(root, targetExisted ? `ru/${file}` : file);
  let html = await readFile(sourcePath, "utf8");

  if (!targetExisted) {
    html = adjustSharedAssetPathsForClone(html);
    html = fixLinksForClonedPage(html);
  }

  html = ensureHtmlLang(html);
  html = setCanonicalAndLocale(html, file);
  html = localizeJsonLdUrls(html, file);
  html = applyPageSpecific(html, file);
  html = applyReplacements(html, commonReplacements);
  html = cleanupArtifacts(html);

  const alternates = await buildAlternateLinks(file);
  html = html.replace(/<link rel="alternate"[\s\S]*?<meta property=/i, `${alternates}\n\n  <meta property=`);

  const languageBlock = buildLanguageBlock(file);
  html = html.replace(/<div class="bs-seo-language"[\s\S]*?<\/div>/i, languageBlock);

  return html;
}

async function listEnglishPages(dir = root, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const pages = [];
  for (const entry of entries) {
    const relative = normalizePath(path.join(prefix, entry.name));
    if (entry.isDirectory()) {
      if (localeDirs.has(entry.name) || entry.name === "tools" || entry.name.startsWith(".")) {
        continue;
      }
      pages.push(...await listEnglishPages(path.join(dir, entry.name), relative));
      continue;
    }
    if (!entry.name.endsWith(".html")) {
      continue;
    }
    if (ignoredFiles.has(relative)) {
      continue;
    }
    pages.push(relative);
  }
  return pages.sort();
}

async function main() {
  const englishPages = await listEnglishPages();
  let created = 0;
  let updated = 0;

  for (const file of englishPages) {
    const targetPath = path.join(root, "ru", file);
    const alreadyExists = await exists(`ru/${file}`);
    const html = await transformPage(file, alreadyExists);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, html, "utf8");
    if (alreadyExists) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.log(`RU pages upgraded: created ${created}, updated ${updated}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

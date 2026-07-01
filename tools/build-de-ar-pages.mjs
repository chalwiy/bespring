import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = "https://www.bespringchem.com";

const mirroredPages = [
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
];

const languages = [
  {
    dir: "de",
    lang: "de",
    locale: "de_DE",
    rtl: false,
    dictionary: {
      title_index: "Bespring Chemical | Globaler Lieferant fur Lebensmittelzutaten, Futtermittelzusatze und Industriechemikalien",
      topbar_supplier: "Chinesischer Lieferant fur chemische Produkte",
      topbar_export: "Export in mehr als 60 Lander",
      home: "Startseite",
      about: "Uber uns",
      products: "Produkte",
      services: "Leistungen",
      news: "News",
      contact: "Kontakt",
      quick_links: "Schnellzugriffe",
      get_in_touch: "Kontakt aufnehmen",
      hero_1: "Phosphathersteller und globaler Chemielieferant aus China",
      hero_1_cta: "Mehr uber uns",
      hero_2: "Lebensmittelzutaten, Futtermittelzusatze und industrielle Chemielosungen",
      hero_2_cta: "Produkte entdecken",
      hero_3: "Zuverlassige Fertigung, globale Lieferkette und langfristige Partnerschaft",
      hero_3_cta: "Vertrieb kontaktieren",
      products_h1: "Chemische Zutaten und Rohstoffe",
      products_eyebrow: "B2B-Portfolio fur Chemieprodukte",
      products_cta_1: "Portfolios ansehen",
      products_cta_2: "Anfrage vorbereiten",
      services_eyebrow: "Beschaffungsunterstutzung uber die Lieferung hinaus",
      services_h1: "Leistungen fur Chemieexport und Beschaffungsunterstutzung",
      services_cta_1: "Leistungen ansehen",
      services_cta_2: "Anfrage besprechen",
      news_page_label: "News und Einblicke",
      news_page_h1: "Einblicke und Nachrichten aus der Chemiebranche",
      latest_insights: "Neueste Einblicke",
      contact_eyebrow: "Globaler Vertrieb und Exportunterstutzung",
      contact_h1: "Lassen Sie uns uber Ihren Bedarf an Zutaten oder Chemikalien sprechen",
      quote_cta: "Angebot anfordern",
      whatsapp_cta: "Bei WhatsApp schreiben",
      about_h1: "Uber Bespring Chemical",
      about_profile: "Unternehmensprofil",
      production_bases: "Produktionsstandorte",
      markets: "Globale Markte",
      certs: "Zertifizierungen",
      values: "Grundwerte",
      cat_food_h1: "Lebensmittelzutaten und Zusatzstoffe",
      cat_feed_h1: "Futtermittelzusatze und Zutaten fur Tierernahrung",
      cat_clean_h1: "Chemikalien fur Haushaltspflege und Industriereinigung",
      cat_water_h1: "Chemikalien fur Wasseraufbereitung",
      cat_mining_h1: "Chemikalien fur Bergbau und Mineralverarbeitung",
      cat_agri_h1: "Phosphatdunger und Dungesalze"
    }
  },
  {
    dir: "ar",
    lang: "ar",
    locale: "ar_AR",
    rtl: true,
    dictionary: {
      title_index: "Bespring Chemical | مورد عالمي لمكونات الاغذية واضافات الاعلاف والكيماويات الصناعية",
      topbar_supplier: "مورد صيني للمنتجات الكيميائية",
      topbar_export: "التصدير إلى اكثر من 60 دولة",
      home: "الرئيسية",
      about: "من نحن",
      products: "المنتجات",
      services: "الخدمات",
      news: "الاخبار",
      contact: "اتصل بنا",
      quick_links: "روابط سريعة",
      get_in_touch: "تواصل معنا",
      hero_1: "شركة صينية لتصنيع الفوسفات وتوريد المواد الكيميائية عالميا",
      hero_1_cta: "تعرف علينا",
      hero_2: "مكونات غذائية واضافات اعلاف وحلول كيميائية صناعية",
      hero_2_cta: "استكشف المنتجات",
      hero_3: "تصنيع موثوق وسلسلة توريد عالمية وشراكة طويلة الامد",
      hero_3_cta: "اتصل بفريق المبيعات",
      products_h1: "المكونات الكيميائية والمواد الخام",
      products_eyebrow: "محفظة B2B للمنتجات الكيميائية",
      products_cta_1: "استعراض المحافظ",
      products_cta_2: "تحضير استفسار",
      services_eyebrow: "دعم المشتريات إلى جانب التوريد",
      services_h1: "خدمات تصدير المواد الكيميائية ودعم المشتريات",
      services_cta_1: "عرض الخدمات",
      services_cta_2: "مناقشة استفسار",
      news_page_label: "الاخبار والرؤى",
      news_page_h1: "رؤى واخبار صناعة الكيماويات",
      latest_insights: "احدث الرؤى",
      contact_eyebrow: "المبيعات العالمية ودعم التصدير",
      contact_h1: "دعنا نناقش احتياجاتك من المكونات او المواد الكيميائية",
      quote_cta: "اطلب عرض سعر",
      whatsapp_cta: "تحدث عبر واتساب",
      about_h1: "حول Bespring Chemical",
      about_profile: "نبذة عن الشركة",
      production_bases: "قواعد الانتاج",
      markets: "الاسواق العالمية",
      certs: "الشهادات",
      values: "القيم الاساسية",
      cat_food_h1: "المكونات الغذائية والاضافات",
      cat_feed_h1: "اضافات الاعلاف ومكونات تغذية الحيوان",
      cat_clean_h1: "كيماويات العناية المنزلية والتنظيف الصناعي",
      cat_water_h1: "كيماويات معالجة المياه",
      cat_mining_h1: "كيماويات التعدين ومعالجة المعادن",
      cat_agri_h1: "الاسمدة الفوسفاتية واملاح الاسمدة"
    }
  }
];

function pageUrl(dir, file) {
  return file === "index.html" ? `${dir}/` : `${dir}/${file}`;
}

function ensureDir(filepath) {
  return mkdir(path.dirname(filepath), { recursive: true });
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function adjustAssets(html) {
  return html.replace(/(["'(=])((?:\.\.\/)*)(images\/|css\/|js\/|webfonts\/)/g, '$1../$2$3');
}

function rerouteLeafLinks(html) {
  return html
    .replace(/href="products\/food-ingredients\//g, 'href="../products/food-ingredients/')
    .replace(/href="applications\//g, 'href="../applications/')
    .replace(/href="news\//g, 'href="../news/')
    .replace(/href="Solutions\//g, 'href="../Solutions/')
    .replace(/href="food-ingredients\//g, 'href="../../products/food-ingredients/');
}

function buildLanguageBlock(file, activeDir) {
  const depth = file.split("/").length - 1;
  const prefix = `${activeDir ? "../" : ""}${"../".repeat(depth)}`;
  const leaf = file.split("/").pop();
  const resolve = (dir) => {
    if (!dir) return `${prefix}${leaf}`;
    if (file.startsWith("about/")) return `${prefix}${dir}/about/${leaf}`;
    if (file.startsWith("products/")) return `${prefix}${dir}/products/${leaf}`;
    return `${prefix}${dir}/${leaf}`;
  };
  const langs = [
    ["", "EN", "en"],
    ["zh-cn", "简", "zh-CN"],
    ["zh-tw", "繁", "zh-TW"],
    ["es", "ES", "es"],
    ["pt", "PT", "pt"],
    ["ru", "RU", "ru"],
    ["de", "DE", "de"],
    ["ar", "AR", "ar"]
  ];
  const links = langs.map(([dir, label, lang]) => {
    const href = dir === activeDir ? leaf : resolve(dir);
    const active = dir === activeDir ? ' class="active" aria-current="page"' : "";
    return `          <a href="${href}" lang="${lang}"${active}>${label}</a>`;
  }).join("\n");
  return `<div class="bs-seo-language" aria-label="Language selection">
${links}
        </div>`;
}

function translateCommon(html, dict) {
  return html
    .replace(/China-based chemical ingredients supplier/g, dict.topbar_supplier)
    .replace(/China-based chemical products supplier/g, dict.topbar_supplier)
    .replace(/China-based chemical and ingredient supplier/g, dict.topbar_supplier)
    .replace(/Exporting to 60\+ Countries/g, dict.topbar_export)
    .replace(/Exporting to 60\+ countries/g, dict.topbar_export)
    .replace(/>Home</g, `>${dict.home}<`)
    .replace(/>About Us</g, `>${dict.about}<`)
    .replace(/>Products</g, `>${dict.products}<`)
    .replace(/>Services</g, `>${dict.services}<`)
    .replace(/>News</g, `>${dict.news}<`)
    .replace(/>Contact</g, `>${dict.contact}<`)
    .replace(/>Quick Links</g, `>${dict.quick_links}<`)
    .replace(/>Get in Touch</g, `>${dict.get_in_touch}<`);
}

function translateByPage(html, file, dict) {
  let out = html;
  if (file === "index.html") {
    out = out
      .replace(/<title>[^<]+<\/title>/, `<title>${dict.title_index}</title>`)
      .replace("Phosphate Manufacturer & Global Chemical Supplier from China", dict.hero_1)
      .replace("Learn About Us", dict.hero_1_cta)
      .replace("Food Ingredients, Feed Additives & Industrial Chemical Solutions", dict.hero_2)
      .replace("Explore Products", dict.hero_2_cta)
      .replace("Reliable Manufacturing, Global Supply Chain, Long-Term Partnership", dict.hero_3)
      .replace("Contact Sales Team", dict.hero_3_cta);
  }
  if (file === "products.html") {
    out = out
      .replace("Chemical Ingredients &amp; Raw Materials", dict.products_h1)
      .replace("B2B chemical product portfolio", dict.products_eyebrow)
      .replace("Browse product portfolios", dict.products_cta_1)
      .replace("Prepare an inquiry", dict.products_cta_2);
  }
  if (file === "services.html") {
    out = out
      .replace("Procurement support beyond supply", dict.services_eyebrow)
      .replace("Chemical Export &amp; Procurement Support Services", dict.services_h1)
      .replace("Review services", dict.services_cta_1)
      .replace("Discuss an inquiry", dict.services_cta_2);
  }
  if (file === "news.html") {
    out = out
      .replace("News &amp; Insights", dict.news_page_label)
      .replace("Chemical Industry Insights &amp; News", dict.news_page_h1)
      .replace("Latest insights", dict.latest_insights);
  }
  if (file === "contact.html") {
    out = out
      .replace("Global sales &amp; export support", dict.contact_eyebrow)
      .replace("Let's discuss your ingredient or chemical requirements", dict.contact_h1)
      .replace("Request a Quote", dict.quote_cta)
      .replace("Chat on WhatsApp", dict.whatsapp_cta);
  }
  if (file === "about/company-profile.html") out = out.replace("About Bespring Chemical", dict.about_h1).replace("Company Profile", dict.about_profile);
  if (file === "about/production-bases.html") out = out.replace("Production Bases", dict.production_bases);
  if (file === "about/global-markets.html") out = out.replace("Global Markets", dict.markets);
  if (file === "about/certifications.html") out = out.replace("Certifications", dict.certs);
  if (file === "about/core-values.html") out = out.replace("Core Values", dict.values);
  if (file === "products/food-ingredients.html") out = out.replace("Food Ingredients &amp; Food Additives", dict.cat_food_h1);
  if (file === "products/animal-nutrition.html") out = out.replace("Feed Additives &amp; Animal Nutrition Ingredients", dict.cat_feed_h1);
  if (file === "products/home-care-industrial-cleaning.html") out = out.replace("Homecare &amp; Industrial Cleaning Chemicals", dict.cat_clean_h1);
  if (file === "products/water-treatment.html") out = out.replace("Water Treatment Chemicals", dict.cat_water_h1);
  if (file === "products/mining.html") out = out.replace("Mining &amp; Mineral Processing Chemicals", dict.cat_mining_h1);
  if (file === "products/agricultural-fertilizers.html") out = out.replace("Phosphate Fertilizers &amp; Fertilizer Salts", dict.cat_agri_h1);
  return out;
}

function localizeMeta(html, language, file) {
  const url = `${site}/${pageUrl(language.dir, file)}`;
  const sourceUrls = file === "index.html" ? [`${site}/`, `${site}`] : [`${site}/${file}`];
  let out = html
    .replace(/<html lang="en">/i, `<html lang="${language.lang}"${language.rtl ? ' dir="rtl"' : ""}>`)
    .replace(/<meta property="og:locale" content="en_US">/i, `<meta property="og:locale" content="${language.locale}">`)
    .replace(/"inLanguage":"en"/g, `"inLanguage":"${language.lang}"`)
    .replace(/"inLanguage": "en"/g, `"inLanguage": "${language.lang}"`);

  for (const sourceUrl of sourceUrls) {
    out = out
      .replace(new RegExp(`<link rel="canonical" href="${escapeRegex(sourceUrl)}">`, "i"), `<link rel="canonical" href="${url}">`)
      .replace(new RegExp(`<meta property="og:url" content="${escapeRegex(sourceUrl)}">`, "i"), `<meta property="og:url" content="${url}">`);
  }

  if (!out.includes(`hreflang="${language.lang}"`)) {
    out = out.replace(/(<link rel="alternate"[^>]+hreflang="x-default"[^>]*>)/i, `<link rel="alternate" hreflang="${language.lang}" href="${url}">\n$1`);
  }
  return out;
}

function addEnglishSupport(html, file) {
  let out = html;
  for (const language of languages) {
    const url = `${site}/${pageUrl(language.dir, file)}`;
    if (!out.includes(`hreflang="${language.lang}"`)) {
      out = out.replace(/(<link rel="alternate"[^>]+hreflang="x-default"[^>]*>)/i, `<link rel="alternate" hreflang="${language.lang}" href="${url}">\n$1`);
    }
  }
  return out.replace(/<div class="bs-seo-language"[\s\S]*?<\/div>/i, buildLanguageBlock(file, ""));
}

for (const language of languages) {
  for (const file of mirroredPages) {
    const source = await readFile(path.join(root, file), "utf8");
    let localized = source;
    localized = localizeMeta(localized, language, file);
    localized = adjustAssets(localized);
    localized = rerouteLeafLinks(localized);
    localized = localized.replace(/<div class="bs-seo-language"[\s\S]*?<\/div>/i, buildLanguageBlock(file, language.dir));
    localized = translateCommon(localized, language.dictionary);
    localized = translateByPage(localized, file, language.dictionary);
    const dest = path.join(root, language.dir, file);
    await ensureDir(dest);
    await writeFile(dest, localized, "utf8");
  }
}

for (const file of mirroredPages) {
  const sourcePath = path.join(root, file);
  const source = await readFile(sourcePath, "utf8");
  const updated = addEnglishSupport(source, file);
  if (updated !== source) {
    await writeFile(sourcePath, updated, "utf8");
  }
}

console.log(`German and Arabic mirror pages generated: ${mirroredPages.length * languages.length}`);

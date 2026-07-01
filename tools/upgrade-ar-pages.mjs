import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
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

const textReplacements = [
  ['aria-label="Main navigation"', 'aria-label="التنقل الرئيسي"'],
  ['aria-label="Main Navigation"', 'aria-label="التنقل الرئيسي"'],
  ['aria-label="Open navigation menu"', 'aria-label="فتح قائمة التنقل"'],
  ['aria-label="Close navigation menu"', 'aria-label="إغلاق قائمة التنقل"'],
  ['aria-label="Toggle Navigation Menu"', 'aria-label="تبديل قائمة التنقل"'],
  ['aria-label="Breadcrumb"', 'aria-label="مسار التنقل"'],
  ['aria-label="On this page"', 'aria-label="في هذه الصفحة"'],
  [">Home<", ">الرئيسية<"],
  [">About Us<", ">من نحن<"],
  [">Products<", ">المنتجات<"],
  [">Services<", ">الخدمات<"],
  [">News<", ">الأخبار<"],
  [">Contact<", ">اتصل بنا<"],
  [">Contact Us<", ">اتصل بنا<"],
  [">Quick Links<", ">روابط سريعة<"],
  [">Get in Touch<", ">تواصل معنا<"],
  ["China-based chemical products supplier", "مورد صيني للمنتجات الكيميائية"],
  ["China-based chemical ingredients supplier", "مورد صيني للمكونات الكيميائية"],
  ["China-based supplier of chemical products", "مورد صيني للمنتجات الكيميائية"],
  ["China-based supplier of  chemical products ", "مورد صيني للمنتجات الكيميائية "],
  ["Exporting to 60+ Countries", "التصدير إلى أكثر من 60 دولة"],
  ["Exporting to 60+ countries", "التصدير إلى أكثر من 60 دولة"],
  ["Bespring Chemical home", "العودة إلى الصفحة الرئيسية لشركة Bespring Chemical"],
  ["Request a quote", "اطلب عرض سعر"],
  ["Request a Quote", "اطلب عرض سعر"],
  ["Ask on WhatsApp", "اسأل عبر واتساب"],
  ["Browse Products", "تصفح المنتجات"],
  ["Browse product portfolios", "تصفح فئات المنتجات"],
  ["Prepare an inquiry", "جهز استفسارك"],
  ["Discuss Your Application", "ناقش تطبيقك"],
  ["Browse Food Ingredients", "تصفح مكونات الأغذية"],
  ["Continue browsing", "واصل التصفح"],
  ["Related product portfolios", "فئات منتجات ذات صلة"],
  ["Prepare a product inquiry", "جهز استفسار المنتج"],
  ["Include the full chemical name, grade, target specification, quantity, packing, destination and required documents.", "يرجى تضمين الاسم الكيميائي الكامل والدرجة والمواصفة المطلوبة والكمية والتعبئة والوجهة والمستندات المطلوبة."],
  ["Reviewed by Bespring Chemical export team", "راجعه فريق التصدير في Bespring Chemical"],
  ["Guide", "دليل"],
  ["Application Cases", "حالات تطبيق"],
  ["Application case", "حالة تطبيق"],
  ["Industry Applications", "تطبيقات الصناعات"],
  ["Latest insights", "أحدث المقالات"],
  ["Guides for chemical buyers", "أدلة لمشتري المواد الكيميائية"],
  ["News &amp; Insights", "الأخبار والرؤى"],
  ["Procurement guide", "دليل شراء"],
  ["Exhibition archive", "أرشيف المعارض"],
  ["View event details", "عرض تفاصيل الحدث"],
  ["Read buyer guide", "قراءة دليل الشراء"],
  ["Choose the easiest way to reach us", "اختر أسهل طريقة للتواصل معنا"],
  ["Talk to our sales team", "تحدث مع فريق المبيعات"],
  ["General inquiries", "استفسارات عامة"],
  ["Quick conversation", "محادثة سريعة"],
  ["Business email", "البريد الإلكتروني للشركة"],
  ["Product or application", "المنتج أو التطبيق"],
  ["Destination country / port", "بلد / ميناء الوجهة"],
  ["Requirements", "المتطلبات"],
  ["Send Quote Request", "إرسال طلب عرض السعر"],
  ["Company", "الشركة"],
  ["Sales office", "مكتب المبيعات"],
  ["Sales manager", "مدير المبيعات"],
  ["Technical documents available", "المستندات الفنية متاحة"],
  ["Worldwide export support", "دعم تصدير عالمي"],
  ["Food, feed &amp; industrial grades", "درجات غذائية وأعلاف وصناعية"],
  ["Choose the easiest way to reach us", "اختر أسهل طريقة للتواصل معنا"],
  ["What information should I include in a quotation request?", "ما المعلومات التي يجب أن أذكرها في طلب عرض السعر؟"],
  ["Which product categories can Bespring Chemical supply?", "ما فئات المنتجات التي يمكن لشركة Bespring Chemical توفيرها؟"],
  ["Can I request product documents or samples?", "هل يمكنني طلب مستندات المنتج أو عينات؟"]
];

const titleOverrides = {
  "index.html": "Bespring Chemical | مورد عالمي لمكونات الأغذية وإضافات الأعلاف والكيماويات الصناعية",
  "products.html": "المكونات الكيميائية والمواد الخام | Bespring Chemical",
  "services.html": "خدمات التصدير والدعم الشرائي للمواد الكيميائية | Bespring Chemical",
  "news.html": "الأخبار والرؤى الصناعية | Bespring Chemical",
  "contact.html": "اتصل بـ Bespring Chemical | عروض الأسعار ودعم التصدير",
  "about/company-profile.html": "نبذة عن Bespring Chemical | مورد مكونات ومواد كيميائية",
  "about/production-bases.html": "قواعد الإنتاج في الصين | Bespring Chemical",
  "about/global-markets.html": "الأسواق العالمية وتصدير المواد الكيميائية | Bespring Chemical",
  "about/certifications.html": "الشهادات والامتثال | Bespring Chemical",
  "about/core-values.html": "القيم الأساسية: الجودة والنزاهة والشراكة | Bespring Chemical",
  "products/food-ingredients.html": "مكونات غذائية ومضافات غذائية | Bespring Chemical",
  "products/animal-nutrition.html": "إضافات الأعلاف ومكونات التغذية الحيوانية | Bespring Chemical",
  "products/home-care-industrial-cleaning.html": "كيماويات العناية المنزلية والتنظيف الصناعي | Bespring Chemical",
  "products/water-treatment.html": "كيماويات معالجة المياه | Bespring Chemical",
  "products/mining.html": "كيماويات التعدين ومعالجة المعادن | Bespring Chemical",
  "products/agricultural-fertilizers.html": "الأسمدة الفوسفاتية وأملاح الأسمدة | Bespring Chemical",
  "products/food-ingredients/sodium-tripolyphosphate-stpp.html": "مورد STPP الغذائي | ثلاثي فوسفات الصوديوم",
  "products/food-ingredients/sodium-hexametaphosphate-shmp.html": "مورد SHMP الغذائي | سداسي ميتافوسفات الصوديوم",
  "products/food-ingredients/tetrapotassium-pyrophosphate-tkpp.html": "مورد TKPP الغذائي | INS 450(v)",
  "products/food-ingredients/calcium-propionate.html": "مورد بروبيونات الكالسيوم الغذائية | E282",
  "products/food-ingredients/citric-acid.html": "مورد حمض الستريك الغذائي | E330",
  "products/food-ingredients/dicalcium-phosphate-dcp.html": "مورد فوسفات ثنائي الكالسيوم الغذائية | DCP E341(ii)",
  "products/food-ingredients/monocalcium-phosphate-mcp.html": "مورد فوسفات أحادي الكالسيوم الغذائية | MCP E341(i)",
  "products/food-ingredients/sodium-aluminum-phosphate-salp.html": "مورد SALP الغذائي | فوسفات ألومنيوم الصوديوم",
  "products/food-ingredients/sodium-carboxymethyl-cellulose-cmc.html": "مورد CMC الغذائي | كربوكسي ميثيل سليلوز الصوديوم",
  "news/stpp-vs-shmp-selection-guide.html": "STPP مقابل SHMP: دليل مقارن للمشترين | Bespring Chemical",
  "news/mcp-vs-dcp-feed-phosphate-guide.html": "MCP مقابل DCP للأعلاف: دليل تأهيل للمشترين | Bespring Chemical",
  "news/chemical-export-document-checklist.html": "قائمة التحقق من مستندات استيراد المواد الكيميائية للمشترين الدوليين | Bespring Chemical",
  "news/food-grade-vs-technical-grade-phosphates.html": "الفوسفات الغذائية مقابل التقنية: ما الذي يجب أن يتحقق منه المشترون؟ | Bespring Chemical",
  "news/how-to-qualify-chemical-supplier-china.html": "كيفية تأهيل مورد مواد كيميائية في الصين: قائمة عملية للمشترين | Bespring Chemical",
  "news/global-ingredients-show-russia-2025.html": "Global Ingredients Show 2025 في موسكو | Bespring Chemical",
  "news/global-ingredients-show-russia-2024.html": "Global Ingredients Show 2024 في موسكو | Bespring Chemical",
  "news/fi-vietnam-2024.html": "Fi Vietnam 2024 | Bespring Chemical",
  "news/fi-europe-frankfurt-2023.html": "Fi Europe 2023 في فرانكفورت | Bespring Chemical",
  "news/vietfood-beverage-2023.html": "Vietfood & Beverage 2023 | Bespring Chemical",
  "applications/food-grade-stpp-meat-processing.html": "STPP الغذائي لتجهيز اللحوم | حالة تطبيق",
  "applications/calcium-propionate-packaged-bread.html": "بروبيونات الكالسيوم للخبز المعبأ | حالة تطبيق",
  "applications/mcp-phosphorus-source-poultry-feed.html": "MCP كمصدر للفوسفور في أعلاف الدواجن | حالة تطبيق",
  "applications/shmp-industrial-process-water.html": "SHMP في مياه العمليات الصناعية | حالة تطبيق",
  "applications/stpp-builder-powder-detergents.html": "STPP كمادة Builder في مساحيق المنظفات | حالة تطبيق",
  "applications/tkpp-frozen-seafood-processing.html": "TKPP لتجهيز المأكولات البحرية المجمدة | حالة تطبيق",
  "Solutions/food-industry-solutions.html": "حلول مكونات وتجهيز الأغذية | Bespring Chemical",
  "Solutions/animal-nutrition-solutions.html": "حلول التغذية الحيوانية والأعلاف | Bespring Chemical",
  "Solutions/water-treatment-solutions.html": "حلول معالجة المياه | Bespring Chemical",
  "Solutions/industrial-cleaning-solutions.html": "حلول التنظيف الصناعي والمنزلي | Bespring Chemical",
  "Solutions/mining-solutions.html": "حلول كيميائية لقطاع التعدين | Bespring Chemical",
  "Solutions/agriculture-solutions.html": "حلول الزراعة والأسمدة | Bespring Chemical"
};

const descriptionOverrides = {
  "index.html": "Bespring Chemical مورد عالمي للمواد الكيميائية الغذائية وإضافات الأعلاف والفوسفات ومواد معالجة المياه وكيماويات التعدين والأسمدة، بخبرة تزيد على 50 عاما وتصدير إلى أكثر من 60 دولة.",
  "products.html": "استعرض فئات Bespring Chemical من مكونات الأغذية وإضافات الأعلاف وكيماويات التنظيف ومعالجة المياه والتعدين والأسمدة.",
  "services.html": "مراجعة المواصفات والتنسيق مع الموردين والمستندات والتعبئة واللوجستيات التصديرية لمشتري المواد الكيميائية الغذائية والأعلاف والصناعة.",
  "news.html": "اقرأ أدلة الشراء ومقارنات المنتجات الكيميائية وملاحظات مستندات التصدير وأخبار معارض Bespring Chemical.",
  "contact.html": "تواصل مع Bespring Chemical في الصين للحصول على عروض أسعار وعينات ومستندات ودعم تصدير للمواد الغذائية والأعلاف والمواد الكيميائية الصناعية.",
  "products/food-ingredients/sodium-tripolyphosphate-stpp.html": "ثلاثي فوسفات الصوديوم الغذائي (STPP/INS 451(i)) للحوم والمأكولات البحرية والألبان. راجع المواصفات والتعبئة وتحميل الحاويات.",
  "products/food-ingredients/sodium-hexametaphosphate-shmp.html": "سداسي ميتافوسفات الصوديوم الغذائي لتطبيقات الغذاء والمشروبات. راجع الهوية والمواصفة ومتطلبات الاستفسار.",
  "products/food-ingredients/tetrapotassium-pyrophosphate-tkpp.html": "TKPP غذائي لتطبيقات المأكولات البحرية واللحوم والعمليات. راجع المواصفات وشروط التعبئة والشراء.",
  "products/food-ingredients/calcium-propionate.html": "بروبيونات الكالسيوم الغذائية لتطبيقات المخبوزات وإطالة العمر التخزيني. راجع المواصفات والدعم التجاري.",
  "products/food-ingredients/citric-acid.html": "حمض الستريك الغذائي لضبط الحموضة والطعم وصياغة المشروبات والأغذية. راجع المواصفات وبيانات الطلب.",
  "products/food-ingredients/dicalcium-phosphate-dcp.html": "فوسفات ثنائي الكالسيوم الغذائية لتقوية الأغذية وصياغتها. راجع المواصفات والتعبئة والمستندات.",
  "products/food-ingredients/monocalcium-phosphate-mcp.html": "فوسفات أحادي الكالسيوم الغذائية للتخمير والتقوية. راجع المواصفات والتعبئة وبيانات التسعير.",
  "products/food-ingredients/sodium-aluminum-phosphate-salp.html": "SALP غذائي لأنظمة الخبز والصياغة. راجع المواصفات والتعبئة والمستندات المتاحة.",
  "products/food-ingredients/sodium-carboxymethyl-cellulose-cmc.html": "CMC غذائي للتحكم في القوام والتعليق والثبات. راجع المواصفات والتعبئة والدعم التجاري.",
  "news/stpp-vs-shmp-selection-guide.html": "قارن بين STPP وSHMP من حيث الهوية الكيميائية والوظيفة والدرجة والمواصفة والشكل الفيزيائي ومتطلبات تأهيل المورد.",
  "applications/food-grade-stpp-meat-processing.html": "اطلع على كيفية دعم STPP الغذائي لإدارة الرطوبة والقوام وثبات الاستحلاب في تجهيز اللحوم."
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

function buildUrl(dir, file) {
  return `${site}/${file === "index.html" ? `${dir}/` : pageUrl(dir, file)}`.replace(/\/{2,}/g, "/").replace("https:/", "https://");
}

function adjustAssetsForClone(html) {
  return html
    .replace(/(["'(=])((?:\.\.\/)*)(images\/|css\/|js\/|webfonts\/)/g, '$1../$2$3')
    .replace(/url\((['"]?)(\.\.\/)*(images\/)/g, "url($1../$2$3");
}

function fixRootLocalizedLinks(html, file) {
  if (file !== "index.html" && !exactMirrorPages.has(file)) {
    return html;
  }
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

function fallbackHref(file, localeDir) {
  if (!localeDir) {
    return relativeHref(file, "");
  }
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
    if (locale.dir === "ar") {
      href = path.basename(file);
    } else if (exactMirrorPages.has(file) && locale.dir) {
      href = relativeHref(file, locale.dir);
    } else if (locale.dir === "") {
      href = relativeHref(file, "");
    } else {
      href = fallbackHref(file, locale.dir);
    }
    const active = locale.dir === "ar" ? ' class="active" aria-current="page"' : "";
    return `          <a href="${href}" lang="${locale.hreflang}"${active}>${locale.label}</a>`;
  }).join("\n");
  return `<div class="bs-seo-language" aria-label="Language selection">
${links}
        </div>`;
}

async function buildAlternateLinks(file) {
  const links = [];
  for (const locale of locales) {
    const relative = locale.dir ? `${locale.dir}/${file}` : file;
    if (locale.dir === "ar" || await exists(relative)) {
      links.push(`<link rel="alternate" hreflang="${locale.hreflang}" href="${buildUrl(locale.dir, file)}">`);
    }
  }
  links.push(`<link rel="alternate" hreflang="x-default" href="${buildUrl("", file)}">`);
  return links.join("\n  ");
}

function applySimpleReplacements(html) {
  let out = html;
  for (const [from, to] of textReplacements) {
    out = out.split(from).join(to);
  }
  return out;
}

function applyTitleAndDescription(html, file) {
  let out = html;
  if (titleOverrides[file]) {
    out = out.replace(/<title>[^<]*<\/title>/i, `<title>${titleOverrides[file]}</title>`);
    out = out.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${titleOverrides[file]}">`);
    out = out.replace(/<meta name="twitter:title" content="[^"]*">/i, `<meta name="twitter:title" content="${titleOverrides[file]}">`);
  }
  if (descriptionOverrides[file]) {
    out = out.replace(/<meta name="description"[\s\S]*?content="[^"]*"[^>]*>/i, `<meta name="description" content="${descriptionOverrides[file]}">`);
    out = out.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${descriptionOverrides[file]}">`);
    out = out.replace(/<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="${descriptionOverrides[file]}">`);
  }
  return out;
}

function localizeCurrentPageMeta(html, file) {
  const enUrl = buildUrl("", file);
  const arUrl = buildUrl("ar", file);
  let out = html
    .replace(/<html([^>]*?)lang="[^"]*"([^>]*)>/i, '<html$1lang="ar" dir="rtl"$2>')
    .replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${arUrl}">`)
    .replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${arUrl}">`)
    .replace(/<meta property="og:locale" content="[^"]*">/i, '<meta property="og:locale" content="ar_SA">')
    .replace(/"inLanguage"\s*:\s*"en"/g, '"inLanguage":"ar"')
    .replace(/"url"\s*:\s*"https:\/\/www\.bespringchem\.com\/"/g, '"url":"https://www.bespringchem.com/ar/"');
  if (file !== "index.html") {
    out = out.split(enUrl).join(arUrl);
  }
  return out;
}

function tweakRtlAndBehavior(html) {
  return html
    .replace(/hamburger\.setAttribute\("aria-label",open\?"Close navigation menu":"Open navigation menu"\)/g, 'hamburger.setAttribute("aria-label",open?"إغلاق قائمة التنقل":"فتح قائمة التنقل")')
    .replace(/<body([^>]*)>/i, '<body$1>')
    .replace(/class="site-header"/g, 'class="site-header"')
    .replace(/WhatsApp/g, "واتساب");
}

async function transformPage(file) {
  let html = await readFile(path.join(root, file), "utf8");
  html = adjustAssetsForClone(html);
  html = fixRootLocalizedLinks(html, file);
  html = localizeCurrentPageMeta(html, file);
  html = applyTitleAndDescription(html, file);
  html = applySimpleReplacements(html);
  html = tweakRtlAndBehavior(html);

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
    if (!entry.name.endsWith(".html") || ignoredFiles.has(relative)) {
      continue;
    }
    pages.push(relative);
  }
  return pages.sort();
}

async function main() {
  const pages = await listEnglishPages();
  let created = 0;
  let updated = 0;

  for (const file of pages) {
    const targetRelative = `ar/${file}`;
    const targetPath = path.join(root, targetRelative);
    const alreadyExists = await exists(targetRelative);
    const html = await transformPage(file);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, html, "utf8");
    if (alreadyExists) updated += 1;
    else created += 1;
  }

  console.log(`AR pages upgraded: created ${created}, updated ${updated}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

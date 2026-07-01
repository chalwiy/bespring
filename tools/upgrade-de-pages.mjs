import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = "https://www.bespringchem.com";
const locale = "de";
const localeCode = "de_DE";

const languages = [
  { dir: "", hreflang: "en", label: "EN" },
  { dir: "zh-cn", hreflang: "zh-CN", label: "简" },
  { dir: "zh-tw", hreflang: "zh-TW", label: "繁" },
  { dir: "es", hreflang: "es", label: "ES" },
  { dir: "pt", hreflang: "pt", label: "PT" },
  { dir: "ru", hreflang: "ru", label: "RU" },
  { dir: "de", hreflang: "de", label: "DE" },
  { dir: "ar", hreflang: "ar", label: "AR" }
];

const localeDirs = new Set(languages.filter((item) => item.dir).map((item) => item.dir));
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

const replacements = [
  ["China-based chemical products supplier", "Chinesischer Lieferant fur chemische Produkte"],
  ["China-based chemical ingredients supplier", "Chinesischer Lieferant fur chemische Zutaten"],
  ["China-based supplier of chemical products", "Chinesischer Lieferant fur chemische Produkte"],
  ["China-based supplier of  chemical products ", "Chinesischer Lieferant fur chemische Produkte "],
  ["China-based supplier of food, feed and industrial chemical raw materials for global B2B procurement.", "Chinesischer Lieferant fur chemische Rohstoffe fur Lebensmittel, Futtermittel und industrielle Anwendungen im globalen B2B-Einkauf."],
  ["Exporting to 60+ Countries", "Export in mehr als 60 Lander"],
  ["Exporting to 60+ countries", "Export in mehr als 60 Lander"],
  [">Home<", ">Startseite<"],
  [">About Us<", ">Uber uns<"],
  [">Products<", ">Produkte<"],
  [">Services<", ">Leistungen<"],
  [">News<", ">News<"],
  [">Contact<", ">Kontakt<"],
  [">Contact Us<", ">Kontakt<"],
  [">Quick Links<", ">Schnellzugriffe<"],
  [">Get in Touch<", ">Kontakt aufnehmen<"],
  [">Contact export sales<", ">Exportvertrieb kontaktieren<"],
  [">Browse product portfolios<", ">Produktportfolios durchsuchen<"],
  [">Request a quote<", ">Angebot anfordern<"],
  [">Request a Quote<", ">Angebot anfordern<"],
  [">Ask on WhatsApp<", ">Per WhatsApp anfragen<"],
  [">Ask our export team<", ">Unser Exportteam kontaktieren<"],
  [">Contact us<", ">Kontakt<"],
  [">Read buyer guide<", ">Leitfaden lesen<"],
  [">View event details<", ">Veranstaltungsdetails ansehen<"],
  [">Read guide <", ">Leitfaden lesen <"],
  [">Learn More", ">Mehr erfahren"],
  [">View all buyer guides and company news", ">Alle Einkaufsleitfaden und Unternehmensnews ansehen"],
  [">Browse Food Ingredients<", ">Lebensmittelzutaten ansehen<"],
  [">Discuss Your Application<", ">Ihre Anwendung besprechen<"],
  ["Procurement guide", "Einkaufsleitfaden"],
  ["Application case", "Anwendungsfall"],
  ["Application Cases", "Anwendungsfalle"],
  ["Industry Applications", "Industrieanwendungen"],
  ["Reviewed by Bespring Chemical export team", "Gepruft vom Exportteam von Bespring Chemical"],
  ["Main navigation", "Hauptnavigation"],
  ["Main Navigation", "Hauptnavigation"],
  ["Open navigation menu", "Navigationsmenu offnen"],
  ["Close navigation menu", "Navigationsmenu schliessen"],
  ["Toggle Navigation Menu", "Navigationsmenu umschalten"],
  ["Global sales &amp; export support", "Globaler Vertrieb und Exportunterstutzung"],
  ["Let's discuss your ingredient or chemical requirements", "Lassen Sie uns uber Ihren Bedarf an Zutaten oder Chemikalien sprechen"],
  ["Choose the easiest way to reach us", "Wahlen Sie den einfachsten Kontaktweg"],
  ["Talk to our sales team", "Sprechen Sie mit unserem Vertriebsteam"],
  ["General inquiries", "Allgemeine Anfragen"],
  ["Quick conversation", "Schneller Kontakt"],
  ["Business email", "Geschaftliche E-Mail"],
  ["Product or application", "Produkt oder Anwendung"],
  ["Destination country / port", "Bestimmungsland / Hafen"],
  ["Requirements", "Anforderungen"],
  ["Send Quote Request", "Angebotsanfrage senden"],
  ["Send your requirements", "Ihre Anforderungen senden"],
  ["Prepare an inquiry", "Anfrage vorbereiten"],
  ["Prepare your request", "Ihre Anfrage vorbereiten"],
  ["Prepare a product inquiry", "Produktanfrage vorbereiten"],
  ["Food Grade", "Lebensmittelqualitat"],
  ["Documentation", "Dokumentation"],
  ["Flexible Supply", "Flexible Lieferung"],
  ["International export experience", "Internationale Exporterfahrung"],
  ["Latest insights", "Neueste Einblicke"],
  ["Guides for chemical buyers", "Leitfaden fur Chemieeinkaufer"],
  ["Have a product question?", "Haben Sie eine Produktfrage?"],
  ["Exhibitions archive", "Messearchiv"],
  ["Meetings with international buyers", "Treffen mit internationalen Einkaufern"],
  ["Buyer documentation", "Einkauferdokumentation"],
  ["Documents to align before approval", "Dokumente vor der Freigabe abstimmen"],
  ["Portfolio scope", "Portfolio-Uberblick"],
  ["Product directory", "Produktverzeichnis"],
  ["Related product portfolios", "Verwandte Produktportfolios"],
  ["Continue browsing", "Weiter durchsuchen"],
  ["On this page", "Auf dieser Seite"],
  ["Overview", "Uberblick"],
  ["Functions", "Funktionen"],
  ["Applications", "Anwendungen"],
  ["Specification", "Spezifikation"],
  ["Packing", "Verpackung"],
  ["Quote", "Angebot"],
  ["Quick answer", "Kurze Antwort"],
  ["What is the core difference?", "Was ist der Hauptunterschied?"],
  ["Qualification points buyers should compare", "Punkte, die Einkaufer vergleichen sollten"],
  ["Grade and governing specification", "Qualitat und massgebende Spezifikation"],
  ["Critical analytical limits", "Kritische analytische Grenzwerte"],
  ["Physical form and handling", "Physische Form und Handhabung"],
  ["What to include in an RFQ", "Was in einer RFQ enthalten sein sollte"],
  ["A practical checklist for aligning specifications, SDS, COA, certificates, labels and shipping documents before an international chemical order.", "Praktische Checkliste zur Abstimmung von Spezifikationen, SDS, COA, Zertifikaten, Etiketten und Versanddokumenten vor einer internationalen Chemikalienbestellung."],
  ["Practical product comparisons, supplier-qualification guidance, export documentation notes and verified updates from Bespring Chemical.", "Praktische Produktvergleiche, Hinweise zur Lieferantenqualifizierung, Anmerkungen zu Exportdokumenten und geprufte Updates von Bespring Chemical."],
  ["Browse Bespring Chemical's international exhibition record and open each event page for dates, location, booth and portfolio focus.", "Durchsuchen Sie Bespring Chemicals internationalen Messeverlauf und offnen Sie jede Seite fur Termine, Ort, Stand und Portfolioschwerpunkt."],
  ["Show previous buyer guide", "Vorherigen Leitfaden anzeigen"],
  ["Show next buyer guide", "Nachsten Leitfaden anzeigen"],
  ["Show previous exhibition", "Vorherige Messe anzeigen"],
  ["Show next exhibition", "Nachste Messe anzeigen"],
  ["Send the product, grade, specification and destination. We will respond with the information needed for a meaningful supply review.", "Senden Sie Produkt, Qualitat, Spezifikation und Zielort. Wir antworten mit den Informationen fur eine sinnvolle Lieferprufung."],
  ["News &amp; Insights", "News und Einblicke"],
  ["News & Insights", "News und Einblicke"]
];

const titleOverrides = {
  "index.html": "Bespring Chemical | Globaler Lieferant fur Lebensmittelzutaten, Futtermittelzusatze und Industriechemikalien",
  "news.html": "Einblicke in die Chemiebranche und Unternehmensnews | Bespring",
  "contact.html": "Kontakt mit Bespring Chemical | Angebote und Exportunterstutzung",
  "products/food-ingredients/sodium-tripolyphosphate-stpp.html": "Lieferant fur lebensmitteltaugliches STPP | Natriumtripolyphosphat",
  "products/food-ingredients/sodium-hexametaphosphate-shmp.html": "Lieferant fur lebensmitteltaugliches SHMP | Natriumhexametaphosphat",
  "products/food-ingredients/tetrapotassium-pyrophosphate-tkpp.html": "Lieferant fur lebensmitteltaugliches TKPP | INS 450(v)",
  "products/food-ingredients/calcium-propionate.html": "Lieferant fur lebensmitteltaugliches Calciumpropionat | E282",
  "products/food-ingredients/citric-acid.html": "Lieferant fur lebensmitteltaugliche Zitronensaure | E330",
  "products/food-ingredients/dicalcium-phosphate-dcp.html": "Lieferant fur lebensmitteltaugliches Dicalciumphosphat | DCP E341(ii)",
  "products/food-ingredients/monocalcium-phosphate-mcp.html": "Lieferant fur lebensmitteltaugliches Monocalciumphosphat | MCP E341(i)",
  "products/food-ingredients/sodium-aluminum-phosphate-salp.html": "Lieferant fur lebensmitteltaugliches SALP | Natriumaluminiumphosphat",
  "products/food-ingredients/sodium-carboxymethyl-cellulose-cmc.html": "Lieferant fur lebensmitteltaugliches CMC | Natrium-Carboxymethylcellulose",
  "news/stpp-vs-shmp-selection-guide.html": "STPP vs SHMP: Vergleichsleitfaden fur Einkaufer | Bespring Chemical",
  "news/mcp-vs-dcp-feed-phosphate-guide.html": "MCP vs DCP fur Futtermittel: Qualifizierungsleitfaden fur Einkaufer | Bespring Chemical",
  "news/chemical-export-document-checklist.html": "Checkliste fur Chemie-Importdokumente fur internationale B2B-Einkaufer | Bespring Chemical",
  "news/food-grade-vs-technical-grade-phosphates.html": "Lebensmittelqualitat vs technische Qualitat bei Phosphaten | Bespring Chemical",
  "news/how-to-qualify-chemical-supplier-china.html": "So qualifizieren Sie einen Chemielieferanten in China | Bespring Chemical",
  "news/global-ingredients-show-russia-2025.html": "Global Ingredients Show 2025 in Moskau | Bespring Chemical",
  "news/global-ingredients-show-russia-2024.html": "Global Ingredients Show 2024 in Moskau | Bespring Chemical",
  "news/fi-vietnam-2024.html": "Fi Vietnam 2024 | Bespring Chemical",
  "news/fi-europe-frankfurt-2023.html": "Fi Europe 2023 in Frankfurt | Bespring Chemical",
  "news/vietfood-beverage-2023.html": "Vietfood & Beverage 2023 | Bespring Chemical",
  "applications/food-grade-stpp-meat-processing.html": "Lebensmitteltaugliches STPP fur die Fleischverarbeitung | Anwendungsfall",
  "applications/calcium-propionate-packaged-bread.html": "Calciumpropionat fur verpacktes Brot | Anwendungsfall",
  "applications/mcp-phosphorus-source-poultry-feed.html": "MCP als Phosphorquelle im Geflugelfutter | Anwendungsfall",
  "applications/shmp-industrial-process-water.html": "SHMP in industriellem Prozesswasser | Anwendungsfall",
  "applications/stpp-builder-powder-detergents.html": "STPP als Builder in Pulverwaschmitteln | Anwendungsfall",
  "applications/tkpp-frozen-seafood-processing.html": "TKPP fur die Verarbeitung gefrorener Meeresfruchte | Anwendungsfall",
  "Solutions/food-industry-solutions.html": "Losungen fur Lebensmittelzutaten und Verarbeitung | Bespring Chemical",
  "Solutions/animal-nutrition-solutions.html": "Losungen fur Tierernahrung und Futtermittel | Bespring Chemical",
  "Solutions/water-treatment-solutions.html": "Losungen fur die Wasseraufbereitung | Bespring Chemical",
  "Solutions/industrial-cleaning-solutions.html": "Losungen fur industrielle und Haushaltsreinigung | Bespring Chemical",
  "Solutions/mining-solutions.html": "Chemische Losungen fur den Bergbau | Bespring Chemical",
  "Solutions/agriculture-solutions.html": "Losungen fur Dungemittel und Landwirtschaft | Bespring Chemical"
};

const descriptionOverrides = {
  "index.html": "Bespring Chemical ist ein globaler Lieferant fur Lebensmittelzutaten, Futtermittelzusatze, Phosphate, Wasseraufbereitungschemikalien, Bergbauchemikalien und Dungemittel.",
  "news.html": "Lesen Sie Einkaufsleitfaden, Produktvergleiche, Hinweise zu Exportdokumenten und Unternehmensupdates von Bespring Chemical.",
  "contact.html": "Kontaktieren Sie Bespring Chemical in China fur Angebote, Muster, Dokumente und Exportunterstutzung zu Lebensmittelzutaten, Futtermittelzusatzen, Phosphaten und Industriechemikalien.",
  "products/food-ingredients/sodium-tripolyphosphate-stpp.html": "Lebensmitteltaugliches Natriumtripolyphosphat (STPP/INS 451(i)) fur Fleisch, Meeresfruchte und Molkereiprodukte. Spezifikation, Verpackung und Containerbeladung im Uberblick.",
  "news/stpp-vs-shmp-selection-guide.html": "Vergleichen Sie STPP und SHMP nach chemischer Identitat, Funktion, Qualitat, Spezifikation, physischer Form und Anforderungen an die Lieferantenqualifizierung."
};

function normalizePath(value) {
  return value.replace(/\\/g, "/");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

function pageUrl(dir, file) {
  return dir ? `${dir}/${file}` : file;
}

function buildTargetUrl(dir, file) {
  return `${site}/${file === "index.html" ? `${dir}/` : pageUrl(dir, file)}`.replace(/\/{2,}/g, "/").replace("https:/", "https://");
}

function adjustAssetsForClone(html) {
  return html
    .replace(/(["'(=])((?:\.\.\/)*)(images\/|css\/|js\/|webfonts\/)/g, '$1../$2$3')
    .replace(/url\((['"]?)(\.\.\/)*(images\/)/g, "url($1../$2$3");
}

function fixLocalizedRootLinks(html, file) {
  if (file !== "index.html" && !exactMirrorPages.has(file)) {
    return html;
  }
  return html
    .replace(/href="\.\.\/news\//g, 'href="news/')
    .replace(/href="\.\.\/applications\//g, 'href="applications/')
    .replace(/href="\.\.\/Solutions\//g, 'href="Solutions/')
    .replace(/href="\.\.\/products\/food-ingredients\//g, 'href="products/food-ingredients/');
}

function relativeHref(targetFile, dir) {
  if (!dir) {
    return targetFile === "index.html" ? "../index.html" : `../${targetFile}`;
  }
  if (targetFile === "index.html") {
    return `../${dir}/index.html`;
  }
  return `../${dir}/${targetFile}`;
}

function fallbackForLocale(file, dir) {
  if (!dir) return relativeHref(file, "");
  if (exactMirrorPages.has(file)) return relativeHref(file, dir);
  if (file.startsWith("products/food-ingredients/")) return relativeHref("products/food-ingredients.html", dir);
  if (file.startsWith("Solutions/")) return relativeHref(solutionFallbacks.get(file) || "products.html", dir);
  if (file.startsWith("news/")) return relativeHref("news.html", dir);
  if (file.startsWith("applications/")) return relativeHref("index.html", dir);
  return relativeHref("index.html", dir);
}

function buildLanguageBlock(file) {
  const links = languages.map((lang) => {
    let href;
    if (lang.dir === locale) {
      href = path.basename(file);
    } else if (exactMirrorPages.has(file) && lang.dir) {
      href = relativeHref(file, lang.dir);
    } else if (lang.dir === "") {
      href = relativeHref(file, "");
    } else {
      href = fallbackForLocale(file, lang.dir);
    }
    const active = lang.dir === locale ? ' class="active" aria-current="page"' : "";
    return `          <a href="${href}" lang="${lang.hreflang}"${active}>${lang.label}</a>`;
  }).join("\n");

  return `<div class="bs-seo-language" aria-label="Language selection">
${links}
        </div>`;
}

async function buildAlternateLinks(file) {
  const lines = [];
  for (const lang of languages) {
    if (lang.dir === locale) {
      lines.push(`<link rel="alternate" hreflang="de" href="${buildTargetUrl(locale, file)}">`);
      continue;
    }
    const exactPath = lang.dir ? `${lang.dir}/${file}` : file;
    if (await exists(exactPath)) {
      lines.push(`<link rel="alternate" hreflang="${lang.hreflang}" href="${buildTargetUrl(lang.dir, file)}">`);
    }
  }
  lines.push(`<link rel="alternate" hreflang="x-default" href="${buildTargetUrl("", file)}">`);
  return lines.join("\n  ");
}

function applyReplacements(html, pairs) {
  let out = html;
  for (const [from, to] of pairs) {
    out = out.split(from).join(to);
  }
  return out;
}

function applyOverrides(html, file) {
  let out = html;
  if (titleOverrides[file]) {
    out = out.replace(/<title>[^<]*<\/title>/i, `<title>${titleOverrides[file]}</title>`);
  }
  if (descriptionOverrides[file]) {
    out = out.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${descriptionOverrides[file]}">`);
  }
  return out;
}

function localizeMeta(html, file) {
  const targetUrl = buildTargetUrl(locale, file);
  return html
    .replace(/<html([^>]*?)lang="[^"]*"/i, '<html$1lang="de"')
    .replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${targetUrl}">`)
    .replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${targetUrl}">`)
    .replace(/<meta property="og:locale" content="[^"]*">/i, `<meta property="og:locale" content="${localeCode}">`)
    .replace(/"inLanguage"\s*:\s*"en"/g, '"inLanguage":"de"')
    .replace(/"inLanguage"\s*:\s*"en_US"/g, '"inLanguage":"de"');
}

function localizeJsonLdUrls(html, file) {
  const englishUrl = buildTargetUrl("", file);
  const germanUrl = buildTargetUrl(locale, file);
  return html
    .split(englishUrl).join(germanUrl)
    .replace(/"url"\s*:\s*"https:\/\/www\.bespringchem\.com\/"/g, '"url":"https://www.bespringchem.com/de/"')
    .replace(/"mainEntityOfPage"\s*:\s*"https:\/\/www\.bespringchem\.com\/([^"]+)"/g, `"mainEntityOfPage":"${germanUrl}"`)
    .replace(/"mainEntityOfPage"\s*:\s*\{\s*"@id"\s*:\s*"https:\/\/www\.bespringchem\.com\/([^"]+)"\s*\}/g, `"mainEntityOfPage":{"@id":"${germanUrl}#webpage"}`);
}

function cleanupArtifacts(html) {
  return html
    .replace(/绠€/g, "简")
    .replace(/绻\?\/a>/g, '繁</a>')
    .replace(/鈫\?/g, "&rarr;")
    .replace(/路/g, "·")
    .replace(/Buyer/g, "Einkaufer")
    .replace(/Contact Us/g, "Kontakt")
    .replace(/Get in Touch/g, "Kontakt aufnehmen")
    .replace(/aria-label="Breadcrumb"/g, 'aria-label="Breadcrumb"');
}

async function transformPage(file, alreadyExists) {
  const sourceRelative = alreadyExists ? `${locale}/${file}` : file;
  let html = await readFile(path.join(root, sourceRelative), "utf8");

  if (!alreadyExists) {
    html = adjustAssetsForClone(html);
  }

  html = fixLocalizedRootLinks(html, file);
  html = localizeMeta(html, file);
  html = localizeJsonLdUrls(html, file);
  html = applyOverrides(html, file);
  html = applyReplacements(html, replacements);
  html = cleanupArtifacts(html);

  const alternates = await buildAlternateLinks(file);
  html = html.replace(/<link rel="alternate"[\s\S]*?<meta property=/i, `${alternates}\n\n  <meta property=`);
  html = html.replace(/<div class="bs-seo-language"[\s\S]*?<\/div>/i, buildLanguageBlock(file));

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
    if (!entry.name.endsWith(".html")) continue;
    if (ignoredFiles.has(relative)) continue;
    pages.push(relative);
  }

  return pages.sort();
}

async function main() {
  const englishPages = await listEnglishPages();
  let created = 0;
  let updated = 0;

  for (const file of englishPages) {
    const targetPath = path.join(root, locale, file);
    const alreadyExists = await exists(`${locale}/${file}`);
    const html = await transformPage(file, alreadyExists);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, html, "utf8");
    if (alreadyExists) updated += 1;
    else created += 1;
  }

  console.log(`DE pages upgraded: created ${created}, updated ${updated}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

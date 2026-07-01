import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const languages = [
  { dir: "", lang: "en", label: "EN" },
  { dir: "zh-cn", lang: "zh-CN", label: "简" },
  { dir: "zh-tw", lang: "zh-TW", label: "繁" },
  { dir: "es", lang: "es", label: "ES" },
  { dir: "pt", lang: "pt", label: "PT" },
  { dir: "ru", lang: "ru", label: "RU" },
  { dir: "de", lang: "de", label: "DE" },
  { dir: "ar", lang: "ar", label: "AR" }
];

const files = [
  "index.html",
  "contact.html",
  "products.html",
  "services.html",
  "news.html",
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
  "products/agricultural-fertilizers.html",
  "products/food-ingredients/sodium-tripolyphosphate-stpp.html",
  "products/food-ingredients/sodium-hexametaphosphate-shmp.html",
  "products/food-ingredients/tetrapotassium-pyrophosphate-tkpp.html",
  "products/food-ingredients/sodium-aluminum-phosphate-salp.html",
  "products/food-ingredients/monocalcium-phosphate-mcp.html",
  "products/food-ingredients/dicalcium-phosphate-dcp.html",
  "products/food-ingredients/sodium-carboxymethyl-cellulose-cmc.html",
  "products/food-ingredients/calcium-propionate.html",
  "products/food-ingredients/citric-acid.html",
  "Solutions/food-industry-solutions.html",
  "Solutions/animal-nutrition-solutions.html",
  "Solutions/water-treatment-solutions.html",
  "Solutions/industrial-cleaning-solutions.html",
  "Solutions/mining-solutions.html",
  "Solutions/agriculture-solutions.html",
  "zh-cn/index.html",
  "zh-cn/contact.html",
  "zh-cn/products.html",
  "zh-cn/services.html",
  "zh-cn/news.html",
  "zh-cn/about/company-profile.html",
  "zh-cn/about/production-bases.html",
  "zh-cn/about/global-markets.html",
  "zh-cn/about/certifications.html",
  "zh-cn/about/core-values.html",
  "zh-cn/products/food-ingredients.html",
  "zh-cn/products/animal-nutrition.html",
  "zh-cn/products/home-care-industrial-cleaning.html",
  "zh-cn/products/water-treatment.html",
  "zh-cn/products/mining.html",
  "zh-cn/products/agricultural-fertilizers.html",
  "zh-tw/index.html",
  "zh-tw/contact.html",
  "zh-tw/products.html",
  "zh-tw/services.html",
  "zh-tw/news.html",
  "zh-tw/about/company-profile.html",
  "zh-tw/about/production-bases.html",
  "zh-tw/about/global-markets.html",
  "zh-tw/about/certifications.html",
  "zh-tw/about/core-values.html",
  "zh-tw/products/food-ingredients.html",
  "zh-tw/products/animal-nutrition.html",
  "zh-tw/products/home-care-industrial-cleaning.html",
  "zh-tw/products/water-treatment.html",
  "zh-tw/products/mining.html",
  "zh-tw/products/agricultural-fertilizers.html",
  "es/index.html",
  "es/contact.html",
  "es/products.html",
  "es/services.html",
  "es/news.html",
  "es/about/company-profile.html",
  "es/about/production-bases.html",
  "es/about/global-markets.html",
  "es/about/certifications.html",
  "es/about/core-values.html",
  "es/products/food-ingredients.html",
  "es/products/animal-nutrition.html",
  "es/products/home-care-industrial-cleaning.html",
  "es/products/water-treatment.html",
  "es/products/mining.html",
  "es/products/agricultural-fertilizers.html",
  "pt/index.html",
  "pt/contact.html",
  "pt/products.html",
  "pt/services.html",
  "pt/news.html",
  "pt/about/company-profile.html",
  "pt/about/production-bases.html",
  "pt/about/global-markets.html",
  "pt/about/certifications.html",
  "pt/about/core-values.html",
  "pt/products/food-ingredients.html",
  "pt/products/animal-nutrition.html",
  "pt/products/home-care-industrial-cleaning.html",
  "pt/products/water-treatment.html",
  "pt/products/mining.html",
  "pt/products/agricultural-fertilizers.html",
  "ru/index.html",
  "ru/contact.html",
  "ru/products.html",
  "ru/services.html",
  "ru/news.html",
  "ru/about/company-profile.html",
  "ru/about/production-bases.html",
  "ru/about/global-markets.html",
  "ru/about/certifications.html",
  "ru/about/core-values.html",
  "ru/products/food-ingredients.html",
  "ru/products/animal-nutrition.html",
  "ru/products/home-care-industrial-cleaning.html",
  "ru/products/water-treatment.html",
  "ru/products/mining.html",
  "ru/products/agricultural-fertilizers.html",
  "de/index.html",
  "de/contact.html",
  "de/products.html",
  "de/services.html",
  "de/news.html",
  "de/about/company-profile.html",
  "de/about/production-bases.html",
  "de/about/global-markets.html",
  "de/about/certifications.html",
  "de/about/core-values.html",
  "de/products/food-ingredients.html",
  "de/products/animal-nutrition.html",
  "de/products/home-care-industrial-cleaning.html",
  "de/products/water-treatment.html",
  "de/products/mining.html",
  "de/products/agricultural-fertilizers.html",
  "ar/index.html",
  "ar/contact.html",
  "ar/products.html",
  "ar/services.html",
  "ar/news.html",
  "ar/about/company-profile.html",
  "ar/about/production-bases.html",
  "ar/about/global-markets.html",
  "ar/about/certifications.html",
  "ar/about/core-values.html",
  "ar/products/food-ingredients.html",
  "ar/products/animal-nutrition.html",
  "ar/products/home-care-industrial-cleaning.html",
  "ar/products/water-treatment.html",
  "ar/products/mining.html",
  "ar/products/agricultural-fertilizers.html"
];

const exactMirrorFiles = new Set([
  "index.html",
  "contact.html",
  "products.html",
  "services.html",
  "news.html",
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

const productFallback = "products/food-ingredients.html";
const solutionFallbacks = {
  "Solutions/food-industry-solutions.html": "products/food-ingredients.html",
  "Solutions/animal-nutrition-solutions.html": "products/animal-nutrition.html",
  "Solutions/water-treatment-solutions.html": "products/water-treatment.html",
  "Solutions/industrial-cleaning-solutions.html": "products/home-care-industrial-cleaning.html",
  "Solutions/mining-solutions.html": "products/mining.html",
  "Solutions/agriculture-solutions.html": "products/agricultural-fertilizers.html"
};

function splitLocale(file) {
  const parts = file.split("/");
  if (languages.some((item) => item.dir && item.dir === parts[0])) {
    return { locale: parts[0], inner: parts.slice(1).join("/") };
  }
  return { locale: "", inner: file };
}

function localizedTarget(inner, locale, targetLocale) {
  if (exactMirrorFiles.has(inner)) {
    const target = targetLocale ? `${targetLocale}/${inner}` : inner;
    return target;
  }

  if (inner.startsWith("products/food-ingredients/")) {
    return targetLocale ? `${targetLocale}/${productFallback}` : "products/food-ingredients.html";
  }

  if (inner in solutionFallbacks) {
    const fallback = solutionFallbacks[inner];
    return targetLocale ? `${targetLocale}/${fallback}` : fallback;
  }

  return targetLocale ? `${targetLocale}/index.html` : "index.html";
}

function relativeHref(fromFile, toFile) {
  return path.posix.relative(path.posix.dirname(fromFile), toFile) || path.posix.basename(toFile);
}

function buildLanguageBlock(file) {
  const { locale, inner } = splitLocale(file);
  const lines = languages.map((item) => {
    const targetFile = localizedTarget(inner, locale, item.dir);
    const href = item.dir === locale
      ? path.posix.basename(file)
      : relativeHref(file, targetFile);
    const active = item.dir === locale ? ' class="active" aria-current="page"' : "";
    return `          <a href="${href}" lang="${item.lang}"${active}>${item.label}</a>`;
  });

  return `<div class="bs-seo-language" aria-label="Language selection">
${lines.join("\n")}
        </div>`;
}

for (const file of files) {
  const fullPath = path.join(root, file);
  const original = await readFile(fullPath, "utf8");
  const updated = original.replace(/<div class="bs-seo-language"[\s\S]*?<\/div>/i, buildLanguageBlock(file));
  if (updated !== original) {
    await writeFile(fullPath, updated, "utf8");
  }
}

console.log(`Language switchers normalized: ${files.length}`);

import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const localeMeta = {
  es: "es_ES",
  pt: "pt_PT",
  de: "de_DE",
  ru: "ru_RU",
  ar: "ar_SA",
};

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

for (const [locale, ogLocale] of Object.entries(localeMeta)) {
  const files = [
    ...(await walk(path.join(root, locale, "news"))),
    ...(await walk(path.join(root, locale, "applications"))),
  ];

  for (const file of files) {
    let html = await fs.readFile(file, "utf8");

    if (locale === "ar") {
      html = html.replace(/<html lang="ar"(?! dir="rtl")/i, '<html lang="ar" dir="rtl"');
    }

    if (!html.includes('property="og:locale"')) {
      html = html.replace(
        /<meta property="og:type" content="article">/i,
        `<meta property="og:type" content="article"><meta property="og:locale" content="${ogLocale}">`
      );
    } else {
      html = html.replace(
        /<meta property="og:locale" content="[^"]*">/i,
        `<meta property="og:locale" content="${ogLocale}">`
      );
    }

    await fs.writeFile(file, html, "utf8");
  }
}

console.log("Patched locale SEO metadata for news and applications.");

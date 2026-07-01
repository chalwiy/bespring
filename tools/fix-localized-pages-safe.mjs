import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const locales = ["es", "pt", "ru", "de", "ar"];

async function walk(dir) {
  const output = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...(await walk(full)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      output.push(full);
    }
  }
  return output;
}

function fixLanguageLabels(html) {
  return html
    .replaceAll(">绠€<", ">简<")
    .replaceAll(">绻?/a>", ">繁</a>")
    .replaceAll(">绻?<", ">繁<");
}

function fixBrokenArrows(html) {
  return html.replaceAll(" 鈫?/a>", " &rarr;</a>");
}

function fixCssCustomProps(html) {
  return html.replaceAll('style="-ep-image:', 'style="--ep-image:');
}

function fixArabicDir(html) {
  if (!/<html[^>]*lang="ar"/i.test(html)) return html;
  if (/<html[^>]*dir=/i.test(html)) {
    return html.replace(/<html([^>]*?)dir="[^"]*"/i, '<html$1dir="rtl"');
  }
  return html.replace(/<html([^>]*)>/i, '<html$1 dir="rtl">');
}

let updated = 0;
for (const locale of locales) {
  const files = await walk(path.join(root, locale));
  for (const file of files) {
    const original = await readFile(file, "utf8");
    let html = original;
    html = fixLanguageLabels(html);
    html = fixBrokenArrows(html);
    html = fixCssCustomProps(html);
    html = fixArabicDir(html);
    if (html !== original) {
      await writeFile(file, html, "utf8");
      updated += 1;
    }
  }
}

console.log(`Safe localized fixes applied to ${updated} files`);

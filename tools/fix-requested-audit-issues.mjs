import { access, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const writeChanges = process.argv.includes("--write");
const siteOrigin = "https://www.bespringchem.com";
const localizedRoots = new Set(["ar", "de", "es", "pt", "ru", "zh-cn", "zh-tw"]);
const excludedHtml = new Set(["products/food-ingredients1 - 拷贝.html"]);
const changes = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "_notes") continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.name.endsWith(".html")) files.push(fullPath);
  }
  return files;
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function relative(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)`, "i"))?.[1] || "";
}

function localFileFromSiteUrl(url) {
  if (!url.startsWith(`${siteOrigin}/`)) return null;
  let urlPath = url.slice(`${siteOrigin}/`.length);
  if (!urlPath || urlPath.endsWith("/")) urlPath += "index.html";
  return path.join(root, ...urlPath.split("/"));
}

function repairSchemaTypes(html, file) {
  const replacements = [
    [/"@type"\s*:\s*"Хлебные крошкиList"/g, '"@type": "BreadcrumbList"'],
    [/"@type"\s*:\s*"Продукт"/g, '"@type": "Product"'],
    [/"@type"\s*:\s*"Brи"/g, '"@type": "Brand"'],
    [/"@type"\s*:\s*"Servicio"/g, '"@type": "Service"'],
  ];
  let output = html;
  for (const [pattern, replacement] of replacements) {
    const matches = output.match(pattern)?.length || 0;
    if (matches) {
      output = output.replace(pattern, replacement);
      changes.push(`${relative(file)}: repaired ${matches} Schema @type value(s)`);
    }
  }
  return output;
}

function repairKnownPageDefects(html, file) {
  const fileRelative = relative(file);
  let output = html;
  if (fileRelative === "contact.html") {
    const repaired = output.replace(
      /"alternateName"\s*:\s*\["Bespring Chemical",[\s\S]*?\],\s*\r?\n\s*"url"/,
      '"alternateName": ["Bespring Chemical"],\n        "url"',
    );
    if (repaired !== output) {
      output = repaired;
      changes.push(`${fileRelative}: repaired invalid Organization alternateName JSON`);
    }
  }
  if (
    fileRelative === "products/food-ingredients/dicalcium-phosphate-dcp.html"
    || fileRelative === "de/products/food-ingredients/dicalcium-phosphate-dcp.html"
  ) {
    const oldImages = [
      "images/products/dicalcium-phosphate-dcp-food-grade.webp",
      "images/dicalcium-phosphate-dcp-feed-grade-china-supplier.jpg",
    ];
    const newImage = "images/dicalcium-phosphate-dcp-product.jpg";
    for (const oldImage of oldImages) {
      const matches = output.split(oldImage).length - 1;
      if (!matches) continue;
      output = output.replaceAll(oldImage, newImage);
      changes.push(`${fileRelative}: repaired ${matches} DCP image reference(s)`);
    }
  }
  return output;
}

async function removeMissingHreflangTargets(html, file, locale) {
  if (locale !== "es" && locale !== "pt") return html;
  const tags = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);
  let output = html;
  for (const tag of tags) {
    if (attribute(tag, "rel").toLowerCase() !== "alternate") continue;
    const href = attribute(tag, "href");
    const target = localFileFromSiteUrl(href);
    if (target && !await exists(target)) {
      output = output.replace(tag, "");
      changes.push(`${relative(file)}: removed missing ${attribute(tag, "hreflang")} hreflang target`);
    }
  }
  return output;
}

async function localizeInternalLinks(html, file, locale) {
  if (locale !== "es" && locale !== "pt") return html;
  const headEnd = html.search(/<\/head>/i);
  if (headEnd < 0) return html;

  const head = html.slice(0, headEnd + 7);
  let body = html.slice(headEnd + 7);
  const protectedSwitchers = [];
  body = body.replace(
    /<div\b[^>]*class=["'][^"']*\bbs-seo-language\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
    (block) => {
      const token = `<!--__LANGUAGE_SWITCHER_${protectedSwitchers.length}__-->`;
      protectedSwitchers.push(block);
      return token;
    },
  );

  const tags = [...body.matchAll(/<a\b[^>]*\bhref=["'][^"']*["'][^>]*>/gi)].map((match) => match[0]);
  for (const tag of tags) {
    const href = attribute(tag, "href");
    if (!href || /^(?:https?:|mailto:|tel:|javascript:|data:|#|\/\/|\/)/i.test(href)) continue;
    const suffixIndex = href.search(/[?#]/);
    const cleanHref = suffixIndex >= 0 ? href.slice(0, suffixIndex) : href;
    const suffix = suffixIndex >= 0 ? href.slice(suffixIndex) : "";
    let decodedHref;
    try {
      decodedHref = decodeURIComponent(cleanHref);
    } catch {
      decodedHref = cleanHref;
    }
    const target = path.resolve(path.dirname(file), decodedHref);
    const targetRelative = path.relative(root, target);
    if (targetRelative.startsWith("..") || !target.toLowerCase().endsWith(".html")) continue;
    const firstSegment = targetRelative.split(path.sep)[0];
    if (localizedRoots.has(firstSegment)) continue;
    const localizedTarget = path.join(root, locale, targetRelative);
    if (!await exists(localizedTarget)) continue;
    const localizedHref = path.relative(path.dirname(file), localizedTarget).replaceAll("\\", "/") + suffix;
    const updatedTag = tag.replace(
      /(\bhref=["'])[^"']*(["'])/i,
      `$1${localizedHref}$2`,
    );
    body = body.replace(tag, updatedTag);
    changes.push(`${relative(file)}: localized ${href} -> ${localizedHref}`);
  }

  body = body.replace(/<!--__LANGUAGE_SWITCHER_(\d+)__-->/g, (_, index) => protectedSwitchers[Number(index)]);
  return head + body;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const htmlFiles = (await walk(root))
  .filter((file) => !excludedHtml.has(relative(file)))
  .sort((a, b) => relative(a).localeCompare(relative(b), "en"));

for (const file of htmlFiles) {
  const fileRelative = relative(file);
  const firstSegment = fileRelative.split("/")[0];
  const locale = localizedRoots.has(firstSegment) ? firstSegment : "en";
  const original = await readFile(file, "utf8");
  let updated = repairKnownPageDefects(original, file);
  updated = repairSchemaTypes(updated, file);
  updated = await removeMissingHreflangTargets(updated, file, locale);
  updated = await localizeInternalLinks(updated, file, locale);
  if (updated !== original && writeChanges) await writeFile(file, updated, "utf8");
}

const canonicalUrls = new Set();
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const canonicalTag = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i)?.[0]
    || html.match(/<link\b[^>]*\bhref=["'][^"']*["'][^>]*\brel=["']canonical["'][^>]*>/i)?.[0];
  const canonical = canonicalTag ? attribute(canonicalTag, "href") : "";
  if (!canonical.startsWith(`${siteOrigin}/`)) {
    throw new Error(`${relative(file)} has no valid canonical URL`);
  }
  canonicalUrls.add(canonical);
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...[...canonicalUrls].sort((a, b) => a.localeCompare(b, "en")).map((url) => [
    "  <url>",
    `    <loc>${escapeXml(url)}</loc>`,
    "  </url>",
  ].join("\n")),
  "</urlset>",
  "",
].join("\n");

if (writeChanges) await writeFile(path.join(root, "sitemap.xml"), sitemap, "utf8");

const validationIssues = [];
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      validationIssues.push(`${relative(file)}: invalid JSON-LD (${error.message})`);
    }
  }
  for (const tag of html.matchAll(/<link\b[^>]*>/gi)) {
    if (attribute(tag[0], "rel").toLowerCase() !== "alternate") continue;
    const target = localFileFromSiteUrl(attribute(tag[0], "href"));
    if (target && !await exists(target)) {
      validationIssues.push(`${relative(file)}: missing hreflang target ${attribute(tag[0], "href")}`);
    }
  }
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(reference)) continue;
    let cleanReference = reference.split(/[?#]/, 1)[0];
    if (!cleanReference) continue;
    try {
      cleanReference = decodeURIComponent(cleanReference);
    } catch {}
    const target = cleanReference.startsWith("/")
      ? path.join(root, cleanReference.slice(1))
      : path.resolve(path.dirname(file), cleanReference);
    if (!await exists(target)) validationIssues.push(`${relative(file)}: missing local reference ${reference}`);
  }
}

console.log(`Mode: ${writeChanges ? "write" : "check"}`);
console.log(`HTML pages included in sitemap: ${canonicalUrls.size}`);
console.log(`Planned content fixes: ${changes.length}`);
for (const change of changes) console.log(`- ${change}`);
console.log(`Validation issues: ${validationIssues.length}`);
for (const issue of validationIssues) console.log(`ERROR ${issue}`);
if (validationIssues.length) process.exitCode = 1;

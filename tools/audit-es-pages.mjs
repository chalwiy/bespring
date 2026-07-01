import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const esRoot = path.join(root, "es");
const completed = new Set([
  "index.html",
  "about/certifications.html",
  "about/company-profile.html",
  "about/core-values.html",
  "about/global-markets.html",
  "about/production-bases.html"
]);
const showDetails = process.argv.includes("--details");
const fileFilterArg = process.argv.find((value) => value.startsWith("--filter="));
const fileFilter = fileFilterArg ? fileFilterArg.slice("--filter=".length) : "";
const english = /\b(?:the|and|or|with|from|for|supplier|manufacturer|chemical|chemicals|food|feed|water|processing|product|products|application|applications|quality|export|industry|industrial|grade|current|document|documents|buyer|buyers|supply|market|production|requirements|review|support|company|about|our|what|how|where|which|does|can|before|after|during|displayed|certificate|network|service|services|news|contact|request|read|learn|view|explore|solution|solutions|ingredient|ingredients|packaging|shipping|storage|testing|specification|specifications|available|international|global|home|profile|values|question|questions)\b/i;
const ignoredSchemaValues = new Set([
  "Organization", "Corporation", "ImageObject", "PostalAddress", "ContactPoint",
  "AboutPage", "WebPage", "WebSite", "BreadcrumbList", "ListItem", "FAQPage",
  "Question", "Answer", "ItemList", "Article", "NewsArticle", "Product", "Offer",
  "Place", "Event", "Person"
]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function collectJsonStrings(value, output) {
  if (typeof value === "string") output.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectJsonStrings(item, output));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectJsonStrings(item, output));
}

for (const file of (await walk(esRoot)).sort()) {
  const relative = path.relative(esRoot, file).replaceAll("\\", "/");
  if (completed.has(relative)) continue;
  if (fileFilter && !relative.includes(fileFilter)) continue;
  const html = await readFile(file, "utf8");
  const withoutScripts = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "");
  const strings = [
    ...[...withoutScripts.matchAll(/>([^<>]+)</g)].map((match) => match[1].trim()),
    ...[...withoutScripts.matchAll(/(?:content|alt|aria-label|title|placeholder)="([^"]+)"/g)].map((match) => match[1].trim())
  ];
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      collectJsonStrings(JSON.parse(match[1]), strings);
    } catch {
      strings.push("INVALID JSON-LD");
    }
  }
  const residual = [...new Set(strings.filter((value) =>
    value &&
    !/^(?:https?:|mailto:|tel:|CN$|es$|\+\d)/i.test(value) &&
    !ignoredSchemaValues.has(value) &&
    english.test(value)
  ))];
  console.log(`${String(residual.length).padStart(3)}  ${relative}`);
  if (showDetails) {
    for (const value of residual) console.log(`     - ${value}`);
  }
}

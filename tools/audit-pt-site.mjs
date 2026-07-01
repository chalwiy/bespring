import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ptRoot = path.join(root, "pt");
const site = "https://www.bespringchem.com";
const errors = [];
const warnings = [];
const canonicals = new Map();

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

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

for (const file of (await walk(ptRoot)).sort()) {
  const relative = path.relative(ptRoot, file).replaceAll("\\", "/");
  const html = await readFile(file, "utf8");
  const expectedCanonical = relative === "index.html"
    ? `${site}/pt/`
    : `${site}/pt/${relative}`;

  if (!/<html[^>]*lang="pt-BR"/i.test(html)) errors.push(`${relative}: html lang is not pt-BR`);
  if (!/<title>[^<]{10,}<\/title>/i.test(html)) errors.push(`${relative}: missing or short title`);
  if (!/<meta\s+name="description"[\s\S]*?content="[^"]{50,}"/i.test(html)) {
    errors.push(`${relative}: missing or short meta description`);
  }
  if (!html.includes(`<link rel="canonical" href="${expectedCanonical}">`)) {
    errors.push(`${relative}: canonical mismatch (expected ${expectedCanonical})`);
  }
  if (!/property="og:locale" content="pt_BR"/i.test(html)) warnings.push(`${relative}: missing og:locale pt_BR`);
  if (!html.includes(`hreflang="pt-BR" href="${expectedCanonical}"`)) {
    warnings.push(`${relative}: missing self-referencing pt-BR hreflang`);
  }
  if (/�|谩|绠|绻|鎷|閻|崠|鏍|妾|寰/.test(html)) errors.push(`${relative}: encoding artifact`);
  if (/\b(?:Iniciocare|Miniciocare|Exporteo|Continueo|avalieo|produtoion|aria-expeed)\b/i.test(html)) {
    errors.push(`${relative}: known machine-translation artifact`);
  }

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  if (canonical) {
    if (canonicals.has(canonical)) errors.push(`${relative}: duplicate canonical with ${canonicals.get(canonical)}`);
    canonicals.set(canonical, relative);
  }

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${relative}: invalid JSON-LD (${error.message})`);
    }
  }

  const refs = [...html.matchAll(/\b(?:href|src)="([^"]+)"/gi)]
    .map((match) => match[1])
    .filter((value) => !/^(?:https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(value))
    .map((value) => decodeURIComponent(value.split(/[?#]/, 1)[0]))
    .filter(Boolean);

  for (const ref of new Set(refs)) {
    const target = path.resolve(path.dirname(file), ref);
    if (!await exists(target)) errors.push(`${relative}: broken local reference ${ref}`);
  }
}

console.log(`Audited ${canonicals.size} Portuguese pages.`);
console.log(`Errors: ${errors.length}; warnings: ${warnings.length}`);
for (const issue of errors) console.log(`ERROR ${issue}`);
for (const issue of warnings) console.log(`WARN  ${issue}`);
if (errors.length) process.exitCode = 1;

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ptRoot = path.join(root, "pt");
const sitemapPath = path.join(root, "sitemap.xml");
const site = "https://www.bespringchem.com";

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

let sitemap = await readFile(sitemapPath, "utf8");
sitemap = sitemap.replace(/\s*<url>\s*<loc>https:\/\/www\.bespringchem\.com\/pt\/[\s\S]*?<\/url>/g, "");

const entries = (await walk(ptRoot)).sort().map((file) => {
  const relative = path.relative(ptRoot, file).replaceAll("\\", "/");
  const loc = relative === "index.html" ? `${site}/pt/` : `${site}/pt/${relative}`;
  const priority = relative === "index.html" ? "0.8" : /^(?:products|solutions)\//.test(relative) ? "0.7" : "0.6";
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>2026-07-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
});

sitemap = sitemap.replace(/\s*<\/urlset>\s*$/, `\n${entries.join("\n")}\n</urlset>\n`);
await writeFile(sitemapPath, sitemap, "utf8");
console.log(`Added ${entries.length} Portuguese URLs to sitemap.xml`);

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = "https://www.bespringchem.com";

const guides = [
  {
    slug: "stpp-vs-shmp-selection-guide",
    title: "STPP vs SHMP: How Industrial Buyers Should Compare the Two Phosphates",
    date: "2026-06-18",
    display: "June 18, 2026",
    image: "stpp-food-grade-sodium-tripolyphosphate-china-supplier.jpg",
    desc: "Compare STPP and SHMP by chemical identity, function, grade, specification, physical form and supplier-qualification requirements."
  },
  {
    slug: "mcp-vs-dcp-feed-phosphate-guide",
    title: "MCP vs DCP Feed Phosphates: A Buyer’s Qualification Guide",
    date: "2026-05-26",
    display: "May 26, 2026",
    image: "mcp-dcp-feed-grade-calcium-phosphate-animal-nutrition-china.jpg",
    desc: "Compare nutrient identity, assay, physical form, contaminant limits and documents when sourcing MCP or DCP."
  },
  {
    slug: "chemical-export-document-checklist",
    title: "Chemical Import Document Checklist for International B2B Buyers",
    date: "2026-04-30",
    display: "April 30, 2026",
    image: "bespring-export-chemical-shipment-container-loading-port.png",
    desc: "Align the specification, SDS, COA, certificates, labels and shipping documents before an international chemical order."
  },
  {
    slug: "food-grade-vs-technical-grade-phosphates",
    title: "Food Grade vs Technical Grade Phosphates: What Buyers Must Verify",
    date: "2026-03-20",
    display: "March 20, 2026",
    image: "stpp-food-grade-sodium-tripolyphosphate-china-supplier.jpg",
    desc: "Understand how grade, specification, impurity limits, manufacturing controls and market suitability change the approval basis."
  },
  {
    slug: "how-to-qualify-chemical-supplier-china",
    title: "How to Qualify a Chemical Supplier in China: A Practical Buyer Checklist",
    date: "2026-02-12",
    display: "February 12, 2026",
    image: "bespring-quality-control-laboratory-chemical-testing-phosphate.png",
    desc: "Verify legal identity, product source, specifications, quality documents, traceability and export capability."
  }
];

const cards = guides.map((guide) => `<article class="news-entry">
  <img src="images/${guide.image}" alt="${guide.title}" loading="lazy" width="640" height="360">
  <div class="news-entry__body">
    <span class="news-entry__type">Procurement guide</span>
    <time datetime="${guide.date}">${guide.display}</time>
    <h2>${guide.title}</h2>
    <p>${guide.desc}</p>
    <a href="news/${guide.slug}.html">Read buyer guide <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
  </div>
</article>`).join("");

const section = `<section class="ep-section ep-section--cream" aria-labelledby="guides-title"><div class="container">
  <div class="ep-section-head"><div><p class="ep-eyebrow">Latest insights</p><h2 id="guides-title">Guides for chemical buyers</h2></div><p>Specification-led articles written around real B2B search and qualification questions. Use them for initial evaluation, then verify the exact product and destination-market requirements.</p></div>
  <div class="exhibition-carousel" data-guide-carousel>
    <div class="exhibition-viewport" tabindex="0" aria-label="Chemical buyer guides">
      <div class="exhibition-track">${cards}</div>
    </div>
    <div class="exhibition-controls">
      <p class="exhibition-status" aria-live="polite"><span data-guide-current>1</span> / ${guides.length}</p>
      <div class="exhibition-buttons">
        <button class="exhibition-btn" type="button" data-guide-prev aria-label="Show previous buyer guide"><i class="fas fa-arrow-left" aria-hidden="true"></i></button>
        <button class="exhibition-btn" type="button" data-guide-next aria-label="Show next buyer guide"><i class="fas fa-arrow-right" aria-hidden="true"></i></button>
      </div>
    </div>
  </div>
</div></section>`;

const script = `<script>
(() => {
  const root = document.querySelector("[data-guide-carousel]");
  if (!root) return;
  const viewport = root.querySelector(".exhibition-viewport");
  const cards = [...root.querySelectorAll(".news-entry")];
  const current = root.querySelector("[data-guide-current]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer;
  const step = () => cards[0].getBoundingClientRect().width + 20;
  const index = () => Math.max(0, Math.min(cards.length - 1, Math.round(viewport.scrollLeft / step())));
  const update = () => { current.textContent = String(index() + 1); };
  const move = direction => {
    const position = index();
    const next = direction > 0 && position >= cards.length - 1 ? 0 : direction < 0 && position === 0 ? cards.length - 1 : position + direction;
    viewport.scrollTo({ left: next * step(), behavior: reduced ? "auto" : "smooth" });
  };
  const stop = () => window.clearInterval(timer);
  const start = () => { stop(); if (!reduced) timer = window.setInterval(() => move(1), 6200); };
  root.querySelector("[data-guide-prev]").addEventListener("click", () => move(-1));
  root.querySelector("[data-guide-next]").addEventListener("click", () => move(1));
  viewport.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", start);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  start();
})();
</script>`;

const guideSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Chemical procurement guides by Bespring Chemical",
  numberOfItems: guides.length,
  itemListElement: guides.map((guide, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${site}/news/${guide.slug}.html`,
    name: guide.title
  }))
};

const newsPath = path.join(root, "news.html");
let news = await readFile(newsPath, "utf8");
const start = news.indexOf('<section class="ep-section ep-section--cream"');
const end = news.indexOf('<section class="ep-section"', start + 20);
if (start < 0 || end < 0) throw new Error("Buyer guide section markers were not found in news.html");
news = `${news.slice(0, start)}${section}${news.slice(end)}`;
news = news.replace("</head>", `<script type="application/ld+json">${JSON.stringify(guideSchema)}</script></head>`);
news = news.replace("</body>", `${script}</body>`);
await writeFile(newsPath, news, "utf8");

const homepageGuides = [guides[4], guides[0], guides[1], guides[3]];
const featured = homepageGuides[0];
const homepageSection = `<section class="bs-news-section" aria-labelledby="homepage-news-title"><div class="container">
  <div class="bs-section-header"><h2 class="bs-section-title" id="homepage-news-title">News &amp; Buyer Guides</h2><p class="bs-section-subtitle">Specification-led sourcing guidance for food, feed and industrial chemical procurement.</p></div>
  <div class="bs-news-layout">
    <article class="bs-news-featured" itemscope itemtype="https://schema.org/Article">
      <div class="bs-news-date-badge">${featured.date.slice(0, 7)}</div>
      <meta itemprop="datePublished" content="${featured.date}"><meta itemprop="author" content="Bespring Chemical Co., Ltd.">
      <h3 class="bs-news-featured-title" itemprop="headline">${featured.title}</h3>
      <p class="bs-news-featured-desc" itemprop="description">${featured.desc} The guide provides a structured qualification checklist for international procurement teams.</p>
      <a href="news/${featured.slug}.html" class="bs-news-link" itemprop="url">Read Full Guide →</a>
    </article>
    <div class="bs-news-list">${homepageGuides.slice(1).map((guide) => `<article class="bs-news-item" itemscope itemtype="https://schema.org/Article"><meta itemprop="datePublished" content="${guide.date}"><meta itemprop="author" content="Bespring Chemical Co., Ltd."><h3 class="bs-news-item-title" itemprop="headline">${guide.title}</h3><p class="bs-news-item-desc" itemprop="description">${guide.desc}</p><a href="news/${guide.slug}.html" class="bs-news-link-small" itemprop="url">Learn More →</a></article>`).join("")}</div>
  </div>
  <p style="margin:28px 0 0;text-align:center"><a href="news.html" class="bs-news-link-small">View all buyer guides and company news →</a></p>
</div></section>`;

const indexPath = path.join(root, "index.html");
let index = await readFile(indexPath, "utf8");
const homeStart = index.indexOf('<section class="bs-news-section"');
const homeEnd = index.indexOf('<section class="bs-global"', homeStart);
if (homeStart < 0 || homeEnd < 0) throw new Error("Homepage news section markers were not found");
index = `${index.slice(0, homeStart)}${homepageSection}\n\n${index.slice(homeEnd)}`;
await writeFile(indexPath, index, "utf8");

console.log(`Built buyer-guide carousel, ${guides.length} guide links, and 4 homepage article links.`);

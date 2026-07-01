import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = "https://www.bespringchem.com";

const events = [
  {
    slug: "global-ingredients-show-russia-2025",
    title: "Global Ingredients Show 2025 · Moscow, Russia",
    seoTitle: "Global Ingredients Show Russia 2025 | Bespring",
    published: "2025-03-09",
    display: "March 9, 2025",
    start: "2025-04-15",
    end: "2025-04-17",
    venue: "Crocus Expo, Moscow, Russia",
    booth: "A512",
    image: "russia2025.png",
    summary: "Bespring Chemical exhibited at Global Ingredients Show 2025 in Moscow from April 15–17 at booth A512.",
    focus: "Food ingredients, phosphate products, feed additives and industrial chemical raw materials"
  },
  {
    slug: "fi-vietnam-2024",
    title: "Fi Vietnam 2024 · Ho Chi Minh City, Vietnam",
    seoTitle: "Fi Vietnam 2024 | Bespring Chemical",
    published: "2024-06-22",
    display: "June 22, 2024",
    start: "2024-10-09",
    end: "2024-10-11",
    venue: "Ho Chi Minh City, Vietnam",
    booth: "B40",
    image: "fivietnam2024.png",
    summary: "Bespring Chemical participated in Fi Vietnam 2024 in Ho Chi Minh City from October 9–11 at booth B40.",
    focus: "Food-grade phosphates, preservatives, texturizers and other food ingredients"
  },
  {
    slug: "global-ingredients-show-russia-2024",
    title: "Global Ingredients Show 2024 · Moscow, Russia",
    seoTitle: "Global Ingredients Show Russia 2024 | Bespring",
    published: "2024-03-01",
    display: "March 1, 2024",
    start: "2024-04-23",
    end: "2024-04-25",
    venue: "Moscow, Russia",
    booth: "D115",
    image: "russia2024.jpg",
    summary: "Bespring Chemical participated in Global Ingredients Show 2024 in Moscow from April 23–25 at booth D115.",
    focus: "Food ingredients, mineral salts, feed additives and export supply services"
  },
  {
    slug: "fi-europe-frankfurt-2023",
    title: "Fi Europe 2023 · Frankfurt, Germany",
    seoTitle: "Fi Europe Frankfurt 2023 | Bespring Chemical",
    published: "2023-10-01",
    display: "October 1, 2023",
    start: "2023-11-28",
    end: "2023-11-30",
    venue: "Messe Frankfurt, Frankfurt, Germany",
    booth: "3.1A33",
    image: "fieurope2023.jpg",
    summary: "Bespring Chemical participated in Fi Europe 2023 in Frankfurt from November 28–30 at booth 3.1A33.",
    focus: "Food phosphates, preservatives, acidulants and functional food ingredients"
  },
  {
    slug: "vietfood-beverage-2023",
    title: "Vietfood & Beverage 2023 · Ho Chi Minh City",
    seoTitle: "Vietfood & Beverage 2023 | Bespring Chemical",
    published: "2023-07-01",
    display: "July 1, 2023",
    start: "2023-08-10",
    end: "2023-08-12",
    venue: "Ho Chi Minh City, Vietnam",
    booth: "A3.127",
    image: "vietfoodbeverage2023.jpg",
    summary: "Bespring Chemical participated in Vietfood & Beverage 2023 in Ho Chi Minh City from August 10–12 at booth A3.127.",
    focus: "Food additives, phosphate ingredients and sourcing support for Southeast Asian buyers"
  }
];

const cards = events.map((event) => `<article class="news-entry">
  <img src="images/${event.image}" alt="${event.title}" loading="lazy" width="640" height="360">
  <div class="news-entry__body">
    <span class="news-entry__type">Exhibition archive</span>
    <time datetime="${event.published}">${event.display}</time>
    <h2>${event.title}</h2>
    <p>${event.summary}</p>
    <a href="news/${event.slug}.html">View event details <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
  </div>
</article>`).join("");

const carousel = `<section class="ep-section" aria-labelledby="exhibitions-title"><div class="container">
  <div class="ep-section-head"><div><p class="ep-eyebrow">Exhibitions archive</p><h2 id="exhibitions-title">Meetings with international buyers</h2></div><p>Browse Bespring Chemical's international exhibition record and open each event page for dates, location, booth and portfolio focus.</p></div>
  <div class="exhibition-carousel" data-exhibition-carousel>
    <div class="exhibition-viewport" tabindex="0" aria-label="International exhibition news">
      <div class="exhibition-track">${cards}</div>
    </div>
    <div class="exhibition-controls">
      <p class="exhibition-status" aria-live="polite"><span data-current>1</span> / ${events.length}</p>
      <div class="exhibition-buttons">
        <button class="exhibition-btn" type="button" data-prev aria-label="Show previous exhibition"><i class="fas fa-arrow-left" aria-hidden="true"></i></button>
        <button class="exhibition-btn" type="button" data-next aria-label="Show next exhibition"><i class="fas fa-arrow-right" aria-hidden="true"></i></button>
      </div>
    </div>
  </div>
</div></section>`;

const carouselScript = `<script>
(() => {
  const root = document.querySelector("[data-exhibition-carousel]");
  if (!root) return;
  const viewport = root.querySelector(".exhibition-viewport");
  const cards = [...root.querySelectorAll(".news-entry")];
  const current = root.querySelector("[data-current]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer;
  const step = () => cards[0].getBoundingClientRect().width + 20;
  const index = () => Math.max(0, Math.min(cards.length - 1, Math.round(viewport.scrollLeft / step())));
  const update = () => { current.textContent = String(index() + 1); };
  const move = direction => {
    const next = direction > 0 && index() >= cards.length - 1 ? 0 : direction < 0 && index() === 0 ? cards.length - 1 : index() + direction;
    viewport.scrollTo({ left: next * step(), behavior: reduced ? "auto" : "smooth" });
  };
  root.querySelector("[data-prev]").addEventListener("click", () => move(-1));
  root.querySelector("[data-next]").addEventListener("click", () => move(1));
  viewport.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
  const stop = () => window.clearInterval(timer);
  const start = () => { stop(); if (!reduced) timer = window.setInterval(() => move(1), 5500); };
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", start);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  start();
})();
</script>`;

const header = `<div class="bs-seo-topbar"><div class="container bs-seo-topbar-container"><div class="bs-seo-topbar-left"><span class="bs-seo-highlight"><i class="fas fa-industry" aria-hidden="true"></i> China-based chemical ingredients supplier</span><span class="bs-seo-divider">|</span><span><i class="fas fa-globe" aria-hidden="true"></i> Exporting to 60+ countries</span></div><div class="bs-seo-topbar-right"><a href="mailto:info@bespringchem.com" class="bs-seo-contact"><i class="fas fa-envelope" aria-hidden="true"></i> info@bespringchem.com</a><a href="tel:+8613914896109" class="bs-seo-contact"><i class="fas fa-phone" aria-hidden="true"></i> +86 139 1489 6109</a></div></div></div><header class="site-header"><div class="container nav-container"><div class="logo"><a href="../index.html"><img src="../images/logo.png" alt="Bespring Chemical"></a></div><nav class="main-nav" aria-label="Main navigation"><ul><li><a href="../index.html">Home</a></li><li><a href="../about/company-profile.html">About Us</a></li><li><a href="../products.html">Products</a></li><li><a href="../services.html">Services</a></li><li><a href="../news.html" aria-current="page">News</a></li><li><a href="../contact.html" class="btn-nav">Contact</a></li></ul></nav><button class="hamburger" aria-label="Open navigation menu" aria-expanded="false"><i class="fas fa-bars" aria-hidden="true"></i></button></div></header>`;

const footer = `<footer class="crc-footer"><div class="container footer-grid"><div class="footer-col"><h3>Bespring Chemical</h3><p>China-based supplier of food, feed and industrial chemical raw materials for global B2B procurement.</p></div><div class="footer-col footer-links"><h3>Quick Links</h3><ul><li><a href="../products.html">Products</a></li><li><a href="../services.html">Services</a></li><li><a href="../news.html">News</a></li></ul></div><div class="footer-col"><h3>Contact Us</h3><p><a href="tel:+8613914896109">+86 139 1489 6109</a></p><p><a href="mailto:info@bespringchem.com">info@bespringchem.com</a></p><a href="../contact.html" class="contact-btn-footer">Get in Touch</a></div></div><div class="footer-bottom">&copy; 2026 Bespring Chemical Co., Ltd. All rights reserved.</div></footer><script>const hamburger=document.querySelector(".hamburger");const navigation=document.querySelector(".main-nav");hamburger?.addEventListener("click",()=>{const open=navigation.classList.toggle("active");hamburger.setAttribute("aria-expanded",String(open))});</script>`;

function eventPage(event) {
  const description = `${event.summary} Event venue, booth information and portfolio focus.`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: event.title,
        description,
        datePublished: event.published,
        dateModified: event.published,
        mainEntityOfPage: `${site}/news/${event.slug}.html`,
        image: `${site}/images/${event.image}`,
        author: { "@type": "Organization", name: "Bespring Chemical Co., Ltd." },
        publisher: { "@type": "Organization", name: "Bespring Chemical Co., Ltd.", logo: { "@type": "ImageObject", url: `${site}/images/logo.png` } }
      },
      {
        "@type": "Event",
        name: event.title,
        startDate: event.start,
        endDate: event.end,
        eventStatus: "https://schema.org/EventCompleted",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: { "@type": "Place", name: event.venue, address: event.venue },
        organizer: { "@type": "Organization", name: "Exhibition organizer" },
        attendee: { "@type": "Organization", name: "Bespring Chemical Co., Ltd." }
      }
    ]
  };
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${event.seoTitle}</title><meta name="description" content="${description}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${site}/news/${event.slug}.html"><meta property="og:type" content="article"><meta property="og:title" content="${event.title}"><meta property="og:description" content="${description}"><meta property="og:image" content="${site}/images/${event.image}"><meta property="og:url" content="${site}/news/${event.slug}.html"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="../images/favicon.ico"><link rel="stylesheet" href="../css/style.css"><link rel="stylesheet" href="../css/site-pages.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"><script type="application/ld+json">${JSON.stringify(schema)}</script></head><body class="editorial-page">${header}<main><article><header class="ep-hero" style="--ep-image:url('../images/${event.image}')"><div class="container"><nav class="ep-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="../index.html">Home</a></li><li><a href="../news.html">News &amp; Insights</a></li><li aria-current="page">Exhibition</li></ol></nav><p class="ep-eyebrow">Exhibition archive</p><h1>${event.title}</h1><p class="ep-hero__lead">${event.summary}</p><div class="article-meta"><time datetime="${event.published}">Published ${event.display}</time><span>Booth ${event.booth}</span></div></div></header><div class="container article-layout"><div class="article-body"><p class="lead">Bespring Chemical joined this international exhibition to meet ingredient distributors, manufacturers and procurement teams and to discuss product specifications, documentation and export supply requirements.</p><h2>Event information</h2><ul><li><strong>Event dates:</strong> ${event.start} to ${event.end}</li><li><strong>Location:</strong> ${event.venue}</li><li><strong>Bespring booth:</strong> ${event.booth}</li><li><strong>Portfolio focus:</strong> ${event.focus}</li></ul><h2>Conversations with international buyers</h2><p>The exhibition provided an opportunity to discuss grade selection, target specifications, packaging, destination-market documentation and shipment planning. These details are essential because chemical names alone do not define a commercially suitable product.</p><h2>Continuing the discussion</h2><p>Buyers who met our team—or who are now evaluating a related material—can send the full product name, grade, specification, required documents, quantity, packing and destination. Our export team will review the request against the current supply scope.</p><p class="ep-note"><strong>Archive note:</strong> This event has concluded. Dates and booth information are retained as a factual record of Bespring Chemical's exhibition participation.</p></div><aside class="article-sidebar"><h2>Request product information</h2><p>Send the product, grade, target specification, quantity, packing and destination.</p><a href="../contact.html">Contact export sales →</a><a href="../products.html">Browse product portfolios →</a><a href="../news.html">Back to news →</a></aside></div></article></main>${footer}</body></html>`;
}

const newsPath = path.join(root, "news.html");
let news = await readFile(newsPath, "utf8");
const start = news.indexOf('<section class="ep-section"><div class="container"><div class="ep-section-head"><div><p class="ep-eyebrow">Exhibitions archive');
const end = news.indexOf('<section class="ep-cta">', start);
if (start < 0 || end < 0) throw new Error("Exhibition section markers were not found in news.html");
news = `${news.slice(0, start)}${carousel}${news.slice(end)}`;
const archiveSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Bespring Chemical international exhibition archive",
  numberOfItems: events.length,
  itemListElement: events.map((event, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${site}/news/${event.slug}.html`,
    name: event.title
  }))
};
news = news.replace("</head>", `<script type="application/ld+json">${JSON.stringify(archiveSchema)}</script></head>`);
news = news.replace("</body>", `${carouselScript}</body>`);
await writeFile(newsPath, news, "utf8");
for (const event of events) {
  await writeFile(path.join(root, "news", `${event.slug}.html`), eventPage(event), "utf8");
}
console.log(`Built exhibition carousel and ${events.length} exhibition detail pages.`);

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = "https://www.bespringchem.com";

const mirroredPages = [
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
];

const topbar = [
  ["China-based chemical products supplier", "Proveedor chino de productos quimicos"],
  ["China-based chemical ingredients supplier", "Proveedor chino de ingredientes quimicos"],
  ["China-based chemical and ingredient supplier", "Proveedor chino de quimicos e ingredientes"],
  ["China-based supplier of  chemical products ", "Proveedor chino de productos quimicos "],
  ["Exporting to 60+ Countries", "Exportando a mas de 60 paises"],
  ["Exporting to 60+ countries", "Exportando a mas de 60 paises"],
  ['aria-label="Language selector"', 'aria-label="Selector de idioma"'],
  ['aria-label="Language selection"', 'aria-label="Seleccion de idioma"'],
  ['aria-label="Language"', 'aria-label="Idioma"'],
  [">WhatsApp<", ">WhatsApp<"]
];

const navFooter = [
  [">Home<", ">Inicio<"],
  [">About Us<", ">Nosotros<"],
  [">Products<", ">Productos<"],
  [">Services<", ">Servicios<"],
  [">News<", ">Noticias<"],
  [">Contact<", ">Contacto<"],
  [">Contact Us<", ">Contáctenos<"],
  [">Quick Links<", ">Enlaces Rapidos<"],
  [">Get in Touch<", ">Contáctenos<"],
  [">View all products<", ">Ver todos los productos<"],
  [">Continue browsing<", ">Seguir explorando<"],
  [">Browse Products<", ">Ver productos<"],
  [">Explore Products<", ">Explorar productos<"],
  [">Explore Our Products ", ">Explorar nuestros productos "],
  [">Contact Our Team<", ">Contactar a nuestro equipo<"],
  [">Contact Our Export Team<", ">Contactar a nuestro equipo de exportacion<"],
  [">Contact export sales<", ">Contactar ventas de exportacion<"],
  [">Contact us<", ">Contáctenos<"],
  [">Contact Sales Team<", ">Contactar al equipo de ventas<"],
  [">Request a Quote<", ">Solicitar cotizacion<"],
  [">Request Current Documents ", ">Solicitar documentos vigentes "],
  [">Request a Document Package<", ">Solicitar paquete documental<"],
  [">Read guide ", ">Leer guia "],
  [">Read Full Guide →<", ">Leer guia completa →<"],
  [">Learn More →<", ">Mas informacion →<"],
  [">Read application case ", ">Ver caso de aplicacion "],
  [">View product ", ">Ver producto "],
  [">View food ingredients ", ">Ver ingredientes alimentarios "],
  [">View feed additives ", ">Ver aditivos para piensos "],
  [">View industrial products ", ">Ver productos industriales "],
  [">Browse materials ", ">Ver materiales "]
];

const pageReplacements = {
  "index.html": [
    ["<title>Bespring Chemical | Global Supplier of Food Ingredients, Feed Additives & Industrial Chemicals</title>", "<title>Bespring Chemical | Proveedor global de ingredientes alimentarios, aditivos para piensos y quimicos industriales</title>"],
    ['<meta name="description" content="Bespring Chemical is a China-based supplier of phosphates, food ingredients, feed additives and industrial chemicals, serving buyers in 60+ countries.">', '<meta name="description" content="Bespring Chemical es un proveedor chino de fosfatos, ingredientes alimentarios, aditivos para piensos y quimicos industriales que atiende a compradores en mas de 60 paises.">'],
    ["Phosphate Manufacturer & Global Chemical Supplier from China", "Fabricante de fosfatos y proveedor global de quimicos desde China"],
    ["Learn About Us", "Conozcanos"],
    ["Food Ingredients, Feed Additives & Industrial Chemical Solutions", "Soluciones para ingredientes alimentarios, aditivos para piensos y quimicos industriales"],
    ["Explore Products", "Explorar productos"],
    ["Reliable Manufacturing, Global Supply Chain, Long-Term Partnership", "Fabricacion confiable, cadena de suministro global y cooperacion a largo plazo"],
    ["Chemical Products", "Productos quimicos"],
    ["Ingredients That Work in Your Application", "Ingredientes que funcionan en su aplicacion"],
    ["Application Cases", "Casos de aplicacion"],
    ["News &amp; Buyer Guides", "Noticias y guias para compradores"],
    ["Specification-led sourcing guidance for food, feed and industrial chemical procurement.", "Orientacion de compra basada en especificaciones para ingredientes alimentarios, piensos y quimicos industriales."],
    ["View all buyer guides and company news →", "Ver todas las guias y noticias de la empresa →"],
    ["Contact Global Sales Team →", "Contactar al equipo global de ventas →"],
    ["Contact Sales", "Contactar ventas"],
    ["Export inquiry support", "Soporte para consultas de exportacion"]
  ],
  "products.html": [
    ["<title>Chemical Ingredients Supplier | Bespring Chemical</title>", "<title>Proveedor de ingredientes quimicos | Bespring Chemical</title>"],
    ["Browse Bespring Chemical's food ingredients, feed additives, cleaning, water treatment, mining and fertilizer raw-material portfolios.", "Explore los portafolios de ingredientes alimentarios, aditivos para piensos, limpieza, tratamiento de agua, mineria y materias primas para fertilizantes de Bespring Chemical."],
    ["B2B chemical product portfolio", "Portafolio B2B de productos quimicos"],
    ["Chemical Ingredients &amp; Raw Materials", "Ingredientes quimicos y materias primas"],
    ["Browse product portfolios", "Explorar portafolios"],
    ["Prepare an inquiry", "Preparar una consulta"],
    ["Start with four qualification points", "Comience con cuatro puntos de validacion"],
    ["Portfolio scope", "Alcance del portafolio"],
    ["A product directory built for industrial buyers", "Un catalogo de productos pensado para compradores industriales"],
    ["Browse by product portfolio", "Explorar por portafolio de productos"],
    ["Find the material you need", "Encuentre el material que necesita"],
    ["Detailed product dossiers", "Fichas tecnicas detalladas"],
    ["Technical pages for priority materials", "Paginas tecnicas para materiales prioritarios"],
    ["Procurement guidance", "Guia de compra"],
    ["What to include in a useful RFQ", "Que incluir en una RFQ util"],
    ["Buyer documentation", "Documentacion para compradores"],
    ["Documents to align before approval", "Documentos a alinear antes de la aprobacion"],
    ["Specification-led sourcing", "Abastecimiento basado en especificaciones"],
    ["Request a product and supply review", "Solicite una revision del producto y del suministro"],
    ["Send your requirements", "Enviar requisitos"]
  ],
  "services.html": [
    ["<title>Chemical Export & Procurement Support Services | Bespring</title>", "<title>Servicios de exportacion y apoyo de compras quimicas | Bespring</title>"],
    ["Specification review, supplier coordination, documentation, packaging, warehousing and export logistics support for food, feed and industrial chemical buyers.", "Revision de especificaciones, coordinacion con proveedores, documentacion, empaque, almacenaje y logistica de exportacion para compradores de ingredientes alimentarios, piensos y quimicos industriales."],
    ["Procurement support beyond supply", "Soporte de compras mas alla del suministro"],
    ["Chemical Export &amp; Procurement Support Services", "Servicios de exportacion quimica y apoyo de compras"],
    ["Review services", "Ver servicios"],
    ["Discuss an inquiry", "Consultar un proyecto"],
    ["Service scope", "Alcance del servicio"],
    ["Support designed around a real chemical purchase", "Apoyo disenado para una compra quimica real"],
    ["Core services", "Servicios principales"],
    ["From RFQ to export shipment", "De la RFQ al embarque de exportacion"],
    ["Working process", "Proceso de trabajo"],
    ["A clearer qualification path", "Una ruta de validacion mas clara"],
    ["Prepare your request", "Prepare su solicitud"],
    ["Information that helps us respond accurately", "Informacion que nos ayuda a responder con precision"],
    ["Start with the specification", "Empiece por la especificacion"],
    ["Discuss your sourcing requirement", "Converse sobre su necesidad de compra"]
  ],
  "news.html": [
    ["<title>Chemical Industry Insights & Company News | Bespring</title>", "<title>Perspectivas de la industria quimica y noticias de la empresa | Bespring</title>"],
    ["Read procurement guides, chemical product comparisons, export documentation insights and company exhibition updates from Bespring Chemical.", "Lea guias de compra, comparaciones de productos quimicos, notas sobre documentacion de exportacion y novedades de exposiciones de Bespring Chemical."],
    ["News &amp; Insights", "Noticias y perspectivas"],
    ["Procurement knowledge &amp; company updates", "Conocimiento de compras y novedades de la empresa"],
    ["Chemical Industry Insights &amp; News", "Perspectivas y noticias de la industria quimica"],
    ["Latest insights", "Ultimas perspectivas"],
    ["Guides for chemical buyers", "Guias para compradores quimicos"],
    ["Read guide ", "Leer guia "],
    ["Exhibitions archive", "Archivo de exposiciones"],
    ["Meetings with international buyers", "Encuentros con compradores internacionales"],
    ["Company update", "Actualizacion de la empresa"],
    ["Have a product question?", "Tiene una pregunta sobre un producto?"],
    ["Ask our export team", "Consulte a nuestro equipo de exportacion"]
  ],
  "contact.html": [
    ["<title>Contact Bespring Chemical | Product Quotes & Export Support</title>", "<title>Contacte con Bespring Chemical | Cotizaciones y soporte de exportacion</title>"],
    ["Contact Bespring Chemical in China for food ingredients, feed additives, phosphates and industrial chemical quotes, samples, documents and export support.", "Contacte con Bespring Chemical en China para cotizaciones, muestras, documentos y soporte de exportacion de ingredientes alimentarios, aditivos para piensos, fosfatos y quimicos industriales."],
    ["Global sales &amp; export support", "Ventas globales y soporte de exportacion"],
    ["Let's discuss your ingredient or chemical requirements", "Conversemos sobre sus necesidades de ingredientes o quimicos"],
    ["Request a Quote", "Solicitar cotizacion"],
    ["Chat on WhatsApp", "Hablar por WhatsApp"],
    ["Food, feed &amp; industrial grades", "Grados alimentarios, para piensos e industriales"],
    ["Worldwide export support", "Soporte global de exportacion"],
    ["Technical documents available", "Documentos tecnicos disponibles"],
    ["Choose the easiest way to reach us", "Elija la forma mas facil de contactarnos"],
    ["Talk to our sales team", "Hable con nuestro equipo comercial"],
    ["General inquiries", "Consultas generales"],
    ["Quick conversation", "Conversacion rapida"]
  ],
  "about/company-profile.html": [
    ["<title>About Bespring Chemical | Ingredient & Chemical Supplier</title>", "<title>Sobre Bespring Chemical | Proveedor de ingredientes y quimicos</title>"],
    ["Company Profile", "Perfil de la empresa"],
    ["About Bespring Chemical", "Sobre Bespring Chemical"],
    ["A reliable link between production and global buyers", "Un vinculo confiable entre la produccion y los compradores globales"],
    ["What we supply", "Que suministramos"],
    ["Ingredients and chemicals for essential industries", "Ingredientes y quimicos para industrias esenciales"],
    ["Work with Bespring", "Trabaje con Bespring"],
    ["Looking for a dependable ingredient or chemical supply partner?", "Busca un socio confiable para ingredientes o quimicos?"]
  ],
  "about/production-bases.html": [
    ["<title>Production Bases in China | Bespring Chemical</title>", "<title>Bases de produccion en China | Bespring Chemical</title>"],
    ["Production Bases", "Bases de produccion"],
    ["Production Bases &amp; Manufacturing Network in China", "Bases de produccion y red de fabricacion en China"],
    ["Browse Products", "Ver productos"],
    ["A coordinated supply network—not a one-site model", "Una red de suministro coordinada, no un modelo de una sola planta"],
    ["Cooperative bases across China", "Bases cooperativas en toda China"],
    ["A connected operational workflow", "Un flujo operativo conectado"],
    ["View Certifications", "Ver certificaciones"],
    ["Tell us what your production supply chain needs", "Cuentenos que necesita su cadena de suministro de produccion"]
  ],
  "about/global-markets.html": [
    ["<title>Global Markets & Chemical Exports | Bespring Chemical</title>", "<title>Mercados globales y exportacion quimica | Bespring Chemical</title>"],
    ["Global Markets", "Mercados globales"],
    ["Ingredient &amp; Chemical Exports to 60+ Countries", "Exportacion de ingredientes y quimicos a mas de 60 paises"],
    ["Request an Export Quote", "Solicitar cotizacion de exportacion"],
    ["China-based supply with a global customer focus", "Suministro desde China con enfoque global al cliente"],
    ["Established markets across four key regions", "Mercados consolidados en cuatro regiones clave"],
    ["A portfolio built around customer applications", "Un portafolio construido alrededor de las aplicaciones del cliente"],
    ["From China’s supply network to international delivery", "De la red de suministro china a la entrega internacional"],
    ["A clear path from inquiry to export", "Una ruta clara desde la consulta hasta la exportacion"],
    ["Looking for a reliable export supplier from China?", "Busca un proveedor de exportacion confiable desde China?"]
  ],
  "about/certifications.html": [
    ["<title>Quality Certifications &amp; Compliance | Bespring Chemical</title>", "<title>Certificaciones de calidad y cumplimiento | Bespring Chemical</title>"],
    ["Certifications", "Certificaciones"],
    ["Certifications and Compliance Documents", "Certificaciones y documentos de cumplimiento"],
    ["Clear scope matters as much as the certificate", "El alcance claro importa tanto como el certificado"],
    ["Verify before qualification", "Verifique antes de aprobar"],
    ["Certification and membership records", "Registros de certificacion y membresia"],
    ["Build the right document package for your order", "Prepare el paquete documental adecuado para su pedido"],
    ["Five checks before approving a certificate", "Cinco comprobaciones antes de aprobar un certificado"],
    ["Certification &amp; document FAQ", "Preguntas frecuentes sobre certificaciones y documentos"],
    ["Request the documents for your exact product and market", "Solicite los documentos para su producto y mercado exactos"]
  ],
  "about/core-values.html": [
    ["<title>Core Values: Quality, Integrity &amp; Partnership | Bespring</title>", "<title>Valores centrales: calidad, integridad y cooperacion | Bespring</title>"],
    ["Core Values", "Valores centrales"],
    ["The Principles Behind How We Work", "Los principios detras de nuestra forma de trabajar"],
    ["Standards for everyday decisions—not wall slogans", "Estandares para decisiones diarias, no solo frases en la pared"],
    ["What our values mean in business", "Que significan nuestros valores en los negocios"],
    ["How these principles shape an order", "Como estos principios influyen en un pedido"],
    ["Explore Our Services", "Explorar nuestros servicios"],
    ["Four questions that keep our values practical", "Cuatro preguntas que mantienen nuestros valores practicos"],
    ["Experience shaped by decades in the chemical industry", "Experiencia formada durante decadas en la industria quimica"],
    ["Looking for a supplier that communicates clearly?", "Busca un proveedor que se comunique con claridad?"]
  ],
  "products/food-ingredients.html": [
    ["<title>Food Ingredients &amp; Additives Supplier | Bespring</title>", "<title>Proveedor de ingredientes y aditivos alimentarios | Bespring</title>"],
    ["Food-grade product portfolio", "Portafolio de productos grado alimentario"],
    ["Food Ingredients &amp; Food Additives", "Ingredientes alimentarios y aditivos"],
    ["Portfolio scope", "Alcance del portafolio"],
    ["A specification-led food ingredient portfolio", "Un portafolio de ingredientes alimentarios guiado por especificaciones"],
    ["Product directory", "Catalogo de productos"],
    ["Food Ingredients products", "Productos de ingredientes alimentarios"],
    ["Detailed product dossiers", "Fichas tecnicas detalladas"],
    ["Review key food-grade materials in depth", "Revise en detalle materiales alimentarios clave"]
  ],
  "products/animal-nutrition.html": [
    ["<title>Feed Additives Supplier | Bespring Chemical</title>", "<title>Proveedor de aditivos para piensos | Bespring Chemical</title>"],
    ["Feed-grade product portfolio", "Portafolio de productos grado pienso"],
    ["Feed Additives &amp; Animal Nutrition Ingredients", "Aditivos para piensos e ingredientes de nutricion animal"],
    ["Animal Nutrition", "Nutricion animal"],
    ["Feed materials organized for buyer review", "Materiales para piensos organizados para la revision del comprador"]
  ],
  "products/home-care-industrial-cleaning.html": [
    ["<title>Cleaning Chemicals Supplier | Bespring Chemical</title>", "<title>Proveedor de quimicos de limpieza | Bespring Chemical</title>"],
    ["Cleaning raw-material portfolio", "Portafolio de materias primas para limpieza"],
    ["Homecare &amp; Industrial Cleaning Chemicals", "Quimicos para cuidado del hogar y limpieza industrial"],
    ["Cleaning chemicals grouped by material family", "Quimicos de limpieza agrupados por familia de materiales"]
  ],
  "products/water-treatment.html": [
    ["<title>Water Treatment Chemicals Supplier | Bespring</title>", "<title>Proveedor de quimicos para tratamiento de agua | Bespring</title>"],
    ["Water-process chemical portfolio", "Portafolio de quimicos para procesos de agua"],
    ["Water Treatment Chemicals", "Quimicos para tratamiento de agua"],
    ["Core chemistries for water-treatment procurement", "Quimicas clave para la compra de tratamiento de agua"]
  ],
  "products/mining.html": [
    ["<title>Mining Chemicals Supplier | Bespring Chemical</title>", "<title>Proveedor de quimicos para mineria | Bespring Chemical</title>"],
    ["Mineral-process chemical portfolio", "Portafolio de quimicos para procesos minerales"],
    ["Mining &amp; Mineral Processing Chemicals", "Quimicos para mineria y procesamiento mineral"],
    ["Mining chemicals grouped by process stage", "Quimicos mineros agrupados por etapa de proceso"]
  ],
  "products/agricultural-fertilizers.html": [
    ["<title>Fertilizer Raw Materials Supplier | Bespring</title>", "<title>Proveedor de materias primas para fertilizantes | Bespring</title>"],
    ["Fertilizer product portfolio", "Portafolio de productos para fertilizantes"],
    ["Phosphate Fertilizers &amp; Fertilizer Salts", "Fertilizantes fosfatados y sales fertilizantes"],
    ["A focused phosphate fertilizer portfolio", "Un portafolio enfocado en fertilizantes fosfatados"]
  ]
};

function applyPairs(html, pairs) {
  let output = html;
  for (const [from, to] of pairs) {
    output = output.split(from).join(to);
  }
  return output;
}

function pageUrl(file) {
  return file === "index.html" ? "es/" : `es/${file}`;
}

function englishUrl(file) {
  return file === "index.html" ? "" : file;
}

function ensureSpanishAlternates(html, file) {
  const esUrl = `${site}/${pageUrl(file)}`;
  let output = html
    .replace(/<html lang="en">/i, '<html lang="es">')
    .replace(/<meta property="og:locale" content="en_US">/i, '<meta property="og:locale" content="es_ES">')
    .replace(/"inLanguage":"en"/g, '"inLanguage":"es"')
    .replace(/"inLanguage": "en"/g, '"inLanguage": "es"');

  const canonicalSources = file === "index.html" ? [`${site}/`, `${site}`] : [`${site}/${file}`];
  for (const sourceUrl of canonicalSources) {
    output = output
      .replace(
        new RegExp(`<link rel="canonical" href="${escapeRegex(sourceUrl)}">`, "i"),
        `<link rel="canonical" href="${esUrl}">`
      )
      .replace(
        new RegExp(`<meta property="og:url" content="${escapeRegex(sourceUrl)}">`, "i"),
        `<meta property="og:url" content="${esUrl}">`
      );
  }

  if (!output.includes('hreflang="es"')) {
    output = output.replace(
      /(<link rel="alternate"[^>]+hreflang="zh-TW"[^>]*>\s*)/i,
      `$1<link rel="alternate" hreflang="es" href="${esUrl}">\n`
    );
  }

  return output;
}

function adjustAssets(html) {
  return html
    .replace(/(["'(=])((?:\.\.\/)*)(images\/|css\/|js\/|webfonts\/)/g, '$1../$2$3');
}

function rerouteLeafLinks(html) {
  return html
    .replace(/href="products\/food-ingredients\//g, 'href="../products/food-ingredients/')
    .replace(/href="applications\//g, 'href="../applications/')
    .replace(/href="news\//g, 'href="../news/')
    .replace(/href="Solutions\//g, 'href="../Solutions/')
    .replace(/href="food-ingredients\//g, 'href="../../products/food-ingredients/');
}

function buildLanguageBlock(file) {
  const depth = file.split("/").length - 1;
  const prefix = "../".repeat(depth);
  const current = file.split("/").pop();
  if (file.startsWith("about/")) {
    return `<div class="bs-seo-language" aria-label="Language selection">
          <a href="${prefix}../about/${current}" lang="en">EN</a>
          <a href="${prefix}../zh-cn/about/${current}" lang="zh-CN">简</a>
          <a href="${prefix}../zh-tw/about/${current}" lang="zh-TW">繁</a>
          <a href="${current}" lang="es" class="active" aria-current="page">ES</a>
        </div>`;
  }
  if (file.startsWith("products/")) {
    return `<div class="bs-seo-language" aria-label="Language selection">
          <a href="${prefix}../products/${current}" lang="en">EN</a>
          <a href="${prefix}../zh-cn/products/${current}" lang="zh-CN">简</a>
          <a href="${prefix}../zh-tw/products/${current}" lang="zh-TW">繁</a>
          <a href="${current}" lang="es" class="active" aria-current="page">ES</a>
        </div>`;
  }
  return `<div class="bs-seo-language" aria-label="Language selection">
          <a href="${prefix}../${current}" lang="en">EN</a>
          <a href="${prefix}../zh-cn/${current}" lang="zh-CN">简</a>
          <a href="${prefix}../zh-tw/${current}" lang="zh-TW">繁</a>
          <a href="${current}" lang="es" class="active" aria-current="page">ES</a>
        </div>`;
}

function replaceLanguageBlock(html, file) {
  return html.replace(/<div class="bs-seo-language"[\s\S]*?<\/div>/i, buildLanguageBlock(file));
}

function localizeSpanish(html, file) {
  let output = html;
  output = ensureSpanishAlternates(output, file);
  output = adjustAssets(output);
  output = rerouteLeafLinks(output);
  output = replaceLanguageBlock(output, file);
  output = applyPairs(output, topbar);
  output = applyPairs(output, navFooter);
  output = applyPairs(output, pageReplacements[file] || []);
  return output;
}

function updateEnglishAlternates(html, file) {
  const esUrl = `${site}/${pageUrl(file)}`;
  let output = html;
  if (!output.includes('hreflang="es"')) {
    output = output.replace(
      /(<link rel="alternate"[^>]+hreflang="zh-TW"[^>]*>\s*)/i,
      `$1<link rel="alternate" hreflang="es" href="${esUrl}">\n`
    );
  }
  return output;
}

function buildEnglishEsLink(file) {
  const depth = file.split("/").length - 1;
  const prefix = "../".repeat(depth);
  const current = file.split("/").pop();
  if (file.startsWith("about/")) {
    return `<a href="${prefix}../es/about/${current}" lang="es">ES</a>`;
  }
  if (file.startsWith("products/")) {
    return `<a href="${prefix}../es/products/${current}" lang="es">ES</a>`;
  }
  return `<a href="${prefix}es/${current}" lang="es">ES</a>`;
}

function addEnglishLanguageLink(html, file) {
  if (html.includes(">ES<")) return html;
  return html.replace(
    /(<a [^>]+zh-TW[^>]*>[^<]*<\/a>\s*)(<\/div>)/i,
    `$1${buildEnglishEsLink(file)}\n        $2`
  );
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function ensureDir(file) {
  await mkdir(path.dirname(file), { recursive: true });
}

for (const file of mirroredPages) {
  const src = path.join(root, file);
  const dest = path.join(root, "es", file);
  const original = await readFile(src, "utf8");
  const spanish = localizeSpanish(original, file);
  await ensureDir(dest);
  await writeFile(dest, spanish, "utf8");

  const updatedEnglish = addEnglishLanguageLink(updateEnglishAlternates(original, file), file);
  if (updatedEnglish !== original) {
    await writeFile(src, updatedEnglish, "utf8");
  }
}

console.log(`Spanish mirror pages generated: ${mirroredPages.length}`);

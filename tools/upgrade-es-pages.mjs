import { mkdir, readFile, writeFile, access, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = "https://www.bespringchem.com";

const locales = [
  { dir: "", hreflang: "en", label: "EN" },
  { dir: "zh-cn", hreflang: "zh-CN", label: "简" },
  { dir: "zh-tw", hreflang: "zh-TW", label: "繁" },
  { dir: "es", hreflang: "es", label: "ES" },
  { dir: "pt", hreflang: "pt", label: "PT" },
  { dir: "ru", hreflang: "ru", label: "RU" },
  { dir: "de", hreflang: "de", label: "DE" },
  { dir: "ar", hreflang: "ar", label: "AR" }
];

const localeDirs = new Set(locales.filter((item) => item.dir).map((item) => item.dir));
const ignoredFiles = new Set(["products/food-ingredients1 - 拷贝.html"]);

const exactMirrorPages = new Set([
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
]);

const solutionFallbacks = new Map([
  ["Solutions/food-industry-solutions.html", "products/food-ingredients.html"],
  ["Solutions/animal-nutrition-solutions.html", "products/animal-nutrition.html"],
  ["Solutions/water-treatment-solutions.html", "products/water-treatment.html"],
  ["Solutions/industrial-cleaning-solutions.html", "products/home-care-industrial-cleaning.html"],
  ["Solutions/mining-solutions.html", "products/mining.html"],
  ["Solutions/agriculture-solutions.html", "products/agricultural-fertilizers.html"]
]);

const literalReplacements = [
  ["China-based chemical products supplier", "Proveedor chino de productos quimicos"],
  ["China-based chemical ingredients supplier", "Proveedor chino de ingredientes quimicos"],
  ["China-based supplier of chemical products", "Proveedor chino de productos quimicos"],
  ["China-based supplier of  chemical products ", "Proveedor chino de productos quimicos "],
  ["China-based supplier of food, feed and industrial chemical raw materials for global B2B procurement.", "Proveedor chino de materias primas quimicas para alimentos, piensos e industria para compras B2B globales."],
  ["Exporting to 60+ Countries", "Exportando a mas de 60 paises"],
  ["Exporting to 60+ countries", "Exportando a mas de 60 paises"],
  ["Home", "Inicio"],
  ["About Us", "Nosotros"],
  ["Products", "Productos"],
  ["Services", "Servicios"],
  ["News &amp; Insights", "Noticias y perspectivas"],
  ["News", "Noticias"],
  ["Contact Us", "Contacto"],
  ["Quick Links", "Enlaces rapidos"],
  ["Get in Touch", "Contactenos"],
  ["Contact export sales", "Contactar ventas de exportacion"],
  ["Browse product portfolios", "Explorar portafolios de productos"],
  ["Request a quote", "Solicitar cotizacion"],
  ["Request a Quote", "Solicitar cotizacion"],
  ["Ask on WhatsApp", "Consultar por WhatsApp"],
  ["Ask our export team", "Consulte a nuestro equipo de exportacion"],
  ["Read buyer guide", "Leer guia de compra"],
  ["View event details", "Ver detalles del evento"],
  ["Procurement guide", "Guia de compra"],
  ["Exhibition archive", "Archivo de exposiciones"],
  ["Application case", "Caso de aplicacion"],
  ["Application Cases", "Casos de aplicacion"],
  ["Industry Applications", "Aplicaciones industriales"],
  ["Reviewed by Bespring Chemical export team", "Revisado por el equipo de exportacion de Bespring Chemical"],
  ["Guide", "Guia"],
  ["Chemical Industry Insights & Company News | Bespring", "Perspectivas de la industria quimica y noticias de la empresa | Bespring"],
  ["Food Grade STPP for Meat Processing | Application Case", "STPP grado alimentario para procesamiento carnico | Caso de aplicacion"],
  ["Food Grade STPP for Meat Processing", "STPP grado alimentario para procesamiento carnico"],
  ["Food Ingredient &amp; Processing Solutions | Bespring Chemical", "Soluciones para ingredientes y procesos alimentarios | Bespring Chemical"],
  ["Food Ingredient Solutions for Processing &amp; Formulation", "Soluciones de ingredientes alimentarios para proceso y formulacion"],
  ["Food processing solutions", "Soluciones para procesamiento de alimentos"],
  ["Discuss Your Application", "Comentar su aplicacion"],
  ["Browse Food Ingredients", "Ver ingredientes alimentarios"],
  ["Food ingredient overview", "Panorama de ingredientes alimentarios"],
  ["What Food Ingredient Solutions Does Bespring Support?", "Que soluciones de ingredientes alimentarios ofrece Bespring?"],
  ["Where ingredients perform", "Donde rinden los ingredientes"],
  ["Solutions for the Foods You Manufacture", "Soluciones para los alimentos que fabrica"],
  ["Request a product and supply review", "Solicite una revision del producto y del suministro"],
  ["Send your requirements", "Enviar sus requisitos"],
  ["Choose the easiest way to reach us", "Elija la forma mas sencilla de contactarnos"],
  ["Talk to our sales team", "Hable con nuestro equipo comercial"],
  ["General inquiries", "Consultas generales"],
  ["Quick conversation", "Conversacion rapida"],
  ["Tell us what you need", "Diganos que necesita"],
  ["Request a product quote", "Solicitar cotizacion de producto"],
  ["Business email", "Correo empresarial"],
  ["Product or application", "Producto o aplicacion"],
  ["Destination country / port", "Pais / puerto de destino"],
  ["Requirements", "Requisitos"],
  ["Send Quote Request", "Enviar solicitud de cotizacion"],
  ["Sales office", "Oficina comercial"],
  ["Sales manager", "Gerente comercial"],
  ["Prepare a product inquiry", "Prepare una consulta de producto"],
  ["Include the full chemical name, grade, target specification, quantity, packing, destination and required documents.", "Incluya el nombre quimico completo, grado, especificacion objetivo, cantidad, embalaje, destino y documentos requeridos."],
  ["Prepare an inquiry", "Prepare una consulta"],
  ["View STPP specification", "Ver especificacion de STPP"],
  ["Quick answer", "Respuesta rapida"],
  ["On this page", "En esta pagina"],
  ["Overview", "Resumen"],
  ["Functions", "Funciones"],
  ["Applications", "Aplicaciones"],
  ["Specification", "Especificacion"],
  ["Packing", "Embalaje"],
  ["Quote", "Cotizacion"],
  ["Product overview", "Resumen del producto"],
  ["Product specification and purchasing information for", "Especificacion del producto e informacion comercial para"],
  ["Procurement snapshot", "Resumen de compra"],
  ["Continue browsing", "Seguir explorando"],
  ["Related product portfolios", "Portafolios relacionados"],
  ["Specification-led inquiry", "Consulta basada en especificaciones"],
  ["Request a product and supply review", "Solicite una revision de producto y suministro"],
  ["Technical and purchasing information", "Informacion tecnica y comercial"],
  ["Technical and purchasing information for", "Informacion tecnica y comercial para"],
  ["Food Grade", "Grado alimentario"],
  ["Documentation", "Documentacion"],
  ["Flexible Supply", "Suministro flexible"],
  ["Controlled quality specifications", "Especificaciones de calidad controladas"],
  ["COA, TDS and SDS support", "Soporte de COA, TDS y SDS"],
  ["Single and blended ingredients", "Ingredientes individuales y mezclas"],
  ["International export experience", "Experiencia exportadora internacional"],
  ["Procurement knowledge &amp; company updates", "Conocimiento de compras y novedades de la empresa"],
  ["Latest insights", "Ultimas perspectivas"],
  ["Guides for chemical buyers", "Guias para compradores quimicos"],
  ["Have a product question?", "Tiene una pregunta sobre un producto?"],
  ["Practical product comparisons, supplier-qualification guidance, export documentation notes and verified updates from Bespring Chemical.", "Comparativas practicas de productos, orientacion para calificar proveedores, notas de documentacion de exportacion y novedades verificadas de Bespring Chemical."],
  ["Browse Bespring Chemical's international exhibition record and open each event page for dates, location, booth and portfolio focus.", "Consulte el historial internacional de exposiciones de Bespring Chemical y abra cada pagina para ver fechas, lugar, stand y enfoque del portafolio."],
  ["Send the product, grade, specification and destination. We will respond with the information needed for a meaningful supply review.", "Envie el producto, grado, especificacion y destino. Responderemos con la informacion necesaria para una revision comercial util."],
  ["Show previous buyer guide", "Mostrar guia anterior"],
  ["Show next buyer guide", "Mostrar guia siguiente"],
  ["Show previous exhibition", "Mostrar exposicion anterior"],
  ["Show next exhibition", "Mostrar exposicion siguiente"],
  ["Open navigation menu", "Abrir menu de navegacion"],
  ["Close navigation menu", "Cerrar menu de navegacion"],
  ["Toggle Navigation Menu", "Alternar menu de navegacion"],
  ["Main navigation", "Navegacion principal"],
  ["Main Navigation", "Navegacion principal"]
];

const pageSpecificReplacements = {
  "news/stpp-vs-shmp-selection-guide.html": [
    ["STPP vs SHMP: Buyer Comparison Guide | Bespring Chemical", "STPP vs SHMP: guia comparativa para compradores | Bespring Chemical"],
    ["STPP vs SHMP: How Industrial Buyers Should Compare the Two Phosphates", "STPP vs SHMP: como deben comparar estos dos fosfatos los compradores industriales"],
    ["Compare STPP and SHMP by chemical identity, function, grade, specification, physical form and supplier-qualification requirements.", "Compare STPP y SHMP por identidad quimica, funcion, grado, especificacion, forma fisica y requisitos de calificacion del proveedor."],
    ["What is the core difference?", "Cual es la diferencia principal?"],
    ["Qualification points buyers should compare", "Puntos de calificacion que deben comparar los compradores"],
    ["Grade and governing specification", "Grado y especificacion aplicable"],
    ["Critical analytical limits", "Limites analiticos criticos"],
    ["Physical form and handling", "Forma fisica y manipulacion"],
    ["What to include in an RFQ", "Que incluir en una RFQ"],
    ["Prepare a product inquiry", "Prepare una consulta de producto"],
    ["Include the full chemical name, grade, target specification, quantity, packing, destination and required documents.", "Incluya el nombre quimico completo, grado, especificacion objetivo, cantidad, embalaje, destino y documentos requeridos."]
  ],
  "applications/food-grade-stpp-meat-processing.html": [
    ["See how food grade STPP supports moisture management, texture and emulsion stability in meat processing. Includes selection, validation and sourcing guidance.", "Vea como el STPP grado alimentario ayuda al manejo de humedad, la textura y la estabilidad de la emulsion en el procesamiento carnico. Incluye orientacion de seleccion, validacion y compra."],
    ["A practical application brief for evaluating food grade sodium tripolyphosphate in processed meat and poultry formulations.", "Una ficha practica para evaluar tripolifosfato de sodio grado alimentario en formulaciones de carne y aves procesadas."],
    ["Functions, process considerations, validation steps and sourcing guidance for food grade STPP in meat processing.", "Funciones, consideraciones de proceso, pasos de validacion y guia de compra para STPP grado alimentario en procesamiento carnico."],
    ["Meat &amp; Poultry Processing", "Procesamiento de carne y aves"],
    ["How sodium tripolyphosphate can support moisture management, texture consistency and emulsion stability", "Como el tripolifosfato de sodio puede apoyar el manejo de humedad, la consistencia de textura y la estabilidad de la emulsion"],
    ["Why is STPP used in meat processing?", "Por que se usa STPP en procesamiento carnico?"],
    ["Case context", "Contexto del caso"],
    ["Functional role", "Funcion en el proceso"],
    ["Evaluation plan", "Plan de evaluacion"],
    ["Quality &amp; sourcing", "Calidad y abastecimiento"]
  ],
  "Solutions/food-industry-solutions.html": [
    ["Food ingredient solutions for texture, stability, preservation, fortification and processing across bakery, dairy, beverage, meat and prepared foods.", "Soluciones de ingredientes alimentarios para textura, estabilidad, conservacion, fortificacion y proceso en panaderia, lacteos, bebidas, carnes y alimentos preparados."],
    ["Food Processing Ingredient Solutions | Bespring Chemical", "Soluciones de ingredientes para procesamiento de alimentos | Bespring Chemical"],
    ["Match food processing challenges with functional ingredient solutions for texture, water retention, shelf life and formulation stability.", "Relacione los retos del procesamiento de alimentos con soluciones funcionales para textura, retencion de agua, vida util y estabilidad de formulacion."],
    ["Functional ingredient systems for food formulation, processing and nutrition targets.", "Sistemas funcionales de ingredientes para formulacion, proceso y objetivos nutricionales."],
    ["Food ingredient and processing solutions", "Soluciones de ingredientes y procesos alimentarios"]
  ]
};

const titleOverrides = {
  "products/food-ingredients/sodium-tripolyphosphate-stpp.html": "Proveedor de STPP grado alimentario | Tripolifosfato de sodio",
  "products/food-ingredients/sodium-hexametaphosphate-shmp.html": "Proveedor de SHMP grado alimentario | Hexametafosfato de sodio",
  "products/food-ingredients/tetrapotassium-pyrophosphate-tkpp.html": "Proveedor de TKPP grado alimentario | INS 450(v)",
  "products/food-ingredients/calcium-propionate.html": "Proveedor de propionato de calcio grado alimentario | E282",
  "products/food-ingredients/citric-acid.html": "Proveedor de acido citrico grado alimentario | E330",
  "products/food-ingredients/dicalcium-phosphate-dcp.html": "Proveedor de fosfato dicalcico grado alimentario | DCP E341(ii)",
  "products/food-ingredients/monocalcium-phosphate-mcp.html": "Proveedor de fosfato monoccalcico grado alimentario | MCP E341(i)",
  "products/food-ingredients/sodium-aluminum-phosphate-salp.html": "Proveedor de SALP grado alimentario | Fosfato acido de sodio y aluminio",
  "products/food-ingredients/sodium-carboxymethyl-cellulose-cmc.html": "Proveedor de CMC grado alimentario | Carboximetilcelulosa sodica",
  "news/stpp-vs-shmp-selection-guide.html": "STPP vs SHMP: guia comparativa para compradores | Bespring Chemical",
  "news/mcp-vs-dcp-feed-phosphate-guide.html": "MCP vs DCP para piensos: guia de calificacion para compradores | Bespring Chemical",
  "news/chemical-export-document-checklist.html": "Checklist de documentos de importacion quimica para compradores B2B internacionales | Bespring Chemical",
  "news/food-grade-vs-technical-grade-phosphates.html": "Fosfatos grado alimentario vs tecnico: que deben verificar los compradores | Bespring Chemical",
  "news/how-to-qualify-chemical-supplier-china.html": "Como calificar un proveedor quimico en China: checklist practico para compradores | Bespring Chemical",
  "news/global-ingredients-show-russia-2025.html": "Global Ingredients Show 2025 en Moscu | Bespring Chemical",
  "news/global-ingredients-show-russia-2024.html": "Global Ingredients Show 2024 en Moscu | Bespring Chemical",
  "news/fi-vietnam-2024.html": "Fi Vietnam 2024 | Bespring Chemical",
  "news/fi-europe-frankfurt-2023.html": "Fi Europe 2023 en Frankfurt | Bespring Chemical",
  "news/vietfood-beverage-2023.html": "Vietfood & Beverage 2023 | Bespring Chemical",
  "applications/food-grade-stpp-meat-processing.html": "STPP grado alimentario para procesamiento carnico | Caso de aplicacion",
  "applications/calcium-propionate-packaged-bread.html": "Propionato de calcio para pan envasado | Caso de aplicacion",
  "applications/mcp-phosphorus-source-poultry-feed.html": "MCP como fuente de fosforo en alimento avicola | Caso de aplicacion",
  "applications/shmp-industrial-process-water.html": "SHMP en agua de proceso industrial | Caso de aplicacion",
  "applications/stpp-builder-powder-detergents.html": "STPP como builder en detergentes en polvo | Caso de aplicacion",
  "applications/tkpp-frozen-seafood-processing.html": "TKPP para procesamiento de mariscos congelados | Caso de aplicacion",
  "Solutions/food-industry-solutions.html": "Soluciones para ingredientes y procesos alimentarios | Bespring Chemical",
  "Solutions/animal-nutrition-solutions.html": "Soluciones para nutricion animal y piensos | Bespring Chemical",
  "Solutions/water-treatment-solutions.html": "Soluciones para tratamiento de agua | Bespring Chemical",
  "Solutions/industrial-cleaning-solutions.html": "Soluciones para limpieza industrial y del hogar | Bespring Chemical",
  "Solutions/mining-solutions.html": "Soluciones quimicas para mineria | Bespring Chemical",
  "Solutions/agriculture-solutions.html": "Soluciones para fertilizantes y agricultura | Bespring Chemical"
};

const descriptionOverrides = {
  "products/food-ingredients/sodium-tripolyphosphate-stpp.html": "Tripolifosfato de sodio grado alimentario (STPP/INS 451(i)) para carnes, mariscos y lacteos. Revise especificaciones, embalaje y carga de contenedor.",
  "products/food-ingredients/sodium-hexametaphosphate-shmp.html": "Hexametafosfato de sodio grado alimentario para aplicaciones de alimentos y bebidas. Revise identidad, especificacion, envase y documentacion de compra.",
  "products/food-ingredients/tetrapotassium-pyrophosphate-tkpp.html": "TKPP grado alimentario para mariscos, carnes y aplicaciones de proceso. Revise especificacion, formato y requisitos de cotizacion.",
  "products/food-ingredients/calcium-propionate.html": "Propionato de calcio grado alimentario para panaderia y control de vida util. Revise especificacion, embalaje y orientacion comercial.",
  "products/food-ingredients/citric-acid.html": "Acido citrico grado alimentario para acidulacion, sabor y formulacion de bebidas o alimentos. Revise especificacion y detalles de compra.",
  "products/food-ingredients/dicalcium-phosphate-dcp.html": "Fosfato dicalcico grado alimentario para fortificacion y formulacion alimentaria. Revise especificacion, embalaje y soporte documental.",
  "products/food-ingredients/monocalcium-phosphate-mcp.html": "Fosfato monoccalcico grado alimentario para leudado y fortificacion. Revise especificaciones, embalaje y datos para cotizacion.",
  "products/food-ingredients/sodium-aluminum-phosphate-salp.html": "SALP grado alimentario para sistemas de panificacion y formulacion. Revise especificacion, empaque y documentacion disponible.",
  "products/food-ingredients/sodium-carboxymethyl-cellulose-cmc.html": "CMC grado alimentario para control de textura, suspension y estabilidad. Revise especificacion, embalaje y soporte comercial.",
  "news/stpp-vs-shmp-selection-guide.html": "Compare STPP y SHMP por identidad quimica, funcion, grado, especificacion, forma fisica y requisitos de calificacion del proveedor.",
  "applications/food-grade-stpp-meat-processing.html": "Vea como el STPP grado alimentario ayuda al manejo de humedad, la textura y la estabilidad de la emulsion en el procesamiento carnico."
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

function normalizePath(value) {
  return value.replace(/\\/g, "/");
}

function pageUrl(dir, file) {
  return dir ? `${dir}/${file}` : file;
}

function buildTargetUrl(dir, file) {
  return `${site}/${file === "index.html" ? `${dir}/` : pageUrl(dir, file)}`.replace(/\/{2,}/g, "/").replace("https:/", "https://");
}

function ensureHtmlLang(html) {
  if (/<html[^>]*lang=/i.test(html)) {
    return html.replace(/<html([^>]*?)lang="[^"]*"/i, '<html$1lang="es"');
  }
  return html.replace(/<html(.*?)>/i, '<html$1 lang="es">');
}

function adjustSharedAssetPathsForClone(html) {
  return html
    .replace(/(["'(=])((?:\.\.\/)*)(images\/|css\/|js\/|webfonts\/)/g, '$1../$2$3')
    .replace(/url\((['"]?)(\.\.\/)*(images\/)/g, "url($1../$2$3");
}

function fixRootLocalizedLinks(html, file) {
  if (file !== "index.html" && !exactMirrorPages.has(file)) {
    return html;
  }
  return html
    .replace(/href="\.\.\/news\//g, 'href="news/')
    .replace(/href="\.\.\/applications\//g, 'href="applications/')
    .replace(/href="\.\.\/Solutions\//g, 'href="Solutions/')
    .replace(/href="\.\.\/products\/food-ingredients\//g, 'href="products/food-ingredients/');
}

function fallbackForLocale(file, localeDir) {
  if (!localeDir) {
    return relativeHref(file, "");
  }
  if (exactMirrorPages.has(file)) {
    return relativeHref(file, localeDir);
  }
  if (file.startsWith("products/food-ingredients/")) {
    return relativeHref("products/food-ingredients.html", localeDir);
  }
  if (file.startsWith("Solutions/")) {
    return relativeHref(solutionFallbacks.get(file) || "products.html", localeDir);
  }
  if (file.startsWith("news/")) {
    return relativeHref("news.html", localeDir);
  }
  if (file.startsWith("applications/")) {
    return relativeHref("index.html", localeDir);
  }
  return relativeHref("index.html", localeDir);
}

function relativeHref(targetFile, localeDir) {
  if (!localeDir) {
    return targetFile === "index.html" ? "../index.html" : `../${targetFile}`;
  }
  if (targetFile === "index.html") {
    return `../${localeDir}/index.html`;
  }
  return `../${localeDir}/${targetFile}`;
}

function buildLanguageBlock(file) {
  const links = locales.map((locale) => {
    const exactPath = locale.dir ? `${locale.dir}/${file}` : file;
    const href = locale.dir === "es"
      ? path.basename(file)
      : file === "index.html" && locale.dir
        ? "../" + locale.dir + "/index.html"
        : file.includes("/") || locale.dir
          ? null
          : null;
    return { locale, exactPath, href };
  }).map(({ locale, exactPath }) => {
    let href;
    if (locale.dir === "es") {
      href = path.basename(file);
    } else if (exactMirrorPages.has(file) && locale.dir) {
      href = relativeHref(file, locale.dir);
    } else if (locale.dir === "") {
      href = relativeHref(file, "");
    } else {
      href = fallbackForLocale(file, locale.dir);
    }
    const active = locale.dir === "es" ? ' class="active" aria-current="page"' : "";
    return `          <a href="${href}" lang="${locale.hreflang}"${active}>${locale.label}</a>`;
  }).join("\n");

  return `<div class="bs-seo-language" aria-label="Language selection">
${links}
        </div>`;
}

async function buildAlternateLinks(file) {
  const links = [];
  for (const locale of locales) {
    if (locale.dir === "es") {
      links.push(`<link rel="alternate" hreflang="es" href="${buildTargetUrl("es", file)}">`);
      continue;
    }
    const exactPath = locale.dir ? `${locale.dir}/${file}` : file;
    if (await exists(exactPath)) {
      links.push(`<link rel="alternate" hreflang="${locale.hreflang}" href="${buildTargetUrl(locale.dir, file)}">`);
    }
  }
  links.push(`<link rel="alternate" hreflang="x-default" href="${buildTargetUrl("", file)}">`);
  return links.join("\n  ");
}

function applyLiteralReplacements(html, pairs) {
  let out = html;
  for (const [from, to] of pairs) {
    out = out.split(from).join(to);
  }
  return out;
}

function applyPageSpecific(html, file) {
  const pairs = pageSpecificReplacements[file];
  return pairs ? applyLiteralReplacements(html, pairs) : html;
}

function applyTitleAndDescription(html, file) {
  let out = html;
  const title = titleOverrides[file];
  const description = descriptionOverrides[file];

  if (title) {
    out = out.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  }
  if (description) {
    out = out.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${description}">`);
  }

  return out;
}

function setCanonicalAndLocale(html, file) {
  const targetUrl = buildTargetUrl("es", file);
  return html
    .replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${targetUrl}">`)
    .replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${targetUrl}">`)
    .replace(/<meta property="og:locale" content="[^"]*">/i, '<meta property="og:locale" content="es_ES">')
    .replace(/<html([^>]*?)lang="[^"]*"/i, '<html$1lang="es"')
    .replace(/"inLanguage"\s*:\s*"en"/g, '"inLanguage":"es"')
    .replace(/"inLanguage"\s*:\s*"en_US"/g, '"inLanguage":"es"');
}

function localizeJsonLdAndUrls(html, file) {
  const englishUrl = buildTargetUrl("", file);
  const spanishUrl = buildTargetUrl("es", file);
  return html
    .split(englishUrl).join(spanishUrl)
    .replace(/"url"\s*:\s*"https:\/\/www\.bespringchem\.com\/"/g, '"url":"https://www.bespringchem.com/es/"')
    .replace(/"mainEntityOfPage"\s*:\s*"https:\/\/www\.bespringchem\.com\/([^"]+)"/g, `"mainEntityOfPage":"${spanishUrl}"`)
    .replace(/"mainEntityOfPage"\s*:\s*\{\s*"@id"\s*:\s*"https:\/\/www\.bespringchem\.com\/([^"]+)"\s*\}/g, `"mainEntityOfPage":{"@id":"${spanishUrl}#webpage"}`);
}

function cleanupEncodingArtifacts(html) {
  return html
    .replace(/Cont谩ctenos/g, "Contactenos")
    .replace(/Contactoe/g, "Contacte")
    .replace(/鈫\?/g, "&rarr;")
    .replace(/路/g, "-")
    .replace(/鈥檚/g, " del comprador")
    .replace(/鈥攁nd/g, " y")
    .replace(/鈥攏ot/g, ", no")
    .replace(/鈥?"/g, '"')
    .replace(/鈥?/g, "")
    .replace(/Contactoo/g, "Contacto")
    .replace(/ContactoPoint/g, "ContactPoint")
    .replace(/Miga de panList/g, "BreadcrumbList")
    .replace(/Informacion tecnica y comercial for/g, "Informacion tecnica y comercial para")
    .replace(/Contacto export sales/g, "Contactar ventas de exportacion")
    .replace(/Especificacions/g, "Specifications")
    .replace(/绠€/g, "简")
    .replace(/绻\?\/a>/g, '繁</a>')
    .replace(/aria-label="Language selector"/g, 'aria-label="Selector de idioma"')
    .replace(/aria-label="Language selection"/g, 'aria-label="Language selection"');
}

async function transformPage(file, targetExisted) {
  const sourceHtml = await readFile(path.join(root, targetExisted ? `es/${file}` : file), "utf8");
  let html = sourceHtml;

  if (!targetExisted) {
    html = adjustSharedAssetPathsForClone(html);
  }

  html = ensureHtmlLang(html);
  html = fixRootLocalizedLinks(html, file);
  html = setCanonicalAndLocale(html, file);
  html = localizeJsonLdAndUrls(html, file);
  html = applyTitleAndDescription(html, file);
  html = applyLiteralReplacements(html, literalReplacements);
  html = applyPageSpecific(html, file);
  html = cleanupEncodingArtifacts(html);

  const alternates = await buildAlternateLinks(file);
  html = html.replace(/<link rel="alternate"[\s\S]*?<meta property=/i, `${alternates}\n\n  <meta property=`);

  const languageBlock = buildLanguageBlock(file);
  html = html.replace(/<div class="bs-seo-language"[\s\S]*?<\/div>/i, languageBlock);

  return html;
}

async function listEnglishPages(dir = root, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const pages = [];
  for (const entry of entries) {
    const relative = normalizePath(path.join(prefix, entry.name));
    if (entry.isDirectory()) {
      if (localeDirs.has(entry.name) || entry.name === "tools" || entry.name.startsWith(".")) {
        continue;
      }
      pages.push(...await listEnglishPages(path.join(dir, entry.name), relative));
      continue;
    }
    if (!entry.name.endsWith(".html")) {
      continue;
    }
    if (ignoredFiles.has(relative)) {
      continue;
    }
    pages.push(relative);
  }
  return pages.sort();
}

async function main() {
  const englishPages = await listEnglishPages();
  let created = 0;
  let updated = 0;

  for (const file of englishPages) {
    const targetPath = path.join(root, "es", file);
    const alreadyExists = await exists(`es/${file}`);
    const html = await transformPage(file, alreadyExists);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, html, "utf8");
    if (alreadyExists) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.log(`ES pages upgraded: created ${created}, updated ${updated}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = "https://www.bespringchem.com";

const products = [
  {
    slug: "sodium-tripolyphosphate-stpp", name: "Tripolifosfato de sodio", short: "STPP",
    formula: "Na₅P₃O₁₀", cas: "7758-29-4", code: "INS 451(i)",
    desc: "STPP de grado alimentario para retención de agua, textura, emulsificación y secuestro de iones en formulaciones autorizadas.",
    functions: ["Retención de agua", "Apoyo a la textura", "Emulsificación", "Secuestro de iones"],
    uses: ["Productos cárnicos y avícolas", "Pescados y mariscos", "Sistemas lácteos", "Alimentos procesados"],
    options: "Polvo o granulado; el grado, la fase, la granulometría y los límites analíticos deben acordarse antes del pedido."
  },
  {
    slug: "sodium-hexametaphosphate-shmp", name: "Hexametafosfato de sodio", short: "SHMP",
    formula: "(NaPO₃)ₙ", cas: "10124-56-8", code: "INS 452(i)",
    desc: "SHMP de grado alimentario para secuestro de iones, regulación del pH y apoyo a la estabilidad y la textura.",
    functions: ["Secuestrante", "Regulador del pH", "Dispersante", "Apoyo a la estabilidad"],
    uses: ["Bebidas", "Productos lácteos", "Procesamiento de alimentos", "Sistemas acuosos autorizados"],
    options: "Confirme identidad comercial, CAS, grado, longitud media de cadena, insolubles y designación regulatoria del mercado."
  },
  {
    slug: "tetrapotassium-pyrophosphate-tkpp", name: "Pirofosfato tetrapotásico", short: "TKPP",
    formula: "K₄P₂O₇", cas: "7320-34-5", code: "INS 450(v)",
    desc: "TKPP de grado alimentario, altamente soluble y alcalino, para emulsificación, secuestro y control de procesos.",
    functions: ["Emulsionante", "Secuestrante", "Control de alcalinidad", "Apoyo a la textura"],
    uses: ["Productos del mar", "Carnes procesadas", "Fideos", "Sistemas lácteos y postres congelados"],
    options: "Material higroscópico. Confirme pureza, pH, forma física, embalaje resistente a la humedad y uso autorizado."
  },
  {
    slug: "sodium-aluminum-phosphate-salp", name: "Fosfato ácido de sodio y aluminio", short: "SALP",
    formula: "NaAl₃H₁₄(PO₄)₈·4H₂O", cas: "7785-88-8", code: "INS 541(i)",
    desc: "SALP ácido de grado alimentario como ácido leudante de acción lenta en sistemas con bicarbonato.",
    functions: ["Ácido leudante", "Liberación controlada de gas", "Ajuste de formulación", "Apoyo a la textura"],
    uses: ["Polvos de hornear", "Panadería", "Mezclas para pasteles", "Masas fritas"],
    options: "Confirme valor neutralizante, velocidad de reacción, granulometría, especificación alimentaria y requisitos de etiquetado."
  },
  {
    slug: "dicalcium-phosphate-dcp", name: "Fosfato dicálcico", short: "DCP",
    formula: "CaHPO₄ / CaHPO₄·2H₂O", cas: "7757-93-9 / 7789-77-7", code: "INS 341(ii)",
    desc: "DCP de grado alimentario como fuente de calcio y fósforo, regulador, acondicionador y componente de leudado.",
    functions: ["Fuente mineral", "Regulador", "Acondicionador de masa", "Componente de leudado"],
    uses: ["Fortificación de alimentos", "Panadería", "Mezclas secas", "Formulaciones alimentarias autorizadas"],
    options: "Indique forma anhidra o dihidrato. La composición, pérdida por secado y comportamiento de proceso no son equivalentes."
  },
  {
    slug: "monocalcium-phosphate-mcp", name: "Fosfato monocálcico", short: "MCP",
    formula: "Ca(H₂PO₄)₂ / Ca(H₂PO₄)₂·H₂O", cas: "7758-23-8", code: "INS 341(i)",
    desc: "MCP de grado alimentario para leudado, acondicionamiento de masas, fortificación y ajuste de formulaciones.",
    functions: ["Ácido leudante", "Fuente de calcio y fósforo", "Acondicionador", "Regulación de la acidez"],
    uses: ["Polvos de hornear", "Harinas y panadería", "Fortificación", "Mezclas de ingredientes"],
    options: "Indique forma anhidra o monohidrato, riqueza, pérdida por calentamiento, granulometría y velocidad de reacción."
  },
  {
    slug: "sodium-carboxymethyl-cellulose-cmc", name: "Carboximetilcelulosa sódica", short: "CMC",
    formula: "Polímero derivado de la celulosa", cas: "9004-32-4", code: "E466",
    desc: "CMC de grado alimentario para aumentar viscosidad, estabilizar textura y mantener partículas en suspensión.",
    functions: ["Espesante", "Estabilizante", "Agente de suspensión", "Retención de agua"],
    uses: ["Bebidas", "Lácteos y postres", "Salsas y rellenos", "Mezclas secas y productos reconstituidos"],
    options: "Defina pureza, grado de sustitución, viscosidad y método completo de ensayo, pH, humedad, malla y densidad aparente."
  },
  {
    slug: "calcium-propionate", name: "Propionato de calcio", short: "E282",
    formula: "C₆H₁₀CaO₄", cas: "4075-81-4", code: "INS 282 / E282",
    desc: "Conservante de grado alimentario utilizado para ayudar a controlar mohos y deterioro por bacterias filamentosas.",
    functions: ["Conservante", "Control de mohos", "Apoyo a la vida útil", "Protección de productos de panadería"],
    uses: ["Pan y panecillos", "Productos de panadería", "Premezclas secas", "Otras categorías autorizadas"],
    options: "Disponibles opciones estándar, FCC y mezcladas. Confirme norma, pureza, pH, humedad, aplicación y mercado."
  },
  {
    slug: "citric-acid", name: "Ácido cítrico", short: "E330",
    formula: "C₆H₈O₇ / C₆H₈O₇·H₂O", cas: "77-92-9 / 5949-29-1", code: "INS 330 / E330",
    desc: "Ácido cítrico de grado alimentario para regular acidez, aportar sabor ácido y apoyar la estabilidad de formulaciones.",
    functions: ["Acidulante", "Regulador de acidez", "Modificador del sabor", "Apoyo a la formulación"],
    uses: ["Bebidas", "Confitería", "Lácteos", "Conservas, condimentos y mezclas"],
    options: "Disponible anhidro o monohidrato. Confirme forma, norma, granulometría, pureza, embalaje y mercado de destino."
  }
];

const solutions = [
  { slug:"food-industry-solutions", title:"Soluciones de ingredientes para la industria alimentaria", desc:"Ingredientes funcionales para textura, estabilidad, conservación, fortificación y procesamiento de alimentos.", sectors:["Carnes y aves","Pescados y mariscos","Panadería","Lácteos y bebidas"], needs:["Retención de agua y textura","Control de acidez y leudado","Conservación y vida útil","Estabilización y suspensión"], products:[["STPP","../products/food-ingredients/sodium-tripolyphosphate-stpp.html"],["CMC","../products/food-ingredients/sodium-carboxymethyl-cellulose-cmc.html"],["Propionato de calcio","../products/food-ingredients/calcium-propionate.html"],["Ácido cítrico","../products/food-ingredients/citric-acid.html"]] },
  { slug:"animal-nutrition-solutions", title:"Soluciones para nutrición animal y piensos", desc:"Fuentes minerales y aditivos para formulación de piensos, premezclas y programas de nutrición animal.", sectors:["Avicultura","Porcino","Rumiantes","Acuicultura"], needs:["Aporte de calcio y fósforo","Control de especificaciones nutricionales","Forma física y mezclado","Documentación para piensos"], products:[["Fosfato monocálcico","../products/food-ingredients/monocalcium-phosphate-mcp.html"],["Fosfato dicálcico","../products/food-ingredients/dicalcium-phosphate-dcp.html"],["Gama de nutrición animal","../products/animal-nutrition.html"]] },
  { slug:"water-treatment-solutions", title:"Soluciones químicas para tratamiento de aguas", desc:"Productos químicos para coagulación, control de incrustaciones, acondicionamiento y programas de agua industrial.", sectors:["Agua industrial","Torres de refrigeración","Calderas y condensados","Aguas residuales"], needs:["Coagulación y clarificación","Control de incrustaciones","Acondicionamiento del agua","Control microbiano"], products:[["SHMP","../products/food-ingredients/sodium-hexametaphosphate-shmp.html"],["Productos para tratamiento de aguas","../products/water-treatment.html"]] },
  { slug:"industrial-cleaning-solutions", title:"Soluciones para limpieza doméstica e industrial", desc:"Materias primas para detergentes, limpiadores y sistemas de mantenimiento industrial.", sectors:["Detergentes en polvo","Limpiadores líquidos","Limpieza institucional","Mantenimiento industrial"], needs:["Ablandamiento del agua","Dispersión de suciedad","Alcalinidad y formulación","Tensioactividad y oxidación"], products:[["STPP","../products/food-ingredients/sodium-tripolyphosphate-stpp.html"],["CMC","../products/food-ingredients/sodium-carboxymethyl-cellulose-cmc.html"],["Gama de limpieza","../products/home-care-industrial-cleaning.html"]] },
  { slug:"mining-solutions", title:"Soluciones químicas para minería y minerales", desc:"Reactivos y materias primas para flotación, lixiviación, tratamiento de agua y procesamiento mineral.", sectors:["Flotación","Lixiviación","Agua de mina y proceso","Refinado"], needs:["Selección y separación","Control de pH","Gestión del agua","Manipulación y logística HSE"], products:[["Productos químicos para minería","../products/mining.html"],["Productos para tratamiento de aguas","../products/water-treatment.html"]] },
  { slug:"agriculture-solutions", title:"Soluciones para fertilizantes y agricultura", desc:"Sales fosfatadas y materias primas para fabricación de fertilizantes y suministro de nutrientes.", sectors:["Fertilizantes solubles","Mezclas NPK","Fertirrigación","Fabricación industrial"], needs:["Contenido nutricional declarado","Solubilidad e insolubles","Impurezas y metales","Granulometría y embalaje"], products:[["Materias primas para fertilizantes","../products/agricultural-fertilizers.html"],["Fosfato monocálcico","../products/food-ingredients/monocalcium-phosphate-mcp.html"],["Fosfato dicálcico","../products/food-ingredients/dicalcium-phosphate-dcp.html"]] }
];

const esc = (s) => s.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const json = (value) => JSON.stringify(value).replaceAll("<","\\u003c");

function chrome(prefix, active) {
  return `<div class="bs-seo-topbar"><div class="container bs-seo-topbar-container"><div class="bs-seo-topbar-left"><span class="bs-seo-highlight"><i class="fas fa-industry"></i> Proveedor chino de productos químicos</span><span class="bs-seo-divider">|</span><span><i class="fas fa-globe"></i> Exportamos a más de 60 países</span></div><div class="bs-seo-topbar-right"><a href="mailto:info@bespringchem.com">info@bespringchem.com</a><a href="tel:+8613914896109">+86 139 1489 6109</a></div></div></div><header class="site-header"><div class="container nav-container"><div class="logo"><a href="${prefix}index.html"><img src="${prefix}../images/logo.png" alt="Bespring Chemical"></a></div><nav class="main-nav" aria-label="Navegación principal"><ul><li><a href="${prefix}index.html">Inicio</a></li><li><a href="${prefix}about/company-profile.html">Nosotros</a></li><li><a href="${prefix}products.html"${active==="products"?' aria-current="page"':""}>Productos</a></li><li><a href="${prefix}services.html">Servicios</a></li><li><a href="${prefix}news.html">Noticias</a></li><li><a href="${prefix}contact.html" class="btn-nav">Contacto</a></li></ul></nav><button class="hamburger" aria-label="Abrir el menú de navegación" aria-expanded="false"><i class="fas fa-bars"></i></button></div></header>`;
}

function footer(prefix) {
  return `<footer class="crc-footer"><div class="container footer-grid"><div class="footer-col"><h3>Bespring Chemical</h3><p>Proveedor chino de ingredientes alimentarios, aditivos para piensos y productos químicos industriales.</p></div><div class="footer-col footer-links"><h3>Enlaces rápidos</h3><ul><li><a href="${prefix}products.html">Productos</a></li><li><a href="${prefix}services.html">Servicios</a></li><li><a href="${prefix}news.html">Noticias</a></li></ul></div><div class="footer-col"><h3>Contáctenos</h3><p><a href="tel:+8613914896109">+86 139 1489 6109</a></p><p><a href="mailto:info@bespringchem.com">info@bespringchem.com</a></p><a href="${prefix}contact.html" class="contact-btn-footer">Solicitar información</a></div></div><div class="footer-bottom">&copy; 2026 Bespring Chemical Co., Ltd. Todos los derechos reservados.</div></footer><script>const b=document.querySelector(".hamburger"),n=document.querySelector(".main-nav");b?.addEventListener("click",()=>{const o=n.classList.toggle("active");b.setAttribute("aria-expanded",String(o))});</script>`;
}

function head({title,desc,url,image,prefix,schema}) {
  return `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${url}"><link rel="alternate" hreflang="en" href="${url.replace("/es/","/")}"><link rel="alternate" hreflang="es" href="${url}"><link rel="alternate" hreflang="x-default" href="${url.replace("/es/","/")}"><meta property="og:type" content="website"><meta property="og:locale" content="es_ES"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${site}/images/${image}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><link rel="icon" href="${prefix}../images/favicon.ico"><link rel="stylesheet" href="${prefix}../css/style.css"><link rel="stylesheet" href="${prefix}../css/site-pages.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"><script type="application/ld+json">${json(schema)}</script></head>`;
}

function productPage(p) {
  const prefix="../../", url=`${site}/es/products/food-ingredients/${p.slug}.html`;
  const title=p.short.startsWith("E")
    ? `Proveedor de ${p.name} ${p.short} | Bespring`
    : `Proveedor de ${p.short} de grado alimentario | Bespring`;
  const faq=[
    [`¿Qué es ${p.short}?`,`${p.name} (${p.short}) es ${p.desc.charAt(0).toLowerCase()+p.desc.slice(1)}`],
    [`¿Qué datos necesita Bespring para cotizar ${p.short}?`,"Indique grado, especificación, forma física, cantidad, embalaje, aplicación, país de destino y documentos requeridos."],
    ["¿Qué documentos pueden solicitarse?","Según el origen ofrecido, pueden solicitarse especificación vigente, TDS, SDS, COA y certificados aplicables."]
  ];
  const schema={"@context":"https://schema.org","@graph":[{"@type":"Product",name:`${p.name} (${p.short})`,description:p.desc,sku:p.short,category:"Ingrediente químico de grado alimentario",url,brand:{"@type":"Brand",name:"Bespring Chemical"},additionalProperty:[{"@type":"PropertyValue",name:"Fórmula",value:p.formula},{"@type":"PropertyValue",name:"CAS",value:p.cas},{"@type":"PropertyValue",name:"Designación",value:p.code}]},{"@type":"FAQPage",mainEntity:faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}]};
  return `${head({title,desc:p.desc,url,image:"food-grade-stpp-sodium-tripolyphosphate-bespring.webp",prefix,schema})}<body class="editorial-page">${chrome(prefix,"products")}<main><article><header class="ep-hero" style="--ep-image:url('../../../images/food-additives.jpg')"><div class="container"><nav class="ep-breadcrumb"><ol><li><a href="../../index.html">Inicio</a></li><li><a href="../../products.html">Productos</a></li><li><a href="../food-ingredients.html">Ingredientes alimentarios</a></li><li aria-current="page">${p.short}</li></ol></nav><p class="ep-eyebrow">Ingrediente de grado alimentario</p><h1>${p.name} (${p.short})</h1><p class="ep-hero__lead">${p.desc}</p></div></header><div class="container article-layout"><div class="article-body"><p class="lead"><strong>${p.name}</strong> · Fórmula ${p.formula} · CAS ${p.cas} · ${p.code}</p><h2>Información del producto</h2><p>${p.options}</p><h2>Funciones principales</h2><ul>${p.functions.map(x=>`<li>${x}</li>`).join("")}</ul><h2>Aplicaciones habituales</h2><ul>${p.uses.map(x=>`<li>${x}</li>`).join("")}</ul><p>Las aplicaciones son orientativas. La dosis, la idoneidad técnica, el etiquetado y el uso legal deben validarse en la formulación y el mercado de destino.</p><h2>Especificación y control de calidad</h2><p>Antes de comprar, acuerde identidad, grado, método de ensayo, límites críticos, forma física y criterios de aceptación. La especificación contractual y el COA del lote rigen cada envío.</p><h2>Embalaje, almacenamiento y transporte</h2><p>Confirme tamaño y material del envase, revestimiento interior, paletización, etiquetado, condiciones de almacenamiento y clasificación de transporte para el producto ofrecido.</p><h2>Documentación para homologación</h2><p>Solicite especificación, TDS, SDS, formato de COA y certificados vigentes aplicables al producto, origen, planta y periodo del pedido.</p><h2>Preguntas frecuentes</h2>${faq.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div><aside class="article-sidebar"><h2>Solicitar cotización</h2><p>Incluya producto, grado, especificación, cantidad, embalaje y destino.</p><a href="../../contact.html">Enviar requisitos &rarr;</a><a href="../food-ingredients.html">Ver ingredientes alimentarios &rarr;</a></aside></div></article></main>${footer(prefix)}</body></html>`;
}

function solutionPage(s) {
  const prefix="../", url=`${site}/es/solutions/${s.slug}.html`;
  const shortTitle=s.title.replace(/^Soluciones (?:de |para )?/,"");
  const title=`${shortTitle.charAt(0).toUpperCase()+shortTitle.slice(1)} | Bespring`;
  const faq=[["¿Cómo seleccionar el producto adecuado?","Defina el proceso, función requerida, condiciones operativas, especificación, normativa y criterios de aceptación antes de evaluar opciones."],["¿Puede Bespring apoyar una prueba?","Podemos facilitar información y muestras cuando estén disponibles; la validación técnica corresponde al fabricante y a sus equipos cualificados."],["¿Qué incluir en la consulta?","Aplicación, problema técnico, producto o función, especificación, cantidad, embalaje, destino y documentos requeridos."]];
  const schema={"@context":"https://schema.org","@graph":[{"@type":"Service",name:s.title,description:s.desc,provider:{"@type":"Organization",name:"Bespring Chemical Co., Ltd."},areaServed:"Todo el mundo",url},{"@type":"FAQPage",mainEntity:faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}]};
  return `${head({title,desc:s.desc,url,image:"industries-og.jpg",prefix,schema})}<body class="editorial-page">${chrome(prefix,"")}<main><article><header class="ep-hero" style="--ep-image:url('../../images/industries-og.jpg')"><div class="container"><nav class="ep-breadcrumb"><ol><li><a href="../index.html">Inicio</a></li><li aria-current="page">Soluciones</li></ol></nav><p class="ep-eyebrow">Soluciones por sector</p><h1>${s.title}</h1><p class="ep-hero__lead">${s.desc}</p></div></header><div class="container article-layout"><div class="article-body"><p class="lead">Partimos del proceso y de la especificación necesaria para relacionar la función técnica con productos y documentación de compra.</p><h2>Sectores y procesos</h2><ul>${s.sectors.map(x=>`<li>${x}</li>`).join("")}</ul><h2>Necesidades que evaluamos</h2><ul>${s.needs.map(x=>`<li>${x}</li>`).join("")}</ul><h2>Cómo abordar la selección</h2><ol><li>Definir el problema, proceso y resultado esperado.</li><li>Confirmar identidad, grado, especificación y normativa.</li><li>Realizar pruebas en la formulación o sistema real.</li><li>Acordar documentos, embalaje, cantidad y logística.</li></ol><h2>Productos relacionados</h2><ul>${s.products.map(([n,h])=>`<li><a href="${h}">${n}</a></li>`).join("")}</ul><h2>Control de riesgos y cumplimiento</h2><p>La información no sustituye la evaluación de formulación, seguridad, HSE, regulación o ingeniería. Revise siempre la SDS vigente, la compatibilidad y los requisitos del mercado.</p><h2>Preguntas frecuentes</h2>${faq.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div><aside class="article-sidebar"><h2>Comentar su aplicación</h2><p>Envíe proceso, función requerida, especificación, volumen y destino.</p><a href="../contact.html">Contactar con el equipo &rarr;</a><a href="../products.html">Ver productos &rarr;</a></aside></div></article></main>${footer(prefix)}</body></html>`;
}

for (const p of products) {
  await writeFile(path.join(root,"es","products","food-ingredients",`${p.slug}.html`),productPage(p).replaceAll("food-additives.jpg","foodadditivesbanner.jpg"),"utf8");
  console.log(`Rebuilt es product page: ${p.slug}`);
}
for (const s of solutions) {
  await writeFile(path.join(root,"es","solutions",`${s.slug}.html`),solutionPage(s),"utf8");
  console.log(`Rebuilt es solution page: ${s.slug}`);
}

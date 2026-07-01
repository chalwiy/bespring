import { mkdir, readFile, writeFile, access, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = "https://www.bespringchem.com";
const forceSource = process.argv.includes("--force-source");

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
  ["China-based chemical products supplier", "Fornecedor chines de produtos quimicos"],
  ["China-based chemical ingredients supplier", "Fornecedor chines de ingredientes quimicos"],
  ["China-based supplier of chemical products", "Fornecedor chines de produtos quimicos"],
  ["China-based chemical and ingredient supplier", "Fornecedor chines de quimicos e ingredientes"],
  ["China-based supplier of food, feed and industrial chemical raw materials for global B2B procurement.", "Fornecedor chines de materias-primas quimicas para alimentos, racao e industria para compras B2B globais."],
  ["Exporting to 60+ Countries", "Exportando para mais de 60 paises"],
  ["Exporting to 60+ countries", "Exportando para mais de 60 paises"],
  ["Home", "Inicio"],
  ["About Us", "Sobre nos"],
  ["Products", "Produtos"],
  ["Services", "Servicos"],
  ["News &amp; Insights", "Noticias e insights"],
  ["News", "Noticias"],
  ["Contact Us", "Contato"],
  ["Quick Links", "Links rapidos"],
  ["Get in Touch", "Entre em contato"],
  ['class="btn-nav">Contact<', 'class="btn-nav">Contato<'],
  ["Read buyer guide", "Ler guia de compra"],
  ["View event details", "Ver detalhes do evento"],
  ["Procurement guide", "Guia de compras"],
  ["Exhibition archive", "Arquivo de exposicoes"],
  ["Application case", "Caso de aplicacao"],
  ["Application Cases", "Casos de aplicacao"],
  ["Industry Applications", "Aplicacoes industriais"],
  ["Reviewed by Bespring Chemical export team", "Revisado pela equipe de exportacao da Bespring Chemical"],
  ["Guide", "Guia"],
  ["Chemical Industry Insights & Company News | Bespring", "Insights do setor quimico e noticias da empresa | Bespring"],
  ["Food Ingredient &amp; Processing Solutions | Bespring Chemical", "Solucoes para ingredientes e processamento de alimentos | Bespring Chemical"],
  ["Food Ingredient Solutions for Processing &amp; Formulation", "Solucoes de ingredientes para processamento e formulacao"],
  ["Food processing solutions", "Solucoes para processamento de alimentos"],
  ["Discuss Your Application", "Discutir sua aplicacao"],
  ["Browse Food Ingredients", "Ver ingredientes alimentares"],
  ["Food ingredient overview", "Visao geral dos ingredientes alimentares"],
  ["What Food Ingredient Solutions Does Bespring Support?", "Quais solucoes de ingredientes alimentares a Bespring oferece?"],
  ["Where ingredients perform", "Onde os ingredientes atuam"],
  ["Solutions for the Foods You Manufacture", "Solucoes para os alimentos que voce fabrica"],
  ["Request a product and supply review", "Solicite uma revisao do produto e do fornecimento"],
  ["Send your requirements", "Enviar requisitos"],
  ["Choose the easiest way to reach us", "Escolha a forma mais facil de falar conosco"],
  ["Talk to our sales team", "Fale com nossa equipe comercial"],
  ["General inquiries", "Consultas gerais"],
  ["Quick conversation", "Conversa rapida"],
  ["Tell us what you need", "Conte o que voce precisa"],
  ["Request a product quote", "Solicitar cotacao de produto"],
  ["Business email", "Email comercial"],
  ["Product or application", "Produto ou aplicacao"],
  ["Destination country / port", "Pais / porto de destino"],
  ["Requirements", "Requisitos"],
  ["Send Quote Request", "Enviar solicitacao de cotacao"],
  ["Sales office", "Escritorio comercial"],
  ["Sales manager", "Gerente comercial"],
  ["Prepare a product inquiry", "Prepare uma consulta de produto"],
  ["Include the full chemical name, grade, target specification, quantity, packing, destination and required documents.", "Inclua o nome quimico completo, grau, especificacao desejada, quantidade, embalagem, destino e documentos exigidos."],
  ["Prepare an inquiry", "Prepare uma consulta"],
  ["Quick answer", "Resposta rapida"],
  ["On this page", "Nesta pagina"],
  ["Overview", "Visao geral"],
  ["Functions", "Funcoes"],
  ["Applications", "Aplicacoes"],
  ["Specification", "Especificacao"],
  ["Packing", "Embalagem"],
  ["Quote", "Cotacao"],
  ["Product overview", "Visao geral do produto"],
  ["Procurement snapshot", "Resumo de compras"],
  ["Continue browsing", "Continuar navegando"],
  ["Related product portfolios", "Portfolios de produtos relacionados"],
  ["Specification-led inquiry", "Consulta guiada por especificacao"],
  ["Technical and purchasing information", "Informacoes tecnicas e comerciais"],
  ["Technical and purchasing information for", "Informacoes tecnicas e comerciais para"],
  ["Product specification and purchasing information for", "Especificacao do produto e informacoes comerciais para"],
  ["Food Grade", "Grau alimenticio"],
  ["Documentation", "Documentacao"],
  ["Flexible Supply", "Fornecimento flexivel"],
  ["Controlled quality specifications", "Especificacoes de qualidade controladas"],
  ["COA, TDS and SDS support", "Suporte de COA, TDS e SDS"],
  ["Single and blended ingredients", "Ingredientes individuais e misturas"],
  ["International export experience", "Experiencia internacional de exportacao"],
  ["Procurement knowledge &amp; company updates", "Conhecimento de compras e atualizacoes da empresa"],
  ["Latest insights", "Ultimos insights"],
  ["Guides for chemical buyers", "Guias para compradores quimicos"],
  ["Have a product question?", "Tem uma duvida sobre um produto?"],
  ["Open navigation menu", "Abrir menu de navegacao"],
  ["Close navigation menu", "Fechar menu de navegacao"],
  ["Toggle Navigation Menu", "Alternar menu de navegacao"],
  ["Main navigation", "Navegacao principal"],
  ["Main Navigation", "Navegacao principal"]
];

const pageSpecificReplacements = {
  "news/stpp-vs-shmp-selection-guide.html": [
    ["STPP vs SHMP: Buyer Comparison Guide | Bespring Chemical", "STPP vs SHMP: guia comparativo para compradores | Bespring Chemical"],
    ["STPP vs SHMP: How Industrial Buyers Should Compare the Two Phosphates", "STPP vs SHMP: como compradores industriais devem comparar esses dois fosfatos"],
    ["Compare STPP and SHMP by chemical identity, function, grade, specification, physical form and supplier-qualification requirements.", "Compare STPP e SHMP por identidade quimica, funcao, grau, especificacao, forma fisica e requisitos de qualificacao do fornecedor."],
    ["What is the core difference?", "Qual e a diferenca principal?"],
    ["Qualification points buyers should compare", "Pontos de qualificacao que os compradores devem comparar"],
    ["Grade and governing specification", "Grau e especificacao aplicavel"],
    ["Critical analytical limits", "Limites analiticos criticos"],
    ["Physical form and handling", "Forma fisica e manuseio"],
    ["What to include in an RFQ", "O que incluir em uma RFQ"]
  ],
  "applications/food-grade-stpp-meat-processing.html": [
    ["Food Grade STPP for Meat Processing | Application Case", "STPP grau alimenticio para processamento de carnes | Caso de aplicacao"],
    ["Food Grade STPP for Meat Processing", "STPP grau alimenticio para processamento de carnes"],
    ["Meat &amp; Poultry Processing", "Processamento de carnes e aves"],
    ["Why is STPP used in meat processing?", "Por que o STPP e usado no processamento de carnes?"],
    ["Case context", "Contexto do caso"],
    ["Functional role", "Papel funcional"],
    ["Evaluation plan", "Plano de avaliacao"],
    ["Quality &amp; sourcing", "Qualidade e abastecimento"]
  ],
  "Solutions/food-industry-solutions.html": [
    ["Food ingredient solutions for texture, stability, preservation, fortification and processing across bakery, dairy, beverage, meat and prepared foods.", "Solucoes de ingredientes alimentares para textura, estabilidade, conservacao, fortificacao e processamento em panificacao, lacteos, bebidas, carnes e alimentos prontos."],
    ["Food Processing Ingredient Solutions | Bespring Chemical", "Solucoes de ingredientes para processamento de alimentos | Bespring Chemical"],
    ["Match food processing challenges with functional ingredient solutions for texture, water retention, shelf life and formulation stability.", "Relacione os desafios do processamento de alimentos com solucoes funcionais para textura, retencao de agua, vida util e estabilidade de formulacao."],
    ["Functional ingredient systems for food formulation, processing and nutrition targets.", "Sistemas funcionais de ingredientes para formulacao, processamento e objetivos nutricionais."]
  ]
};

const titleOverrides = {
  "products/food-ingredients/sodium-tripolyphosphate-stpp.html": "Fornecedor de STPP grau alimenticio | Tripolifosfato de sodio",
  "products/food-ingredients/sodium-hexametaphosphate-shmp.html": "Fornecedor de SHMP grau alimenticio | Hexametafosfato de sodio",
  "products/food-ingredients/tetrapotassium-pyrophosphate-tkpp.html": "Fornecedor de TKPP grau alimenticio | INS 450(v)",
  "products/food-ingredients/calcium-propionate.html": "Fornecedor de propionato de calcio grau alimenticio | E282",
  "products/food-ingredients/citric-acid.html": "Fornecedor de acido citrico grau alimenticio | E330",
  "products/food-ingredients/dicalcium-phosphate-dcp.html": "Fornecedor de fosfato dicalcico grau alimenticio | DCP E341(ii)",
  "products/food-ingredients/monocalcium-phosphate-mcp.html": "Fornecedor de fosfato monocálcico grau alimenticio | MCP E341(i)",
  "products/food-ingredients/sodium-aluminum-phosphate-salp.html": "Fornecedor de SALP grau alimenticio | Fosfato acido de sodio e aluminio",
  "products/food-ingredients/sodium-carboxymethyl-cellulose-cmc.html": "Fornecedor de CMC grau alimenticio | Carboximetilcelulose sodica",
  "news/stpp-vs-shmp-selection-guide.html": "STPP vs SHMP: guia comparativo para compradores | Bespring Chemical",
  "news/mcp-vs-dcp-feed-phosphate-guide.html": "MCP vs DCP para racao: guia de qualificacao para compradores | Bespring Chemical",
  "news/chemical-export-document-checklist.html": "Checklist de documentos para importacao quimica para compradores B2B internacionais | Bespring Chemical",
  "news/food-grade-vs-technical-grade-phosphates.html": "Fosfatos grau alimenticio vs tecnico: o que compradores devem verificar | Bespring Chemical",
  "news/how-to-qualify-chemical-supplier-china.html": "Como qualificar um fornecedor quimico na China: checklist pratico para compradores | Bespring Chemical",
  "news/global-ingredients-show-russia-2025.html": "Global Ingredients Show 2025 em Moscou | Bespring Chemical",
  "news/global-ingredients-show-russia-2024.html": "Global Ingredients Show 2024 em Moscou | Bespring Chemical",
  "news/fi-vietnam-2024.html": "Fi Vietnam 2024 | Bespring Chemical",
  "news/fi-europe-frankfurt-2023.html": "Fi Europe 2023 em Frankfurt | Bespring Chemical",
  "news/vietfood-beverage-2023.html": "Vietfood & Beverage 2023 | Bespring Chemical",
  "applications/food-grade-stpp-meat-processing.html": "STPP grau alimenticio para processamento de carnes | Caso de aplicacao",
  "applications/calcium-propionate-packaged-bread.html": "Propionato de calcio para pao embalado | Caso de aplicacao",
  "applications/mcp-phosphorus-source-poultry-feed.html": "MCP como fonte de fosforo em racao avicola | Caso de aplicacao",
  "applications/shmp-industrial-process-water.html": "SHMP em agua de processo industrial | Caso de aplicacao",
  "applications/stpp-builder-powder-detergents.html": "STPP como builder em detergentes em po | Caso de aplicacao",
  "applications/tkpp-frozen-seafood-processing.html": "TKPP para processamento de frutos do mar congelados | Caso de aplicacao",
  "Solutions/food-industry-solutions.html": "Solucoes para ingredientes e processamento de alimentos | Bespring Chemical",
  "Solutions/animal-nutrition-solutions.html": "Solucoes para nutricao animal e racao | Bespring Chemical",
  "Solutions/water-treatment-solutions.html": "Solucoes para tratamento de agua | Bespring Chemical",
  "Solutions/industrial-cleaning-solutions.html": "Solucoes para limpeza industrial e domestica | Bespring Chemical",
  "Solutions/mining-solutions.html": "Solucoes quimicas para mineracao | Bespring Chemical",
  "Solutions/agriculture-solutions.html": "Solucoes para fertilizantes e agricultura | Bespring Chemical"
};

const descriptionOverrides = {
  "products/food-ingredients/sodium-tripolyphosphate-stpp.html": "Tripolifosfato de sodio grau alimenticio (STPP/INS 451(i)) para carnes, frutos do mar e lacteos. Revise especificacoes, embalagem e carregamento de contenedor.",
  "products/food-ingredients/sodium-hexametaphosphate-shmp.html": "Hexametafosfato de sodio grau alimenticio para aplicacoes em alimentos e bebidas. Revise identidade, especificacao, embalagem e documentacao de compra.",
  "products/food-ingredients/tetrapotassium-pyrophosphate-tkpp.html": "TKPP grau alimenticio para frutos do mar, carnes e aplicacoes de processo. Revise especificacao, formato e requisitos de cotacao.",
  "products/food-ingredients/calcium-propionate.html": "Propionato de calcio grau alimenticio para panificacao e controle de vida util. Revise especificacao, embalagem e orientacao comercial.",
  "products/food-ingredients/citric-acid.html": "Acido citrico grau alimenticio para acidulacao, sabor e formulacao de alimentos ou bebidas. Revise especificacao e detalhes de compra.",
  "products/food-ingredients/dicalcium-phosphate-dcp.html": "Fosfato dicalcico grau alimenticio para fortificacao e formulacao alimentar. Revise especificacao, embalagem e suporte documental.",
  "products/food-ingredients/monocalcium-phosphate-mcp.html": "Fosfato monocalcico grau alimenticio para fermentacao e fortificacao. Revise especificacoes, embalagem e dados para cotacao.",
  "products/food-ingredients/sodium-aluminum-phosphate-salp.html": "SALP grau alimenticio para sistemas de panificacao e formulacao. Revise especificacao, embalagem e documentacao disponivel.",
  "products/food-ingredients/sodium-carboxymethyl-cellulose-cmc.html": "CMC grau alimenticio para controle de textura, suspensao e estabilidade. Revise especificacao, embalagem e suporte comercial.",
  "news/stpp-vs-shmp-selection-guide.html": "Compare STPP e SHMP por identidade quimica, funcao, grau, especificacao, forma fisica e requisitos de qualificacao do fornecedor.",
  "applications/food-grade-stpp-meat-processing.html": "Veja como o STPP grau alimenticio ajuda no controle de umidade, textura e estabilidade de emulsao no processamento de carnes."
};

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
    return html.replace(/<html([^>]*?)lang="[^"]*"/i, '<html$1lang="pt"');
  }
  return html.replace(/<html(.*?)>/i, '<html$1 lang="pt">');
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

function localeTarget(file, localeDir) {
  if (!localeDir) return file;
  if (exactMirrorPages.has(file)) return `${localeDir}/${file}`;
  if (file.startsWith("products/food-ingredients/")) return `${localeDir}/products/food-ingredients.html`;
  if (file.startsWith("solutions/")) {
    const fallback = solutionFallbacks.get(file) || solutionFallbacks.get(file.replace(/^solutions\//, "Solutions/")) || "products.html";
    return `${localeDir}/${fallback}`;
  }
  if (file.startsWith("news/")) return `${localeDir}/news.html`;
  if (file.startsWith("applications/")) return `${localeDir}/index.html`;
  return `${localeDir}/index.html`;
}

function relativeFromPortuguesePage(file, target) {
  return path.posix.relative(path.posix.dirname(`pt/${file}`), target) || path.posix.basename(target);
}

function buildLanguageBlock(file) {
  const links = locales.map((locale) => {
    const href = locale.dir === "pt"
      ? path.basename(file)
      : relativeFromPortuguesePage(file, localeTarget(file, locale.dir));
    const active = locale.dir === "pt" ? ' class="active" aria-current="page"' : "";
    return `          <a href="${href}" lang="${locale.hreflang}"${active}>${locale.label}</a>`;
  }).join("\n");
  return `<div class="bs-seo-language" aria-label="Language selection">\n${links}\n        </div>`;
}

async function buildAlternateLinks(file) {
  const links = [];
  for (const locale of locales) {
    if (locale.dir === "pt") {
      links.push(`<link rel="alternate" hreflang="pt" href="${buildTargetUrl("pt", file)}">`);
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
  if (titleOverrides[file]) {
    out = out.replace(/<title>[^<]*<\/title>/i, `<title>${titleOverrides[file]}</title>`);
    out = out.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${titleOverrides[file]}">`);
    out = out.replace(/<meta name="twitter:title" content="[^"]*">/i, `<meta name="twitter:title" content="${titleOverrides[file]}">`);
  }
  if (descriptionOverrides[file]) {
    out = out.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${descriptionOverrides[file]}">`);
    out = out.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${descriptionOverrides[file]}">`);
    out = out.replace(/<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="${descriptionOverrides[file]}">`);
  }
  return out;
}

function setCanonicalAndLocale(html, file) {
  const targetUrl = buildTargetUrl("pt", file);
  return html
    .replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${targetUrl}">`)
    .replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${targetUrl}">`)
    .replace(/<meta property="og:locale" content="[^"]*">/i, '<meta property="og:locale" content="pt_BR">')
    .replace(/"inLanguage"\s*:\s*"en"/g, '"inLanguage":"pt"')
    .replace(/<html([^>]*?)lang="[^"]*"/i, '<html$1lang="pt"');
}

function localizeJsonLdAndUrls(html, file) {
  if (file === "index.html") return html;
  const englishUrl = buildTargetUrl("", file);
  const portugueseUrl = buildTargetUrl("pt", file);
  return html.split(englishUrl).join(portugueseUrl);
}

function cleanupEncodingArtifacts(html) {
  return html
    .replace(/鈫\?/g, "&rarr;")
    .replace(/路/g, "-")
    .replace(/Informacoes tecnicas e comerciais for/g, "Informacoes tecnicas e comerciais para")
    .replace(/Contact export sales/g, "Contatar vendas de exportacao")
    .replace(/Browse product portfolios/g, "Ver portfolios de produtos")
    .replace(/绠€/g, "简")
    .replace(/绻\?\/a>/g, '繁</a>')
    .replace(/aria-label="Language selector"/g, 'aria-label="Seletor de idioma"')
    .replace(/Main navigation/g, "Navegacao principal")
    .replace(/Breadcrumb/g, "Breadcrumb");
}

async function transformPage(file, targetExisted) {
  const useExistingTarget = targetExisted && !forceSource;
  const sourceHtml = await readFile(path.join(root, useExistingTarget ? `pt/${file}` : file), "utf8");
  let html = sourceHtml;

  if (!useExistingTarget) {
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
      if (localeDirs.has(entry.name) || entry.name === "tools" || entry.name.startsWith(".")) continue;
      pages.push(...await listEnglishPages(path.join(dir, entry.name), relative));
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;
    if (ignoredFiles.has(relative)) continue;
    pages.push(relative);
  }
  return pages.sort();
}

async function main() {
  const englishPages = await listEnglishPages();
  let created = 0;
  let updated = 0;

  for (const file of englishPages) {
    const targetPath = path.join(root, "pt", file);
    const alreadyExists = await exists(`pt/${file}`);
    const html = await transformPage(file, alreadyExists);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, html, "utf8");
    if (alreadyExists) updated += 1;
    else created += 1;
  }

  console.log(`PT pages upgraded: created ${created}, updated ${updated}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

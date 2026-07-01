import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ptRoot = path.join(root, "pt");
const cachePath = path.join(root, "tools", ".pt-translation-cache.json");
const candidatePath = path.join(root, "tools", ".pt-translation-candidates.json");
const auditOnly = process.argv.includes("--audit");
const exportCandidates = process.argv.includes("--export-candidates");
const applyCache = process.argv.includes("--apply-cache");
const details = process.argv.includes("--details");
const filterArg = process.argv.find((item) => item.startsWith("--filter="));
const fileFilter = filterArg?.slice("--filter=".length) || "";

const englishMarker = /\b(?:the|and|or|with|from|for|supplier|manufacturer|chemical|chemicals|food|feed|water|processing|product|products|application|applications|quality|export|industry|industrial|grade|current|document|documents|buyer|buyers|supply|market|production|requirements|review|support|company|about|our|your|what|how|where|which|does|can|before|after|during|certificate|network|service|services|news|contact|request|read|learn|view|explore|solution|solutions|ingredient|ingredients|packaging|shipping|storage|testing|specification|specifications|available|international|global|home|profile|values|question|questions|quote|function|appearance|assay|minimum|maximum|published|location|event|page|information|overview|source|material|materials|meat|seafood|dairy|bread|cleaning|mining|agriculture|fertilizer)\b/i;

const schemaTypes = new Set([
  "Organization", "Corporation", "ImageObject", "PostalAddress", "ContactPoint",
  "AboutPage", "WebPage", "WebSite", "BreadcrumbList", "ListItem", "FAQPage",
  "Question", "Answer", "ItemList", "Article", "NewsArticle", "Product", "Offer",
  "Place", "Event", "Person", "Brand", "PropertyValue", "BusinessAudience",
  "CollectionPage", "Service"
]);

const jsonKeysToSkip = new Set([
  "@context", "@type", "@id", "url", "logo", "image", "email", "telephone",
  "addressCountry", "sameAs", "item", "contentUrl", "thumbnailUrl", "datePublished",
  "dateModified", "startDate", "endDate", "productID", "sku", "mpn", "gtin"
]);

const seoOverrides = {
  "index.html": {
    title: "Fornecedor de fosfatos e ingredientes químicos | Bespring Chemical",
    description: "Fornecedor chinês de fosfatos, ingredientes alimentícios, aditivos para alimentação animal e produtos químicos industriais, com exportação para mais de 60 países."
  },
  "contact.html": {
    title: "Solicite uma cotação de produtos químicos | Bespring Chemical",
    description: "Fale com a Bespring Chemical para solicitar cotação, amostras, especificações, certificados e apoio à exportação de ingredientes e produtos químicos."
  },
  "products.html": {
    title: "Ingredientes e matérias-primas químicas | Bespring Chemical",
    description: "Consulte nosso portfólio de ingredientes alimentícios, aditivos para alimentação animal e produtos químicos para limpeza, água, mineração e fertilizantes."
  },
  "services.html": {
    title: "Serviços de exportação e compras de produtos químicos | Bespring",
    description: "Apoio em especificações, documentos, embalagem, armazenagem e logística de exportação para compradores internacionais de produtos químicos."
  },
  "news.html": {
    title: "Guias de compras e notícias do setor químico | Bespring",
    description: "Guias técnicos para compradores, comparativos de produtos químicos, documentação de exportação e notícias de feiras da Bespring Chemical."
  },
  "about/company-profile.html": {
    title: "Sobre a Bespring Chemical | Fornecedor químico da China",
    description: "Conheça a Bespring Chemical, fornecedora chinesa de fosfatos, ingredientes alimentícios, aditivos para alimentação animal e produtos químicos industriais."
  },
  "products/food-ingredients.html": {
    title: "Fornecedor de ingredientes e aditivos alimentícios | Bespring",
    description: "Fosfatos, conservantes, acidulantes, hidrocoloides, proteínas, adoçantes e outros ingredientes de grau alimentício para compradores industriais."
  },
  "products/animal-nutrition.html": {
    title: "Aditivos e ingredientes para nutrição animal | Bespring",
    description: "Ingredientes e aditivos para alimentação animal, incluindo fosfatos, aminoácidos, acidificantes, conservantes e fontes minerais."
  },
  "products/home-care-industrial-cleaning.html": {
    title: "Produtos químicos para limpeza industrial e doméstica | Bespring",
    description: "Tensoativos, solventes, builders, ácidos, álcalis e outros insumos para formulações de limpeza industrial e doméstica."
  },
  "products/water-treatment.html": {
    title: "Fornecedor de produtos químicos para tratamento de água | Bespring",
    description: "Produtos químicos para tratamento de água industrial e municipal, com suporte de especificações, SDS, COA, embalagem e exportação."
  },
  "products/mining.html": {
    title: "Produtos químicos para mineração e processamento mineral | Bespring",
    description: "Reagentes e insumos químicos para flotação, lixiviação, tratamento de água de processo e operações de processamento mineral."
  },
  "products/agricultural-fertilizers.html": {
    title: "Matérias-primas para fertilizantes fosfatados | Bespring",
    description: "Fosfatos e sais de potássio para fabricação de fertilizantes, com informações de grau, análise de nutrientes, embalagem e exportação."
  },
  "solutions/food-industry-solutions.html": {
    title: "Soluções de ingredientes para a indústria de alimentos | Bespring",
    description: "Ingredientes funcionais para textura, retenção de água, emulsificação, acidez, conservação, fortificação e processamento de alimentos."
  },
  "solutions/animal-nutrition-solutions.html": {
    title: "Soluções de ingredientes para nutrição animal | Bespring",
    description: "Soluções com aminoácidos, minerais, ácidos, antioxidantes, conservantes e outros ingredientes para alimentação animal."
  },
  "solutions/industrial-cleaning-solutions.html": {
    title: "Soluções químicas para limpeza industrial e doméstica | Bespring",
    description: "Ingredientes químicos para lavanderia, superfícies, desengraxe e processos de limpeza industrial e doméstica."
  },
  "solutions/mining-solutions.html": {
    title: "Soluções químicas para mineração e processamento mineral | Bespring",
    description: "Soluções para flotação, lixiviação, tratamento de água, refino e outras etapas do processamento mineral."
  },
  "solutions/water-treatment-solutions.html": {
    title: "Soluções químicas para tratamento de água | Bespring",
    description: "Soluções para clarificação, controle microbiológico, incrustação, corrosão e tratamento de água industrial."
  },
  "solutions/agriculture-solutions.html": {
    title: "Soluções com fosfatos para fertilizantes e agricultura | Bespring",
    description: "Ingredientes fosfatados para fertirrigação, nutrição foliar, misturas de nutrientes e produção de fertilizantes."
  },
  "news/how-to-qualify-chemical-supplier-china.html": {
    title: "Como qualificar um fornecedor químico na China | Guia B2B"
  },
  "news/mcp-vs-dcp-feed-phosphate-guide.html": {
    title: "MCP vs DCP para alimentação animal | Guia de compras"
  },
  "news/stpp-vs-shmp-selection-guide.html": {
    title: "STPP vs SHMP: comparação para compradores industriais"
  },
  "news/food-grade-vs-technical-grade-phosphates.html": {
    title: "Fosfatos de grau alimentício vs. grau técnico | Guia"
  },
  "news/global-ingredients-show-russia-2024.html": {
    title: "Global Ingredients Show 2024 em Moscou | Bespring"
  },
  "news/global-ingredients-show-russia-2025.html": {
    title: "Global Ingredients Show 2025 em Moscou | Bespring"
  }
};

const literalPolish = [
  [/\bInicio\b/g, "Início"],
  [/\bSobre nos\b/gi, "Sobre nós"],
  [/\bServicos\b/g, "Serviços"],
  [/\bNoticias\b/g, "Notícias"],
  [/\bquimicos\b/gi, (value) => matchCase(value, "químicos")],
  [/\bquimico\b/gi, (value) => matchCase(value, "químico")],
  [/\bchines\b/gi, (value) => matchCase(value, "chinês")],
  [/\bpaises\b/gi, (value) => matchCase(value, "países")],
  [/\bmaterias-primas\b/gi, (value) => matchCase(value, "matérias-primas")],
  [/\bmateria-prima\b/gi, (value) => matchCase(value, "matéria-prima")],
  [/\binformacoes\b/gi, (value) => matchCase(value, "informações")],
  [/\binformacao\b/gi, (value) => matchCase(value, "informação")],
  [/\bespecificacoes\b/gi, (value) => matchCase(value, "especificações")],
  [/\bespecificacao\b/gi, (value) => matchCase(value, "especificação")],
  [/\baplicacoes\b/gi, (value) => matchCase(value, "aplicações")],
  [/\baplicacao\b/gi, (value) => matchCase(value, "aplicação")],
  [/\bsolucoes\b/gi, (value) => matchCase(value, "soluções")],
  [/\bsolucao\b/gi, (value) => matchCase(value, "solução")],
  [/\bfuncao\b/gi, (value) => matchCase(value, "função")],
  [/\bfuncoes\b/gi, (value) => matchCase(value, "funções")],
  [/\bavaliacao\b/gi, (value) => matchCase(value, "avaliação")],
  [/\bavaliacoes\b/gi, (value) => matchCase(value, "avaliações")],
  [/\bproducao\b/gi, (value) => matchCase(value, "produção")],
  [/\bformulacao\b/gi, (value) => matchCase(value, "formulação")],
  [/\bformulacoes\b/gi, (value) => matchCase(value, "formulações")],
  [/\bretencao\b/gi, (value) => matchCase(value, "retenção")],
  [/\bconcentracao\b/gi, (value) => matchCase(value, "concentração")],
  [/\bconcentracoes\b/gi, (value) => matchCase(value, "concentrações")],
  [/\bcondicoes\b/gi, (value) => matchCase(value, "condições")],
  [/\bcondicao\b/gi, (value) => matchCase(value, "condição")],
  [/\bregulatorio\b/gi, (value) => matchCase(value, "regulatório")],
  [/\bregulatorios\b/gi, (value) => matchCase(value, "regulatórios")],
  [/\bregulatoria\b/gi, (value) => matchCase(value, "regulatória")],
  [/\bregulatorias\b/gi, (value) => matchCase(value, "regulatórias")],
  [/\btecnico\b/gi, (value) => matchCase(value, "técnico")],
  [/\btecnicos\b/gi, (value) => matchCase(value, "técnicos")],
  [/\btecnica\b/gi, (value) => matchCase(value, "técnica")],
  [/\btecnicas\b/gi, (value) => matchCase(value, "técnicas")],
  [/\bcomercio\b/gi, (value) => matchCase(value, "comércio")],
  [/\bportfolio\b/gi, (value) => matchCase(value, "portfólio")],
  [/\bportfolios\b/gi, (value) => matchCase(value, "portfólios")],
  [/\bcotacao\b/gi, (value) => matchCase(value, "cotação")],
  [/\bcotacoes\b/gi, (value) => matchCase(value, "cotações")],
  [/\bnavegacao\b/gi, (value) => matchCase(value, "navegação")],
  [/\bselecao\b/gi, (value) => matchCase(value, "seleção")],
  [/\bqualificacao\b/gi, (value) => matchCase(value, "qualificação")],
  [/\bcertificacao\b/gi, (value) => matchCase(value, "certificação")],
  [/\bcertificacoes\b/gi, (value) => matchCase(value, "certificações")],
  [/\bdocumentacao\b/gi, (value) => matchCase(value, "documentação")],
  [/\bexportacao\b/gi, (value) => matchCase(value, "exportação")],
  [/\bimportacao\b/gi, (value) => matchCase(value, "importação")],
  [/\bembalagem\b/gi, (value) => matchCase(value, "embalagem")],
  [/\bpanificacao\b/gi, (value) => matchCase(value, "panificação")],
  [/\bacido\b/gi, (value) => matchCase(value, "ácido")],
  [/\bcitrico\b/gi, (value) => matchCase(value, "cítrico")],
  [/\bcalcio\b/gi, (value) => matchCase(value, "cálcio")],
  [/\bsodio\b/gi, (value) => matchCase(value, "sódio")],
  [/\bmonocalcico\b/gi, (value) => matchCase(value, "monocálcico")],
  [/\bdicalcico\b/gi, (value) => matchCase(value, "dicálcico")],
  [/\bfosforo\b/gi, (value) => matchCase(value, "fósforo")],
  [/\bpotassico\b/gi, (value) => matchCase(value, "potássico")],
  [/\balimenticio\b/gi, (value) => matchCase(value, "alimentício")],
  [/\bcarneo\b/gi, (value) => matchCase(value, "cárneo")],
  [/\bcarnico\b/gi, (value) => matchCase(value, "cárnico")],
  [/\blacteos\b/gi, (value) => matchCase(value, "lácteos")],
  [/\baves\b/gi, (value) => matchCase(value, "aves")],
  [/\bnao\b/gi, (value) => matchCase(value, "não")],
  [/\bsao\b/gi, (value) => matchCase(value, "são")],
  [/\bja\b/gi, (value) => matchCase(value, "já")],
  [/\bapos\b/gi, (value) => matchCase(value, "após")],
  [/\bmetodo\b/gi, (value) => matchCase(value, "método")],
  [/\bmetodos\b/gi, (value) => matchCase(value, "métodos")],
  [/\bparametros\b/gi, (value) => matchCase(value, "parâmetros")],
  [/\baparencia\b/gi, (value) => matchCase(value, "aparência")],
  [/\bconsistencia\b/gi, (value) => matchCase(value, "consistência")],
  [/\bexperiencia\b/gi, (value) => matchCase(value, "experiência")],
  [/\bconformidade\b/gi, (value) => matchCase(value, "conformidade")],
  [/\bdisponivel\b/gi, (value) => matchCase(value, "disponível")],
  [/\bdisponiveis\b/gi, (value) => matchCase(value, "disponíveis")],
  [/\bnumero\b/gi, (value) => matchCase(value, "número")],
  [/\bnumeros\b/gi, (value) => matchCase(value, "números")],
  [/\bminimo\b/gi, (value) => matchCase(value, "mínimo")],
  [/\bmaximo\b/gi, (value) => matchCase(value, "máximo")],
  [/\bpublicado em\b/gi, (value) => matchCase(value, "publicado em")],
  [/\bendereco\b/gi, (value) => matchCase(value, "endereço")],
  [/\bconteiner\b/gi, (value) => matchCase(value, "contêiner")],
  [/\bconteineres\b/gi, (value) => matchCase(value, "contêineres")],
  [/\bemail\b/gi, (value) => matchCase(value, "e-mail")],
  [/\bCopyright\b/g, "©"],
  [/\bAll rights reserved\.\b/gi, "Todos os direitos reservados."]
];

function matchCase(source, target) {
  if (source === source.toUpperCase()) return target.toUpperCase();
  if (source[0] === source[0].toUpperCase()) return target[0].toUpperCase() + target.slice(1);
  return target;
}

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

function shouldTranslate(value) {
  const text = value.trim();
  return Boolean(
    text &&
    englishMarker.test(text) &&
    !schemaTypes.has(text) &&
    !/^(?:https?:|mailto:|tel:|data:|#[\w-]+$|\+\d)/i.test(text) &&
    !/^[\w./-]+\.(?:html|css|js|jpg|jpeg|png|webp|svg|pdf)(?:[?#].*)?$/i.test(text) &&
    !/^(?:[A-Z]{1,6}|[A-Z][a-z]?\d*)$/.test(text) &&
    !/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2},?\s+(?:China|CN)$/.test(text)
  );
}

function collectHtmlCandidates(html) {
  const candidates = [];
  const masked = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  for (const match of masked.matchAll(/>([^<>]+)</g)) {
    const value = match[1].trim();
    if (shouldTranslate(value)) candidates.push(value);
  }
  for (const match of masked.matchAll(/\b(?:content|alt|aria-label|title|placeholder|value)="([^"]+)"/gi)) {
    const value = match[1].trim();
    if (shouldTranslate(value)) candidates.push(value);
  }
  return candidates;
}

function collectJsonCandidates(value, output, key = "") {
  if (typeof value === "string") {
    if (!jsonKeysToSkip.has(key) && shouldTranslate(value)) output.push(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectJsonCandidates(item, output, key));
  } else if (value && typeof value === "object") {
    for (const [childKey, childValue] of Object.entries(value)) {
      collectJsonCandidates(childValue, output, childKey);
    }
  }
}

function getAllCandidates(html) {
  const candidates = collectHtmlCandidates(html);
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      collectJsonCandidates(JSON.parse(match[1]), candidates);
    } catch {
      // Invalid JSON-LD is reported separately by the final audit.
    }
  }
  return [...new Set(candidates)];
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&rarr;/g, "→");
}

function restoreEntities(source, translated) {
  let result = translated;
  if (source.includes("&amp;")) result = result.replace(/&(?![a-z]+;|#\d+;)/gi, "&amp;");
  return result;
}

async function loadCache() {
  try {
    return JSON.parse(await readFile(cachePath, "utf8"));
  } catch {
    return {};
  }
}

async function translateText(text) {
  const source = decodeEntities(text);
  const query = new URLSearchParams({
    q: source,
    langpair: "en|pt-BR",
    de: "info@bespringchem.com",
  });
  const response = await fetch(`https://api.mymemory.translated.net/get?${query}`, {
    headers: { "User-Agent": "BespringWebsiteLocalization/1.0" }
  });
  if (!response.ok) throw new Error(`Translation HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.responseStatus !== 200 || !payload.responseData?.translatedText) {
    throw new Error(`Translation API: ${payload.responseDetails || payload.responseStatus}`);
  }
  return restoreEntities(text, payload.responseData.translatedText.trim());
}

async function translateCandidates(candidates, cache) {
  const pending = candidates.filter((text) => !cache[text]);
  let completed = 0;
  let cursor = 0;
  const workers = Array.from({ length: 4 }, async () => {
    while (cursor < pending.length) {
      const index = cursor++;
      const source = pending[index];
      try {
        cache[source] = await translateText(source);
      } catch (error) {
        console.error(`Translation stopped at ${index + 1}/${pending.length}: ${error.message}`);
        throw error;
      }
      completed += 1;
      if (completed % 20 === 0) {
        await writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
        console.log(`Translated ${completed}/${pending.length} new strings`);
      }
    }
  });
  await Promise.all(workers);
  await writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

function polishValue(value) {
  let output = value;
  for (const [pattern, replacement] of literalPolish) output = output.replace(pattern, replacement);
  return output
    .replace(/&\s+amp;/gi, "&amp;")
    .replace(/\bCotacaos\b/g, "Cotações")
    .replace(/\bquimicas\b/gi, (word) => matchCase(word, "químicas"))
    .replace(/\bquimica\b/gi, (word) => matchCase(word, "química"))
    .replace(/\bindustria\b/gi, (word) => matchCase(word, "indústria"))
    .replace(/\bindustrias\b/gi, (word) => matchCase(word, "indústrias"))
    .replace(/\brapidos\b/gi, (word) => matchCase(word, "rápidos"))
    .replace(/\bduvida\b/gi, (word) => matchCase(word, "dúvida"))
    .replace(/\brevisao\b/gi, (word) => matchCase(word, "revisão"))
    .replace(/\bplaneamento\b/gi, "planejamento")
    .replace(/\bcontentores\b/gi, "contêineres")
    .replace(/\bexactos\b/gi, "exatos")
    .replace(/\bexacto\b/gi, "exato")
    .replace(/\bExact identity\b/g, "Identidade exata")
    .replace(/\bCompliance scope\b/g, "Escopo de conformidade")
    .replace(/\bCommercial terms\b/g, "Condições comerciais")
    .replace(/\bcountries served\b/gi, "países atendidos")
    .replace(/\bPortfolio scope\b/gi, "Escopo do portfólio")
    .replace(/\bPreservatives\b/g, "Conservantes")
    .replace(/\bAcidulants\b/g, "Acidulantes")
    .replace(/\bTexturizers\b/g, "Texturizantes")
    .replace(/\bAmino acids\b/gi, "Aminoácidos")
    .replace(/\bOrganic acids\b/g, "Ácidos orgânicos")
    .replace(/\bTrace minerals\b/g, "Microminerais")
    .replace(/\bSurfactants\b/g, "Tensoativos")
    .replace(/\bBuilders\b/g, "Agentes estruturantes")
    .replace(/\bSolvents\b/g, "Solventes")
    .replace(/\bAlkalis\b/g, "Álcalis")
    .replace(/\bCoagulants\b/g, "Coagulantes")
    .replace(/\bBiocides\b/g, "Biocidas")
    .replace(/\bAmines\b/g, "Aminas")
    .replace(/\bFlotation reagents\b/gi, "Reagentes de flotação")
    .replace(/\bFlocculants\b/g, "Floculantes")
    .replace(/\bPhosphates\b/g, "Fosfatos")
    .replace(/\bNitrogen sources\b/g, "Fontes de nitrogênio")
    .replace(/\bPotassium salts\b/g, "Sais de potássio")
    .replace(/\bMicronutrients\b/g, "Micronutrientes")
    .replace(/\bProcurement guidance\b/g, "Orientação para compras")
    .replace(/\bCritical limits\b/g, "Limites críticos")
    .replace(/\bDelivery basis\b/g, "Condições de entrega")
    .replace(/\bSafety Data Sheet\b/g, "Ficha de Dados de Segurança")
    .replace(/\bApplicable Certificates\b/gi, "Certificados aplicáveis")
    .replace(/\bEspecificação-led sourcing\b/gi, "Compras orientadas por especificação")
    .replace(/\bDiscuss an inquiry\b/g, "Discutir uma consulta")
    .replace(/\bWarehousing (?:&amp;|&) consolidation\b/gi, "Armazenagem e consolidação")
    .replace(/\bOrganic Acids (?:&amp;|&) Acidifiers\b/gi, "Ácidos orgânicos e acidificantes")
    .replace(/\bMacro Minerals (?:&amp;|&) Buffers\b/gi, "Macrominerais e tamponantes")
    .replace(/\bLiquid Carriers (?:&amp;|&) Energy Sources\b/gi, "Veículos líquidos e fontes de energia")
    .replace(/\bTrace Mineral Sources\b/gi, "Fontes de microminerais")
    .replace(/\bFunctional Nutrients\b/gi, "Nutrientes funcionais")
    .replace(/\bSmelting (?:&amp;|&) Electrowinning Inputs\b/gi, "Insumos para fundição e eletro-obtenção")
    .replace(/\bContainer planning\b/g, "Planejamento de contêineres")
    .replace(/\bPrice-driver discussion\b/g, "Análise dos fatores de preço")
    .replace(/\bScope note:/g, "Nota sobre o escopo:")
    .replace(/\bWorking process\b/g, "Processo de trabalho")
    .replace(/\bA clearer qualification path\b/g, "Um processo de qualificação mais claro")
    .replace(/\bConfirm approval basis\b/g, "Confirmar os critérios de aprovação")
    .replace(/\bExhibitions archive\b/g, "Arquivo de feiras")
    .replace(/\bAsk on WhatsApp\b/g, "Consultar pelo WhatsApp")
    .replace(/\bSales:/g, "Vendas:")
    .replace(/\bOffice:/g, "Escritório:")
    .replace(/Ruixing North Road, Yunhe Town, Pizhou City, Jiangsu Province, China/g, "Rua Ruixing Norte, Yunhe, Pizhou, Jiangsu, China")
    .replace(/\b(?:Iniciocare|Miniciocare|Homecare|Início Care)\b/gi, "Cuidados domésticos")
    .replace(/\bSolicitar um orçamento\b/gi, "Solicitar cotação")
    .replace(/\borçamento\b/gi, "cotação")
    .replace(/\borçamentos\b/gi, "cotações")
    .replace(/\binquérito\b/gi, "consulta comercial")
    .replace(/\binquéritos\b/gi, "consultas comerciais")
    .replace(/\bmanuseamento\b/gi, "manuseio")
    .replace(/\bcontrolo\b/gi, "controle")
    .replace(/\bactual\b/gi, "atual")
    .replace(/\bactuais\b/gi, "atuais")
    .replace(/\bfabrico\b/gi, "fabricação")
    .replace(/\bsectores\b/gi, "setores")
    .replace(/\bsector\b/gi, "setor")
    .replace(/\bpormenores\b/gi, "detalhes")
    .replace(/\balergénios\b/gi, "alérgenos")
    .replace(/\barsénio\b/gi, "arsênio")
    .replace(/\bhumidade\b/gi, "umidade")
    .replace(/\bDairy\b/g, "Laticínios")
    .replace(/\bBooth\b/g, "Estande")
    .replace(/\bExhibition\b/g, "Feira")
    .replace(/\bCompliance\b/g, "Conformidade")
    .replace(/\bQuality First\b/g, "Qualidade em Primeiro Lugar")
    .replace(/\bWin-Win\b/g, "Ganha-Ganha")
    .replace(/\bback-and-th\b/gi, "idas e vindas")
    .replace(/\bBespring Chemical home\b/g, "Página inicial da Bespring Chemical")
    .replace(/\bDADIRECÇÃO\b/g, "LATICÍNIOS")
    .replace(/\bProcess optimization\b/gi, "Otimização de processos")
    .replace(/^Scope$/gi, "Escopo")
    .replace(/\bA Practical Sourcing Process\b/gi, "Um processo prático de compras")
    .replace(/\b5 Process Stages\b/gi, "5 etapas do processo")
    .replace(/^Flotation$/gi, "Flotação")
    .replace(/\bProcess stage:/gi, "Etapa do processo:")
    .replace(/^Process:$/gi, "Processo:")
    .replace(/^Process$/gi, "Processo")
    .replace(/\bInorganic Agentes estruturantes (?:&amp;|&) Process Aids\b/gi, "Builders inorgânicos e auxiliares de processo")
    .replace(/\bIdentity (?:&amp;|&) standard\b/gi, "Identidade e norma")
    .replace(/\bCritical parameters\b/gi, "Parâmetros críticos")
    .replace(/\bOre (?:&amp;|&) process context\b/gi, "Contexto do minério e do processo")
    .replace(/\bSite logistics\b/gi, "Logística da unidade")
    .replace(/\bHSE documentation\b/gi, "Documentação de SSMA")
    .replace(/^Product$/gi, "Produto")
    .replace(/\bSodium aluminum phosphate, acidic\b/gi, "Fosfato ácido de sódio e alumínio")
    .replace(/\bProcess tolerance\b/gi, "Tolerância ao processo")
    .replace(/\bSequestration (?:&amp;|&) process control\b/gi, "Sequestro iônico e controle do processo")
    .replace(/\bConformidade scope\b/gi, "Escopo de conformidade")
    .replace(/\bPortfólio scope\b/gi, "Escopo do portfólio")
    .replace(/Matérias-\s+primas/gi, "Matérias-primas")
    .replace(/\bUm consulta comercial preciso\b/gi, "Uma consulta comercial precisa")
    .replace(/\bidas e vindas desnecessário\b/gi, "idas e vindas desnecessárias")
    .replace(/\bTratamento de Águas Químicas\b/g, "Produtos químicos para tratamento de água")
    .replace(/\bMineração e processamento mineral Químicos\b/g, "Produtos químicos para mineração e processamento mineral")
    .replace(/\bProcessos pormenorizados do produto\b/g, "Dossiês detalhados de produtos")
    .replace(/\bPerfil de aquisição do produto (?:&amp;|&)\b/g, "Perfil técnico e de compras")
    .replace(/\bRevisão identidade\b/g, "Revise identidade")
    .replace(/\bExportação de Produtos Químicos (?:&amp;|&) Suporte a Compras Serviços\b/g, "Serviços de exportação e apoio à compra de produtos químicos")
    .replace(/\bDo RFQ para exportar o envio\b/g, "Da RFQ ao embarque de exportação")
    .replace(/\bcontra o consulta comercial\b/g, "com a consulta comercial")
    .replace(/\bCoordenação qualidade (?:&amp;|&) documento\b/g, "Coordenação de qualidade e documentos")
    .replace(/\bRevisão especificação-gap\b/g, "Análise de lacunas da especificação")
    .replace(/\bBenspring\b/g, "Bespring")
    .replace(/\bBespring Químico\b/g, "Bespring Chemical")
    .replace(/\balimentos para animais\b/gi, "alimentação animal")
    .replace(/\bgrau de alimentação\b/gi, "grau para alimentação animal")
    .replace(/\bqualidade de alimentação\b/gi, "grau para alimentação animal")
    .replace(/\bqualidade alimentar\b/gi, "grau alimentício")
    .replace(/\bequipa\b/gi, "equipe")
    .replace(/\bcontacte-nos\b/gi, "entre em contato")
    .replace(/\bContacto\b/g, "Contato")
    .replace(/\bVamos discutir o seu ingrediente ou requisitos químicos\b/g, "Vamos discutir suas necessidades de ingredientes ou produtos químicos")
    .replace(/\bSuporte à exportação global de vendas do (?:&amp;|&)/gi, "Vendas globais e suporte à exportação")
    .replace(/\bSolicitar um Cotação\b/gi, "Solicitar cotação")
    .replace(/\bChat on WhatsApp\b/gi, "Falar pelo WhatsApp")
    .replace(/\bSend an e-mail\b/gi, "Enviar e-mail")
    .replace(/\bCall sales\b/gi, "Ligar para vendas")
    .replace(/\bWhatsApp Sales\b/gi, "Vendas pelo WhatsApp")
    .replace(/\bStart a chat\b/gi, "Iniciar conversa")
    .replace(/\bContacte a nossa equipe\b/gi, "Contate nossa equipe")
    .replace(/\bpartilhar\b/gi, "compartilhar")
    .replace(/\bpretendeda\b/gi, "pretendida")
    .replace(/\breacção\b/gi, "reação")
    .replace(/\bactiva\b/gi, "ativa")
    .replace(/(?:,?\s*se for caso disso){2,}/gi, ", se aplicável")
    .replace(/\bpao\b/gi, "pão")
    .replace(/\bpo\b/gi, "pó")
    .replace(/ □ /g, " | ")
    .replace(/\bfeed grade\b/gi, "grau para alimentação animal")
    .replace(/\bfood grade\b/gi, "grau alimentício")
    .replace(/\btechnical grade\b/gi, "grau técnico")
    .replace(/\bfeed additives\b/gi, "aditivos para alimentação animal")
    .replace(/\banimal feed\b/gi, "alimentação animal")
    .replace(/\bracao\b/gi, "ração")
    .replace(/\bracoes\b/gi, "rações")
    .replace(/\bSodium Tripolyphosphate\b/g, "tripolifosfato de sódio")
    .replace(/\bSodium Hexametaphosphate\b/g, "hexametafosfato de sódio")
    .replace(/\bTetrapotassium Pyrophosphate\b/g, "pirofosfato tetrapotássico")
    .replace(/\bMonocalcium Phosphate\b/g, "fosfato monocálcico")
    .replace(/\bDicalcium Phosphate\b/g, "fosfato dicálcico")
    .replace(/\bCalcium Propionate\b/g, "propionato de cálcio")
    .replace(/\bCitric Acid\b/g, "ácido cítrico")
    .replace(/\bSodium Carboxymethyl Cellulose\b/g, "carboximetilcelulose sódica")
    .replace(/\bSodium Aluminum Phosphate\b/g, "fosfato de sódio e alumínio");
}

function translateJson(value, cache, key = "") {
  if (typeof value === "string") {
    const translated = !jsonKeysToSkip.has(key) && cache[value] ? cache[value] : value;
    return jsonKeysToSkip.has(key) ? translated : polishValue(translated);
  }
  if (Array.isArray(value)) return value.map((item) => translateJson(item, cache, key));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        translateJson(childValue, cache, childKey)
      ])
    );
  }
  return value;
}

function replaceHtmlCandidates(html, cache) {
  let output = html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi,
    (block, jsonText) => {
      try {
        const translated = translateJson(JSON.parse(jsonText), cache);
        return `<script type="application/ld+json">\n${JSON.stringify(translated, null, 2)}\n  </script>`;
      } catch {
        return block;
      }
    }
  );

  const scripts = [];
  output = output.replace(/<(?:script|style)\b[\s\S]*?<\/(?:script|style)>/gi, (block) => {
    const token = `__PT_MASK_${scripts.length}__`;
    scripts.push(block);
    return token;
  });

  output = output.replace(/>([^<>]+)</g, (block, rawValue) => {
    const leading = rawValue.match(/^\s*/)?.[0] || "";
    const trailing = rawValue.match(/\s*$/)?.[0] || "";
    const value = rawValue.trim();
    if (!value) return block;
    const translated = cache[value] || value;
    return `>${leading}${polishValue(translated)}${trailing}<`;
  });

  output = output.replace(
    /\b(content|alt|aria-label|title|placeholder|value)="([^"]+)"/gi,
    (block, attribute, value) => {
      const translated = cache[value] || value;
      return `${attribute}="${polishValue(translated)}"`;
    }
  );

  output = output.replace(/__PT_MASK_(\d+)__/g, (_, index) => scripts[Number(index)]);
  return output;
}

function polishPortuguese(html) {
  let output = html
    .replace(/<html([^>]*?)lang="[^"]*"/i, '<html$1lang="pt-BR"')
    .replace(/hreflang="pt"/g, 'hreflang="pt-BR"')
    .replace(/property="og:locale" content="pt_PT"/g, 'property="og:locale" content="pt_BR"')
    .replace(/"inLanguage"\s*:\s*"pt"/g, '"inLanguage": "pt-BR"')
    .replace(/Hello%2C%20I%20would%20like%20a%20quote%20for%20/gi, "Ol%C3%A1%2C%20gostaria%20de%20uma%20cota%C3%A7%C3%A3o%20para%20")
    .replace(/Hello%2C%20I%20need%20a%20quote%20for%20/gi, "Ol%C3%A1%2C%20preciso%20de%20uma%20cota%C3%A7%C3%A3o%20para%20");
  output = output
    .replace(/food%20grade/gi, "grau%20aliment%C3%ADcio")
    .replace(/citric%20acid/gi, "%C3%A1cido%20c%C3%ADtrico")
    .replace(/dicalcium%20phosphate/gi, "fosfato%20dic%C3%A1lcico")
    .replace(/monocalcium%20phosphate/gi, "fosfato%20monoc%C3%A1lcico")
    .replace(/sodium%20CMC/gi, "CMC%20s%C3%B3dica")
    .replace(/Fechar menu de navegacao/g, "Fechar menu de navegação")
    .replace(/Abrir menu de navegacao/g, "Abrir menu de navegação");
  if (!/property="og:locale"/i.test(output)) {
    output = output.replace(
      /(<meta property="og:type" content="[^"]*">)/i,
      '$1\n  <meta property="og:locale" content="pt_BR">'
    );
  }
  return output;
}

function applySeoOverrides(html, file) {
  const override = seoOverrides[file];
  if (!override) return html;
  let output = html;
  if (override.title) {
    const escapedTitle = override.title.replace(/&/g, "&amp;");
    output = output
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapedTitle}</title>`)
      .replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${escapedTitle}">`)
      .replace(/<meta name="twitter:title" content="[^"]*">/i, `<meta name="twitter:title" content="${escapedTitle}">`);
  }
  if (override.description) {
    output = output
      .replace(/<meta name="description"[\s\S]*?content="[^"]*"\s*\/?>/i, `<meta name="description" content="${override.description}">`)
      .replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${override.description}">`)
      .replace(/<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="${override.description}">`);
  }
  return output;
}

function finalizePage(html, file) {
  return applySeoOverrides(polishPortuguese(html), file);
}

const files = (await walk(ptRoot))
  .sort()
  .filter((file) => !fileFilter || file.includes(fileFilter));

const pages = [];
const globalCandidates = new Set();
for (const file of files) {
  const html = await readFile(file, "utf8");
  const candidates = getAllCandidates(html);
  pages.push({ file, html, candidates });
  candidates.forEach((item) => globalCandidates.add(item));
}

const totalChars = [...globalCandidates].reduce((sum, item) => sum + item.length, 0);
console.log(`PT audit: ${files.length} pages, ${globalCandidates.size} unique English strings, ${totalChars} characters.`);

if (details) {
  for (const { file, candidates } of pages) {
    if (!candidates.length) continue;
    console.log(`\n${path.relative(ptRoot, file).replaceAll("\\", "/")} (${candidates.length})`);
    candidates.forEach((item) => console.log(`  - ${item}`));
  }
}

if (exportCandidates) {
  await writeFile(candidatePath, `${JSON.stringify([...globalCandidates], null, 2)}\n`, "utf8");
  console.log(`Exported candidates to ${candidatePath}`);
} else if (applyCache) {
  const cache = await loadCache();
  const missing = [...globalCandidates].filter((item) => !cache[item]);
  if (missing.length) console.log(`Cache has no exact entry for ${missing.length} already-localized or residual strings; polishing continues.`);
  for (const { file, html } of pages) {
    const relative = path.relative(ptRoot, file).replaceAll("\\", "/");
    const localized = finalizePage(replaceHtmlCandidates(html, cache), relative);
    await writeFile(file, localized, "utf8");
  }
  console.log(`Applied cached translations to ${pages.length} Portuguese pages.`);
} else if (!auditOnly) {
  await mkdir(path.dirname(cachePath), { recursive: true });
  const cache = await loadCache();
  await translateCandidates([...globalCandidates], cache);

  for (const { file, html } of pages) {
    const relative = path.relative(ptRoot, file).replaceAll("\\", "/");
    const localized = finalizePage(replaceHtmlCandidates(html, cache), relative);
    await writeFile(file, localized, "utf8");
  }
  console.log(`Localized and polished ${pages.length} Portuguese pages.`);
}

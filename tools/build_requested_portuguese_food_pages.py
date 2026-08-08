#!/usr/bin/env python3
"""Build the nine requested Brazilian-Portuguese food-product dossiers."""

from __future__ import annotations

import html as h
import importlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from build_requested_spanish_food_pages import PRODUCTS as SOURCE

BASE = "https://www.bespringchem.com"

PT = {
    "diammonium-phosphate-dap": {
        "name": "Fosfato diamônico (DAP)",
        "title": "Fornecedor de fosfato diamônico alimentício | DAP a granel",
        "description": "Fosfato diamônico (DAP) grau alimentício, INS 342(ii). Consulte teor, P₂O₅, nitrogênio, pH, COA, embalagem e cotação a granel.",
        "summary": "O fosfato diamônico grau alimentício é um sal fosfatado solúvel em água que pode fornecer nitrogênio e fósforo em processos de fermentação autorizados, além de atuar como regulador de acidez ou componente de sistemas de fermentação química.",
        "functions": ["Nutriente para leveduras em processos de fermentação validados", "Regulação de acidez e ação tamponante", "Componente de sistemas de fermentação química e condicionamento de massas", "Fonte de fosfato em pré-misturas alimentícias compatíveis"],
        "applications": ["Fermentação de bebidas e alimentos", "Panificação e misturas para produtos assados", "Produção e cultivo de leveduras", "Formulações secas que exijam uma fonte solúvel de fosfato"],
        "criteria": ["Teor de DAP, P₂O₅ e nitrogênio na base de cálculo acordada", "pH da solução, umidade e insolúveis em água", "Limites de arsênio, chumbo, fluoreto e demais contaminantes aplicáveis", "Granulometria, dissolução e compatibilidade com a formulação"],
        "note": "Não confunda o produto alimentício com DAP fertilizante. A classificação como grau alimentício deve ser comprovada para a origem exata por especificação, rastreabilidade e documentação do sistema de qualidade.",
    },
    "food-phosphate-blends": {
        "name": "Misturas de fosfatos alimentícios",
        "title": "Misturas de fosfatos alimentícios sob medida | Fornecedor B2B",
        "description": "Misturas de fosfatos alimentícios formuladas por aplicação. Defina função, composição, solubilidade, pH, legislação, COA e fornecimento a granel.",
        "summary": "As misturas de fosfatos alimentícios combinam ortofosfatos, pirofosfatos ou polifosfatos em proporções definidas para entregar um perfil funcional reproduzível. A seleção deve partir do alimento, do processo, da legislação de destino e do resultado técnico esperado.",
        "functions": ["Ajuste de pH e capacidade tamponante", "Gestão de proteínas, água e textura em sistemas compatíveis", "Controle da velocidade de reação em fermentos químicos", "Dispersão, sequestro de íons ou estabilização conforme a composição"],
        "applications": ["Produtos cárneos e sistemas proteicos", "Queijos processados e outras matrizes lácteas", "Panificação e misturas de fermentos químicos", "Bebidas, preparados de frutas e aplicações autorizadas"],
        "criteria": ["Composição qualitativa e quantitativa, sem depender de um nome comercial genérico", "pH, solubilidade, P₂O₅ e granulometria com métodos acordados", "Testes na fórmula real, considerando água, sal, proteína, temperatura e ordem de adição", "Declaração de ingredientes, limites legais e rotulagem no mercado de destino"],
        "note": "Duas misturas não são equivalentes apenas porque ambas contêm fosfatos. Composição, pH, comprimento de cadeia e distribuição granulométrica podem alterar o desempenho.",
    },
    "phosphoric-acid-85": {
        "name": "Ácido fosfórico 85%",
        "title": "Fornecedor de ácido fosfórico 85% grau alimentício | E338",
        "description": "Ácido fosfórico 85% grau alimentício (E338) para fornecimento B2B. Consulte concentração, impurezas, FISPQ, embalagem e cotação a granel.",
        "summary": "O ácido fosfórico 85% grau alimentício é uma solução concentrada de ácido ortofosfórico utilizada, quando autorizada, como acidulante, regulador de acidez e matéria-prima para fosfatos alimentícios.",
        "functions": ["Acidificação e ajuste de pH", "Perfil de acidez para bebidas e alimentos compatíveis", "Matéria-prima para sais de fosfato", "Controle de processo em aplicações alimentícias autorizadas"],
        "applications": ["Bebidas, concentrados, geleias e molhos", "Clarificação e refino de açúcar", "Produção de fosfatos alimentícios", "Processos que exijam acidificação controlada"],
        "criteria": ["Concentração real de H₃PO₄ e método analítico", "Cor, transparência, metais e ânions críticos", "Origem térmica ou via úmida e grau de purificação", "Material da embalagem, compatibilidade, ventilação e classificação de transporte"],
        "note": "Produto corrosivo. Manuseio, transporte, EPI e seleção de materiais devem seguir a FISPQ vigente e os procedimentos de segurança da unidade.",
    },
    "monoammonium-phosphate-map": {
        "name": "Fosfato monoamônico (MAP)",
        "title": "Fornecedor de fosfato monoamônico alimentício | MAP a granel",
        "description": "Fosfato monoamônico (MAP) grau alimentício, INS 342(i). Consulte teor, P₂O₅, nitrogênio, pH, COA, embalagem e cotação a granel.",
        "summary": "O fosfato monoamônico grau alimentício é um sal ácido e solúvel que fornece amônio e fosfato. Pode ser avaliado como nutriente para leveduras, regulador de acidez ou componente de fermentos químicos em usos autorizados.",
        "functions": ["Fonte de nitrogênio e fósforo para fermentações controladas", "Regulação de acidez", "Componente ácido de determinados sistemas de fermentação química", "Fonte de fosfato em misturas secas compatíveis"],
        "applications": ["Fermentação e nutrição de leveduras", "Panificação", "Pré-misturas alimentícias", "Processos que exijam um fosfato de amônio mais ácido que o DAP"],
        "criteria": ["Teor, P₂O₅, nitrogênio e base de cálculo", "pH, umidade, insolúveis e granulometria", "Impurezas e limites específicos do país de destino", "Comparação funcional de MAP e DAP na formulação real"],
        "note": "Não confunda com MAP fertilizante. Para uso em alimentos, confirme grau, origem, rastreabilidade, especificação e documentação do lote.",
    },
    "sodium-diacetate": {
        "name": "Diacetato de sódio",
        "title": "Fornecedor de diacetato de sódio alimentício | INS 262(ii)",
        "description": "Diacetato de sódio INS 262(ii) grau alimentício para formulações autorizadas. Consulte composição, pH, COA, embalagem e fornecimento a granel.",
        "summary": "O diacetato de sódio é um complexo de acetato de sódio e ácido acético. Em alimentos autorizados, pode atuar como regulador de acidez, conservador e fonte de nota avinagrada, sobretudo em formulações secas e salgadas.",
        "functions": ["Regulação de acidez e ação tamponante", "Apoio ao controle de determinados microrganismos", "Desenvolvimento de sabor avinagrado", "Ingrediente seco para sistemas de conservação validados"],
        "applications": ["Salgadinhos e temperos em pó", "Panificação", "Produtos cárneos processados", "Molhos, condimentos e alimentos preparados"],
        "criteria": ["Proporção de acetato de sódio e ácido acético livre", "pH, umidade, odor e fluidez", "Forma física e homogeneidade em pré-misturas", "Validação microbiológica, sensorial e legal no alimento final"],
        "note": "O resultado conservador depende de pH, atividade de água, processo, embalagem e outras barreiras. A dose isolada não comprova vida útil nem segurança microbiológica.",
    },
    "sodium-benzoate": {
        "name": "Benzoato de sódio",
        "title": "Fornecedor de benzoato de sódio alimentício | INS 211 a granel",
        "description": "Benzoato de sódio INS 211 grau alimentício em pó ou granulado. Consulte pureza, granulometria, COA, embalagem e cotação para fornecimento a granel.",
        "summary": "O benzoato de sódio é o sal de sódio do ácido benzoico e um conservador empregado principalmente em bebidas e alimentos ácidos. Seu desempenho depende do pH e deve ser validado dentro do sistema completo de conservação.",
        "functions": ["Controle de leveduras, bolores e determinadas bactérias em meios ácidos", "Apoio à estabilidade durante a vida de prateleira", "Alternativa mais solúvel ao ácido benzoico", "Uso isolado ou combinado quando permitido e tecnicamente validado"],
        "applications": ["Bebidas e concentrados ácidos", "Molhos, condimentos e conservas", "Preparados de frutas", "Outras categorias autorizadas no mercado de destino"],
        "criteria": ["Pureza, umidade, acidez/alcalinidade e impurezas", "Pó, granulado ou apresentação de baixa emissão de pó", "pH e composição completa da aplicação", "Limites de uso, rotulagem e possíveis interações na fórmula"],
        "note": "O benzoato de sódio não é uma solução universal. Valide pH, limite legal, processo, embalagem, condições de armazenamento e vida de prateleira do produto acabado.",
    },
    "calcium-sorbate": {
        "name": "Sorbato de cálcio",
        "title": "Fornecedor de sorbato de cálcio alimentício | INS 203",
        "description": "Sorbato de cálcio INS 203 grau alimentício para mercados onde seja autorizado. Consulte pureza, legislação de destino, COA, embalagem e cotação.",
        "summary": "O sorbato de cálcio é o sal de cálcio do ácido sórbico. Foi utilizado como conservador contra bolores e leveduras, mas sua situação regulatória varia entre mercados e deve ser verificada antes da compra ou da formulação.",
        "functions": ["Atividade contra bolores e leveduras em condições adequadas", "Fonte sólida de sorbato para aplicações específicas", "Componente de sistemas de conservação autorizados", "Alternativa técnica sujeita à solubilidade e à legislação"],
        "applications": ["Somente categorias autorizadas no país de comercialização", "Ensaios comparativos com ácido sórbico ou sorbato de potássio", "Sistemas em que a forma cálcica ofereça uma vantagem comprovada", "Desenvolvimento destinado a mercados que permitam o INS 203"],
        "criteria": ["Autorização vigente por mercado e categoria de alimento", "Teor, umidade, impurezas e método analítico", "Solubilidade e distribuição na matriz", "Validação de eficácia, rotulagem e vida de prateleira"],
        "note": "Atenção regulatória: a União Europeia retirou o E203 das listas de aditivos alimentares autorizados em 2018. Para Brasil e demais mercados, confirme a regra vigente e a categoria específica antes do uso.",
    },
    "silicon-dioxide": {
        "name": "Dióxido de silício (sílica)",
        "title": "Fornecedor de dióxido de silício alimentício | INS 551",
        "description": "Dióxido de silício INS 551 grau alimentício para uso antiaglomerante. Consulte tipo de sílica, umidade, granulometria, COA e fornecimento a granel.",
        "summary": "O dióxido de silício amorfo grau alimentício, também chamado de sílica alimentícia, é usado como antiaglomerante ou agente de fluidez em produtos secos quando a legislação permite.",
        "functions": ["Redução de empedramento e aglomeração em pós", "Melhoria da fluidez durante mistura, dosagem e envase", "Adsorção controlada de umidade ou líquidos em pré-misturas", "Apoio à homogeneidade de ingredientes secos"],
        "applications": ["Temperos, especiarias e misturas em pó", "Bebidas instantâneas e pré-misturas", "Sais, açúcares e pós higroscópicos", "Ingredientes e suplementos alimentares autorizados"],
        "criteria": ["Sílica amorfa precipitada, gel de sílica ou outra forma especificada", "Perda por secagem, perda por ignição e pureza", "Granulometria, densidade aparente e capacidade de adsorção", "Desempenho de fluxo no produto real e limites regulatórios"],
        "note": "A identidade e a forma física são decisivas. Uma ficha genérica de dióxido de silício não demonstra, por si só, que o material seja apropriado para alimentos.",
    },
    "gellan-gum": {
        "name": "Goma gelana",
        "title": "Fornecedor de goma gelana alimentícia | INS 418 alto e baixo acil",
        "description": "Goma gelana INS 418 grau alimentício, de alto ou baixo acil. Compare hidratação, textura, força de gel, COA, embalagem e cotação a granel.",
        "summary": "A goma gelana é um hidrocoloide obtido por fermentação. Os tipos de alto e baixo acil apresentam texturas distintas; a escolha deve considerar matriz, íons, pH, processo térmico e experiência sensorial desejada.",
        "functions": ["Gelificação e formação de estrutura", "Suspensão de partículas, minerais ou cacau", "Estabilização e controle de separação", "Ajuste de textura em baixas concentrações"],
        "applications": ["Bebidas vegetais, lácteas e bebidas com partículas", "Preparados de frutas, geleias e recheios", "Sobremesas e produtos de confeitaria", "Molhos e formulações que exijam suspensão ou gel"],
        "criteria": ["Alto acil para texturas mais macias e elásticas; baixo acil para géis mais firmes", "Condições de hidratação, temperatura e ordem de adição", "Sensibilidade a cálcio e outros íons, pH e sólidos solúveis", "Força de gel, viscosidade, microbiologia e solventes residuais"],
        "note": "Não compare força de gel entre fornecedores sem alinhar método, concentração, água, sistema iônico e temperatura do ensaio.",
    },
}


def li(values: list[str]) -> str:
    return "".join(f"<li>{h.escape(x)}</li>" for x in values)


def schema(slug: str, p: dict, src: dict) -> str:
    url = f"{BASE}/pt/products/food-ingredients/{slug}.html"
    data = {"@context": "https://schema.org", "@graph": [
        {"@type": "WebPage", "@id": url + "#webpage", "url": url, "name": p["title"], "description": p["description"], "inLanguage": "pt-BR", "dateModified": "2026-08-08"},
        {"@type": "Product", "@id": url + "#product", "name": p["name"], "description": p["summary"], "category": "Ingredientes alimentícios", "brand": {"@type": "Brand", "name": "Bespring Chemical"}, "url": url},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Início", "item": f"{BASE}/pt/"},
            {"@type": "ListItem", "position": 2, "name": "Produtos", "item": f"{BASE}/pt/products.html"},
            {"@type": "ListItem", "position": 3, "name": "Ingredientes alimentícios", "item": f"{BASE}/pt/products/food-ingredients.html"},
            {"@type": "ListItem", "position": 4, "name": p["name"]},
        ]},
    ]}
    return json.dumps(data, ensure_ascii=False, separators=(",", ":"))


def page(slug: str, p: dict, src: dict) -> str:
    en = f"{BASE}/products/food-ingredients/{slug}.html"; pt = f"{BASE}/pt/products/food-ingredients/{slug}.html"
    title=h.escape(p["title"]); desc=h.escape(p["description"],quote=True); name=h.escape(p["name"])
    return f'''<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title><meta name="description" content="{desc}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="canonical" href="{pt}"><link rel="alternate" hreflang="en" href="{en}"><link rel="alternate" hreflang="pt-BR" href="{pt}"><link rel="alternate" hreflang="x-default" href="{en}"><meta property="og:type" content="product"><meta property="og:site_name" content="Bespring Chemical"><meta property="og:locale" content="pt_BR"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{pt}"><meta property="og:image" content="{BASE}/images/food-ingredients-og-en-2026.jpg"><meta property="og:image:alt" content="Ingredientes alimentícios para fornecimento B2B"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{title}"><meta name="twitter:description" content="{desc}"><link rel="icon" href="../../../images/favicon.ico"><link rel="preload" as="image" href="../../../images/food-ingredients.jpg" fetchpriority="high"><link rel="stylesheet" href="../../../css/style.css"><link rel="stylesheet" href="../../../css/site-pages.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"><script type="application/ld+json">{schema(slug,p,src)}</script></head><body class="editorial-page">
<div class="bs-seo-topbar"><div class="container bs-seo-topbar-container"><div class="bs-seo-topbar-left"><span class="bs-seo-highlight"><i class="fas fa-industry"></i> Fornecimento B2B de ingredientes alimentícios</span><span class="bs-seo-divider">|</span><span><i class="fas fa-globe"></i> Exportação internacional</span></div><div class="bs-seo-topbar-right"><a href="mailto:info@bespringchem.com">info@bespringchem.com</a><a href="tel:+8613914896109">+86 139 1489 6109</a></div></div></div><header class="site-header"><div class="container nav-container"><div class="logo"><a href="../../index.html"><img src="../../../images/logo.png" alt="Bespring Chemical"></a></div><nav class="main-nav" aria-label="Navegação principal"><ul><li><a href="../../index.html">Início</a></li><li><a href="../../about/company-profile.html">Sobre nós</a></li><li><a href="../../products.html" aria-current="page">Produtos</a></li><li><a href="../../services.html">Serviços</a></li><li><a href="../../news.html">Notícias</a></li><li><a href="../../contact.html" class="btn-nav">Contato</a></li></ul></nav><button class="hamburger" aria-label="Abrir menu de navegação" aria-expanded="false"><i class="fas fa-bars"></i></button></div></header>
<main><article><header class="ep-hero" style="--ep-image:url('../../../images/foodadditivesbanner.jpg')"><div class="container"><nav class="ep-breadcrumb" aria-label="Navegação estrutural"><ol><li><a href="../../index.html">Início</a></li><li><a href="../../products.html">Produtos</a></li><li><a href="../food-ingredients.html">Ingredientes alimentícios</a></li><li aria-current="page">{name}</li></ol></nav><p class="ep-eyebrow">Ingrediente grau alimentício · {h.escape(src['code'])}</p><h1>{name}</h1><p class="ep-hero__lead">{h.escape(p['summary'])}</p></div></header><div class="container article-layout"><div class="article-body"><p class="lead"><strong>{name}</strong> · CAS {h.escape(src['cas'])} · {h.escape(src['code'])} · {h.escape(src['formula'])}</p>
<h2>O que é e como especificar</h2><p>{h.escape(p['summary'])}</p><p>Para compras industriais, o nome comercial não é suficiente. Solicite a especificação vigente da origem proposta, os métodos analíticos, um COA representativo e o certificado do lote. A conformidade deve ser avaliada para a aplicação, a norma acordada e o país onde o alimento será comercializado.</p>
<h2>Principais funções</h2><ul>{li(p['functions'])}</ul><h2>Aplicações a serem avaliadas</h2><ul>{li(p['applications'])}</ul><p>As aplicações são orientativas, não autorizações gerais nem recomendações de dosagem. Confirme adequação técnica, limite de uso e rotulagem no produto final.</p>
<h2>Critérios de seleção para compras B2B</h2><ul>{li(p['criteria'])}</ul><p>{h.escape(p['note'])}</p>
<h2>Documentação, embalagem e logística</h2><p>Para homologação do fornecedor, solicite especificação assinada, ficha técnica, FISPQ, modelo de COA, declarações regulatórias e certificados aplicáveis ao produto, à fábrica e ao período de fornecimento. Confirme peso líquido, material da embalagem e do revestimento interno, paletização, marcações, prazo de validade, armazenagem, porto de destino e Incoterm.</p>
<h2>Referência técnica independente</h2><p>Consulte a <a href="{h.escape(src['reference'],quote=True)}" target="_blank" rel="noopener noreferrer">referência técnica oficial indicada para este produto</a> como apoio à identidade e ao contexto regulatório. A especificação contratual e a legislação vigente do mercado de destino prevalecem em cada operação.</p>
<h2>Perguntas frequentes</h2><details open><summary>Quais dados devo enviar para solicitar uma cotação?</summary><p>Informe aplicação, norma e limites críticos, volume anual e por embarque, embalagem, destino, Incoterm, certificados e data necessária. Isso permite comparar propostas tecnicamente equivalentes.</p></details><details><summary>Como confirmar que o material é grau alimentício?</summary><p>Verifique a especificação da origem exata, a documentação do sistema de qualidade, as declarações aplicáveis e o COA do lote. O nome do produto, isoladamente, não comprova o grau.</p></details><details><summary>O produto pode ser usado em qualquer alimento ou país?</summary><p>Não. Confirme categoria de alimento, função, limite de uso e rotulagem na legislação vigente do mercado de destino.</p></details></div><aside class="article-sidebar"><h2>Solicitar especificação e cotação</h2><p>Informe produto, grau, limites críticos, quantidade, embalagem e destino.</p><a href="../../contact.html">Enviar requisitos &rarr;</a><a href="../food-ingredients.html">Ver ingredientes alimentícios &rarr;</a><p><strong>Identificação</strong><br>CAS {h.escape(src['cas'])}<br>{h.escape(src['code'])}</p></aside></div></article></main>
<footer class="crc-footer"><div class="container footer-grid"><div class="footer-col"><h3>Bespring Chemical</h3><p>Fornecedor de ingredientes alimentícios, aditivos para nutrição animal e produtos químicos industriais.</p></div><div class="footer-col footer-links"><h3>Links rápidos</h3><ul><li><a href="../../products.html">Produtos</a></li><li><a href="../../services.html">Serviços</a></li><li><a href="../../news.html">Notícias</a></li></ul></div><div class="footer-col"><h3>Contato</h3><p><a href="tel:+8613914896109">+86 139 1489 6109</a></p><p><a href="mailto:info@bespringchem.com">info@bespringchem.com</a></p><a href="../../contact.html" class="contact-btn-footer">Solicitar informações</a></div></div><div class="footer-bottom">&copy; 2026 Bespring Chemical Co., Ltd. Todos os direitos reservados.</div></footer><script>const b=document.querySelector(".hamburger"),n=document.querySelector(".main-nav");b?.addEventListener("click",()=>{{const o=n.classList.toggle("active");b.setAttribute("aria-expanded",String(o))}});</script></body></html>'''


def add_pt_hreflang(slug: str) -> None:
    path = ROOT / "products/food-ingredients" / f"{slug}.html"; rel=path.relative_to(ROOT).as_posix()
    raw=subprocess.run(["git","show",f"HEAD:{rel}"],cwd=ROOT,check=True,stdout=subprocess.PIPE).stdout.decode("utf-8")
    # Preserve the Spanish hreflang added by the current worktree, then add Portuguese.
    current=path.read_text(encoding="utf-8")
    es=f'{BASE}/es/products/food-ingredients/{slug}.html'
    if f'hreflang="es" href="{es}"' in current and 'hreflang="es"' not in raw:
        raw=raw.replace('<link rel="alternate" hreflang="x-default"',f'<link rel="alternate" hreflang="es" href="{es}"><link rel="alternate" hreflang="x-default"',1)
    pt=f'{BASE}/pt/products/food-ingredients/{slug}.html'
    if 'hreflang="pt-BR"' not in raw:
        raw=raw.replace('<link rel="alternate" hreflang="x-default"',f'<link rel="alternate" hreflang="pt-BR" href="{pt}"><link rel="alternate" hreflang="x-default"',1)
    path.write_text(raw,encoding="utf-8")


def main() -> None:
    out=ROOT/"pt/products/food-ingredients"; out.mkdir(parents=True,exist_ok=True)
    for slug,p in PT.items():
        src=SOURCE[slug]; (out/f"{slug}.html").write_text(page(slug,p,src),encoding="utf-8")
        add_pt_hreflang(slug)
    importlib.import_module("build_industry_application_pages").rebuild_sitemap()
    print(f"Built {len(PT)} Portuguese product pages and rebuilt sitemap.xml")


if __name__ == "__main__": main()

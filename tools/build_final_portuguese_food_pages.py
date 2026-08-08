#!/usr/bin/env python3
"""Build the three final requested Brazilian Portuguese food pages."""

from __future__ import annotations

import importlib
from pathlib import Path

from build_final_spanish_food_pages import PRODUCTS as SOURCE
from build_requested_portuguese_food_pages import BASE, page

ROOT = Path(__file__).resolve().parents[1]

PT = {
    "encapsulated-sorbic-acid": {
        "name": "Ácido sórbico encapsulado",
        "title": "Fornecedor de ácido sórbico encapsulado | Grau alimentício",
        "description": "Ácido sórbico encapsulado grau alimentício com 83–87% de ativo. Consulte revestimento, liberação, granulometria, COA e cotação a granel.",
        "summary": "O ácido sórbico encapsulado é uma formulação conservante em que o ácido sórbico fica revestido por uma gordura de uso alimentício. O revestimento pode retardar o contato do ativo com a massa e reduzir interações prematuras; o perfil de liberação precisa ser confirmado no processo real do comprador.",
        "functions": ["Fornecimento controlado de ácido sórbico como ativo contra bolores", "Modificação do momento de liberação por meio de revestimento lipídico", "Redução de interações prematuras com leveduras ou ingredientes sensíveis quando comprovada na formulação", "Apoio a um sistema de vida de prateleira validado"],
        "applications": ["Panificação e massas fermentadas", "Pré-misturas secas para panificação", "Recheios e alimentos de umidade intermediária", "Outros alimentos autorizados em que a liberação do ativo tenha sido validada"],
        "criteria": ["Teor de ácido sórbico ativo e base do ensaio", "Natureza e declaração do revestimento, inclusive sua adequação para alimentos", "Curva ou método de liberação nas condições reais de mistura e forneamento", "Distribuição granulométrica, homogeneidade, microbiologia e estabilidade"],
        "note": "O produto acabado é uma mistura formulada: E200/INS 200 e CAS 110-44-1 identificam o ácido sórbico ativo, não uma identidade universal de toda a partícula encapsulada. Confirme composição, rotulagem e autorização no mercado de destino.",
    },
    "monosodium-glutamate-msg": {
        "name": "Glutamato monossódico (MSG)",
        "title": "Fornecedor de glutamato monossódico | MSG INS 621",
        "description": "Glutamato monossódico (MSG) INS 621 grau alimentício, com teor ≥99%. Avalie granulometria, pureza, COA, embalagem e cotação a granel.",
        "summary": "O L-glutamato monossódico, conhecido como glutamato monossódico ou MSG, é o sal de sódio do ácido L-glutâmico. É utilizado como realçador de sabor umami em formulações salgadas compatíveis, dentro dos usos e limites aplicáveis ao mercado de destino.",
        "functions": ["Realce do sabor umami", "Arredondamento do perfil salgado e de notas cárneas", "Reforço sensorial em misturas de temperos", "Melhora da percepção de sabor sem substituir o equilíbrio da formulação"],
        "applications": ["Temperos e condimentos em pó", "Sopas, caldos e molhos", "Macarrão instantâneo e snacks", "Produtos processados à base de carnes, pescados ou vegetais"],
        "criteria": ["Teor de glutamato de sódio, rotação específica e transmitância", "Granulometria acordada para dosagem, mistura e dissolução", "Perda por secagem, pH e limites de metais e impurezas", "Teste sensorial na receita final e contabilização do aporte de sódio"],
        "note": "A oferta comercial pode usar MSG, GMS ou glutamato de sódio. Na homologação, confirme que a especificação corresponde ao L-glutamato monossódico monoidratado e defina contratualmente a granulometria.",
    },
    "sodium-metabisulfite": {
        "name": "Metabissulfito de sódio",
        "title": "Fornecedor de metabissulfito de sódio alimentício | INS 223",
        "description": "Metabissulfito de sódio INS 223 grau alimentício para fornecimento B2B. Consulte teor, SO₂, pH, sulfitos, COA, sacos de 25 kg e cotação.",
        "summary": "O metabissulfito de sódio, também chamado dissulfito de sódio ou pirossulfito de sódio, é um sulfito que pode atuar como antioxidante, agente antiescurecimento, conservante ou agente de tratamento em categorias de alimentos autorizadas.",
        "functions": ["Ação antioxidante em processos compatíveis", "Controle de escurecimento em aplicações autorizadas", "Liberação de dióxido de enxofre nas condições de uso", "Apoio à conservação sujeito a validação e legislação"],
        "applications": ["Frutas e hortaliças processadas em categorias autorizadas", "Produtos de batata e outras matrizes suscetíveis ao escurecimento", "Determinados processos de vinificação ou bebidas", "Aplicações de panificação ou tratamento permitidas no mercado de destino"],
        "criteria": ["Teor como Na₂S₂O₅, conteúdo de SO₂, pH e insolúveis", "Ferro, arsênio, chumbo e outros limites com unidades e comparadores explícitos", "Umidade, estabilidade e embalagem com barreira ao ar e à água", "Limite de uso, resíduo de SO₂ e declaração de sulfitos no alimento final"],
        "note": "Sulfitos podem exigir declaração específica no rótulo e merecem atenção para consumidores sensíveis. Confirme a regra vigente, o limiar aplicável, a categoria do alimento e o teor residual no mercado de destino; não trate uma proposta regulatória como norma já aprovada.",
    },
}


def add_pt_hreflang(slug: str) -> None:
    path = ROOT / "products" / "food-ingredients" / f"{slug}.html"
    text = path.read_text(encoding="utf-8")
    if 'hreflang="pt-BR"' not in text:
        link = f'<link rel="alternate" hreflang="pt-BR" href="{BASE}/pt/products/food-ingredients/{slug}.html">'
        text = text.replace('<link rel="alternate" hreflang="x-default"', link + '<link rel="alternate" hreflang="x-default"', 1)
        path.write_text(text, encoding="utf-8")


def update_listing() -> None:
    path = ROOT / "pt" / "products" / "food-ingredients.html"
    text = path.read_text(encoding="utf-8")
    additions = {
        '<li data-product="sorbato de cálcio | calcium sorbate"><a href="food-ingredients/calcium-sorbate.html">sorbato de cálcio</a></li>':
            '<li data-product="sorbato de cálcio | calcium sorbate"><a href="food-ingredients/calcium-sorbate.html">sorbato de cálcio</a></li><li data-product="ácido sórbico encapsulado | encapsulated sorbic acid | e200"><a href="food-ingredients/encapsulated-sorbic-acid.html">Ácido sórbico encapsulado</a></li><li data-product="metabissulfito de sódio | dissulfito de sódio | pirossulfito de sódio | sodium metabisulfite | smbs | ins 223"><a href="food-ingredients/sodium-metabisulfite.html">Metabissulfito de sódio</a></li>',
        '<li data-product="vanilina | vanillin"><a href="food-ingredients/vanillin.html">Vanilina</a></li>':
            '<li data-product="vanilina | vanillin"><a href="food-ingredients/vanillin.html">Vanilina</a></li><li data-product="glutamato monossódico | glutamato de sódio | monosodium glutamate | msg | gms | ins 621"><a href="food-ingredients/monosodium-glutamate-msg.html">Glutamato monossódico (MSG)</a></li>',
    }
    for anchor, replacement in additions.items():
        if replacement not in text:
            if anchor not in text:
                raise RuntimeError(f"Listing anchor not found: {anchor}")
            text = text.replace(anchor, replacement, 1)
    text = text.replace('<span>9 materiais</span>', '<span>11 materiais</span>', 1)
    marker = '<article class="pc-family" id="flavors-dairy-powders"'
    before, after = text.split(marker, 1)
    after = after.replace('<span>3 materiais</span>', '<span>4 materiais</span>', 1)
    path.write_text(before + marker + after, encoding="utf-8")


def main() -> None:
    out = ROOT / "pt" / "products" / "food-ingredients"
    for slug, product in PT.items():
        (out / f"{slug}.html").write_text(page(slug, product, SOURCE[slug]), encoding="utf-8")
        add_pt_hreflang(slug)
    update_listing()
    importlib.import_module("build_industry_application_pages").rebuild_sitemap()
    print(f"Built {len(PT)} Portuguese pages, updated listing and sitemap")


if __name__ == "__main__":
    main()

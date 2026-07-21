#!/usr/bin/env python3
"""Post-edit the new pt-BR product and solution pages for terminology and SEO."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import localize_new_pages as localizer


PRODUCTS = {
    "calcium-citrate": "citrato de cálcio",
    "carrageenan": "carragena",
    "dipotassium-phosphate-dkp": "fosfato dipotássico (DKP)",
    "disodium-phosphate-dsp": "fosfato dissódico (DSP)",
    "guar-gum": "goma guar",
    "konjac-gum": "goma konjac",
    "magnesium-carbonate": "carbonato de magnésio",
    "magnesium-citrate": "citrato de magnésio",
    "monopotassium-phosphate-mkp": "fosfato monopotássico (MKP)",
    "potassium-citrate": "citrato de potássio",
    "potassium-metaphosphate-kmp": "metafosfato de potássio (KMP)",
    "potassium-sorbate": "sorbato de potássio",
    "potassium-tripolyphosphate-ktpp": "tripolifosfato de potássio (KTPP)",
    "sodium-acid-pyrophosphate-sapp": "pirofosfato ácido de sódio (SAPP)",
    "sodium-alginate": "alginato de sódio",
    "sodium-citrate": "citrato de sódio",
    "sodium-dihydrogen-phosphate-msp": "fosfato monossódico (MSP)",
    "sodium-propionate": "propionato de sódio",
    "sodium-trimetaphosphate-stmp": "trimetafosfato de sódio (STMP)",
    "tetrasodium-pyrophosphate-tspp": "pirofosfato tetrassódico (TSPP)",
    "tricalcium-phosphate-tcp": "fosfato tricálcico (TCP)",
    "tripotassium-phosphate-tkp": "fosfato tripotássico (TKP)",
    "trisodium-phosphate-tsp": "fosfato trissódico (TSP)",
    "xanthan-gum": "goma xantana",
    "zinc-citrate": "citrato de zinco",
}

SOLUTIONS = {
    "meat-poultry-phosphate-systems": "Soluções de ingredientes para carnes e aves",
    "seafood-phosphate-selection": "Soluções de ingredientes para pescados e frutos do mar",
    "bakery-leavening-phosphate-solutions": "Soluções de ingredientes e formulação para panificação",
    "dairy-cheese-ingredient-solutions": "Soluções de ingredientes para laticínios e queijos",
    "beverage-formulation-ingredient-solutions": "Soluções de ingredientes para formulação de bebidas",
    "prepared-food-sauce-filling-solutions": "Soluções para alimentos preparados, molhos e recheios",
    "poultry-feed-phosphate-qualification": "Soluções de ingredientes para rações de aves",
    "swine-feed-phosphate-selection": "Soluções de ingredientes para rações de suínos",
    "ruminant-mineral-premix-phosphate-systems": "Soluções de ingredientes para alimentação de ruminantes",
    "aquaculture-feed-ingredient-solutions": "Soluções de ingredientes para rações de aquicultura",
    "feed-premix-flow-trace-mineral-compatibility": "Soluções para pré-misturas e rações compostas",
    "laundry-detergent-ingredient-solutions": "Soluções de ingredientes para detergentes de lavanderia",
    "hard-surface-cleaner-ingredient-solutions": "Soluções de ingredientes para limpadores de superfícies duras",
    "industrial-degreaser-formulation-ingredients": "Ingredientes para formulação de desengraxantes industriais",
    "acid-cleaner-descaler-ingredient-solutions": "Soluções de ingredientes para limpadores ácidos e desincrustantes",
    "institutional-cleaning-hygiene-ingredients": "Ingredientes para limpeza institucional e higiene",
    "industrial-plant-cleaning-chemical-systems": "Sistemas químicos para limpeza de plantas industriais",
    "raw-water-clarification-coagulant-solutions": "Soluções coagulantes para clarificação de água bruta",
    "industrial-wastewater-coagulant-selection": "Soluções químicas para tratamento de efluentes industriais",
    "cooling-water-biofouling-control-chemicals": "Produtos químicos para controle de bioincrustação em água de resfriamento",
    "industrial-water-intake-biofouling-control": "Controle de bioincrustação em captações de água industrial",
    "boiler-condensate-neutralizing-amine-solutions": "Soluções de aminas neutralizantes para caldeiras e condensado",
    "process-water-reuse-chemical-solutions": "Soluções químicas para água de processo e reúso",
    "mine-water-treatment-chemical-solutions": "Soluções químicas para tratamento de água de mineração",
    "mineral-leaching-chemical-solutions": "Soluções químicas para lixiviação mineral",
    "mineral-flotation-reagent-solutions": "Soluções de reagentes para flotação mineral",
    "smelting-electrowinning-chemical-inputs": "Insumos químicos para fundição e eletro-obtenção",
    "mineral-refining-processing-chemicals": "Produtos químicos para refino e processamento mineral",
    "fertigation-phosphate-fertilizer-selection": "Soluções de fertilizantes fosfatados para fertirrigação",
    "foliar-phosphorus-potassium-solutions": "Soluções foliares de fósforo e potássio",
    "water-soluble-fertilizer-raw-material-qualification": "Ingredientes para fertilizantes solúveis em água",
    "greenhouse-fertilizer-stock-tank-compatibility": "Soluções nutritivas para cultivo sem solo",
    "compound-fertilizer-phosphate-raw-materials": "Matérias-primas fosfatadas para fertilizantes compostos",
    "specialty-crop-fertilizer-programs": "Programas de fertilização para culturas especiais",
}

SEO_SHORT = {
    "Soluções de ingredientes para limpadores de superfícies duras":
        "Ingredientes para limpadores de superfícies duras",
    "Soluções de ingredientes para limpadores ácidos e desincrustantes":
        "Ingredientes para limpadores ácidos e desincrustantes",
    "Produtos químicos para controle de bioincrustação em água de resfriamento":
        "Controle de bioincrustação em água de resfriamento",
    "Soluções de aminas neutralizantes para caldeiras e condensado":
        "Aminas neutralizantes para caldeiras e condensado",
}

REPLACEMENTS = [
    ("Fertigation Systems", "Sistemas de fertirrigação"),
    ("Foliar Nutrition", "Nutrição foliar"),
    ("Soilless Cultivation", "Cultivo sem solo"),
    ("Specialty Crop Programs", "Programas para culturas especiais"),
    ("Premix & Composto", "Pré-misturas e rações compostas"),
    ("Alimentação da aquicultura", "Rações para aquicultura"),
    ("Transformação de frutos do mar", "Processamento de pescados e frutos do mar"),
    ("Bakery", "Panificação"),
    ("Queijo Laticínios &", "Laticínios e queijos"),
    ("Beverages", "Bebidas"),
    ("Prepared Foods", "Alimentos preparados"),
    ("Laundry Detergents", "Detergentes para lavanderia"),
    ("Hard-Surface Cleaners", "Limpadores de superfícies duras"),
    ("Degreasers", "Desengraxantes"),
    ("Acid Cleaners & Descalers", "Limpadores ácidos e desincrustantes"),
    ("Institutional Hygiene", "Limpeza institucional e higiene"),
    ("Leaching", "Lixiviação"),
    ("Smelting & Electrowinning", "Fundição e eletro-obtenção"),
    ("Refinando o Processamento do &", "Refino e processamento"),
    ("Sistemas de refrigeração-Água", "Sistemas de água de resfriamento"),
    ("A água capta circuitos &", "Captações e circuitos de água"),
    ("Boiler & Steam Systems", "Sistemas de caldeira e vapor"),
    ("Reutilização do & de Água de Processo", "Água de processo e reúso"),
    ("Read Industrial Water-Intake Biofouling Control", "Leia sobre controle de bioincrustação em captações de água industrial"),
    ("Leia Foliar Phosphorus & Potássio Solutions", "Leia sobre soluções foliares de fósforo e potássio"),
    ("Soluções de Ingrediente Acid Cleaner & Descaler", "Soluções de ingredientes para limpadores ácidos e desincrustantes"),
    ("Leia Soluções de Ingrediente Hard-Surface Cleaner", "Leia sobre ingredientes para limpadores de superfícies duras"),
    ("Leia Ingredientes de Formulação Industrial Degreaser", "Leia sobre ingredientes para desengraxantes industriais"),
    ("Leia Smelling & Electrowinning Chemical Inputs", "Leia sobre insumos químicos para fundição e eletro-obtenção"),
    ("01 / FERTIGATION", "01 / FERTIRRIGAÇÃO"),
    ("04 / SOILLESS", "04 / CULTIVO SEM SOLO"),
    ("06 / SPECIALTY", "06 / CULTURAS ESPECIAIS"),
    ("03 / BAKERY", "03 / PANIFICAÇÃO"),
    ("05 / BEVERAGE", "05 / BEBIDAS"),
    ("01 / LAUNDRY", "01 / LAVANDERIA"),
    ("02 / HARD SURFACES", "02 / SUPERFÍCIES DURAS"),
    ("03 / DEGREASING", "03 / DESENGRAXE"),
    ("04 / DESCALING", "04 / DESINCRUSTAÇÃO"),
    ("05 / INSTITUTIONAL", "05 / INSTITUCIONAL"),
    ("02 / EXTRACTION", "02 / EXTRAÇÃO"),
    ("03 / SEPARATION", "03 / SEPARAÇÃO"),
    ("04 / METALLURGY", "04 / METALURGIA"),
    ("05 / FINISHING", "05 / ACABAMENTO"),
    ("01 / ÁGUA RAW", "01 / ÁGUA BRUTA"),
    ("02 / WASTEWATER", "02 / EFLUENTES"),
    ("03 / COOLING", "03 / RESFRIAMENTO"),
    ("04 / INTAKES", "04 / CAPTAÇÕES"),
    ("05 / BOILER", "05 / CALDEIRA"),
    ("3 Treatment Pathways", "3 rotas de tratamento"),
    ("Three Treatment Pathways, Three Different Decisions", "Três rotas de tratamento, três decisões diferentes"),
    ("Functional treatment map", "Mapa funcional de tratamento"),
    ("Crop & stage:", "Cultura e estágio:"),
    ("Surface:", "Superfície:"),
    ("conservas, minas de alimentação", "conservantes, minerais para rações"),
    ("desempinho de processamento", "desempenho de processamento"),
    ("China-based ingrediente e fornecedor químico", "Fornecedor de ingredientes e produtos químicos sediado na China"),
    ("Soluções de Ingrediente Acid Cleaner & Descaler", "Soluções de ingredientes para limpadores ácidos e desincrustantes"),
    ("Fertirrigação Phosphate Fertilizer Solutions", "Soluções de fertilizantes fosfatados para fertirrigação"),
    ("Foliar Phosphorus & Potássio Solutions", "Soluções foliares de fósforo e potássio"),
    ("Lista de resumos funcionais", "Resumo funcional"),
    ("O que cada candidato contribui — e o que deve ser desafiado", "O que cada opção oferece — e o que precisa ser validado"),
    ("A tabela conecta produtos a uma hipótese funcional. É um mapa de triagem, não uma fórmula ou uma permissão implícita para usar cada material listado.",
     "A tabela relaciona cada produto a uma hipótese funcional. Ela serve para a triagem inicial, não como fórmula nem como autorização implícita de uso."),
    ("Razão para a avaliar", "Por que avaliar"),
    ("Pergunta que o julgamento deve responder", "Pergunta que o teste deve responder"),
    ("Converta a hipótese técnica em evidência repetitiva", "Converta a hipótese técnica em evidências reproduzíveis"),
    ("Diagnose do mecanismo", "Diagnostique o mecanismo"),
    ("Desenhar a comparação", "Planeje a comparação"),
    ("Desafie o resultado", "Teste os limites do resultado"),
    ("Congelar o grau aprovado", "Formalize o grau aprovado"),
    ("Plano de provas", "Plano de validação"),
    ("Medir os resultados que decidem a aprovação", "Meça os resultados que determinam a aprovação"),
    ("Usar amostragem definida, controles e replicação.", "Use amostragem definida, controles e replicação."),
    ("RFQ construído para esta aplicação", "Solicitação de cotação orientada à aplicação"),
    ("Faça perguntas aos fornecedores que afetam o julgamento", "Faça aos fornecedores as perguntas que sustentam a decisão"),
    ("Controles de abastecimento exactos", "Controles precisos de fornecimento"),
    ("Pedido de identidade, grau, ensaio, impurezas críticas, forma física, especificação, COA recente, TDS, SDS e declarações relevantes.",
     "Solicite identidade, grau, teor, impurezas críticas, forma física, especificação, COA recente, TDS, SDS e declarações pertinentes."),
    ("Resenha editorial:", "Revisão editorial:"),
    ("Perguntas de pesquisa respondidas", "Perguntas frequentes"),
    ("Recursos conexos", "Recursos relacionados"),
    ("Continuar para o portfólio de produtos", "Consulte o portfólio de produtos"),
    ("Use páginas de produto para identidade e especificação, e a página do setor para o mapa de aplicação mais amplo.",
     "Consulte as páginas de produto para verificar identidade e especificações, e a página do setor para conhecer outras aplicações."),
    ("Hub da indústria", "Visão geral do setor"),
    ("Voltar para todas as vias de aplicação suportadas.", "Veja todas as aplicações atendidas neste setor."),
    ("Dado relativo ao produto", "Produto relacionado"),
    ("Revisão identidade, especificação e informações de inquérito.", "Consulte a identidade, a especificação e as informações necessárias para cotação."),
    ("Navegue pelo portfólio completo relacionado", "Consulte o portfólio completo relacionado"),
    ("Reveja produtos adicionais e prepare um inquérito focado.", "Consulte outros produtos e prepare uma solicitação de cotação objetiva."),
    ("Inquérito técnico e comercial", "Consulta técnica e comercial"),
    ("Compartilhe os dados por trás do seu alvo de aplicação.", "Compartilhe os dados que definem sua aplicação."),
    ("Incluir o processo, problema atual, mercado alvo, volume de teste, demanda anual e documentos necessários.",
     "Inclua o processo, o problema atual, o mercado-alvo, o volume de teste, a demanda anual e os documentos necessários."),
    ("Prepare seu RFQ", "Prepare sua solicitação de cotação"),
    ("plano de provas", "plano de validação"),
    ("nível de utilização final", "nível de uso final"),
    ("a qualidade exata", "o grau exato"),
    ("estado legal", "situação regulatória"),
    ("requerente de conservante para um pedido autorizado de géneros alimentícios ou alimentos para animais",
     "conservante candidato para uma aplicação autorizada em alimentos ou rações"),
    ("Que base de ensaio, matriz de digestibilidade, grau físico e fórmula em fase animal estão a ser aprovados?",
     "Quais teor, matriz de digestibilidade, forma física e fórmula por fase animal serão aprovados?"),
    ("entrada de nutrientes, tampão ou alimentação funcional", "fonte de nutrientes, agente tamponante ou aditivo funcional"),
    ("compatibilidade de pré-mix", "compatibilidade da pré-mistura"),
    ("estado regulamentar", "situação regulatória"),
    ("forma física e provas de teste", "forma física e resultados de ensaios"),
    ("uso legal", "uso autorizado"),
    ("Quando é que", "Quando"),
    ("Soluções de Ingrediente de Alimentação de Aquicultura", "Soluções de ingredientes para rações aquícolas"),
    ("alimentação de peixes e camarão aminoácidos e ingredientes minerais", "aminoácidos e ingredientes minerais para rações de peixes e camarões"),
    ("peixes e camarões ração aminoácidos e ingredientes minerais", "aminoácidos e ingredientes minerais para rações de peixes e camarões"),
    ("peixes e camarões alimentam aminoácidos e ingredientes minerais", "aminoácidos e ingredientes minerais para rações de peixes e camarões"),
    ("formulação completa da alimentação", "formulação completa da ração"),
    ("o ensaio seco sozinho", "a análise em base seca, isoladamente"),
    ("todas as fases do viveiro, plantador-terminador e porca", "todas as fases de creche, crescimento, terminação e matrizes"),
    ("todas as fases de berçário, plantador-terminador e porca", "todas as fases de creche, crescimento, terminação e matrizes"),
    ("acidificadores de alimentação de suínos de berçário aminoácidos e fontes de fosfato",
     "acidificantes, aminoácidos e fontes de fosfato para rações de leitões"),
    ("ácido cítrico e o fumo", "ácido cítrico e o ácido fumárico"),
    ("não só o fósforo total", "não apenas do fósforo total"),
    ("resultados publicados não são um resultado agrícola garantido", "resultados publicados não garantem o desempenho zootécnico"),
    ("Feed, food, cleaning, water treatment, mining and agricultural raw material solutions for international B2B supply.",
     "Soluções em matérias-primas para alimentos, nutrição animal, limpeza, tratamento de água, mineração e agricultura no mercado B2B internacional."),
    ("Alimentos, alimentos para animais, limpeza, tratamento de água, mineração e soluções de matérias-primas agrícolas para o fornecimento internacional de B2B.",
     "Soluções em matérias-primas para alimentos, nutrição animal, limpeza, tratamento de água, mineração e agricultura no mercado B2B internacional."),
    ("Beberp Chemical", "Bespring Chemical"),
    ("Comida qualidade Xantan Gum", "Goma xantana grau alimentício"),
    ("Comida grau Konjac Gum", "Goma konjac grau alimentício"),
    ("Gum Xanthan", "goma xantana"),
    ("Xanthan Gum", "goma xantana"),
    ("Xantan Gum", "goma xantana"),
    ("Gum Xantan", "goma xantana"),
    ("Konjac Gum", "goma konjac"),
    ("Guar Gum", "goma guar"),
    ("Gum Guar", "goma guar"),
    ("Sodium CMC", "CMC de sódio"),
    ("Sodium Citrate", "citrato de sódio"),
    ("Potassium Citrate", "citrato de potássio"),
    ("Calcium Citrate", "citrato de cálcio"),
    ("Magnesium Citrate", "citrato de magnésio"),
    ("Zinc Citrate", "citrato de zinco"),
    ("Sodium Propionate", "propionato de sódio"),
    ("Potassium Sorbate", "sorbato de potássio"),
    ("Sodium Dihydrogen Phosphate (MSP)", "fosfato monossódico (MSP)"),
    ("Disodium Phosphate (DSP)", "fosfato dissódico (DSP)"),
    ("Trisodium Phosphate (TSP)", "fosfato trissódico (TSP)"),
    ("Tripotassium Phosphate (TKP)", "fosfato tripotássico (TKP)"),
    ("Dipotassium Phosphate (Anhydrous)", "fosfato dipotássico anidro"),
    ("Monopotassium Phosphate (Anhydrous)", "fosfato monopotássico anidro"),
    ("Potassium Tripolyphosphate (KTPP)", "tripolifosfato de potássio (KTPP)"),
    ("Potassium Metaphosphate (KMP)", "metafosfato de potássio (KMP)"),
    ("Sodium Trimetaphosphate (STMP)", "trimetafosfato de sódio (STMP)"),
    ("Grau alimentício Sodium Hexameta phosphate", "Hexametafosfato de sódio grau alimentício"),
    ("Calcium fortification", "Fortificação com cálcio"),
    ("Mineral fortification", "Fortificação mineral"),
    ("Buffering e contribuição mineral", "Tamponamento e aporte mineral"),
    ("fonte de nutrientes mineral ou solúvel com uma contribuição distinta contra-íon",
     "fonte de nutriente mineral ou solúvel com contribuição específica do contraíon"),
    ("um inquérito útil", "uma solicitação técnica bem estruturada"),
    ("Um inquérito útil", "Uma solicitação técnica bem estruturada"),
    ("evidência pretendida", "evidências necessárias"),
    ("elementos de prova pretendidos", "evidências necessárias"),
    ("não só solicitar", "não apenas solicitar"),
    ("Não se trata de campos genéricos", "Estes não são campos genéricos"),
    ("Relatar este resultado", "Registre este resultado"),
    ("Relate este resultado", "Registre este resultado"),
    ("em condições iguais", "sob condições equivalentes"),
    ("em condições combinadas", "sob condições equivalentes"),
    ("Construa o controle em torno da decisão real", "Estruture o ensaio de controle em torno da decisão real"),
    ("controle mineral", "equilíbrio mineral"),
    ("Controlo mineral", "Equilíbrio mineral"),
    ("controlo", "controle"),
    ("Controlo", "Controle"),
    ("seleccionad", "selecionad"),
    ("afectam", "afetam"),
    ("afecta", "afeta"),
    ("equipa", "equipe"),
    ("objectivo", "objetivo"),
    ("factores", "fatores"),
    ("contacto", "contato"),
    ("optimiza", "otimiza"),
    ("Especificação note", "Observação sobre a especificação"),
    ("especificação note", "observação sobre a especificação"),
    ("COA lote", "COA do lote"),
    ("anticulação", "função antiaglomerante"),
    ("inflamados", "após calcinação"),
    ("contrato e contrato", "contrato e requisitos aplicáveis"),
    ("emulsificante-sal", "sais emulsificantes"),
    ("brothers", "espumantes"),
    ("frother", "espumante"),
    ("frothers", "espumantes"),
    ("local-água", "água do local"),
    ("Mine-Water", "água de mineração"),
    ("Leaching", "lixiviação"),
    ("Supplier", "Fornecedor"),
    (" □ ", " — "),
    ("Sistemas buffer", "Sistemas de tamponamento"),
    ("pH-buffer usa", "usos como regulador de pH"),
    ("buffer de rúmen", "tamponamento ruminal"),
    ("buffer necessidades", "necessidades de tamponamento"),
    ("Calcium propionate", "propionato de cálcio"),
    ("Calcium", "Cálcio"),
    ("Citric acid", "ácido cítrico"),
    ("L-Lysine", "L-lisina"),
    ("L-Threonine", "L-treonina"),
    ("L-Valine", "L-valina"),
    ("Betaine", "betaína"),
    ("Gum arábica", "goma arábica"),
    ("No. Compare", "Não. Compare"),
    ("a evidências necessárias", "as evidências necessárias"),
    ("os evidências necessárias", "as evidências necessárias"),
    ("qualidade alimentar", "grau alimentício"),
    ("grau alimentar", "grau alimentício"),
    ("sistema sais emulsificantes", "sistema de sais emulsificantes"),
    ("sistemas emulsionantes-sal", "sistemas de sais emulsificantes"),
    ("uma função função antiaglomerante", "uma função antiaglomerante"),
    ("um função antiaglomerante", "uma função antiaglomerante"),
    ("misturas na concentração de solução combinada", "misturas com a mesma concentração de solução"),
    ("relação marisco-solução", "relação entre pescado e solução"),
    ("não absorver sozinho", "não apenas a absorção"),
    ("As unidades são retidas da folha fornecida", "As unidades foram mantidas conforme a ficha fornecida"),
    ("sistemas de padaria seca", "misturas secas de panificação"),
    ("Localização de evidência recomendada", "Caminho de validação recomendado"),
    ("comportamento flutuador ou dissipador", "comportamento de flutuação ou afundamento"),
    ("flutuação ou comportamento de dissipador", "comportamento de flutuação ou afundamento"),
    ("mineral de baixo tamanho", "fonte mineral com granulometria inadequada"),
    ("mineral-fonte", "fonte mineral"),
    ("aquafeed", "rações aquícolas"),
    ("alimentar moinhos", "fábricas de ração"),
    ("ração de camada", "ração para poedeiras"),
    ("dietas de criadores", "dietas de matrizes"),
    ("ovos-shell endpoints", "indicadores de qualidade da casca dos ovos"),
    ("Pellet Durabilidade, ingestão e controle de resultados de alimentação",
     "Durabilidade dos pellets, consumo e desempenho zootécnico"),
    ("refinação mineral", "refino mineral"),
    ("transformação a jusante", "processamento posterior"),
    ("todos afetam", "afetam"),
    ("uma pellet", "um pellet"),
    ("um fonte mineral", "uma fonte mineral"),
    ("uniformidade mistura", "uniformidade da mistura"),
    ("resultados de alimentação controlados", "resultados de ensaios de alimentação controlados"),
    (
        "Repita o líder nos extremos realistas que importam para os formuladores de rações aquícolas "
        "balanceamento densidade de nutrientes, desempenho de extrusão e estabilidade de água.",
        "Repita a melhor opção nas condições extremas relevantes para formuladores de rações aquícolas "
        "que equilibram densidade nutricional, desempenho de extrusão e estabilidade em água.",
    ),
    (
        "resultados são comunicados em estado inalterado, secos ou após calcinação",
        "resultados são informados tal como recebidos, em base seca ou após calcinação",
    ),
    (
        "Para os ingredientes de pré-mistura mineral de bovinos leiteiros e tamponamento ruminal, "
        "a primeira questão é como forragem, água, ingestão de matéria seca e mudança de carga "
        "concentrado fosfato, sal, vestígios-minerais e necessidades de tamponamento.",
        "Para pré-misturas minerais e sistemas de tamponamento ruminal, a primeira questão é como "
        "a forragem, a água, o consumo de matéria seca e a proporção de concentrado alteram as "
        "necessidades de fosfato, sal, microminerais e agentes tamponantes.",
    ),
    (
        "Recalcular a dieta completa, verificar a documentação da fonte e misturar uniformidade, "
        "em seguida, seguir a qualidade do pellet, ingestão, desempenho e ossos ou indicadores de "
        "qualidade da casca dos ovos aprovados pela equipe de nutrição. Repita o líder nos extremos "
        "realistas que importam para fábricas de ração e nutricionistas ingredientes qualificados "
        "para frangos de corte, camada ou dietas de matrizes.",
        "Recalcule a dieta completa, verifique a documentação da fonte e a uniformidade da mistura. "
        "Depois, acompanhe a qualidade dos pellets, o consumo, o desempenho e os indicadores ósseos "
        "ou de qualidade da casca dos ovos definidos pela equipe de nutrição. Repita o melhor ensaio "
        "nas condições extremas relevantes para fábricas de ração e nutricionistas que qualificam "
        "ingredientes para frangos de corte, poedeiras ou matrizes.",
    ),
]


def polish(value: str) -> str:
    for old, new in REPLACEMENTS:
        value = value.replace(old, new)
    return value


def polish_json(value):
    if isinstance(value, dict):
        return {key: polish_json(item) for key, item in value.items()}
    if isinstance(value, list):
        return [polish_json(item) for item in value]
    if isinstance(value, str) and not value.startswith(("http://", "https://")):
        return polish(value)
    return value


def translate_schema_from_source(source, current, mapping, parent_key=None):
    """Apply cached pt-BR translations to schema text while retaining localized URLs."""
    if isinstance(source, dict) and isinstance(current, dict):
        return {
            key: translate_schema_from_source(source.get(key), value, mapping, key)
            for key, value in current.items()
        }
    if isinstance(source, list) and isinstance(current, list):
        return [
            translate_schema_from_source(source[index] if index < len(source) else None, value, mapping, parent_key)
            for index, value in enumerate(current)
        ]
    if isinstance(source, str) and isinstance(current, str):
        if source.startswith(("http://", "https://")) or parent_key == "inLanguage":
            return current
        if parent_key in localizer.JSON_TEXT_KEYS | {"text"}:
            return mapping.get(localizer.clean_source(source), current)
        return source
    return current


def set_metadata(doc, title: str, description: str):
    title_node = doc.xpath("//title")
    if title_node:
        title_node[0].text = title
    for node in doc.xpath("//meta[@name='description' or @property='og:description' or @name='twitter:description']"):
        node.set("content", description)
    for node in doc.xpath("//meta[@property='og:title' or @name='twitter:title']"):
        node.set("content", title.split(" | ", 1)[0])


def polish_hub(path: Path):
    doc = html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))
    for node in doc.iter():
        if not isinstance(node.tag, str) or node.tag.lower() in {"style", "code", "pre", "script"}:
            continue
        if node.text:
            node.text = polish(node.text)
        if node.tail:
            node.tail = polish(node.tail)
        for attr in ("alt", "title", "aria-label", "placeholder"):
            if node.get(attr):
                node.set(attr, polish(node.get(attr)))
    path.write_text(
        html.tostring(doc.getroot(), encoding="unicode", method="html", doctype="<!DOCTYPE html>"),
        encoding="utf-8",
        newline="\n",
    )


def process(path: Path, display_name: str, kind: str):
    doc = html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))
    source_path = ROOT / path.relative_to(ROOT / "pt")
    source_doc = html.parse(str(source_path), parser=html.HTMLParser(encoding="utf-8"))
    mapping = localizer.load_cache()["pt"]
    source_schemas = source_doc.xpath("//script[@type='application/ld+json']")
    current_schemas = doc.xpath("//script[@type='application/ld+json']")
    for source_node, current_node in zip(source_schemas, current_schemas):
        if source_node.text and current_node.text:
            source_data = json.loads(source_node.text)
            current_data = json.loads(current_node.text)
            translated = translate_schema_from_source(source_data, current_data, mapping)
            current_node.text = json.dumps(polish_json(translated), ensure_ascii=False, separators=(",", ":"))
    for node in doc.iter():
        if not isinstance(node.tag, str):
            continue
        if node.tag.lower() in {"style", "code", "pre"}:
            continue
        if node.tag.lower() == "script":
            if node.get("type") == "application/ld+json" and node.text:
                node.text = json.dumps(polish_json(json.loads(node.text)), ensure_ascii=False, separators=(",", ":"))
            continue
        if node.text:
            node.text = polish(node.text)
        if node.tail:
            node.tail = polish(node.tail)
        for attr in ("alt", "title", "aria-label", "placeholder"):
            if node.get(attr):
                node.set(attr, polish(node.get(attr)))
        if node.tag.lower() == "meta" and node.get("content"):
            node.set("content", polish(node.get("content")))

    h1 = doc.xpath("//h1")
    if h1:
        h1[0].text = display_name[0].upper() + display_name[1:]
    if kind == "product":
        title = f"Fornecedor de {display_name} grau alimentício | Bespring"
        description = (
            f"Consulte especificações, aplicações, embalagem, pedido mínimo e documentação "
            f"do {display_name} grau alimentício fornecido pela Bespring Chemical."
        )
    else:
        seo_name = SEO_SHORT.get(display_name, display_name)
        title = f"{seo_name} | Guia técnico | Bespring"
        description = (
            f"Guia técnico sobre {display_name.lower()}: compare funções dos produtos, riscos "
            f"de aplicação, validação, conformidade e dados necessários para cotação."
        )
        description = localizer.shorten_at_word(description, 180)
    set_metadata(doc, title, description)
    path.write_text(
        html.tostring(doc.getroot(), encoding="unicode", method="html", doctype="<!DOCTYPE html>"),
        encoding="utf-8",
        newline="\n",
    )


def main():
    for slug, name in PRODUCTS.items():
        process(ROOT / "pt" / "products" / "food-ingredients" / f"{slug}.html", name, "product")
    for slug, name in SOLUTIONS.items():
        process(ROOT / "pt" / "solutions" / f"{slug}.html", name, "solution")
    for filename in (
        "agriculture-solutions.html", "animal-nutrition-solutions.html",
        "food-industry-solutions.html", "industrial-cleaning-solutions.html",
        "mining-solutions.html", "water-treatment-solutions.html",
    ):
        polish_hub(ROOT / "pt" / "solutions" / filename)
    print(f"Polished {len(PRODUCTS)} product pages and {len(SOLUTIONS)} solution pages in pt-BR.")


if __name__ == "__main__":
    main()

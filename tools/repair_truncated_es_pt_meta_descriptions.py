#!/usr/bin/env python3
"""Repair truncated ES/PT-BR solution meta descriptions by page intent only."""
from pathlib import Path
import html
import re

ROOT = Path(__file__).resolve().parents[1]

ES = {
"acid-cleaner-descaler-ingredient-solutions.html": "Ingredientes para limpiadores ácidos y desincrustantes: compare funciones, riesgos, compatibilidad y datos para solicitar una evaluación técnica.",
"aquaculture-feed-ingredient-solutions.html": "Ingredientes para piensos acuícolas: compare funciones, estabilidad, cumplimiento y datos necesarios para solicitar una cotización técnica.",
"boiler-condensate-neutralizing-amine-solutions.html": "Aminas neutralizantes para calderas y condensado: compare selección, control de pH, riesgos y datos para evaluar un programa de tratamiento.",
"cooling-water-biofouling-control-chemicals.html": "Control de bioincrustaciones en agua de refrigeración: compare opciones químicas, validación y datos para evaluar un programa adecuado.",
"dairy-cheese-ingredient-solutions.html": "Ingredientes para lácteos y quesos: compare funciones, proceso, cumplimiento y datos necesarios para seleccionar una solución adecuada.",
"hard-surface-cleaner-ingredient-solutions.html": "Ingredientes para limpiadores de superficies duras: compare funciones, compatibilidad y datos para solicitar una evaluación de formulación.",
"industrial-wastewater-coagulant-selection.html": "Coagulantes para aguas residuales industriales: compare química del agua, pruebas de jarras y datos para seleccionar el tratamiento adecuado.",
"industrial-plant-cleaning-chemical-systems.html": "Sistemas químicos para limpieza industrial: compare suciedad, materiales, seguridad y datos necesarios para definir un programa de limpieza.",
"institutional-cleaning-hygiene-ingredients.html": "Ingredientes para limpieza institucional e higiene: compare función, eficacia, cumplimiento y datos para seleccionar un sistema adecuado.",
"industrial-water-intake-biofouling-control.html": "Control de bioincrustaciones en captaciones industriales: compare opciones químicas, validación y datos para evaluar un programa adecuado.",
"mineral-leaching-chemical-solutions.html": "Productos químicos para lixiviación de minerales: compare mineralogía, proceso, seguridad y datos para evaluar una ruta técnica adecuada.",
"mineral-refining-processing-chemicals.html": "Productos químicos para refinación de minerales: compare función, pureza, proceso y datos para solicitar una evaluación técnica.",
"poultry-feed-phosphate-qualification.html": "Fosfatos para piensos avícolas: compare composición, biodisponibilidad, calidad y datos para calificar una fuente de suministro.",
"prepared-food-sauce-filling-solutions.html": "Ingredientes para alimentos preparados, salsas y rellenos: compare función, proceso y datos para seleccionar una solución de formulación.",
"seafood-phosphate-selection.html": "Fosfatos para pescados y mariscos: compare función, proceso, límites de uso y datos para seleccionar el sistema adecuado.",
"smelting-electrowinning-chemical-inputs.html": "Insumos químicos para fundición y electroobtención: compare función, pureza, seguridad y datos para preparar una solicitud técnica.",
"specialty-crop-fertilizer-programs.html": "Fertilización de cultivos especiales: compare nutrientes, calidad del agua y datos agronómicos para evaluar un programa adecuado.",
"swine-feed-phosphate-selection.html": "Fosfatos para piensos porcinos: compare composición, biodisponibilidad, calidad y datos para calificar una fuente de suministro.",
}

PT = {
"bakery-leavening-phosphate-solutions.html": "Ingredientes para panificação: compare sistemas de fermentação química, desempenho, conformidade e dados para avaliar a formulação adequada.",
"compound-fertilizer-phosphate-raw-materials.html": "Matérias-primas fosfatadas para fertilizantes compostos: compare nutrientes, granulometria e dados para qualificar a opção adequada.",
"fertigation-phosphate-fertilizer-selection.html": "Fosfatos para fertirrigação: compare solubilidade, qualidade da água, compatibilidade e dados para selecionar a opção adequada.",
"industrial-degreaser-formulation-ingredients.html": "Ingredientes para desengraxantes industriais: compare função, compatibilidade, segurança e dados para avaliar a formulação adequada.",
"industrial-plant-cleaning-chemical-systems.html": "Sistemas químicos para limpeza industrial: compare sujidade, materiais, segurança e dados necessários para definir o programa adequado.",
"industrial-wastewater-coagulant-selection.html": "Coagulantes para efluentes industriais: compare a química da água, testes de jarro e dados para selecionar o tratamento adequado.",
"industrial-water-intake-biofouling-control.html": "Controle de bioincrustação em captações industriais: compare opções químicas, validação e dados para avaliar o programa adequado.",
"laundry-detergent-ingredient-solutions.html": "Ingredientes para detergentes de lavanderia: compare função, compatibilidade, desempenho e dados para avaliar a formulação adequada.",
"mine-water-treatment-chemical-solutions.html": "Produtos químicos para tratamento de água de mineração: compare contaminantes, processo e dados para selecionar a solução adequada.",
"mineral-refining-processing-chemicals.html": "Produtos químicos para refino mineral: compare função, pureza, processo, segurança e dados para solicitar uma avaliação técnica.",
"prepared-food-sauce-filling-solutions.html": "Ingredientes para alimentos preparados, molhos e recheios: compare função, processo e dados para selecionar a formulação adequada.",
"raw-water-clarification-coagulant-solutions.html": "Coagulantes para clarificação de água bruta: compare turbidez, testes de jarro e dados para selecionar o tratamento adequado.",
"ruminant-mineral-premix-phosphate-systems.html": "Fosfatos para premixes minerais de ruminantes: compare composição, qualidade e dados para qualificar a fonte de fornecimento.",
"seafood-phosphate-selection.html": "Fosfatos para pescados e frutos do mar: compare função, processo, limites de uso e dados para selecionar o sistema adequado.",
}

def update(language: str, mapping: dict[str, str]) -> int:
    changed = 0
    base = ROOT / language / "solutions"
    for filename, description in mapping.items():
        path = base / filename
        raw = path.read_text(encoding="utf-8")
        escaped = html.escape(description, quote=True)
        out, count = re.subn(
            r'(<meta name="description" content=")[^"]*(")',
            lambda m: m.group(1) + escaped + m.group(2), raw, count=1,
        )
        if count != 1:
            raise RuntimeError(f"Missing unique meta description: {path}")
        if out != raw:
            path.write_text(out, encoding="utf-8", newline="")
            changed += 1
    return changed

def main() -> None:
    es = update("es", ES)
    print(f"Spanish repaired: {es}")
    pt = update("pt", PT)
    print(f"Portuguese repaired: {pt}")

if __name__ == "__main__":
    main()

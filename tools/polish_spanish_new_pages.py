#!/usr/bin/env python3
"""Post-edit the newly localized Spanish product and solution pages."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import localize_new_pages as localizer


PRODUCTS = {
    "calcium-citrate": "citrato de calcio",
    "carrageenan": "carragenina",
    "dipotassium-phosphate-dkp": "fosfato dipotásico (DKP)",
    "disodium-phosphate-dsp": "fosfato disódico (DSP)",
    "guar-gum": "goma guar",
    "konjac-gum": "goma konjac",
    "magnesium-carbonate": "carbonato de magnesio",
    "magnesium-citrate": "citrato de magnesio",
    "monopotassium-phosphate-mkp": "fosfato monopotásico (MKP)",
    "potassium-citrate": "citrato de potasio",
    "potassium-metaphosphate-kmp": "metafosfato de potasio (KMP)",
    "potassium-sorbate": "sorbato de potasio",
    "potassium-tripolyphosphate-ktpp": "tripolifosfato de potasio (KTPP)",
    "sodium-acid-pyrophosphate-sapp": "pirofosfato ácido de sodio (SAPP)",
    "sodium-alginate": "alginato de sodio",
    "sodium-citrate": "citrato de sodio",
    "sodium-dihydrogen-phosphate-msp": "fosfato monosódico (MSP)",
    "sodium-propionate": "propionato de sodio",
    "sodium-trimetaphosphate-stmp": "trimetafosfato de sodio (STMP)",
    "tetrasodium-pyrophosphate-tspp": "pirofosfato tetrasódico (TSPP)",
    "tricalcium-phosphate-tcp": "fosfato tricálcico (TCP)",
    "tripotassium-phosphate-tkp": "fosfato tripotásico (TKP)",
    "trisodium-phosphate-tsp": "fosfato trisódico (TSP)",
    "xanthan-gum": "goma xantana",
    "zinc-citrate": "citrato de zinc",
}

SOLUTIONS = {
    "meat-poultry-phosphate-systems": "Soluciones de ingredientes para carnes y aves",
    "seafood-phosphate-selection": "Soluciones de ingredientes para pescados y mariscos",
    "bakery-leavening-phosphate-solutions": "Soluciones de ingredientes para panificación",
    "dairy-cheese-ingredient-solutions": "Soluciones de ingredientes para lácteos y quesos",
    "beverage-formulation-ingredient-solutions": "Soluciones de ingredientes para bebidas",
    "prepared-food-sauce-filling-solutions": "Soluciones para alimentos preparados, salsas y rellenos",
    "poultry-feed-phosphate-qualification": "Soluciones de ingredientes para piensos avícolas",
    "swine-feed-phosphate-selection": "Soluciones de ingredientes para piensos porcinos",
    "ruminant-mineral-premix-phosphate-systems": "Soluciones de ingredientes para alimentación de rumiantes",
    "aquaculture-feed-ingredient-solutions": "Soluciones de ingredientes para piensos acuícolas",
    "feed-premix-flow-trace-mineral-compatibility": "Soluciones para premezclas y piensos compuestos",
    "laundry-detergent-ingredient-solutions": "Ingredientes para detergentes de lavandería",
    "hard-surface-cleaner-ingredient-solutions": "Ingredientes para limpiadores de superficies duras",
    "industrial-degreaser-formulation-ingredients": "Ingredientes para desengrasantes industriales",
    "acid-cleaner-descaler-ingredient-solutions": "Ingredientes para limpiadores ácidos y desincrustantes",
    "institutional-cleaning-hygiene-ingredients": "Ingredientes para limpieza institucional e higiene",
    "industrial-plant-cleaning-chemical-systems": "Sistemas químicos para limpieza de plantas industriales",
    "raw-water-clarification-coagulant-solutions": "Coagulantes para clarificación de agua bruta",
    "industrial-wastewater-coagulant-selection": "Tratamiento químico de aguas residuales industriales",
    "cooling-water-biofouling-control-chemicals": "Control de bioincrustaciones en agua de refrigeración",
    "industrial-water-intake-biofouling-control": "Control de bioincrustaciones en captaciones de agua industrial",
    "boiler-condensate-neutralizing-amine-solutions": "Aminas neutralizantes para calderas y condensado",
    "process-water-reuse-chemical-solutions": "Soluciones químicas para agua de proceso y reutilización",
    "mine-water-treatment-chemical-solutions": "Tratamiento químico de aguas de mina",
    "mineral-leaching-chemical-solutions": "Soluciones químicas para lixiviación de minerales",
    "mineral-flotation-reagent-solutions": "Reactivos para flotación de minerales",
    "smelting-electrowinning-chemical-inputs": "Insumos químicos para fundición y electroobtención",
    "mineral-refining-processing-chemicals": "Productos químicos para refinado y procesamiento de minerales",
    "fertigation-phosphate-fertilizer-selection": "Fertilizantes fosfatados para fertirrigación",
    "foliar-phosphorus-potassium-solutions": "Soluciones foliares de fósforo y potasio",
    "water-soluble-fertilizer-raw-material-qualification": "Ingredientes para fertilizantes hidrosolubles",
    "greenhouse-fertilizer-stock-tank-compatibility": "Soluciones nutritivas para cultivos sin suelo",
    "compound-fertilizer-phosphate-raw-materials": "Materias primas fosfatadas para fertilizantes compuestos",
    "specialty-crop-fertilizer-programs": "Programas de fertilización para cultivos especiales",
}

SEO_SHORT = {
    "Control de bioincrustaciones en captaciones de agua industrial": "Bioincrustaciones en captaciones de agua",
    "Productos químicos para refinado y procesamiento de minerales": "Químicos para refinado de minerales",
}

REPLACEMENTS = [
    ("Sodium Acid Pyrophosphate", "pirofosfato ácido de sodio"),
    ("Sodium Dihydrogen Phosphate", "fosfato monosódico"),
    ("Potassium Tripolyphosphate", "tripolifosfato de potasio"),
    ("Sodium Trimetaphosphate", "trimetafosfato de sodio"),
    ("Tetrasodium Pyrophosphate", "pirofosfato tetrasódico"),
    ("Monopotassium Phosphate", "fosfato monopotásico"),
    ("Dipotassium Phosphate", "fosfato dipotásico"),
    ("Tripotassium Phosphate", "fosfato tripotásico"),
    ("Disodium Phosphate", "fosfato disódico"),
    ("Trisodium Phosphate", "fosfato trisódico"),
    ("Tricalcium Phosphate", "fosfato tricálcico"),
    ("Potassium Metaphosphate", "metafosfato de potasio"),
    ("Magnesium Carbonate", "carbonato de magnesio"),
    ("Magnesium Citrate", "citrato de magnesio"),
    ("Potassium Citrate", "citrato de potasio"),
    ("Potassium Sorbate", "sorbato de potasio"),
    ("Calcium Citrate", "citrato de calcio"),
    ("Sodium Alginate", "alginato de sodio"),
    ("Sodium Citrate", "citrato de sodio"),
    ("Sodium Propionate", "propionato de sodio"),
    ("Zinc Citrate", "citrato de zinc"),
    ("Carrageenan", "carragenina"),
    ("Food Industry Solutions", "Soluciones para la industria alimentaria"),
    ("Water Treatment Solutions", "Soluciones para el tratamiento de agua"),
    ("Seafood Processing Ingredient Solutions", "Soluciones de ingredientes para pescados y mariscos"),
    ("Bakery Ingredient &amp; Formulation Solutions", "Soluciones de ingredientes para panificación"),
    ("Dairy &amp; Cheese Ingredient Solutions", "Soluciones de ingredientes para lácteos y quesos"),
    ("Beverage Formulation Ingredient Solutions", "Soluciones de ingredientes para bebidas"),
    ("Alimentos preparados, Sauce &amp; Filling Ingredient Solutions", "Soluciones para alimentos preparados, salsas y rellenos"),
    ("Poultry Feed Ingredient Solutions", "Soluciones de ingredientes para piensos avícolas"),
    ("Swine Feed Ingredient Solutions", "Soluciones de ingredientes para piensos porcinos"),
    ("Ruminant Feed Ingredient Solutions", "Soluciones de ingredientes para alimentación de rumiantes"),
    ("Aquaculture Feed Ingredient Solutions", "Soluciones de ingredientes para piensos acuícolas"),
    ("Premix &amp; Compound Feed Ingredient Solutions", "Soluciones para premezclas y piensos compuestos"),
    ("Raw-Water Clarification Coagulant Solutions", "Coagulantes para clarificación de agua bruta"),
    ("Boiler &quot; Condensate Neutralizing Amine Solutions", "Aminas neutralizantes para calderas y condensado"),
    ("Mine-Water Treatment Chemical Solutions", "Tratamiento químico de aguas de mina"),
    ("Mineral Leaching Chemical Solutions", "Soluciones químicas para lixiviación de minerales"),
    ("Mineral Flotation Reagent Solutions", "Reactivos para flotación de minerales"),
    ("Smelting &quot; Electrowinning Chemical Inputs", "Insumos químicos para fundición y electroobtención"),
    ("Foliar Phosphorus &amp; Potassium Solutions", "Soluciones foliares de fósforo y potasio"),
    ("Soilless Cultivation Nutrient Solutions", "Soluciones nutritivas para cultivos sin suelo"),
    ("Brine Pickup and Equalization", "Absorción y distribución uniforme de la salmuera"),
    ("pH, Titratable Acidity And Brix", "pH, acidez titulable y grados Brix"),
    ("Emulsion and Freeze-Thaw Stability", "Estabilidad de la emulsión y frente a congelación-descongelación"),
    ("Flow, Segregation and Feed Conversion Trial Endpoints", "Fluidez, segregación e indicadores de conversión alimenticia"),
    ("Forage and Water Mineral Analysis", "Análisis mineral del forraje y del agua"),
    ("Premix Flow, Caking and Storage Stability", "Fluidez, apelmazamiento y estabilidad de la premezcla durante el almacenamiento"),
    ("Emulsión o comportamiento de Rinse", "Emulsión o comportamiento durante el enjuague"),
    ("Rinse Endpoint, Waste Load and Safe Handling", "Estado final del enjuague, carga residual y manipulación segura"),
    ("Productos, Ore Mineralogy and Process Stage", "Producto, mineralogía de la mena y etapa del proceso"),
    ("Tss, Turbidity and Target Metals", "SST, turbidez y metales objetivo"),
    ("Coverage and Crop Response", "Cobertura y respuesta del cultivo"),
    ("Nutrient Assay and Blend Calculation", "Análisis de nutrientes y cálculo de la mezcla"),
    ("Moisture, Caking and Finished-Blend Stability", "Humedad, apelmazamiento y estabilidad de la mezcla final"),
    ("Nutrient Balance and Assay", "Equilibrio y análisis de nutrientes"),
    ("Moisture, Caking and Finished-Product Strength", "Humedad, apelmazamiento y resistencia del producto final"),
    ("Crop Safety, Yield and Quality Response", "Seguridad del cultivo, rendimiento y respuesta de calidad"),
    ("Select grade and ion system according to gel strength, elasticity and release target.",
     "Seleccione el grado y el sistema iónico según la resistencia del gel, la elasticidad y el objetivo de liberación."),
    ("CAS number", "número CAS"), ("INS number", "número INS"),
    ("Buffering and sequestration", "Regulación del pH y secuestro de iones"),
    ("Buffer Alkaline", "Regulador alcalino"),
    ("INS 340(ii), a less alkaline potassium orthophosphate for selected food systems.",
     "INS 340(ii), un ortofosfato de potasio menos alcalino para determinados sistemas alimentarios."),
    ("Screen protein interactions, buffering and stability while controlling alkalinity and aroma.",
     "Evalúe las interacciones con las proteínas, la capacidad tampón y la estabilidad, controlando al mismo tiempo la alcalinidad y el aroma."),
    ("Anhydrous and dodecahydrate TSP differ substantially in formula weight and loss on drying. State the required form and analysis basis in the purchase specification and formulation calculations.",
     "El TSP anhidro y el dodecahidratado difieren notablemente en peso molecular y pérdida por secado. Indique la forma requerida y la base de análisis en la especificación de compra y en los cálculos de formulación."),
    ("Select starch or gum systems against the actual shear, salt, acid and freeze-thaw cycle.",
     "Seleccione el sistema de almidón o goma considerando la cizalla, la sal, el ácido y el ciclo real de congelación y descongelación."),
    ("Use forraje and water analysiss, balance the total mixed ration, confirm premix uniformity and follow intake, rumen-related indicators and production measures selected by the nutritionist.",
     "Utilice análisis del forraje y del agua, equilibre la ración total mezclada, confirme la uniformidad de la premezcla y controle el consumo, los indicadores ruminales y los parámetros productivos definidos por el nutricionista."),
    ("Surfactants remove and disperse soil; builders and alkalis manage water and pH; blixiviaring agents address oxidizable manchas; sales, polímeros y portaaviones support processing and product form.",
     "Los tensioactivos eliminan y dispersan la suciedad; los coadyuvantes y álcalis controlan el agua y el pH; los agentes blanqueadores actúan sobre manchas oxidables; y las sales, polímeros y vehículos facilitan el proceso y la forma del producto."),
    ("Map sample points, trend pH, conductivity, iron and cobre across operating loads, and confirm feed control, steam use restrictions and local requirements.",
     "Defina los puntos de muestreo, siga la evolución del pH, la conductividad, el hierro y el cobre con distintas cargas operativas, y confirme el control de dosificación, las restricciones de uso del vapor y los requisitos locales."),
    ("Selection considers volatility and distribution, operating pressure, condensate return geometry, metallurgy, feedwater chemistry, monitoring and applicable contact limits.",
     "La selección considera la volatilidad y distribución, la presión de trabajo, la geometría del retorno de condensado, la metalurgia, la química del agua de alimentación, el seguimiento y los límites de contacto aplicables."),
    ("A selection, validation and procurement guide to support clarification, precipitation, pH control, settling and process-water condition at mine sites.",
     "Guía de selección, validación y compra para clarificación, precipitación, control del pH, sedimentación y acondicionamiento del agua de proceso en explotaciones mineras."),
    ("A selection, validation and procurement guide to choose and separate soluble nutrient sources for greenhouse, hydroponic and substrate systems.",
     "Guía de selección, validación y compra de fuentes de nutrientes solubles para invernaderos, hidroponía y sistemas con sustrato."),
    ("Xanthan Gum", "goma xantana"), ("Xanthan gum", "goma xantana"),
    ("Guar Gum", "goma guar"), ("Konjac Gum", "goma konjac"),
    ("grado de comida", "grado alimentario"), ("Grado de comida", "Grado alimentario"),
    ("grado de alimentos", "grado alimentario"), ("Grado de alimentos", "Grado alimentario"),
    ("calidad alimentaria", "grado alimentario"),
    ("hidrocolloide", "hidrocoloide"), ("ácido pyruvic", "ácido pirúvico"),
    ("Jellies", "gelatinas"), ("fórmula monomer", "fórmula del monómero"),
    ("encía xanthan", "goma xantana"), ("Protege goma xantana", "Proteja la goma xantana"),
    ("palet", "palé"), ("paletas", "palés"),
    ("Last reviewed", "Última revisión:"),
    ("Bespring Chemical technical and export team", "equipo técnico y de exportación de Bespring Chemical"),
    ("Inputs that can change this specific decision", "Datos que pueden cambiar esta decisión"),
    ("Estos no son campos genéricos de forma", "Estos no son campos genéricos"),
    ("antes de que los candidatos", "antes de clasificar los candidatos"),
    ("Lo que cada candidato contribuye, y lo que debe ser desafiado", "Qué aporta cada opción y qué debe validarse"),
    ("La tabla conecta los productos a una hipótesis funcional. Es un mapa de selección, no una fórmula o un permiso implícito para utilizar cada material listado.",
     "La tabla relaciona cada producto con una hipótesis funcional. Sirve para la selección inicial, no como fórmula ni como autorización implícita de uso."),
    ("Convertir la hipótesis técnica en evidencia repetible", "Convierta la hipótesis técnica en pruebas reproducibles"),
    ("Diagnosticar el mecanismo", "Diagnostique el mecanismo"),
    ("Diseñe la comparación", "Diseñe la comparación"),
    ("Construir el control alrededor de la decisión real", "Estructure el ensayo de control en torno a la decisión real"),
    ("Reto del resultado", "Compruebe los límites del resultado"),
    ("Repita al líder", "Repita la mejor opción"),
    ("Congelar el grado aprobado", "Formalice el grado aprobado"),
    ("una categoría diferente requiere revisión", "un grado diferente requiere una nueva revisión"),
    ("Medir los resultados que deciden la aprobación", "Mida los resultados que determinan la aprobación"),
    ("Use muestreo definido, controles y replicación.", "Utilice un muestreo definido, controles y réplicas."),
    ("Hacer preguntas a los proveedores que afectan el juicio", "Formule a los proveedores las preguntas que sustentan la decisión"),
    ("una investigación útil", "una solicitud técnica bien estructurada"),
    ("la evidencia prevista", "las pruebas necesarias"),
    ("las pruebas previstas", "las pruebas necesarias"),
    ("no sólo pedir", "no limitarse a pedir"),
    ("Controles de suministro", "Controles de suministro precisos"),
    ("Solicitar identidad, grado, ensayo, impurezas críticas, forma física, especificación, COA reciente, TDS, SDS y declaraciones pertinentes.",
     "Solicite identidad, grado, contenido, impurezas críticas, forma física, especificación, COA reciente, TDS, SDS y declaraciones pertinentes."),
    ("Juicio y entrega", "Ensayo y entrega"),
    ("Revisión editorial:", "Revisión editorial:"),
    ("Preguntas de búsqueda respondidas", "Preguntas frecuentes"),
    ("Continuar con la cartera de productos", "Consulte la cartera de productos"),
    ("Utilice páginas de productos para la identidad y especificación, y la página de la industria para el mapa de aplicación más amplio.",
     "Consulte las páginas de producto para verificar la identidad y las especificaciones, y la página del sector para conocer otras aplicaciones."),
    ("Datos relacionados con el producto", "Producto relacionado"),
    ("Revisar las consideraciones de identidad, especificación, aplicaciones y contratación.",
     "Consulte la identidad, las especificaciones, las aplicaciones y la información necesaria para solicitar una oferta."),
    ("Comparta los datos detrás de su objetivo de aplicación.", "Comparta los datos que definen su aplicación."),
    ("Incluya el proceso, el problema actual, el mercado objetivo, el volumen de prueba, la demanda anual y los documentos necesarios.",
     "Incluya el proceso, el problema actual, el mercado de destino, el volumen de prueba, la demanda anual y los documentos necesarios."),
    ("Alimentación, alimentación, limpieza, tratamiento de agua, minería y soluciones de materia prima agrícola para el suministro internacional de B2B.",
     "Soluciones de materias primas para alimentación humana y animal, limpieza, tratamiento de agua, minería y agricultura en el mercado B2B internacional."),
    ("Enlaces Rapidos", "Enlaces rápidos"),
    ("Language selection", "Selección de idioma"),
    ("CAS / identity", "CAS / identidad"), ("Formulario", "Forma física"),
    ("instantánea de la adquisición", "Resumen para compras"),
    ("Formación alimentaria", "Documentación de grado alimentario"),
    ("Solicitar una cita", "Solicitar una cotización"),
    ("grado de alimentación xanthan gum", "goma xantana de grado alimentario"),
    ("Hidrocolloide", "Hidrocoloide"), ("paléas", "palés"),
    ("Cargando", "Carga de contenedor"),
    ("estado legal", "situación reglamentaria"), ("examen técnico calificado", "revisión técnica cualificada"),
    ("buffer", "agente tampón"), ("Buffer", "Agente tampón"),
    ("sequestrant", "secuestrante"), ("premix", "premezcla"),
    ("emulsion-cleaner", "limpiador emulsionante"),
    ("nivel de uso final", "nivel de uso definitivo"),
    ("pelleta", "pellet"), ("pellets", "pellets"), ("lavabo", "hundimiento"),
    ("leach", "lixiviar"), ("lixiviano", "se lixivia"),
    ("molino de alimentación", "fábrica de piensos"), ("Alimentación-Mill", "fábrica de piensos"),
    ("Fórmulas Aquafeed", "formulaciones de piensos acuícolas"),
    ("formuladores acuáticos", "formuladores de piensos acuícolas"),
    ("alimentos de pescado y camarones", "piensos para peces y camarones"),
    ("aminoácidos de pienso de peces y camarones e ingredientes minerales", "aminoácidos e ingredientes minerales para piensos de peces y camarones"),
    ("peces y camarones alimentan aminoácidos e ingredientes minerales", "aminoácidos e ingredientes minerales para piensos de peces y camarones"),
    ("los límites fluorinos y pesados", "los límites de flúor y metales pesados"),
    ("la estructura de unión y pellets", "la aglomeración y la estructura del pellet"),
    ("el ensayo seco no es suficiente", "el análisis en seco, por sí solo, no es suficiente"),
    ("Acid Cleaner &quot; Descaler Ingredient Solutions", "Ingredientes para limpiadores ácidos y desincrustantes"),
    ("Substrate, Seals and Equipment Compatibility", "Compatibilidad con el sustrato, las juntas y el equipo"),
    ("punto final rinse", "estado final del enjuague"),
    ("Spent-Bath pH y condición de enjuague", "pH del baño agotado y estado del enjuague"),
    ("descaler", "desincrustante"), ("descalificación industrial", "desincrustación industrial"),
    ("escala mineral", "incrustaciones minerales"), ("depósitos a escala", "depósitos incrustados"),
    ("escamas, óxido de hierro", "incrustaciones, óxido de hierro"),
    ("fuerza ácido", "concentración del ácido"), ("quiflación", "quelación"),
    ("Fertigation Phosphate Fertilizer Solutions", "Fertilizantes fosfatados para fertirrigación"),
    ("fertigación", "fertirrigación"), ("Fertigación", "Fertirrigación"),
    ("licuadoras de fertilizantes", "fabricantes de fertilizantes"),
    ("agua lisa", "agua pura"), ("agua fuente", "agua de origen"),
    ("tanque de stock", "tanque de solución madre"), ("tanques de stock", "tanques de solución madre"),
    ("Stock-Tank", "tanque de solución madre"), ("stock", "solución madre"),
    ("Crop, Growth Stage and Nutrient Target", "Cultivo, etapa de crecimiento y objetivo nutricional"),
    ("Stock And Diluted-Solution Clarity", "Claridad de la solución madre y de la solución diluida"),
    ("Crop-Stage Nutrient Delivery", "Aporte de nutrientes según la etapa del cultivo"),
    ("Ec", "CE"),
    ("Plan de prueba", "Plan de validación"),
    ("RFQ construido para esta aplicación", "Solicitud de oferta para esta aplicación"),
    ("mecanismo de falla", "mecanismo del problema"),
    ("La decisión central de la fuente", "La decisión principal de suministro"),
    ("La decisión central de abastecimiento", "La decisión principal de suministro"),
    ("ventana de entrega", "plazo de entrega"),
    ("antes de la ampliación", "antes de ampliar la escala"),
    ("antes de escalar", "antes de ampliar la escala"),
    ("Proporcione cantidad de muestra y piloto", "Indique la cantidad de muestra y del lote piloto"),
    ("Reproduce esta afección durante la detección.", "Reproduzca esta condición durante la evaluación."),
    ("Reproduce esta condición durante la detección.", "Reproduzca esta condición durante la evaluación."),
    ("Recordar los límites obligatorios legales, de seguridad y de clientes antes de que se soliciten muestras; nunca inferir permiso de un nombre de producto.",
     "Tenga en cuenta los requisitos legales, de seguridad y del cliente antes de solicitar muestras; el nombre del producto no implica una autorización de uso."),
    ("Batter o Dough pH", "pH de la masa o del batido"),
    ("Estante libre de moldes Vida y calidad sensorial", "Vida útil sin mohos y calidad sensorial"),
    ("Mixing, Holding, Calefacción, Refrigeración y Almacenamiento", "Mezcla, espera, calentamiento, refrigeración y almacenamiento"),
    ("Durabilidad de Pellet, Tomar y Controlar Resultados de Alimentación", "Durabilidad del pellet, consumo y resultados zootécnicos"),
    ("Especies - Especificación de Nutrientes en estadio vital", "Especie, etapa de vida y especificación de nutrientes"),
    ("Capacidad y Palatabilidad del Acid-Binding", "Capacidad de fijación de ácidos y palatabilidad"),
    ("Bañera o química Slag", "Química del baño o de la escoria"),
    ("electrovinización", "electroobtención"),
    ("caking", "apelmazamiento"),
    ("los formulaciones", "las formulaciones"),
    ("valor del aminoácidos", "valor de los aminoácidos"),
    ("lixiviación de una pellet", "puede lixiviarse de un pellet"),
    ("durabilidad de la pellets", "durabilidad del pellet"),
    ("Meta finalizada y defecto actual", "Objetivo del producto final y defecto actual"),
    ("Fórmula pH, agua, sal, grasa y proteína", "pH, agua, sal, grasa y proteína de la fórmula"),
    ("Dieta Basal, Matriz de Digestibilidad y contribución de nutrientes nativos", "Dieta basal, matriz de digestibilidad y aporte de nutrientes"),
    ("Pulpa o Química de Agua, pH, Redox y Temperatura", "Química de la pulpa o del agua, pH, potencial redox y temperatura"),
    ("Recuperación, Concentración de Calidad, Agua y Tailings Objetivos", "Recuperación, calidad del concentrado, agua y objetivos de relaves"),
    ("Materiales, Descarga, Potable-Contacto y Limitaciones Regulatorias Locales", "Materiales, vertido, contacto con agua potable y requisitos reglamentarios locales"),
    ("Use valores medidos más que supuestos.", "Utilice valores medidos en lugar de supuestos."),
    ("Use valores medidos en lugar de supuestos.", "Utilice valores medidos en lugar de supuestos."),
    ("Reproduce esta condición durante la proyección.", "Reproduzca esta condición durante la evaluación."),
    (" and número INS", " y número INS"),
    ("Use forage and water analysiss, balance the total mixed ration, confirm premezcla uniformity and follow intake, rumen-related indicators and production measures selected by the nutritionist.",
     "Utilice análisis del forraje y del agua, equilibre la ración total mezclada, confirme la uniformidad de la premezcla y controle el consumo, los indicadores ruminales y los parámetros productivos definidos por el nutricionista."),
    ("Surfactants remove and disperse soil; builders and alkalis manage water and pH; blixiviaring agents address oxidizable manchas; sales, polímeros y portaaviones support processing and product form.",
     "Los tensioactivos eliminan y dispersan la suciedad; los coadyuvantes y álcalis controlan el agua y el pH; los agentes blanqueadores actúan sobre manchas oxidables; y las sales, polímeros y vehículos facilitan el proceso y la forma del producto."),
]


def polish(value: str) -> str:
    for old, new in REPLACEMENTS:
        value = value.replace(old, new)
    value = re.sub(r"Controles de suministro(?: precisos)+", "Controles de suministro precisos", value)
    value = re.sub(
        r"Estos no son campos genéricos:.*?(?:clasifican|clasificados|clasificadas)\.",
        "Estos datos deben fijarse o medirse antes de comparar las opciones.",
        value,
    )
    value = re.sub(
        r"Informe(?: de)? este resultado para el control y cada candidato (?:bajo|en) condiciones coincidentes\.",
        "Registre este resultado para el control y para cada opción en condiciones equivalentes.",
        value,
    )
    value = re.sub(r"\bUse esto como la primera señal diagnóstica\.", "Utilice este valor como primera señal diagnóstica.", value)
    value = re.sub(r"\bEstablecer un límite", "Establezca un límite", value)
    value = re.sub(r"\bProporcionar (los|la|el|cantidad)", r"Proporcione \1", value)
    value = re.sub(r"\b(?:Definir|Define) esto para", "Defina este dato para", value)
    value = value.replace("; determina si la comparación", "; así podrá determinar si la comparación")
    value = re.sub(
        r"Establezca un límite de aceptación numérico o (?:anotado|marcado) con (.+?); incluir",
        r"Defina con \1 un límite de aceptación numérico o puntuado; incluya",
        value,
    )
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
    if isinstance(source, dict) and isinstance(current, dict):
        return {key: translate_schema_from_source(source.get(key), value, mapping, key) for key, value in current.items()}
    if isinstance(source, list) and isinstance(current, list):
        return [translate_schema_from_source(source[i] if i < len(source) else None, value, mapping, parent_key) for i, value in enumerate(current)]
    if isinstance(source, str) and isinstance(current, str):
        if source.startswith(("http://", "https://")) or parent_key == "inLanguage":
            return current
        if parent_key in localizer.JSON_TEXT_KEYS | {"text"}:
            return mapping.get(localizer.clean_source(source), current)
        return source
    return current


def set_schema_name(data, display_name: str, kind: str):
    graph = data.get("@graph", []) if isinstance(data, dict) else []
    for item in graph:
        item_type = item.get("@type") if isinstance(item, dict) else None
        if item_type in ({"WebPage", "Service"} if kind == "solution" else {"Product"}):
            item["name"] = display_name
        if item_type == "BreadcrumbList":
            elements = item.get("itemListElement", [])
            if elements:
                elements[-1]["name"] = display_name


def set_metadata(doc, title: str, description: str):
    title_node = doc.xpath("//title")
    if title_node:
        title_node[0].text = title
    for node in doc.xpath("//meta[@name='description' or @property='og:description' or @name='twitter:description']"):
        node.set("content", description)
    for node in doc.xpath("//meta[@property='og:title' or @name='twitter:title']"):
        node.set("content", title.split(" | ", 1)[0])


def process(path: Path, display_name: str, kind: str, mapping):
    doc = html.parse(str(path), parser=html.HTMLParser(encoding="utf-8"))
    source_path = ROOT / path.relative_to(ROOT / "es")
    source_doc = html.parse(str(source_path), parser=html.HTMLParser(encoding="utf-8"))
    for source_node, current_node in zip(
        source_doc.xpath("//script[@type='application/ld+json']"),
        doc.xpath("//script[@type='application/ld+json']"),
    ):
        if source_node.text and current_node.text:
            data = translate_schema_from_source(json.loads(source_node.text), json.loads(current_node.text), mapping)
            set_schema_name(data, display_name, kind)
            current_node.text = json.dumps(polish_json(data), ensure_ascii=False, separators=(",", ":"))
    for node in doc.iter():
        if not isinstance(node.tag, str):
            continue
        if node.tag.lower() in {"style", "code", "pre"}:
            continue
        if node.tag.lower() == "script":
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
        title = f"Proveedor de {display_name} de grado alimentario | Bespring"
        description = f"Consulte especificaciones, aplicaciones, embalaje, pedido mínimo y documentación de {display_name} de grado alimentario suministrado por Bespring Chemical."
        overview = doc.xpath("//*[@id='overview']//h2")
        if overview:
            overview[0].text = f"¿Qué características tiene {display_name} de grado alimentario?"
        faq = doc.xpath("//*[@id='faq']//h2")
        if faq:
            faq[0].text = f"Preguntas frecuentes sobre {display_name}"
        quote = doc.xpath("//*[@id='request-quote']//h2")
        if quote:
            quote[0].text = f"Solicite una oferta de {display_name}"
    else:
        title = f"{SEO_SHORT.get(display_name, display_name)} | Guía técnica | Bespring"
        description = localizer.shorten_at_word(
            f"Guía técnica sobre {display_name.lower()}: compare funciones, riesgos de aplicación, validación, cumplimiento y datos necesarios para solicitar una oferta.", 180
        )
    set_metadata(doc, title, description)
    path.write_text(html.tostring(doc.getroot(), encoding="unicode", method="html", doctype="<!DOCTYPE html>"), encoding="utf-8", newline="\n")


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
    path.write_text(html.tostring(doc.getroot(), encoding="unicode", method="html", doctype="<!DOCTYPE html>"), encoding="utf-8", newline="\n")


def main():
    mapping = localizer.load_cache()["es"]
    for slug, name in PRODUCTS.items():
        process(ROOT / "es/products/food-ingredients" / f"{slug}.html", name, "product", mapping)
    for slug, name in SOLUTIONS.items():
        process(ROOT / "es/solutions" / f"{slug}.html", name, "solution", mapping)
    for filename in (
        "agriculture-solutions.html", "animal-nutrition-solutions.html", "food-industry-solutions.html",
        "industrial-cleaning-solutions.html", "mining-solutions.html", "water-treatment-solutions.html",
    ):
        polish_hub(ROOT / "es/solutions" / filename)
    print(f"Polished {len(PRODUCTS)} product pages and {len(SOLUTIONS)} solution pages in Spanish.")


if __name__ == "__main__":
    main()

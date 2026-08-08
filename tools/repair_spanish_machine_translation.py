#!/usr/bin/env python3
"""Repair confirmed Spanish localization defects without changing links or markup."""

from pathlib import Path
import re
import html as html_std

ROOT = Path(__file__).resolve().parents[1]

GLOBAL = {
    "especificación privada actual": "especificación vigente acordada",
    "especificaciones privadas actuales": "especificaciones vigentes acordadas",
    "especificación privada": "especificación acordada",
    "especificación de fuente actual": "especificación vigente del proveedor",
    "especificación actual de fuente específica": "especificación vigente del proveedor",
    "especificación específica de la fuente": "especificación específica del proveedor",
    "Documentación técnica privada": "Documentación técnica",
    "Instrucciones de origen": "Indicaciones del fabricante",
    "PPE": "EPP",
    "procedimientos de manipulación entrenados": "procedimientos de manipulación a cargo de personal capacitado",
    "Utilizar el manejo, ventilación, contención, EPP, etiquetado y procedimientos de emergencia capacitados.": "Aplique ventilación, contención, etiquetado y equipos de protección personal adecuados, con procedimientos de emergencia a cargo de personal capacitado.",
    "grado exacto de humedad, contaminación": "producto de la humedad, la contaminación",
    "Orden de disolución y mezcla de la prueba de la presión": "Compruebe mediante ensayos previos el orden de disolución y mezcla",
    "alcalis": "álcalis",
    "monitoreo de gas cuando los procedimientos de emergencia relevantes y entrenados": "monitoreo de gases cuando corresponda y procedimientos de emergencia a cargo de personal capacitado",
    "Contacte con el equipo comercial para": "Solicite al equipo comercial",
    "Contactar ventas de exportación": "Contactar con el equipo de exportación",
    "ventas de contacto": "contactar con ventas",
    "Informacion del evento": "Información del evento",
    "Ubicacion:": "Ubicación:",
    "Exposicion": "Exposición",
    "participacion de Bespring": "participación de Bespring",
    "Sudeste Asiatico": "Sudeste Asiático",
    "por si solo": "por sí solo",
    "Envie el producto": "Envíe el producto",
    "registro factual": "registro documental",
    "Enfoque del catálogo": "Productos presentados",
    "Explorar portafolios de productos": "Explorar el catálogo de productos",
    "controles de los trabajadores": "medidas de seguridad laboral",
    "mercado de destino": "mercado objetivo",
    "requisitos de mercado de destino": "requisitos del mercado objetivo",
    "requisitos del mercado de destino": "requisitos del mercado objetivo",
    "COA representativo y de lote": "COA representativo y COA del lote",
    "COA representativo y COA de lote": "COA representativo y COA del lote",
    "fecha de recogida y entrega": "Incoterm y fecha de entrega",
    "Contacte con el equipo comercials": "Solicitar al equipo comercial",
    "Solicitud de especificación &amp;quot; cita": "Solicitar especificación y cotización",
    "Documento actual disponible en ventas": "Documentación vigente disponible a través del equipo comercial",
    "Confirmado en la oferta de fuente específica": "Confirmado en la oferta del proveedor",
    "fuente específica": "proveedor específico",
    "Review sourcing and export support for international ingredient procurement.": "Consulte nuestros servicios de abastecimiento y apoyo a la exportación para compradores internacionales de ingredientes.",
    "Review sourcing and export support for international feed-ingredient procurement.": "Consulte nuestros servicios de abastecimiento y apoyo a la exportación para compradores internacionales de aditivos para piensos.",
    "Review sourcing and export support for international chemical procurement.": "Consulte nuestros servicios de abastecimiento y apoyo a la exportación para compradores internacionales de productos químicos.",
    "Food Grade": "grado alimentario",
    "Feed Grade": "grado para piensos",
    "Fórmulación": "Formulación",
    "Fórmulaciones": "Formulaciones",
    "recuperación del suelo": "eliminación de suciedad",
    "Exact homolog": "Perfil exacto de homólogos",
    "etoxilation": "etoxilación",
    "Continuar la calificación de la desnutrición animal": "Continuar la evaluación de ingredientes para nutrición animal",
    "desnutrición animal": "nutrición animal",
    "Servicios de suministros": "Servicios de abastecimiento",
    "Contactar con el Equipo de Ventas": "Contactar con el equipo comercial",
    "Acidor alimentado e ingrediente tecnológico": "Acidulante e ingrediente tecnológico para piensos",
    "Metionina racial": "DL-metionina",
    "Premezclaes": "Premezclas",
    "ácido fumarónico": "ácido fumárico",
    "baja resolución": "baja solubilidad",
    "la peluquería": "la peletización",
    "Alimentos Grado": "Grado alimentario",
    "Alimentación Grado": "Grado para piensos",
    "Grado de alimentación": "Grado para piensos",
    "monohidrate": "monohidrato",
    " -confirm": "; confirmar",
    "—confirm": "; confirmar",
    "Starch de alimentos modificados químicamente": "Almidón alimentario modificado químicamente",
    "fosfato desarzo acetilado": "fosfato de dialmidón acetilado",
    "Sistema y jurisdicción específica": "Según el sistema y la normativa del mercado objetivo",
    "sistema y jurisdicción específica": "según el sistema y la normativa del mercado objetivo",
    "Blixiviar": "Lejía",
    "Polyamine": "Poliamina",
    "Thiocyanate": "Tiocianato",
    "Sulfato de ferric": "Sulfato férrico",
    "Hidroxido": "Hidróxido",
    "prima-material": "materia prima",
    "origen y sitio web aplicables": "origen y centro de producción aplicables",
    "Solicite al equipo comercial solicitar la especificación": "Solicite al equipo comercial la especificación",
    "Solicitar la especificación firmada actual": "Solicite la especificación vigente firmada",
    "Examen <a": "Consulte <a",
    "vida útil de plataforma": "vida útil",
    "esta limpieza materia prima": "esta materia prima para limpieza",
    "Nota de las reclamaciones:": "Nota sobre declaraciones de eficacia:",
    "reclamaciones desinfectantes, desinfectantes o patógenos": "declaraciones de desinfección ni de control de patógenos",
    "el pellejo": "la peletización",
    "grado alimentado": "grado para piensos",
    "metildo y el osmolyte": "metabolismo de grupos metilo y la osmorregulación",
    "sales, hidrata, portadores": "sales, hidratos, soportes",
    "sales, hidrataciones, portadores": "sales, hidratos, soportes",
    "indica la forma exacta ofrecida": "indique la forma exacta ofrecida",
    "debe especificar los compradores": "deben especificar los compradores",
    "Documentos de productos": "Documentación del producto",
    "Contexto autorizado": "Fuentes de referencia",
    "US EPA drinking-water regulations": "normativa de la EPA de EE. UU. sobre agua potable",
}

NEWS = {
    "Archivo de exposiciones": "Archivo de ferias",
    "La exposición ofreció la oportunidad": "La feria permitió",
    "Continuar la conversación": "Seguimiento comercial",
    "según el alcance actual de suministro": "de acuerdo con nuestra capacidad de suministro actual",
    "la exposición": "la feria",
}

SLES = {
    "Lauril éter sulfato de sodio": "Laureth sulfato de sodio",
    "Home Care &amp;amp; Industrial Cleaning": "Cuidado del hogar y limpieza industrial",
    "Material crudo antimicrobiano y manufactura": "Materia prima tensioactiva aniónica",
    "surfactante aniónico ether-sulfate": "tensioactivo aniónico de tipo éter sulfato",
    "para la espuma, el mojado y la detergencia": "para aportar espuma, humectación y detergencia",
    "grados específicos de concentración y etoxilatación": "grados definidos por el nivel de etoxilación y el contenido de materia activa",
    "Etoxilación y concentración activa -confirm": "Confirmar nivel de etoxilación y materia activa",
    "Fórmulación y mercado específico": "Según la formulación y el mercado objetivo",
    "Contacte con el equipo comercials": "Solicitar al equipo comercial",
    "Solicitud de especificación &amp;quot; cita": "Solicitar especificación y cotización",
    "Sodium Lauryl Ether Sulfate (SLES) materia prima para el cuidado de la casa y limpieza industrial": "Laureth sulfato de sodio (SLES) para productos de limpieza doméstica e industrial",
    "Representación de la limpieza de la imagen de la cartera de materia prima. Solicite el producto actual y las fotografías de embalaje.": "Imagen representativa de la gama de materias primas para limpieza. Solicite fotografías actuales del producto y del embalaje.",
    "Fórmula específica materia prima": "Materia prima para formulaciones específicas",
    "Documento actual disponible en ventas": "Documentación vigente disponible a través del equipo comercial",
    "Utilice los controles actuales de SDS y el lugar de trabajo": "Consulte la SDS vigente y aplique las medidas de seguridad laboral",
    "COA actual disponible para lotes suministrados": "COA del lote disponible para cada partida suministrada",
    "Material crudo resistente y antimicrobiano": "Tensioactivo aniónico",
    "Fórmulación y jurisdicción específicas": "Según la formulación y la normativa del mercado objetivo",
    "Especificación pública": "Base de especificación",
    "No publicado: contactar con ventas": "Solicitar la especificación vigente al equipo comercial",
    "una fabricante químico": "un fabricante químico",
    "sles proveedor para productos de limpieza": "Proveedor de SLES para productos de limpieza",
    "precio a granel": "Precio de SLES para volúmenes comerciales",
    "sles for detergent formulation": "SLES para formulaciones detergentes",
    "sles fabricante SDS y COA": "Fabricante de SLES: SDS y COA",
    "Comparta toda la fórmula, proceso, función de destino, sustrato, necesidades de compatibilidad y pruebas de producto terminado.": "Indique la formulación completa, el proceso, la función prevista, el sustrato, los requisitos de compatibilidad y las pruebas del producto terminado.",
    "Califica identidad": "Verifique la identidad",
    "áreas de pantalla de formulación": "áreas de evaluación de formulaciones",
    "Fórmulaciones": "Formulaciones",
    "limpieza interna e institucional": "limpieza doméstica e institucional",
    "recuperación del suelo": "eliminación de suciedad",
    "Exact homolog, etoxilation o concentración activa": "Perfil de homólogos, etoxilación y materia activa",
    "el homolog exacto, la etoxilación o la concentración activa": "el perfil de homólogos, el nivel de etoxilación y el contenido de materia activa",
    "base de ph": "valor de pH",
    "Autorización biocida y reclamaciones de productos terminados": "Declaraciones reglamentarias del producto terminado",
    "Evaluar las reclamaciones de autorización biocida y productos terminados": "Verifique las declaraciones permitidas y los requisitos de autorización del producto terminado",
    "esta limpieza materia prima": "esta materia prima para limpieza",
    "Examen <a": "Consulte <a",
    "NIH PubChem registros químicos": "registros químicos de NIH PubChem",
    "ECHA chemical information": "información sobre sustancias químicas de la ECHA",
    "Nota de las reclamaciones:": "Nota sobre declaraciones de eficacia:",
    "Una identidad prima-material no establece reclamaciones desinfectantes, desinfectantes o patógenos": "La identidad de una materia prima no justifica por sí sola declaraciones de desinfección ni de control de patógenos",
    "Manija SLES bajo el SDS actual": "Manipulación conforme a la SDS vigente",
    "Cuestiones de comprador industrial": "Preguntas de compradores industriales",
    "¿Qué identidad SLES debería especificar los compradores?": "¿Qué datos de identificación de SLES deben especificar los compradores?",
    "CAS a menudo 685-34-2": "CAS indicado habitualmente por el proveedor: 68585-34-2",
    "Etoxilatación y concentración activa—confirm.": "Confirme el nivel de etoxilación y el contenido de materia activa.",
    "Familias de productos, soluciones, hidratantes y mezclas requieren la forma comercial exacta a ser declarada.": "En productos comerciales, soluciones y mezclas debe declararse con precisión la forma suministrada.",
    "Compartir exactamente grado": "Indique el grado exacto",
    'value="Sodium Lauryl Ether Sulfate (SLES) for Industrial Cleaning"': 'value="Laureth sulfato de sodio (SLES)"',
    'product="Sodium Lauryl Ether Sulfate (SLES) for Industrial Cleaning"': 'product="Laureth sulfato de sodio (SLES)"',
}


def apply(path: Path, mapping: dict[str, str]) -> bool:
    raw = path.read_text(encoding="utf-8")
    out = raw
    for old, new in mapping.items():
        out = out.replace(old, new)
    # Restore immutable English URL slugs if an earlier text-only term pass touched them.
    out = out.replace("calcium-chloride-anhidro.html", "calcium-chloride-anhydrous.html")
    out = out.replace("monocalcium-phosphate-anhidro.html", "monocalcium-phosphate-anhydrous.html")
    out = out.replace("dextrose-monohidrato.html", "dextrose-monohydrate.html")
    # Localize the visible technical term without changing URL attributes.
    out = re.sub(r"(?<![-/])\banhydrous\b(?!\.html)", "anhidro", out)
    out = re.sub(r"(?<![-/])\bAnhydrous\b(?!\.html)", "Anhidro", out)
    out = re.sub(r"(?<![-/])\bmonohydrate\b(?!\.html)", "monohidrato", out)
    out = re.sub(
        r">(?:Handle\s+[^<]+?|[^<]+?\s+Handle)\s+under the current SDS<",
        ">Manipulación conforme a la SDS vigente<",
        out,
        flags=re.IGNORECASE,
    )
    out = re.sub(
        r">(?:Handle|Manija)\s+[^<]+?\s+bajo el SDS actual<",
        ">Manipulación conforme a la SDS vigente<",
        out,
        flags=re.IGNORECASE,
    )
    out = re.sub(
        r">[^<]+?\s+Handle(?:\s+\([^<]+\))?\s+bajo el SDS actual<",
        ">Manipulación conforme a la SDS vigente<",
        out,
        flags=re.IGNORECASE,
    )
    if out != raw:
        path.write_text(out, encoding="utf-8")
        return True
    return False


def optimize_product_meta(path: Path) -> bool:
    relative = path.relative_to(ROOT / "es")
    if len(relative.parts) != 3 or relative.parts[0] != "products":
        return False
    raw = path.read_text(encoding="utf-8")
    match = re.search(r"<h1[^>]*>([^<]+)</h1>", raw)
    if not match:
        return False
    name = html_std.unescape(match.group(1)).strip()
    templates = {
        "food-ingredients": f"{name}: solicite especificación, grado alimentario, COA, embalaje y cotización para compras B2B internacionales.",
        "animal-nutrition": f"{name}: solicite especificación, grado para piensos, COA, embalaje y cotización para compras B2B internacionales.",
        "home-care-industrial-cleaning": f"{name} para productos de limpieza: solicite especificación, grado técnico, COA, embalaje y cotización B2B.",
        "water-treatment": f"{name} para tratamiento de agua: solicite especificación, grado técnico, COA, embalaje y cotización B2B.",
        "mining": f"{name} para minería y beneficio de minerales: solicite especificación, grado técnico, COA, embalaje y cotización B2B.",
        "agricultural-fertilizers": f"{name} para fertilizantes: solicite especificación, análisis de nutrientes, COA, embalaje y cotización B2B.",
    }
    description = templates.get(relative.parts[1])
    if not description:
        return False
    escaped = html_std.escape(description, quote=True)
    out = raw
    for selector in (
        r'(<meta name="description" content=")[^"]*(")',
        r'(<meta property="og:description" content=")[^"]*(")',
        r'(<meta name="twitter:description" content=")[^"]*(")',
    ):
        out = re.sub(selector, lambda m: m.group(1) + escaped + m.group(2), out, count=1)
    product_value = html_std.escape(name, quote=True)
    out = re.sub(r'(<input name="product" value=")[^"]*(")', lambda m: m.group(1) + product_value + m.group(2), out, count=1)
    out = re.sub(r'((?:const|let|var)\s+product=)"[^"]*"', lambda m: m.group(1) + '"' + name.replace('"', '\\"') + '"', out, count=1)
    if out != raw:
        path.write_text(out, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = 0
    for path in (ROOT / "es").rglob("*.html"):
        changed += apply(path, GLOBAL)
    for path in (ROOT / "es" / "news").glob("*.html"):
        changed += apply(path, NEWS)
    changed += apply(ROOT / "es" / "products" / "home-care-industrial-cleaning" / "sles.html", SLES)
    for path in (ROOT / "es" / "products").glob("*/*.html"):
        changed += optimize_product_meta(path)
    print(f"Repaired {changed} Spanish HTML files")


if __name__ == "__main__":
    main()

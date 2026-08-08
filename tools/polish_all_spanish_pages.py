#!/usr/bin/env python3
"""Apply confirmed Spanish copy fixes without reserializing whole HTML files."""

from __future__ import annotations

import html as html_std
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REPLACEMENTS = [
    ("Please email info@bespringchem.com.", "Escriba a info@bespringchem.com."),
    ("Thank you. Your request has been sent.", "Gracias. Hemos recibido su solicitud."),
    ("grado alimenticio", "grado alimentario"),
    ("Grado alimenticio", "Grado alimentario"),
    ("premezclaes", "premezclas"),
    ("Última revisión: 2026-07-20 by ", "Última revisión: 2026-07-20 por el "),
    ("Última revisión: 2026-07-25 by ", "Última revisión: 2026-07-25 por el "),
    (" by equipo técnico y de exportación de Bespring Chemical", " por el equipo técnico y de exportación de Bespring Chemical"),
    ("Ventas de contacto", "Contacte con el equipo comercial"),
    ("Correo electrónico de negocios", "Correo electrónico profesional"),
    ("Enviar solicitud de presupuesto", "Enviar solicitud de cotización"),
    ("Suministros dirigidos por actividades específicas", "Suministro adaptado a la aplicación"),
    ("Compartir aplicaciones, especificación, cantidad, embalaje, destino y documentos necesarios.",
     "Indique la aplicación, la especificación, la cantidad, el embalaje, el destino y los documentos necesarios."),
    ("Ventas de contacto para la especificación actual de fuentes específicas o TDS, métodos y COA representativo.",
     "Contacte con el equipo comercial para solicitar la especificación vigente del origen propuesto, la TDS, los métodos de ensayo y un COA representativo."),
    ("Contactar con las ventas para la especificación actual de fuentes específicas o TDS, métodos y COA representativo.",
     "Contacte con el equipo comercial para solicitar la especificación vigente del origen propuesto, la TDS, los métodos de ensayo y un COA representativo."),
    ("hoja de datos de seguridad", "ficha de datos de seguridad"),
    ("removalación", "eliminación"),
    ("Aclaraciones de agua potable", "Clarificación de agua potable"),
    ("datos fuente-agua", "datos del agua de origen"),
    ("agua fuente", "agua de origen"),
    ("precio grueso", "precio a granel"),
    ("cita a granel", "cotización a granel"),
    ("cita para suministro", "cotización para suministro"),
    ("Solicitar una cita", "Solicitar una cotización"),
    ("¿Qué información se necesita para una cita?", "¿Qué información se necesita para una cotización?"),
    ("calidad alimentaria", "grado alimentario"),
    ("calidad de alimento", "grado para alimentación animal"),
    ("grado de alimentación", "grado para alimentación animal"),
    ("fabricante de alimentos adicionales", "fabricante de aditivos para piensos"),
    ("uniformidad mezcladora", "uniformidad de la mezcla"),
    ("tipo de alimentación", "tipo de pienso"),
    ("reglas de alimentación", "normativa aplicable a los piensos"),
    ("Preguntas de búsqueda contestadas", "Preguntas frecuentes"),
    ("Preguntas de búsqueda respondidas", "Preguntas frecuentes"),
    ("preguntas de compra de cola larga", "consultas de compra específicas"),
    ("Examen de la aplicación de los alimentos", "Evaluación de aplicaciones alimentarias"),
    ("Grado alimentario comunes", "Aplicaciones habituales del"),
    ("Formula", "Fórmula"),
    ("COA representativa", "COA representativo"),
    ("COA por lotes", "COA del lote"),
    ("COA por lote", "COA del lote"),
    ("fuente de fabricante", "fabricante"),
    ("oferta de distribuidores", "oferta de un distribuidor"),
    ("fabricante de China", "proveedor de China"),
    ("prepolímerizado", "prepolimerizado"),
    ("reclamaciones de eficacia", "declaraciones de eficacia"),
    ("rigen el orden", "rigen el pedido"),
    ("suministrados por las ventas", "facilitados por el equipo comercial"),
    ("ingredientes portadores", "vehículos"),
    ("ayudas de flujo", "agentes antiapelmazantes"),
    ("sazones", "condimentos"),
    ("fabricante documentos", "documentación del fabricante"),
    ("por lotes", "de lote"),
    ("calificación del proveedor", "homologación del proveedor"),
    ("calificación preliminar", "evaluación preliminar"),
    ("calificación de adquisición", "evaluación para compras"),
    ("deben ser calificados", "deben verificarse"),
    ("debe ser calificado", "debe verificarse"),
    ("Compartir formulario exacto", "Indique la forma exacta"),
    ("Compartir análisis", "Facilite el análisis"),
    ("Compartir los ", "Facilite los "),
    ("Compartir las ", "Facilite las "),
    ("Compartir el ", "Indique el "),
    ("Compartir la ", "Indique la "),
    ("Establece el ", "Indique el "),
    ("Establece la ", "Indique la "),
]


def visible_h1(raw: str) -> str | None:
    match = re.search(r"<h1(?:\s[^>]*)?>(.*?)</h1>", raw, re.I | re.S)
    if not match:
        return None
    value = re.sub(r"<[^>]+>", "", match.group(1))
    return html_std.unescape(" ".join(value.split()))


def meta_description(raw: str) -> str | None:
    match = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', raw, re.I)
    return html_std.unescape(match.group(1)) if match else None


def clean_schema(raw: str, h1: str | None, description: str | None) -> str:
    pattern = re.compile(r'(<script\s+type="application/ld\+json">)(.*?)(</script>)', re.I | re.S)

    def replace(match: re.Match[str]) -> str:
        try:
            data = json.loads(match.group(2))
        except json.JSONDecodeError:
            return match.group(0)

        def walk(value):
            if isinstance(value, dict):
                item_type = value.get("@type")
                if isinstance(item_type, str) and item_type in {"WebPage", "Product", "Service"} and description:
                    current = str(value.get("description", ""))
                    if re.search(r"\b(?:Source|Review|Supplier|Food Grade|for water treatment|for mining)\b", current, re.I) or current.startswith("Fuente "):
                        value["description"] = description
                if item_type == "Product" and h1 and re.search(r"\b(?:Food Grade|Feed Grade|Supplier)\b", str(value.get("name", "")), re.I):
                    value["name"] = h1
                for child in value.values():
                    walk(child)
            elif isinstance(value, list):
                for child in value:
                    walk(child)
        walk(data)
        return match.group(1) + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + match.group(3)

    return pattern.sub(replace, raw)


def main() -> None:
    changed = 0
    replacements = 0
    for path in sorted((ROOT / "es").rglob("*.html")):
        raw = path.read_text(encoding="utf-8")
        updated = raw
        for old, new in REPLACEMENTS:
            count = updated.count(old)
            if count:
                updated = updated.replace(old, new)
                replacements += count
        # Product/solution slugs are language-neutral and must never be translated.
        updated = updated.replace("ruminant-mineral-premezcla-phosphate-systems", "ruminant-mineral-premix-phosphate-systems")
        updated = updated.replace("feed-premezcla-flow-trace-mineral-compatibility", "feed-premix-flow-trace-mineral-compatibility")
        h1 = visible_h1(updated)
        if h1 and "/products/" in path.as_posix():
            updated, count = re.subn(r'value="Food Grade [^"]+"', f'value="{html_std.escape(h1, quote=True)}"', updated)
            replacements += count
        updated = clean_schema(updated, h1, meta_description(updated))
        if updated != raw:
            path.write_text(updated, encoding="utf-8", newline="")
            changed += 1
    print(f"Polished {changed} Spanish pages with {replacements} confirmed text replacements.")


if __name__ == "__main__":
    main()

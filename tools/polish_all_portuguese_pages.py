#!/usr/bin/env python3
"""Post-edit every pt-BR page while preserving URLs and functional attributes."""

from __future__ import annotations

import html as html_std
import json
import re
import sys
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import polish_portuguese_new_pages as base
from build_portuguese_product_pages import TERM_FIXES

EXTRA = [
    ("Please email info@bespringchem.com.", "Envie um e-mail para info@bespringchem.com."),
    ("Thank you. Your request has been sent.", "Obrigado. Recebemos sua solicitação."),
    ("Food Grade", "Grau alimentício"),
    ("Standard packing", "Embalagem padrão"),
    ("25 kg bag", "Saco de 25 kg"),
    ("Container loading", "Carga do contêiner"),
    ("Reference: 20 MT / 20' FCL", "Referência: 20 t por contêiner de 20 pés"),
    ("Compartilhar aplicações, especificação, quantidade, embalagem, destino e documentos necessários.",
     "Informe aplicação, especificação, quantidade, embalagem, destino e documentos necessários."),
    ("Compartilhar observações práticas", "Compartilhar informações práticas"),
    ("Compartilhar ", "Informar "),
    ("Partilhar ", "Informar "),
    ("Última revisão: 2026-07-20 by ", "Última revisão: 2026-07-20 pela "),
    ("Última revisão: 2026-07-25 by ", "Última revisão: 2026-07-25 pela "),
    (" by equipe técnica e de exportação da Bespring Chemical", " pela equipe técnica e de exportação da Bespring Chemical"),
    ("contato Vendas", "entre em contato com a equipe comercial"),
    ("Vendas de contato", "Entre em contato com a equipe comercial"),
    ("Contato de vendas", "Entre em contato com a equipe comercial"),
    ("Ficha de Dados de Segurança", "Ficha com Dados de Segurança (FDS)"),
    ("Folha de dados de segurança", "Ficha com Dados de Segurança (FDS)"),
    ("Correio electrónico comercial", "E-mail profissional"),
    ("Correio eletrônico comercial", "E-mail profissional"),
    ("Enviar pedido de cotação", "Enviar solicitação de cotação"),
    ("Enviar solicitação de orçamento", "Enviar solicitação de cotação"),
    ("Inquérito", "Consulta"),
    ("inquérito", "consulta"),
    ("orçamento a granel", "cotação para fornecimento a granel"),
    ("preço bruto", "preço a granel"),
    ("pré-misturaes", "pré-misturas"),
]


def polish(value: str) -> str:
    value = base.polish(value)
    for old, new in TERM_FIXES + EXTRA:
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


def normalize_schema(value, meta_description: str, h1: str):
    """Replace leftover English schema copy without touching schema URLs."""
    if isinstance(value, dict):
        normalized = {key: normalize_schema(item, meta_description, h1) for key, item in value.items()}
        schema_type = normalized.get("@type")
        description = normalized.get("description")
        if isinstance(schema_type, str) and schema_type in {"WebPage", "Product", "Service"} and isinstance(description, str):
            if re.search(r"\b(?:Source|Review|Supplier|Food Grade)\b", description, re.I):
                normalized["description"] = meta_description
        name = normalized.get("name")
        if schema_type == "Product" and h1 and isinstance(name, str):
            if re.search(r"\b(?:Food Grade|Supplier)\b", name, re.I):
                normalized["name"] = h1
        return normalized
    if isinstance(value, list):
        return [normalize_schema(item, meta_description, h1) for item in value]
    return value


def main() -> None:
    changed = 0
    for path in sorted((ROOT / "pt").rglob("*.html")):
        raw = path.read_text(encoding="utf-8")
        doc = html.fromstring(raw)
        h1 = doc.xpath("string(//h1)").strip()
        meta_description = doc.xpath("string(//meta[@name='description']/@content)").strip()
        for node in doc.iter():
            if not isinstance(node.tag, str) or node.tag.lower() in {"script", "style", "code", "pre"}:
                continue
            if node.text: node.text = polish(node.text)
            if node.tail: node.tail = polish(node.tail)
            for attr in ("alt", "title", "aria-label", "placeholder"):
                if node.get(attr): node.set(attr, polish(node.get(attr)))
            if node.tag.lower() == "meta" and node.get("content"):
                node.set("content", polish(node.get("content")))
        for script in doc.xpath("//script[@type='application/ld+json']"):
            try: data = json.loads(script.text or "")
            except json.JSONDecodeError: continue
            data = polish_json(data)
            script.text = json.dumps(
                normalize_schema(data, meta_description, h1),
                ensure_ascii=False,
                separators=(",", ":"),
            )
        updated = html.tostring(doc, encoding="unicode", method="html", doctype="<!DOCTYPE html>")
        updated = updated.replace("Please email info@bespringchem.com.", "Envie um e-mail para info@bespringchem.com.")
        updated = updated.replace("Thank you. Your request has been sent.", "Obrigado. Recebemos sua solicitação.")
        updated = updated.replace("Close navigation menu", "Fechar menu de navegação")
        updated = updated.replace("Open navigation menu", "Abrir menu de navegação")
        updated = updated.replace("The form service is temporarily unavailable.", "O serviço do formulário está temporariamente indisponível.")
        updated = updated.replace("Sending your request...", "Enviando sua solicitação...")
        updated = updated.replace("Sending your request…", "Enviando sua solicitação…")
        updated = re.sub(
            r"Thank you\. Your [^.\"']+ quote request has been sent successfully\.",
            "Obrigado. Sua solicitação de cotação foi enviada com sucesso.",
            updated,
        )
        updated = updated.replace(
            "Thank you. Your request has been received and our team will contact you shortly.",
            "Obrigado. Recebemos sua solicitação e nossa equipe entrará em contato em breve.",
        )
        updated = updated.replace(
            "We could not send your request. Please email info@bespringchem.com or try again.",
            "Não foi possível enviar sua solicitação. Escreva para info@bespringchem.com ou tente novamente.",
        )
        updated = updated.replace(
            "The form could not be sent. Please email info@bespringchem.com or try again.",
            "Não foi possível enviar o formulário. Escreva para info@bespringchem.com ou tente novamente.",
        )
        if h1 and "/products/" in path.as_posix():
            updated = re.sub(r'value="(?:Food Grade|Grau aliment[ií]cio) [^"]+"', f'value="{html_std.escape(h1, quote=True)}"', updated)
            js_product = "product=" + json.dumps(h1, ensure_ascii=False)
            updated = re.sub(r"product=(['\"])(?:Food Grade|Grau aliment[ií]cio) .*?\1", js_product, updated)
            js_form_value = "quoteForm.elements.product.value=" + json.dumps(h1, ensure_ascii=False)
            updated = re.sub(
                r"(?:f|quoteForm)\.elements\.product\.value\s*=\s*(['\"])(?:Food Grade|Grau aliment[ií]cio) .*?\1",
                js_form_value,
                updated,
            )
        if updated != raw:
            path.write_text(updated, encoding="utf-8", newline="")
            changed += 1
    print(f"Post-edited {changed} pt-BR pages without changing href or src values.")


if __name__ == "__main__": main()

#!/usr/bin/env python3
"""Apply the site's durable Google Search Console indexing/schema policy."""

from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.bespringchem.com"
JSON_LD_RE = re.compile(
    r'(<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)',
    re.I | re.S,
)
NOINDEX_RE = re.compile(
    r'<meta\s+name=["\']robots["\'][^>]*\bnoindex\b',
    re.I,
)
CANONICAL_RE = re.compile(
    r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']',
    re.I,
)


# GitHub Pages cannot configure arbitrary HTTP 301 rules. These same-origin,
# zero-delay redirect documents give crawlers and people a deterministic route
# from the legacy URLs reported by Search Console to the current canonical URLs.
LEGACY_REDIRECTS = {
    "foodingredients.html": "/products/food-ingredients.html",
    "homecareindustrialcleaning.html": "/products/home-care-industrial-cleaning.html",
    "animalnutrition.html": "/products/animal-nutrition.html",
    "watertreatment.html": "/products/water-treatment.html",
    "mining.html": "/products/mining.html",
    "agricultural-fertilizers.html": "/products/agricultural-fertilizers.html",
    "agriculture-fertilizers.html": "/products/agricultural-fertilizers.html",
    "productionbases.html": "/about/production-bases.html",
    "companyprofile.html": "/about/company-profile.html",
    "corevalues.html": "/about/core-values.html",
    "globalmarkets.html": "/about/global-markets.html",
    "certifications.html": "/about/certifications.html",
    "contactus.html": "/contact.html",
    "industries.html": "/products.html",
    "en/index.html": "/",
    "index.jsp": "/",
    "es/index-es.html": "/es/",
    "es/culture.html": "/es/about/core-values.html",
    "es/Sorbate.html": "/es/products/food-ingredients/potassium-sorbate.html",
    "es/NEWS/202400622.html": "/es/news.html",
}

for language in ("zh-cn", "zh-tw"):
    prefix = f"/{language}"
    LEGACY_REDIRECTS.update(
        {
            f"{language}/foodingredients.html": f"{prefix}/products/food-ingredients.html",
            f"{language}/homecareindustrialcleaning.html": f"{prefix}/products/home-care-industrial-cleaning.html",
            f"{language}/animalnutrition.html": f"{prefix}/products/animal-nutrition.html",
            f"{language}/watertreatment.html": f"{prefix}/products/water-treatment.html",
            f"{language}/mining.html": f"{prefix}/products/mining.html",
            f"{language}/agricultural-fertilizers.html": f"{prefix}/products/agricultural-fertilizers.html",
            f"{language}/agriculture-fertilizers.html": f"{prefix}/products/agricultural-fertilizers.html",
            f"{language}/productionbases.html": f"{prefix}/about/production-bases.html",
            f"{language}/companyprofile.html": f"{prefix}/about/company-profile.html",
            f"{language}/corevalues.html": f"{prefix}/about/core-values.html",
            f"{language}/globalmarkets.html": f"{prefix}/about/global-markets.html",
            f"{language}/certifications.html": f"{prefix}/about/certifications.html",
            f"{language}/contactus.html": f"{prefix}/contact.html",
            f"{language}/industries.html": f"{prefix}/products.html",
            f"{language}/Industries.html": f"{prefix}/products.html",
        }
    )

LEGACY_REDIRECTS.update(
    {
        "cn/products.html": "/zh-cn/products.html",
        "tw/products.html": "/zh-tw/products.html",
        "zh-cn/industries/home-care-industrial-cleaning.html": "/zh-cn/products/home-care-industrial-cleaning.html",
    }
)


def write_redirects() -> int:
    changed = 0
    template = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex, follow">
  <meta http-equiv="refresh" content="0; url={target}">
  <link rel="canonical" href="{canonical}">
  <title>Page moved | Bespring Chemical</title>
  <script>window.location.replace({json_target});</script>
</head>
<body>
  <p>This page has moved to <a href="{target}">{canonical}</a>.</p>
</body>
</html>
"""
    for relative, target in LEGACY_REDIRECTS.items():
        path = ROOT / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        content = template.format(
            target=target,
            canonical=BASE + target,
            json_target=json.dumps(target),
        )
        if not path.exists() or path.read_text(encoding="utf-8-sig") != content:
            path.write_text(content, encoding="utf-8")
            changed += 1
    return changed


def clean_schema() -> tuple[int, int]:
    product_nodes = 0
    event_nodes = 0

    def clean_block(match: re.Match[str]) -> str:
        nonlocal product_nodes, event_nodes
        try:
            data = json.loads(match.group(2))
        except json.JSONDecodeError:
            return match.group(0)

        if not isinstance(data, dict) or not isinstance(data.get("@graph"), list):
            return match.group(0)

        kept = []
        changed = False
        for node in data["@graph"]:
            node_type = node.get("@type") if isinstance(node, dict) else None
            types = set(node_type if isinstance(node_type, list) else [node_type])
            if "Product" in types and not any(
                key in node for key in ("offers", "review", "aggregateRating")
            ):
                product_nodes += 1
                changed = True
                continue
            if "Event" in types and node.get("eventStatus") == "https://schema.org/EventCompleted":
                event_nodes += 1
                changed = True
                continue
            kept.append(node)

        if not changed:
            return match.group(0)
        data["@graph"] = kept
        payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
        return f"{match.group(1)}{payload}{match.group(3)}"

    for path in ROOT.rglob("*.html"):
        if "tools" in path.relative_to(ROOT).parts:
            continue
        original = path.read_text(encoding="utf-8-sig")
        updated = JSON_LD_RE.sub(clean_block, original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
    return product_nodes, event_nodes


def rebuild_sitemap() -> int:
    namespace = "http://www.sitemaps.org/schemas/sitemap/0.9"
    qualified = f"{{{namespace}}}"
    ET.register_namespace("", namespace)
    urls: dict[str, Path] = {}

    for path in ROOT.rglob("*.html"):
        if "tools" in path.relative_to(ROOT).parts:
            continue
        text = path.read_text(encoding="utf-8-sig")
        if NOINDEX_RE.search(text):
            continue
        canonical = CANONICAL_RE.search(text)
        if canonical:
            urls[canonical.group(1)] = path

    root = ET.Element(qualified + "urlset")
    for url, path in sorted(urls.items()):
        node = ET.SubElement(root, qualified + "url")
        ET.SubElement(node, qualified + "loc").text = url
        ET.SubElement(node, qualified + "lastmod").text = datetime.fromtimestamp(
            path.stat().st_mtime
        ).date().isoformat()

    tree = ET.ElementTree(root)
    ET.indent(tree, space="  ")
    tree.write(ROOT / "sitemap.xml", encoding="utf-8", xml_declaration=True)
    return len(urls)


def validate_site() -> tuple[int, int, int, int]:
    invalid_json = 0
    remaining_products = 0
    remaining_events = 0
    broken_redirects = 0

    for path in ROOT.rglob("*.html"):
        if "tools" in path.relative_to(ROOT).parts:
            continue
        text = path.read_text(encoding="utf-8-sig")
        for match in JSON_LD_RE.finditer(text):
            try:
                data = json.loads(match.group(2))
            except json.JSONDecodeError:
                invalid_json += 1
                continue
            nodes = data.get("@graph", []) if isinstance(data, dict) else []
            for node in nodes if isinstance(nodes, list) else []:
                if not isinstance(node, dict):
                    continue
                node_type = node.get("@type")
                types = set(node_type if isinstance(node_type, list) else [node_type])
                remaining_products += int("Product" in types)
                remaining_events += int("Event" in types)

    for relative, target in LEGACY_REDIRECTS.items():
        target_relative = target.lstrip("/")
        if target == "/":
            target_relative = "index.html"
        elif target.endswith("/"):
            target_relative += "index.html"
        if not (ROOT / target_relative).is_file():
            broken_redirects += 1

    return invalid_json, remaining_products, remaining_events, broken_redirects


def main() -> None:
    redirects = write_redirects()
    products, events = clean_schema()
    sitemap_urls = rebuild_sitemap()
    invalid_json, remaining_products, remaining_events, broken_redirects = validate_site()
    print(
        f"redirects_written={redirects} product_nodes_removed={products} "
        f"completed_event_nodes_removed={events} sitemap_urls={sitemap_urls} "
        f"invalid_jsonld={invalid_json} remaining_product_nodes={remaining_products} "
        f"remaining_event_nodes={remaining_events} broken_redirect_targets={broken_redirects}"
    )
    if invalid_json or remaining_products or remaining_events or broken_redirects:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

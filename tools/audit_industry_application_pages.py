"""Audit the 34 application pages, six linked hubs, local links and sitemap."""

from __future__ import annotations

import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree as ET

from build_industry_application_pages import BASE, GROUPS, PAGE_ANGLES

ROOT=Path(__file__).resolve().parents[1]


class Parser(HTMLParser):
    def __init__(self):
        super().__init__(); self.tags=[]; self.scripts=[]; self._script=None
    def handle_starttag(self,tag,attrs):
        a=dict(attrs); self.tags.append((tag,a))
        if tag=="script" and a.get("type")=="application/ld+json": self._script=[]
    def handle_endtag(self,tag):
        if tag=="script" and self._script is not None:
            self.scripts.append("".join(self._script)); self._script=None
    def handle_data(self,data):
        if self._script is not None: self._script.append(data)


def matching(p,tag,**attrs):
    return [a for t,a in p.tags if t==tag and all(a.get(k)==v for k,v in attrs.items())]


def local_target(source:Path,href:str):
    parts=urlsplit(href)
    if parts.scheme or href.startswith(("mailto:","tel:","javascript:","data:")): return None,None
    path=unquote(parts.path)
    target=(ROOT/path.lstrip("/")) if path.startswith("/") else (source.parent/path)
    if not path: target=source
    if target.is_dir(): target=target/"index.html"
    return target.resolve(),unquote(parts.fragment)


def main():
    issues=[]; inventory=[(g,p) for g in GROUPS for p in g["pages"]]
    slugs=[p["slug"] for _,p in inventory]
    if len(slugs)!=34 or len(set(slugs))!=34: issues.append("inventory must contain 34 unique slugs")
    if set(PAGE_ANGLES)!=set(slugs): issues.append("editorial angles must match the 34-page inventory")
    if len({a["primary"] for a in PAGE_ANGLES.values()})!=34: issues.append("primary search intents must be unique")
    if len({a["heading"] for a in PAGE_ANGLES.values()})!=34: issues.append("decision headings must be unique")
    titles=set(); descriptions=set(); canonicals=set()
    for group,pdata in inventory:
        file=ROOT/"solutions"/(pdata["slug"]+".html")
        if not file.exists(): issues.append(f"missing application page: {file.name}"); continue
        raw=file.read_text(encoding="utf-8-sig"); p=Parser(); p.feed(raw)
        angle=PAGE_ANGLES[pdata["slug"]]
        if "application-solution-page" not in raw: issues.append(f"{file.name}: body class")
        if angle["primary"] not in raw or angle["heading"] not in raw or angle["faq"][0] not in raw:
            issues.append(f"{file.name}: missing page-specific editorial content")
        if any(marker in raw for marker in ("鈥", "路", "锟")): issues.append(f"{file.name}: mojibake marker")
        visible=re.sub(r"<script\b.*?</script>|<style\b.*?</style>|<[^>]+>"," ",raw,flags=re.I|re.S)
        word_count=len(re.findall(r"\b[A-Za-z][A-Za-z0-9&'–—-]*\b",visible))
        if word_count<850: issues.append(f"{file.name}: thin application copy ({word_count} words)")
        title_match=re.search(r"<title>(.*?)</title>",raw,re.S)
        title=re.sub(r"\s+"," ",title_match.group(1)).strip() if title_match else ""
        desc_nodes=matching(p,"meta",name="description"); desc=desc_nodes[0].get("content","") if len(desc_nodes)==1 else ""
        if not 35<=len(title)<=75: issues.append(f"{file.name}: title length {len(title)}")
        if not 120<=len(desc)<=180: issues.append(f"{file.name}: description length {len(desc)}")
        if title in titles: issues.append(f"{file.name}: duplicate title")
        if desc in descriptions: issues.append(f"{file.name}: duplicate description")
        titles.add(title); descriptions.add(desc)
        if len(re.findall(r"<h1\b",raw,re.I))!=1: issues.append(f"{file.name}: expected one H1")
        expected=f"{BASE}/solutions/{pdata['slug']}.html"
        canonical=matching(p,"link",rel="canonical")
        if len(canonical)!=1 or canonical[0].get("href")!=expected: issues.append(f"{file.name}: canonical")
        else: canonicals.add(expected)
        for lang in ("en","x-default"):
            if len([a for a in matching(p,"link",rel="alternate") if a.get("hreflang")==lang and a.get("href")==expected])!=1: issues.append(f"{file.name}: hreflang {lang}")
        if len(pdata["products"])<5 or len(set(pdata["products"]))!=len(pdata["products"]): issues.append(f"{file.name}: product breadth")
        if len(re.findall(r"<tr><th scope='row'>",raw))!=len(pdata["products"]): issues.append(f"{file.name}: product table count")
        for anchor in ("variables","selection","validation","metrics","rfq","faq"):
            if f'id="{anchor}"' not in raw: issues.append(f"{file.name}: missing #{anchor}")
        if len(p.scripts)!=1: issues.append(f"{file.name}: JSON-LD count"); continue
        try: data=json.loads(p.scripts[0]); types={x.get("@type") for x in data.get("@graph",[])}
        except Exception as exc: issues.append(f"{file.name}: JSON-LD {exc}"); continue
        if not {"WebPage","Service","BreadcrumbList","FAQPage"}.issubset(types): issues.append(f"{file.name}: schema types")
    for group in GROUPS:
        file=ROOT/"solutions"/group["hub"]; raw=file.read_text(encoding="utf-8-sig")
        if "phase-one-solutions-title" in raw or "PHASE-ONE-SOLUTION-CLUSTER" in raw: issues.append(f"{file.name}: obsolete link block remains")
        expected={p["slug"]+".html" for p in group["pages"]}
        pattern=rf'<a class="{re.escape(group["card_class"])}" href="([^"]+\.html)"'
        actual=set(re.findall(pattern,raw))
        if actual!=expected: issues.append(f"{file.name}: application links missing={sorted(expected-actual)} extra={sorted(actual-expected)}")
    html_files=list(ROOT.rglob("*.html")); broken=[]; missing_assets=[]
    for source in html_files:
        raw=source.read_text(encoding="utf-8-sig",errors="replace"); p=Parser(); p.feed(raw)
        ids=set(re.findall(r'\bid=["\']([^"\']+)',raw,re.I))
        for tag,a in p.tags:
            if tag=="a" and a.get("href"):
                target,fragment=local_target(source,a["href"])
                if target is None: continue
                if not target.exists(): broken.append(f"{source.relative_to(ROOT)} -> {a['href']}"); continue
                if fragment and target.suffix.lower() in {".html",".htm"}:
                    target_raw=target.read_text(encoding="utf-8-sig",errors="replace")
                    target_ids=ids if target==source.resolve() else set(re.findall(r'\bid=["\']([^"\']+)',target_raw,re.I))
                    if fragment not in target_ids: broken.append(f"{source.relative_to(ROOT)} -> {a['href']} (fragment)")
            if tag in {"img","script"} and a.get("src"):
                target,_=local_target(source,a["src"])
                if target is not None and not target.exists(): missing_assets.append(f"{source.relative_to(ROOT)} -> {a['src']}")
            if tag=="link" and a.get("href") and a.get("rel") in {"stylesheet","icon"}:
                target,_=local_target(source,a["href"])
                if target is not None and not target.exists(): missing_assets.append(f"{source.relative_to(ROOT)} -> {a['href']}")
    issues.extend("broken link: "+x for x in broken)
    issues.extend("missing asset: "+x for x in missing_assets)
    sitemap=ET.parse(ROOT/"sitemap.xml"); locs=[n.text.strip() for n in sitemap.iter() if n.tag.endswith("loc") and n.text]
    expected_urls={BASE+("/" if f.relative_to(ROOT).as_posix()=="index.html" else "/"+f.relative_to(ROOT).as_posix()) for f in html_files}
    if len(locs)!=len(set(locs)): issues.append("sitemap contains duplicate URLs")
    if set(locs)!=expected_urls: issues.append(f"sitemap mismatch: missing={sorted(expected_urls-set(locs))} extra={sorted(set(locs)-expected_urls)}")
    print(f"Application pages: {len(inventory)}")
    print(f"Unique canonicals: {len(canonicals)}")
    print(f"Linked parent hubs: {len(GROUPS)}")
    print(f"All HTML pages: {len(html_files)}")
    print(f"Broken local links/fragments: {len(broken)}")
    print(f"Missing local assets: {len(missing_assets)}")
    print(f"Sitemap URLs: {len(locs)}")
    print(f"Audit issues: {len(issues)}")
    for issue in issues: print("-",issue)
    raise SystemExit(1 if issues else 0)


if __name__=="__main__": main()

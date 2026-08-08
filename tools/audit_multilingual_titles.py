#!/usr/bin/env python3
"""Inventory multilingual title quality signals without treating length as a rule."""
from pathlib import Path
from collections import Counter, defaultdict
import html as html_std
import re
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
LANGS = {"ar":"ar", "de":"de", "es":"es", "pt":"pt-BR", "ru":"ru", "zh-cn":"zh-CN", "zh-tw":"zh-TW"}

def page_lang(path: Path) -> str:
    rel = path.relative_to(ROOT)
    return LANGS.get(rel.parts[0], "en") if rel.parts else "en"

def main():
    rows=[]
    for path in sorted(ROOT.rglob("*.html")):
        raw=path.read_text(encoding="utf-8")
        try: doc=html.fromstring(raw)
        except Exception: continue
        robots=" ".join(doc.xpath('//meta[@name="robots"]/@content')).lower()
        if "noindex" in robots: continue
        vals=doc.xpath('//title/text()')
        if len(vals)!=1: continue
        title=html_std.unescape(vals[0]).strip()
        rows.append((page_lang(path),path.relative_to(ROOT).as_posix(),title,len(title)))
    by_lang=defaultdict(list)
    for row in rows: by_lang[row[0]].append(row)
    for lang in ("en","de","es","pt-BR","ru","ar","zh-CN","zh-TW"):
        data=by_lang[lang]
        long=sum(n>70 for _,_,_,n in data)
        short=sum(n<(8 if lang.startswith("zh") else 25) for _,_,_,n in data)
        duplicates=sum(c-1 for c in Counter(t.casefold() for _,_,t,_ in data).values() if c>1)
        print(f"\n[{lang}] pages={len(data)} >70={long} short={short} duplicate_excess={duplicates}")
        for _,path,title,n in sorted(data,key=lambda r:r[3],reverse=True)[:15]:
            print(f"LONG {n:3} | {path} | {title}")
        for _,path,title,n in sorted((r for r in data if r[3]<(8 if lang.startswith('zh') else 25)),key=lambda r:r[3]):
            print(f"SHORT {n:3} | {path} | {title}")
        groups=defaultdict(list)
        for _,path,title,n in data: groups[title.casefold()].append(path)
        for key,paths in groups.items():
            if len(paths)>1:
                title=next(t for _,_,t,_ in data if t.casefold()==key)
                print(f"DUP {len(paths):3} | {title} | {', '.join(paths[:6])}")

if __name__=="__main__": main()

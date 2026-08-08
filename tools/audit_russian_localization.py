#!/usr/bin/env python3
"""Focused regression checks for Russian localization quality."""
from pathlib import Path
import re
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
RU = ROOT / "ru"
BAD = re.compile(
    r"para fornecimento|пищевого класса|кормового класса|контактные продаж|"
    r"удостоверени.{0,12}личност|репрезентатив|точн(?:ого|ый|ая) источник|"
    r"частн.{0,16}специфик|подписанн.{0,16}специфик|Инкотермсс|"
    r"Leaf-Safety|Сульфат натрия лаурил эфира|этиксилир|\bСКВ\b|"
    r"юридическ.{0,8}личност|удобрения для удобрения|Лиственное оплодотворение",
    re.I,
)
FOREIGN = re.compile(r"\b(?:Request a Quote|Contact Sales|Safety Data Sheet|Technical Data Sheet|Food Grade|Feed Grade|Category)\b", re.I)

def main():
    issues = []
    pages = sorted(RU.rglob("*.html"))
    for path in pages:
        raw = path.read_text(encoding="utf-8")
        if '"inLanguage":"en"' in raw:
            issues.append((path.relative_to(ROOT).as_posix(), "schema language", "inLanguage=en"))
        try:
            doc = html.fromstring(raw)
        except Exception as exc:
            issues.append((path.relative_to(ROOT).as_posix(), "HTML parse", str(exc)))
            continue
        visible = " ".join(doc.xpath("//text()[not(ancestor::script) and not(ancestor::style) and not(ancestor::code) and not(ancestor::pre)]"))
        for pattern, label in ((BAD, "machine phrase"), (FOREIGN, "English UI")):
            match = pattern.search(visible)
            if match:
                issues.append((path.relative_to(ROOT).as_posix(), label, match.group(0)))
        titles = doc.xpath("//title/text()")
        h1 = [" ".join(x.itertext()).strip() for x in doc.xpath("//h1")]
        if len(titles) != 1 or len(h1) != 1:
            issues.append((path.relative_to(ROOT).as_posix(), "title/H1 count", f"{len(titles)}/{len(h1)}"))
    print(f"Audited {len(pages)} Russian pages; issues: {len(issues)}")
    for issue in issues[:100]:
        print(" | ".join(issue))
    raise SystemExit(1 if issues else 0)

if __name__ == "__main__":
    main()

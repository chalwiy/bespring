#!/usr/bin/env python3
"""Apply the reviewed Bing title/description improvements to the reported pages."""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


UPDATES = {
    "zh-cn/products.html": {
        "description": "浏览百泉化工食品配料、饲料配料、水处理、工业清洗、矿业及农业化学品目录，按行业和用途查找产品，并获取规格、TDS、COA、SDS、包装与出口报价支持。",
    },
    "zh-cn/about/company-profile.html": {
        "description": "了解百泉化工自20世纪70年代以来的磷酸盐生产背景、主营产品、质量管理、全球供应网络与出口服务，供食品、饲料及工业化学品买家进行供应商评估。",
    },
    "zh-cn/contact.html": {
        "title": "联系百泉化工｜化工原料询盘、规格文件与出口报价",
        "description": "联系百泉化工国际销售团队，获取磷酸盐、食品配料、饲料添加剂及工业化学品的规格、TDS、COA、SDS、样品、包装方案、交期和目的港报价。",
    },
    "zh-cn/products/animal-nutrition.html": {
        "description": "浏览磷酸钙、氨基酸、有机酸、维生素、液体载体及功能性营养素等饲料配料，了解产品用途和采购要点，并索取规格、COA、包装与出口报价。",
    },
    "zh-tw/about/global-markets.html": {
        "title": "全球市場布局、化學品出口與國際物流服務｜百泉化工",
        "description": "了解百泉化工服務60多個國家與地區的市場布局，以及食品、飼料與工業化學品的文件準備、品質協調、包裝、港口物流和國際交付支援。",
    },
    "zh-cn/about/production-bases.html": {
        "title": "磷酸盐生产基地、质量检测与供应网络｜百泉化工",
        "description": "查看百泉化工在中国的磷酸盐生产基地与协同供应网络，了解原料管理、生产加工、质量检测、包装、仓储及出口装运之间的衔接方式。",
    },
    "zh-cn/about/core-values.html": {
        "title": "质量、诚信与可持续供应｜百泉化工核心价值观",
        "description": "了解百泉化工如何将质量、诚信、合作与可持续原则落实到供应商管理、产品文件、批次追溯、订单沟通、出口交付和长期客户合作中。",
    },
    "zh-cn/products/mining.html": {
        "title": "矿业浮选、浸出与水处理化学品供应商｜百泉化工",
        "description": "浏览浮选捕收剂、起泡剂、浸出与冶炼助剂、矿山水处理及精炼辅助化学品，按矿物加工环节查找产品，并索取规格、SDS、包装和出口报价。",
    },
    "zh-tw/products/mining.html": {
        "title": "礦業浮選、浸出與水處理化學品供應商｜百泉化工",
        "description": "瀏覽浮選捕收劑、起泡劑、浸出與冶煉助劑、礦山水處理及精煉輔助化學品，依礦物加工環節查找產品，並索取規格、SDS、包裝與出口報價。",
    },
    "zh-cn/about/global-markets.html": {
        "title": "全球市场、化学品出口与国际物流服务｜百泉化工",
        "description": "了解百泉化工服务60多个国家和地区的市场布局，以及食品、饲料和工业化学品的文件准备、质量协调、包装、港口物流与国际交付支持。",
    },
    "zh-cn/products/food-ingredients.html": {
        "description": "浏览食品级磷酸盐、防腐剂、酸味剂、乳化剂、胶体、蛋白和甜味剂等食品配料，按产品功能与应用查找原料，并获取规格、COA、包装及出口报价。",
    },
    "zh-tw/contact.html": {
        "title": "聯絡百泉化工｜化工原料詢盤、規格文件與出口報價",
        "description": "聯絡百泉化工國際銷售團隊，取得磷酸鹽、食品配料、飼料添加劑及工業化學品的規格、TDS、COA、SDS、樣品、包裝方案、交期與目的港報價。",
    },
    "zh-tw/products/animal-nutrition.html": {
        "description": "瀏覽磷酸鈣、胺基酸、有機酸、維生素、液體載體及功能性營養素等飼料配料，了解產品用途與採購要點，並索取規格、COA、包裝與出口報價。",
    },
    "es/solutions/agriculture-solutions.html": {
        "description": "Fosfatos y materias primas para fertilizantes y agricultura. Consulte aplicaciones, compatibilidad, documentación y requisitos de compra con Bespring.",
    },
    "zh-tw/products/water-treatment.html": {
        "title": "工業、市政與製程水處理化學品供應商｜百泉化工",
        "description": "瀏覽混凝劑、絮凝劑、消毒與殺菌滅藻原料、阻垢劑和中和胺等工業及市政水處理化學品，並索取產品規格、SDS、包裝與出口報價。",
    },
    "zh-tw/news.html": {
        "title": "化學品採購指南、產品知識與公司新聞｜百泉化工",
        "description": "閱讀百泉化工發布的化學品採購指南、產品比較、應用知識、品質文件與出口提示，以及展會和公司動態，協助國際買家提高選型與供應商評估效率。",
    },
}


def replace_title(text: str, value: str) -> str:
    text, count = re.subn(r"(<title>).*?(</title>)", rf"\g<1>{value}\g<2>", text, count=1, flags=re.I | re.S)
    if count != 1:
        raise ValueError("Expected exactly one title")
    for attribute, key in (("property", "og:title"), ("name", "twitter:title")):
        pattern = rf'(<meta\b(?=[^>]*\b{attribute}=["\']{re.escape(key)}["\'])(?=[^>]*\bcontent=["\']))([^>]*\bcontent=["\'])[^"\']*(["\'][^>]*>)'
        text, count = re.subn(pattern, rf"\g<1>\g<2>{value}\g<3>", text, count=1, flags=re.I)
        if count != 1:
            raise ValueError(f"Expected exactly one {key}")
    return text


def replace_description(text: str, value: str) -> str:
    for attribute, key in (("name", "description"), ("property", "og:description"), ("name", "twitter:description")):
        pattern = rf'(<meta\b(?=[^>]*\b{attribute}=["\']{re.escape(key)}["\'])(?=[^>]*\bcontent=["\']))([^>]*\bcontent=["\'])[^"\']*(["\'][^>]*>)'
        text, count = re.subn(pattern, rf"\g<1>\g<2>{value}\g<3>", text, count=1, flags=re.I)
        if count != 1:
            raise ValueError(f"Expected exactly one {key}")
    return text


def main() -> None:
    for relative, update in UPDATES.items():
        path = ROOT / relative
        text = path.read_bytes().decode("utf-8")
        if "title" in update:
            text = replace_title(text, update["title"])
        text = replace_description(text, update["description"])
        path.write_bytes(text.encode("utf-8"))
    print(f"Updated metadata on {len(UPDATES)} pages.")


if __name__ == "__main__":
    main()

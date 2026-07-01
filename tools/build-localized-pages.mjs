import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = "https://www.bespringchem.com";

const productItems = {
  food: [
    ["磷酸盐", "磷酸二铵（DAP）, 磷酸三钙, 磷酸氢钙, 磷酸二氢钙, 磷酸, 磷酸二钾, 磷酸三钾, 焦磷酸四钾（TKPP）, 焦磷酸四钠（TSPP）, 六偏磷酸钠（SHMP）, 三聚磷酸钠（STPP）, 酸式焦磷酸钠（SAPP）"],
    ["防腐保鲜", "EDTA, 赤藓糖酸钠, 丙酸钙, 丙酸钠, 双乙酸钠, 苯甲酸钠, 山梨酸钾, 山梨酸"],
    ["酸味剂与柠檬酸盐", "柠檬酸, 柠檬酸钙, 柠檬酸钾, 柠檬酸镁, 柠檬酸锌, 柠檬酸钠, 乳酸, 酒石酸氢钾"],
    ["乳化剂", "单甘酯（DMG）, 单双甘油脂肪酸酯（MDG）, 聚山梨醇酯, DATEM"],
    ["膳食纤维与胶体", "阿拉伯胶, 菊粉, 柑橘纤维, CMC, 卡拉胶, 结冷胶, 瓜尔胶, 果胶, 海藻酸钠, 黄原胶"],
    ["蛋白与碳水", "乳清蛋白, 乳糖, 豌豆蛋白, 大豆蛋白, 葡萄糖, 麦芽糊精, 赤藓糖醇, 山梨醇"]
  ],
  animal: [
    ["有机酸与酸化剂", "柠檬酸, 富马酸"],
    ["抗氧化与保鲜", "抗坏血酸（维生素 C）, 柠檬酸, 山梨酸钾"],
    ["常量矿物与缓冲盐", "氯化钠, 碳酸氢钠, 硫酸钠, 磷酸一钙（MCP）, 磷酸氢钙（DCP）"],
    ["液体载体与能量原料", "甘油, 一丙二醇（MPG USP）"],
    ["氨基酸", "DL-蛋氨酸, L-赖氨酸, L-苏氨酸, L-缬氨酸"],
    ["微量元素来源", "硫酸铜, 锰盐, 镁盐, 锌盐"],
    ["功能性营养素", "甜菜碱, 氯化胆碱"]
  ],
  homecare: [
    ["溶剂与载体", "乙醇, 异丙醇, 甘油, 一丙二醇"],
    ["无机助剂与盐类", "碳酸钙, 氯化钙, 纯碱, 碳酸氢钠, 硅酸钠, 硫酸钠"],
    ["表面活性剂", "苯扎氯铵（BAC）, 线性烷基苯磺酸（LABSA）, AES（SLES）"],
    ["酸类", "柠檬酸, 葡萄糖酸, 盐酸, 乳酸, 磷酸"],
    ["碱类", "氢氧化钾（KOH）, 氢氧化钠（NaOH）"],
    ["漂白与氧化剂", "过氧化氢, 二氯异氰尿酸钠（SDIC）, 过碳酸钠, 三氯异氰尿酸（TCCA）"]
  ],
  water: [
    ["杀菌灭藻与微生物控制", "次氯酸钠, 漂白粉, 氯, 硫酸铜, 季铵盐（QACs）, 溴化钠, 过氧乙酸（PAA）"],
    ["中和胺与冷凝水保护", "环己胺, 二乙醇胺（DEA）, 二乙氨基乙醇（DEAE）, MOPA, 单乙醇胺（MEA）, 吗啉"],
    ["混凝剂与初级处理", "硫酸铝, 氯化铝, 氯化羟铝（ACH）, DADMAC, 三氯化铁, 硫酸铁, 聚合氯化铝（PAC）, 偏铝酸钠"]
  ],
  mining: [
    ["矿山与工艺水处理", "硫酸铝, 氢氧化钠, 三氯化铁, 絮凝剂, 盐酸, 聚合氯化铝（PAC）, 生石灰/熟石灰, 纯碱, 碳酸氢钠, 六偏磷酸钠（SHMP）, 偏重亚硫酸钠（SMBS）, 硫酸"],
    ["浸出药剂", "氢氧化钠, 硫酸铜, 盐酸, 过氧化氢, 硝酸铅, 石灰, 纯碱, 偏重亚硫酸钠, 硫酸, 锌粉"],
    ["浮选药剂", "羧甲基纤维素（CMC）, 二硫代磷酸盐（DTP）, 乙二醇类, 甲基异丁基甲醇（MIBC）, 硫氢化钠, 硫化钠, 硫代氨基甲酸酯, 黄药系列（PAX / SIPX / SIBX）"],
    ["冶炼与电积辅助", "硫酸铜, 氧化铅, 纯碱, 硝酸钠, 氨基磺酸"],
    ["精炼与工艺化学品", "氯化钙, 碳酸钾, 氢氧化钾, 六偏磷酸钠, 偏重亚硫酸钠, 硅酸钠, 硫酸钠, 溶剂"]
  ],
  agri: [
    ["磷肥盐类", "磷酸二氢钾（MKP）, 磷酸氢二钾（DKP）, 磷酸一铵（MAP）, 磷酸二铵（DAP）, 焦磷酸钾（TKPP）"]
  ]
};

const languages = [
  {
    key: "zh-cn",
    lang: "zh-CN",
    ogLocale: "zh_CN",
    label: "简",
    otherLabel: "繁",
    dir: "zh-cn",
    siteName: "Bespring Chemical 百泉化工",
    nav: { home: "首页", about: "关于我们", products: "产品中心", services: "服务支持", news: "新闻资讯", contact: "联系我们" },
    footer: {
      intro: "面向全球 B2B 采购的食品配料、饲料配料及工业化学品出口供应商。",
      quick: "快捷导航",
      contact: "联系信息",
      touch: "发送询盘",
      rights: "版权所有。"
    },
    common: {
      topbar1: "中国化学品与配料出口供应商",
      topbar2: "服务 60+ 国家和地区",
      browseProducts: "浏览产品目录",
      prepareInquiry: "准备询盘",
      contactSales: "联系出口销售",
      viewAllProducts: "查看全部产品",
      sendRequirements: "提交采购需求",
      emailOnly: "您的信息仅用于回复业务询盘。"
    },
    aboutTabs: [
      ["company-profile.html", "公司简介"],
      ["production-bases.html", "生产基地"],
      ["global-markets.html", "全球市场"],
      ["certifications.html", "资质认证"],
      ["core-values.html", "核心价值观"]
    ],
    aboutPages: {
      "company-profile.html": {
        title: "关于百泉化工 | 食品配料、饲料配料与工业化学品出口商",
        description: "了解百泉化工的发展历程、主营产品、全球供应网络及出口服务能力，适用于食品、饲料和工业客户采购评估。",
        heroEyebrow: "公司简介",
        heroTitle: "百泉化工是谁",
        heroLead: "我们是一家立足中国、服务全球的化学品与配料供应商，长期专注于食品配料、饲料配料、磷酸盐及多类工业化学品出口。",
        image: "images/bespring-company-profile.jpg",
        imageAlt: "百泉化工厂区与办公环境",
        sectionTitle: "连接生产资源与国际买家的可靠供应伙伴",
        paragraphs: [
          "百泉化工的业务起点来自磷酸盐制造与应用经验，经过长期积累，逐步形成了覆盖食品、饲料和工业领域的出口型产品组合。",
          "今天，我们不仅供应自有优势磷酸盐产品，也整合经过审核的合作生产资源，为海外客户提供更稳定、更适配实际采购场景的供应方案。",
          "对于国际买家而言，我们的价值不仅是供货，还包括规格确认、文件配合、包装与装运协调，以及长期重复采购中的沟通效率。"
        ],
        panelTitle: "适合采购评估的关键信息",
        list: [
          "主营方向覆盖食品配料、饲料配料、水处理、家居与工业清洗、矿业和农业化学品。",
          "服务流程围绕产品识别、规格确认、单证协调和出口执行展开。",
          "业务面向全球多个市场，支持英文与中文沟通。"
        ],
        note: "页面中的信息用于帮助买家更快判断供应适配性，最终供货仍以具体产品、来源、规格与订单条款为准。"
      },
      "production-bases.html": {
        title: "生产基地与供应网络 | 百泉化工",
        description: "查看百泉化工在中国的协同生产与供应网络，了解生产、检测、仓储及出口衔接方式。",
        heroEyebrow: "生产基地",
        heroTitle: "中国协同生产网络",
        heroLead: "我们的供应模式并非依赖单一工厂，而是根据产品类别、规格要求和订单条件，从经过评估的协同资源中匹配更合适的生产与交付方案。",
        image: "images/production-network.jpg",
        imageAlt: "百泉化工中国供应网络示意",
        sectionTitle: "多区域协同，而不是单点供货",
        paragraphs: [
          "对国际化学品采购而言，稳定性来自清晰的资源分工、可验证的质量控制点以及靠近主要出口节点的执行能力。",
          "百泉化工围绕江苏、山东、四川、海南等合作区域建立协同网络，用于支撑不同产品类别和订单需求。",
          "这类网络化供给模式有助于提升产品选择弹性、出货衔接效率与风险分散能力。"
        ],
        panelTitle: "协同区域",
        cards: [
          ["01", "江苏", "客户协调、仓储衔接和华东出口通道的重要基础区域。"],
          ["02", "山东", "连接成熟化工制造资源与港口物流集群。"],
          ["03", "四川", "补充内陆生产资源，增强供应覆盖范围。"],
          ["04", "海南", "为部分南向供应场景提供更多灵活性。"]
        ]
      },
      "global-markets.html": {
        title: "全球市场与出口能力 | 百泉化工",
        description: "了解百泉化工向 60 多个国家和地区出口食品、饲料和工业化学品的市场布局与国际交付能力。",
        heroEyebrow: "全球市场",
        heroTitle: "服务 60+ 国家和地区的出口供应",
        heroLead: "我们从中国组织供应，通过清晰的规格确认、文件配合与装运协调，为国际买家提供更稳妥的化学品与配料采购支持。",
        image: "images/global-markets.jpg",
        imageAlt: "百泉化工全球出口业务",
        sectionTitle: "以国际客户需求为中心的中国供应能力",
        paragraphs: [
          "百泉化工的出口业务覆盖欧洲、美洲、中东和东南亚等核心区域，客户类型包括贸易商、配方企业、制造商和工业终端用户。",
          "不同市场对规格、标签、文件、运输与合规要求差异明显，因此国际采购更需要在询盘阶段把信息说明清楚。",
          "我们的工作重点，是帮助买家缩短从询盘到确认供货方案之间的沟通路径。"
        ],
        panelTitle: "重点服务区域",
        cards: [
          ["01", "欧洲", "偏重文件完整性、产品一致性与出口执行稳定性。"],
          ["02", "美洲", "强调供货节奏、规格确认与包装方案匹配。"],
          ["03", "中东", "关注价格敏感度、宗教相关文件和交付效率。"],
          ["04", "东南亚", "更常涉及灵活订量、交期响应和长期重复采购。"]
        ]
      },
      "certifications.html": {
        title: "资质认证与合规文件 | 百泉化工",
        description: "查看百泉化工可配合的质量、食品安全与宗教相关资质文件，并了解买家在审核证书时应重点核查的内容。",
        heroEyebrow: "资质认证",
        heroTitle: "证书有价值，适用范围更重要",
        heroLead: "国际采购中，真正有帮助的不是“证书很多”，而是证书是否对应正确的公司主体、产品、工厂和目标市场要求。",
        image: "images/certifications.jpg",
        imageAlt: "百泉化工认证与文件管理",
        sectionTitle: "把证书放回真实采购场景中审核",
        paragraphs: [
          "买家在审核质量或合规文件时，应同时关注文件主体、适用产品、有效期限、签发机构以及是否覆盖目标市场要求。",
          "百泉化工可根据具体产品和来源，配合提供相应的商业与质量文件，用于初步技术或合规评估。",
          "同一类产品在不同来源下的证书范围可能不同，因此请始终以当前实际报价对应的文件为准。"
        ],
        panelTitle: "常见审核重点",
        docs: [
          ["ISO", "ISO 9001 质量管理体系", "确认主体、适用范围及有效期。"],
          ["HALAL", "Halal 相关文件", "适用于有宗教合规要求的目标市场。"],
          ["KOSHER", "Kosher 相关文件", "用于特定食品客户审核场景。"],
          ["COA", "规格、SDS、COA 等配套文件", "用于技术、质量与采购流程衔接。"]
        ]
      },
      "core-values.html": {
        title: "核心价值观 | 百泉化工",
        description: "了解百泉化工在质量、诚信、合作与可持续方面的经营原则，以及这些原则如何体现在日常订单执行中。",
        heroEyebrow: "核心价值观",
        heroTitle: "让业务沟通更清晰的做事原则",
        heroLead: "价值观对我们来说不是口号，而是体现在询盘判断、规格确认、文件说明和订单执行中的日常标准。",
        image: "images/core-values.jpg",
        imageAlt: "百泉化工核心价值观",
        sectionTitle: "四项原则，落实到每一笔订单",
        paragraphs: [
          "在化学品出口业务中，误解通常来自范围不清、表达不准或把参考信息当成承诺信息。",
          "因此，我们强调质量优先、诚信沟通、合作共赢和可持续发展，希望让买卖双方都能在真实边界内做决策。",
          "这些原则会影响我们如何回复询盘、如何界定规格差异，以及如何安排长期合作。"
        ],
        panelTitle: "价值观在业务中的体现",
        cards: [
          ["01", "质量优先", "先确认产品、等级和关键指标，再谈是否进入报价与供货环节。"],
          ["02", "诚信沟通", "把参考资料、当前可提供资料和最终合同约定明确区分。"],
          ["03", "合作共赢", "兼顾买家需求与实际供应条件，寻找可执行方案。"],
          ["04", "可持续发展", "重视长期合作中的稳定性、可追溯性与持续改进。"]
        ]
      }
    },
    productsPage: {
      title: "产品中心 | 食品配料、饲料配料与工业化学品目录",
      description: "浏览百泉化工的食品配料、饲料配料、清洗化学品、水处理化学品、矿业化学品及农业原料产品中心。",
      heroTitle: "化学品与配料产品中心",
      heroLead: "按产品组合而不是按行业应用浏览，更适合采购与技术团队快速确认产品身份、等级、规格与出口询盘方向。",
      introTitle: "为工业采购整理的产品目录",
      introStrong: "百泉化工围绕食品、饲料和工业化学品建立了六大产品组合。",
      introText: "本页用于快速浏览可采购的产品方向；具体等级、来源、单证和供应条件请在子页面或询盘中确认。",
      cards: [
        ["food-ingredients.html", "食品配料与食品添加剂", "食品级产品组合", "磷酸盐、酸味剂、防腐剂、乳化剂、胶体、蛋白、甜味剂等。", "食品磷酸盐 / 防腐剂 / 酸味剂 / 增稠体系", "images/food-ingredients.jpg"],
        ["animal-nutrition.html", "饲料配料与动物营养", "饲料级产品组合", "矿物源、氨基酸、有机酸、液体载体及功能性营养素。", "MCP & DCP / 氨基酸 / 微量元素 / 酸化剂", "images/animal-nutrition.jpg"],
        ["home-care-industrial-cleaning.html", "家居与工业清洗化学品", "清洗原料组合", "表面活性剂、溶剂、无机助剂、酸碱与漂白氧化剂。", "表活 / 建材助剂 / 溶剂 / 碱类", "images/homecare-cleaning.jpg"],
        ["water-treatment.html", "水处理化学品", "水处理产品组合", "混凝剂、杀菌灭藻原料与冷凝水腐蚀控制相关化学品。", "PAC / ACH / 杀菌剂 / 胺类", "images/water-treatment.jpg"],
        ["mining.html", "矿业与选冶化学品", "矿业化学品组合", "浮选药剂、浸出药剂、工艺水处理及冶炼辅助化学品。", "黄药 / MIBC / 石灰 / 絮凝剂", "images/mining.jpg"],
        ["agricultural-fertilizers.html", "农业肥料原料", "肥料原料组合", "磷肥盐及相关钾盐原料，用于肥料制造与采购。", "MKP / MAP / DAP / DKP", "images/agriculture.jpg"]
      ]
    },
    servicesPage: {
      title: "服务支持 | 化学品出口与采购配套服务",
      description: "了解百泉化工在规格确认、文件配合、包装、仓储、出口物流与市场信息方面的服务支持。",
      heroTitle: "化学品出口与采购支持服务",
      heroLead: "从规格确认到出运协调，我们帮助国际买家把产品选择、文件准备和交付执行衔接得更顺畅。",
      introTitle: "围绕真实采购流程设计服务",
      introStrong: "我们的服务重点不是泛泛而谈，而是帮助买家更高效地完成一个具体产品的采购判断与出口执行。",
      introText: "服务范围始终以具体产品、来源、目标市场和订单条件为边界，不替代买方自身的法规、配方或安全审批责任。",
      cards: [
        ["规格与产品匹配", "核对化学名称、等级、浓度、关键指标与目标应用。", "产品身份确认 / 指标差异说明 / 样品可行性沟通"],
        ["文件与质量配合", "根据具体货源协调规格书、SDS、COA 格式及相关证书。", "TDS / SDS / COA / 适用证书"],
        ["包装与标签方案", "结合产品性质和订单需求确认袋装、桶装、IBC 或定制标签。", "包装形式 / 唛头标签 / 托盘方案"],
        ["仓储与拼柜协调", "对适合的产品安排合作仓储、集货和出口前衔接。", "华东港口资源 / 拼柜评估 / 出口前备货"],
        ["出口物流协调", "按确认的贸易条款处理装运节点、文件和危险品要求。", "装箱安排 / 港口协调 / 运输文件"],
        ["中国市场信息", "结合实际采购项目分享原料波动、供应状况与采购节奏参考。", "供需变化 / 价格驱动 / 采购时机"]
      ]
    },
    newsPage: {
      title: "新闻资讯 | 化学品采购洞察与公司动态",
      description: "查看百泉化工发布的化学品采购知识、产品比较、出口提示与公司动态，帮助国际买家提升决策效率。",
      heroTitle: "化学品采购洞察与新闻资讯",
      heroLead: "我们分享围绕产品选择、规格判断、出口文件和市场变化的实用内容，帮助买家更快获得有效信息。",
      sectionTitle: "近期内容",
      sectionText: "以下内容以采购场景为中心组织，适合需要比较产品、准备询盘或跟进市场变化的国际买家。",
      cards: [
        ["采购指南", "如何准备更有效的化学品询盘", "把产品名称、等级、关键指标、包装、数量和目的港说明清楚，可以显著减少往返沟通。"],
        ["采购指南", "食品级磷酸盐采购时应重点确认什么", "不同盐型、水合状态与功能用途会影响报价与适配性，不能只看简称。"],
        ["采购指南", "饲料配料文件审核的常见误区", "同一产品名不代表相同等级、来源和注册要求，文件范围必须逐项核对。"],
        ["市场观察", "中国原料波动对出口采购意味着什么", "价格变化背后通常伴随供需、环保、运输与季节性因素，需要结合交期判断。"],
        ["出口提示", "为什么同一产品不同市场要准备不同文件", "买家审核逻辑常与目的国法规、客户体系和运输条件直接相关。"],
        ["公司动态", "百泉化工持续优化全球买家响应流程", "围绕规格确认、资料整理和出口执行的响应效率，是长期合作中的重要体验。"]
      ]
    },
    contactPage: {
      title: "联系我们 | 询盘、报价与出口支持",
      description: "联系百泉化工获取产品规格、报价、样品、文件及国际发运支持，适用于食品、饲料与工业化学品采购。",
      heroTitle: "欢迎与我们讨论您的产品需求",
      heroLead: "无论您需要产品报价、样品、技术文件还是出口发运支持，都可以把采购需求发给我们。",
      leftTitle: "提交产品询盘",
      leftText: "请尽量说明产品名称、等级、目标规格、数量、包装和目的地，这会帮助我们更快给出更准确的回复。",
      consent: "我同意百泉化工使用这些信息回复我的业务询盘。",
      submit: "提交询盘",
      success: "询盘已发送成功，我们会尽快与您联系。",
      error: "发送失败，请稍后重试或直接邮件联系。"
    },
    categoryPages: {
      "food-ingredients.html": {
        title: "食品配料与食品添加剂供应商 | 百泉化工",
        description: "浏览食品级磷酸盐、防腐剂、酸味剂、乳化剂、胶体、蛋白和甜味剂等食品配料目录。",
        name: "食品配料与食品添加剂",
        shortName: "食品配料",
        eyebrow: "食品级产品组合",
        heroImage: "food-ingredients1.jpg",
        imageAlt: "百泉化工供应的食品级配料与添加剂",
        heroLead: "围绕食品级磷酸盐及相关配料建立的采购目录，便于买家快速识别产品方向，并进一步确认等级、规格和目标市场要求。",
        summaryTitle: "按材料家族整理的食品配料目录",
        directAnswer: "百泉化工可供应食品级磷酸盐、防腐剂、酸味剂、乳化剂、胶体、蛋白与多类功能性配料。",
        summaryText: "本页是采购目录，不是应用配方指南。若您已有明确产品名或标准，可直接结合规格要求向我们发起询盘。",
        catalogIntro: "以下列出常见食品配料方向。化学名与英文名会共同影响国际采购沟通与文件匹配。",
        categories: productItems.food,
        procurementTitle: "先确认食品级标准，再比较价格",
        procurementAnswer: "食品添加剂采购不能只看简称，应同时确认化学身份、食品级标准、关键指标、目标用途与目标市场。",
        procurementText: "同一成分可能存在不同水合形式、粒度、粘度或纯度标准。请以实际拟采购货源对应的规格和文件为准。"
      },
      "animal-nutrition.html": {
        title: "饲料配料与动物营养原料供应商 | 百泉化工",
        description: "浏览矿物源、氨基酸、有机酸、液体载体和功能性营养素等饲料配料目录。",
        name: "饲料配料与动物营养原料",
        shortName: "动物营养",
        eyebrow: "饲料级产品组合",
        heroImage: "feedadditives.jpg",
        imageAlt: "百泉化工供应的饲料配料与动物营养原料",
        heroLead: "围绕饲料采购和配方审核常见需求整理的原料目录，便于确认营养成分、浓度、物理形态与目标市场要求。",
        summaryTitle: "便于买家审核的饲料原料目录",
        directAnswer: "百泉化工的动物营养产品组合涵盖矿物源、氨基酸、酸化剂、保鲜原料、液体载体和功能性营养素。",
        summaryText: "原料是否适用取决于动物种类、配方体系、等级及当地法规要求。本页仅用于识别可供应方向。",
        catalogIntro: "查看原料类别后，请进一步确认等级、含量、物理形态和所需登记或文件。",
        categories: productItems.animal,
        procurementTitle: "确认有效成分与等级，而非只看名称",
        procurementAnswer: "饲料原料采购应明确营养成分身份、含量、可利用形式、载体系统和目标市场授权要求。",
        procurementText: "例如赖氨酸、胆碱氯化物或矿物磷酸盐，可能对应不同含量与物理形态，应基于规格而非产品名比较。"
      },
      "home-care-industrial-cleaning.html": {
        title: "家居与工业清洗化学品供应商 | 百泉化工",
        description: "浏览表面活性剂、溶剂、无机助剂、酸碱和漂白氧化剂等家居与工业清洗化学品目录。",
        name: "家居与工业清洗化学品",
        shortName: "清洗化学品",
        eyebrow: "清洗原料组合",
        heroImage: "homecareindustrialcleaning1.jpg",
        imageAlt: "百泉化工供应的家居与工业清洗化学品",
        heroLead: "围绕清洗配方常见原料方向建立目录，帮助买家确认活性含量、物理形态、危险属性和包装方案。",
        summaryTitle: "按材料家族整理的清洗原料目录",
        directAnswer: "百泉化工可供应表面活性剂、溶剂、无机建材、酸碱以及漂白氧化体系相关化学品。",
        summaryText: "本页识别的是可采购原料，不代表具体配方建议。实际使用性能和兼容性需结合完整配方体系评估。",
        catalogIntro: "可按常用中文名、英文化学名或常见缩写进行产品沟通。",
        categories: productItems.homecare,
        procurementTitle: "活性含量和危险属性必须说清楚",
        procurementAnswer: "清洗化学品询盘应明确活性含量或浓度、物理形态、关键杂质、包装需求和运输条件。",
        procurementText: "像 LABSA、SLES、过氧化氢和烧碱等产品，商业名称相同并不代表浓度或等级相同。"
      },
      "water-treatment.html": {
        title: "水处理化学品供应商 | 百泉化工",
        description: "浏览混凝剂、杀菌灭藻原料、中和胺等工业与市政水处理化学品目录。",
        name: "水处理化学品",
        shortName: "水处理",
        eyebrow: "水处理产品组合",
        heroImage: "watertreatment1.jpg",
        imageAlt: "百泉化工供应的水处理化学品",
        heroLead: "围绕水处理采购常见的混凝、杀菌灭藻和冷凝水保护体系建立目录，便于确认浓度、碱化度和目标系统要求。",
        summaryTitle: "服务实际水处理采购的核心化学体系",
        directAnswer: "百泉化工的水处理产品组合涵盖混凝剂、氧化或非氧化杀菌体系，以及用于冷凝水腐蚀控制的胺类产品。",
        summaryText: "产品选择与投加条件取决于水质、系统工况、排放要求和设备材质。本页仅用于识别化学体系方向。",
        catalogIntro: "可结合产品名称、家族类别或缩写如 PAC、ACH、QACs 等进行采购沟通。",
        categories: productItems.water,
        procurementTitle: "结合系统条件确认产品参数",
        procurementAnswer: "水处理化学品采购应明确活性含量、碱化度或电荷特性、杂质限制、物理形态和目标系统类型。",
        procurementText: "相同通用名称的产品在浓度、密度、金属含量和适用范围上可能存在实质差异。"
      },
      "mining.html": {
        title: "矿业与选冶化学品供应商 | 百泉化工",
        description: "浏览浮选药剂、浸出药剂、矿山水处理及精炼辅助化学品目录。",
        name: "矿业与选冶化学品",
        shortName: "矿业化学品",
        eyebrow: "矿业化学品组合",
        heroImage: "mining1.jpg",
        imageAlt: "百泉化工供应的矿业与选冶化学品",
        heroLead: "按浮选、浸出、工艺水处理和精炼阶段整理的矿业化学品目录，便于技术与采购团队快速对齐需求。",
        summaryTitle: "按工艺阶段组织的矿业化学品目录",
        directAnswer: "百泉化工的矿业化学品组合包括捕收剂、起泡剂、pH 调节剂、浸出原料、水处理药剂及部分冶炼辅助化学品。",
        summaryText: "药剂选择与使用条件取决于矿石性质、工艺流程、水化学和冶金测试结果。本页为采购目录，不替代工艺试验。",
        catalogIntro: "可按化学名、药剂家族或缩写如 MIBC、PAX、PAC、SMBS 等进行沟通。",
        categories: productItems.mining,
        procurementTitle: "先定义药剂等级和工艺背景",
        procurementAnswer: "矿业化学品询盘应尽量提供准确药剂名称、活性或纯度、物理形态、关键杂质、预计用量和物流要求。",
        procurementText: "捕收剂系列、起泡剂组成、石灰反应性或絮凝剂电荷特征，都会直接影响筛选与报价。"
      },
      "agricultural-fertilizers.html": {
        title: "农业肥料原料供应商 | 百泉化工",
        description: "浏览 MKP、DKP、MAP、DAP 及焦磷酸钾等农业肥料原料目录。",
        name: "农业肥料原料",
        shortName: "农业肥料",
        eyebrow: "肥料原料组合",
        heroImage: "agriculture-fertilizers1.jpg",
        imageAlt: "百泉化工供应的肥料盐类原料",
        heroLead: "围绕磷肥与相关钾盐建立的采购目录，重点关注等级、养分含量、溶解度、杂质控制与包装方案。",
        summaryTitle: "聚焦磷肥盐类的原料目录",
        directAnswer: "百泉化工可供应磷酸二氢钾、磷酸氢二钾、磷酸一铵、磷酸二铵和焦磷酸钾等产品。",
        summaryText: "同一盐类可对应不同工业级或肥料级标准，请结合养分声明、纯度与目标市场审核。",
        catalogIntro: "以下列出目前常见的磷肥盐类方向，适合肥料制造和原料采购初步筛选。",
        categories: productItems.agri,
        procurementTitle: "比较养分分析，不只比较缩写",
        procurementAnswer: "肥料盐采购应同时确认化学等级、养分含量、溶解度、水不溶物、杂质和粒度要求。",
        procurementText: "MAP、DAP 以及各类钾盐在不同规格下差异明显，缩写本身不能代替完整商业规格。"
      }
    }
  },
  {
    key: "zh-tw",
    lang: "zh-TW",
    ogLocale: "zh_TW",
    label: "繁",
    otherLabel: "简",
    dir: "zh-tw",
    siteName: "Bespring Chemical 百泉化工",
    nav: { home: "首頁", about: "關於我們", products: "產品中心", services: "服務支援", news: "新聞資訊", contact: "聯絡我們" },
    footer: {
      intro: "面向全球 B2B 採購的食品配料、飼料配料與工業化學品出口供應商。",
      quick: "快速導覽",
      contact: "聯絡資訊",
      touch: "發送詢盤",
      rights: "版權所有。"
    },
    common: {
      topbar1: "中國化學品與配料出口供應商",
      topbar2: "服務 60+ 國家與地區",
      browseProducts: "瀏覽產品目錄",
      prepareInquiry: "準備詢盤",
      contactSales: "聯絡出口銷售",
      viewAllProducts: "查看全部產品",
      sendRequirements: "提交採購需求",
      emailOnly: "您的資訊僅用於回覆業務詢盤。"
    },
    aboutTabs: [
      ["company-profile.html", "公司簡介"],
      ["production-bases.html", "生產基地"],
      ["global-markets.html", "全球市場"],
      ["certifications.html", "資質認證"],
      ["core-values.html", "核心價值觀"]
    ],
    aboutPages: {
      "company-profile.html": {
        title: "關於百泉化工 | 食品配料、飼料配料與工業化學品出口商",
        description: "了解百泉化工的發展歷程、主營產品、全球供應網路及出口服務能力，適合食品、飼料與工業客戶採購評估。",
        heroEyebrow: "公司簡介",
        heroTitle: "百泉化工是誰",
        heroLead: "我們是一家立足中國、服務全球的化學品與配料供應商，長期專注於食品配料、飼料配料、磷酸鹽與多類工業化學品出口。",
        image: "images/bespring-company-profile.jpg",
        imageAlt: "百泉化工廠區與辦公環境",
        sectionTitle: "連接生產資源與國際買家的可靠供應夥伴",
        paragraphs: [
          "百泉化工的業務起點來自磷酸鹽製造與應用經驗，經過長期累積，逐步形成覆蓋食品、飼料與工業領域的出口型產品組合。",
          "今天，我們不僅供應自有優勢磷酸鹽產品，也整合經過審核的合作生產資源，為海外客戶提供更穩定、更貼近實際採購場景的供應方案。",
          "對國際買家而言，我們提供的不只是供貨，還包括規格確認、文件配合、包裝與裝運協調，以及長期重複採購中的溝通效率。"
        ],
        panelTitle: "適合採購評估的關鍵資訊",
        list: [
          "主營方向涵蓋食品配料、飼料配料、水處理、家居與工業清洗、礦業與農業化學品。",
          "服務流程圍繞產品識別、規格確認、單證協調與出口執行展開。",
          "業務面向全球多個市場，支援英文與中文溝通。"
        ],
        note: "頁面資訊用於幫助買家更快判斷供應適配性，最終供貨仍以具體產品、來源、規格與訂單條款為準。"
      },
      "production-bases.html": {
        title: "生產基地與供應網路 | 百泉化工",
        description: "查看百泉化工在中國的協同生產與供應網路，了解生產、檢測、倉儲及出口銜接方式。",
        heroEyebrow: "生產基地",
        heroTitle: "中國協同生產網路",
        heroLead: "我們的供應模式並非依賴單一工廠，而是依據產品類別、規格要求與訂單條件，從經評估的協同資源中匹配更合適的生產與交付方案。",
        image: "images/production-network.jpg",
        imageAlt: "百泉化工中國供應網路示意",
        sectionTitle: "多區域協同，而不是單點供貨",
        paragraphs: [
          "對國際化學品採購而言，穩定性來自清晰的資源分工、可驗證的品質控制點，以及接近主要出口節點的執行能力。",
          "百泉化工圍繞江蘇、山東、四川、海南等合作區域建立協同網路，用於支撐不同產品類別與訂單需求。",
          "這類網路化供給模式有助於提升產品選擇彈性、出貨銜接效率與風險分散能力。"
        ],
        panelTitle: "協同區域",
        cards: [
          ["01", "江蘇", "客戶協調、倉儲銜接與華東出口通道的重要基礎區域。"],
          ["02", "山東", "連接成熟化工製造資源與港口物流集群。"],
          ["03", "四川", "補充內陸生產資源，提升供應覆蓋範圍。"],
          ["04", "海南", "為部分南向供應場景提供更多彈性。"]
        ]
      },
      "global-markets.html": {
        title: "全球市場與出口能力 | 百泉化工",
        description: "了解百泉化工向 60 多個國家與地區出口食品、飼料與工業化學品的市場布局與交付能力。",
        heroEyebrow: "全球市場",
        heroTitle: "服務 60+ 國家與地區的出口供應",
        heroLead: "我們從中國組織供應，透過清晰的規格確認、文件配合與裝運協調，為國際買家提供更穩妥的化學品與配料採購支援。",
        image: "images/global-markets.jpg",
        imageAlt: "百泉化工全球出口業務",
        sectionTitle: "以國際客戶需求為中心的中國供應能力",
        paragraphs: [
          "百泉化工的出口業務覆蓋歐洲、美洲、中東與東南亞等核心區域，客戶類型包括貿易商、配方企業、製造商與工業終端用戶。",
          "不同市場在規格、標籤、文件、運輸與合規要求上差異明顯，因此國際採購更需要在詢盤階段把資訊說清楚。",
          "我們的工作重點，是幫助買家縮短從詢盤到確認供貨方案之間的溝通路徑。"
        ],
        panelTitle: "重點服務區域",
        cards: [
          ["01", "歐洲", "偏重文件完整性、產品一致性與出口執行穩定性。"],
          ["02", "美洲", "強調供貨節奏、規格確認與包裝方案匹配。"],
          ["03", "中東", "關注價格敏感度、宗教相關文件與交付效率。"],
          ["04", "東南亞", "更常涉及彈性訂量、交期回應與長期重複採購。"]
        ]
      },
      "certifications.html": {
        title: "資質認證與合規文件 | 百泉化工",
        description: "查看百泉化工可配合的品質、食品安全與宗教相關資質文件，並了解買家審核證書時應重點核查的內容。",
        heroEyebrow: "資質認證",
        heroTitle: "證書有價值，適用範圍更重要",
        heroLead: "國際採購中，真正有幫助的不是『證書很多』，而是證書是否對應正確的公司主體、產品、工廠與目標市場要求。",
        image: "images/certifications.jpg",
        imageAlt: "百泉化工認證與文件管理",
        sectionTitle: "把證書放回真實採購場景中審核",
        paragraphs: [
          "買家在審核品質或合規文件時，應同時關注文件主體、適用產品、有效期限、簽發機構以及是否覆蓋目標市場要求。",
          "百泉化工可依具體產品與來源，配合提供相應的商業與品質文件，用於初步技術或合規評估。",
          "同一類產品在不同來源下的證書範圍可能不同，因此請始終以當前實際報價對應的文件為準。"
        ],
        panelTitle: "常見審核重點",
        docs: [
          ["ISO", "ISO 9001 品質管理系統", "確認主體、適用範圍與有效期。"],
          ["HALAL", "Halal 相關文件", "適用於有宗教合規要求的目標市場。"],
          ["KOSHER", "Kosher 相關文件", "用於特定食品客戶審核場景。"],
          ["COA", "規格、SDS、COA 等配套文件", "用於技術、品質與採購流程銜接。"]
        ]
      },
      "core-values.html": {
        title: "核心價值觀 | 百泉化工",
        description: "了解百泉化工在品質、誠信、合作與永續方面的經營原則，以及這些原則如何體現在日常訂單執行中。",
        heroEyebrow: "核心價值觀",
        heroTitle: "讓業務溝通更清晰的做事原則",
        heroLead: "價值觀對我們來說不是口號，而是體現在詢盤判斷、規格確認、文件說明與訂單執行中的日常標準。",
        image: "images/core-values.jpg",
        imageAlt: "百泉化工核心價值觀",
        sectionTitle: "四項原則，落實到每一筆訂單",
        paragraphs: [
          "在化學品出口業務中，誤解通常來自範圍不清、表達不準，或把參考資訊當成承諾資訊。",
          "因此，我們強調品質優先、誠信溝通、合作共贏與永續發展，希望讓買賣雙方都能在真實邊界內做決策。",
          "這些原則會影響我們如何回覆詢盤、如何界定規格差異，以及如何安排長期合作。"
        ],
        panelTitle: "價值觀在業務中的體現",
        cards: [
          ["01", "品質優先", "先確認產品、等級與關鍵指標，再討論是否進入報價與供貨環節。"],
          ["02", "誠信溝通", "把參考資料、當前可提供資料與最終合同約定明確區分。"],
          ["03", "合作共贏", "兼顧買家需求與實際供應條件，尋找可執行方案。"],
          ["04", "永續發展", "重視長期合作中的穩定性、可追溯性與持續改進。"]
        ]
      }
    },
    productsPage: {
      title: "產品中心 | 食品配料、飼料配料與工業化學品目錄",
      description: "瀏覽百泉化工的食品配料、飼料配料、清洗化學品、水處理化學品、礦業化學品及農業原料產品中心。",
      heroTitle: "化學品與配料產品中心",
      heroLead: "依產品組合而不是依行業應用瀏覽，更適合採購與技術團隊快速確認產品身份、等級、規格與出口詢盤方向。",
      introTitle: "為工業採購整理的產品目錄",
      introStrong: "百泉化工圍繞食品、飼料與工業化學品建立了六大產品組合。",
      introText: "本頁用於快速瀏覽可採購的產品方向；具體等級、來源、單證與供應條件請在子頁面或詢盤中確認。",
      cards: [
        ["food-ingredients.html", "食品配料與食品添加劑", "食品級產品組合", "磷酸鹽、酸味劑、防腐劑、乳化劑、膠體、蛋白、甜味劑等。", "食品磷酸鹽 / 防腐劑 / 酸味劑 / 增稠體系", "images/food-ingredients.jpg"],
        ["animal-nutrition.html", "飼料配料與動物營養", "飼料級產品組合", "礦物源、胺基酸、有機酸、液體載體與功能性營養素。", "MCP & DCP / 胺基酸 / 微量元素 / 酸化劑", "images/animal-nutrition.jpg"],
        ["home-care-industrial-cleaning.html", "家居與工業清洗化學品", "清洗原料組合", "表面活性劑、溶劑、無機助劑、酸鹼與漂白氧化劑。", "表活 / 建材助劑 / 溶劑 / 鹼類", "images/homecare-cleaning.jpg"],
        ["water-treatment.html", "水處理化學品", "水處理產品組合", "混凝劑、殺菌滅藻原料與冷凝水腐蝕控制相關化學品。", "PAC / ACH / 殺菌劑 / 胺類", "images/water-treatment.jpg"],
        ["mining.html", "礦業與選冶化學品", "礦業化學品組合", "浮選藥劑、浸出藥劑、工藝水處理及冶煉輔助化學品。", "黃藥 / MIBC / 石灰 / 絮凝劑", "images/mining.jpg"],
        ["agricultural-fertilizers.html", "農業肥料原料", "肥料原料組合", "磷肥鹽及相關鉀鹽原料，用於肥料製造與採購。", "MKP / MAP / DAP / DKP", "images/agriculture.jpg"]
      ]
    },
    servicesPage: {
      title: "服務支援 | 化學品出口與採購配套服務",
      description: "了解百泉化工在規格確認、文件配合、包裝、倉儲、出口物流與市場資訊方面的服務支援。",
      heroTitle: "化學品出口與採購支援服務",
      heroLead: "從規格確認到出運協調，我們幫助國際買家把產品選擇、文件準備與交付執行銜接得更順暢。",
      introTitle: "圍繞真實採購流程設計服務",
      introStrong: "我們的服務重點不是泛泛而談，而是幫助買家更高效地完成一個具體產品的採購判斷與出口執行。",
      introText: "服務範圍始終以具體產品、來源、目標市場與訂單條件為邊界，不替代買方自身的法規、配方或安全審批責任。",
      cards: [
        ["規格與產品匹配", "核對化學名稱、等級、濃度、關鍵指標與目標應用。", "產品身份確認 / 指標差異說明 / 樣品可行性溝通"],
        ["文件與品質配合", "依具體貨源協調規格書、SDS、COA 格式及相關證書。", "TDS / SDS / COA / 適用證書"],
        ["包裝與標籤方案", "結合產品性質與訂單需求確認袋裝、桶裝、IBC 或客製標籤。", "包裝形式 / 嘜頭標籤 / 托盤方案"],
        ["倉儲與拼櫃協調", "對適合的產品安排合作倉儲、集貨與出口前銜接。", "華東港口資源 / 拼櫃評估 / 出口前備貨"],
        ["出口物流協調", "依確認的貿易條款處理裝運節點、文件與危險品要求。", "裝箱安排 / 港口協調 / 運輸文件"],
        ["中國市場資訊", "結合實際採購項目分享原料波動、供應狀況與採購節奏參考。", "供需變化 / 價格驅動 / 採購時機"]
      ]
    },
    newsPage: {
      title: "新聞資訊 | 化學品採購洞察與公司動態",
      description: "查看百泉化工發布的化學品採購知識、產品比較、出口提示與公司動態，協助國際買家提升決策效率。",
      heroTitle: "化學品採購洞察與新聞資訊",
      heroLead: "我們分享圍繞產品選擇、規格判斷、出口文件與市場變化的實用內容，幫助買家更快取得有效資訊。",
      sectionTitle: "近期內容",
      sectionText: "以下內容以採購場景為中心組織，適合需要比較產品、準備詢盤或跟進市場變化的國際買家。",
      cards: [
        ["採購指南", "如何準備更有效的化學品詢盤", "把產品名稱、等級、關鍵指標、包裝、數量與目的港說清楚，可以明顯減少往返溝通。"],
        ["採購指南", "食品級磷酸鹽採購時應重點確認什麼", "不同鹽型、水合狀態與功能用途會影響報價與適配性，不能只看簡稱。"],
        ["採購指南", "飼料配料文件審核的常見誤區", "同一產品名不代表相同等級、來源與註冊要求，文件範圍必須逐項核對。"],
        ["市場觀察", "中國原料波動對出口採購意味著什麼", "價格變化背後通常伴隨供需、環保、運輸與季節性因素，需要結合交期判斷。"],
        ["出口提示", "為什麼同一產品不同市場要準備不同文件", "買家審核邏輯常與目的國法規、客戶體系與運輸條件直接相關。"],
        ["公司動態", "百泉化工持續優化全球買家回應流程", "圍繞規格確認、資料整理與出口執行的回應效率，是長期合作中的重要體驗。"]
      ]
    },
    contactPage: {
      title: "聯絡我們 | 詢盤、報價與出口支援",
      description: "聯絡百泉化工取得產品規格、報價、樣品、文件及國際發運支援，適用於食品、飼料與工業化學品採購。",
      heroTitle: "歡迎與我們討論您的產品需求",
      heroLead: "無論您需要產品報價、樣品、技術文件還是出口發運支援，都可以把採購需求發給我們。",
      leftTitle: "提交產品詢盤",
      leftText: "請盡量說明產品名稱、等級、目標規格、數量、包裝與目的地，這會幫助我們更快給出更準確的回覆。",
      consent: "我同意百泉化工使用這些資訊回覆我的業務詢盤。",
      submit: "提交詢盤",
      success: "詢盤已送出成功，我們會盡快與您聯絡。",
      error: "送出失敗，請稍後重試或直接以電子郵件聯絡。"
    },
    categoryPages: {
      "food-ingredients.html": {
        title: "食品配料與食品添加劑供應商 | 百泉化工",
        description: "瀏覽食品級磷酸鹽、防腐劑、酸味劑、乳化劑、膠體、蛋白與甜味劑等食品配料目錄。",
        name: "食品配料與食品添加劑",
        shortName: "食品配料",
        eyebrow: "食品級產品組合",
        heroImage: "food-ingredients1.jpg",
        imageAlt: "百泉化工供應的食品級配料與添加劑",
        heroLead: "圍繞食品級磷酸鹽及相關配料建立的採購目錄，便於買家快速識別產品方向，並進一步確認等級、規格與目標市場要求。",
        summaryTitle: "按材料家族整理的食品配料目錄",
        directAnswer: "百泉化工可供應食品級磷酸鹽、防腐劑、酸味劑、乳化劑、膠體、蛋白與多類功能性配料。",
        summaryText: "本頁是採購目錄，不是應用配方指南。若您已有明確產品名或標準，可直接結合規格要求向我們發起詢盤。",
        catalogIntro: "以下列出常見食品配料方向。化學名與英文名會共同影響國際採購溝通與文件匹配。",
        categories: productItems.food,
        procurementTitle: "先確認食品級標準，再比較價格",
        procurementAnswer: "食品添加劑採購不能只看簡稱，應同時確認化學身份、食品級標準、關鍵指標、目標用途與目標市場。",
        procurementText: "同一成分可能存在不同水合形式、粒度、黏度或純度標準。請以實際擬採購貨源對應的規格與文件為準。"
      },
      "animal-nutrition.html": {
        title: "飼料配料與動物營養原料供應商 | 百泉化工",
        description: "瀏覽礦物源、胺基酸、有機酸、液體載體與功能性營養素等飼料配料目錄。",
        name: "飼料配料與動物營養原料",
        shortName: "動物營養",
        eyebrow: "飼料級產品組合",
        heroImage: "feedadditives.jpg",
        imageAlt: "百泉化工供應的飼料配料與動物營養原料",
        heroLead: "圍繞飼料採購與配方審核常見需求整理的原料目錄，便於確認營養成分、濃度、物理形態與目標市場要求。",
        summaryTitle: "便於買家審核的飼料原料目錄",
        directAnswer: "百泉化工的動物營養產品組合涵蓋礦物源、胺基酸、酸化劑、保鮮原料、液體載體與功能性營養素。",
        summaryText: "原料是否適用取決於動物種類、配方體系、等級及當地法規要求。本頁僅用於識別可供應方向。",
        catalogIntro: "查看原料類別後，請進一步確認等級、含量、物理形態與所需登記或文件。",
        categories: productItems.animal,
        procurementTitle: "確認有效成分與等級，而非只看名稱",
        procurementAnswer: "飼料原料採購應明確營養成分身份、含量、可利用形式、載體系統與目標市場授權要求。",
        procurementText: "例如賴胺酸、膽鹼氯化物或礦物磷酸鹽，可能對應不同含量與物理形態，應基於規格而非產品名比較。"
      },
      "home-care-industrial-cleaning.html": {
        title: "家居與工業清洗化學品供應商 | 百泉化工",
        description: "瀏覽表面活性劑、溶劑、無機助劑、酸鹼與漂白氧化劑等家居與工業清洗化學品目錄。",
        name: "家居與工業清洗化學品",
        shortName: "清洗化學品",
        eyebrow: "清洗原料組合",
        heroImage: "homecareindustrialcleaning1.jpg",
        imageAlt: "百泉化工供應的家居與工業清洗化學品",
        heroLead: "圍繞清洗配方常見原料方向建立目錄，幫助買家確認活性含量、物理形態、危險屬性與包裝方案。",
        summaryTitle: "按材料家族整理的清洗原料目錄",
        directAnswer: "百泉化工可供應表面活性劑、溶劑、無機建材、酸鹼以及漂白氧化體系相關化學品。",
        summaryText: "本頁識別的是可採購原料，不代表具體配方建議。實際使用性能與相容性需結合完整配方體系評估。",
        catalogIntro: "可依常用中文名、英文化學名或常見縮寫進行產品溝通。",
        categories: productItems.homecare,
        procurementTitle: "活性含量與危險屬性必須說清楚",
        procurementAnswer: "清洗化學品詢盤應明確活性含量或濃度、物理形態、關鍵雜質、包裝需求與運輸條件。",
        procurementText: "像 LABSA、SLES、過氧化氫與燒鹼等產品，商業名稱相同並不代表濃度或等級相同。"
      },
      "water-treatment.html": {
        title: "水處理化學品供應商 | 百泉化工",
        description: "瀏覽混凝劑、殺菌滅藻原料、中和胺等工業與市政水處理化學品目錄。",
        name: "水處理化學品",
        shortName: "水處理",
        eyebrow: "水處理產品組合",
        heroImage: "watertreatment1.jpg",
        imageAlt: "百泉化工供應的水處理化學品",
        heroLead: "圍繞水處理採購常見的混凝、殺菌滅藻與冷凝水保護體系建立目錄，便於確認濃度、鹼化度與目標系統要求。",
        summaryTitle: "服務實際水處理採購的核心化學體系",
        directAnswer: "百泉化工的水處理產品組合涵蓋混凝劑、氧化或非氧化殺菌體系，以及用於冷凝水腐蝕控制的胺類產品。",
        summaryText: "產品選擇與投加條件取決於水質、系統工況、排放要求與設備材質。本頁僅用於識別化學體系方向。",
        catalogIntro: "可結合產品名稱、家族類別或縮寫如 PAC、ACH、QACs 等進行採購溝通。",
        categories: productItems.water,
        procurementTitle: "結合系統條件確認產品參數",
        procurementAnswer: "水處理化學品採購應明確活性含量、鹼化度或電荷特性、雜質限制、物理形態與目標系統類型。",
        procurementText: "相同通用名稱的產品在濃度、密度、金屬含量與適用範圍上可能存在實質差異。"
      },
      "mining.html": {
        title: "礦業與選冶化學品供應商 | 百泉化工",
        description: "瀏覽浮選藥劑、浸出藥劑、礦山水處理及精煉輔助化學品目錄。",
        name: "礦業與選冶化學品",
        shortName: "礦業化學品",
        eyebrow: "礦業化學品組合",
        heroImage: "mining1.jpg",
        imageAlt: "百泉化工供應的礦業與選冶化學品",
        heroLead: "按浮選、浸出、工藝水處理與精煉階段整理的礦業化學品目錄，便於技術與採購團隊快速對齊需求。",
        summaryTitle: "按工藝階段組織的礦業化學品目錄",
        directAnswer: "百泉化工的礦業化學品組合包括捕收劑、起泡劑、pH 調節劑、浸出原料、水處理藥劑及部分冶煉輔助化學品。",
        summaryText: "藥劑選擇與使用條件取決於礦石性質、工藝流程、水化學與冶金測試結果。本頁為採購目錄，不替代工藝試驗。",
        catalogIntro: "可依化學名、藥劑家族或縮寫如 MIBC、PAX、PAC、SMBS 等進行溝通。",
        categories: productItems.mining,
        procurementTitle: "先定義藥劑等級與工藝背景",
        procurementAnswer: "礦業化學品詢盤應盡量提供準確藥劑名稱、活性或純度、物理形態、關鍵雜質、預估用量與物流要求。",
        procurementText: "捕收劑系列、起泡劑組成、石灰反應性或絮凝劑電荷特徵，都會直接影響篩選與報價。"
      },
      "agricultural-fertilizers.html": {
        title: "農業肥料原料供應商 | 百泉化工",
        description: "瀏覽 MKP、DKP、MAP、DAP 及焦磷酸鉀等農業肥料原料目錄。",
        name: "農業肥料原料",
        shortName: "農業肥料",
        eyebrow: "肥料原料組合",
        heroImage: "agriculture-fertilizers1.jpg",
        imageAlt: "百泉化工供應的肥料鹽類原料",
        heroLead: "圍繞磷肥與相關鉀鹽建立的採購目錄，重點關注等級、養分含量、溶解度、雜質控制與包裝方案。",
        summaryTitle: "聚焦磷肥鹽類的原料目錄",
        directAnswer: "百泉化工可供應磷酸二氫鉀、磷酸氫二鉀、磷酸一銨、磷酸二銨與焦磷酸鉀等產品。",
        summaryText: "同一鹽類可對應不同工業級或肥料級標準，請結合養分聲明、純度與目標市場審核。",
        catalogIntro: "以下列出目前常見的磷肥鹽類方向，適合肥料製造與原料採購初步篩選。",
        categories: productItems.agri,
        procurementTitle: "比較養分分析，不只比較縮寫",
        procurementAnswer: "肥料鹽採購應同時確認化學等級、養分含量、溶解度、水不溶物、雜質與粒度要求。",
        procurementText: "MAP、DAP 以及各類鉀鹽在不同規格下差異明顯，縮寫本身不能代替完整商業規格。"
      }
    }
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function jsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function relToSite(pagePath, targetPath) {
  const currentDir = path.posix.dirname(pagePath);
  const relative = path.posix.relative(currentDir, targetPath);
  return relative || ".";
}

function canonicalUrl(pagePath) {
  const clean = pagePath.startsWith("/") ? pagePath.slice(1) : pagePath;
  return `${site}/${clean}`;
}

function linkSet(pagePath, language) {
  const current = canonicalUrl(`${language.dir}/${pagePath}`);
  const en = canonicalUrl(pagePath);
  const zhCn = canonicalUrl(`zh-cn/${pagePath}`);
  const zhTw = canonicalUrl(`zh-tw/${pagePath}`);
  return { current, en, zhCn, zhTw };
}

function languageLinks(pagePath, language) {
  const here = relToSite(`${language.dir}/${pagePath}`, pagePath);
  const zhCn = relToSite(`${language.dir}/${pagePath}`, `zh-cn/${pagePath}`);
  const zhTw = relToSite(`${language.dir}/${pagePath}`, `zh-tw/${pagePath}`);
  return `
        <div class="bs-seo-language" aria-label="Language selection">
          <a href="${escapeHtml(here)}" hreflang="en">EN</a>
          <a href="${escapeHtml(zhCn)}" hreflang="zh-CN"${language.dir === "zh-cn" ? ' class="active" aria-current="page"' : ""}>简</a>
          <a href="${escapeHtml(zhTw)}" hreflang="zh-TW"${language.dir === "zh-tw" ? ' class="active" aria-current="page"' : ""}>繁</a>
        </div>`;
}

function header(pagePath, language, active) {
  const base = `${language.dir}/${pagePath}`;
  return `<div class="bs-seo-topbar">
    <div class="container bs-seo-topbar-container">
      <div class="bs-seo-topbar-left">
        <span class="bs-seo-highlight"><i class="fas fa-industry" aria-hidden="true"></i> ${escapeHtml(language.common.topbar1)}</span>
        <span class="bs-seo-divider" aria-hidden="true">|</span>
        <span><i class="fas fa-globe" aria-hidden="true"></i> ${escapeHtml(language.common.topbar2)}</span>
      </div>
      <div class="bs-seo-topbar-right">
        <a href="mailto:info@bespringchem.com" class="bs-seo-contact"><i class="fas fa-envelope" aria-hidden="true"></i> info@bespringchem.com</a>
        <a href="tel:+8613914896109" class="bs-seo-contact"><i class="fas fa-phone" aria-hidden="true"></i> +86 139 1489 6109</a>
        <a href="https://wa.me/8613914896109" class="bs-seo-contact" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp</a>
        ${languageLinks(pagePath, language)}
      </div>
    </div>
  </div>
  <header class="site-header">
    <div class="container nav-container">
      <div class="logo"><a href="${escapeHtml(relToSite(base, `${language.dir}/index.html`))}" aria-label="${escapeHtml(language.siteName)} home"><img src="${escapeHtml(relToSite(base, "images/logo.png"))}" alt="Bespring Chemical"></a></div>
      <nav class="main-nav" aria-label="Main navigation"><ul>
        <li><a href="${escapeHtml(relToSite(base, `${language.dir}/index.html`))}"${active === "home" ? ' aria-current="page"' : ""}>${escapeHtml(language.nav.home)}</a></li>
        <li><a href="${escapeHtml(relToSite(base, `${language.dir}/about/company-profile.html`))}"${active === "about" ? ' aria-current="page"' : ""}>${escapeHtml(language.nav.about)}</a></li>
        <li><a href="${escapeHtml(relToSite(base, `${language.dir}/products.html`))}"${active === "products" ? ' aria-current="page"' : ""}>${escapeHtml(language.nav.products)}</a></li>
        <li><a href="${escapeHtml(relToSite(base, `${language.dir}/services.html`))}"${active === "services" ? ' aria-current="page"' : ""}>${escapeHtml(language.nav.services)}</a></li>
        <li><a href="${escapeHtml(relToSite(base, `${language.dir}/news.html`))}"${active === "news" ? ' aria-current="page"' : ""}>${escapeHtml(language.nav.news)}</a></li>
        <li><a href="${escapeHtml(relToSite(base, `${language.dir}/contact.html`))}" class="btn-nav"${active === "contact" ? ' aria-current="page"' : ""}>${escapeHtml(language.nav.contact)}</a></li>
      </ul></nav>
      <button class="hamburger" type="button" aria-label="Open navigation menu" aria-expanded="false"><i class="fas fa-bars" aria-hidden="true"></i></button>
    </div>
  </header>`;
}

function footer(pagePath, language) {
  const base = `${language.dir}/${pagePath}`;
  return `<footer class="crc-footer">
    <div class="container footer-grid">
      <div class="footer-col">
        <h3>Bespring Chemical</h3>
        <p>${escapeHtml(language.footer.intro)}</p>
        <ul class="social-icons1">
          <li><a href="https://www.facebook.com/profile.php?id=61560682190445" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fab fa-facebook-f" aria-hidden="true"></i></a></li>
          <li><a href="https://www.linkedin.com/company/bespring" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fab fa-linkedin-in" aria-hidden="true"></i></a></li>
        </ul>
      </div>
      <div class="footer-col footer-links">
        <h3>${escapeHtml(language.footer.quick)}</h3>
        <ul>
          <li><a href="${escapeHtml(relToSite(base, `${language.dir}/about/company-profile.html`))}">${escapeHtml(language.nav.about)}</a></li>
          <li><a href="${escapeHtml(relToSite(base, `${language.dir}/products.html`))}">${escapeHtml(language.nav.products)}</a></li>
          <li><a href="${escapeHtml(relToSite(base, `${language.dir}/services.html`))}">${escapeHtml(language.nav.services)}</a></li>
          <li><a href="${escapeHtml(relToSite(base, `${language.dir}/news.html`))}">${escapeHtml(language.nav.news)}</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>${escapeHtml(language.footer.contact)}</h3>
        <p><i class="fas fa-phone-alt" aria-hidden="true"></i> Sales: <a href="tel:+8613914896109">+86 139 1489 6109</a></p>
        <p><i class="fas fa-phone-alt" aria-hidden="true"></i> Office: <a href="tel:+8651680568559">+86 516 8056 8559</a></p>
        <p><i class="fas fa-envelope" aria-hidden="true"></i> <a href="mailto:info@bespringchem.com">info@bespringchem.com</a></p>
        <p><i class="fas fa-location-dot" aria-hidden="true"></i> Ruixing North Road, Yunhe Town, Pizhou City, Jiangsu Province, China</p>
        <a href="${escapeHtml(relToSite(base, `${language.dir}/contact.html`))}" class="contact-btn-footer"><i class="fas fa-paper-plane" aria-hidden="true"></i> ${escapeHtml(language.footer.touch)}</a>
      </div>
    </div>
    <div class="footer-bottom">&copy; 2026 Bespring Chemical Co., Ltd. ${escapeHtml(language.footer.rights)}</div>
  </footer>`;
}

function scriptCommon() {
  return `<script>
    const hamburger = document.querySelector(".hamburger");
    const navigation = document.querySelector(".main-nav");
    hamburger?.addEventListener("click", () => {
      const open = navigation.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", String(open));
      hamburger.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    });
  </script>`;
}

function head(pagePath, language, title, description, bodyClass, cssPaths, schema, extraMeta = "") {
  const links = linkSet(pagePath, language);
  const cssMarkup = cssPaths.map((href) => `<link rel="stylesheet" href="${escapeHtml(relToSite(`${language.dir}/${pagePath}`, href))}">`).join("");
  return `<!DOCTYPE html>
<html lang="${escapeHtml(language.lang)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="Bespring Chemical Co., Ltd.">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${escapeHtml(links.current)}">
  <link rel="alternate" href="${escapeHtml(links.en)}" hreflang="en">
  <link rel="alternate" href="${escapeHtml(links.zhCn)}" hreflang="zh-CN">
  <link rel="alternate" href="${escapeHtml(links.zhTw)}" hreflang="zh-TW">
  <link rel="alternate" href="${escapeHtml(links.en)}" hreflang="x-default">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Bespring Chemical">
  <meta property="og:locale" content="${escapeHtml(language.ogLocale)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(links.current)}">
  <meta property="og:image" content="${site}/images/products-og.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${site}/images/products-og.jpg">
  ${extraMeta}
  <link rel="icon" href="${escapeHtml(relToSite(`${language.dir}/${pagePath}`, "images/favicon.ico"))}">
  ${cssMarkup}
  <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <script type="application/ld+json">${jsonLd(schema)}</script>
</head>
<body class="${escapeHtml(bodyClass)} localized-cjk">`;
}

function aboutSchema(pagePath, language, page) {
  const current = canonicalUrl(`${language.dir}/${pagePath}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${current}#webpage`,
        url: current,
        name: page.title,
        description: page.description,
        inLanguage: language.lang,
        isPartOf: { "@type": "WebSite", "@id": `${site}/#website`, url: `${site}/`, name: "Bespring Chemical" }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${current}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: language.nav.home, item: canonicalUrl(`${language.dir}/index.html`) },
          { "@type": "ListItem", position: 2, name: language.nav.about, item: canonicalUrl(`${language.dir}/about/company-profile.html`) },
          { "@type": "ListItem", position: 3, name: page.heroEyebrow, item: current }
        ]
      }
    ]
  };
}

function renderAbout(pagePath, language, page) {
  const tabs = language.aboutTabs.map(([file, label]) => `<li><a href="${escapeHtml(file)}"${file === pagePath ? ' aria-current="page"' : ""}>${escapeHtml(label)}</a></li>`).join("");
  const cards = (page.cards || []).map(([tag, title, text]) => `<article class="localized-about-card"><span>${escapeHtml(tag)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("");
  const docs = (page.docs || []).map(([tag, title, text]) => `<article class="localized-about-doc"><span>${escapeHtml(tag)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("");
  const listMarkup = (page.list || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const currentBase = `${language.dir}/about/${pagePath}`;
  return `${head(`about/${pagePath}`, language, page.title, page.description, "editorial-page localized-about-page", ["css/style.css", "css/site-pages.css", "css/localized-content.css"], aboutSchema(`about/${pagePath}`, language, page))}
  ${header(`about/${pagePath}`, language, "about")}
  <main>
    <section class="ep-hero" style="--ep-image:url('${escapeHtml(relToSite(currentBase, "images/about-banner.jpg"))}')">
      <div class="container">
        <nav class="ep-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="${escapeHtml(relToSite(currentBase, `${language.dir}/index.html`))}">${escapeHtml(language.nav.home)}</a></li><li><a href="${escapeHtml(relToSite(currentBase, `${language.dir}/about/company-profile.html`))}">${escapeHtml(language.nav.about)}</a></li><li aria-current="page">${escapeHtml(page.heroEyebrow)}</li></ol></nav>
        <p class="ep-eyebrow">${escapeHtml(page.heroEyebrow)}</p>
        <h1>${escapeHtml(page.heroTitle)}</h1>
        <p class="ep-hero__lead">${escapeHtml(page.heroLead)}</p>
      </div>
    </section>
    <nav class="localized-about-nav" aria-label="${escapeHtml(language.nav.about)}">
      <div class="container"><ul>${tabs}</ul></div>
    </nav>
    <section class="localized-about-section">
      <div class="container localized-about-grid">
        <div class="localized-about-media"><img src="${escapeHtml(relToSite(currentBase, page.image))}" alt="${escapeHtml(page.imageAlt)}" loading="eager"></div>
        <div class="localized-about-copy">
          <p class="ep-eyebrow">${escapeHtml(page.heroEyebrow)}</p>
          <h2>${escapeHtml(page.sectionTitle)}</h2>
          ${page.paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}
          <div class="localized-about-actions">
            <a class="ep-btn ep-btn--primary" href="${escapeHtml(relToSite(currentBase, `${language.dir}/products.html`))}">${escapeHtml(language.common.browseProducts)}</a>
            <a class="ep-btn ep-btn--outline" href="${escapeHtml(relToSite(currentBase, `${language.dir}/contact.html`))}">${escapeHtml(language.common.contactSales)}</a>
          </div>
        </div>
      </div>
    </section>
    <section class="localized-about-section" style="padding-top:0">
      <div class="container localized-about-panel">
        <p class="ep-eyebrow">${escapeHtml(page.heroEyebrow)}</p>
        <h2>${escapeHtml(page.panelTitle)}</h2>
        ${listMarkup ? `<ul class="localized-about-list">${listMarkup}</ul>` : ""}
        ${cards ? `<div class="localized-about-card-grid">${cards}</div>` : ""}
        ${docs ? `<div class="localized-about-card-grid">${docs}</div>` : ""}
        ${page.note ? `<p class="localized-about-note">${escapeHtml(page.note)}</p>` : ""}
      </div>
    </section>
    <section class="localized-about-cta">
      <div class="container localized-about-cta-box">
        <div>
          <p class="ep-eyebrow">${escapeHtml(language.nav.contact)}</p>
          <h2>${escapeHtml(language.common.sendRequirements)}</h2>
          <p>${escapeHtml(language.key === "zh-cn" ? "欢迎发送产品名称、规格要求、包装、数量和目的市场，我们会结合实际供应条件与您对接。" : "歡迎發送產品名稱、規格要求、包裝、數量與目標市場，我們會結合實際供應條件與您對接。")}</p>
        </div>
        <a class="ep-btn ep-btn--white" href="${escapeHtml(relToSite(currentBase, `${language.dir}/contact.html`))}">${escapeHtml(language.nav.contact)}</a>
      </div>
    </section>
  </main>
  ${footer(`about/${pagePath}`, language)}
  ${scriptCommon()}
</body>
</html>`;
}

function productsSchema(pagePath, language, cards) {
  const current = canonicalUrl(`${language.dir}/${pagePath}`);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cards.title,
    url: current,
    description: cards.description,
    inLanguage: language.lang,
    hasPart: cards.cards.map(([file, title]) => ({
      "@type": "CollectionPage",
      name: title,
      url: canonicalUrl(`${language.dir}/products/${file}`)
    }))
  };
}

function renderProducts(language) {
  const page = language.productsPage;
  const pagePath = "products.html";
  const currentBase = `${language.dir}/${pagePath}`;
  const cards = page.cards.map(([file, title, type, desc, tags, image]) => `<article class="pp-card">
      <a class="pp-card__media" href="products/${escapeHtml(file)}"><img src="${escapeHtml(relToSite(currentBase, image))}" alt="${escapeHtml(title)}" loading="lazy"><span>${escapeHtml(language.common.viewAllProducts)}</span></a>
      <div class="pp-card__body">
        <p class="pp-card__type">${escapeHtml(type)}</p>
        <h3><a href="products/${escapeHtml(file)}">${escapeHtml(title)}</a></h3>
        <p>${escapeHtml(desc)}</p>
        <ul class="pp-tags">${tags.split(" / ").map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>
        <a class="pp-card__link" href="products/${escapeHtml(file)}">${escapeHtml(language.common.browseProducts)} <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
      </div>
    </article>`).join("");
  return `${head(pagePath, language, page.title, page.description, "products-landing", ["css/style.css", "css/products-page.css", "css/localized-content.css"], productsSchema(pagePath, language, page))}
  ${header(pagePath, language, "products")}
  <main id="main-content">
    <section class="pp-hero">
      <div class="container">
        <nav class="pp-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="index.html">${escapeHtml(language.nav.home)}</a></li><li aria-current="page">${escapeHtml(language.nav.products)}</li></ol></nav>
        <div class="pp-hero__grid">
          <div>
            <p class="pp-eyebrow">${escapeHtml(language.nav.products)}</p>
            <h1>${escapeHtml(page.heroTitle)}</h1>
            <p class="pp-hero__lead">${escapeHtml(page.heroLead)}</p>
            <div class="pp-hero__actions">
              <a class="pp-button pp-button--primary" href="#portfolios">${escapeHtml(language.common.browseProducts)}</a>
              <a class="pp-button pp-button--outline" href="contact.html">${escapeHtml(language.common.prepareInquiry)}</a>
            </div>
          </div>
          <aside class="pp-hero__panel" aria-label="Procurement overview">
            <p class="pp-panel__label">${escapeHtml(language.key === "zh-cn" ? "采购沟通建议" : "採購溝通建議")}</p>
            <ul>
              <li><span>01</span><div><strong>${escapeHtml(language.key === "zh-cn" ? "明确产品身份" : "明確產品身份")}</strong><small>${escapeHtml(language.key === "zh-cn" ? "化学名称、等级、CAS 或食品/饲料级属性。" : "化學名稱、等級、CAS 或食品/飼料級屬性。")}</small></div></li>
              <li><span>02</span><div><strong>${escapeHtml(language.key === "zh-cn" ? "说明目标规格" : "說明目標規格")}</strong><small>${escapeHtml(language.key === "zh-cn" ? "把含量、粒度、pH、粘度等关键指标写清楚。" : "把含量、粒度、pH、黏度等關鍵指標寫清楚。")}</small></div></li>
              <li><span>03</span><div><strong>${escapeHtml(language.key === "zh-cn" ? "确认单证要求" : "確認單證要求")}</strong><small>${escapeHtml(language.key === "zh-cn" ? "不同市场和客户体系需要的文件可能不同。" : "不同市場與客戶體系需要的文件可能不同。")}</small></div></li>
              <li><span>04</span><div><strong>${escapeHtml(language.key === "zh-cn" ? "补充商业条件" : "補充商業條件")}</strong><small>${escapeHtml(language.key === "zh-cn" ? "数量、包装、目的港、交期和贸易术语都很重要。" : "數量、包裝、目的港、交期與貿易條件都很重要。")}</small></div></li>
            </ul>
            <div class="pp-panel__facts"><div><strong>6</strong><span>${escapeHtml(language.key === "zh-cn" ? "产品组合" : "產品組合")}</span></div><div><strong>60+</strong><span>${escapeHtml(language.key === "zh-cn" ? "服务市场" : "服務市場")}</span></div><div><strong>B2B</strong><span>${escapeHtml(language.key === "zh-cn" ? "出口采购" : "出口採購")}</span></div></div>
          </aside>
        </div>
      </div>
    </section>
    <section class="pp-intro">
      <div class="container pp-intro__grid">
        <div><p class="pp-eyebrow">${escapeHtml(language.key === "zh-cn" ? "目录说明" : "目錄說明")}</p><h2>${escapeHtml(page.introTitle)}</h2></div>
        <div class="pp-intro__answer"><p><strong>${escapeHtml(page.introStrong)}</strong></p><p>${escapeHtml(page.introText)}</p></div>
      </div>
    </section>
    <section class="pp-portfolios" id="portfolios">
      <div class="container">
        <div class="pp-section-heading"><div><p class="pp-eyebrow">${escapeHtml(language.key === "zh-cn" ? "按产品组合浏览" : "按產品組合瀏覽")}</p><h2>${escapeHtml(language.common.browseProducts)}</h2></div><p>${escapeHtml(language.key === "zh-cn" ? "页面展示的是供货范围，不代表所有等级、库存或证书在任何时间都可直接适用。" : "頁面展示的是供貨範圍，不代表所有等級、庫存或證書在任何時間都可直接適用。")}</p></div>
        <div class="pp-card-grid">${cards}</div>
      </div>
    </section>
  </main>
  ${footer(pagePath, language)}
  ${scriptCommon()}
</body>
</html>`;
}

function renderServices(language) {
  const page = language.servicesPage;
  const pagePath = "services.html";
  const cards = page.cards.map(([title, desc, list]) => `<article class="ep-card"><span class="ep-card__icon"><i class="fas fa-check" aria-hidden="true"></i></span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(desc)}</p><ul>${list.split(" / ").map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>`).join("");
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.title,
    url: canonicalUrl(`${language.dir}/${pagePath}`),
    description: page.description,
    inLanguage: language.lang,
    provider: { "@type": "Organization", name: "Bespring Chemical Co., Ltd.", url: site }
  };
  return `${head(pagePath, language, page.title, page.description, "editorial-page", ["css/style.css", "css/site-pages.css", "css/localized-content.css"], schema)}
  ${header(pagePath, language, "services")}
  <main>
    <section class="ep-hero" style="--ep-image:url('images/global-chemical-supply-chain.jpg')">
      <div class="container">
        <nav class="ep-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="index.html">${escapeHtml(language.nav.home)}</a></li><li aria-current="page">${escapeHtml(language.nav.services)}</li></ol></nav>
        <p class="ep-eyebrow">${escapeHtml(language.nav.services)}</p>
        <h1>${escapeHtml(page.heroTitle)}</h1>
        <p class="ep-hero__lead">${escapeHtml(page.heroLead)}</p>
        <div class="ep-actions"><a class="ep-btn ep-btn--primary" href="#services">${escapeHtml(language.nav.services)}</a><a class="ep-btn ep-btn--outline" href="contact.html">${escapeHtml(language.nav.contact)}</a></div>
      </div>
    </section>
    <section class="ep-intro">
      <div class="container ep-intro__grid">
        <div><p class="ep-eyebrow">${escapeHtml(language.key === "zh-cn" ? "服务范围" : "服務範圍")}</p><h2>${escapeHtml(page.introTitle)}</h2></div>
        <div class="ep-answer"><p><strong>${escapeHtml(page.introStrong)}</strong></p><p>${escapeHtml(page.introText)}</p></div>
      </div>
    </section>
    <section class="ep-section ep-section--cream" id="services">
      <div class="container">
        <div class="ep-section-head"><div><p class="ep-eyebrow">${escapeHtml(language.key === "zh-cn" ? "核心服务" : "核心服務")}</p><h2>${escapeHtml(language.key === "zh-cn" ? "从询盘到出运的关键支持" : "從詢盤到出運的關鍵支援")}</h2></div><p>${escapeHtml(language.key === "zh-cn" ? "这些服务都围绕实际产品和订单展开，目的是让采购判断更清晰、执行更顺畅。" : "這些服務都圍繞實際產品與訂單展開，目的是讓採購判斷更清晰、執行更順暢。")}</p></div>
        <div class="ep-card-grid">${cards}</div>
      </div>
    </section>
  </main>
  ${footer(pagePath, language)}
  ${scriptCommon()}
</body>
</html>`;
}

function renderNews(language) {
  const page = language.newsPage;
  const pagePath = "news.html";
  const cards = page.cards.map(([type, title, text], index) => `<article class="news-entry"><img src="images/banner_news.jpg" alt="${escapeHtml(title)}" loading="lazy"><div class="news-entry__body"><span class="news-entry__type">${escapeHtml(type)}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p><a href="contact.html">${escapeHtml(language.key === "zh-cn" ? "如需相关资料，请联系我们" : "如需相關資料，請聯絡我們")} <i class="fas fa-arrow-right" aria-hidden="true"></i></a></div></article>`).join("");
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.title,
    url: canonicalUrl(`${language.dir}/${pagePath}`),
    description: page.description,
    inLanguage: language.lang,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: page.cards.map(([type, title], index) => ({ "@type": "ListItem", position: index + 1, name: `${type} - ${title}` }))
    }
  };
  return `${head(pagePath, language, page.title, page.description, "editorial-page", ["css/style.css", "css/site-pages.css", "css/localized-content.css"], schema)}
  ${header(pagePath, language, "news")}
  <main>
    <section class="ep-hero" style="--ep-image:url('images/banner_news.jpg')">
      <div class="container">
        <nav class="ep-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="index.html">${escapeHtml(language.nav.home)}</a></li><li aria-current="page">${escapeHtml(language.nav.news)}</li></ol></nav>
        <p class="ep-eyebrow">${escapeHtml(language.nav.news)}</p>
        <h1>${escapeHtml(page.heroTitle)}</h1>
        <p class="ep-hero__lead">${escapeHtml(page.heroLead)}</p>
      </div>
    </section>
    <section class="ep-section ep-section--cream">
      <div class="container">
        <div class="ep-section-head"><div><p class="ep-eyebrow">${escapeHtml(language.key === "zh-cn" ? "内容更新" : "內容更新")}</p><h2>${escapeHtml(page.sectionTitle)}</h2></div><p>${escapeHtml(page.sectionText)}</p></div>
        <div class="news-list">${cards}</div>
      </div>
    </section>
  </main>
  ${footer(pagePath, language)}
  ${scriptCommon()}
</body>
</html>`;
}

function renderContact(language) {
  const page = language.contactPage;
  const pagePath = "contact.html";
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: page.title,
    url: canonicalUrl(`${language.dir}/${pagePath}`),
    description: page.description,
    inLanguage: language.lang,
    mainEntity: { "@type": "Organization", name: "Bespring Chemical Co., Ltd.", email: "info@bespringchem.com", telephone: "+86-139-1489-6109" }
  };
  return `${head(pagePath, language, page.title, page.description, "localized-contact-page", ["css/style.css", "css/contact.css", "css/localized-content.css"], schema)}
  ${header(pagePath, language, "contact")}
  <main>
    <section class="contact-hero">
      <div class="container">
        <nav class="contact-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="index.html">${escapeHtml(language.nav.home)}</a></li><li aria-current="page">${escapeHtml(language.nav.contact)}</li></ol></nav>
        <div class="contact-hero-content">
          <span class="contact-eyebrow">${escapeHtml(language.nav.contact)}</span>
          <h1>${escapeHtml(page.heroTitle)}</h1>
          <p>${escapeHtml(page.heroLead)}</p>
          <div class="contact-hero-actions">
            <a href="#quote-request" class="contact-btn contact-btn-primary"><i class="fas fa-file-signature" aria-hidden="true"></i> ${escapeHtml(page.submit)}</a>
            <a href="https://wa.me/8613914896109" class="contact-btn contact-btn-secondary" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp</a>
          </div>
          <ul class="contact-trust-list"><li><i class="fas fa-check-circle" aria-hidden="true"></i> ${escapeHtml(language.key === "zh-cn" ? "食品、饲料与工业品方向" : "食品、飼料與工業品方向")}</li><li><i class="fas fa-check-circle" aria-hidden="true"></i> ${escapeHtml(language.key === "zh-cn" ? "支持国际出口沟通" : "支援國際出口溝通")}</li><li><i class="fas fa-check-circle" aria-hidden="true"></i> ${escapeHtml(language.key === "zh-cn" ? "可配合技术文件与证书" : "可配合技術文件與證書")}</li></ul>
        </div>
      </div>
    </section>
    <section class="contact-main-section" id="quote-request">
      <div class="container contact-main-grid">
        <div class="contact-form-panel">
          <div class="contact-section-heading contact-section-heading-left">
            <span>${escapeHtml(language.key === "zh-cn" ? "提交需求" : "提交需求")}</span>
            <h2>${escapeHtml(page.leftTitle)}</h2>
            <p>${escapeHtml(page.leftText)}</p>
          </div>
          <form id="quote-form" class="contact-quote-form">
            <div class="contact-form-grid">
              <div class="contact-field"><label for="contact-name">${escapeHtml(language.key === "zh-cn" ? "姓名" : "姓名")} <span aria-hidden="true">*</span></label><input id="contact-name" type="text" name="name" autocomplete="name" required></div>
              <div class="contact-field"><label for="contact-company">${escapeHtml(language.key === "zh-cn" ? "公司名称" : "公司名稱")} <span aria-hidden="true">*</span></label><input id="contact-company" type="text" name="company" autocomplete="organization" required></div>
              <div class="contact-field"><label for="contact-email">${escapeHtml(language.key === "zh-cn" ? "商务邮箱" : "商務信箱")} <span aria-hidden="true">*</span></label><input id="contact-email" type="email" name="email" autocomplete="email" required></div>
              <div class="contact-field"><label for="contact-phone">${escapeHtml(language.key === "zh-cn" ? "电话 / WhatsApp" : "電話 / WhatsApp")}</label><input id="contact-phone" type="tel" name="phone" autocomplete="tel"></div>
              <div class="contact-field"><label for="contact-product">${escapeHtml(language.key === "zh-cn" ? "产品名称或应用方向" : "產品名稱或應用方向")} <span aria-hidden="true">*</span></label><input id="contact-product" type="text" name="product" placeholder="${escapeHtml(language.key === "zh-cn" ? "例如：食品级 STPP" : "例如：食品級 STPP")}" required></div>
              <div class="contact-field"><label for="contact-country">${escapeHtml(language.key === "zh-cn" ? "目的国家 / 港口" : "目的國家 / 港口")} <span aria-hidden="true">*</span></label><input id="contact-country" type="text" name="country" autocomplete="country-name" required></div>
              <div class="contact-field contact-field-full"><label for="contact-message">${escapeHtml(language.key === "zh-cn" ? "需求说明" : "需求說明")} <span aria-hidden="true">*</span></label><textarea id="contact-message" name="message" rows="6" placeholder="${escapeHtml(language.key === "zh-cn" ? "请尽量填写等级、规格、数量、包装和所需文件。" : "請盡量填寫等級、規格、數量、包裝與所需文件。")}" required></textarea></div>
            </div>
            <label class="contact-consent"><input type="checkbox" name="privacy" required><span>${escapeHtml(page.consent)}</span></label>
            <button type="submit" class="contact-submit"><span>${escapeHtml(page.submit)}</span><i class="fas fa-arrow-right" aria-hidden="true"></i></button>
            <p class="contact-form-note"><i class="fas fa-lock" aria-hidden="true"></i> ${escapeHtml(language.common.emailOnly)}</p>
            <div id="form-status" class="contact-form-status" role="status" aria-live="polite"></div>
          </form>
        </div>
        <aside class="contact-details-panel" aria-label="Company locations and contact details">
          <div class="contact-details-card">
            <span class="contact-details-kicker">${escapeHtml(language.key === "zh-cn" ? "销售办公室" : "銷售辦公室")}</span>
            <h2>Bespring Chemical Co., Ltd.</h2>
            <address>
              <p><i class="fas fa-location-dot" aria-hidden="true"></i><span>10th Floor, Building 6, Greenland Linghai, Yunlong District, Xuzhou, Jiangsu 221000, China</span></p>
              <p><i class="fas fa-phone" aria-hidden="true"></i><span><a href="tel:+8651680568559">+86 516 8056 8559</a></span></p>
              <p><i class="fas fa-envelope" aria-hidden="true"></i><span><a href="mailto:info@bespringchem.com">info@bespringchem.com</a></span></p>
            </address>
          </div>
          <div class="contact-map"><iframe title="Bespring Chemical map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1166.5728895517495!2d117.28249262219671!3d34.20855337367718!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35c6043a4d329fc5%3A0x1fdd5abf44c89695!2sGreen%20Land%20Linghai!5e0!3m2!1sen!2ssg!4v1759422651533!5m2!1sen!2ssg" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
          <div class="contact-details-card contact-production-card">
            <span class="contact-details-kicker">${escapeHtml(language.key === "zh-cn" ? "生产地址" : "生產地址")}</span>
            <h3>Pizhou, Jiangsu</h3>
            <p>Ruixing North Road, Yunhe Town, Pizhou City, Jiangsu 221300, China</p>
            <a href="mailto:service@bespringchem.com"><i class="fas fa-headset" aria-hidden="true"></i> service@bespringchem.com</a>
          </div>
        </aside>
      </div>
    </section>
  </main>
  ${footer(pagePath, language)}
  <script src="https://cdn.emailjs.com/dist/email.min.js"></script>
  ${scriptCommon()}
  <script>
    emailjs.init("evd5fyrngOFOv_NQS");
    const form = document.getElementById("quote-form");
    const status = document.getElementById("form-status");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const button = form.querySelector(".contact-submit");
      button.disabled = true;
      status.className = "contact-form-status";
      status.textContent = "";
      emailjs.sendForm("service_eim9osc", "template_z7mkti2", form).then(() => {
        form.reset();
        status.className = "contact-form-status is-success";
        status.textContent = ${JSON.stringify(page.success)};
      }).catch(() => {
        status.className = "contact-form-status is-error";
        status.textContent = ${JSON.stringify(page.error)};
      }).finally(() => {
        button.disabled = false;
      });
    });
  </script>
</body>
</html>`;
}

function categorySchema(pagePath, language, page) {
  const current = canonicalUrl(`${language.dir}/products/${pagePath}`);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.title,
    url: current,
    description: page.description,
    inLanguage: language.lang,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: page.categories.map(([name], index) => ({ "@type": "ListItem", position: index + 1, name }))
    }
  };
}

function renderCategory(language, file) {
  const page = language.categoryPages[file];
  const pagePath = `products/${file}`;
  const currentBase = `${language.dir}/${pagePath}`;
  const productCount = page.categories.reduce((sum, [, items]) => sum + items.split(", ").length, 0);
  const familyNav = page.categories.map(([name]) => `<a href="#${slugify(name)}">${escapeHtml(name)}</a>`).join("");
  const familyCards = page.categories.map(([name, items]) => {
    const list = items.split(", ").map((item) => `<li data-product="${escapeHtml(item.toLowerCase())}">${escapeHtml(item)}</li>`).join("");
    const count = items.split(", ").length;
    return `<article class="pc-family" id="${slugify(name)}"><div class="pc-family__head"><h3>${escapeHtml(name)}</h3><span>${count} ${escapeHtml(language.key === "zh-cn" ? "项" : "項")}</span></div><ul class="pc-products">${list}</ul></article>`;
  }).join("");
  return `${head(pagePath, language, page.title, page.description, "product-category", ["css/style.css", "css/product-category-page.css", "css/localized-content.css"], categorySchema(file, language, page))}
  ${header(pagePath, language, "products")}
  <main id="main-content">
    <section class="pc-hero">
      <div class="container pc-hero__inner">
        <nav class="pc-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="${escapeHtml(relToSite(currentBase, `${language.dir}/index.html`))}">${escapeHtml(language.nav.home)}</a></li><li><a href="${escapeHtml(relToSite(currentBase, `${language.dir}/products.html`))}">${escapeHtml(language.nav.products)}</a></li><li aria-current="page">${escapeHtml(page.shortName)}</li></ol></nav>
        <div class="pc-hero__grid">
          <div>
            <p class="pc-eyebrow">${escapeHtml(page.eyebrow)}</p>
            <h1>${escapeHtml(page.name)}</h1>
            <p class="pc-hero__lead">${escapeHtml(page.heroLead)}</p>
            <div class="pc-hero__actions"><a class="pc-button pc-button--primary" href="#product-catalog">${escapeHtml(language.common.browseProducts)}</a><a class="pc-button pc-button--outline" href="${escapeHtml(relToSite(currentBase, `${language.dir}/contact.html`))}">${escapeHtml(language.common.prepareInquiry)}</a></div>
          </div>
          <div class="pc-hero__visual">
            <img class="pc-hero__image" src="${escapeHtml(relToSite(currentBase, `images/${page.heroImage}`))}" alt="${escapeHtml(page.imageAlt)}">
            <div class="pc-hero__facts"><div><strong>${page.categories.length}</strong><span>${escapeHtml(language.key === "zh-cn" ? "材料家族" : "材料家族")}</span></div><div><strong>${productCount}</strong><span>${escapeHtml(language.key === "zh-cn" ? "已列产品" : "已列產品")}</span></div></div>
          </div>
        </div>
      </div>
    </section>
    <section class="pc-summary"><div class="container pc-summary__grid"><div><p class="pc-eyebrow">${escapeHtml(language.key === "zh-cn" ? "目录说明" : "目錄說明")}</p><h2>${escapeHtml(page.summaryTitle)}</h2></div><div class="pc-summary__answer"><p><strong>${escapeHtml(page.directAnswer)}</strong></p><p>${escapeHtml(page.summaryText)}</p></div></div></section>
    <section class="pc-catalog" id="product-catalog"><div class="container">
      <div class="pc-section-heading"><div><p class="pc-eyebrow">${escapeHtml(language.key === "zh-cn" ? "产品目录" : "產品目錄")}</p><h2>${escapeHtml(page.shortName)}</h2></div><p>${escapeHtml(page.catalogIntro)}</p></div>
      <div class="pc-tools"><label class="pc-search"><i class="fas fa-magnifying-glass" aria-hidden="true"></i><span class="sr-only">Search</span><input type="search" id="catalog-search" placeholder="${escapeHtml(language.key === "zh-cn" ? "按产品名称搜索" : "依產品名稱搜尋")}" autocomplete="off"></label><p class="pc-tools__count" aria-live="polite"><span id="visible-count">${productCount}</span> ${escapeHtml(language.key === "zh-cn" ? "项产品" : "項產品")}</p></div>
      <nav class="pc-family-nav" aria-label="Product family shortcuts">${familyNav}</nav>
      <div class="pc-family-grid">${familyCards}</div>
      <p class="pc-no-results" id="no-results" hidden>${escapeHtml(language.key === "zh-cn" ? "没有找到匹配产品，欢迎把具体名称或规格发给我们。" : "沒有找到匹配產品，歡迎把具體名稱或規格發給我們。")}</p>
    </div></section>
    <section class="pc-procurement" id="procurement-guide"><div class="container pc-procurement__grid"><div class="pc-procurement__copy"><p class="pc-eyebrow">${escapeHtml(language.key === "zh-cn" ? "采购建议" : "採購建議")}</p><h2>${escapeHtml(page.procurementTitle)}</h2><p class="pc-direct-answer"><strong>${escapeHtml(page.procurementAnswer)}</strong></p><p>${escapeHtml(page.procurementText)}</p></div><div class="pc-checks">
      <article><span>01</span><div><h3>${escapeHtml(language.key === "zh-cn" ? "确认产品身份" : "確認產品身份")}</h3><p>${escapeHtml(language.key === "zh-cn" ? "把化学名称、等级、常用缩写和目标用途一起说明，会更容易快速对齐。" : "把化學名稱、等級、常用縮寫與目標用途一起說明，會更容易快速對齊。")}</p></div></article>
      <article><span>02</span><div><h3>${escapeHtml(language.key === "zh-cn" ? "说明关键规格" : "說明關鍵規格")}</h3><p>${escapeHtml(language.key === "zh-cn" ? "请尽量写明含量、粒度、pH、杂质、物理形态等对采购判断重要的参数。" : "請盡量寫明含量、粒度、pH、雜質、物理形態等對採購判斷重要的參數。")}</p></div></article>
      <article><span>03</span><div><h3>${escapeHtml(language.key === "zh-cn" ? "补充商业条件" : "補充商業條件")}</h3><p>${escapeHtml(language.key === "zh-cn" ? "数量、包装、目的港、贸易术语和计划交期都会影响供货判断。" : "數量、包裝、目的港、貿易條件與計畫交期都會影響供貨判斷。")}</p></div></article>
      <article><span>04</span><div><h3>${escapeHtml(language.key === "zh-cn" ? "确认文件需求" : "確認文件需求")}</h3><p>${escapeHtml(language.key === "zh-cn" ? "若涉及目标市场、客户认证或危险运输，请一并说明所需文件。" : "若涉及目標市場、客戶認證或危險運輸，請一併說明所需文件。")}</p></div></article>
    </div></div></section>
  </main>
  ${footer(pagePath, language)}
  ${scriptCommon()}
  <script>
    const search = document.getElementById("catalog-search");
    const families = [...document.querySelectorAll(".pc-family")];
    const visibleCount = document.getElementById("visible-count");
    const noResults = document.getElementById("no-results");
    search?.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();
      let count = 0;
      let visibleFamilies = 0;
      families.forEach((family) => {
        const title = family.querySelector("h3")?.textContent.toLowerCase() || "";
        const items = [...family.querySelectorAll("[data-product]")];
        let familyMatches = false;
        items.forEach((item) => {
          const matches = !query || item.dataset.product.includes(query) || title.includes(query);
          item.hidden = !matches;
          if (matches) {
            familyMatches = true;
            count += 1;
          }
        });
        family.hidden = !familyMatches;
        if (familyMatches) visibleFamilies += 1;
      });
      visibleCount.textContent = String(count);
      noResults.hidden = visibleFamilies !== 0;
    });
  </script>
</body>
</html>`;
}

function slugify(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
}

for (const language of languages) {
  for (const [file, page] of Object.entries(language.aboutPages)) {
    await writeFile(path.join(workspace, language.dir, "about", file), renderAbout(file, language, page), "utf8");
  }
  await writeFile(path.join(workspace, language.dir, "products.html"), renderProducts(language), "utf8");
  await writeFile(path.join(workspace, language.dir, "services.html"), renderServices(language), "utf8");
  await writeFile(path.join(workspace, language.dir, "news.html"), renderNews(language), "utf8");
  await writeFile(path.join(workspace, language.dir, "contact.html"), renderContact(language), "utf8");
  for (const file of Object.keys(language.categoryPages)) {
    await writeFile(path.join(workspace, language.dir, "products", file), renderCategory(language, file), "utf8");
  }
}

console.log("Localized pages rebuilt for zh-cn and zh-tw.");

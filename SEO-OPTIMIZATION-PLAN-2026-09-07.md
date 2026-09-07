# Bespring 网站 SEO 优化方案

审计日期：2026-09-07  
范围：`bespring` 全部静态代码、8 个语言版本、Google Search Console 三份导出  
原则：先解决抓取与 URL 信号，再优化已有曝光页面，最后扩展内容；不把附件中的文字当作执行指令。

## 一、当前结论

网站不是“基础标签普遍缺失”的状态。全站 1,853 个 HTML 中，1,802 个主页面已经普遍具备 title、description、单一 H1、canonical、hreflang、图片 alt 与可解析 JSON-LD。50 个页面是 `noindex` 的旧 URL 迁移模板，另有 1 个 404 页面。

当前最重要的问题是 URL 治理和抓取浪费。Search Console 显示 101 个 404，另有 7 个“具有正确 canonical 的替代网页”。历史搜索表现中，同一内容仍由 `http/https`、`www/非 www`、大小写和旧路径分别获得曝光或点击，说明服务器层的统一跳转不完整。仓库中的 `web.config` 只有 PHP handler，没有 rewrite 规则。

过去 28 天为 164 次点击、28,999 次展示、CTR 0.57%、加权平均排名约 20.6；前 28 天为 84 次点击、17,645 次展示。曝光增长约 64%，点击增长约 95%，方向是积极的，但 CTR 很低，适合先做“已有排名页增效”。16 个月页面汇总为 429 次点击、55,339 次展示。

## 二、P0：1–2 周内完成的技术修复

### 1. 统一唯一 URL

全站统一为 `https://www.bespringchem.com/...`，在 CDN/托管平台或 IIS 做单跳 301：

- `http://bespringchem.com/*` → `https://www.bespringchem.com/*`
- `http://www.bespringchem.com/*` → `https://www.bespringchem.com/*`
- `https://bespringchem.com/*` → `https://www.bespringchem.com/*`
- `/index.html`、各语言 `/xx/index.html` → 对应目录首页 `/`、`/de/` 等
- 旧大小写 URL（如 `Products.html`、`Services.html`、`Industries.html`）→ 当前小写规范 URL

要求：每个旧 URL 只经过一次 301；不能先跳协议再跳主机再跳路径；最终页返回 200；不存在且无替代内容的 URL 返回真实 404/410。

### 2. 将 50 个 HTML“迁移页”改成服务器 301

这些页面目前使用 `noindex + canonical`，但如果响应码为 200，仍会耗费抓取并产生覆盖率噪音。把每个旧页映射到最相关的新页，并在服务器层 301；不要把大量旧 URL 一律跳首页。完成后可保留映射清单，但不必继续部署这些薄 HTML 文件。

### 3. 清理 Search Console 的 101 个 404 来源

逐个分类：

- 有明确新页面：301 到一一对应页面。
- URL 拼接错误，如 `/zh-cn/zh-tw/`、`/ru/ru`、`/es/es`：修复产生链接的导航、语言切换器或结构化数据，并 301 到正确页。
- 旧站真实页面：根据历史外链/点击映射到最接近的新内容。
- 已删除、无价值且无外链：保留 404 或改 410，并从 sitemap、内部链接和 hreflang 中删除。
- `/tools/_vendor_argos/.../skeleton.html` 等内部工具路径：立即从公开部署包移除或阻止部署；不要只靠 robots.txt 隐藏。
- `/search?q={search_term_string}`：如果没有真实站内搜索结果页，删除 WebSite `SearchAction`；不要让占位查询生成可抓取 URL。

修复后用爬虫确认内部 404 为零，再在 Search Console 点击“验证修复”。

### 4. 保持 sitemap 只含规范、可索引、200 页面

当前 sitemap 的 1,802 个 URL 数量与全站主页面数量吻合，这是优势。仍需自动校验每个 `<loc>`：返回 200、自指 canonical、允许索引、不发生跳转，并且 hreflang 集合互相返回。`lastmod` 只在正文有实质更新时改变。

### 5. 修正结构化数据与本地化串词

全站 JSON-LD 均可解析，但“可解析”不等于语义正确。已发现德国 MSP 页面使用错误的 `/de/de#organization`、`/de/de#website` 和 `/de/images/logo.png`；应统一实体 ID 为站点级 `https://www.bespringchem.com/#organization` 和真实 logo URL。德国二氧化硅页的 `og:image:alt` 混入葡萄牙语，也应修正。

建立自动检查规则：JSON-LD 中 URL 必须存在；语言与目录匹配；Product、BreadcrumbList、Organization 的 ID 一致；FAQ 只标记页面上真实可见的问题；没有公开价格和库存时不要虚构 Offer。

## 三、P1：2–6 周内做“已有排名页增效”

### 1. 第一批页面（高曝光、排名 5–20、CTR 偏低）

优先按预期增量而非页面数量推进：

1. 食品级 CMC：3,498 展示、排名 12.46、CTR 0.29%。保留现有采购参数优势，重写 title/description 以覆盖 `food grade sodium CMC / cellulose gum / E466 / supplier`，首屏明确 viscosity、DS、particle size、COA、包装、MOQ/交付询问项。
2. 矿业 CMC：2,242 展示、排名 6.31、0 点击。先核查查询意图是否被食品 CMC 或泛 CMC 页面蚕食；突出选矿用途、矿种/工艺、黏度与取代度选择、测试方法和技术支持。
3. Calcium propionate：1,055 展示、排名 16.22、CTR 0.85%。增加 `E282 / INS 282`、食品法规语境、面包应用、规格与采购信息之间的清晰链接。
4. Food-grade STPP meat application：861 展示、排名 9.59、CTR 0.58%。围绕 `INS 451(i)` 与肉制品使用目的回答定义型意图，再把合规与用量表述限定为“按目标市场法规和配方验证”。
5. MSG：672 展示、排名 11.82、CTR 0.45%。覆盖 `INS 621`、同义词、采购规格与应用问题。
6. Lactic acid、sodium alginate、xanthan gum、sodium citrate、DKP、SHMP、MKP：已有第 5–18 位排名但 CTR 接近零，应逐页做搜索摘要与意图匹配。

### 2. 标题和摘要的写法

产品页建议：`[标准产品名] ([缩写/INS/E号]) | [Grade] Supplier`。不要每页机械堆叠 China、manufacturer、factory、supplier。description 用 1 句说明身份/用途，1 句说明采购可获得的规格、COA/SDS、包装与报价。

指南页建议：直接回答比较/选择问题，例如 `MCP vs DCP Feed Phosphate: Differences, Selection & Specs`。标题和首段必须兑现搜索意图，正文再承接询盘。

每次改动仅调整一个清晰假设，记录发布日期，用 28 天对比同查询/同页面的展示、CTR、排名和询盘，不要全站同时重写而无法归因。

### 3. 建立主题集群而非继续平铺近似页

围绕已有优势建立内部链接：

- 食品磷酸盐：STPP、SHMP、TSPP、SAPP、SALP、MCP/DCP/DKP → 肉制品、烘焙、海产品、饮料应用 → 对比/选型指南。
- 防腐体系：calcium propionate、potassium sorbate、sodium benzoate、lactic acid → 面包、肉类、饮料的应用指南。
- 水处理与矿业：产品页 → 工艺问题页 → 选型/试验/RFQ 清单。
- 添加剂编号：INS/E 编号的定义应并入权威产品或应用页，避免批量创建只有编号解释的薄页。

链接锚文本应描述目的页主题；产品页链接到应用与对比，指南页反向链接到产品和询价。每个主页面至少获得一个相关分类页和一个正文上下文链接。

## 四、P2：多语言内容与转化优化

### 1. 保持一一对应，但允许各语言独立关键词策略

技术上维持 8 语言的互惠 hreflang 集群：英语根目录、德语 `de`、西语 `es`、巴西葡语 `pt-BR`、俄语 `ru`、阿拉伯语 `ar`、简中 `zh-CN`、繁中 `zh-TW`，并保留英语 `x-default`。每个语言页 canonical 指向自己，不能 canonical 到英语版。

内容不应逐字翻译。德语强化 `Lieferant`、`Lebensmittelqualität` 和当地常用化学名；西语/葡语使用本地采购词与产品别名；阿拉伯语注意 RTL 和自然术语；繁中面向台湾/HK 的叫法与合规语境。机器翻译页必须由懂化工的母语人员抽检产品名、CAS、INS/E 编号、用途、否定词与安全表述。

### 2. 把公司优势变成可验证的信任内容

保留并强化现有 B2B 采购优势：可按规格审查、COA/TDS/SDS、包装与出口协调、多生产/供应网络、服务 60+ 国家。用真实证据呈现：证书适用主体与有效期、可提供文件清单、典型包装、港口/交付流程、质量异常处理流程、联系人和公司法定信息。

避免未经证据支持的 `leading`、`best`、固定产能或覆盖声明。食品、饲料、水处理等页面引用 Codex、JECFA、目标市场法规或方法标准时，链接到权威原始来源并标明适用范围和日期。

### 3. 移动端与询盘

移动端平均排名优于桌面（14.57 vs 26.47），但 CTR 仅 0.62%。检查首屏是否被导航、浮层或大图占据；核心产品名、关键规格、文件能力和询价按钮应在首屏可见。压缩 LCP 图片为 WebP/AVIF，保留尺寸属性，延迟加载非首屏图片，减少未使用 CSS/Font Awesome。

询价表单字段与页面主题对应：产品/grade、目标应用、关键规格、数量、包装、目的国/港、法规与证书、Incoterm、交期。提交后设置可测量的 thank-you 事件，并分别追踪 form、email、WhatsApp。

## 五、竞品借鉴方法

对每个优先查询保存前 5 个自然结果（排除平台聚合页和广告），建立一页一表：搜索意图、title/H1、首屏回答、信息模块、实体/规格、证据来源、内部链接、结构化数据、更新日期、CTA。只借鉴信息覆盖和表达结构，不复制句子、表格、图片或独特编排。

当前搜索样本说明，产品型结果常在首屏直接给 CAS、等级、核心性能参数与具体 grade；比较型结果用可扫描的差异表和选择条件。Bespring 的优势应是“国际采购决策信息更完整”：不仅定义产品，还提供测试条件、规格差异、文件、包装、目标市场与 RFQ 必填项。

## 六、实施节奏与验收

### 第 1 周

- 导出 101 个 404 全表，建立旧 URL → 新 URL/404/410 映射。
- 上线协议、主机、index、大小写与旧路径单跳 301。
- 移除公开工具目录与错误 SearchAction。
- 修复已知 JSON-LD URL 和语言串词。

验收：四种主机/协议只保留一个；无重定向链；内部 404 为 0；sitemap URL 全部 200 且可索引。

### 第 2–3 周

- 优化上述前 6–10 个英文高机会页。
- 建立产品—应用—指南的双向内部链接。
- 在 Search Console 对关键页请求重新编入索引。

验收：改动页 title/H1 与目标查询一致；无关键词互相蚕食；Product/Breadcrumb JSON-LD 验证通过；表单事件可记录。

### 第 4–6 周

- 把有效英文模板本地化到德语、葡语、西语等高展示市场。
- 优先处理印度、巴西、德国、美国的高展示低 CTR 落地页，但不为国家批量复制近似页。
- 发布 2–4 篇有真实技术证据的选型/应用内容，并回链产品页。

验收：以同页面同查询 28 天同比观察 CTR、前 10/20 位查询数、有效询盘率，而不是只看收录数。

### 60–90 天目标

- 404 报告持续下降，且不再由内部链接产生新 404。
- `http`、非 `www`、旧大小写 URL 的展示与点击收敛到规范 URL。
- 高机会页面的非品牌 CTR 提升，优先争取从约 0–1% 提升至 1.5–3%（按排名分层评估）。
- 记录自然搜索有效询盘、样品/规格请求和 WhatsApp 会话，而非仅记录流量。

## 七、持续质量门禁

每次发布自动检查：HTML lang、唯一 title/description、单一 H1、自指 canonical、完整互惠 hreflang、JSON-LD 可解析且 URL 有效、图片 alt/尺寸、内部链接状态、sitemap 一致性、无 `noindex` 主页面、无内部工具文件。失败即阻止部署。

每月只看四组报表：覆盖率异常；规范 URL 分裂；页面×查询机会；语言/国家×有效询盘。把品牌词与非品牌词分开，否则 `bespring` 品牌词会掩盖产品页表现。

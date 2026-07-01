import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const locales = process.argv.includes("--es-only")
  ? ["es"]
  : process.argv.includes("--pt-only")
    ? ["pt"]
    : ["es", "pt", "de", "ru", "ar"];

const localeMeta = {
  es: {
    lang: "es",
    ogLocale: "es_ES",
    dir: "",
    home: "Inicio",
    about: "Nosotros",
    products: "Productos",
    services: "Servicios",
    news: "Noticias",
    contact: "Contacto",
    topbar: "Proveedor chino de ingredientes quimicos",
    export: "Exportando a mas de 60 paises",
    navLabel: "Navegacion principal",
    breadcrumb: "Miga de pan",
    newsInsights: "Noticias y perspectivas",
    articleType: "Guia",
    eyebrow: "Guia de compra",
    reviewed: "Revisado por el equipo de exportacion de Bespring Chemical",
    noteLabel: "Nota editorial:",
    noteText:
      "Este articulo ofrece informacion general de compras, no asesoria de formulacion, legal o regulatoria. Las especificaciones, clasificaciones y usos permitidos deben verificarse para el producto, proveedor y mercado de destino exactos.",
    sidebarTitle: "Prepare una consulta de producto",
    sidebarText:
      "Incluya el nombre quimico completo, grado, especificacion objetivo, cantidad, embalaje, destino y documentos requeridos.",
    ctaContact: "Contactar ventas de exportacion",
    ctaProducts: "Explorar portafolios de productos",
    footerDesc:
      "Proveedor chino de materias primas quimicas para alimentos, piensos e industria para compras B2B globales.",
    quickLinks: "Enlaces rapidos",
    contactUs: "Contacto",
    footerCta: "Contactenos",
  },
  pt: {
    lang: "pt",
    ogLocale: "pt_PT",
    dir: "",
    home: "Inicio",
    about: "Sobre nos",
    products: "Produtos",
    services: "Servicos",
    news: "Noticias",
    contact: "Contato",
    topbar: "Fornecedor chines de ingredientes quimicos",
    export: "Exportando para mais de 60 paises",
    navLabel: "Navegacao principal",
    breadcrumb: "Trilha de navegacao",
    newsInsights: "Noticias e insights",
    articleType: "Guia",
    eyebrow: "Guia de compras",
    reviewed: "Revisado pela equipe de exportacao da Bespring Chemical",
    noteLabel: "Nota editorial:",
    noteText:
      "Este artigo fornece informacoes gerais de compras, nao orientacao de formulacao, juridica ou regulatoria. Especificacoes, classificacoes e usos permitidos devem ser verificados para o produto, fornecedor e mercado de destino exatos.",
    sidebarTitle: "Prepare uma consulta de produto",
    sidebarText:
      "Inclua o nome quimico completo, grau, especificacao alvo, quantidade, embalagem, destino e documentos exigidos.",
    ctaContact: "Falar com vendas de exportacao",
    ctaProducts: "Explorar portfolios de produtos",
    footerDesc:
      "Fornecedor chines de materias-primas quimicas para alimentos, nutricao animal e industria no mercado B2B global.",
    quickLinks: "Links rapidos",
    contactUs: "Contato",
    footerCta: "Fale conosco",
  },
  de: {
    lang: "de",
    ogLocale: "de_DE",
    dir: "",
    home: "Startseite",
    about: "Uber uns",
    products: "Produkte",
    services: "Service",
    news: "News",
    contact: "Kontakt",
    topbar: "Chinesischer Lieferant fur chemische Inhaltsstoffe",
    export: "Export in mehr als 60 Lander",
    navLabel: "Hauptnavigation",
    breadcrumb: "Brotkrumen",
    newsInsights: "News und Einblicke",
    articleType: "Leitfaden",
    eyebrow: "Einkaufsleitfaden",
    reviewed: "Gepruft vom Exportteam von Bespring Chemical",
    noteLabel: "Redaktioneller Hinweis:",
    noteText:
      "Dieser Artikel bietet allgemeine Einkaufsinformationen, jedoch keine Formulierungs-, Rechts- oder Regulierungsberatung. Spezifikationen, Einstufungen und zulassige Verwendungen mussen fur das genaue Produkt, den Lieferanten und den Zielmarkt gepruft werden.",
    sidebarTitle: "Produktanfrage vorbereiten",
    sidebarText:
      "Nennen Sie den vollstandigen chemischen Namen, Grad, Zielspezifikation, Menge, Verpackung, Zielort und erforderliche Dokumente.",
    ctaContact: "Exportvertrieb kontaktieren",
    ctaProducts: "Produktportfolios ansehen",
    footerDesc:
      "Chinesischer Lieferant von chemischen Rohstoffen fur Lebensmittel, Futtermittel und Industrie fur den globalen B2B-Einkauf.",
    quickLinks: "Schnellzugriffe",
    contactUs: "Kontakt",
    footerCta: "Kontakt aufnehmen",
  },
  ru: {
    lang: "ru",
    ogLocale: "ru_RU",
    dir: "",
    home: "Glavnaya",
    about: "O kompanii",
    products: "Produkty",
    services: "Uslugi",
    news: "Novosti",
    contact: "Kontakt",
    topbar: "Kitayskiy postavshchik khimicheskikh ingredientov",
    export: "Eksport v bolee chem 60 stran",
    navLabel: "Osnovnaya navigatsiya",
    breadcrumb: "Navigatsionnaya tsepochka",
    newsInsights: "Novosti i analitika",
    articleType: "Gid",
    eyebrow: "Rukovodstvo po zakupkam",
    reviewed: "Provereno eksportnoy komandoy Bespring Chemical",
    noteLabel: "Redaktsionnaya pometka:",
    noteText:
      "Eta statya dayot obshchuyu informatsiyu po zakupkam, no ne yavlyaetsya formulatsionnym, yuridicheskim ili regulatornym sovetom. Spetsifikatsii, klassifikatsii i dopustimye oblasti primeneniya sleduet proverit dlya tochnogo produkta, postavshchika i rynka naznacheniya.",
    sidebarTitle: "Podgotovte zapros po produktu",
    sidebarText:
      "Ukazhite polnoe khimicheskoe nazvanie, marku, tselevuyu spetsifikatsiyu, kolichestvo, upakovku, punkt naznacheniya i trebuemye dokumenty.",
    ctaContact: "Svyazatsya s eksportnymi prodazhami",
    ctaProducts: "Otkryt portfeli produktov",
    footerDesc:
      "Kitayskiy postavshchik khimicheskogo syrya dlya pishchevoy, kormovoy i promyshlennoy otrasli dlya globalnykh B2B-zakupok.",
    quickLinks: "Bystrye ssylki",
    contactUs: "Kontakt",
    footerCta: "Svjazatsya s nami",
  },
  ar: {
    lang: "ar",
    ogLocale: "ar_SA",
    dir: ' dir="rtl"',
    home: "الرئيسية",
    about: "من نحن",
    products: "المنتجات",
    services: "الخدمات",
    news: "الأخبار",
    contact: "اتصل بنا",
    topbar: "مورد صيني للمكونات الكيميائية",
    export: "التصدير إلى أكثر من 60 دولة",
    navLabel: "التنقل الرئيسي",
    breadcrumb: "مسار التنقل",
    newsInsights: "الأخبار والرؤى",
    articleType: "دليل",
    eyebrow: "دليل الشراء",
    reviewed: "راجعته فرق التصدير في Bespring Chemical",
    noteLabel: "ملاحظة تحريرية:",
    noteText:
      "يقدم هذا المقال معلومات عامة عن الشراء، وليس مشورة تتعلق بالصياغة أو الجوانب القانونية أو التنظيمية. يجب التحقق من المواصفات والتصنيفات والاستخدامات المسموح بها للمنتج والمورد وسوق الوجهة المحددين.",
    sidebarTitle: "جهز استفسار المنتج",
    sidebarText:
      "اذكر الاسم الكيميائي الكامل والدرجة والمواصفة المستهدفة والكمية والتعبئة والوجهة والوثائق المطلوبة.",
    ctaContact: "التواصل مع مبيعات التصدير",
    ctaProducts: "استعراض مجموعات المنتجات",
    footerDesc:
      "مورد صيني للمواد الخام الكيميائية الغذائية والعلفية والصناعية لعمليات الشراء العالمية بين الشركات.",
    quickLinks: "روابط سريعة",
    contactUs: "اتصل بنا",
    footerCta: "تواصل معنا",
  },
};

const guides = [
  {
    slug: "chemical-export-document-checklist",
    image: "bespring-export-chemical-shipment-container-loading-port.png",
    date: "2026-04-30",
    title: {
      es: "Lista de documentos para importar productos quimicos",
      pt: "Checklist de documentos para importacao de produtos quimicos",
      de: "Dokumentencheckliste fur den Import von Chemikalien",
      ru: "Checklist dokumentov dlya importa khimicheskoy produktsii",
      ar: "قائمة وثائق استيراد المواد الكيميائية",
    },
    headline: {
      es: "Lista de documentos para importacion quimica para compradores B2B internacionales",
      pt: "Checklist de documentos de importacao quimica para compradores B2B internacionais",
      de: "Dokumentencheckliste fur Chemieimporte fur internationale B2B-Einkaufer",
      ru: "Checklist importnykh dokumentov dlya mezhdunarodnykh B2B-pokupateley khimii",
      ar: "قائمة وثائق استيراد المواد الكيميائية للمشترين الدوليين بين الشركات",
    },
    description: {
      es: "Una lista practica para alinear especificaciones, SDS, COA, certificados, etiquetas y documentos de embarque antes de un pedido internacional de productos quimicos.",
      pt: "Um checklist pratico para alinhar especificacoes, SDS, COA, certificados, rotulos e documentos de embarque antes de um pedido internacional de produtos quimicos.",
      de: "Eine praktische Checkliste, um Spezifikationen, SDS, COA, Zertifikate, Etiketten und Versanddokumente vor einer internationalen Chemikalienbestellung abzustimmen.",
      ru: "Prakticheskiy checklist dlya soglasovaniya spetsifikatsiy, SDS, COA, sertifikatov, markirovki i transportnykh dokumentov pered mezhdunarodnym zakazom khimii.",
      ar: "قائمة عملية لمواءمة المواصفات وورقة بيانات السلامة وشهادة التحليل والشهادات والملصقات ووثائق الشحن قبل طلب دولي للمواد الكيميائية.",
    },
    sections: {
      es: [
        ["Los problemas documentales se resuelven mejor antes de confirmar la orden de compra. El conjunto exacto depende del producto, la clasificacion, el origen, el destino y las condiciones comerciales, pero los compradores pueden reducir retrasos acordando desde el principio la base de aprobacion."],
        ["Documentos tecnicos y de calidad", "Especificacion o TDS", "Debe identificar el producto y el grado exactos, los limites de referencia y las caracteristicas fisicas relevantes. Verifique que el documento coincida con la fuente ofrecida.", "Hoja de datos de seguridad", "La SDS ayuda a revisar seguridad laboral, almacenamiento y transporte. Confirme la revision, el idioma requerido y si la clasificacion de transporte coincide con la concentracion y la forma ofrecidas.", "Certificado de analisis", "Acorde si la aprobacion requiere un COA representativo, un COA previo al embarque o un COA por lote y que ensayos deben figurar."],
        ["Documentos comerciales y de envio", "Segun la operacion, el conjunto puede incluir factura comercial, lista de empaque, conocimiento de embarque, certificado de origen, poliza de seguro y declaraciones especificas del producto o del mercado. Los productos peligrosos pueden requerir declaraciones adicionales, embalaje conforme y marcado adecuado."],
        ["Certificados: verifique el alcance, no solo el logotipo", "Un certificado debe revisarse por entidad legal, planta, alcance de producto o actividad, fecha de emision, vencimiento y organismo emisor. ISO, inocuidad alimentaria, Halal, Kosher o documentos relacionados con alimento animal no cubren automaticamente todos los productos que vende un proveedor."],
        ["Lista previa al pedido", ["Producto exacto, origen y especificacion acordada", "Nombres, formatos e idiomas requeridos para los documentos", "Contenido de etiquetas y marcas de embarque", "Requisitos del origen y del destino", "Estado de mercancias peligrosas y embalaje cuando aplique", "Quien aprueba borradores y en que plazo"] , "Los importadores deben confirmar los requisitos legales y aduaneros vigentes con profesionales locales calificados y proveedores logisticos."],
      ],
      pt: [
        ["Problemas documentais sao mais faceis de resolver antes da confirmacao do pedido. O conjunto exato depende do produto, classificacao, origem, destino e termos comerciais, mas os compradores podem reduzir atrasos definindo cedo a base de aprovacao."],
        ["Documentos tecnicos e de qualidade", "Especificacao ou TDS", "Esse documento deve identificar o produto e o grau exatos, limites de referencia e caracteristicas fisicas relevantes. Garanta que o documento corresponda a fonte ofertada.", "Ficha de dados de seguranca", "A SDS apoia a revisao de seguranca ocupacional, armazenamento e transporte. Confirme revisao, necessidade de idioma e se a classificacao de transporte corresponde a concentracao e a forma ofertadas.", "Certificado de analise", "Alinhe se a aprovacao exige COA representativo, COA pre-embarque ou COA por lote e quais itens de teste devem aparecer."],
        ["Documentos comerciais e de embarque", "Dependendo da transacao, o conjunto pode incluir fatura comercial, packing list, conhecimento de embarque, certificado de origem, documento de seguro e declaracoes especificas do produto ou do mercado. Produtos perigosos podem exigir declaracoes adicionais, embalagem conforme e marcacao adequada."],
        ["Certificados: verifique o escopo, nao apenas o logotipo", "Um certificado deve ser checado quanto a entidade legal, planta, escopo de produto ou atividade, data de emissao, validade e organismo emissor. ISO, seguranca de alimentos, Halal, Kosher ou documentos ligados a nutricao animal nao cobrem automaticamente todo produto vendido pelo fornecedor."],
        ["Checklist antes do pedido", ["Produto exato, origem e especificacao acordada", "Nomes, formatos e idiomas exigidos para os documentos", "Conteudo de rotulos e marcas de embarque", "Requisitos de origem e destino", "Status de produto perigoso e embalagem quando aplicavel", "Quem aprova rascunhos e em qual prazo"], "Importadores devem confirmar requisitos legais e aduaneiros atuais com profissionais locais qualificados e provedores logisticos."],
      ],
      de: [
        ["Dokumentenprobleme lassen sich am einfachsten vor der Auftragsbestatigung losen. Der genaue Satz hangt von Produkt, Einstufung, Ursprung, Zielmarkt und Handelsbedingungen ab, doch Einkaufer konnen Verzogerungen reduzieren, wenn sie die Freigabebasis fruh festlegen."],
        ["Technische und qualitatsbezogene Dokumente", "Spezifikation oder TDS", "Dieses Dokument sollte das genaue Produkt und den genauen Grad, Referenzgrenzen und relevante physische Eigenschaften nennen. Stellen Sie sicher, dass es zur angebotenen Quelle passt.", "Sicherheitsdatenblatt", "Das SDS unterstutzt die Bewertung von Arbeitsschutz, Lagerung und Transport. Prufen Sie Revision, Sprachbedarf und ob die Transporteinstufung mit Konzentration und Darreichungsform ubereinstimmt.", "Analysenzertifikat", "Legen Sie fest, ob fur die Freigabe ein reprasentatives COA, ein Vorversand-COA oder ein chargenspezifisches COA erforderlich ist und welche Prufpunkte erscheinen mussen."],
        ["Kommerzielle und Versanddokumente", "Je nach Geschaft konnen Handelsrechnung, Packliste, Konnossement, Ursprungszeugnis, Versicherungsdokumente und produkt- oder marktspezifische Erklarungen erforderlich sein. Gefahrgut kann zusatzliche Erklarungen, konforme Verpackung und Kennzeichnung verlangen."],
        ["Zertifikate: den Geltungsbereich prufen, nicht nur das Logo", "Ein Zertifikat sollte nach juristischer Einheit, Standort, Produkt- oder Tatigkeitsumfang, Ausstellungs- und Ablaufdatum sowie ausstellender Stelle gepruft werden. ISO-, Lebensmittelsicherheits-, Halal-, Kosher- oder futtermittelbezogene Dokumente decken nicht automatisch jedes Produkt eines Lieferanten ab."],
        ["Checkliste vor dem Auftrag", ["Exaktes Produkt, Ursprung und vereinbarte Spezifikation", "Erforderliche Dokumentnamen, Formate und Sprachen", "Inhalt von Etiketten und Versandmarkierungen", "Anforderungen von Ursprung und Bestimmungsland", "Gefahrgutstatus und Verpackung falls relevant", "Wer Entwurfe freigibt und bis wann"], "Importeure sollten aktuelle rechtliche und zollrechtliche Anforderungen mit qualifizierten lokalen Fachleuten und Logistikdienstleistern bestatigen."],
      ],
      ru: [
        ["Problemy s dokumentami proshche reshat do podtverzhdeniya zakaza. Tochnyy nabor zavisit ot produkta, klassifikatsii, proiskhozhdeniya, punkta naznacheniya i torgovykh usloviy, no pokupateli mogut snizit zaderzhki, soglasovav bazu odobreniya zaranee."],
        ["Tekhnicheskie i kachestvennye dokumenty", "Spetsifikatsiya ili TDS", "Dokument dolzhen tochno opredelyat produkt i marku, referentnye predely i vazhnye fizicheskie kharakteristiki. Ubedites, chto dokument sootvetstvuet predlagaemomu istochniku.", "Pasport bezopasnosti", "SDS pomogaet ocenit voprosy okhrany truda, khraneniya i perevozki. Proverte redaktsiyu, yazyk i sootvetstvie transportnoy klassifikatsii predlagaemoy kontsentratsii i forme.", "Sertifikat analiza", "Soglasuyte, nuzhen li reprezentativnyy COA, predotgruzochnyy COA ili COA na partiyu, a takzhe kakie pokazateli dolzhny byt vklyucheny."],
        ["Kommercheskie i transportnye dokumenty", "V zavisimosti ot sdelki nabor mozhet vklyuchat kommercheskiy invoice, packing list, bill of lading, sertifikat proiskhozhdeniya, strakhovoy dokument i deklaratsii po produktu ili rynku. Opasnye gruzы mogut trebuvat dopolnitelnye deklaratsii, pravilnuyu upakovku i markirovku."],
        ["Sertifikaty: proveriayte oblast deystviya, a ne tolko logotip", "Sertifikat sleduet proverit po yuridicheskomu litsu, ploshchadke, oblasti pokrytiya produkta ili deystviy, datam vydachi i okonchaniya, a takzhe po organu vydachi. ISO, food-safety, Halal, Kosher ili kormovye dokumenty ne rasprostranyayutsya avtomaticheski na kazhdyy produkt postavshchika."],
        ["Predzakaznyy checklist", ["Tochnyy produkt, istochnik i soglasovannaya spetsifikatsiya", "Trebuemye nazvaniya, formaty i yazyki dokumentov", "Soderzhanie etiketki i transportnoy markirovki", "Treboвания strany proiskhozhdeniya i strany naznacheniya", "Status opasnogo gruza i upakovka pri neobkhodimosti", "Kto utverzhdaet cheriki i v kakoy srok"], "Importery dolzhny podtverzhdat aktualnye pravovye i tamozhennye trebovaniya u kvalifitsirovannykh mestnykh spetsialistov i logisticheskikh partnerov."],
      ],
      ar: [
        ["تكون مشكلات الوثائق أسهل في الحل قبل تأكيد أمر الشراء. فمجموعة المستندات الدقيقة تعتمد على المنتج والتصنيف والمنشأ والوجهة وشروط التجارة، لكن يمكن للمشترين تقليل التأخير عبر الاتفاق مبكراً على أساس الموافقة."],
        ["الوثائق الفنية ووثائق الجودة", "المواصفة أو TDS", "ينبغي أن يحدد هذا المستند المنتج والدرجة بدقة، وحدود المرجع والخصائص الفيزيائية ذات الصلة. تأكد من أن المستند يطابق المصدر المعروض.", "ورقة بيانات السلامة", "تدعم SDS مراجعة السلامة المهنية والتخزين والنقل. تحقق من الإصدار واللغة المطلوبة وما إذا كان تصنيف النقل يتوافق مع التركيز والشكل المعروضين.", "شهادة التحليل", "اتفق مسبقاً على ما إذا كانت الموافقة تتطلب COA تمثيلياً أو COA قبل الشحن أو COA خاصاً بالدفعة، وما هي بنود الاختبار التي يجب أن تظهر."],
        ["الوثائق التجارية ووثائق الشحن", "بحسب الصفقة، قد تشمل المجموعة الفاتورة التجارية وقائمة التعبئة وبوليصة الشحن وشهادة المنشأ ووثيقة التأمين وإقرارات خاصة بالمنتج أو بالسوق. وقد تتطلب البضائع الخطرة إقرارات إضافية وتعبئة مطابقة وعلامات صحيحة."],
        ["الشهادات: تحقق من النطاق وليس من الشعار فقط", "يجب فحص الشهادة من حيث الكيان القانوني والموقع ونطاق المنتج أو النشاط وتاريخ الإصدار والانتهاء والجهة المصدرة. ولا تعني وثائق ISO أو سلامة الغذاء أو الحلال أو الكوشير أو العلف أنها تغطي تلقائياً كل منتج يبيعه المورد."],
        ["قائمة مراجعة قبل الطلب", ["المنتج الدقيق والمصدر والمواصفة المتفق عليها", "أسماء المستندات المطلوبة وصيغها ولغاتها", "محتوى الملصقات وعلامات الشحن", "متطلبات بلد المنشأ وبلد الوجهة", "حالة البضائع الخطرة والتعبئة عند الحاجة", "من يوافق على المسودات وفي أي موعد"], "ينبغي للمستوردين تأكيد المتطلبات القانونية والجمركية الحالية مع متخصصين محليين مؤهلين ومزودي الخدمات اللوجستية."],
      ],
    },
  },
  {
    slug: "how-to-qualify-chemical-supplier-china",
    image: "bespring-quality-control-laboratory-chemical-testing-phosphate.png",
    date: "2026-02-12",
    title: {
      es: "Como calificar a un proveedor quimico en China",
      pt: "Como qualificar um fornecedor quimico na China",
      de: "Wie man einen Chemikalienlieferanten in China qualifiziert",
      ru: "Kak kvalifitsirovat postavshchika khimii v Kitae",
      ar: "كيفية تأهيل مورد مواد كيميائية في الصين",
    },
    headline: {
      es: "Como calificar a un proveedor quimico en China: lista practica para compradores",
      pt: "Como qualificar um fornecedor quimico na China: checklist pratico para compradores",
      de: "Wie man einen Chemikalienlieferanten in China qualifiziert: praktische Checkliste fur Einkaufer",
      ru: "Kak kvalifitsirovat kitayskogo postavshchika khimii: prakticheskiy checklist dlya pokupatelya",
      ar: "كيفية تأهيل مورد مواد كيميائية في الصين: قائمة عملية للمشتري",
    },
    description: {
      es: "Un marco practico para calificar a un proveedor quimico chino mediante identidad legal, especificaciones, documentos de calidad, trazabilidad y capacidad de exportacion.",
      pt: "Um modelo pratico para qualificar um fornecedor quimico chines com base em identidade legal, especificacoes, documentos de qualidade, rastreabilidade e capacidade de exportacao.",
      de: "Ein praktischer Rahmen zur Qualifizierung eines chinesischen Chemikalienlieferanten anhand von juristischer Identitat, Spezifikationen, Qualitatsdokumenten, Ruckverfolgbarkeit und Exportfahigkeit.",
      ru: "Prakticheskaya skhema kvalifikatsii kitayskogo postavshchika khimii po yuridicheskoy identichnosti, spetsifikatsiyam, dokumentam kachestva, proslezhivaemosti i eksportnym vozmozhnostyam.",
      ar: "إطار عملي لتأهيل مورد مواد كيميائية صيني بالاعتماد على الهوية القانونية والمواصفات ووثائق الجودة وإمكانية التتبع وقدرة التصدير.",
    },
    sections: {
      es: [
        ["Una calificacion fiable debe verificar la entidad legal, el origen del producto, la especificacion, los controles de calidad, la documentacion y la ejecucion de exportacion, no solo el sitio web, la cotizacion o una imagen de certificado."],
        ["Empiece por el rol exacto en la cadena de suministro", "Aclare si la empresa es fabricante, exportador, distribuidor o un proveedor coordinador que trabaja con plantas aprobadas. Cada modelo puede funcionar, pero el comprador debe entender quien fabrica, ensaya y libera el lote y quien figura en los documentos comerciales."],
        ["Siete controles de calificacion", "Identidad legal y comercial", "Confirme nombre registrado, direccion, alcance comercial, beneficiario bancario y entidad contractual. Toda diferencia debe explicarse antes del pago o la aprobacion.", "Identidad del producto y del origen", "Solicite nombre quimico completo, grado, numero CAS, fabricante o planta cuando corresponda, pais de origen y especificacion vigente.", "Alineacion de la especificacion", "Compare lado a lado sus criterios de aceptacion y la especificacion del proveedor. Marque toda brecha en ensayo, humedad, tamano de particula, pH, contaminantes, viscosidad u otros parametros criticos.", "Documentacion de calidad", "Revise especificacion o TDS, SDS y un COA representativo. Compruebe fechas de revision, metodos, unidades y si los documentos corresponden al mismo producto y origen. Los certificados deben verificarse por entidad, planta, alcance y vigencia.", "Trazabilidad y control de cambios", "Pregunte como se identifican los lotes, como se retienen muestras y registros, como se maneja el material no conforme y como se comunican los cambios de materia prima, proceso, planta o especificacion.", "Embalaje y preparacion para exportacion", "Confirme peso neto, liner interior, tipo de saco o tambor, requisitos de pallets, marcas de embarque, carga de contenedor y condicion de mercancia peligrosa. Asegure que el proveedor pueda emitir los documentos requeridos por destino.", "Pedido de prueba y revision de desempeno", "Cuando el riesgo lo justifique, complete aprobacion documental, evaluacion de muestra o lote piloto y ensayos de recepcion antes de escalar volumen. Haga seguimiento a capacidad de respuesta, precision documental, consistencia entre lotes y ejecucion del embarque."],
        ["Senales de alerta que requieren aclaracion", ["El nombre de la empresa, la factura y la cuenta bancaria no coinciden", "Las especificaciones cambian sin explicacion", "Los certificados no identifican una planta o alcance relevantes", "Los valores del COA parecen identicos entre lotes no relacionados", "El proveedor no puede explicar fabricante o trazabilidad", "Los requisitos de mercancia peligrosa solo se abordan despues de reservar el embarque"]],
        ["Informacion que debe enviar con su solicitud de calificacion", "Incluya producto, grado, especificacion, volumen anual, embalaje, destino, documentos requeridos y proceso de aprobacion. Una solicitud precisa ayuda a distinguir a un proveedor capaz de una cotizacion rapida sin base tecnica."],
      ],
      pt: [
        ["Uma qualificacao confiavel deve verificar a entidade legal, a origem do produto, a especificacao, os controles de qualidade, a documentacao e a execucao de exportacao, e nao apenas o site, a cotacao ou a imagem de um certificado."],
        ["Comece pelo papel exato na cadeia de suprimentos", "Esclareca se a empresa e fabricante, exportadora, distribuidora ou fornecedora coordenadora que usa plantas aprovadas. Cada modelo pode funcionar, mas o comprador deve entender quem fabrica, testa e libera o lote e quem aparece nos documentos comerciais."],
        ["Sete verificacoes de qualificacao", "Identidade legal e comercial", "Confirme nome registrado, endereco, escopo de negocios, beneficiario bancario e entidade contratual. Qualquer diferenca deve ser explicada antes do pagamento ou da aprovacao.", "Identidade do produto e da origem", "Solicite nome quimico completo, grau, numero CAS, fabricante ou planta quando aplicavel, pais de origem e especificacao atual.", "Alinhamento da especificacao", "Compare lado a lado seus criterios de aceitacao e a especificacao do fornecedor. Marque todas as lacunas em teor, umidade, tamanho de particula, pH, contaminantes, viscosidade ou outros parametros criticos.", "Documentacao de qualidade", "Revise especificacao ou TDS, SDS e um COA representativo. Verifique datas de revisao, metodos, unidades e se os documentos se referem ao mesmo produto e origem. Certificados devem ser verificados por entidade, planta, escopo e validade.", "Rastreabilidade e controle de mudancas", "Pergunte como os lotes sao identificados, como amostras e registros sao retidos, como material nao conforme e tratado e como mudancas em materias-primas, processo, planta ou especificacao sao comunicadas.", "Embalagem e prontidao para exportacao", "Confirme peso liquido, liner interno, saco ou tambor, requisitos de pallet, marcas de embarque, estufagem de container e status de produto perigoso. Garanta que o fornecedor possa emitir documentos especificos do destino.", "Pedido de teste e revisao de desempenho", "Quando o risco justificar, conclua aprovacao documental, avaliacao de amostra ou lote piloto e testes de recebimento antes de ampliar volume. Acompanhe tempo de resposta, precisao documental, consistencia entre lotes e execucao do embarque."],
        ["Sinais de alerta que exigem esclarecimento", ["Nome da empresa, invoice e conta bancaria nao coincidem", "Especificacoes mudam sem explicacao", "Certificados nao identificam planta ou escopo relevantes", "Valores de COA parecem identicos entre lotes nao relacionados", "O fornecedor nao consegue explicar fabricante ou rastreabilidade", "Requisitos de produto perigoso so sao tratados apos a reserva do embarque"]],
        ["Informacoes a enviar com a solicitacao de qualificacao", "Inclua produto, grau, especificacao, volume anual, embalagem, destino, documentos exigidos e processo de aprovacao. Um pedido preciso ajuda a separar um fornecedor capaz de uma cotacao apenas rapida."],
      ],
      de: [
        ["Eine belastbare Lieferantenqualifizierung sollte juristische Einheit, Produktquelle, Spezifikation, Qualitatskontrollen, Dokumentation und Exportabwicklung prufen und nicht nur Website, Angebot oder Zertifikatsbild."],
        ["Mit der genauen Rolle in der Lieferkette beginnen", "Klaren Sie, ob das Unternehmen Hersteller, Exporteur, Distributor oder koordinierender Lieferant mit freigegebenen Produktionspartnern ist. Jedes Modell kann funktionieren, doch der Einkaufer sollte wissen, wer produziert, pruft, freigibt und auf Handelsdokumenten erscheint."],
        ["Sieben Qualifikationsprufungen", "Juristische und kommerzielle Identitat", "Bestatigen Sie registrierten Firmennamen, Adresse, Geschaftsumfang, Bankbegunstigten und Vertragseinheit. Abweichungen sollten vor Zahlung oder Freigabe erklart werden.", "Produkt- und Quellenidentitat", "Fordern Sie den vollstandigen chemischen Namen, Grad, CAS-Nummer, Hersteller oder Standort falls erforderlich, Ursprungsland und aktuelle Spezifikation an.", "Abgleich der Spezifikation", "Vergleichen Sie Ihre Annahmekriterien direkt mit der Lieferantenspezifikation. Markieren Sie jede Abweichung bei Gehalt, Feuchte, Partikelgrose, pH, Kontaminanten, Viskositat oder anderen kritischen Parametern.", "Qualitatsdokumentation", "Prufen Sie Spezifikation oder TDS, SDS und ein reprasentatives COA. Kontrollieren Sie Revisionsdaten, Methoden, Einheiten und ob sich die Dokumente auf dasselbe Produkt und dieselbe Quelle beziehen. Zertifikate sollten nach Einheit, Standort, Geltungsbereich und Gultigkeit gepruft werden.", "Ruckverfolgbarkeit und Anderungskontrolle", "Fragen Sie, wie Chargen identifiziert werden, wie Muster und Aufzeichnungen aufbewahrt werden, wie mit nichtkonformer Ware umgegangen wird und wie Anderungen bei Rohstoffen, Prozess, Werk oder Spezifikation gemeldet werden.", "Verpackung und Exportbereitschaft", "Bestatigen Sie Nettogewicht, Innenliner, Sack- oder Trommeltyp, Palettenanforderungen, Versandmarkierungen, Containerbeladung und Gefahrgutstatus. Stellen Sie sicher, dass der Lieferant zielmarktspezifische Dokumente liefern kann.", "Testauftrag und Leistungsbewertung", "Wenn das Risiko es rechtfertigt, sollten Dokumentenfreigabe, Muster- oder Pilotchargenbewertung und Wareneingangsprufung vor Volumenerhohung abgeschlossen werden. Beobachten Sie Reaktionsgeschwindigkeit, Dokumentengenauigkeit, Chargenkonstanz und Versandabwicklung."],
        ["Warnsignale mit Erklarungsbedarf", ["Firmenname, Rechnung und Bankverbindung stimmen nicht uberein", "Spezifikationen andern sich ohne Erklarung", "Zertifikate nennen keinen relevanten Standort oder Geltungsbereich", "COA-Werte wirken bei nicht zusammenhangenden Chargen identisch", "Der Lieferant kann Hersteller oder Ruckverfolgbarkeit nicht erklaren", "Gefahrgutanforderungen werden erst nach der Buchung behandelt"]],
        ["Welche Informationen in die Qualifikationsanfrage gehoren", "Nennen Sie Produkt, Grad, Spezifikation, Jahresmenge, Verpackung, Zielort, erforderliche Dokumente und Freigabeprozess. Eine prazise Anfrage hilft, einen leistungsfahigen Lieferanten von einem schnellen, aber oberflachlichen Angebot zu unterscheiden."],
      ],
      ru: [
        ["Nadezhnaya kvalifikatsiya postavshchika dolzhna proverit yuridicheskoe litso, istochnik produkta, spetsifikatsiyu, kontroli kachestva, dokumentatsiyu i ispolnenie eksporta, a ne tolko sayt, kotirovku ili izobrazhenie sertifikata."],
        ["Nachnite s tochnoy roli v tsepochke postavok", "Utochnite, yavlyaetsya li kompaniya proizvoditelem, eksporterom, distributsorom ili koordiniruyushchim postavshchikom s odobrennymi proizvodstvennymi partnerami. Lyubaya model mozhet rabotat, no pokupatel dolzhen ponimat, kto proizvodit, testiruet i vypuskaet partiyu i kto ukazan v kommercheskikh dokumentakh."],
        ["Sem proverok kvalifikatsii", "Yuridicheskaya i kommercheskaya identichnost", "Podtverdite registratsionnoe nazvanie kompanii, adres, vidy deyatelnosti, bankovskogo poluchatelya i dogovornuyu storonu. Lyubye razlichiya dolzhny byt obyasneny do oplaty ili odobreniya.", "Identichnost produkta i istochnika", "Zaprosite polnoe khimicheskoe nazvanie, marku, CAS-nomer, proizvoditelya ili ploshchadku pri neobkhodimosti, stranu proiskhozhdeniya i aktualnuyu spetsifikatsiyu.", "Sopostavlenie spetsifikatsii", "Sravnite v odnom vide svoi kriterii priemki i spetsifikatsiyu postavshchika. Otmecajte vse promezhutki po soderzhaniyu, vlazhnosti, razmeru chastits, pH, kontaminantam, vyazkosti i drugim kriticheskim parametram.", "Dokumenty kachestva", "Proverte spetsifikatsiyu ili TDS, SDS i reprezentativnyy COA. Sverte daty revizii, metody, edinitsy i sootvetstvie odnomu i tomu zhe produktu i istochniku. Sertifikaty nuzhno proverit po yuridicheskomu litsu, ploshchadke, oblasti deystviya i sroku deystviya.", "Proslezhivaemost i kontrol izmeneniy", "Sprosite, kak identifitsiruyutsya partii, kak khranyatsya obraztsy i zapisi, kak obrabatyvaetsya nesootvetstvuyushchiy material i kak soobshchayutsya izmeneniya syrya, protsessa, ploshchadki ili spetsifikatsii.", "Upakovka i eksportnaya gotovnost", "Podtverdite net-ves, vnutrenniy liner, tip meshka ili bochki, trebovaniya k palletam, transportnuyu markirovku, zagrukzu konteinera i status opasnogo gruza. Ubedites, chto postavshchik mozhet podgotovit dokumenty pod trebovaniya strany naznacheniya.", "Probnyy zakaz i otsenka ispolneniya", "Kogda risk opravdan, zavershite dokumentalnoe odobrenie, otsenku obraztsa ili pilotnoy partii i vstupitelnyy laboratornyy kontrol do masshtabirovaniya. Otslezhivayte skorost otveta, tochnost dokumentov, stabilnost partiy i ispolnenie otgruzki."],
        ["Preduprezhdayushchie priznaki, trebuyushchie utochneniya", ["Nazvanie kompanii, invoice i bankovskie dannye ne sovpadayut", "Spetsifikatsii menyayutsya bez obyasneniya", "Sertifikaty ne ukazyvayut relevatnuyu ploshchadku ili oblast", "Znachenia COA vygladyat odinakovymi dlya nesvyazannykh partiy", "Postavshchik ne mozhet obyiasnit proizvoditelya ili proslezhivaemost", "Trebovaniya po opasnym gruzam podnimayutsya tolko posle bukirovaniya"]],
        ["Kakuyu informatsiyu otpravlyat v kvalifikatsionnom zaprose", "Ukazhite produkt, marku, spetsifikatsiyu, godovoy obyom, upakovku, punkt naznacheniya, trebuemye dokumenty i protsess odobreniya. Tochnyy zapros pomogaet otlichit kompetentnogo postavshchika ot prosto bystroy tsenovoy kotirovki."],
      ],
      ar: [
        ["يجب أن يتحقق تأهيل المورد الموثوق من الكيان القانوني ومصدر المنتج والمواصفة وضوابط الجودة والوثائق وقدرة التنفيذ التصديري، وليس فقط من الموقع الإلكتروني أو عرض السعر أو صورة شهادة."],
        ["ابدأ بالدور الدقيق في سلسلة التوريد", "حدد ما إذا كانت الشركة مصنعاً أو مصدراً أو موزعاً أو مورداً منسقاً يعمل مع مصانع معتمدة. يمكن أن ينجح كل نموذج، لكن على المشتري أن يفهم من الذي يصنع ويفحص ويفرج عن الدفعة ومن الذي يظهر في المستندات التجارية."],
        ["سبعة فحوصات للتأهيل", "الهوية القانونية والتجارية", "أكد اسم الشركة المسجل والعنوان ونطاق الأعمال والمستفيد البنكي والجهة التعاقدية. يجب تفسير أي اختلاف قبل الدفع أو الموافقة.", "هوية المنتج والمصدر", "اطلب الاسم الكيميائي الكامل والدرجة ورقم CAS والمصنع أو الموقع عند الحاجة وبلد المنشأ والمواصفة الحالية.", "مواءمة المواصفة", "اعمل مقارنة مباشرة بين معايير القبول لديك ومواصفة المورد. ضع علامة على أي فجوة في العيار أو الرطوبة أو حجم الجسيمات أو pH أو الملوثات أو اللزوجة أو غيرها من المعايير الحرجة.", "وثائق الجودة", "راجع المواصفة أو TDS وSDS وCOA تمثيلياً. تحقق من تواريخ المراجعة والطرق والوحدات وما إذا كانت الوثائق تشير إلى المنتج والمصدر نفسيهما. كما يجب التحقق من الشهادات من حيث الكيان والموقع والنطاق والصلاحية.", "إمكانية التتبع وضبط التغيير", "اسأل كيف يتم تعريف الدفعات وكيف تحفظ العينات والسجلات وكيف تعالج المواد غير المطابقة وكيف يتم إبلاغ التغييرات في المواد الخام أو العملية أو الموقع أو المواصفة.", "التعبئة والاستعداد للتصدير", "أكد الوزن الصافي والبطانة الداخلية ونوع الكيس أو البرميل ومتطلبات الطبليات وعلامات الشحن وتحميل الحاوية وحالة البضائع الخطرة. وتأكد من قدرة المورد على تقديم وثائق خاصة بسوق الوجهة.", "الطلب التجريبي ومراجعة الأداء", "عندما يبرر الخطر ذلك، أكمل الموافقة الوثائقية وتقييم العينة أو الدفعة التجريبية واختبارات الاستلام قبل توسيع الحجم. وتتبع سرعة الاستجابة ودقة الوثائق واتساق الدفعات وتنفيذ الشحن."],
        ["إشارات تحذير تتطلب توضيحاً", ["اسم الشركة والفاتورة والحساب البنكي غير متطابقة", "تتغير المواصفات دون تفسير", "الشهادات لا تحدد موقعاً أو نطاقاً ذا صلة", "قيم COA تبدو متطابقة بين دفعات غير مرتبطة", "المورد لا يستطيع شرح المصنع أو التتبع", "متطلبات البضائع الخطرة لا تناقش إلا بعد حجز الشحنة"]],
        ["المعلومات التي يجب إرسالها مع طلب التأهيل", "اذكر المنتج والدرجة والمواصفة والحجم السنوي والتعبئة والوجهة والوثائق المطلوبة وآلية الموافقة. فالطلب الدقيق يساعد على التمييز بين المورد القادر وعرض السعر السريع غير المدعوم فنياً."],
      ],
    },
  },
  {
    slug: "mcp-vs-dcp-feed-phosphate-guide",
    image: "mcp-dcp-feed-grade-calcium-phosphate-animal-nutrition-china.jpg",
    date: "2026-05-26",
    title: {
      es: "MCP vs DCP en fosfatos para piensos",
      pt: "MCP vs DCP em fosfatos para racao",
      de: "MCP vs DCP bei Futterphosphaten",
      ru: "MCP vs DCP v kormovykh fosfatakh",
      ar: "MCP مقابل DCP في فوسفات الأعلاف",
    },
    headline: {
      es: "MCP vs DCP para piensos: guia de calificacion para compradores",
      pt: "MCP vs DCP para racao: guia de qualificacao para compradores",
      de: "MCP vs DCP bei Futterphosphaten: Einkaufsleitfaden fur die Qualifizierung",
      ru: "MCP vs DCP dlya kormov: rukovodstvo po kvalifikatsii dlya pokupatelya",
      ar: "MCP مقابل DCP في فوسفات الأعلاف: دليل تأهيل للمشتري",
    },
    description: {
      es: "Compare monofosfato calcico y fosfato dicalcico para compras de piensos, incluyendo identidad nutricional, ensayo, forma fisica, contaminantes y documentacion.",
      pt: "Compare monofosfato calcico e fosfato dicalcico para compras de racao, incluindo identidade nutricional, teor, forma fisica, contaminantes e documentacao.",
      de: "Vergleichen Sie Monocalciumphosphat und Dicalciumphosphat fur den Futtereinkauf, einschlieslich Nahrstoffidentitat, Gehalt, physischer Form, Kontaminanten und Dokumentation.",
      ru: "Sravnite monokaltsiyfosfat i dikaltsiyfosfat dlya zakupki kormov po nutritivnoy identichnosti, analizam, fizicheskoy forme, kontaminantam i dokumentam.",
      ar: "قارن بين فوسفات أحادي الكالسيوم وفوسفات ثنائي الكالسيوم لشراء الأعلاف، بما يشمل الهوية الغذائية والعيار والشكل الفيزيائي والملوثات والوثائق.",
    },
    sections: {
      es: [
        ["MCP y DCP son fuentes minerales para pienso, pero los productos comerciales pueden diferir en fosforo, calcio, humedad, tamano de particula y perfil de impurezas. Los compradores deben comparar una especificacion acordada, no solo las siglas."],
        ["Identidad y perfil nutricional", "Monofosfato calcico y fosfato dicalcico contienen proporciones distintas de calcio y fosforo. El material comercial grado pienso tambien puede diferir por estado de hidratacion y ruta de fabricacion. Confirme la forma quimica declarada y los niveles nutricionales garantizados del producto real."],
        ["Que importa durante la calificacion del proveedor?", "Analisis garantizado", "Especifique fosforo y calcio minimos, humedad maxima y cualquier otro limite nutricional usado por formulacion y control de recepcion.", "Contaminantes y seguridad del pienso", "Defina limites de fluor, arsenico, plomo, cadmio y otros contaminantes relevantes segun el mercado de destino y su evaluacion de riesgo. Solicite la especificacion vigente y un COA representativo o por lote.", "Calidad fisica", "Distribucion de tamanos, forma en polvo o granular, tendencia al apelmazamiento y fluidez pueden influir en mezcla, segregacion y manejo. Incluya estos requisitos en la RFQ."],
        ["Documentos y estado de mercado", "Confirme SDS, especificacion, formato del COA, informacion del fabricante o planta, estado de registro para pienso cuando aplique y certificados requeridos por el destino. El estatus grado pienso depende de la fuente y no debe inferirse solo por el nombre MCP o DCP."],
        ["Lista RFQ", ["Forma del producto y fosforo/calcio garantizados", "Limites maximos de fluor y metales pesados", "Tamano de particula y empaque", "Especie objetivo o categoria de pienso para revision regulatoria", "Pais de destino, cantidad y ventana de embarque"]],
      ],
      pt: [
        ["MCP e DCP sao fontes minerais para racao, mas produtos comerciais podem diferir em fosforo, calcio, umidade, tamanho de particula e perfil de impurezas. Os compradores devem comparar uma especificacao acordada, nao apenas siglas."],
        ["Identidade e perfil nutricional", "Monofosfato calcico e fosfato dicalcico contem proporcoes diferentes de calcio e fosforo. O material comercial grau racao tambem pode variar por estado de hidratacao e rota de fabricacao. Confirme a forma quimica declarada e os niveis nutricionais garantidos do produto real."],
        ["O que importa durante a qualificacao do fornecedor?", "Analise garantida", "Defina fosforo e calcio minimos, umidade maxima e quaisquer outros limites nutricionais usados pela formulacao e pelo controle de recebimento.", "Contaminantes e seguranca da racao", "Estabeleca limites para fluor, arsenio, chumbo, cadmio e outros contaminantes relevantes conforme o mercado de destino e sua avaliacao de risco. Solicite a especificacao atual e um COA representativo ou por lote.", "Qualidade fisica", "Distribuicao granulometrica, forma em po ou granular, tendencia a empedramento e escoamento podem influenciar mistura, segregacao e manuseio. Inclua esses requisitos na RFQ."],
        ["Documentos e status de mercado", "Confirme SDS, especificacao, formato de COA, informacoes do fabricante ou planta, status de registro de racao quando aplicavel e certificados exigidos pelo destino. O status de grau racao depende da fonte e nao deve ser inferido apenas pelo nome MCP ou DCP."],
        ["Checklist de RFQ", ["Forma do produto e fosforo/calcio garantidos", "Limites maximos de fluor e metais pesados", "Granulometria e embalagem", "Especie alvo ou categoria de racao para revisao regulatoria", "Pais de destino, quantidade e janela de embarque"]],
      ],
      de: [
        ["MCP und DCP sind Mineralquellen fur Futtermittel, doch Handelsprodukte konnen sich bei Phosphor, Calcium, Feuchte, Partikelgrose und Verunreinigungsprofil unterscheiden. Einkaufer sollten eine vereinbarte Spezifikation vergleichen und nicht nur Abkurzungen."],
        ["Identitat und Nahrstoffprofil", "Monocalciumphosphat und Dicalciumphosphat enthalten unterschiedliche Verhaltnisse von Calcium und Phosphor. Handelsware in Futtermittelqualitat kann sich zudem durch Hydratationszustand und Herstellroute unterscheiden. Bestatigen Sie die deklarierte chemische Form und die garantierten Nahrstoffwerte des tatsachlichen Produkts."],
        ["Was ist bei der Lieferantenqualifizierung wichtig?", "Garantierte Analyse", "Legen Sie Mindestwerte fur Phosphor und Calcium, maximale Feuchte und weitere Nahrstoffgrenzen fest, die fur Formulierung und Wareneingang relevant sind.", "Kontaminanten und Futtermittelsicherheit", "Setzen Sie Grenzwerte fur Fluor, Arsen, Blei, Cadmium und weitere relevante Kontaminanten entsprechend Zielmarkt und Risikobewertung. Fordern Sie die aktuelle Spezifikation sowie ein reprasentatives oder chargenspezifisches COA an.", "Physische Qualitat", "Partikelgrose, Pulver- oder Granulatform, Verklumpungsneigung und Fliesverhalten beeinflussen Mischung, Entmischung und Handhabung. Nennen Sie diese Anforderungen in der RFQ."],
        ["Dokumente und Marktstatus", "Bestatigen Sie SDS, Spezifikation, COA-Format, Hersteller- oder Standortangaben, gegebenenfalls Futtermittelregistrierungsstatus sowie zielmarktrelevante Zertifikate. Futtermittelqualitat ist quellenbezogen und sollte nicht allein aus dem Namen MCP oder DCP abgeleitet werden."],
        ["RFQ-Checkliste", ["Produktform und garantierter Phosphor-/Calciumgehalt", "Maximale Fluor- und Schwermetallgrenzen", "Partikelgrose und Verpackung", "Zieltierart oder Futtermittelkategorie fur die regulatorische Prufung", "Bestimmungsland, Menge und Versandfenster"]],
      ],
      ru: [
        ["MCP i DCP yavlyayutsya mineralnymi istochnikami dlya kormov, no kommercheskie produkty mogut razlikhatsya po fosforu, kaltsiyu, vlazhnosti, razmeru chastits i profilyu primesey. Pokupatelyam sleduet sravnivat soglasovannuyu spetsifikatsiyu, a ne tolko sokrashcheniya."],
        ["Identichnost i nutritivnyy profil", "Monokaltsiyfosfat i dikaltsiyfosfat soderzhat raznye dolи kaltsiya i fosfora. Kommercheskiy kormovoy material takzhe mozhet razlikhatsya po gidratatsii i tekhnologii proizvodstva. Podtverdite zayavlennuyu khimicheskuyu formu i garantirovannye nutritivnye pokazateli konkretno predlagaemogo produkta."],
        ["Chto vazhno pri kvalifikatsii postavshchika?", "Garantirovannyy analiz", "Ustanovite minimumy po fosforu i kaltsiyu, maksimum po vlazhnosti i drugie nutritivnye granitsy, kotorye ispolzuyutsya v formulirovanii i pri vkhodnom kontrole.", "Kontaminanty i bezopasnost korma", "Ustanovite predely po flyuoru, myshyaku, svintsu, kadmiyu i drugim relevantnym kontaminantam v sootvetstvii s rynkom naznacheniya i vashey otsenkoy riska. Zaprosite aktualnuyu spetsifikatsiyu i reprezentativnyy ili partionnyy COA.", "Fizicheskoe kachestvo", "Raspredelenie po razmeru chastits, poroshkovaya ili granulirovannaya forma, sklonnost k slezhivaniyu i tekuchest vliyayut na smeshenie, segregatsiyu i obrashchenie. Zafiksiruyte eti trebovaniya v RFQ."],
        ["Dokumenty i rynochnyy status", "Podtverdite SDS, spetsifikatsiyu, format COA, informatsiyu o proizvoditele ili ploshchadke, status registratsii korma pri neobkhodimosti i sertifikaty, trebuemye dlya strany naznacheniya. Status kormovogo produkta zavisit ot istochnika i ne dolzhen vyvoditsya tolko iz nazvaniya MCP ili DCP."],
        ["RFQ checklist", ["Forma produkta i garantirovannyy fosfor/kaltsiy", "Maksimalnye predely po flyuoru i tyazhelym metallam", "Razmer chastits i upakovka", "Tselevoy vid zhivotnykh ili kategoriya korma dlya regulatornoy proverki", "Strana naznacheniya, kolichestvo i okno otgruzki"]],
      ],
      ar: [
        ["يعد كل من MCP وDCP مصادر معدنية للأعلاف، لكن المنتجات التجارية قد تختلف في الفوسفور والكالسيوم والرطوبة وحجم الجسيمات ومستوى الشوائب. وعلى المشترين مقارنة مواصفة متفق عليها، لا مجرد الاختصارات."],
        ["الهوية والملف الغذائي", "يحتوي فوسفات أحادي الكالسيوم وفوسفات ثنائي الكالسيوم على نسب مختلفة من الكالسيوم والفوسفور. كما قد تختلف المادة التجارية بدرجة العلف من حيث حالة الإماهة ومسار التصنيع. أكد الشكل الكيميائي المعلن والمستويات الغذائية المضمونة للمنتج الفعلي."],
        ["ما الذي يهم أثناء تأهيل المورد؟", "التحليل المضمون", "حدد الحدود الدنيا للفوسفور والكالسيوم والحد الأقصى للرطوبة وأي حدود غذائية أخرى يستخدمها فريق الصياغة وضبط الاستلام.", "الملوثات وسلامة العلف", "ضع حدوداً للفلور والزرنيخ والرصاص والكادميوم وغيرها من الملوثات ذات الصلة وفقاً لسوق الوجهة وتقييم المخاطر لديك. واطلب المواصفة الحالية وCOA تمثيلياً أو خاصاً بالدفعة.", "الجودة الفيزيائية", "قد يؤثر توزيع حجم الجسيمات والشكل المسحوق أو الحبيبي وميل التكتل والانسيابية في الخلط والانفصال والمناولة. لذا اذكر هذه المتطلبات في RFQ."],
        ["الوثائق وحالة السوق", "أكد SDS والمواصفة وصيغة COA ومعلومات المصنع أو الموقع وحالة تسجيل العلف عند الاقتضاء والشهادات المطلوبة من سوق الوجهة. وتعتمد صفة درجة العلف على المصدر ولا ينبغي استنتاجها من اسم MCP أو DCP فقط."],
        ["قائمة RFQ", ["شكل المنتج والفوسفور/الكالسيوم المضمونان", "الحدود القصوى للفلور والمعادن الثقيلة", "حجم الجسيمات والتعبئة", "نوع الحيوان المستهدف أو فئة العلف للمراجعة التنظيمية", "بلد الوجهة والكمية ونافذة الشحن"]],
      ],
    },
  },
  {
    slug: "stpp-vs-shmp-selection-guide",
    image: "stpp-food-grade-sodium-tripolyphosphate-china-supplier.jpg",
    date: "2026-06-18",
    title: {
      es: "STPP vs SHMP: comparacion para compradores",
      pt: "STPP vs SHMP: comparacao para compradores",
      de: "STPP vs SHMP: Vergleich fur Einkaufer",
      ru: "STPP vs SHMP: sravnenie dlya pokupatelya",
      ar: "STPP مقابل SHMP: مقارنة للمشترين",
    },
    headline: {
      es: "STPP vs SHMP: como deben comparar los compradores industriales estos dos fosfatos",
      pt: "STPP vs SHMP: como compradores industriais devem comparar estes dois fosfatos",
      de: "STPP vs SHMP: wie industrielle Einkaufer diese beiden Phosphate vergleichen sollten",
      ru: "STPP vs SHMP: kak promyshlennomu pokupatelyu sravnit eti dva fosfata",
      ar: "STPP مقابل SHMP: كيف ينبغي للمشترين الصناعيين مقارنة هذين الفوسفاتين",
    },
    description: {
      es: "Compare STPP y SHMP por identidad quimica, funcion, grado, especificacion, forma fisica y requisitos de calificacion del proveedor.",
      pt: "Compare STPP e SHMP por identidade quimica, funcao, grau, especificacao, forma fisica e requisitos de qualificacao do fornecedor.",
      de: "Vergleichen Sie STPP und SHMP nach chemischer Identitat, Funktion, Grad, Spezifikation, physischer Form und Anforderungen an die Lieferantenqualifizierung.",
      ru: "Sravnite STPP i SHMP po khimicheskoy identichnosti, funktsii, marke, spetsifikatsii, fizicheskoy forme i trebovaniyam k kvalifikatsii postavshchika.",
      ar: "قارن بين STPP وSHMP من حيث الهوية الكيميائية والوظيفة والدرجة والمواصفة والشكل الفيزيائي ومتطلبات تأهيل المورد.",
    },
    sections: {
      es: [
        ["STPP y SHMP son ambos fosfatos sodicos, pero no son nombres intercambiables del mismo material. Una compra correcta comienza con la quimica, la funcion, el grado y la especificacion requeridos, no con el menor precio por tonelada."],
        ["Cual es la diferencia central?", "El tripolifosfato de sodio (STPP) es un fosfato condensado con formula Na5P3O10. El hexametafosfato de sodio (SHMP) es un polifosfato vitreo comercial representado comunmente por (NaPO3)n. Su estructura de cadena, comportamiento de hidratacion y desempeno de secuestro son diferentes, por lo que la seleccion debe seguir el requisito del proceso."],
        ["Puntos de calificacion que el comprador debe comparar", "Grado y especificacion aplicable", "Confirme si se requiere grado alimentario, tecnico u otro grado acordado y la norma exacta de referencia. El nombre quimico por si solo no establece idoneidad para contacto alimentario, agua potable u otro uso regulado.", "Limites analiticos criticos", "Compare ensayo o base de fosfato total, pH, insolubles, hierro, metales pesados y otros limites relevantes. En STPP puede importar la composicion de fases o la hidratacion. En SHMP pueden importar las caracteristicas medias de cadena y el comportamiento en solucion.", "Forma fisica y manejo", "Polvo, granulo, densidad aparente y tamano de particula afectan disolucion, polvo y alimentacion. Solicite la SDS vigente y evale condiciones de almacenamiento, proteccion contra humedad y compatibilidad de materiales."],
        ["Que incluir en una RFQ", ["Nombre completo del producto y grado", "Norma y especificacion objetivo", "Forma fisica requerida y rango de tamano de particula", "Cantidad, empaque y requisitos de pallets", "Mercado de destino, puerto y documentos requeridos"]],
        ["La seleccion final debe validarse por los equipos tecnicos, de calidad y regulatorios del comprador en funcion del sistema previsto."],
      ],
      pt: [
        ["STPP e SHMP sao ambos fosfatos sodicos, mas nao sao nomes intercambiaveis para o mesmo material. Uma compra solida comeca pela quimica, funcao, grau e especificacao exigidos, e nao pelo menor preco por tonelada."],
        ["Qual e a diferenca central?", "O tripolifosfato de sodio (STPP) e um fosfato condensado com formula Na5P3O10. O hexametafosfato de sodio (SHMP) e um polifosfato vitreo comercial comumente representado por (NaPO3)n. Estrutura de cadeia, comportamento de hidratacao e desempenho de sequestro diferem, portanto a selecao deve seguir a necessidade do processo."],
        ["Pontos de qualificacao que o comprador deve comparar", "Grau e especificacao aplicavel", "Confirme se o uso exige grau alimenticio, tecnico ou outro grau acordado e a norma exata de referencia. O nome quimico sozinho nao estabelece adequacao para contato com alimento, agua potavel ou outro uso regulado.", "Limites analiticos criticos", "Compare teor ou base de fosfato total, pH, insoluvies, ferro, metais pesados e outros limites relevantes. Para STPP, composicao de fase ou hidratacao podem importar. Para SHMP, caracteristicas medias de cadeia e comportamento em solucao podem ser importantes.", "Forma fisica e manuseio", "Po, granulo, densidade aparente e tamanho de particula afetam dissolucao, poeira e alimentacao. Solicite a SDS atual e avalie armazenamento, protecao contra umidade e compatibilidade de materiais."],
        ["O que incluir em uma RFQ", ["Nome completo do produto e grau", "Norma e especificacao alvo", "Forma fisica exigida e faixa granulometrica", "Quantidade, embalagem e requisitos de pallets", "Mercado de destino, porto e documentos exigidos"]],
        ["A selecao final deve ser validada pelas equipes tecnicas, de qualidade e regulatorias do comprador para o sistema de aplicacao pretendido."],
      ],
      de: [
        ["STPP und SHMP sind beide Natriumphosphate, aber keine austauschbaren Namen fur dasselbe Material. Ein belastbarer Einkauf beginnt mit der erforderlichen Chemie, Funktion, Qualitat und Spezifikation und nicht mit dem niedrigsten Tonnenpreis."],
        ["Was ist der Kerunterschied?", "Natriumtripolyphosphat (STPP) ist ein kondensiertes Phosphat mit der Formel Na5P3O10. Natriumhexametaphosphat (SHMP) ist ein kommerzielles glasiges Polyphosphat, das haufig als (NaPO3)n dargestellt wird. Kettenstruktur, Hydratationsverhalten und Sequestrierungsleistung unterscheiden sich, daher muss die Auswahl dem Prozessbedarf folgen."],
        ["Welche Qualifikationspunkte sollten Einkaufer vergleichen?", "Grad und geltende Spezifikation", "Bestatigen Sie, ob Lebensmittelqualitat, technische Qualitat oder eine andere vereinbarte Qualitat erforderlich ist und welche Referenznorm gilt. Der chemische Name allein belegt keine Eignung fur Lebensmittelkontakt, Trinkwasser oder andere regulierte Anwendungen.", "Kritische analytische Grenzwerte", "Vergleichen Sie Gehalt bzw. Gesamtphosphatbasis, pH, unlosliche Bestandteile, Eisen, Schwermetalle und weitere relevante Grenzwerte. Bei STPP konnen Phasenzusammensetzung oder Hydratation wichtig sein. Bei SHMP konnen mittlere Ketteneigenschaften und Losungsverhalten entscheidend sein.", "Physische Form und Handhabung", "Pulver, Granulat, Schuttdichte und Partikelgrose beeinflussen Losung, Staub und Dosierung. Fordern Sie das aktuelle SDS an und prufen Sie Lagerbedingungen, Feuchteschutz und Materialvertraglichkeit."],
        ["Was in eine RFQ gehort", ["Vollstandiger Produktname und Grad", "Zielnorm und Zielspezifikation", "Erforderliche physische Form und Partikelgrose", "Menge, Verpackung und Palettenanforderungen", "Zielmarkt, Hafen und erforderliche Dokumente"]],
        ["Die Endauswahl sollte von technischen, qualitativen und regulatorischen Teams des Kaufers fur das vorgesehene System validiert werden."],
      ],
      ru: [
        ["STPP i SHMP oba yavlyayutsya natrievymi fosfatami, no eto ne vzaimozamenyaemye nazvaniya odnogo i togo zhe materiala. Korrektnaya zakupka nachinaetsya s trebuemoy khimii, funktsii, marki i spetsifikatsii, a ne s samoy nizkoy tseny za tonnu."],
        ["V chem osnovnoe razlichie?", "Natriy tripolifosfat (STPP) - eto kondensirovannyy fosfat s formuloy Na5P3O10. Natriy geksametafosfat (SHMP) - kommercheskiy steklovidnyy polifosfat, kotoryy obychno oboznachayut kak (NaPO3)n. Tsepochnaya struktura, gidratatsionnoe povedenie i sekvestriruyushchaya sposobnost otlichayutsya, poetomu vybor dolzhen sledovat trebovaniyu protsessa."],
        ["Kakie punkty kvalifikatsii dolzhen sravnit pokupatel?", "Marka i primenyaemaya spetsifikatsiya", "Podtverdite, nuzhna li pishchevaya, tekhnicheskaya ili inaya soglasovannaya marka i kakaya referentnaya norma primenyaetsya. Odno lish khimicheskoe nazvanie ne podtverzhdaet prigodnost dlya kontakta s pishchey, pitievoy vody ili drugogo reguliruemogo primeneniya.", "Kriticheskie analiticheskie predely", "Sravnite soderzhanie ili osnovu po obshchemu fosfatu, pH, nerastvorimoe, zhelezo, tyazhelye metally i drugie relevantnye predely. Dlya STPP mogut byt vazhny fazovyy sostav ili gidratatsiya. Dlya SHMP vazhny srednie tsepochnye kharakteristiki i povedenie v rastvore.", "Fizicheskaya forma i obrashchenie", "Poroshok, granuly, nasypnaya plotnost i razmer chastits vliyayut na rastvorenie, pyleобразovanie i podachu. Zaprosite aktualnyy SDS i otsenite usloviya khraneniya, zashchitu ot vlagi i sovmestimost materialov."],
        ["Chto vklyuchit v RFQ", ["Polnoe nazvanie produkta i marka", "Tselevaya norma i spetsifikatsiya", "Trebuemaya fizicheskaya forma i diapazon razmera chastits", "Kolichestvo, upakovka i trebovaniya k palletam", "Rynok naznacheniya, port i trebuemye dokumenty"]],
        ["Okonchatelnyy vybor dolzhen byt validirovan tekhnicheskimi, kachestvennymi i regulatornymi komandami pokupatelya dlya konkretnoy sistemy primeneniya."],
      ],
      ar: [
        ["كل من STPP وSHMP من فوسفات الصوديوم، لكنهما ليسا اسمين قابلين للتبادل للمادة نفسها. فالشراء السليم يبدأ بالكيمياء والوظيفة والدرجة والمواصفة المطلوبة، لا بأقل سعر للطن."],
        ["ما الفرق الأساسي؟", "يعد ثلاثي بولي فوسفات الصوديوم (STPP) فوسفاتاً مكثفاً بصيغة Na5P3O10. أما هيكساميتافوسفات الصوديوم (SHMP) فهو بوليفوسفات زجاجي تجاري يمثل عادة بالصيغة (NaPO3)n. وتختلف بنية السلسلة وسلوك الإماهة وأداء العزل، لذلك يجب أن يتبع الاختيار احتياج العملية."],
        ["ما نقاط التأهيل التي ينبغي للمشتري مقارنتها؟", "الدرجة والمواصفة المرجعية", "أكد ما إذا كان الاستخدام يتطلب درجة غذائية أو تقنية أو درجة أخرى متفقاً عليها، وما هي المواصفة المرجعية الدقيقة. فالاسم الكيميائي وحده لا يثبت الملاءمة لملامسة الغذاء أو مياه الشرب أو أي استخدام منظم آخر.", "الحدود التحليلية الحرجة", "قارن العيار أو أساس الفوسفات الكلي وpH والمواد غير الذائبة والحديد والمعادن الثقيلة وغيرها من الحدود ذات الصلة. وفي STPP قد يهم تركيب الأطوار أو الإماهة. وفي SHMP قد تهم خصائص السلسلة المتوسطة وسلوك المحلول.", "الشكل الفيزيائي والمناولة", "يؤثر المسحوق أو الحبيبات والكثافة الظاهرية وحجم الجسيمات في الذوبان والغبار والتغذية. اطلب SDS الحالية وقيم ظروف التخزين والحماية من الرطوبة وتوافق المواد."],
        ["ما الذي يجب تضمينه في RFQ", ["الاسم الكامل للمنتج والدرجة", "المعيار والمواصفة المستهدفة", "الشكل الفيزيائي المطلوب ومدى حجم الجسيمات", "الكمية والتعبئة ومتطلبات الطبليات", "سوق الوجهة والميناء والوثائق المطلوبة"]],
        ["يجب أن يعتمد الاختيار النهائي على تحقق الفرق الفنية والجودة والتنظيمية لدى المشتري من ملاءمته للنظام المقصود."],
      ],
    },
  },
  {
    slug: "food-grade-vs-technical-grade-phosphates",
    image: "stpp-food-grade-sodium-tripolyphosphate-china-supplier.jpg",
    date: "2026-03-20",
    title: {
      es: "Fosfatos grado alimentario vs grado tecnico",
      pt: "Fosfatos grau alimenticio vs grau tecnico",
      de: "Lebensmittelqualitat vs technische Qualitat bei Phosphaten",
      ru: "Pishchevoy i tekhnicheskiy klass fosfatov",
      ar: "الفوسفات بدرجة غذائية مقابل الدرجة التقنية",
    },
    headline: {
      es: "Fosfatos grado alimentario vs grado tecnico: lo que el comprador debe verificar",
      pt: "Fosfatos grau alimenticio vs grau tecnico: o que o comprador deve verificar",
      de: "Phosphate in Lebensmittel- vs technischer Qualitat: was Einkaufer prufen mussen",
      ru: "Pishchevoy i tekhnicheskiy klass fosfatov: chto dolzhen proverit pokupatel",
      ar: "الفوسفات بدرجة غذائية مقابل الدرجة التقنية: ما الذي يجب على المشتري التحقق منه",
    },
    description: {
      es: "Compare fosfatos grado alimentario y grado tecnico por especificacion, limites de impurezas, documentacion, uso previsto y calificacion del proveedor.",
      pt: "Compare fosfatos grau alimenticio e grau tecnico por especificacao, limites de impurezas, documentacao, uso pretendido e qualificacao do fornecedor.",
      de: "Vergleichen Sie Phosphate in Lebensmittel- und technischer Qualitat nach Spezifikation, Verunreinigungsgrenzen, Dokumentation, Verwendungszweck und Lieferantenqualifizierung.",
      ru: "Sravnite fosfaty pishchevogo i tekhnicheskogo klassa po spetsifikatsii, limitam primesey, dokumentam, namerennomu primeneniyu i kvalifikatsii postavshchika.",
      ar: "قارن بين الفوسفات بدرجة غذائية والدرجة التقنية من حيث المواصفة وحدود الشوائب والوثائق والاستخدام المقصود وتأهيل المورد.",
    },
    sections: {
      es: [
        ["Los fosfatos grado alimentario y grado tecnico pueden compartir un mismo nombre quimico, pero no son automaticamente intercambiables. El comprador debe calificar el grado exacto, la especificacion, la fuente, la documentacion y la idoneidad legal para el mercado objetivo."],
        ["Que significa grado alimentario?", "Indica que el material ofrecido se fabrica, controla y documenta segun una especificacion de uso alimentario o un marco regulatorio aplicable a ese producto y fuente. No significa que todo lote, toda planta o todo fosfato con el mismo nombre este aprobado para cualquier aplicacion alimentaria o destino."],
        ["Como difiere el grado tecnico", "Los fosfatos grado tecnico se suministran para usos industriales bajo especificaciones comerciales que pueden priorizar otras caracteristicas de desempeno y limites de impurezas. Pueden ser adecuados para detergentes, ceramica, tratamiento de agua u otros sistemas industriales, pero esa designacion no establece idoneidad para procesado de alimentos."],
        ["Cinco puntos que el comprador debe comparar", "Norma de referencia", "Confirme si el producto se analiza contra FCC, una norma nacional acordada, una especificacion del cliente o una especificacion tecnica. Registre la revision o los limites acordados en el contrato.", "Limites de impurezas y contaminantes", "Revise metales pesados, fluoruro, arsenico, materia insoluble y otros limites especificos de la quimica. Las especificaciones alimentarias suelen controlar parametros que quizas no sean criticos en una especificacion industrial.", "Controles de fabricacion y manejo", "Pregunte que controles de produccion, empaque y almacen se aplican al grado exacto. Evalue trazabilidad, segregacion, control de materiales extranos y notificacion de cambios.", "Documentos y certificados", "Haga coincidir especificacion, SDS, formato de COA y certificados aplicables con la entidad legal, la planta y el producto aprobados. Un certificado corporativo o un logotipo comercial no debe asumirse como cobertura de todo material.", "Idoneidad para el mercado de destino", "Los usos permitidos, niveles maximos y reglas de etiquetado difieren por pais y categoria de alimento. El importador y el fabricante deben confirmar los requisitos locales con personal regulatorio calificado."],
        ["Lista RFQ", ["Nombre completo del fosfato, grado y numero CAS", "Norma alimentaria o tecnica requerida", "Limites criticos de ensayo, impurezas y propiedades fisicas", "Categoria de uso prevista y pais de destino", "Documentos y certificados requeridos", "Cantidad, empaque y ventana de envio"]],
      ],
      pt: [
        ["Fosfatos grau alimenticio e grau tecnico podem compartilhar o mesmo nome quimico, mas nao sao automaticamente intercambiaveis. O comprador deve qualificar o grau exato, a especificacao, a fonte, a documentacao e a adequacao legal ao mercado de destino."],
        ["O que significa grau alimenticio?", "Significa que o material ofertado e fabricado, controlado e documentado segundo uma especificacao para uso alimentar ou um marco regulatorio aplicavel ao produto e a fonte. Nao significa que todo lote, toda fabrica ou todo fosfato com o mesmo nome esteja aprovado para qualquer aplicacao alimentar ou destino."],
        ["Como o grau tecnico difere", "Fosfatos de grau tecnico sao fornecidos para usos industriais sob especificacoes comerciais que podem priorizar outras caracteristicas de desempenho e limites de impureza. Podem ser adequados para detergentes, ceramica, tratamento de agua ou outros sistemas industriais, mas essa designacao nao estabelece adequacao para processamento de alimentos."],
        ["Cinco pontos que o comprador deve comparar", "Norma de referencia", "Confirme se o produto e testado contra FCC, uma norma nacional acordada, uma especificacao do cliente ou uma especificacao tecnica. Registre revisao ou limites acordados no contrato.", "Limites de impurezas e contaminantes", "Revise metais pesados, fluoreto, arsenio, insoluvies e outros limites especificos da quimica. Especificacoes alimenticias costumam controlar parametros que podem nao ser criticos em uma especificacao industrial.", "Controles de fabricacao e manuseio", "Pergunte quais controles de producao, embalagem e armazenagem se aplicam ao grau exato. Avalie rastreabilidade, segregacao, controle de material estranho e notificacao de mudancas.", "Documentos e certificados", "Associe especificacao, SDS, formato de COA e certificados aplicaveis a entidade legal, planta e produto aprovados. Certificado corporativo ou logotipo de marketing nao deve ser assumido como cobertura de todo material.", "Adequacao ao mercado de destino", "Usos permitidos, limites maximos e regras de rotulagem diferem por pais e categoria de alimento. Importador e fabricante devem confirmar requisitos locais com profissionais regulatorios qualificados."],
        ["Checklist de RFQ", ["Nome completo do fosfato, grau e numero CAS", "Norma alimenticia ou tecnica exigida", "Limites criticos de teor, impurezas e propriedades fisicas", "Categoria de uso pretendida e pais de destino", "Documentos e certificados exigidos", "Quantidade, embalagem e janela de embarque"]],
      ],
      de: [
        ["Phosphate in Lebensmittel- und technischer Qualitat konnen denselben chemischen Namen tragen, sind aber nicht automatisch austauschbar. Der Einkaufer muss den genauen Grad, die Spezifikation, die Quelle, die Dokumentation und die rechtliche Eignung fur den Zielmarkt qualifizieren."],
        ["Was bedeutet Lebensmittelqualitat?", "Sie bedeutet, dass das angebotene Material nach einer fur dieses Produkt und diese Quelle geltenden Lebensmittelspezifikation oder regulatorischen Vorgabe hergestellt, kontrolliert und dokumentiert wird. Das heisst nicht, dass jede Charge, jedes Werk oder jedes Phosphat mit demselben Namen fur jede Lebensmittelanwendung oder jeden Zielmarkt zugelassen ist."],
        ["Wie sich technische Qualitat unterscheidet", "Phosphate in technischer Qualitat werden fur industrielle Anwendungen unter Handelsspezifikationen geliefert, die andere Leistungsmerkmale und Verunreinigungsgrenzen priorisieren konnen. Sie konnen fur Detergenzien, Keramik, Wasserbehandlung oder andere Industriesysteme geeignet sein, doch diese Bezeichnung belegt keine Eignung fur die Lebensmittelverarbeitung."],
        ["Funf Punkte, die Einkaufer vergleichen sollten", "Referenznorm", "Bestatigen Sie, ob das Produkt gegen FCC, eine vereinbarte nationale Norm, eine Kundenspezifikation oder eine technische Spezifikation gepruft wird. Halten Sie Revision oder vereinbarte Grenzwerte im Vertrag fest.", "Verunreinigungs- und Kontaminantengrenzen", "Prufen Sie Schwermetalle, Fluorid, Arsen, unlosliche Bestandteile und weitere chemiespezifische Grenzen. Lebensmittelspezifikationen kontrollieren haufig Parameter, die in einer Industriespezifikation weniger kritisch sein konnen.", "Fertigungs- und Handhabungskontrollen", "Fragen Sie, welche Produktions-, Verpackungs- und Lagerkontrollen fur den genauen Grad gelten. Bewerten Sie Ruckverfolgbarkeit, Segregation, Fremdmaterialkontrolle und Anderungsmitteilungen.", "Dokumente und Zertifikate", "Ordnen Sie Spezifikation, SDS, COA-Format und anwendbare Zertifikate der freigegebenen juristischen Einheit, dem Standort und dem Produkt zu. Ein Unternehmenszertifikat oder Marketinglogo darf nicht als Nachweis fur jedes Material gelten.", "Eignung fur den Zielmarkt", "Zulassige Verwendungen, Hochstwerte und Kennzeichnungsvorschriften unterscheiden sich nach Land und Lebensmittelkategorie. Importeur und Hersteller sollten lokale Anforderungen mit qualifiziertem regulatorischem Personal bestatigen."],
        ["RFQ-Checkliste", ["Vollstandiger Phosphatname, Grad und CAS-Nummer", "Erforderliche Lebensmittel- oder technische Norm", "Kritische Grenzwerte fur Gehalt, Verunreinigungen und physische Eigenschaften", "Vorgesehene Anwendungskategorie und Bestimmungsland", "Erforderliche Dokumente und Zertifikate", "Menge, Verpackung und Versandfenster"]],
      ],
      ru: [
        ["Fosfaty pishchevogo i tekhnicheskogo klassa mogut imet odno i to zhe khimicheskoe nazvanie, no oni ne yavlyayutsya avtomaticheski vzaimozamenyaemymi. Pokupatel dolzhen kvalifitsirovat tochnyy klass, spetsifikatsiyu, istochnik, dokumenty i yuridicheskuyu prigodnost dlya tselevogo rynka."],
        ["Chto oznachaet pishchevoy klass?", "Eto oznachaet, chto predlagaemyy material proizvoditsya, kontroliruetsya i dokumentiruetsya po pishchevoy spetsifikatsii ili regulatornoy baze, primenimoy k konkretnomu produktu i istochniku. Eto ne oznachaet, chto kazhdaya partiya, kazhdaya ploshchadka ili kazhdyy fosfat s tem zhe nazvaniem odobren dlya lyuboy pishchevoy zadachi ili rynka."],
        ["Chem otlichaetsya tekhnicheskiy klass", "Fosfaty tekhnicheskogo klassa postavlyayutsya dlya promyshlennykh primeneniy po kommercheskim spetsifikatsiyam, gde mogut prioritizirovatsya inye ekspluatatsionnye kharakteristiki i limity primesey. Oni mogut podkhodit dlya detergentov, keramiki, obrabotki vody i drugih promyshlennykh sistem, no samo nazvanie ne dokazyvaet prigodnost dlya pishchevogo proizvodstva."],
        ["Pyat punktov, kotorye dolzhen sravnit pokupatel", "Referentnyy standart", "Podtverdite, proveryaetsya li produkt po FCC, soglasovannomu natsionalnomu standartu, spetsifikatsii klienta ili tekhnicheskoy spetsifikatsii. Zakrepite reviziyu ili soglasovannye predely v kontrakte.", "Predely primesey i kontaminantov", "Proverte tyazhelye metally, flyuorid, myshyak, nerastvorimoe i drugie khimicheskie limity. Pishchevye spetsifikatsii chasto kontroliruyut parametry, kotorye mogut ne byt kritichnymi dlya promyshlennogo standarta.", "Kontroli proizvodstva i obrashcheniya", "Sprosite, kakie proizvodstvennye, upakovochnye i skladskie kontroli primenyayutsya k tochnomu klassu. Otsenite proslezhivaemost, segregatsiyu, kontrol postoronnikh materialov i uvedomleniya ob izmeneniyakh.", "Dokumenty i sertifikaty", "Sopostavte spetsifikatsiyu, SDS, format COA i primenimye sertifikaty s odobrennoy yuridicheskoy edinitsей, ploshchadkoy i produktom. Korporativnyy sertifikat ili marketingovyy logotip ne dolzhny schitatsya dokazatelstvom po kazhdomu materialu.", "Prigodnost dlya rynka naznacheniya", "Dopustimye primeneniya, maksimalnye urovni i pravila markirovki otlichayutsya po stranam i kategoriyam pishchi. Importer i proizvoditel dolzhny podtverdit mestnye trebovaniya s kvalifitsirovannymi regulatornymi spetsialistami."],
        ["RFQ checklist", ["Polnoe nazvanie fosfata, klass i CAS-nomer", "Trebuemyy pishchevoy ili tekhnicheskiy standart", "Kriticheskie predely po analizam, primesyam i fizicheskim svoystvam", "Predpolagaemaya kategoriya primeneniya i strana naznacheniya", "Trebuemye dokumenty i sertifikaty", "Kolichestvo, upakovka i okno otgruzki"]],
      ],
      ar: [
        ["قد تشترك الفوسفات بدرجة غذائية والفوسفات بالدرجة التقنية في الاسم الكيميائي نفسه، لكنها ليست قابلة للاستبدال تلقائياً. وعلى المشتري تأهيل الدرجة الدقيقة والمواصفة والمصدر والوثائق والملاءمة القانونية لسوق الوجهة."],
        ["ماذا تعني الدرجة الغذائية؟", "تعني أن المادة المعروضة يتم تصنيعها وضبطها وتوثيقها وفق مواصفة استخدام غذائي أو إطار تنظيمي ينطبق على ذلك المنتج وذلك المصدر. ولا يعني ذلك أن كل دفعة أو كل مصنع أو كل فوسفات يحمل الاسم نفسه معتمد لكل تطبيق غذائي أو لكل سوق."],
        ["كيف تختلف الدرجة التقنية", "يتم توريد الفوسفات بالدرجة التقنية للاستخدامات الصناعية وفق مواصفات تجارية قد تعطي أولوية لخصائص أداء مختلفة وحدود شوائب مختلفة. وقد تكون مناسبة للمنظفات أو السيراميك أو معالجة المياه أو أنظمة صناعية أخرى، لكن هذه التسمية لا تثبت الملاءمة لمعالجة الأغذية."],
        ["خمس نقاط ينبغي للمشتري مقارنتها", "المعيار المرجعي", "أكد ما إذا كان المنتج يختبر وفق FCC أو معيار وطني متفق عليه أو مواصفة عميل أو مواصفة تقنية. وسجل الإصدار أو الحدود المتفق عليها في عقد الشراء.", "حدود الشوائب والملوثات", "راجع المعادن الثقيلة والفلوريد والزرنيخ والمواد غير الذائبة وغيرها من الحدود الخاصة بهذه الكيمياء. فالمواصفات الغذائية تضبط غالباً معايير قد لا تكون حرجة في المواصفات الصناعية.", "ضوابط التصنيع والمناولة", "اسأل عن ضوابط الإنتاج والتعبئة والمخزن المطبقة على الدرجة الدقيقة. وقيم إمكانية التتبع والعزل وضبط المواد الغريبة وإشعارات التغيير.", "الوثائق والشهادات", "طابق المواصفة وSDS وصيغة COA والشهادات السارية مع الكيان القانوني والموقع والمنتج المعتمدين. ولا ينبغي افتراض أن شهادة على مستوى الشركة أو شعاراً تسويقياً يغطي كل مادة.", "الملاءمة لسوق الوجهة", "تختلف الاستخدامات المسموح بها والحدود القصوى ومتطلبات الوسم بحسب البلد وفئة الغذاء. ويجب على المستورد والمصنع تأكيد المتطلبات المحلية مع مختصين تنظيميـين مؤهلين."],
        ["قائمة RFQ", ["الاسم الكامل للفوسفات والدرجة ورقم CAS", "المعيار الغذائي أو التقني المطلوب", "الحدود الحرجة للعيار والشوائب والخصائص الفيزيائية", "فئة الاستخدام المقصودة وبلد الوجهة", "الوثائق والشهادات المطلوبة", "الكمية والتعبئة ونافذة الشحن"]],
      ],
    },
  },
];

function languageLinks(locale, slug) {
  return [
    `<link rel="alternate" hreflang="en" href="https://www.bespringchem.com/news/${slug}.html">`,
    `<link rel="alternate" hreflang="zh-CN" href="https://www.bespringchem.com/zh-cn/news/${slug}.html">`,
    `<link rel="alternate" hreflang="zh-TW" href="https://www.bespringchem.com/zh-tw/news/${slug}.html">`,
    `<link rel="alternate" hreflang="es" href="https://www.bespringchem.com/es/news/${slug}.html">`,
    `<link rel="alternate" hreflang="pt" href="https://www.bespringchem.com/pt/news/${slug}.html">`,
    `<link rel="alternate" hreflang="ru" href="https://www.bespringchem.com/ru/news/${slug}.html">`,
    `<link rel="alternate" hreflang="de" href="https://www.bespringchem.com/de/news/${slug}.html">`,
    `<link rel="alternate" hreflang="ar" href="https://www.bespringchem.com/ar/news/${slug}.html">`,
    `<link rel="alternate" hreflang="x-default" href="https://www.bespringchem.com/news/${slug}.html">`,
  ].join("");
}

function renderSections(sections, note, noteLabel) {
  const [lead, ...rest] = sections;
  let html = `<p class="lead">${lead[0]}</p>`;
  for (const section of rest) {
    const [heading, ...items] = section;
    html += `<h2>${heading}</h2>`;
    if (Array.isArray(items[0])) {
      html += `<ul>${items[0].map((item) => `<li>${item}</li>`).join("")}</ul>`;
      if (items[1]) html += `<p>${items[1]}</p>`;
      continue;
    }
    for (let i = 0; i < items.length; i++) {
      if (i % 2 === 0 && items[i + 1]) {
        html += `<h3>${items[i]}</h3><p>${items[i + 1]}</p>`;
        i += 1;
      } else {
        html += `<p>${items[i]}</p>`;
      }
    }
  }
  html += `<p class="ep-note"><strong>${noteLabel}</strong> ${note}</p>`;
  return html;
}

function buildPage(locale, page) {
  const t = localeMeta[locale];
  const url = `https://www.bespringchem.com/${locale}/news/${page.slug}.html`;
  const imageUrl = `https://www.bespringchem.com/images/${page.image}`;
  const title = `${page.title[locale]} | Bespring Chemical`;
  const headline = page.headline[locale];
  const description = page.description[locale];
  const articleBody = renderSections(page.sections[locale], t.noteText, t.noteLabel);
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished: page.date,
    dateModified: page.date,
    mainEntityOfPage: url,
    image: imageUrl,
    inLanguage: t.lang,
    author: { "@type": "Organization", name: "Bespring Chemical Co., Ltd.", url: "https://www.bespringchem.com" },
    publisher: { "@type": "Organization", name: "Bespring Chemical Co., Ltd.", url: "https://www.bespringchem.com", logo: "https://www.bespringchem.com/images/logo.png" },
  });

  return `<!doctype html><html lang="${t.lang}"${t.dir}><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><meta name="author" content="Bespring Chemical Co., Ltd."><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${url}">${languageLinks(locale, page.slug)}<meta property="og:type" content="article"><meta property="og:site_name" content="Bespring Chemical"><meta property="og:locale" content="${t.ogLocale}"><meta property="og:title" content="${headline}"><meta property="og:description" content="${description}"><meta property="og:url" content="${url}"><meta property="og:image" content="${imageUrl}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${headline}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${imageUrl}"><link rel="icon" href="../../images/favicon.ico"><link rel="stylesheet" href="../../css/style.css"><link rel="stylesheet" href="../../css/site-pages.css"><link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"><script type="application/ld+json">${jsonLd}</script></head><body class="editorial-page"><div class="bs-seo-topbar"><div class="container bs-seo-topbar-container"><div class="bs-seo-topbar-left"><span class="bs-seo-highlight"><i class="fas fa-industry" aria-hidden="true"></i> ${t.topbar}</span><span class="bs-seo-divider">|</span><span><i class="fas fa-globe" aria-hidden="true"></i> ${t.export}</span></div><div class="bs-seo-topbar-right"><a href="mailto:info@bespringchem.com" class="bs-seo-contact"><i class="fas fa-envelope" aria-hidden="true"></i> info@bespringchem.com</a><a href="tel:+8613914896109" class="bs-seo-contact"><i class="fas fa-phone" aria-hidden="true"></i> +86 139 1489 6109</a></div></div></div><header class="site-header"><div class="container nav-container"><div class="logo"><a href="../index.html"><img src="../../images/logo.png" alt="Bespring Chemical"></a></div><nav class="main-nav" aria-label="${t.navLabel}"><ul><li><a href="../index.html">${t.home}</a></li><li><a href="../about/company-profile.html">${t.about}</a></li><li><a href="../products.html">${t.products}</a></li><li><a href="../services.html">${t.services}</a></li><li><a href="../news.html" aria-current="page">${t.news}</a></li><li><a href="../contact.html" class="btn-nav">${t.contact}</a></li></ul></nav><button class="hamburger" aria-label="${t.navLabel}" aria-expanded="false"><i class="fas fa-bars" aria-hidden="true"></i></button></div></header><main><article><header class="ep-hero" style="--ep-image:url('../../images/${page.image}')"><div class="container"><nav class="ep-breadcrumb" aria-label="${t.breadcrumb}"><ol><li><a href="../index.html">${t.home}</a></li><li><a href="../news.html">${t.newsInsights}</a></li><li aria-current="page">${t.articleType}</li></ol></nav><p class="ep-eyebrow">${t.eyebrow}</p><h1>${headline}</h1><p class="ep-hero__lead">${description}</p><div class="article-meta"><time datetime="${page.date}">${page.date}</time><span>${t.reviewed}</span></div></div></header><div class="container article-layout"><div class="article-body">${articleBody}</div><aside class="article-sidebar"><h2>${t.sidebarTitle}</h2><p>${t.sidebarText}</p><a href="../contact.html">${t.ctaContact} &rarr;</a><a href="../products.html">${t.ctaProducts} &rarr;</a></aside></div></article></main><footer class="crc-footer"><div class="container footer-grid"><div class="footer-col"><h3>Bespring Chemical</h3><p>${t.footerDesc}</p></div><div class="footer-col footer-links"><h3>${t.quickLinks}</h3><ul><li><a href="../about/company-profile.html">${t.about}</a></li><li><a href="../products.html">${t.products}</a></li><li><a href="../services.html">${t.services}</a></li><li><a href="../news.html">${t.news}</a></li></ul></div><div class="footer-col"><h3>${t.contactUs}</h3><p><a href="tel:+8613914896109">+86 139 1489 6109</a></p><p><a href="mailto:info@bespringchem.com">info@bespringchem.com</a></p><a href="../contact.html" class="contact-btn-footer">${t.footerCta}</a></div></div><div class="footer-bottom">&copy; 2026 Bespring Chemical Co., Ltd. All rights reserved.</div></footer><script>const hamburger=document.querySelector(".hamburger");const navigation=document.querySelector(".main-nav");hamburger?.addEventListener("click",()=>{const open=navigation.classList.toggle("active");hamburger.setAttribute("aria-expanded",String(open));hamburger.setAttribute("aria-label",open?"Close navigation menu":"Open navigation menu")});</script></body></html>`;
}

for (const locale of locales) {
  for (const page of guides) {
    const file = path.join(root, locale, "news", `${page.slug}.html`);
    await fs.writeFile(file, buildPage(locale, page), "utf8");
  }
}

console.log(`Rebuilt ${guides.length * locales.length} localized guide pages.`);

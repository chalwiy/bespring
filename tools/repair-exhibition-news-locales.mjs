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
    exhibition: "Exposicion",
    exhibitionArchive: "Archivo de exposiciones",
    published: "Publicado",
    boothLabel: "Stand",
    leadIntro:
      "Bespring Chemical participo en esta feria internacional para reunirse con distribuidores de ingredientes, fabricantes y equipos de compras, y para conversar sobre especificaciones de producto, documentacion y requisitos de suministro para exportacion.",
    eventInfo: "Informacion del evento",
    eventDates: "Fechas del evento:",
    dateRangeJoiner: "a",
    location: "Ubicacion:",
    booth: "Stand de Bespring:",
    focus: "Enfoque del portafolio:",
    conversations: "Conversaciones con compradores internacionales",
    conversationsBody:
      "La exposicion ofrecio la oportunidad de conversar sobre seleccion de grado, especificaciones objetivo, embalaje, documentacion para el mercado de destino y planificacion de envios. Estos detalles son esenciales porque el nombre quimico por si solo no define un producto comercialmente adecuado.",
    followup: "Continuar la conversacion",
    followupBody:
      "Los compradores que hablaron con nuestro equipo, o que ahora estan evaluando un material relacionado, pueden enviar el nombre completo del producto, grado, especificacion, documentos requeridos, cantidad, embalaje y destino. Nuestro equipo de exportacion revisara la consulta segun el alcance actual de suministro.",
    archive: "Nota de archivo:",
    archiveBody:
      "Este evento ya concluyo. Las fechas y la informacion del stand se conservan como registro factual de la participacion de Bespring Chemical en la exposicion.",
    sidebarTitle: "Solicitar informacion del producto",
    sidebarBody:
      "Envie el producto, grado, especificacion objetivo, cantidad, embalaje y destino.",
    ctaContact: "Contactar ventas de exportacion",
    ctaProducts: "Explorar portafolios de productos",
    ctaBack: "Volver a noticias",
    footerDesc:
      "Proveedor chino de materias primas quimicas para alimentos, piensos e industria para compras B2B globales.",
    quickLinks: "Enlaces rapidos",
    contactUs: "Contacto",
    footerCta: "Contactenos",
    articleType: "Exposicion",
    articleTypeLabel: "Archivo de exposiciones",
    localeName: "ES",
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
    exhibition: "Exposicao",
    exhibitionArchive: "Arquivo de exposicoes",
    published: "Publicado em",
    boothLabel: "Estande",
    leadIntro:
      "A Bespring Chemical participou desta feira internacional para se reunir com distribuidores de ingredientes, fabricantes e equipes de compras, e para discutir especificacoes de produto, documentacao e requisitos de fornecimento para exportacao.",
    eventInfo: "Informacoes do evento",
    eventDates: "Datas do evento:",
    dateRangeJoiner: "a",
    location: "Local:",
    booth: "Estande da Bespring:",
    focus: "Foco do portifolio:",
    conversations: "Conversas com compradores internacionais",
    conversationsBody:
      "A exposicao ofereceu a oportunidade de discutir selecao de grau, especificacoes desejadas, embalagem, documentacao para o mercado de destino e planejamento de embarque. Esses detalhes sao essenciais porque o nome quimico sozinho nao define um produto comercialmente adequado.",
    followup: "Continuar a conversa",
    followupBody:
      "Compradores que conversaram com nossa equipe, ou que agora estao avaliando um material relacionado, podem enviar o nome completo do produto, grau, especificacao, documentos exigidos, quantidade, embalagem e destino. Nossa equipe de exportacao avaliara a solicitacao de acordo com o escopo atual de fornecimento.",
    archive: "Nota de arquivo:",
    archiveBody:
      "Este evento ja foi concluido. As datas e as informacoes do estande sao mantidas como registro factual da participacao da Bespring Chemical na exposicao.",
    sidebarTitle: "Solicitar informacoes do produto",
    sidebarBody:
      "Envie o produto, grau, especificacao desejada, quantidade, embalagem e destino.",
    ctaContact: "Falar com vendas de exportacao",
    ctaProducts: "Explorar portfolios de produtos",
    ctaBack: "Voltar para noticias",
    footerDesc:
      "Fornecedor chines de materias-primas quimicas para alimentos, nutricao animal e industria no mercado B2B global.",
    quickLinks: "Links rapidos",
    contactUs: "Contato",
    footerCta: "Fale conosco",
    articleType: "Exposicao",
    articleTypeLabel: "Arquivo de exposicoes",
    localeName: "PT",
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
    exhibition: "Messe",
    exhibitionArchive: "Messearchiv",
    published: "Veroffentlicht am",
    boothLabel: "Stand",
    leadIntro:
      "Bespring Chemical nahm an dieser internationalen Messe teil, um mit Zutatenhandlern, Herstellern und Einkaufsteams ins Gesprach zu kommen und uber Produktspezifikationen, Dokumentation und Exportversorgung zu sprechen.",
    eventInfo: "Veranstaltungsinformationen",
    eventDates: "Veranstaltungsdaten:",
    dateRangeJoiner: "bis",
    location: "Ort:",
    booth: "Bespring-Stand:",
    focus: "Portfolio-Schwerpunkt:",
    conversations: "Gesprache mit internationalen Einkaufern",
    conversationsBody:
      "Die Messe bot die Moglichkeit, uber Grade-Auswahl, Zielspezifikationen, Verpackung, Dokumentation fur den Zielmarkt und Versandplanung zu sprechen. Diese Details sind wichtig, weil der chemische Name allein kein kommerziell geeignetes Produkt definiert.",
    followup: "Gesprach fortsetzen",
    followupBody:
      "Kaufer, die unser Team getroffen haben oder jetzt ein verwandtes Material prufen, konnen den vollstandigen Produktnamen, Grad, Spezifikation, erforderliche Dokumente, Menge, Verpackung und Zielort senden. Unser Exportteam pruft die Anfrage anhand des aktuellen Lieferumfangs.",
    archive: "Archivhinweis:",
    archiveBody:
      "Diese Veranstaltung ist abgeschlossen. Termine und Standinformationen bleiben als sachliche Dokumentation der Messeteilnahme von Bespring Chemical erhalten.",
    sidebarTitle: "Produktinformationen anfragen",
    sidebarBody:
      "Senden Sie Produkt, Grad, Zielspezifikation, Menge, Verpackung und Bestimmungsort.",
    ctaContact: "Exportvertrieb kontaktieren",
    ctaProducts: "Produktportfolios ansehen",
    ctaBack: "Zuruck zu den News",
    footerDesc:
      "Chinesischer Lieferant von chemischen Rohstoffen fur Lebensmittel, Futtermittel und Industrie fur den globalen B2B-Einkauf.",
    quickLinks: "Schnellzugriffe",
    contactUs: "Kontakt",
    footerCta: "Kontakt aufnehmen",
    articleType: "Messe",
    articleTypeLabel: "Messearchiv",
    localeName: "DE",
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
    exhibition: "Vystavka",
    exhibitionArchive: "Arkhiv vystavok",
    published: "Opublikovano",
    boothLabel: "Stend",
    leadIntro:
      "Bespring Chemical uchastvovala v etoy mezhdunarodnoy vystavke, chtoby vstrechatsya s distributsorami ingredientov, proizvoditelyami i zakupshchikami, a takzhe obsudit spetsifikatsii produkta, dokumenty i trebovaniya k eksportnym postavkam.",
    eventInfo: "Informatsiya o meropriyatii",
    eventDates: "Daty meropriyatiya:",
    dateRangeJoiner: "po",
    location: "Mesto:",
    booth: "Stend Bespring:",
    focus: "Fokus portfelya:",
    conversations: "Peregovory s mezhdunarodnymi pokupatelyami",
    conversationsBody:
      "Vystavka dala vozmozhnost obsudit vybor marki, tselevye spetsifikatsii, upakovku, dokumenty dlya strany naznacheniya i planirovanie otgruzki. Eti detali vazhny, potomu chto odno lish khimicheskoe nazvanie ne opredelyaet kommercheski podkhodyashchiy produkt.",
    followup: "Prodolzhit obsuzhdenie",
    followupBody:
      "Pokupateli, kotorye obshchalis s nashey komandoy ili seychas rassmatrivayut analogichnyy material, mogut otpravit polnoe nazvanie produkta, marku, spetsifikatsiyu, trebuemye dokumenty, kolichestvo, upakovku i punkt naznacheniya. Nasha eksportnaya komanda proverit zapros v sootvetstvii s tekushchim assortimentom postavok.",
    archive: "Primechanie arkhiva:",
    archiveBody:
      "Eto meropriyatie uzhe zaversheno. Daty i informatsiya o stende sokhranyayutsya kak fakticheskaya zapis ob uchastii Bespring Chemical v vystavke.",
    sidebarTitle: "Zaprosit informatsiyu o produkte",
    sidebarBody:
      "Ukazhite produkt, marku, tselevuyu spetsifikatsiyu, kolichestvo, upakovku i punkt naznacheniya.",
    ctaContact: "Svyazatsya s eksportnymi prodazhami",
    ctaProducts: "Otkryt portfeli produktov",
    ctaBack: "Nazad k novostyam",
    footerDesc:
      "Kitayskiy postavshchik khimicheskogo syrya dlya pishchevoy, kormovoy i promyshlennoy otrasli dlya globalnykh B2B-zakupok.",
    quickLinks: "Bystrye ssylki",
    contactUs: "Kontakt",
    footerCta: "Svjazatsya s nami",
    articleType: "Vystavka",
    articleTypeLabel: "Arkhiv vystavok",
    localeName: "RU",
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
    exhibition: "معرض",
    exhibitionArchive: "أرشيف المعارض",
    published: "نشر في",
    boothLabel: "الجناح",
    leadIntro:
      "شاركت Bespring Chemical في هذا المعرض الدولي للقاء موزعي المكونات والمصنعين وفرق المشتريات، ولمناقشة مواصفات المنتجات والوثائق ومتطلبات التوريد للتصدير.",
    eventInfo: "معلومات الحدث",
    eventDates: "تواريخ الحدث:",
    dateRangeJoiner: "إلى",
    location: "الموقع:",
    booth: "جناح Bespring:",
    focus: "تركيز المحفظة:",
    conversations: "محادثات مع المشترين الدوليين",
    conversationsBody:
      "أتاح المعرض فرصة لمناقشة اختيار الدرجة والمواصفات المستهدفة والتعبئة ووثائق سوق الوجهة وتخطيط الشحن. هذه التفاصيل ضرورية لأن الاسم الكيميائي وحده لا يحدد منتجاً مناسباً تجارياً.",
    followup: "مواصلة النقاش",
    followupBody:
      "يمكن للمشترين الذين التقوا بفريقنا، أو الذين يقيمون الآن مادة ذات صلة، إرسال الاسم الكامل للمنتج والدرجة والمواصفة والوثائق المطلوبة والكمية والتعبئة والوجهة. وسيقوم فريق التصدير لدينا بمراجعة الطلب وفق نطاق التوريد الحالي.",
    archive: "ملاحظة أرشيفية:",
    archiveBody:
      "انتهى هذا الحدث. ويتم الاحتفاظ بالتواريخ ومعلومات الجناح كسجل واقعي لمشاركة Bespring Chemical في المعرض.",
    sidebarTitle: "طلب معلومات المنتج",
    sidebarBody:
      "أرسل اسم المنتج والدرجة والمواصفة المستهدفة والكمية والتعبئة والوجهة.",
    ctaContact: "التواصل مع مبيعات التصدير",
    ctaProducts: "استعراض مجموعات المنتجات",
    ctaBack: "العودة إلى الأخبار",
    footerDesc:
      "مورد صيني للمواد الخام الكيميائية الغذائية والعلفية والصناعية لعمليات الشراء العالمية بين الشركات.",
    quickLinks: "روابط سريعة",
    contactUs: "اتصل بنا",
    footerCta: "تواصل معنا",
    articleType: "معرض",
    articleTypeLabel: "أرشيف المعارض",
    localeName: "AR",
  },
};

const exhibitions = [
  {
    slug: "fi-europe-frankfurt-2023",
    image: "fieurope2023.jpg",
    title: {
      es: "Fi Europe 2023 en Frankfurt",
      pt: "Fi Europe 2023 em Frankfurt",
      de: "Fi Europe 2023 in Frankfurt",
      ru: "Fi Europe 2023 vo Frankfurte",
      ar: "Fi Europe 2023 في فرانكفورت",
    },
    headline: {
      es: "Fi Europe 2023 - Frankfurt, Alemania",
      pt: "Fi Europe 2023 - Frankfurt, Alemanha",
      de: "Fi Europe 2023 - Frankfurt, Deutschland",
      ru: "Fi Europe 2023 - Frankfurt, Germaniya",
      ar: "Fi Europe 2023 - فرانكفورت، ألمانيا",
    },
    description: {
      es: "Bespring Chemical participo en Fi Europe 2023 en Frankfurt del 28 al 30 de noviembre en el stand 3.1A33. Lugar del evento, informacion del stand y enfoque del portafolio.",
      pt: "A Bespring Chemical participou da Fi Europe 2023 em Frankfurt de 28 a 30 de novembro no estande 3.1A33. Local do evento, informacoes do estande e foco do portifolio.",
      de: "Bespring Chemical nahm vom 28. bis 30. November an der Fi Europe 2023 in Frankfurt am Stand 3.1A33 teil. Veranstaltungsort, Standinformationen und Portfolio-Schwerpunkt.",
      ru: "Bespring Chemical uchastvovala v Fi Europe 2023 vo Frankfurte s 28 po 30 noyabrya na stende 3.1A33. Mesto provedeniya, dannye o stende i fokus portfelya.",
      ar: "شاركت Bespring Chemical في Fi Europe 2023 في فرانكفورت من 28 إلى 30 نوفمبر في الجناح 3.1A33. موقع الحدث ومعلومات الجناح وتركيز المحفظة.",
    },
    datePublished: "2023-10-01",
    startDate: "2023-11-28",
    endDate: "2023-11-30",
    location: {
      es: "Messe Frankfurt, Frankfurt, Alemania",
      pt: "Messe Frankfurt, Frankfurt, Alemanha",
      de: "Messe Frankfurt, Frankfurt, Deutschland",
      ru: "Messe Frankfurt, Frankfurt, Germaniya",
      ar: "ميسي فرانكفورت، فرانكفورت، ألمانيا",
    },
    locationEn: "Messe Frankfurt, Frankfurt, Germany",
    booth: "3.1A33",
    focus: {
      es: "Fosfatos alimentarios, conservantes, acidulantes e ingredientes alimentarios funcionales",
      pt: "Fosfatos alimenticios, conservantes, acidulantes e ingredientes funcionais para alimentos",
      de: "Lebensmittelphosphate, Konservierungsstoffe, Saeuerungsmittel und funktionelle Lebensmittelzutaten",
      ru: "Pishchevye fosfaty, konservanty, podkisliteli i funktsionalnye pishchevye ingredienty",
      ar: "فوسفات غذائية ومواد حافظة ومحسنات حموضة ومكونات غذائية وظيفية",
    },
  },
  {
    slug: "fi-vietnam-2024",
    image: "fivietnam2024.png",
    title: {
      es: "Fi Vietnam 2024",
      pt: "Fi Vietnam 2024",
      de: "Fi Vietnam 2024",
      ru: "Fi Vietnam 2024",
      ar: "Fi Vietnam 2024",
    },
    headline: {
      es: "Fi Vietnam 2024 - Ciudad Ho Chi Minh, Vietnam",
      pt: "Fi Vietnam 2024 - Cidade de Ho Chi Minh, Vietna",
      de: "Fi Vietnam 2024 - Ho-Chi-Minh-Stadt, Vietnam",
      ru: "Fi Vietnam 2024 - Gorod Kho Shi Min, Vyetnam",
      ar: "Fi Vietnam 2024 - مدينة هو تشي منه، فيتنام",
    },
    description: {
      es: "Bespring Chemical participo en Fi Vietnam 2024 en Ciudad Ho Chi Minh del 9 al 11 de octubre en el stand B40. Lugar del evento, informacion del stand y enfoque del portafolio.",
      pt: "A Bespring Chemical participou da Fi Vietnam 2024 na Cidade de Ho Chi Minh de 9 a 11 de outubro no estande B40. Local do evento, informacoes do estande e foco do portifolio.",
      de: "Bespring Chemical nahm vom 9. bis 11. Oktober an der Fi Vietnam 2024 in Ho-Chi-Minh-Stadt am Stand B40 teil. Veranstaltungsort, Standinformationen und Portfolio-Schwerpunkt.",
      ru: "Bespring Chemical uchastvovala v Fi Vietnam 2024 v gorode Kho Shi Min s 9 po 11 oktyabrya na stende B40. Mesto provedeniya, dannye o stende i fokus portfelya.",
      ar: "شاركت Bespring Chemical في Fi Vietnam 2024 في مدينة هو تشي منه من 9 إلى 11 أكتوبر في الجناح B40. موقع الحدث ومعلومات الجناح وتركيز المحفظة.",
    },
    datePublished: "2024-06-22",
    startDate: "2024-10-09",
    endDate: "2024-10-11",
    location: {
      es: "Ciudad Ho Chi Minh, Vietnam",
      pt: "Cidade de Ho Chi Minh, Vietna",
      de: "Ho-Chi-Minh-Stadt, Vietnam",
      ru: "Gorod Kho Shi Min, Vyetnam",
      ar: "مدينة هو تشي منه، فيتنام",
    },
    locationEn: "Ho Chi Minh City, Vietnam",
    booth: "B40",
    focus: {
      es: "Fosfatos grado alimentario, conservantes, texturizantes y otros ingredientes para alimentos",
      pt: "Fosfatos grau alimenticio, conservantes, texturizantes e outros ingredientes alimenticios",
      de: "Lebensmitteltaugliche Phosphate, Konservierungsstoffe, Texturgeber und weitere Lebensmittelzutaten",
      ru: "Pishchevye fosfaty, konservanty, teksturatory i drugie pishchevye ingredienty",
      ar: "فوسفات بدرجة غذائية ومواد حافظة وعوامل قوام ومكونات غذائية أخرى",
    },
  },
  {
    slug: "vietfood-beverage-2023",
    image: "vietfoodbeverage2023.jpg",
    title: {
      es: "Vietfood & Beverage 2023",
      pt: "Vietfood & Beverage 2023",
      de: "Vietfood & Beverage 2023",
      ru: "Vietfood & Beverage 2023",
      ar: "Vietfood & Beverage 2023",
    },
    headline: {
      es: "Vietfood & Beverage 2023 - Ciudad Ho Chi Minh",
      pt: "Vietfood & Beverage 2023 - Cidade de Ho Chi Minh",
      de: "Vietfood & Beverage 2023 - Ho-Chi-Minh-Stadt",
      ru: "Vietfood & Beverage 2023 - Gorod Kho Shi Min",
      ar: "Vietfood & Beverage 2023 - مدينة هو تشي منه",
    },
    description: {
      es: "Bespring Chemical participo en Vietfood & Beverage 2023 en Ciudad Ho Chi Minh del 10 al 12 de agosto en el stand A3.127. Lugar del evento, informacion del stand y enfoque del portafolio.",
      pt: "A Bespring Chemical participou da Vietfood & Beverage 2023 na Cidade de Ho Chi Minh de 10 a 12 de agosto no estande A3.127. Local do evento, informacoes do estande e foco do portifolio.",
      de: "Bespring Chemical nahm vom 10. bis 12. August an der Vietfood & Beverage 2023 in Ho-Chi-Minh-Stadt am Stand A3.127 teil. Veranstaltungsort, Standinformationen und Portfolio-Schwerpunkt.",
      ru: "Bespring Chemical uchastvovala v Vietfood & Beverage 2023 v gorode Kho Shi Min s 10 po 12 avgusta na stende A3.127. Mesto provedeniya, dannye o stende i fokus portfelya.",
      ar: "شاركت Bespring Chemical في Vietfood & Beverage 2023 في مدينة هو تشي منه من 10 إلى 12 أغسطس في الجناح A3.127. موقع الحدث ومعلومات الجناح وتركيز المحفظة.",
    },
    datePublished: "2023-07-01",
    startDate: "2023-08-10",
    endDate: "2023-08-12",
    location: {
      es: "Ciudad Ho Chi Minh, Vietnam",
      pt: "Cidade de Ho Chi Minh, Vietna",
      de: "Ho-Chi-Minh-Stadt, Vietnam",
      ru: "Gorod Kho Shi Min, Vyetnam",
      ar: "مدينة هو تشي منه، فيتنام",
    },
    locationEn: "Ho Chi Minh City, Vietnam",
    booth: "A3.127",
    focus: {
      es: "Aditivos alimentarios, ingredientes fosfatados y apoyo de abastecimiento para compradores del Sudeste Asiatico",
      pt: "Aditivos alimentares, ingredientes fosfatados e suporte de suprimentos para compradores do Sudeste Asiatico",
      de: "Lebensmittelzusatzstoffe, Phosphat-Zutaten und Beschaffungsunterstutzung fur Einkaufer in Sudostasien",
      ru: "Pishchevye dobavki, fosfatnye ingredienty i podderzhka zakupochnykh proektov dlya pokupateley iz Yugo-Vostochnoy Azii",
      ar: "مضافات غذائية ومكونات فوسفاتية ودعم توريد للمشترين في جنوب شرق آسيا",
    },
  },
  {
    slug: "global-ingredients-show-russia-2024",
    image: "global-ingredients-show-russia.jpg",
    title: {
      es: "Global Ingredients Show 2024 en Moscu",
      pt: "Global Ingredients Show 2024 em Moscou",
      de: "Global Ingredients Show 2024 in Moskau",
      ru: "Global Ingredients Show 2024 v Moskve",
      ar: "Global Ingredients Show 2024 في موسكو",
    },
    headline: {
      es: "Global Ingredients Show 2024 - Moscu, Rusia",
      pt: "Global Ingredients Show 2024 - Moscou, Russia",
      de: "Global Ingredients Show 2024 - Moskau, Russland",
      ru: "Global Ingredients Show 2024 - Moskva, Rossiya",
      ar: "Global Ingredients Show 2024 - موسكو، روسيا",
    },
    description: {
      es: "Bespring Chemical expuso en Global Ingredients Show 2024 en Moscu del 23 al 25 de abril en el stand D115. Lugar del evento, informacion del stand y enfoque del portafolio.",
      pt: "A Bespring Chemical expôs na Global Ingredients Show 2024 em Moscou de 23 a 25 de abril no estande D115. Local do evento, informacoes do estande e foco do portifolio.",
      de: "Bespring Chemical stellte vom 23. bis 25. April auf der Global Ingredients Show 2024 in Moskau am Stand D115 aus. Veranstaltungsort, Standinformationen und Portfolio-Schwerpunkt.",
      ru: "Bespring Chemical uchastvovala v Global Ingredients Show 2024 v Moskve s 23 po 25 aprelya na stende D115. Mesto provedeniya, dannye o stende i fokus portfelya.",
      ar: "شاركت Bespring Chemical في Global Ingredients Show 2024 في موسكو من 23 إلى 25 أبريل في الجناح D115. موقع الحدث ومعلومات الجناح وتركيز المحفظة.",
    },
    datePublished: "2024-03-10",
    startDate: "2024-04-23",
    endDate: "2024-04-25",
    location: {
      es: "Moscu, Rusia",
      pt: "Moscou, Russia",
      de: "Moskau, Russland",
      ru: "Moskva, Rossiya",
      ar: "موسكو، روسيا",
    },
    locationEn: "Moscow, Russia",
    booth: "D115",
    focus: {
      es: "Ingredientes alimentarios, sales minerales, aditivos para piensos y servicios de suministro para exportacion",
      pt: "Ingredientes alimentares, sais minerais, aditivos para racao e servicos de fornecimento para exportacao",
      de: "Lebensmittelzutaten, Mineralsalze, Futtermittelzusatze und Exportversorgungsdienste",
      ru: "Pishchevye ingredienty, mineralnye soli, kormovye dobavki i uslugi po eksportnym postavkam",
      ar: "مكونات غذائية وأملاح معدنية وإضافات علفية وخدمات توريد للتصدير",
    },
  },
  {
    slug: "global-ingredients-show-russia-2025",
    image: "russia2025.png",
    title: {
      es: "Global Ingredients Show 2025 en Moscu",
      pt: "Global Ingredients Show 2025 em Moscou",
      de: "Global Ingredients Show 2025 in Moskau",
      ru: "Global Ingredients Show 2025 v Moskve",
      ar: "Global Ingredients Show 2025 في موسكو",
    },
    headline: {
      es: "Global Ingredients Show 2025 - Moscu, Rusia",
      pt: "Global Ingredients Show 2025 - Moscou, Russia",
      de: "Global Ingredients Show 2025 - Moskau, Russland",
      ru: "Global Ingredients Show 2025 - Moskva, Rossiya",
      ar: "Global Ingredients Show 2025 - موسكو، روسيا",
    },
    description: {
      es: "Bespring Chemical expuso en Global Ingredients Show 2025 en Moscu del 15 al 17 de abril en el stand A512. Lugar del evento, informacion del stand y enfoque del portafolio.",
      pt: "A Bespring Chemical expôs na Global Ingredients Show 2025 em Moscou de 15 a 17 de abril no estande A512. Local do evento, informacoes do estande e foco do portifolio.",
      de: "Bespring Chemical stellte vom 15. bis 17. April auf der Global Ingredients Show 2025 in Moskau am Stand A512 aus. Veranstaltungsort, Standinformationen und Portfolio-Schwerpunkt.",
      ru: "Bespring Chemical uchastvovala v Global Ingredients Show 2025 v Moskve s 15 po 17 aprelya na stende A512. Mesto provedeniya, dannye o stende i fokus portfelya.",
      ar: "شاركت Bespring Chemical في Global Ingredients Show 2025 في موسكو من 15 إلى 17 أبريل في الجناح A512. موقع الحدث ومعلومات الجناح وتركيز المحفظة.",
    },
    datePublished: "2025-03-09",
    startDate: "2025-04-15",
    endDate: "2025-04-17",
    location: {
      es: "Crocus Expo, Moscu, Rusia",
      pt: "Crocus Expo, Moscou, Russia",
      de: "Crocus Expo, Moskau, Russland",
      ru: "Crocus Expo, Moskva, Rossiya",
      ar: "كروكوس إكسبو، موسكو، روسيا",
    },
    locationEn: "Crocus Expo, Moscow, Russia",
    booth: "A512",
    focus: {
      es: "Ingredientes alimentarios, productos fosfatados, aditivos para piensos y materias primas quimicas industriales",
      pt: "Ingredientes alimentares, produtos fosfatados, aditivos para racao e materias-primas quimicas industriais",
      de: "Lebensmittelzutaten, Phosphatprodukte, Futtermittelzusatze und industrielle chemische Rohstoffe",
      ru: "Pishchevye ingredienty, fosfatnye produkty, kormovye dobavki i promyshlennoe khimicheskoe syryo",
      ar: "مكونات غذائية ومنتجات فوسفاتية وإضافات علفية ومواد خام كيميائية صناعية",
    },
  },
];

const languageLinks = (locale, slug) => {
  const current = `https://www.bespringchem.com/${locale}/news/${slug}.html`;
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
    `<meta property="og:locale" content="${localeMeta[locale].ogLocale}">`,
    `<meta property="og:locale:alternate" content="en_US">`,
  ].join("");
};

const toJson = (obj) => JSON.stringify(obj);

const buildPage = (locale, page) => {
  const t = localeMeta[locale];
  const url = `https://www.bespringchem.com/${locale}/news/${page.slug}.html`;
  const title = `${page.title[locale]} | Bespring Chemical`;
  const description = page.description[locale];
  const headline = page.headline[locale];
  const imageUrl = `https://www.bespringchem.com/images/${page.image}`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline,
        description,
        datePublished: page.datePublished,
        dateModified: page.datePublished,
        mainEntityOfPage: url,
        image: imageUrl,
        inLanguage: t.lang,
        author: { "@type": "Organization", name: "Bespring Chemical Co., Ltd." },
        publisher: {
          "@type": "Organization",
          name: "Bespring Chemical Co., Ltd.",
          logo: { "@type": "ImageObject", url: "https://www.bespringchem.com/images/logo.png" },
        },
      },
      {
        "@type": "Event",
        name: headline,
        startDate: page.startDate,
        endDate: page.endDate,
        eventStatus: "https://schema.org/EventCompleted",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: page.locationEn,
          address: page.locationEn,
        },
        organizer: { "@type": "Organization", name: "Exhibition organizer" },
        attendee: { "@type": "Organization", name: "Bespring Chemical Co., Ltd." },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.home, item: `https://www.bespringchem.com/${locale}/index.html` },
          { "@type": "ListItem", position: 2, name: t.newsInsights, item: `https://www.bespringchem.com/${locale}/news.html` },
          { "@type": "ListItem", position: 3, name: headline, item: url },
        ],
      },
    ],
  };

  return `<!doctype html><html lang="${t.lang}"${t.dir}><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${url}">${languageLinks(locale, page.slug)}<meta property="og:type" content="article"><meta property="og:site_name" content="Bespring Chemical"><meta property="og:title" content="${headline}"><meta property="og:description" content="${description}"><meta property="og:image" content="${imageUrl}"><meta property="og:url" content="${url}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${headline}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${imageUrl}"><link rel="icon" href="../../images/favicon.ico"><link rel="stylesheet" href="../../css/style.css"><link rel="stylesheet" href="../../css/site-pages.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"><script type="application/ld+json">${toJson(ld)}</script></head><body class="editorial-page"><div class="bs-seo-topbar"><div class="container bs-seo-topbar-container"><div class="bs-seo-topbar-left"><span class="bs-seo-highlight"><i class="fas fa-industry" aria-hidden="true"></i> ${t.topbar}</span><span class="bs-seo-divider">|</span><span><i class="fas fa-globe" aria-hidden="true"></i> ${t.export}</span></div><div class="bs-seo-topbar-right"><a href="mailto:info@bespringchem.com" class="bs-seo-contact"><i class="fas fa-envelope" aria-hidden="true"></i> info@bespringchem.com</a><a href="tel:+8613914896109" class="bs-seo-contact"><i class="fas fa-phone" aria-hidden="true"></i> +86 139 1489 6109</a></div></div></div><header class="site-header"><div class="container nav-container"><div class="logo"><a href="../index.html"><img src="../../images/logo.png" alt="Bespring Chemical"></a></div><nav class="main-nav" aria-label="${t.navLabel}"><ul><li><a href="../index.html">${t.home}</a></li><li><a href="../about/company-profile.html">${t.about}</a></li><li><a href="../products.html">${t.products}</a></li><li><a href="../services.html">${t.services}</a></li><li><a href="../news.html" aria-current="page">${t.news}</a></li><li><a href="../contact.html" class="btn-nav">${t.contact}</a></li></ul></nav><button class="hamburger" aria-label="${t.navLabel}" aria-expanded="false"><i class="fas fa-bars" aria-hidden="true"></i></button></div></header><main><article><header class="ep-hero" style="--ep-image:url('../../images/${page.image}')"><div class="container"><nav class="ep-breadcrumb" aria-label="${t.breadcrumb}"><ol><li><a href="../index.html">${t.home}</a></li><li><a href="../news.html">${t.newsInsights}</a></li><li aria-current="page">${t.articleType}</li></ol></nav><p class="ep-eyebrow">${t.articleTypeLabel}</p><h1>${headline}</h1><p class="ep-hero__lead">${description.replace(/\. [^.]+$/, ".")}</p><div class="article-meta"><time datetime="${page.datePublished}">${t.published} ${page.datePublished}</time><span>${t.boothLabel} ${page.booth}</span></div></div></header><div class="container article-layout"><div class="article-body"><p class="lead">${t.leadIntro}</p><h2>${t.eventInfo}</h2><ul><li><strong>${t.eventDates}</strong> ${page.startDate} ${t.dateRangeJoiner} ${page.endDate}</li><li><strong>${t.location}</strong> ${page.location[locale]}</li><li><strong>${t.booth}</strong> ${page.booth}</li><li><strong>${t.focus}</strong> ${page.focus[locale]}</li></ul><h2>${t.conversations}</h2><p>${t.conversationsBody}</p><h2>${t.followup}</h2><p>${t.followupBody}</p><p class="ep-note"><strong>${t.archive}</strong> ${t.archiveBody}</p></div><aside class="article-sidebar"><h2>${t.sidebarTitle}</h2><p>${t.sidebarBody}</p><a href="../contact.html">${t.ctaContact} &rarr;</a><a href="../products.html">${t.ctaProducts} &rarr;</a><a href="../news.html">${t.ctaBack} &rarr;</a></aside></div></article></main><footer class="crc-footer"><div class="container footer-grid"><div class="footer-col"><h3>Bespring Chemical</h3><p>${t.footerDesc}</p></div><div class="footer-col footer-links"><h3>${t.quickLinks}</h3><ul><li><a href="../products.html">${t.products}</a></li><li><a href="../services.html">${t.services}</a></li><li><a href="../news.html">${t.news}</a></li></ul></div><div class="footer-col"><h3>${t.contactUs}</h3><p><a href="tel:+8613914896109">+86 139 1489 6109</a></p><p><a href="mailto:info@bespringchem.com">info@bespringchem.com</a></p><a href="../contact.html" class="contact-btn-footer">${t.footerCta}</a></div></div><div class="footer-bottom">&copy; 2026 Bespring Chemical Co., Ltd. All rights reserved.</div></footer><script>const hamburger=document.querySelector(".hamburger");const navigation=document.querySelector(".main-nav");hamburger?.addEventListener("click",()=>{const open=navigation.classList.toggle("active");hamburger.setAttribute("aria-expanded",String(open))});</script></body></html>`;
};

for (const locale of locales) {
  for (const page of exhibitions) {
    const outputPath = path.join(root, locale, "news", `${page.slug}.html`);
    await fs.writeFile(outputPath, buildPage(locale, page), "utf8");
  }
}

console.log(`Rebuilt ${exhibitions.length * locales.length} localized exhibition pages.`);

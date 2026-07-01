import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = "https://www.bespringchem.com";

const mirroredPages = [
  "index.html",
  "products.html",
  "services.html",
  "news.html",
  "contact.html",
  "about/company-profile.html",
  "about/production-bases.html",
  "about/global-markets.html",
  "about/certifications.html",
  "about/core-values.html",
  "products/food-ingredients.html",
  "products/animal-nutrition.html",
  "products/home-care-industrial-cleaning.html",
  "products/water-treatment.html",
  "products/mining.html",
  "products/agricultural-fertilizers.html"
];

const languageOrder = [
  { dir: "", label: "EN", lang: "en" },
  { dir: "zh-cn", label: "简", lang: "zh-CN" },
  { dir: "zh-tw", label: "繁", lang: "zh-TW" },
  { dir: "es", label: "ES", lang: "es" },
  { dir: "pt", label: "PT", lang: "pt" },
  { dir: "ru", label: "RU", lang: "ru" }
];

const commonPageReplacements = {
  "index.html": [
    ["Phosphate Manufacturer & Global Chemical Supplier from China", "{hero_1}"],
    ["Learn About Us", "{hero_1_cta}"],
    ["Food Ingredients, Feed Additives & Industrial Chemical Solutions", "{hero_2}"],
    ["Explore Products", "{hero_2_cta}"],
    ["Reliable Manufacturing, Global Supply Chain, Long-Term Partnership", "{hero_3}"],
    ["Contact Sales Team", "{hero_3_cta}"],
    ["Chemical Products", "{chem_products}"],
    ["Ingredients That Work in Your Application", "{application_title}"],
    ["Application Cases", "{cases_title}"],
    ["News &amp; Buyer Guides", "{news_title}"],
    ["Specification-led sourcing guidance for food, feed and industrial chemical procurement.", "{news_subtitle}"],
    ["View all buyer guides and company news", "{news_cta}"],
    ["Contact Sales", "{dock_title}"],
    ["Export inquiry support", "{dock_text}"]
  ],
  "products.html": [
    ["Chemical Ingredients &amp; Raw Materials", "{products_h1}"],
    ["B2B chemical product portfolio", "{products_eyebrow}"],
    ["Browse product portfolios", "{products_cta_1}"],
    ["Prepare an inquiry", "{products_cta_2}"],
    ["Portfolio scope", "{portfolio_scope}"],
    ["A product directory built for industrial buyers", "{portfolio_title}"],
    ["Browse by product portfolio", "{browse_portfolio}"],
    ["Find the material you need", "{find_material}"],
    ["Detailed product dossiers", "{dossiers}"],
    ["Technical pages for priority materials", "{dossiers_title}"],
    ["Procurement guidance", "{procurement_guidance}"],
    ["What to include in a useful RFQ", "{rfq_title}"],
    ["Buyer documentation", "{buyer_docs}"],
    ["Documents to align before approval", "{docs_title}"],
    ["Specification-led sourcing", "{spec_sourcing}"],
    ["Request a product and supply review", "{supply_review}"],
    ["Send your requirements", "{send_requirements}"]
  ],
  "services.html": [
    ["Procurement support beyond supply", "{services_eyebrow}"],
    ["Chemical Export &amp; Procurement Support Services", "{services_h1}"],
    ["Review services", "{services_cta_1}"],
    ["Discuss an inquiry", "{services_cta_2}"],
    ["Service scope", "{service_scope}"],
    ["Support designed around a real chemical purchase", "{service_scope_title}"],
    ["Core services", "{core_services}"],
    ["From RFQ to export shipment", "{core_services_title}"],
    ["Working process", "{working_process}"],
    ["A clearer qualification path", "{working_process_title}"],
    ["Prepare your request", "{prepare_request}"],
    ["Information that helps us respond accurately", "{prepare_request_title}"],
    ["Start with the specification", "{start_spec}"],
    ["Discuss your sourcing requirement", "{start_spec_title}"]
  ],
  "news.html": [
    ["News &amp; Insights", "{news_page_label}"],
    ["Procurement knowledge &amp; company updates", "{news_page_eyebrow}"],
    ["Chemical Industry Insights &amp; News", "{news_page_h1}"],
    ["Latest insights", "{latest_insights}"],
    ["Guides for chemical buyers", "{guides_for_buyers}"],
    ["Exhibitions archive", "{exhibition_archive}"],
    ["Meetings with international buyers", "{exhibition_title}"],
    ["Have a product question?", "{news_cta_eyebrow}"],
    ["Ask our export team", "{news_cta_title}"],
    ["Contact us", "{news_cta_button}"]
  ],
  "contact.html": [
    ["Global sales &amp; export support", "{contact_eyebrow}"],
    ["Let's discuss your ingredient or chemical requirements", "{contact_h1}"],
    ["Request a Quote", "{quote_cta}"],
    ["Chat on WhatsApp", "{whatsapp_cta}"],
    ["Food, feed &amp; industrial grades", "{trust_1}"],
    ["Worldwide export support", "{trust_2}"],
    ["Technical documents available", "{trust_3}"],
    ["Choose the easiest way to reach us", "{contact_channel_eyebrow}"],
    ["Talk to our sales team", "{contact_channel_title}"],
    ["General inquiries", "{contact_card_1}"],
    ["Quick conversation", "{contact_card_3}"]
  ],
  "about/company-profile.html": [
    ["Company Profile", "{about_profile}"],
    ["About Bespring Chemical", "{about_h1}"],
    ["A reliable link between production and global buyers", "{about_title_1}"],
    ["What we supply", "{about_supply_eyebrow}"],
    ["Ingredients and chemicals for essential industries", "{about_supply_title}"],
    ["Work with Bespring", "{about_cta_eyebrow}"],
    ["Looking for a dependable ingredient or chemical supply partner?", "{about_cta_title}"]
  ],
  "about/production-bases.html": [
    ["Production Bases", "{production_bases}"],
    ["Production Bases &amp; Manufacturing Network in China", "{production_h1}"],
    ["Browse Products", "{production_cta}"],
    ["A coordinated supply network", "{production_title_1}"],
    ["Cooperative bases across China", "{production_title_2}"],
    ["A connected operational workflow", "{production_title_3}"],
    ["View Certifications", "{production_cta_2}"],
    ["Tell us what your production supply chain needs", "{production_cta_title}"]
  ],
  "about/global-markets.html": [
    ["Global Markets", "{markets}"],
    ["Ingredient &amp; Chemical Exports to 60+ Countries", "{markets_h1}"],
    ["Request an Export Quote", "{markets_cta}"],
    ["China-based supply with a global customer focus", "{markets_title_1}"],
    ["Established markets across four key regions", "{markets_title_2}"],
    ["A portfolio built around customer applications", "{markets_title_3}"],
    ["A clear path from inquiry to export", "{markets_title_4}"],
    ["Looking for a reliable export supplier from China?", "{markets_cta_title}"]
  ],
  "about/certifications.html": [
    ["Certifications", "{certs}"],
    ["Certifications and Compliance Documents", "{certs_h1}"],
    ["Request Current Documents", "{certs_cta_1}"],
    ["Explore Products", "{certs_cta_2}"],
    ["Verify before qualification", "{certs_title_2}"],
    ["Certification and membership records", "{certs_title_3}"],
    ["Request a Document Package", "{certs_cta_3}"],
    ["Five checks before approving a certificate", "{certs_title_4}"],
    ["Certification &amp; document FAQ", "{certs_title_5}"],
    ["Request the documents for your exact product and market", "{certs_title_6}"],
    ["Contact Our Team", "{certs_cta_4}"]
  ],
  "about/core-values.html": [
    ["Core Values", "{values}"],
    ["The Principles Behind How We Work", "{values_h1}"],
    ["Standards for everyday decisions", "{values_title_1}"],
    ["What our values mean in business", "{values_title_2}"],
    ["How these principles shape an order", "{values_title_3}"],
    ["Explore Our Services", "{values_cta_1}"],
    ["Four questions that keep our values practical", "{values_title_4}"],
    ["Looking for a supplier that communicates clearly?", "{values_cta_title}"],
    ["Contact Our Team", "{values_cta_2}"],
    ["View Products", "{values_cta_3}"]
  ],
  "products/food-ingredients.html": [
    ["Food-grade product portfolio", "{cat_food_eyebrow}"],
    ["Food Ingredients &amp; Food Additives", "{cat_food_h1}"],
    ["Portfolio scope", "{portfolio_scope}"],
    ["Product directory", "{product_directory}"],
    ["Detailed product dossiers", "{dossiers}"],
    ["Review key food-grade materials in depth", "{food_detail_title}"],
    ["Continue browsing", "{continue_browsing}"],
    ["Related product portfolios", "{related_portfolios}"]
  ],
  "products/animal-nutrition.html": [
    ["Feed-grade product portfolio", "{cat_feed_eyebrow}"],
    ["Feed Additives &amp; Animal Nutrition Ingredients", "{cat_feed_h1}"],
    ["Animal Nutrition", "{cat_feed_short}"]
  ],
  "products/home-care-industrial-cleaning.html": [
    ["Cleaning raw-material portfolio", "{cat_clean_eyebrow}"],
    ["Homecare &amp; Industrial Cleaning Chemicals", "{cat_clean_h1}"]
  ],
  "products/water-treatment.html": [
    ["Water-process chemical portfolio", "{cat_water_eyebrow}"],
    ["Water Treatment Chemicals", "{cat_water_h1}"]
  ],
  "products/mining.html": [
    ["Mineral-process chemical portfolio", "{cat_mining_eyebrow}"],
    ["Mining &amp; Mineral Processing Chemicals", "{cat_mining_h1}"]
  ],
  "products/agricultural-fertilizers.html": [
    ["Fertilizer product portfolio", "{cat_agri_eyebrow}"],
    ["Phosphate Fertilizers &amp; Fertilizer Salts", "{cat_agri_h1}"]
  ]
};

const languages = [
  {
    dir: "pt",
    lang: "pt",
    locale: "pt_BR",
    label: "PT",
    dictionary: {
      title_index: "Bespring Chemical | Fornecedor global de ingredientes alimentares, aditivos para racao e quimicos industriais",
      topbar_supplier_1: "Fornecedor chines de produtos quimicos",
      topbar_supplier_2: "Fornecedor chines de ingredientes quimicos",
      topbar_supplier_3: "Fornecedor chines de quimicos e ingredientes",
      topbar_export: "Exportando para mais de 60 paises",
      home: "Inicio",
      about: "Sobre nos",
      products: "Produtos",
      services: "Servicos",
      news: "Noticias",
      contact: "Contato",
      contact_us: "Fale conosco",
      quick_links: "Links rapidos",
      get_in_touch: "Entre em contato",
      view_all_products: "Ver todos os produtos",
      continue_browsing: "Continuar navegando",
      hero_1: "Fabricante de fosfatos e fornecedor global de quimicos da China",
      hero_1_cta: "Conheca a empresa",
      hero_2: "Ingredientes alimentares, aditivos para racao e solucoes quimicas industriais",
      hero_2_cta: "Explorar produtos",
      hero_3: "Fabricacao confiavel, cadeia de suprimentos global e parceria de longo prazo",
      hero_3_cta: "Contato com vendas",
      chem_products: "Produtos quimicos",
      application_title: "Ingredientes que funcionam na sua aplicacao",
      cases_title: "Casos de aplicacao",
      news_title: "Noticias e guias para compradores",
      news_subtitle: "Orientacao de compras baseada em especificacoes para alimentos, racao e quimicos industriais.",
      news_cta: "Ver todas as noticias e guias",
      dock_title: "Contato comercial",
      dock_text: "Suporte para consultas de exportacao",
      products_h1: "Ingredientes quimicos e materias-primas",
      products_eyebrow: "Portfolio B2B de produtos quimicos",
      products_cta_1: "Explorar portfolios",
      products_cta_2: "Preparar consulta",
      portfolio_scope: "Escopo do portfolio",
      portfolio_title: "Um catalogo de produtos para compradores industriais",
      browse_portfolio: "Explorar por portfolio",
      find_material: "Encontre o material que precisa",
      dossiers: "Dossies tecnicos detalhados",
      dossiers_title: "Paginas tecnicas para materiais prioritarios",
      procurement_guidance: "Guia de compras",
      rfq_title: "O que incluir em uma RFQ util",
      buyer_docs: "Documentacao para compradores",
      docs_title: "Documentos para alinhar antes da aprovacao",
      spec_sourcing: "Compra guiada por especificacao",
      supply_review: "Solicite uma revisao de produto e fornecimento",
      send_requirements: "Enviar requisitos",
      services_eyebrow: "Suporte de compras alem do fornecimento",
      services_h1: "Servicos de exportacao quimica e apoio a compras",
      services_cta_1: "Ver servicos",
      services_cta_2: "Discutir consulta",
      service_scope: "Escopo do servico",
      service_scope_title: "Suporte pensado para uma compra quimica real",
      core_services: "Servicos principais",
      core_services_title: "Da RFQ ao embarque de exportacao",
      working_process: "Processo de trabalho",
      working_process_title: "Um caminho de qualificacao mais claro",
      prepare_request: "Prepare sua solicitacao",
      prepare_request_title: "Informacoes que ajudam nossa resposta",
      start_spec: "Comece pela especificacao",
      start_spec_title: "Fale sobre sua necessidade de compras",
      news_page_label: "Noticias e insights",
      news_page_eyebrow: "Conhecimento de compras e atualizacoes da empresa",
      news_page_h1: "Insights e noticias da industria quimica",
      latest_insights: "Ultimos insights",
      guides_for_buyers: "Guias para compradores quimicos",
      exhibition_archive: "Arquivo de exposicoes",
      exhibition_title: "Encontros com compradores internacionais",
      news_cta_eyebrow: "Tem uma pergunta sobre produto?",
      news_cta_title: "Fale com nossa equipe de exportacao",
      news_cta_button: "Contate-nos",
      contact_eyebrow: "Vendas globais e suporte de exportacao",
      contact_h1: "Vamos conversar sobre sua demanda de ingredientes ou quimicos",
      quote_cta: "Solicitar cotacao",
      whatsapp_cta: "Conversar no WhatsApp",
      trust_1: "Graus alimenticio, racao e industrial",
      trust_2: "Suporte global de exportacao",
      trust_3: "Documentos tecnicos disponiveis",
      contact_channel_eyebrow: "Escolha a forma mais facil de falar conosco",
      contact_channel_title: "Fale com nossa equipe comercial",
      contact_card_1: "Consultas gerais",
      contact_card_3: "Conversa rapida",
      about_profile: "Perfil da empresa",
      about_h1: "Sobre a Bespring Chemical",
      about_title_1: "Um elo confiavel entre a producao e compradores globais",
      about_supply_eyebrow: "O que fornecemos",
      about_supply_title: "Ingredientes e quimicos para industrias essenciais",
      about_cta_eyebrow: "Trabalhe com a Bespring",
      about_cta_title: "Procura um parceiro confiavel de fornecimento?",
      production_bases: "Bases de producao",
      production_h1: "Bases de producao e rede fabril na China",
      production_cta: "Ver produtos",
      production_title_1: "Uma rede de fornecimento coordenada",
      production_title_2: "Bases cooperativas em toda a China",
      production_title_3: "Um fluxo operacional conectado",
      production_cta_2: "Ver certificacoes",
      production_cta_title: "Conte o que sua cadeia de suprimentos precisa",
      markets: "Mercados globais",
      markets_h1: "Exportacao de ingredientes e quimicos para 60+ paises",
      markets_cta: "Solicitar cotacao de exportacao",
      markets_title_1: "Fornecimento da China com foco global no cliente",
      markets_title_2: "Mercados consolidados em quatro regioes principais",
      markets_title_3: "Um portfolio alinhado as aplicacoes do cliente",
      markets_title_4: "Um caminho claro da consulta a exportacao",
      markets_cta_title: "Procura um fornecedor confiavel da China?",
      certs: "Certificacoes",
      certs_h1: "Certificacoes e documentos de conformidade",
      certs_cta_1: "Solicitar documentos atuais",
      certs_cta_2: "Explorar produtos",
      certs_title_2: "Verifique antes da qualificacao",
      certs_title_3: "Registros de certificacao e associacao",
      certs_cta_3: "Solicitar pacote documental",
      certs_title_4: "Cinco verificacoes antes de aprovar um certificado",
      certs_title_5: "FAQ sobre certificacoes e documentos",
      certs_title_6: "Solicite os documentos do seu produto e mercado",
      certs_cta_4: "Contato com nossa equipe",
      values: "Valores centrais",
      values_h1: "Os principios por tras da nossa forma de trabalhar",
      values_title_1: "Padroes para decisoes do dia a dia",
      values_title_2: "O que nossos valores significam nos negocios",
      values_title_3: "Como esses principios moldam um pedido",
      values_cta_1: "Explorar nossos servicos",
      values_title_4: "Quatro perguntas que mantem nossos valores praticos",
      values_cta_title: "Procura um fornecedor que se comunique com clareza?",
      values_cta_2: "Contato com nossa equipe",
      values_cta_3: "Ver produtos",
      cat_food_eyebrow: "Portfolio de produtos grau alimenticio",
      cat_food_h1: "Ingredientes e aditivos alimentares",
      product_directory: "Catalogo de produtos",
      food_detail_title: "Veja em detalhe materiais alimenticios prioritarios",
      related_portfolios: "Portfolios relacionados",
      cat_feed_eyebrow: "Portfolio de produtos para racao",
      cat_feed_h1: "Aditivos para racao e ingredientes de nutricao animal",
      cat_feed_short: "Nutricao animal",
      cat_clean_eyebrow: "Portfolio de materias-primas para limpeza",
      cat_clean_h1: "Quimicos para home care e limpeza industrial",
      cat_water_eyebrow: "Portfolio de quimicos para processo de agua",
      cat_water_h1: "Quimicos para tratamento de agua",
      cat_mining_eyebrow: "Portfolio de quimicos para processo mineral",
      cat_mining_h1: "Quimicos para mineracao e processamento mineral",
      cat_agri_eyebrow: "Portfolio de produtos para fertilizantes",
      cat_agri_h1: "Fertilizantes fosfatados e sais fertilizantes"
    }
  },
  {
    dir: "ru",
    lang: "ru",
    locale: "ru_RU",
    label: "RU",
    dictionary: {
      title_index: "Bespring Chemical | Globalnyi postavshchik pishchevykh ingredientov, dobavok dlya kormov i promyshlennykh khimikatov",
      topbar_supplier_1: "Kitaiskii postavshchik khimicheskoi produktsii",
      topbar_supplier_2: "Kitaiskii postavshchik khimicheskikh ingredientov",
      topbar_supplier_3: "Kitaiskii postavshchik khimii i ingredientov",
      topbar_export: "Eksport v bolee chem 60 stran",
      home: "Glavnaya",
      about: "O kompanii",
      products: "Produkty",
      services: "Uslugi",
      news: "Novosti",
      contact: "Kontakty",
      contact_us: "Svazatsya s nami",
      quick_links: "Bystrye ssylki",
      get_in_touch: "Svazatsya",
      view_all_products: "Vse produkty",
      continue_browsing: "Prodolzhit prosmotr",
      hero_1: "Proizvoditel fosfatov i globalnyi postavshchik khimii iz Kitaia",
      hero_1_cta: "Uznaite o nas",
      hero_2: "Pishchevye ingredienty, dobavki dlya kormov i promyshlennye khimicheskie resheniia",
      hero_2_cta: "Smotret produkty",
      hero_3: "Nadezhnoe proizvodstvo, globalnaya tsepochka postavok i dolgosrochnoe partnerstvo",
      hero_3_cta: "Kontakt s otdelom prodazh",
      chem_products: "Khimicheskie produkty",
      application_title: "Ingredienty dlya vashei oblasti primeneniia",
      cases_title: "Primery primeneniia",
      news_title: "Novosti i gidy dlya pokupatelei",
      news_subtitle: "Rukovodstvo po zakupkam na osnove spetsifikatsii dlya pishchevykh, kormovykh i promyshlennykh khimikatov.",
      news_cta: "Vse novosti i gidy",
      dock_title: "Kontakt po prodazham",
      dock_text: "Podderzhka eksportnykh zaprosov",
      products_h1: "Khimicheskie ingredienty i syre",
      products_eyebrow: "B2B portfolio khimicheskoi produktsii",
      products_cta_1: "Smotret portfolio",
      products_cta_2: "Podgotovit zapros",
      portfolio_scope: "Obem portfolio",
      portfolio_title: "Katalog produktov dlya promyshlennykh pokupatelei",
      browse_portfolio: "Smotret po portfolio",
      find_material: "Naidite nuzhnyi material",
      dossiers: "Podrobnye tekhnicheskie dosie",
      dossiers_title: "Tekhnicheskie stranitsy po prioritetnym materialam",
      procurement_guidance: "Rekomendatsii po zakupke",
      rfq_title: "Chto vkliuchit v polezny RFQ",
      buyer_docs: "Dokumenty dlya pokupatelei",
      docs_title: "Dokumenty do utverzhdeniia",
      spec_sourcing: "Zakupka po spetsifikatsii",
      supply_review: "Zaprosit proverku produkta i postavki",
      send_requirements: "Otpravit trebovaniia",
      services_eyebrow: "Podderzhka zakupok pomimo postavki",
      services_h1: "Uslugi po eksportu khimii i podderzhke zakupok",
      services_cta_1: "Smotret uslugi",
      services_cta_2: "Obsudit zapros",
      service_scope: "Obem uslug",
      service_scope_title: "Podderzhka dlya realnoi khimicheskoi zakupki",
      core_services: "Osnovnye uslugi",
      core_services_title: "Ot RFQ do eksportnoi otgruzki",
      working_process: "Rabochii protsess",
      working_process_title: "Bolee iasnyi put kvalifikatsii",
      prepare_request: "Podgotovte zapros",
      prepare_request_title: "Informatsiia dlya tochnogo otveta",
      start_spec: "Nachaite so spetsifikatsii",
      start_spec_title: "Obsudite vashu zakupku",
      news_page_label: "Novosti i analitika",
      news_page_eyebrow: "Znaniia o zakupkakh i novosti kompanii",
      news_page_h1: "Analitika i novosti khimicheskoi otrasli",
      latest_insights: "Posledniia materialy",
      guides_for_buyers: "Gidy dlya khimicheskikh pokupatelei",
      exhibition_archive: "Arkhiv vystavok",
      exhibition_title: "Vstrechi s mezhdunarodnymi pokupateliami",
      news_cta_eyebrow: "Est vopros po produktu?",
      news_cta_title: "Svazhites s nashei eksportnoi komandoi",
      news_cta_button: "Sviazatsya s nami",
      contact_eyebrow: "Globalnye prodazhi i podderzhka eksporta",
      contact_h1: "Davaite obsudim vashi trebovaniia po ingredientam ili khimii",
      quote_cta: "Zaprosit kotirovku",
      whatsapp_cta: "Napisat v WhatsApp",
      trust_1: "Pishchevoi, kormovoi i promyshlennyi klass",
      trust_2: "Globalnaya podderzhka eksporta",
      trust_3: "Dostupny tekhnicheskie dokumenty",
      contact_channel_eyebrow: "Vyberite samyi udobnyi sposob sviazi",
      contact_channel_title: "Pogovorite s nashei komandoy prodazh",
      contact_card_1: "Obshchie zaprosy",
      contact_card_3: "Bystryi razgovor",
      about_profile: "Profil kompanii",
      about_h1: "O Bespring Chemical",
      about_title_1: "Nadezhnaia sviaz mezhdu proizvodstvom i globalnymi pokupateliami",
      about_supply_eyebrow: "Chto my postavliaem",
      about_supply_title: "Ingredienty i khimiia dlya kliuchevykh otraslei",
      about_cta_eyebrow: "Rabotaite s Bespring",
      about_cta_title: "Ishchete nadezhnogo partnera po postavkam?",
      production_bases: "Proizvodstvennye bazy",
      production_h1: "Proizvodstvennye bazy i set proizvodstva v Kitae",
      production_cta: "Smotret produkty",
      production_title_1: "Skoordinirovannaia set postavok",
      production_title_2: "Kooperatsionnye bazy po vsemu Kitaiu",
      production_title_3: "Sviazannyi operatsionnyi protsess",
      production_cta_2: "Smotret sertifikaty",
      production_cta_title: "Rasskazhite, chto nuzhno vashei tsepochke postavok",
      markets: "Globalnye rynki",
      markets_h1: "Eksport ingredientov i khimii v 60+ stran",
      markets_cta: "Zaprosit eksportnuiu kotirovku",
      markets_title_1: "Postavki iz Kitaia s globalnym fokusom na klienta",
      markets_title_2: "Ustoivshiesia rynki v chetyrekh kliuchevykh regionakh",
      markets_title_3: "Portfolio vokrug zadach klienta",
      markets_title_4: "Iasnyi put ot zaprosa do eksporta",
      markets_cta_title: "Nuzhen nadezhnyi eksportnyi postavshchik iz Kitaia?",
      certs: "Sertifikaty",
      certs_h1: "Sertifikaty i dokumenty sootvetstviia",
      certs_cta_1: "Zaprosit aktualnye dokumenty",
      certs_cta_2: "Smotret produkty",
      certs_title_2: "Proverte do kvalifikatsii",
      certs_title_3: "Zapisi o sertifikatsii i chlenstve",
      certs_cta_3: "Zaprosit paket dokumentov",
      certs_title_4: "Piat proverok pered utverzhdeniem sertifikata",
      certs_title_5: "FAQ po sertifikatam i dokumentam",
      certs_title_6: "Zaprosite dokumenty dlia tochnogo produkta i rynka",
      certs_cta_4: "Sviazatsya s nashei komandoy",
      values: "Kliuchevye tsennosti",
      values_h1: "Printsipy, po kotorym my rabotaem",
      values_title_1: "Standarty dlia ezhednevnykh reshenii",
      values_title_2: "Chto oznachaiut nashi tsennosti v biznese",
      values_title_3: "Kak eti printsipy vliiaiut na zakaz",
      values_cta_1: "Smotret nashi uslugi",
      values_title_4: "Chetyre voprosa, kotorye delayut tsennosti praktichnymi",
      values_cta_title: "Ishchete postavshchika s iasnoi kommunikatsiei?",
      values_cta_2: "Sviazatsya s nashei komandoy",
      values_cta_3: "Smotret produkty",
      cat_food_eyebrow: "Portfolio produktov pishchevogo klassa",
      cat_food_h1: "Pishchevye ingredienty i dobavki",
      product_directory: "Katalog produktov",
      food_detail_title: "Izuchite kliuchevye pishchevye materialy podrobnee",
      related_portfolios: "Sviazannye portfolio",
      cat_feed_eyebrow: "Portfolio kormovogo klassa",
      cat_feed_h1: "Dobavki dlia kormov i ingredienty dlia zhivotnovodstva",
      cat_feed_short: "Zhivotnovodstvo",
      cat_clean_eyebrow: "Portfolio syriia dlia ochistki",
      cat_clean_h1: "Khimikaty dlia home care i promyshlennoi ochistki",
      cat_water_eyebrow: "Portfolio khimii dlia vodnykh protsessov",
      cat_water_h1: "Khimikaty dlia obrabotki vody",
      cat_mining_eyebrow: "Portfolio khimii dlia mineralnykh protsessov",
      cat_mining_h1: "Khimikaty dlia gornoi dobychi i pererabotki mineralov",
      cat_agri_eyebrow: "Portfolio produktov dlia udobrenii",
      cat_agri_h1: "Fosfatnye udobreniia i soli dlia udobrenii"
    }
  }
];

function pageUrl(langDir, file) {
  return file === "index.html" ? `${langDir}/` : `${langDir}/${file}`;
}

function ensureDir(filePath) {
  return mkdir(path.dirname(filePath), { recursive: true });
}

function applyPairs(html, pairs) {
  let result = html;
  for (const [from, to] of pairs) {
    result = result.split(from).join(to);
  }
  return result;
}

function applyDictionary(html, dictionary) {
  let result = html;
  for (const [token, value] of Object.entries(dictionary)) {
    result = result.split(`{${token}}`).join(value);
  }
  return result;
}

function buildCommonPairs(dictionary) {
  return [
    ["China-based chemical products supplier", dictionary.topbar_supplier_1],
    ["China-based chemical ingredients supplier", dictionary.topbar_supplier_2],
    ["China-based chemical and ingredient supplier", dictionary.topbar_supplier_3],
    ["China-based supplier of  chemical products ", dictionary.topbar_supplier_1],
    ["Exporting to 60+ Countries", dictionary.topbar_export],
    ["Exporting to 60+ countries", dictionary.topbar_export],
    ['aria-label="Language selector"', 'aria-label="Language selector"'],
    ['aria-label="Language selection"', 'aria-label="Language selection"'],
    ['aria-label="Language"', 'aria-label="Language"'],
    [">Home<", `>${dictionary.home}<`],
    [">About Us<", `>${dictionary.about}<`],
    [">Products<", `>${dictionary.products}<`],
    [">Services<", `>${dictionary.services}<`],
    [">News<", `>${dictionary.news}<`],
    [">Contact<", `>${dictionary.contact}<`],
    [">Contact Us<", `>${dictionary.contact_us}<`],
    [">Quick Links<", `>${dictionary.quick_links}<`],
    [">Get in Touch<", `>${dictionary.get_in_touch}<`],
    [">View all products<", `>${dictionary.view_all_products}<`],
    [">Continue browsing<", `>${dictionary.continue_browsing}<`]
  ];
}

function buildPagePairs(file) {
  return commonPageReplacements[file] || [];
}

function adjustAssets(html) {
  return html.replace(/(["'(=])((?:\.\.\/)*)(images\/|css\/|js\/|webfonts\/)/g, '$1../$2$3');
}

function rerouteLeafLinks(html) {
  return html
    .replace(/href="products\/food-ingredients\//g, 'href="../products/food-ingredients/')
    .replace(/href="applications\//g, 'href="../applications/')
    .replace(/href="news\//g, 'href="../news/')
    .replace(/href="Solutions\//g, 'href="../Solutions/')
    .replace(/href="food-ingredients\//g, 'href="../../products/food-ingredients/');
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ensureLocalizedMeta(html, language, file) {
  const localizedUrl = `${site}/${pageUrl(language.dir, file)}`;
  const sourceUrls = file === "index.html" ? [`${site}/`, `${site}`] : [`${site}/${file}`];
  let result = html
    .replace(/<html lang="en">/i, `<html lang="${language.lang}">`)
    .replace(/<meta property="og:locale" content="en_US">/i, `<meta property="og:locale" content="${language.locale}">`)
    .replace(/"inLanguage":"en"/g, `"inLanguage":"${language.lang}"`)
    .replace(/"inLanguage": "en"/g, `"inLanguage": "${language.lang}"`);

  for (const sourceUrl of sourceUrls) {
    result = result
      .replace(
        new RegExp(`<link rel="canonical" href="${escapeRegex(sourceUrl)}">`, "i"),
        `<link rel="canonical" href="${localizedUrl}">`
      )
      .replace(
        new RegExp(`<meta property="og:url" content="${escapeRegex(sourceUrl)}">`, "i"),
        `<meta property="og:url" content="${localizedUrl}">`
      );
  }

  if (!result.includes(`hreflang="${language.lang}"`)) {
    result = result.replace(
      /(<link rel="alternate"[^>]+hreflang="zh-TW"[^>]*>\s*)(?:<link rel="alternate"[^>]+hreflang="es"[^>]*>\s*)?/i,
      `$1<link rel="alternate" hreflang="${language.lang}" href="${localizedUrl}">\n`
    );
  }

  return result;
}

function localizedPath(dir, file, currentDir) {
  const depth = file.split("/").length - 1;
  const prefix = `${currentDir ? "../" : ""}${"../".repeat(depth)}`;
  const leaf = file.split("/").pop();
  if (dir === "") return `${prefix}${leaf}`;
  if (file.startsWith("about/")) return `${prefix}${dir}/about/${leaf}`;
  if (file.startsWith("products/")) return `${prefix}${dir}/products/${leaf}`;
  return `${prefix}${dir}/${leaf}`;
}

function buildLanguageBlock(file, activeDir) {
  const links = languageOrder.map((item) => {
    const href = item.dir === activeDir ? file.split("/").pop() : localizedPath(item.dir, file, activeDir);
    const active = item.dir === activeDir ? ' class="active" aria-current="page"' : "";
    return `          <a href="${href}" lang="${item.lang}"${active}>${item.label}</a>`;
  }).join("\n");

  return `<div class="bs-seo-language" aria-label="Language selection">
${links}
        </div>`;
}

function replaceLanguageBlock(html, file, activeDir) {
  return html.replace(/<div class="bs-seo-language"[\s\S]*?<\/div>/i, buildLanguageBlock(file, activeDir));
}

function addEnglishLanguageSupport(html, file) {
  let result = html;
  for (const item of languageOrder.filter((entry) => ["es", "pt", "ru"].includes(entry.dir))) {
    const localizedUrl = `${site}/${pageUrl(item.dir, file)}`;
    if (!result.includes(`hreflang="${item.lang}"`)) {
      result = result.replace(
        /(<link rel="alternate"[^>]+hreflang="x-default"[^>]*>)/i,
        `<link rel="alternate" hreflang="${item.lang}" href="${localizedUrl}">\n$1`
      );
    }
  }

  if (!result.includes(">PT<") || !result.includes(">RU<")) {
    result = result.replace(/<div class="bs-seo-language"[\s\S]*?<\/div>/i, buildLanguageBlock(file, ""));
  }
  return result;
}

function localizePage(sourceHtml, language, file) {
  let result = sourceHtml;
  result = ensureLocalizedMeta(result, language, file);
  result = adjustAssets(result);
  result = rerouteLeafLinks(result);
  result = replaceLanguageBlock(result, file, language.dir);
  result = applyPairs(result, buildCommonPairs(language.dictionary));
  result = applyPairs(result, buildPagePairs(file));
  result = applyDictionary(result, language.dictionary);

  if (file === "index.html") {
    result = result.replace(
      /<title>[^<]+<\/title>/i,
      `<title>${language.dictionary.title_index}</title>`
    );
  }
  return result;
}

for (const language of languages) {
  for (const file of mirroredPages) {
    const sourcePath = path.join(root, file);
    const targetPath = path.join(root, language.dir, file);
    const sourceHtml = await readFile(sourcePath, "utf8");
    const localizedHtml = localizePage(sourceHtml, language, file);
    await ensureDir(targetPath);
    await writeFile(targetPath, localizedHtml, "utf8");
  }
}

for (const file of mirroredPages) {
  const sourcePath = path.join(root, file);
  const sourceHtml = await readFile(sourcePath, "utf8");
  const updatedHtml = addEnglishLanguageSupport(sourceHtml, file);
  if (updatedHtml !== sourceHtml) {
    await writeFile(sourcePath, updatedHtml, "utf8");
  }
}

console.log(`Portuguese and Russian mirror pages generated: ${mirroredPages.length * languages.length}`);

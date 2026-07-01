import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directory = path.join(root, "es", "about");
const pages = [
  "company-profile.html",
  "production-bases.html",
  "global-markets.html",
  "certifications.html",
  "core-values.html"
];

const shared = [
  ["Proveedor chino de productos quimicos", "Proveedor chino de productos químicos"],
  ["Exportando a mas de 60 paises", "Exportamos a más de 60 países"],
  ["Language selection", "Selector de idioma"],
  ["Bespring Chemical home", "Inicio de Bespring Chemical"],
  ["Navegacion principal", "Navegación principal"],
  ["Abrir menu de navegacion", "Abrir el menú de navegación"],
  ["Cerrar menu de navegacion", "Cerrar el menú de navegación"],
  ["About Bespring sections", "Secciones sobre Bespring"],
  ["Empresa Profile", "Perfil de la empresa"],
  ["Production Bases", "Bases de producción"],
  ["Global Markets", "Mercados globales"],
  ["Certifications", "Certificaciones"],
  ["Core Values", "Valores corporativos"],
  ["Enlaces Rapidos", "Enlaces rápidos"],
  ["Cont谩ctenos", "Contáctenos"],
  ["Contactenos", "Contáctenos"],
  ["Sales:", "Ventas:"],
  ["Office:", "Oficina:"],
  ["All rights reserved.", "Todos los derechos reservados."],
  ["China-based supplier of food ingredients, feed additives and industrial chemicals to customers worldwide.", "Proveedor chino de ingredientes alimentarios, aditivos para piensos y productos químicos industriales para clientes de todo el mundo."],
  ["Bespring Chemical on Facebook", "Bespring Chemical en Facebook"],
  ["Bespring Chemical on LinkedIn", "Bespring Chemical en LinkedIn"],
  ["Ruixing North Road, Yunhe Town, Pizhou City, Jiangsu Province, China", "Carretera Ruixing Norte, Yunhe, Pizhou, Jiangsu, China"],
  ["Ruixing North Road, Yunhe Town", "Carretera Ruixing Norte, Yunhe"],
  ['"availableLanguage": ["English", "Chinese"]', '"availableLanguage": ["Spanish", "English", "Chinese"]'],
  ['"areaServed": "Worldwide"', '"areaServed": "Todo el mundo"'],
  ['"contactType": "sales"', '"contactType": "ventas"'],
  ["Food-grade phosphates", "Fosfatos de grado alimentario"],
  ["Feed additives", "Aditivos para piensos"],
  ["Food ingredients", "Ingredientes alimentarios"],
  ["Water treatment chemicals", "Productos químicos para el tratamiento de aguas"],
  ["Industrial cleaning chemicals", "Productos químicos para limpieza industrial"],
  ["Mining chemicals", "Productos químicos para minería"],
  ["Agricultural fertilizers", "Fertilizantes agrícolas"],
  ["Respuesta rapidas", "Respuestas rápidas"],
  ["Contactoar a nuestro equipo", "Contactar con nuestro equipo"],
  ["WhatsApp Us", "Escríbanos por WhatsApp"],
  ["Email Us", "Envíenos un correo"],
  ["Miga de pan", "Ruta de navegación"]
];

const companyProfile = [
  ["Sobre Bespring Chemical | Proveedor de ingredientes y quimicos", "Bespring Chemical: empresa y proveedor químico en China"],
  ["Bespring Chemical is a China-based supplier of phosphates, food ingredients, feed additives and industrial chemicals, serving customers in 60+ countries.", "Bespring Chemical es un proveedor chino de fosfatos, ingredientes alimentarios, aditivos para piensos y productos químicos industriales con clientes en más de 60 países."],
  ["Sobre Bespring Chemical | Ingredient & Chemical Supplier", "Bespring Chemical: fabricante y proveedor químico en China"],
  ["Decades of phosphate expertise, an international supply network and export service for food, feed and industrial customers in 60+ countries.", "Décadas de experiencia en fosfatos, una red internacional de suministro y servicio de exportación para clientes de alimentación, piensos e industria en más de 60 países."],
  ["Bespring Chemical company and production facilities in China", "Empresa e instalaciones de producción de Bespring Chemical en China"],
  ["China-based supplier of phosphates, food ingredients, feed additives and industrial chemicals to 60+ countries.", "Proveedor chino de fosfatos, ingredientes alimentarios, aditivos para piensos y productos químicos industriales en más de 60 países."],
  ["China-based supplier of phosphates, food ingredients, feed additives and industrial chemicals serving customers in more than 60 countries.", "Proveedor chino de fosfatos, ingredientes alimentarios, aditivos para piensos y productos químicos industriales con clientes en más de 60 países."],
  ["Empresa profile of Bespring Chemical, a China-based exporter and supplier of food, feed and industrial ingredients.", "Perfil corporativo de Bespring Chemical, exportador y proveedor chino de ingredientes para alimentación, piensos e industria."],
  ["What does Bespring Chemical supply?", "¿Qué productos suministra Bespring Chemical?"],
  ["Bespring Chemical supplies phosphates, food ingredients, feed additives and chemicals for water treatment, industrial cleaning, mining and agriculture.", "Bespring Chemical suministra fosfatos, ingredientes alimentarios, aditivos para piensos y productos químicos para tratamiento de aguas, limpieza industrial, minería y agricultura."],
  ["Is Bespring Chemical a manufacturer or a supplier?", "¿Bespring Chemical es fabricante o proveedor?"],
  ["Bespring Chemical grew from a phosphate manufacturing business. Today it supplies its own branded phosphate products and selected products from qualified production partners through an integrated supply network.", "Bespring Chemical nació de una empresa fabricante de fosfatos. Actualmente suministra fosfatos de marca propia y productos seleccionados de socios de producción homologados mediante una red integrada de suministro."],
  ["Where is Bespring Chemical located?", "¿Dónde se encuentra Bespring Chemical?"],
  ["Bespring Chemical is based in Pizhou, Jiangsu Province, China.", "Bespring Chemical tiene su sede en Pizhou, provincia de Jiangsu, China."],
  ["Which markets does Bespring Chemical serve?", "¿A qué mercados suministra Bespring Chemical?"],
  ["Bespring Chemical serves customers in more than 60 countries, including markets across Asia, the Middle East, Europe and other regions.", "Bespring Chemical atiende a clientes de más de 60 países de Asia, Oriente Medio, Europa y otras regiones."],
  ["A China-based supplier of food ingredients, feed additives and industrial chemicals, built on decades of phosphate expertise and international trade experience.", "Proveedor chino de ingredientes alimentarios, aditivos para piensos y productos químicos industriales, respaldado por décadas de experiencia en fosfatos y comercio internacional."],
  ["Explorar nuestros productos", "Ver nuestros productos"],
  ["Contactoar a nuestro equipo de exportacion", "Contactar con el equipo de exportación"],
  ["Bespring Chemical facility in Pizhou, Jiangsu, China", "Instalaciones de Bespring Chemical en Pizhou, Jiangsu, China"],
  ["Pizhou, Jiangsu Province, China", "Pizhou, provincia de Jiangsu, China"],
  ["Who we are", "Quiénes somos"],
  ["Un vinculo confiable entre la produccion y los compradores globales", "Un vínculo fiable entre la producción y los compradores internacionales"],
  ["Bespring Chemical Co., Ltd. is a China-based ingredient and chemical supplier serving food, animal nutrition and industrial customers in more than 60 countries.", "Bespring Chemical Co., Ltd. es un proveedor chino de ingredientes y productos químicos para clientes de los sectores alimentario, nutrición animal e industria en más de 60 países."],
  ["Our roots reach back to the 1970s and the former Pizhou No. 2 Chemical Plant, one of China&rsquo;s early producers of food-grade and industrial-grade phosphates. That manufacturing heritage shaped the technical knowledge and quality-focused approach behind our business today.", "Nuestros orígenes se remontan a la década de 1970 y a la antigua Planta Química n.º 2 de Pizhou, una de las primeras productoras chinas de fosfatos de grado alimentario e industrial. Esa trayectoria industrial sustenta hoy nuestros conocimientos técnicos y nuestro enfoque en la calidad."],
  ["Bespring was restructured under its current name in 2014. We now combine our own branded phosphate products with selected products from qualified production partners, giving international buyers a practical, coordinated source for ingredients and raw materials.", "La empresa se reestructuró bajo el nombre Bespring en 2014. Hoy combinamos fosfatos de marca propia con productos seleccionados de socios de producción homologados, ofreciendo a los compradores internacionales una fuente coordinada y práctica de ingredientes y materias primas."],
  ["See our production network", "Conozca nuestra red de producción"],
  ["Bespring Chemical at a glance", "Bespring Chemical en cifras"],
  ["Phosphate industry roots", "Trayectoria en la industria de fosfatos"],
  ["Countries served", "Países atendidos"],
  ["Core market sectors", "Sectores principales"],
  ["Integrated supply base", "Base integrada de suministro"],
  ["Que suministramos", "Qué suministramos"],
  ["Ingredientes y quimicos para industrias esenciales", "Ingredientes y productos químicos para sectores esenciales"],
  ["Our portfolio is organized around the application needs of food processors, feed manufacturers and industrial users.", "Nuestro catálogo se organiza según las necesidades de aplicación de procesadores de alimentos, fabricantes de piensos y usuarios industriales."],
  ["Food Ingredients", "Ingredientes alimentarios"],
  ["Food-grade phosphates, acidulants, preservatives, texturizers and other functional ingredients for food and beverage processing.", "Fosfatos de grado alimentario, acidulantes, conservantes, texturizantes y otros ingredientes funcionales para alimentos y bebidas."],
  ["Animal Nutrition", "Nutrición animal"],
  ["Feed-grade phosphates and selected nutritional additives for feed formulation and livestock production.", "Fosfatos para piensos y aditivos nutricionales seleccionados para formulación de piensos y producción ganadera."],
  ["Industrial Chemicals", "Productos químicos industriales"],
  ["Chemical raw materials for water treatment, industrial cleaning, mining and agricultural applications.", "Materias primas químicas para tratamiento de aguas, limpieza industrial, minería y aplicaciones agrícolas."],
  ["Our development", "Nuestra evolución"],
  ["From phosphate production to global supply", "De la producción de fosfatos al suministro global"],
  ["Our growth has followed one consistent direction: applying practical chemical expertise to the changing needs of customers and markets.", "Nuestra evolución ha seguido una dirección constante: aplicar conocimientos químicos prácticos a las necesidades cambiantes de clientes y mercados."],
  ["Manufacturing origins", "Orígenes industriales"],
  ["The business traces its roots to Pizhou No. 2 Chemical Plant and the production of food-grade and industrial-grade phosphates.", "La empresa tiene su origen en la Planta Química n.º 2 de Pizhou y en la producción de fosfatos de grado alimentario e industrial."],
  ["Technical and portfolio development", "Desarrollo técnico y del catálogo"],
  ["Production processes and product applications expanded across food, feed and industrial uses.", "Los procesos y las aplicaciones se ampliaron a los sectores alimentario, de piensos e industrial."],
  ["Bespring Chemical established", "Constitución de Bespring Chemical"],
  ["A major restructuring created Bespring Chemical Co., Ltd. and strengthened the company&rsquo;s international business focus.", "Una importante reestructuración dio lugar a Bespring Chemical Co., Ltd. y reforzó su orientación internacional."],
  ["Today", "Actualidad"],
  ["Serving international supply chains", "Servicio a cadenas internacionales de suministro"],
  ["Bespring supplies customers in more than 60 countries through its phosphate expertise and network of production partners.", "Bespring suministra a clientes de más de 60 países gracias a su experiencia en fosfatos y su red de socios de producción."],
  ["How we work", "Cómo trabajamos"],
  ["Built for international procurement", "Preparados para las compras internacionales"],
  ["We help buyers move from product selection to export delivery with one coordinated commercial contact.", "Acompañamos al comprador desde la selección del producto hasta la entrega de exportación mediante un único contacto comercial coordinado."],
  ["Application-focused sourcing", "Abastecimiento según la aplicación"],
  ["Product options are matched to the customer&rsquo;s grade, application and market requirements.", "Las opciones de producto se ajustan al grado, la aplicación y los requisitos del mercado del cliente."],
  ["Quality and documentation", "Calidad y documentación"],
  ["Specifications and available compliance documents are confirmed before supply arrangements are finalized.", "Confirmamos las especificaciones y la documentación disponible antes de cerrar las condiciones de suministro."],
  ["Export coordination", "Coordinación de exportaciones"],
  ["Our team coordinates packaging, order communication and international shipment requirements.", "Nuestro equipo coordina el embalaje, la comunicación del pedido y los requisitos del transporte internacional."],
  ["Long-term support", "Atención a largo plazo"],
  ["We stay engaged after the first order to support repeat purchasing and evolving product needs.", "Seguimos atendiendo al cliente después del primer pedido para facilitar compras recurrentes y nuevas necesidades."],
  ["Explore our export services", "Ver servicios de exportación"],
  ["Review certifications", "Consultar certificaciones"],
  ["Clear answers for procurement teams evaluating a new ingredient or chemical supplier.", "Respuestas claras para equipos de compras que evalúan un nuevo proveedor de ingredientes o productos químicos."],
  ["We supply phosphates, food ingredients, feed additives and chemicals for water treatment, industrial cleaning, mining and agriculture.", "Suministramos fosfatos, ingredientes alimentarios, aditivos para piensos y productos químicos para tratamiento de aguas, limpieza industrial, minería y agricultura."],
  ["Bespring grew from a phosphate manufacturing business. Today, we supply our own branded phosphate products and selected products from qualified production partners through an integrated supply network.", "Bespring nació de una empresa fabricante de fosfatos. Hoy suministramos fosfatos de marca propia y productos seleccionados de socios de producción homologados mediante una red integrada de suministro."],
  ["We are based in Pizhou, Jiangsu Province, China, with access to China&rsquo;s established ingredient, chemical and export logistics networks.", "Nuestra sede se encuentra en Pizhou, provincia de Jiangsu, con acceso a las consolidadas redes chinas de ingredientes, productos químicos y logística de exportación."],
  ["We serve customers in more than 60 countries, including markets across Asia, the Middle East, Europe and other regions.", "Atendemos a clientes de más de 60 países de Asia, Oriente Medio, Europa y otras regiones."],
  ["Busca un socio confiable para ingredientes o quimicos?", "¿Busca un socio fiable para el suministro de ingredientes o productos químicos?"],
  ["Tell our export team your product, specification, quantity and destination market.", "Indique a nuestro equipo de exportación el producto, la especificación, la cantidad y el mercado de destino."],
  ["Send an Inquiry", "Enviar una consulta"]
];

const productionBases = [
  ["Bases de produccion en China | Bespring Chemical", "Bases de producción y red de suministro en China | Bespring"],
  ["Bases de produccion", "Bases de producción"],
  ["Production Network", "Red de producción"],
  ["Bases de producción &amp; Manufacturing Network in China", "Bases de producción y red de fabricación en China"],
  ["Cooperative production bases across four Chinese provinces support responsive sourcing, coordinated quality control and export supply for food, feed and industrial customers.", "Bases de producción colaboradoras en cuatro provincias chinas permiten un abastecimiento ágil, control de calidad coordinado y suministro de exportación para alimentación, piensos e industria."],
  ["Discuss Your Requisitos", "Comentar sus requisitos"],
  ["Network overview", "Resumen de la red"],
  ["Bespring Chemical works with cooperative production bases in Jiangsu, Shandong, Sichuan and Hainan, China.", "Bespring Chemical trabaja con bases de producción colaboradoras en Jiangsu, Shandong, Sichuan y Hainan, China."],
  ["This multi-region structure allows our export team to align product category, grade, specifications and order requirements with suitable production resources. It also adds flexibility when customers need a broader portfolio than a single facility can provide.", "Esta estructura regional permite adaptar la categoría, el grado, las especificaciones y el pedido a los recursos productivos adecuados. También aporta flexibilidad cuando el cliente necesita una gama más amplia que la de una sola planta."],
  ["Bespring coordinates communication between international buyers and selected production partners, covering specification review, available documentation, packaging requirements and shipment planning.", "Bespring coordina la comunicación entre compradores internacionales y socios de producción seleccionados, desde la revisión de especificaciones y documentos hasta el embalaje y la planificación del envío."],
  ["See our export supply services", "Ver nuestros servicios de suministro para exportación"],
  ["Bespring facility, Pizhou, Jiangsu Province", "Instalaciones de Bespring, Pizhou, provincia de Jiangsu"],
  ["Four production regions", "Cuatro regiones de producción"],
  ["The network connects eastern manufacturing and export corridors with production resources in western and southern China.", "La red conecta los corredores industriales y de exportación del este con recursos productivos del oeste y el sur de China."],
  ["Stylized network connecting Jiangsu, Shandong, Sichuan and Hainan production regions", "Red de conexión entre las regiones productivas de Jiangsu, Shandong, Sichuan y Hainan"],
  ["Supply coordination", "Coordinación del suministro"],
  ["Cooperative base", "Base colaboradora"],
  ["Bespring鈥檚 home province and a key base for customer coordination, production resources and access to eastern China鈥檚 export infrastructure.", "Provincia de origen de Bespring y base clave para coordinar clientes, recursos productivos y acceso a la infraestructura exportadora del este de China."],
  ["A cooperative production region connected to one of China鈥檚 established chemical manufacturing and port logistics clusters.", "Región productiva colaboradora conectada con uno de los principales polos químicos y logísticos portuarios de China."],
  ["A cooperative production region that broadens the network鈥檚 geographic reach and access to inland manufacturing resources.", "Región productiva colaboradora que amplía el alcance geográfico de la red y el acceso a recursos industriales del interior."],
  ["A cooperative production region in southern China that adds further flexibility to the wider supply network.", "Región productiva colaboradora del sur de China que aporta mayor flexibilidad a la red de suministro."],
  ["Product availability and the appropriate production source are confirmed individually according to grade, specification, quantity and destination market.", "La disponibilidad y el origen de producción adecuado se confirman para cada pedido según el grado, la especificación, la cantidad y el mercado de destino."],
  ["Production to shipment", "De la producción al envío"],
  ["Manufacturing is only one part of reliable international supply. Testing, storage, packaging and dispatch are coordinated around each order.", "La fabricación es solo una parte de un suministro internacional fiable. Los análisis, el almacenamiento, el embalaje y el despacho se coordinan para cada pedido."],
  ["Automated phosphate product packing line at a cooperative production facility", "Línea automatizada de envasado de fosfatos en una base de producción colaboradora"],
  ["Production &amp; Embalaje", "Producción y envasado"],
  ["Production resources are selected according to the required product, grade, specification and order profile.", "Los recursos productivos se seleccionan según el producto, grado, especificación y características del pedido."],
  ["Chemical quality control laboratory used for product testing", "Laboratorio de control de calidad para análisis de productos químicos"],
  ["Quality Testing", "Control de calidad"],
  ["Testing and specification review help confirm product conformity before release and dispatch.", "Los análisis y la revisión de especificaciones permiten confirmar la conformidad antes de liberar y despachar el producto."],
  ["Bagged chemical products stored on pallets in a warehouse", "Productos químicos ensacados y almacenados sobre palés"],
  ["Storage &amp; Handling", "Almacenamiento y manipulación"],
  ["Productos are organized for protected storage, batch identification and efficient outbound handling.", "Los productos se organizan para un almacenamiento protegido, identificación por lotes y expedición eficiente."],
  ["Palletized chemical products loaded into an export container", "Productos químicos paletizados durante la carga de un contenedor de exportación"],
  ["Export Dispatch", "Despacho de exportación"],
  ["Packaging, loading and shipment details are coordinated for the customer鈥檚 order and destination.", "El embalaje, la carga y el transporte se coordinan según el pedido y el destino del cliente."],
  ["Quality framework", "Sistema de calidad"],
  ["Control points across the supply process", "Puntos de control durante el proceso de suministro"],
  ["Quality requirements differ by product, application and destination market. Our role is to establish those requirements clearly and keep them visible through production and export preparation.", "Los requisitos de calidad varían según el producto, la aplicación y el mercado. Nuestra función es definirlos con claridad y mantenerlos presentes durante la producción y la preparación de la exportación."],
  ["Requirement review", "Revisión de requisitos"],
  ["Confirm product name, grade, specification, application, packaging and destination.", "Confirmar nombre, grado, especificación, aplicación, embalaje y destino."],
  ["Production-source alignment", "Asignación del origen productivo"],
  ["Match the inquiry with a suitable resource within the cooperative network.", "Asignar la consulta al recurso adecuado dentro de la red colaboradora."],
  ["Testing and specification check", "Análisis y comprobación de especificaciones"],
  ["Review available test results and product documentation against the agreed requirements.", "Contrastar los análisis y documentos disponibles con los requisitos acordados."],
  ["Pre-dispatch coordination", "Coordinación previa al despacho"],
  ["Confirm packaging, batch information, documents and shipment arrangements before loading.", "Confirmar embalaje, lotes, documentos y transporte antes de la carga."],
  ["Production, packing, warehouse and container loading scenes from Bespring鈥檚 supply network", "Producción, envasado, almacenamiento y carga de contenedores en la red de suministro de Bespring"],
  ["Continuous improvement", "Mejora continua"],
  ["Practical progress in production and resource use", "Mejoras prácticas en producción y uso de recursos"],
  ["Bespring encourages production partners to strengthen process control and improve operational efficiency. Areas of ongoing attention include:", "Bespring anima a sus socios de producción a reforzar el control de procesos y la eficiencia operativa. Las áreas de mejora continua incluyen:"],
  ["Process optimization", "Optimización de procesos"],
  ["to support consistency and reduce unnecessary variation.", "para favorecer la uniformidad y reducir variaciones innecesarias."],
  ["Energy and material efficiency", "Eficiencia energética y de materiales"],
  ["within production and packing activities.", "en las operaciones de producción y envasado."],
  ["Environmental facility upgrades", "Mejora de instalaciones ambientales"],
  ["and attention to emissions-management practices.", "y atención a las prácticas de gestión de emisiones."],
  ["Safer handling and storage", "Manipulación y almacenamiento más seguros"],
  ["throughout the supply process.", "durante todo el proceso de suministro."],
  ["Buyer questions", "Preguntas de compradores"],
  ["About our production network", "Preguntas sobre nuestra red de producción"],
  ["Useful answers for procurement and quality teams assessing Bespring as a supply partner.", "Respuestas útiles para equipos de compras y calidad que evalúan a Bespring como proveedor."],
  ["Where are Bespring Chemical鈥檚 production bases?", "¿Dónde se encuentran las bases de producción de Bespring Chemical?"],
  ["We work with cooperative production bases in Jiangsu, Shandong, Sichuan and Hainan, China.", "Trabajamos con bases de producción colaboradoras en Jiangsu, Shandong, Sichuan y Hainan, China."],
  ["Does Bespring own every production base?", "¿Bespring es propietaria de todas las bases de producción?"],
  ["Bespring operates through a cooperative production network. Our team coordinates product requirements, quality documentation and export supply with selected production partners.", "Bespring opera mediante una red productiva colaboradora. Nuestro equipo coordina requisitos, documentación de calidad y exportación con socios de producción seleccionados."],
  ["What products does the network support?", "¿Qué productos cubre la red?"],
  ["The network supports phosphates and selected ingredients and chemicals for food, animal nutrition, water treatment, industrial cleaning, mining and agricultural applications.", "La red cubre fosfatos e ingredientes y productos químicos seleccionados para alimentación, nutrición animal, tratamiento de aguas, limpieza industrial, minería y agricultura."],
  ["How does Bespring manage product quality?", "¿Cómo gestiona Bespring la calidad del producto?"],
  ["Quality management covers raw-material review, production controls, product testing, specification confirmation and documentation before export dispatch.", "La gestión de calidad comprende la revisión de materias primas, controles de producción, análisis, confirmación de especificaciones y documentación antes del despacho."],
  ["Source with confidence", "Abastecimiento con confianza"],
  ["Cuentenos que necesita su cadena de suministro de produccion", "Cuéntenos qué necesita de su cadena de suministro"],
  ["Share your product, grade, specification, volume and destination so our team can assess a suitable supply route.", "Indique producto, grado, especificación, volumen y destino para que evaluemos una vía de suministro adecuada."],
  ["Send Your Inquiry", "Enviar su consulta"]
];

const globalMarkets = [
  ["Mercados globales y exportacion quimica | Bespring Chemical", "Exportación de ingredientes químicos a más de 60 países | Bespring"],
  ["Exportacion de ingredientes y quimicos a mas de 60 paises", "Exportación de ingredientes y productos químicos a más de 60 países"],
  ["Bespring connects China鈥檚 ingredient and chemical supply network with food, feed and industrial customers across key international markets.", "Bespring conecta la red china de ingredientes y productos químicos con clientes de alimentación, piensos e industria en mercados internacionales clave."],
  ["Solicitar cotizacion de exportacion", "Solicitar cotización de exportación"],
  ["International reach", "Alcance internacional"],
  ["Bespring Chemical supplies food ingredients, feed additives and industrial chemicals to customers in more than 60 countries.", "Bespring Chemical suministra ingredientes alimentarios, aditivos para piensos y productos químicos industriales a clientes de más de 60 países."],
  ["Our established markets include Europe, the Americas, the Middle East and Southeast Asia. Customers range from food and feed manufacturers to distributors and industrial users working in water treatment, cleaning, mining and agriculture.", "Nuestros mercados consolidados incluyen Europa, América, Oriente Medio y el Sudeste Asiático. Atendemos a fabricantes de alimentos y piensos, distribuidores y usuarios industriales de tratamiento de aguas, limpieza, minería y agricultura."],
  ["Rather than treating every market the same, our export team reviews product grade, specifications, documentation, packaging and shipment requirements for each inquiry.", "Nuestro equipo de exportación revisa para cada consulta el grado, las especificaciones, la documentación, el embalaje y los requisitos de envío de cada mercado."],
  ["See our international supply services", "Ver servicios de suministro internacional"],
  ["Global market facts", "Datos sobre nuestros mercados"],
  ["Across multiple international regions", "En distintas regiones internacionales"],
  ["Established market regions", "Regiones comerciales consolidadas"],
  ["Europe, the Americas, Middle East and Southeast Asia", "Europa, América, Oriente Medio y Sudeste Asiático"],
  ["Core customer sectors", "Sectores principales de clientes"],
  ["Food, animal nutrition and industrial applications", "Alimentación, nutrición animal y aplicaciones industriales"],
  ["Supply origin: China", "Origen del suministro: China"],
  ["Coordinated through production and logistics partners", "Coordinado con socios de producción y logística"],
  ["Regions served", "Regiones atendidas"],
  ["Regional requirements can differ. Product availability, documentation and commercial terms are confirmed for each customer and destination.", "Los requisitos varían por región. Confirmamos disponibilidad, documentación y condiciones comerciales para cada cliente y destino."],
  ["Europe", "Europa"],
  ["Supply support for buyers sourcing functional ingredients, phosphates and selected industrial raw materials.", "Apoyo a compradores de ingredientes funcionales, fosfatos y materias primas industriales seleccionadas."],
  ["The Americas", "América"],
  ["Export coordination for distributors, processors and industrial customers across North and South American markets.", "Coordinación de exportaciones para distribuidores, procesadores y clientes industriales de América del Norte y del Sur."],
  ["Middle East", "Oriente Medio"],
  ["Long-distance supply support across food, feed, water treatment and other industrial application sectors.", "Suministro de larga distancia para alimentación, piensos, tratamiento de aguas y otras aplicaciones industriales."],
  ["Southeast Asia", "Sudeste Asiático"],
  ["A nearby and established export region for food ingredients, animal nutrition products and industrial chemicals.", "Región cercana y consolidada para exportar ingredientes alimentarios, productos de nutrición animal y químicos industriales."],
  ["The regions above summarize established market coverage and are not a complete country-by-country list.", "Estas regiones resumen nuestra cobertura comercial consolidada y no constituyen una lista completa por países."],
  ["Productos exported", "Productos exportados"],
  ["We organize export supply by end-use sector so buyers can evaluate products in the context of their formulation or process.", "Organizamos el suministro por sector de uso final para que el comprador evalúe cada producto en el contexto de su formulación o proceso."],
  ["Food-grade phosphates, acidulants, preservatives, texturizers and other functional ingredients.", "Fosfatos alimentarios, acidulantes, conservantes, texturizantes y otros ingredientes funcionales."],
  ["Explore food ingredients", "Ver ingredientes alimentarios"],
  ["Feed Additives", "Aditivos para piensos"],
  ["Feed-grade phosphates and selected nutritional additives for animal nutrition applications.", "Fosfatos para piensos y aditivos nutricionales seleccionados para nutrición animal."],
  ["Explore animal nutrition", "Ver productos de nutrición animal"],
  ["Productos for water treatment, industrial cleaning, mining and agricultural applications.", "Productos para tratamiento de aguas, limpieza industrial, minería y aplicaciones agrícolas."],
  ["Explore industrial products", "Ver productos industriales"],
  ["Export infrastructure", "Infraestructura de exportación"],
  ["Distribution support in major Chinese coastal cities helps connect production resources with warehousing, container loading and port dispatch.", "El apoyo de distribución en las principales ciudades costeras chinas conecta los recursos productivos con el almacenamiento, la carga de contenedores y el despacho portuario."],
  ["Chemical products organized in a warehouse for export supply", "Productos químicos almacenados y preparados para exportación"],
  ["Distribution &amp; Storage", "Distribución y almacenamiento"],
  ["Coastal distribution support adds flexibility when coordinating stock, orders and outbound handling.", "La distribución costera aporta flexibilidad para coordinar existencias, pedidos y expediciones."],
  ["Packaged chemical products prepared for outbound loading", "Productos químicos embalados y preparados para expedición"],
  ["Order Preparation", "Preparación de pedidos"],
  ["Packaging and loading arrangements are aligned with the product, order size and shipment plan.", "El embalaje y la carga se adaptan al producto, al volumen del pedido y al plan de transporte."],
  ["International shipping port supporting chemical export freight", "Puerto internacional para exportación de productos químicos"],
  ["Port Dispatch", "Despacho portuario"],
  ["Export shipments are coordinated through suitable Chinese port and freight channels.", "Los envíos se coordinan mediante los puertos y canales de transporte chinos adecuados."],
  ["How we support buyers", "Cómo ayudamos al comprador"],
  ["Una ruta clara desde la consulta hasta la exportacion", "Una ruta clara desde la consulta hasta la exportación"],
  ["Providing complete requirements at the start helps our team assess the right product and supply route more efficiently.", "Facilitar requisitos completos desde el inicio permite evaluar con mayor rapidez el producto y la vía de suministro adecuados."],
  ["Start an Inquiry", "Iniciar una consulta"],
  ["Share your requirements", "Indique sus requisitos"],
  ["Product, grade, specification, quantity, packaging and destination market.", "Producto, grado, especificación, cantidad, embalaje y mercado de destino."],
  ["Confirm product and documents", "Confirmar producto y documentos"],
  ["Review the proposed supply option, available specifications and supporting documentation.", "Revisar la opción propuesta, las especificaciones disponibles y la documentación de respaldo."],
  ["Agree commercial details", "Acordar las condiciones comerciales"],
  ["Confirm pricing, packing, order terms and the planned shipment arrangement.", "Confirmar precio, embalaje, condiciones del pedido y transporte previsto."],
  ["Prepare and dispatch", "Preparar y despachar"],
  ["Coordinate production or stock, quality checks, export documents, loading and shipment.", "Coordinar producción o existencias, controles de calidad, documentos, carga y transporte."],
  ["International supply FAQ", "Preguntas sobre suministro internacional"],
  ["Short answers for overseas buyers evaluating Bespring as an ingredient or chemical supplier.", "Respuestas para compradores internacionales que evalúan a Bespring como proveedor de ingredientes o productos químicos."],
  ["How many countries does Bespring Chemical serve?", "¿A cuántos países suministra Bespring Chemical?"],
  ["We supply customers in more than 60 countries across Europe, the Americas, the Middle East, Southeast Asia and other regions.", "Suministramos a clientes de más de 60 países de Europa, América, Oriente Medio, el Sudeste Asiático y otras regiones."],
  ["What products does Bespring export?", "¿Qué productos exporta Bespring?"],
  ["We export phosphates, food ingredients, feed additives and selected chemicals for water treatment, industrial cleaning, mining and agriculture.", "Exportamos fosfatos, ingredientes alimentarios, aditivos para piensos y productos seleccionados para tratamiento de aguas, limpieza industrial, minería y agricultura."],
  ["Can Bespring support export documentation and packaging?", "¿Puede Bespring gestionar la documentación y el embalaje de exportación?"],
  ["Yes. We coordinate available product documentation, packaging requirements and shipment details according to the product, order and destination market.", "Sí. Coordinamos la documentación disponible, el embalaje y los detalles de envío según el producto, el pedido y el mercado."],
  ["How can I request a quotation?", "¿Cómo puedo solicitar una cotización?"],
  ["Send us the product name, grade, specification, quantity, packaging and destination port or country. Our export team will assess the supply options and respond with the relevant commercial details.", "Envíenos el nombre, grado, especificación, cantidad, embalaje y puerto o país de destino. Nuestro equipo evaluará las opciones y responderá con la información comercial correspondiente."],
  ["Your market, our supply support", "Su mercado, nuestro apoyo de suministro"],
  ["Busca un proveedor de exportacion confiable desde China?", "¿Busca un proveedor de exportación fiable en China?"],
  ["Diganos que necesita and where it is going. Our team will help assess product and shipment options.", "Díganos qué necesita y el destino. Nuestro equipo evaluará las opciones de producto y transporte."],
  ["Solicitar cotizacion", "Solicitar cotización"]
];

const coreValues = [
  ["Valores centrales: calidad, integridad y cooperacion | Bespring", "Valores corporativos: calidad, integridad y colaboración | Bespring"],
  ["Valores centrales", "Valores corporativos"],
  ["Los principios detras de nuestra forma de trabajar", "Los principios que guían nuestra forma de trabajar"],
  ["Quality, integrity, cooperation and responsible development guide how Bespring evaluates products, communicates with buyers and builds long-term supply relationships.", "La calidad, la integridad, la colaboración y el desarrollo responsable guían nuestra evaluación de productos, la comunicación con compradores y las relaciones de suministro a largo plazo."],
  ["Start a Conversation", "Iniciar una conversación"],
  ["About Bespring", "Sobre Bespring"],
  ["Values in practice", "Valores en la práctica"],
  ["Estandares para decisiones diarias, no solo frases en la pared", "Criterios para las decisiones diarias, no simples eslóganes"],
  ["Bespring Chemical鈥檚 core values are Quality First, Integrity, Win-Win Cooperation and Sustainability.", "Los valores de Bespring Chemical son calidad ante todo, integridad, colaboración beneficiosa y sostenibilidad."],
  ["These principles shape how we review a product inquiry, select supply resources, present documentation, coordinate exports and respond when circumstances change.", "Estos principios determinan cómo revisamos una consulta, seleccionamos recursos, presentamos documentos, coordinamos exportaciones y respondemos ante cambios."],
  ["For customers, our values should be visible in practical details: clearer information, realistic commitments, relevant documents and a willingness to work through problems constructively.", "Para el cliente, nuestros valores se reflejan en información clara, compromisos realistas, documentos pertinentes y disposición para resolver problemas de forma constructiva."],
  ["People joining hands to represent teamwork and shared responsibility", "Personas uniendo sus manos como símbolo de trabajo en equipo y responsabilidad compartida"],
  ["Shared standards for long-term cooperation", "Criterios compartidos para colaborar a largo plazo"],
  ["Our four principles", "Nuestros cuatro principios"],
  ["Que significan nuestros valores en los negocios", "Qué significan nuestros valores en la actividad empresarial"],
  ["Each value translates into actions that customers and supply partners can reasonably expect from our team.", "Cada valor se traduce en acciones concretas que clientes y socios pueden esperar de nuestro equipo."],
  ["Quality First", "Calidad ante todo"],
  ["Quality begins with a precise definition of what is required鈥攏ot a generic claim that one product fits every market.", "La calidad comienza por definir con precisión los requisitos, no por afirmar de forma genérica que un producto sirve para todos los mercados."],
  ["Confirm grade, specification and application", "Confirmar grado, especificación y aplicación"],
  ["Review applicable product and batch documents", "Revisar los documentos aplicables al producto y al lote"],
  ["Align acceptance with agreed requirements", "Ajustar la aceptación a los requisitos acordados"],
  ["Integrity", "Integridad"],
  ["Trust depends on communicating what we know, what we can support and what still needs verification.", "La confianza exige comunicar lo que sabemos, lo que podemos respaldar y lo que aún debe verificarse."],
  ["Describe product sources and scope clearly", "Describir con claridad el origen y el alcance"],
  ["State document validity and limitations", "Indicar vigencia y limitaciones de los documentos"],
  ["Use realistic commercial commitments", "Asumir compromisos comerciales realistas"],
  ["Win-Win Cooperation", "Colaboración beneficiosa"],
  ["Strong supply relationships should create durable value for buyers, production partners and Bespring.", "Una relación sólida debe crear valor duradero para compradores, socios de producción y Bespring."],
  ["Understand the customer鈥檚 real application", "Comprender la aplicación real del cliente"],
  ["Coordinate practical supply solutions", "Coordinar soluciones prácticas de suministro"],
  ["Improve through long-term feedback", "Mejorar mediante comentarios a largo plazo"],
  ["Sustainability", "Sostenibilidad"],
  ["Responsible development means supporting steady improvement rather than making unsupported environmental promises.", "El desarrollo responsable implica apoyar mejoras constantes, sin formular promesas ambientales sin fundamento."],
  ["Encourage process and resource efficiency", "Fomentar la eficiencia de procesos y recursos"],
  ["Support safer handling and storage", "Promover una manipulación y almacenamiento seguros"],
  ["Consider long-term operational impact", "Considerar el impacto operativo a largo plazo"],
  ["The buyer experience", "La experiencia del comprador"],
  ["Como estos principios influyen en un pedido", "Cómo influyen estos principios en un pedido"],
  ["Values matter most when they influence the details of real work.", "Los valores importan cuando se reflejan en los detalles del trabajo real."],
  ["At inquiry", "Durante la consulta"],
  ["We ask about grade, application, specification, quantity, documents and destination instead of assuming one standard offer fits all buyers.", "Preguntamos por grado, aplicación, especificación, cantidad, documentos y destino, sin suponer que una oferta estándar sirve para todos."],
  ["During evaluation", "Durante la evaluación"],
  ["We distinguish reference information from contractual specifications and identify which certificates or documents require current verification.", "Distinguimos la información de referencia de las especificaciones contractuales e identificamos qué certificados requieren verificación vigente."],
  ["Before dispatch", "Antes del despacho"],
  ["We coordinate packaging, batch information, available documents and shipment details against the agreed order.", "Coordinamos embalaje, lotes, documentos disponibles y transporte conforme al pedido acordado."],
  ["After delivery", "Después de la entrega"],
  ["We welcome specific feedback and use it to improve communication, future orders and long-term cooperation.", "Agradecemos los comentarios concretos y los usamos para mejorar la comunicación, futuros pedidos y la colaboración."],
  ["Our decision standard", "Nuestros criterios de decisión"],
  ["Cuatro preguntas que mantienen nuestros valores practicos", "Cuatro preguntas para aplicar nuestros valores"],
  ["When evaluating a product, document or commitment, these questions help keep decisions grounded.", "Estas preguntas ayudan a tomar decisiones fundamentadas al evaluar un producto, documento o compromiso."],
  ["Can we verify it?", "¿Podemos verificarlo?"],
  ["Claims should be supported by relevant information or current documentation.", "Las afirmaciones deben respaldarse con información pertinente o documentación vigente."],
  ["Is the scope clear?", "¿Está claro el alcance?"],
  ["The product, grade, source, document and responsibility should be understood.", "El producto, grado, origen, documento y responsabilidad deben quedar claros."],
  ["Is it fair to all sides?", "¿Es justo para todas las partes?"],
  ["A workable agreement must respect both customer needs and supply realities.", "Un acuerdo viable debe respetar las necesidades del cliente y la realidad del suministro."],
  ["Will it support the long term?", "¿Funcionará a largo plazo?"],
  ["Short-term decisions should not undermine reliability or future cooperation.", "Las decisiones a corto plazo no deben perjudicar la fiabilidad ni la colaboración futura."],
  ["Historic photographs of Pizhou Second Chemical Plant in 1986 and 1998", "Fotografías históricas de la Planta Química n.º 2 de Pizhou en 1986 y 1998"],
  ["Built over time", "Construidos con el tiempo"],
  ["Experiencia formada durante decadas en la industria quimica", "Experiencia forjada durante décadas en la industria química"],
  ["Bespring鈥檚 roots reach back to the former Pizhou No. 2 Chemical Plant. Over decades, products, markets and business models have changed, but dependable work has continued to rely on technical attention, honest communication and relationships that can withstand challenges.", "Los orígenes de Bespring se remontan a la antigua Planta Química n.º 2 de Pizhou. Los productos, mercados y modelos han cambiado, pero el trabajo fiable sigue basándose en rigor técnico, comunicación honesta y relaciones capaces de superar dificultades."],
  ["Our values connect that industrial heritage with the expectations of today鈥檚 international buyers: clearer evidence, better-defined scope and more responsible supply decisions.", "Nuestros valores conectan esa trayectoria industrial con las expectativas actuales: pruebas más claras, alcance mejor definido y decisiones de suministro más responsables."],
  ["Read our company profile", "Leer nuestro perfil corporativo"],
  ["About Bespring鈥檚 core values", "Preguntas sobre los valores de Bespring"],
  ["What our principles mean for customers, documents and responsible supply.", "Qué significan nuestros principios para el cliente, la documentación y el suministro responsable."],
  ["What are Bespring Chemical鈥檚 core values?", "¿Cuáles son los valores de Bespring Chemical?"],
  ["Our four core values are Quality First, Integrity, Win-Win Cooperation and Sustainability.", "Nuestros cuatro valores son calidad ante todo, integridad, colaboración beneficiosa y sostenibilidad."],
  ["What does Quality First mean at Bespring?", "¿Qué significa «calidad ante todo» en Bespring?"],
  ["It means confirming the product, grade, specification, documentation and acceptance requirements, then aligning the offered supply with those agreed requirements.", "Significa confirmar producto, grado, especificación, documentación y criterios de aceptación, y ajustar el suministro a esos requisitos."],
  ["How does Bespring apply integrity in international trade?", "¿Cómo aplica Bespring la integridad en el comercio internacional?"],
  ["We aim to communicate product sources, document scope, certificate validity, availability and supply limitations clearly so buyers can make informed decisions.", "Comunicamos con claridad el origen, alcance documental, vigencia de certificados, disponibilidad y limitaciones para que el comprador decida con información."],
  ["How does sustainability influence Bespring鈥檚 supply approach?", "¿Cómo influye la sostenibilidad en el suministro de Bespring?"],
  ["We support ongoing attention to process optimization, energy and material efficiency, environmental facilities, safer handling and responsible long-term supply.", "Apoyamos la optimización de procesos, la eficiencia energética y material, las instalaciones ambientales, la manipulación segura y el suministro responsable."],
  ["Build a practical partnership", "Construyamos una colaboración práctica"],
  ["Busca un proveedor que se comunique con claridad?", "¿Busca un proveedor que se comunique con claridad?"],
  ["Share your product, quality, documentation and destination requirements with our export team.", "Comparta con nuestro equipo sus requisitos de producto, calidad, documentación y destino."],
  ["View Productos", "Ver productos"]
];

const certifications = [
  ["Certificaciones de calidad y cumplimiento | Bespring Chemical", "Certificaciones de calidad y documentos de cumplimiento | Bespring"],
  ["Quality &amp; Compliance", "Calidad y cumplimiento"],
  ["Certificaciones and Compliance Documents", "Certificaciones y documentos de cumplimiento"],
  ["Transparent document support for buyers evaluating quality systems, product suitability and destination-market requirements.", "Documentación transparente para compradores que evalúan sistemas de calidad, idoneidad del producto y requisitos del mercado de destino."],
  ["Our document approach", "Nuestro enfoque documental"],
  ["Bespring provides quality-system, industry-membership and product-related compliance documents to support buyer qualification.", "Bespring facilita documentos de sistemas de calidad, afiliación sectorial y cumplimiento del producto para apoyar la homologación del proveedor."],
  ["A certificate is useful only when its legal entity, product or activity scope, production or packing site and validity period match the supply being evaluated. For that reason, we encourage buyers to request current documents for the exact product and source offered.", "Un certificado solo es útil si la entidad jurídica, el alcance, la planta de producción o envasado y la vigencia corresponden al suministro evaluado. Por ello recomendamos solicitar documentos vigentes para el producto y origen concretos."],
  ["The images on this page show documents held in Bespring鈥檚 records. Their current or archived status is stated individually below.", "Las imágenes muestran documentos archivados por Bespring. Su condición vigente o histórica se indica individualmente."],
  ["Document review principles", "Principios para revisar documentos"],
  ["Correct legal entity", "Entidad jurídica correcta"],
  ["Confirm whose operations or activities the document covers.", "Confirmar qué operaciones o actividades cubre el documento."],
  ["Product and site scope", "Alcance del producto y la planta"],
  ["Check the exact material and production or packing source.", "Comprobar el material y el origen de producción o envasado."],
  ["Current validity", "Vigencia actual"],
  ["Review issue, expiry and renewal information before approval.", "Revisar emisión, vencimiento y renovación antes de aprobar."],
  ["Market requirements", "Requisitos del mercado"],
  ["Compare documents with destination and customer requirements.", "Comparar los documentos con los requisitos del destino y del cliente."],
  ["Important certificate verification notice", "Aviso importante sobre verificación de certificados"],
  ["Website images are provided for preliminary review. Do not use them as the sole basis for regulatory, religious or supplier approval. Request a current, legible copy and verify its issuer, scope, site and validity for the exact offered supply.", "Las imágenes se facilitan para una revisión preliminar. No las utilice como única base para una aprobación regulatoria, religiosa o de proveedor. Solicite una copia vigente y legible, y verifique emisor, alcance, planta y vigencia."],
  ["Documents on file", "Documentos disponibles"],
  ["Registros de certificacion y membresia", "Certificados y registros de afiliación"],
  ["Each card identifies what the displayed document says and whether it should be treated as current or archived.", "Cada ficha indica el contenido del documento y si debe considerarse vigente o histórico."],
  ["Displayed as current", "Mostrado como vigente"],
  ["Open ISO 9001 certificate image", "Abrir imagen del certificado ISO 9001"],
  ["ISO 9001:2015 Quality Management System certificate for Bespring Chemical", "Certificado ISO 9001:2015 del sistema de gestión de calidad de Bespring Chemical"],
  ["View document", "Ver documento"],
  ["Quality management system", "Sistema de gestión de calidad"],
  ["The displayed certificate covers Bespring Chemical Co., Ltd. and the sales-service scope stated on the document.", "El certificado mostrado cubre a Bespring Chemical Co., Ltd. y el alcance de servicios comerciales indicado."],
  ["Displayed validity", "Vigencia indicada"],
  ["Buyer action", "Acción del comprador"],
  ["Request the latest signed copy", "Solicitar la última copia firmada"],
  ["Open food additives association membership certificate image", "Abrir imagen del certificado de afiliación a la asociación de aditivos alimentarios"],
  ["China Food Additives and Ingredients Association member unit certificate", "Certificado de miembro de la Asociación China de Aditivos e Ingredientes Alimentarios"],
  ["Industry membership", "Afiliación sectorial"],
  ["CFIA Member Unit", "Miembro de la CFIA"],
  ["The displayed certificate identifies Bespring as a member unit of the China Food Additives &amp; Ingredients Association.", "El certificado identifica a Bespring como miembro de la China Food Additives &amp; Ingredients Association."],
  ["Document type", "Tipo de documento"],
  ["Association membership", "Afiliación a la asociación"],
  ["Archived reference", "Referencia histórica"],
  ["Open archived Halal certificate image", "Abrir imagen del certificado Halal"],
  ["Archived Halal product certificate previously issued for listed Bespring products", "Certificado Halal emitido para productos Bespring incluidos en el documento"],
  ["Religious compliance document", "Documento de cumplimiento religioso"],
  ["Halal Certificate", "Certificado Halal"],
  ["This image is retained as a historical reference and must not be treated as evidence of current product coverage.", "Esta imagen se conserva como referencia histórica y no acredita por sí sola la cobertura vigente del producto."],
  ["Displayed expiry", "Vencimiento indicado"],
  ["Request current product/site scope", "Solicitar alcance vigente del producto y la planta"],
  ["Open archived Kosher certificate image", "Abrir imagen del certificado Kosher"],
  ["Archived Kosher certificate previously issued for listed Bespring products", "Certificado Kosher emitido para productos Bespring incluidos en el documento"],
  ["Kosher Certificate", "Certificado Kosher"],
  ["Product documentation", "Documentación del producto"],
  ["Available documents depend on the product, grade, production source and destination. Ask for the items relevant to your qualification process.", "Los documentos disponibles dependen del producto, grado, origen y destino. Solicite los pertinentes para su proceso de homologación."],
  ["Especificacion / Technical Data Sheet", "Especificación / Ficha técnica"],
  ["Product identity, reference parameters, applications and technical information for initial evaluation.", "Identidad, parámetros de referencia, aplicaciones e información técnica para la evaluación inicial."],
  ["Safety Data Sheet", "Ficha de datos de seguridad"],
  ["Handling, storage, hazard and workplace-control information applicable to the offered material.", "Información sobre manipulación, almacenamiento, peligros y control en el trabajo aplicable al material."],
  ["Certificate of Analysis", "Certificado de análisis"],
  ["Representative or batch-specific test results to compare with the mutually agreed specification.", "Resultados representativos o del lote para compararlos con la especificación acordada."],
  ["Applicable Certificates", "Certificados aplicables"],
  ["Current quality, food-safety or religious-compliance documents where available for the offered product and site.", "Documentos vigentes de calidad, seguridad alimentaria o cumplimiento religioso disponibles para el producto y la planta."],
  ["Procurement checklist", "Lista de verificación de compras"],
  ["A disciplined review prevents a valid-looking document from being applied to the wrong company, product, site or shipment.", "Una revisión rigurosa evita aplicar un documento aparentemente válido a la empresa, producto, planta o envío equivocados."],
  ["Entity", "Entidad"],
  ["Does the legal company name match the supplier or producer being approved?", "¿Coincide la razón social con el proveedor o fabricante que se homologa?"],
  ["Scope", "Alcance"],
  ["Does the stated activity or product scope cover the material you intend to buy?", "¿El alcance indicado cubre el material que desea comprar?"],
  ["Site", "Planta"],
  ["Is the relevant manufacturing or packing location included where required?", "¿Incluye la planta de fabricación o envasado pertinente?"],
  ["Validity", "Vigencia"],
  ["Are issue, expiry, renewal and suspension details current?", "¿Están actualizados los datos de emisión, vencimiento, renovación y suspensión?"],
  ["Issuer", "Emisor"],
  ["Can the document and certification body be independently verified?", "¿Pueden verificarse de forma independiente el documento y la entidad certificadora?"],
  ["Direct answers for quality, regulatory and procurement teams reviewing Bespring.", "Respuestas para equipos de calidad, asuntos regulatorios y compras que evalúan a Bespring."],
  ["Which displayed documents are currently within their stated validity period?", "¿Qué documentos mostrados se encuentran dentro de la vigencia indicada?"],
  ["The ISO 9001:2015 certificate shown states validity through 11 November 2026. The CFIA membership certificate shown states validity through March 2029. Always request current signed copies before supplier approval.", "El certificado ISO 9001:2015 mostrado indica vigencia hasta el 11 de noviembre de 2026. El certificado de afiliación CFIA indica vigencia hasta marzo de 2029. Solicite siempre copias vigentes y firmadas antes de homologar."],
  ["Does every certificate apply to every Bespring product?", "¿Todos los certificados se aplican a todos los productos de Bespring?"],
  ["No. Certificate scope may depend on the legal entity, product, production or packing site and validity period. Verify the exact offered supply.", "No. El alcance puede depender de la entidad, producto, planta y periodo de vigencia. Verifique el suministro concreto."],
  ["Are the displayed Halal and Kosher certificates current?", "¿Están vigentes los certificados Halal y Kosher mostrados?"],
  ["No. The displayed Halal and Kosher images are archived references with validity dates ending in 2024. Request current product- and site-specific documents before qualification.", "No. Las imágenes Halal y Kosher mostradas son referencias históricas cuya vigencia finalizó en 2024. Solicite documentos vigentes específicos del producto y la planta."],
  ["What quality documents can buyers request?", "¿Qué documentos de calidad puede solicitar el comprador?"],
  ["Depending on the offered product, buyers may request a current specification, TDS, SDS, representative or batch COA and applicable quality, food-safety or religious-compliance documents.", "Según el producto, pueden solicitarse especificación vigente, TDS, SDS, COA representativo o del lote y documentos aplicables de calidad, seguridad alimentaria o cumplimiento religioso."],
  ["Need documents for qualification?", "¿Necesita documentos para la homologación?"],
  ["Include the product, grade, application, required standard, destination country and intended production source if known.", "Indique producto, grado, aplicación, norma requerida, país de destino y origen de producción previsto, si lo conoce."]
];

const allReplacements = [...shared, ...companyProfile, ...productionBases, ...globalMarkets, ...coreValues, ...certifications]
  .sort((a, b) => b[0].length - a[0].length);

const unicodeCleanup = [
  ["Which markets does Bespring serve?", "¿A qué mercados suministra Bespring?"],
  ["Bespring’s home province and a key base for customer coordination, production resources and access to eastern China’s export infrastructure.", "Provincia de origen de Bespring y base clave para coordinar clientes, recursos productivos y acceso a la infraestructura exportadora del este de China."],
  ["A cooperative production region connected to one of China’s established chemical manufacturing and port logistics clusters.", "Región productiva colaboradora conectada con uno de los principales polos químicos y logísticos portuarios de China."],
  ["A cooperative production region that broadens the network’s geographic reach and access to inland manufacturing resources.", "Región productiva colaboradora que amplía el alcance geográfico de la red y el acceso a recursos industriales del interior."],
  ["Packaging, loading and shipment details are coordinated for the customer’s order and destination.", "El embalaje, la carga y el transporte se coordinan según el pedido y el destino del cliente."],
  ["Where are Bespring Chemical’s production bases?", "¿Dónde se encuentran las bases de producción de Bespring Chemical?"],
  ["Explore Bespring Chemical’s cooperative production network across Jiangsu, Shandong, Sichuan and Hainan, supporting food, feed and industrial supply.", "Conozca la red de producción colaboradora de Bespring en Jiangsu, Shandong, Sichuan y Hainan para el suministro alimentario, de piensos e industrial."],
  ["A cooperative manufacturing network supporting reliable supply of food ingredients, feed additives and industrial chemicals.", "Red de fabricación colaboradora para el suministro fiable de ingredientes alimentarios, aditivos para piensos y productos químicos industriales."],
  ["Bespring Chemical production and warehouse facilities in China", "Instalaciones de producción y almacenamiento de Bespring Chemical en China"],
  ["See how Bespring’s cooperative production network supports quality control, warehousing and international supply.", "Conozca cómo la red productiva colaboradora de Bespring respalda el control de calidad, almacenamiento y suministro internacional."],
  ["Production, packing, warehouse and container loading scenes from Bespring’s supply network", "Producción, envasado, almacenamiento y carga de contenedores en la red de suministro de Bespring"],
  ["Bespring connects China’s ingredient and chemical supply network with food, feed and industrial customers across key international markets.", "Bespring conecta la red china de ingredientes y productos químicos con clientes de alimentación, piensos e industria en mercados internacionales clave."],
  ["Bespring Chemical exports food ingredients, feed additives and industrial chemicals from China to customers in 60+ countries across key global regions.", "Bespring Chemical exporta desde China ingredientes alimentarios, aditivos para piensos y productos químicos industriales a clientes de más de 60 países."],
  ["Serving food, feed and industrial customers in more than 60 countries through coordinated sourcing and export supply from China.", "Abastecimiento coordinado desde China para clientes de alimentación, piensos e industria en más de 60 países."],
  ["Bespring Chemical international export and logistics network", "Red internacional de exportación y logística de Bespring Chemical"],
  ["Ingredientes alimentarios, feed additives and industrial chemicals supplied from China to customers in 60+ countries.", "Ingredientes alimentarios, aditivos para piensos y productos químicos industriales suministrados desde China a más de 60 países."],
  ["The images on this page show documents held in Bespring’s records. Their current or archived status is stated individually below.", "Las imágenes muestran documentos archivados por Bespring. Su condición vigente o histórica se indica individualmente."],
  ["Review Bespring Chemical’s ISO 9001 quality certification, industry membership and reference Halal and Kosher documents, with clear scope and validity notes.", "Consulte la certificación ISO 9001, afiliación sectorial y documentos Halal y Kosher de referencia de Bespring, con notas claras sobre alcance y vigencia."],
  ["Quality Certificaciones &amp; Compliance | Bespring Chemical", "Certificaciones de calidad y cumplimiento | Bespring Chemical"],
  ["View quality and industry documents with transparent notes on certificate scope, validity and product-specific verification.", "Consulte documentos de calidad y sectoriales con información transparente sobre alcance, vigencia y verificación por producto."],
  ["Bespring Chemical certification and compliance documents", "Certificaciones y documentos de cumplimiento de Bespring Chemical"],
  ["ISO 9001, industry membership and product-specific compliance document guidance for international buyers.", "Información sobre ISO 9001, afiliación sectorial y documentos de cumplimiento por producto para compradores internacionales."],
  ["Bespring Chemical’s core values are Calidad ante todo, Integridad, Colaboración beneficiosa and Sostenibilidad.", "Los valores de Bespring Chemical son calidad ante todo, integridad, colaboración beneficiosa y sostenibilidad."],
  ["Quality begins with a precise definition of what is required—not a generic claim that one product fits every market.", "La calidad comienza por definir con precisión los requisitos, no por afirmar de forma genérica que un producto sirve para todos los mercados."],
  ["Understand the customer’s real application", "Comprender la aplicación real del cliente"],
  ["Bespring’s roots reach back to the former Pizhou No. 2 Chemical Plant. Over decades, products, markets and business models have changed, but dependable work has continued to rely on technical attention, honest communication and relationships that can withstand challenges.", "Los orígenes de Bespring se remontan a la antigua Planta Química n.º 2 de Pizhou. Los productos, mercados y modelos han cambiado, pero el trabajo fiable sigue basándose en rigor técnico, comunicación honesta y relaciones capaces de superar dificultades."],
  ["Our values connect that industrial heritage with the expectations of today’s international buyers: clearer evidence, better-defined scope and more responsible supply decisions.", "Nuestros valores conectan esa trayectoria industrial con las expectativas actuales: pruebas más claras, alcance mejor definido y decisiones de suministro más responsables."],
  ["What are Bespring Chemical’s core values?", "¿Cuáles son los valores de Bespring Chemical?"],
  ["How does sustainability influence Bespring’s supply approach?", "¿Cómo influye la sostenibilidad en el suministro de Bespring?"],
  ["Discover how Bespring Chemical applies quality, integrity, win-win cooperation and sustainability to sourcing, documentation and international supply.", "Descubra cómo Bespring aplica calidad, integridad, colaboración y sostenibilidad al abastecimiento, la documentación y el suministro internacional."],
  ["Valores corporativos: Quality, Integridad &amp; Partnership | Bespring", "Valores corporativos: calidad, integridad y colaboración | Bespring"],
  ["See how Bespring turns four core values into practical standards for product sourcing, documentation, service and long-term cooperation.", "Conozca cómo Bespring convierte sus cuatro valores en criterios prácticos de abastecimiento, documentación, servicio y colaboración a largo plazo."],
  ["Quality, integrity, cooperation and responsible development guide how Bespring supports global customers.", "Calidad, integridad, colaboración y desarrollo responsable guían la atención de Bespring a sus clientes internacionales."],
  ["El certificado identifica a Bespring como miembro de la China Food Additives &amp; Ingredients Association.", "El certificado identifica a Bespring como miembro de la Asociación China de Aditivos e Ingredientes Alimentarios."]
  ,["Bespring Chemical’s cooperative production network across Jiangsu, Shandong, Sichuan and Hainan.", "Red de producción colaboradora de Bespring Chemical en Jiangsu, Shandong, Sichuan y Hainan."]
  ,["Bespring Chemical cooperative production regions", "Regiones de producción colaboradoras de Bespring Chemical"]
  ,["Jiangsu production base", "Base de producción de Jiangsu"]
  ,["Shandong production base", "Base de producción de Shandong"]
  ,["Sichuan production base", "Base de producción de Sichuan"]
  ,["Hainan production base", "Base de producción de Hainan"]
  ,["Bespring operates through a cooperative production network. Its team coordinates product requirements, quality documentation and export supply with selected production partners.", "Bespring opera mediante una red productiva colaboradora. Su equipo coordina requisitos, documentación de calidad y exportación con socios de producción seleccionados."]
  ,["What products does the production network support?", "¿Qué productos cubre la red de producción?"]
  ,["Bespring Chemical’s international market coverage and export supply capabilities for food, feed and industrial customers.", "Cobertura internacional y capacidad exportadora de Bespring Chemical para clientes de alimentación, piensos e industria."]
  ,["International port and chemical export supply chain", "Cadena portuaria internacional para exportación de productos químicos"]
  ,["Bespring Chemical supplies customers in more than 60 countries across Europa, the Americas, the Oriente Medio, Sudeste Asiático and other regions.", "Bespring Chemical suministra a clientes de más de 60 países de Europa, América, Oriente Medio, el Sudeste Asiático y otras regiones."]
  ,["Bespring exports phosphates, food ingredients, feed additives and selected chemicals for water treatment, industrial cleaning, mining and agriculture.", "Bespring exporta fosfatos, ingredientes alimentarios, aditivos para piensos y productos seleccionados para tratamiento de aguas, limpieza industrial, minería y agricultura."]
  ,["Bespring coordinates available product documentation, packaging requirements and shipment details according to the product, order and destination market.", "Bespring coordina la documentación disponible, el embalaje y el transporte según el producto, el pedido y el mercado de destino."]
  ,["How can an international buyer request a quotation?", "¿Cómo puede un comprador internacional solicitar una cotización?"]
  ,["Buyers can contact Bespring with the product name, grade, specification, quantity, packaging and destination port or country for a supply assessment and quotation.", "El comprador puede enviar a Bespring el nombre, grado, especificación, cantidad, embalaje y puerto o país de destino para recibir una evaluación y cotización."]
  ,["quality and sales documentation", "documentación de calidad y comercial"]
  ,["Quality Certificaciones & Compliance | Bespring Chemical", "Certificaciones de calidad y cumplimiento | Bespring Chemical"]
  ,["Quality certification, industry membership and product-specific compliance document information for Bespring Chemical buyers.", "Información sobre certificaciones de calidad, afiliación sectorial y documentos de cumplimiento por producto para compradores de Bespring Chemical."]
  ,["Bespring Chemical certification and membership documents", "Certificaciones y documentos de afiliación de Bespring Chemical"]
  ,["ISO 9001:2015 Quality Management System Certificate", "Certificado del sistema de gestión de calidad ISO 9001:2015"]
  ,["Displayed certificate for Bespring Chemical Co., Ltd. covering the stated sales-service scope, valid from November 12, 2023 through November 11, 2026.", "Certificado mostrado de Bespring Chemical Co., Ltd. para el alcance de servicios comerciales indicado, vigente del 12 de noviembre de 2023 al 11 de noviembre de 2026."]
  ,["China Food Additives & Ingredients Association Member Unit Certificate", "Certificado de miembro de la Asociación China de Aditivos e Ingredientes Alimentarios"]
  ,["Displayed industry membership document with a stated validity period from April 2024 through March 2029.", "Documento de afiliación sectorial con vigencia indicada de abril de 2024 a marzo de 2029."]
  ,["Halal Product Certificate - archived reference", "Certificado de producto Halal: referencia histórica"]
  ,["Referencia histórica image with a displayed validity date ending December 19, 2024. Buyers should request current product- and site-specific documentation.", "Imagen de referencia histórica con vigencia indicada hasta el 19 de diciembre de 2024. El comprador debe solicitar documentación vigente para el producto y la planta."]
  ,["Referencia histórica image with a displayed validity date ending December 1, 2024. Buyers should request current product- and site-specific documentation.", "Imagen de referencia histórica con vigencia indicada hasta el 1 de diciembre de 2024. El comprador debe solicitar documentación vigente para el producto y la planta."]
  ,["Which Bespring Chemical documents are currently shown as valid?", "¿Qué documentos de Bespring Chemical se muestran actualmente como vigentes?"]
  ,["The displayed ISO 9001:2015 certificate states validity through November 11, 2026, and the displayed China Food Additives & Ingredients Afiliación a la asociación states validity through March 2029. Buyers should still request current signed copies before approval.", "El certificado ISO 9001:2015 mostrado indica vigencia hasta el 11 de noviembre de 2026 y el documento de afiliación CFIA hasta marzo de 2029. Deben solicitarse copias vigentes y firmadas antes de la homologación."]
  ,["No. Certificate scope may depend on the legal entity, product, production or packing site and validity period. Buyers should verify the exact offered supply.", "No. El alcance puede depender de la entidad jurídica, el producto, la planta de producción o envasado y la vigencia. El comprador debe verificar el suministro concreto."]
  ,["The displayed Halal and Kosher images are archived reference documents with validity dates ending in 2024. Request current product- and site-specific documents from Bespring before qualification.", "Las imágenes Halal y Kosher son referencias históricas cuya vigencia finalizó en 2024. Solicite a Bespring documentos vigentes específicos del producto y la planta antes de homologar."]
  ,["Depending on the offered product, buyers may request a current specification, technical data sheet, safety data sheet, batch certificate of analysis and applicable quality or religious-compliance documents.", "Según el producto, pueden solicitarse especificación vigente, ficha técnica, ficha de seguridad, certificado de análisis del lote y documentos aplicables de calidad o cumplimiento religioso."]
  ,["Quality, integrity, cooperation and responsible development", "Calidad, integridad, colaboración y desarrollo responsable"]
  ,["Chemical supply", "Suministro de productos químicos"]
  ,["Quality documentation", "Documentación de calidad"]
  ,["Valores corporativos: Quality, Integridad & Partnership | Bespring", "Valores corporativos: calidad, integridad y colaboración | Bespring"]
  ,["How Bespring Chemical applies quality, integrity, win-win cooperation and sustainability in its supply relationships.", "Cómo aplica Bespring Chemical la calidad, la integridad, la colaboración y la sostenibilidad en sus relaciones de suministro."]
  ,["Define requirements clearly, review applicable documents and align supply with agreed specifications.", "Definir los requisitos con claridad, revisar los documentos aplicables y ajustar el suministro a las especificaciones acordadas."]
  ,["Communicate product source, document scope, availability and limitations transparently.", "Comunicar con transparencia el origen, alcance documental, disponibilidad y limitaciones."]
  ,["Build practical long-term relationships that create value for customers and supply partners.", "Construir relaciones prácticas a largo plazo que aporten valor a clientes y socios de suministro."]
  ,["Support process improvement, efficient resource use, safer handling and responsible development.", "Apoyar la mejora de procesos, el uso eficiente de recursos, la manipulación segura y el desarrollo responsable."]
  ,["Bespring Chemical’s four core values are Calidad ante todo, Integridad, Colaboración beneficiosa and Sostenibilidad.", "Los cuatro valores de Bespring Chemical son calidad ante todo, integridad, colaboración beneficiosa y sostenibilidad."]
  ,["Calidad ante todo means confirming product, grade, specification, documentation and acceptance requirements, then aligning the offered supply with those agreed requirements.", "Calidad ante todo significa confirmar producto, grado, especificación, documentación y criterios de aceptación, y ajustar el suministro a los requisitos acordados."]
  ,["Bespring aims to communicate product sources, document scope, certificate validity, availability and supply limitations clearly so buyers can make informed decisions.", "Bespring comunica con claridad el origen, alcance documental, vigencia de certificados, disponibilidad y limitaciones para que el comprador decida con información."]
  ,["Bespring supports ongoing attention to process optimization, energy and material efficiency, environmental facilities, safer handling and responsible long-term supply.", "Bespring apoya la optimización de procesos, la eficiencia energética y material, las instalaciones ambientales, la manipulación segura y el suministro responsable a largo plazo."]
  ,["Teamwork representing Bespring Chemical’s core values", "Trabajo en equipo como representación de los valores de Bespring Chemical"]
  ,["Mercados globales & Chemical Exports | Bespring Chemical", "Mercados globales y exportación química | Bespring Chemical"]
  ,["Bases de producción in China | Bespring Chemical", "Bases de producción en China | Bespring Chemical"]
  ,["Certificaciones de calidad y documentos de cumplimiento | Bespring", "Certificaciones y cumplimiento de calidad | Bespring"]
  ,["Valores corporativos: calidad, integridad y colaboración | Bespring", "Valores corporativos de Bespring: calidad e integridad"]
  ,["Exportación de ingredientes químicos a más de 60 países | Bespring", "Exportador de ingredientes químicos a más de 60 países"]
  ,["Bespring Chemical es un proveedor chino de fosfatos, ingredientes alimentarios, aditivos para piensos y productos químicos industriales con clientes en más de 60 países.", "Proveedor chino de fosfatos, ingredientes alimentarios, aditivos para piensos y productos químicos, presente en más de 60 países."]
].sort((a, b) => b[0].length - a[0].length);

for (const page of pages) {
  const file = path.join(directory, page);
  let html = await readFile(file, "utf8");
  for (const [from, to] of allReplacements) html = html.replaceAll(from, to);
  for (const [from, to] of unicodeCleanup) html = html.replaceAll(from, to);
  html = html.replaceAll('"@type": "WebPlanta"', '"@type": "WebSite"');
  if (page === "certifications.html") {
    html = html
      .replaceAll("12 Nov 2025鈥?1 Nov 2028", "12 nov 2025–11 nov 2028")
      .replaceAll("12 Nov 2025–11 Nov 2028", "12 nov 2025–11 nov 2028")
      .replaceAll("Apr 2024鈥揗ar 2029", "abr 2024–mar 2029")
      .replaceAll("Apr 2024–Mar 2029", "abr 2024–mar 2029")
      .replaceAll("19 Dec 2026", "19 dic 2026")
      .replaceAll("1 Dec 2026", "1 dic 2026")
      .replaceAll("<dd>19 dic 2024</dd>", "<dd>19 dic 2026</dd>")
      .replaceAll("<dd>1 dic 2024</dd>", "<dd>1 dic 2026</dd>")
      .replaceAll("vigente del 12 de noviembre de 2025 al 11 de noviembre de 2028.", "vigente del 12 de noviembre de 2023 al 11 de noviembre de 2026.")
      .replaceAll("hasta el 11 de noviembre de 2028 y el documento de afiliación CFIA", "hasta el 11 de noviembre de 2026 y el documento de afiliación CFIA")
      .replaceAll("hasta el 11 de noviembre de 2028. El certificado de afiliación CFIA", "hasta el 11 de noviembre de 2026. El certificado de afiliación CFIA")
      .replace(
        /<span class="ct-status ct-status--archived"><i class="fas fa-clock-rotate-left" aria-hidden="true"><\/i> Referencia histórica<\/span>(\s*<a href="\.\.\/\.\.\/images\/certifications\/halal-certified-bespring-chemical\.png")/,
        '<span class="ct-status ct-status--current"><i class="fas fa-circle-check" aria-hidden="true"></i> Mostrado como vigente</span>$1'
      )
      .replace(
        /<span class="ct-status ct-status--archived"><i class="fas fa-clock-rotate-left" aria-hidden="true"><\/i> Referencia histórica<\/span>(\s*<a href="\.\.\/\.\.\/images\/certifications\/kosher-certified-bespring-chemical\.jpg")/,
        '<span class="ct-status ct-status--current"><i class="fas fa-circle-check" aria-hidden="true"></i> Mostrado como vigente</span>$1'
      );
  }

  const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const jsonLdValues = [];
  const collectJsonStrings = (value) => {
    if (typeof value === "string") jsonLdValues.push(value);
    else if (Array.isArray(value)) value.forEach(collectJsonStrings);
    else if (value && typeof value === "object") Object.values(value).forEach(collectJsonStrings);
  };
  for (const block of jsonLdBlocks) collectJsonStrings(JSON.parse(block[1]));

  const localReferences = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((value) => !/^(?:https?:|mailto:|tel:|#)/i.test(value))
    .map((value) => value.split(/[?#]/, 1)[0]);
  for (const reference of new Set(localReferences)) {
    await access(path.resolve(path.dirname(file), reference));
  }

  await writeFile(file, html, "utf8");
  console.log(`Translated and validated es/about/${page}`);

  const english = /\b(?:the|and|with|from|for|supplier|manufacturer|food|feed|water|processing|product|products|application|quality|export|industry|grade|current|document|documents|buyer|supply|market|production|requirements|review|support|company|about|our|what|how|where|which|does|can|before|after|during|displayed|certificate|network)\b/i;
  const withoutScripts = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "");
  const visibleStrings = [
    ...[...withoutScripts.matchAll(/>([^<>]+)</g)].map((match) => match[1].trim()),
    ...[...withoutScripts.matchAll(/(?:content|alt|aria-label|title)="([^"]+)"/g)].map((match) => match[1].trim())
  ].filter((value) => value && !/^https?:/i.test(value) && english.test(value));
  if (visibleStrings.length) {
    console.log("  Residual visible English:");
    for (const value of new Set(visibleStrings)) console.log(`  - ${value}`);
  }
  const jsonResiduals = jsonLdValues.filter((value) =>
    !/^(?:https?:|CN$|es$|\+\d)/i.test(value) &&
    !["Organization", "ImageObject", "PostalAddress", "ContactPoint", "AboutPage", "WebSite", "BreadcrumbList", "ListItem", "FAQPage", "Question", "Answer", "ItemList"].includes(value) &&
    english.test(value)
  );
  if (jsonResiduals.length) {
    console.log("  Residual JSON-LD English:");
    for (const value of new Set(jsonResiduals)) console.log(`  - ${value}`);
  }
}

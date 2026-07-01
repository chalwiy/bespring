import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const corePages = [
  "products.html", "services.html", "contact.html", "news.html",
  "products/food-ingredients.html", "products/animal-nutrition.html",
  "products/home-care-industrial-cleaning.html", "products/water-treatment.html",
  "products/mining.html", "products/agricultural-fertilizers.html"
];

const shared = [
  ["Bespring Chemical Co., Ltd. All rights reserved.", "Bespring Chemical Co., Ltd. Todos los derechos reservados."],
  ["Bespring Chemical home", "Inicio de Bespring Chemical"],
  ["Chemical name, grade, CAS or food/feed designation where applicable.", "Nombre químico, grado, número CAS o designación alimentaria/para piensos, cuando corresponda."],
  ["Target specification", "Especificación requerida"],
  ["Destination market, intended category and required documents.", "Mercado de destino, categoría de uso prevista y documentos requeridos."],
  ["Quantity, packing, port, shipment window and Incoterm.", "Cantidad, embalaje, puerto, periodo de envío e Incoterm."],
  ["Product identity", "Identidad del producto"],
  ["Required documents", "Documentos requeridos"],
  ["Certificate of Analysis", "Certificado de análisis"],
  ["Bespring Chemical", "Bespring Chemical"]
  ,["Contacte con Bespring Chemical en China para solicitar cotizaciones, muestras, documentos y apoyo de exportación de ingredientes alimentarios, aditivos para piensos, fosfatos y productos químicos industriales.", "Solicite cotizaciones, muestras y documentos de ingredientes alimentarios, aditivos para piensos, fosfatos y productos químicos desde China."]
  ,["Revision de especificaciones, coordinacion con proveedores, documentación, empaque, almacenaje y logistica de exportación para compradores de ingredientes alimentarios, piensos y químicos industriales.", "Revisión de especificaciones, documentos, embalaje y logística de exportación para compradores de ingredientes y productos químicos."]
  ,["Explore las gamas de ingredientes alimentarios, aditivos para piensos, limpieza, tratamiento de aguas, minería y materias primas para fertilizantes de Bespring Chemical.", "Explore ingredientes alimentarios, aditivos para piensos y materias primas para limpieza, tratamiento de aguas, minería y fertilizantes."]
  ,["Perspectivas de la industria química y noticias de la empresa | Bespring", "Guías para compradores químicos y noticias | Bespring"]
];

const productsPage = [
  ["Proveedor de ingredientes quimicos | Bespring Chemical", "Proveedor de ingredientes y materias primas químicas | Bespring"],
  ["Browse products by material portfolio, not by end-use application. Each category is structured to help procurement and technical teams identify a product, confirm grade and specification, and prepare an export inquiry.", "Explore los productos por familia de materiales. Cada categoría ayuda a los equipos de compras y técnicos a identificar el producto, confirmar grado y especificación, y preparar una consulta de exportación."],
  ["Assay, physical form and the limits critical to your process.", "Pureza, forma física y límites críticos para su proceso."],
  ["Bespring supplies food, feed and industrial chemical ingredients through six product portfolios.", "Bespring suministra ingredientes para alimentación, piensos e industria a través de seis familias de productos."],
  ["This page is intentionally separate from our industry application pages. Use it to browse purchasable chemical families and named materials; use the detailed category and product pages to review qualification considerations.", "Este catálogo se diferencia de las páginas de aplicaciones industriales. Utilícelo para explorar familias químicas y materiales comercializables; consulte las páginas de categoría y producto para revisar los criterios de homologación."],
  ["Availability, grade and documentation are confirmed against the exact source and shipment. A listing does not imply universal stock or regulatory approval.", "La disponibilidad, el grado y la documentación se confirman para el origen y envío concretos. La inclusión en el catálogo no implica existencias permanentes ni aprobación regulatoria universal."],
  ["View portfolio", "Ver catálogo"],
  ["Food-grade portfolio", "Gama de grado alimentario"],
  ["Food Ingredients & Additives", "Ingredientes y aditivos alimentarios"],
  ["Phosphates, acidulants, preservatives, emulsifiers, hydrocolloids, proteins, sweeteners and mineral ingredients.", "Fosfatos, acidulantes, conservantes, emulsionantes, hidrocoloides, proteínas, edulcorantes e ingredientes minerales."],
  ["Food phosphates", "Fosfatos alimentarios"],
  ["Browse products", "Ver productos"],
  ["Feed-grade portfolio", "Gama para piensos"],
  ["Feed Additives & Animal Nutrition", "Aditivos para piensos y nutrición animal"],
  ["Mineral sources, amino acids, acidifiers, preservative ingredients, liquid carriers and functional nutrients.", "Fuentes minerales, aminoácidos, acidificantes, conservantes, vehículos líquidos y nutrientes funcionales."],
  ["Iniciocare & Industrial Cleaning", "Limpieza doméstica e industrial"],
  ["Surfactants, solvents, inorganic builders, acids, alkalis, bleaching agents and oxidizing materials.", "Tensioactivos, disolventes, coadyuvantes inorgánicos, ácidos, álcalis, blanqueantes y oxidantes."],
  ["Water-process chemicals", "Productos químicos para procesos de agua"],
  ["Water Treatment Chemicals", "Productos químicos para tratamiento de aguas"],
  ["Coagulants, microbial-control materials and neutralizing amines for qualified water-treatment programs.", "Coagulantes, agentes de control microbiano y aminas neutralizantes para programas homologados de tratamiento de aguas."],
  ["Mineral-process chemicals", "Productos químicos para procesos minerales"],
  ["Mining & Mineral Processing Chemicals", "Productos químicos para minería y tratamiento de minerales"],
  ["Flotation reagents, leaching chemicals, process-water treatment materials and supporting inorganic chemicals.", "Reactivos de flotación, productos de lixiviación, tratamiento de agua de proceso y productos inorgánicos auxiliares."],
  ["Leaching chemicals", "Productos de lixiviación"],
  ["Process water", "Agua de proceso"],
  ["Phosphate, nitrogen, potassium, magnesium and micronutrient inputs for fertilizer manufacturing.", "Fuentes de fósforo, nitrógeno, potasio, magnesio y micronutrientes para fabricar fertilizantes."],
  ["Review identity, common standards, specification points, packing and inquiry details for selected products.", "Consulte identidad, normas habituales, especificaciones, embalaje y datos de consulta de productos seleccionados."],
  ["Product &amp; procurement profile", "Ficha técnica y de compra"],
  ["Product details are commercial reference information; the current specification and documents for the offered source govern each transaction.", "La información del producto es una referencia comercial; cada operación se rige por la especificación y los documentos vigentes del origen ofrecido."],
  ["A precise inquiry helps us match product, grade, source, documents and logistics without unnecessary back-and-forth.", "Una consulta precisa permite ajustar producto, grado, origen, documentación y logística sin intercambios innecesarios."],
  ["For regulated or safety-sensitive materials, your technical and regulatory teams should review the current specification, SDS and market requirements before approval.", "Para materiales regulados o sensibles, sus equipos técnicos y regulatorios deben revisar la especificación vigente, la SDS y los requisitos del mercado antes de aprobar."],
  ["See procurement support services", "Ver servicios de apoyo a compras"],
  ["Full chemical name, abbreviation, grade, CAS number and reference standard.", "Nombre químico completo, abreviatura, grado, número CAS y norma de referencia."],
  ["Assay, moisture, pH, particle size, viscosity, contaminants or other acceptance criteria.", "Pureza, humedad, pH, granulometría, viscosidad, contaminantes u otros criterios de aceptación."],
  ["Especificacion, SDS, COA format and any applicable certificates for qualification.", "Especificación, SDS, formato del COA y certificados aplicables para la homologación."],
  ["Quantity, packing, pallets, destination port, Incoterm and requested shipment window.", "Cantidad, embalaje, palés, puerto de destino, Incoterm y periodo de envío solicitado."],
  ["Document availability and scope are product- and source-specific. Request current documents for the exact supply offered.", "La disponibilidad y alcance de los documentos dependen del producto y origen. Solicite documentos vigentes para el suministro ofrecido."],
  ["Identity, grade, reference limits and technical characteristics.", "Identidad, grado, límites de referencia y características técnicas."],
  ["Classification, handling, storage and transport information.", "Información de clasificación, manipulación, almacenamiento y transporte."],
  ["Representative or batch test results against the agreed specification.", "Resultados representativos o del lote frente a la especificación acordada."],
  ["Current quality, product or site documents relevant to the supply.", "Documentos vigentes de calidad, producto o planta pertinentes para el suministro."],
  ["Send the product name, grade, target specification, quantity, packing, destination and requested documents. Our export team will review the fit and respond with the next qualification step.", "Envíe el nombre, grado, especificación requerida, cantidad, embalaje, destino y documentos solicitados. Nuestro equipo revisará la idoneidad y le indicará el siguiente paso de homologación."],
  ["Explore los portafolios de ingredientes alimentarios, aditivos para piensos, limpieza, tratamiento de agua, mineria y materias primas para fertilizantes de Bespring Chemical.", "Explore las gamas de ingredientes alimentarios, aditivos para piensos, limpieza, tratamiento de aguas, minería y materias primas para fertilizantes de Bespring Chemical."],
  ["Chemical Ingredients Supplier | Bespring Chemical", "Proveedor de ingredientes químicos | Bespring Chemical"],
  ["Food Ingredients & Additives portfolio", "Gama de ingredientes y aditivos alimentarios"],
  ["Feed Additives & Animal Nutrition portfolio", "Gama de aditivos para piensos y nutrición animal"],
  ["Iniciocare & Industrial Cleaning portfolio", "Gama de limpieza doméstica e industrial"],
  ["Water Treatment Chemicals portfolio", "Gama de productos para tratamiento de aguas"],
  ["Mining & Mineral Processing Chemicals portfolio", "Gama de productos para minería y tratamiento de minerales"],
  ["Chemical Ingredients and Raw Materials", "Ingredientes y materias primas químicas"],
  ["Purchasing directory for Bespring Chemical product portfolios.", "Directorio de compra de las gamas de productos Bespring Chemical."]
];

const servicesPage = [
  ["From specification alignment and document coordination to packaging, warehousing and export logistics, we help international buyers manage the practical work between product selection and delivery.", "Desde la alineación de especificaciones y documentos hasta el embalaje, almacenamiento y logística de exportación, ayudamos al comprador internacional a gestionar el proceso entre la selección y la entrega."],
  ["Bespring supports B2B buyers with product matching, specification review, document coordination, packaging options and export execution.", "Bespring ayuda a compradores B2B con selección de producto, revisión de especificaciones, coordinación documental, opciones de embalaje y ejecución de exportaciones."],
  ["Servicios are scoped to the exact product, source, market and order. We do not substitute commercial guidance for the buyer's regulatory, formulation, safety or legal approval responsibilities.", "Los servicios se definen según el producto, origen, mercado y pedido. Nuestra orientación comercial no sustituye las responsabilidades regulatorias, de formulación, seguridad o aprobación legal del comprador."],
  ["Our role is to make qualification and supply decisions clearer, more documented and easier to execute across borders.", "Nuestra función es facilitar decisiones de homologación y suministro más claras, documentadas y ejecutables entre países."],
  ["Product & specification review", "Revisión del producto y la especificación"],
  ["Match chemical identity, grade, concentration, physical form and critical quality limits against the inquiry.", "Contrastar identidad química, grado, concentración, forma física y límites críticos de calidad con la consulta."],
  ["Alternative grades or sources", "Grados u orígenes alternativos"],
  ["Especificacion-gap review", "Revisión de diferencias de especificación"],
  ["Sample coordination where available", "Coordinación de muestras cuando estén disponibles"],
  ["Quality & document coordination", "Coordinación de calidad y documentos"],
  ["Coordinate current commercial and quality documents applicable to the exact product and source offered.", "Coordinar documentos comerciales y de calidad vigentes para el producto y origen ofrecidos."],
  ["Especificacion or TDS", "Especificación o TDS"],
  ["SDS and COA format", "SDS y formato del COA"],
  ["Packaging, labeling & palletization", "Embalaje, etiquetado y paletización"],
  ["Review standard or feasible customized packing, marks, labels and pallet requirements before order confirmation.", "Revisar embalajes estándar o personalizados viables, marcas, etiquetas y requisitos de palés antes de confirmar el pedido."],
  ["Bag, drum or IBC options", "Opciones de saco, bidón o IBC"],
  ["Shipping marks and labels", "Marcas de expedición y etiquetas"],
  ["Pallet and container planning", "Planificación de palés y contenedores"],
  ["Coordinate eligible cargo through partner warehouse locations, subject to product compatibility and storage rules.", "Coordinar mercancías aptas mediante almacenes asociados, según compatibilidad y normas de almacenamiento."],
  ["Order consolidation review", "Revisión de consolidación de pedidos"],
  ["Export staging", "Preparación para exportación"],
  ["Export logistics coordination", "Coordinación logística de exportación"],
  ["Align shipment route, packing, documentation and dangerous-goods requirements with the confirmed trade terms.", "Alinear ruta, embalaje, documentación y requisitos de mercancías peligrosas con las condiciones comerciales confirmadas."],
  ["Port and schedule coordination", "Coordinación de puerto y calendario"],
  ["Shipping-document review", "Revisión de documentos de transporte"],
  ["China market intelligence", "Información del mercado chino"],
  ["Share practical observations on raw-material movement, supply conditions and policy changes relevant to an active purchase.", "Compartir información práctica sobre materias primas, condiciones de suministro y cambios normativos pertinentes para una compra activa."],
  ["Supply-demand context", "Contexto de oferta y demanda"],
  ["Procurement timing support", "Apoyo a la planificación de compras"],
  ["Private label, repacking, consolidation, sampling and certificate availability depend on the product, source, quantity, destination and current operational feasibility. Confirm these requirements before relying on them in your project timeline.", "La marca privada, reenvasado, consolidación, muestras y certificados dependen del producto, origen, cantidad, destino y viabilidad operativa. Confirme estos requisitos antes de incorporarlos al calendario del proyecto."],
  ["Early alignment on technical and commercial details reduces preventable delays later in the order.", "Alinear pronto los detalles técnicos y comerciales reduce retrasos evitables."],
  ["Define the requirement", "Definir los requisitos"],
  ["Product identity, target specification, quantity, packing, market and shipment window.", "Identidad, especificación requerida, cantidad, embalaje, mercado y periodo de envío."],
  ["Review supply fit", "Evaluar la idoneidad del suministro"],
  ["We evaluate grade, source, documentation, packing and logistics feasibility.", "Evaluamos grado, origen, documentación, embalaje y viabilidad logística."],
  ["Both parties align the commercial specification, sample or documents required for approval.", "Ambas partes acuerdan la especificación comercial, muestra o documentos necesarios para aprobar."],
  ["Execute and coordinate", "Ejecutar y coordinar"],
  ["Order, production or sourcing, inspection documents and export shipment are coordinated to the agreed terms.", "Pedido, producción o abastecimiento, documentos de inspección y envío se coordinan según los términos acordados."],
  ["Exact product and grade or concentration", "Producto exacto y grado o concentración"],
  ["Target specification and mandatory acceptance limits", "Especificación requerida y límites obligatorios de aceptación"],
  ["Annual or trial quantity and packing preference", "Cantidad anual o de prueba y embalaje preferido"],
  ["Destination country and delivery port", "País de destino y puerto de entrega"],
  ["Required documents, certifications or labeling", "Documentos, certificaciones o etiquetado requeridos"],
  ["Requested shipment date and preferred Incoterm", "Fecha de envío solicitada e Incoterm preferido"],
  ["Share the product, technical criteria, quantity and destination. We will identify the information still needed and outline the practical next step.", "Indique producto, criterios técnicos, cantidad y destino. Identificaremos la información pendiente y el siguiente paso práctico."],
  ["Chemical Export & Procurement Support Servicios | Bespring", "Servicios de exportación química y apoyo a compras | Bespring"],
  ["Service", "Servicio"],
  ["Chemical export and procurement support services", "Servicios de exportación química y apoyo a compras"],
  ["Especificacion and sourcing review", "Revisión de especificaciones y abastecimiento"],
  ["Quality and documentation coordination", "Coordinación de calidad y documentación"],
  ["Packaging and labeling", "Embalaje y etiquetado"]
  ,["Applicable certificates", "Certificados aplicables"]
  ,["Warehousing & consolidation", "Almacenamiento y consolidación"]
  ,["Container planning", "Planificación de contenedores"]
  ,["Price-driver discussion", "Análisis de factores de precio"]
  ,["Scope note:", "Nota sobre el alcance:"]
  ,["Confirm approval basis", "Confirmar la base de aprobación"]
  ,["Contactoar ventas de exportación", "Contactar con ventas de exportación"]
];

const contactPage = [
  ["Contacte con Bespring Chemical | Cotizaciones y soporte de exportacion", "Contactar con Bespring Chemical | Cotizaciones de productos químicos"],
  ["Contacto our team for product specifications, quotations, samples, documentation and international shipping support.", "Contacte con nuestro equipo para solicitar especificaciones, cotizaciones, muestras, documentos y apoyo de transporte internacional."],
  ["Soporte global de exportacion", "Apoyo global a la exportación"],
  ["For a faster, more accurate reply, tell us the product, grade, quantity and destination market.", "Para recibir una respuesta rápida y precisa, indique producto, grado, cantidad y mercado de destino."],
  ["Share your sourcing requirements and our team will review the details and respond with the relevant commercial and technical information.", "Comparta sus requisitos de compra; nuestro equipo revisará los datos y responderá con la información técnica y comercial pertinente."],
  ["I agree that Bespring Chemical may use these details to respond to my inquiry.", "Acepto que Bespring Chemical utilice estos datos para responder a mi consulta."],
  ["Your contact details are used only to handle your business inquiry.", "Sus datos de contacto se utilizarán únicamente para atender su consulta comercial."],
  ["Production location", "Ubicación de producción"],
  ["Product &amp; grade", "Producto y grado"],
  ["Share the product name, intended application, grade and specification.", "Indique nombre del producto, aplicación prevista, grado y especificación."],
  ["Quantity &amp; packaging", "Cantidad y embalaje"],
  ["Include your estimated order volume and preferred packaging format.", "Incluya el volumen estimado y el formato de embalaje preferido."],
  ["Tell us the destination country or port and your expected delivery timing.", "Indique país o puerto de destino y plazo de entrega previsto."],
  ["Documents", "Documentos"],
  ["List any certificate, technical document, compliance or sample requirements.", "Enumere los certificados, documentos técnicos, requisitos de cumplimiento o muestras necesarios."],
  ["Frequently asked questions", "Preguntas frecuentes"],
  ["Before you send an inquiry", "Antes de enviar una consulta"],
  ["Respuesta rapidas for international buyers sourcing food, feed and industrial chemical products from China.", "Respuestas rápidas para compradores internacionales de productos alimentarios, para piensos e industriales procedentes de China."],
  ["What information should I include in a quotation request?", "¿Qué información debo incluir al solicitar una cotización?"],
  ["Please include the product name or specification, grade, estimated quantity, destination country or port, required packaging and any certification or documentation needs.", "Incluya nombre o especificación, grado, cantidad estimada, país o puerto de destino, embalaje y certificados o documentos necesarios."],
  ["Which product categories can Bespring Chemical supply?", "¿Qué categorías de productos suministra Bespring Chemical?"],
  ["We supply food ingredients, feed additives, phosphates, water treatment chemicals, industrial cleaning chemicals, mining chemicals and agricultural fertilizers.", "Suministramos ingredientes alimentarios, aditivos para piensos, fosfatos y productos para tratamiento de aguas, limpieza industrial, minería y fertilizantes."],
  ["Can I request product documents or samples?", "¿Puedo solicitar documentos o muestras?"],
  ["Yes. Contacto our sales team to discuss specifications, certificates, technical documents and sample requirements for your market.", "Sí. Contacte con nuestro equipo comercial para tratar especificaciones, certificados, documentos técnicos y muestras para su mercado."],
  ["Global supplier of food ingredients, feed additives, phosphates and industrial chemical solutions.", "Proveedor global de ingredientes alimentarios, aditivos para piensos, fosfatos y soluciones químicas industriales."],
  ["Contacte con Bespring Chemical en China para cotizaciones, muestras, documentos y soporte de exportacion de ingredientes alimentarios, aditivos para piensos, fosfatos y quimicos industriales.", "Contacte con Bespring Chemical en China para solicitar cotizaciones, muestras, documentos y apoyo de exportación de ingredientes alimentarios, aditivos para piensos, fosfatos y productos químicos industriales."],
  ["Contacto Bespring Chemical", "Contactar con Bespring Chemical"],
  ["Request product information, samples, documentation or an export quote from our chemical supply team in Jiangsu, China.", "Solicite información de productos, muestras, documentos o una cotización de exportación a nuestro equipo en Jiangsu, China."],
  ["Contacto Bespring Chemical for food, feed and industrial chemical supply", "Contactar con Bespring Chemical para productos alimentarios, para piensos e industriales"],
  ["Request chemical product information, documentation, samples and export quotations.", "Solicite información, documentación, muestras y cotizaciones de productos químicos."],
  ["Service highlights", "Aspectos destacados del servicio"],
  ["e.g. food-grade STPP", "p. ej., STPP de grado alimentario"],
  ["Please include grade, specification, estimated quantity, packaging and required documents.", "Incluya grado, especificación, cantidad estimada, embalaje y documentos requeridos."],
  ["Empresa locations and contact details", "Ubicaciones y datos de contacto de la empresa"],
  ["Map showing Bespring Chemical sales office in Xuzhou, Jiangsu, China", "Mapa de la oficina comercial de Bespring Chemical en Xuzhou, Jiangsu, China"]
  ,["China-based supplier of food ingredients, feed additives, phosphates, water treatment chemicals, mining chemicals, industrial cleaning chemicals and agricultural fertilizers.", "Proveedor chino de ingredientes alimentarios, aditivos para piensos, fosfatos y productos para tratamiento de aguas, minería, limpieza industrial y fertilizantes agrícolas."]
  ,["customer service", "atención al cliente"]
  ,["Contactar con Bespring Chemical for product quotations, samples, technical documents and international shipping support.", "Contactar con Bespring Chemical para cotizaciones, muestras, documentos técnicos y apoyo de transporte internacional."]
  ,["Bespring Chemical supplies food ingredients, feed additives, phosphates, water treatment chemicals, industrial cleaning chemicals, mining chemicals and agricultural fertilizers.", "Bespring Chemical suministra ingredientes alimentarios, aditivos para piensos, fosfatos y productos para tratamiento de aguas, limpieza industrial, minería y fertilizantes agrícolas."]
  ,["Yes. Use the quotation form or contact the sales team to discuss specifications, certificates, technical documents and sample requirements for your market.", "Sí. Utilice el formulario de cotización o contacte con ventas para tratar especificaciones, certificados, documentos técnicos y muestras para su mercado."]
];

const newsPage = [
  ["Comparativas practicas de productos, orientacion para calificar proveedores, notas de documentacion de exportacion y novedades verificadas de Bespring Chemical.", "Comparativas prácticas de productos, orientación para homologar proveedores, documentación de exportación y novedades verificadas de Bespring Chemical."],
  ["Especificacion-led articles written around real B2B search and qualification questions. Use them for initial evaluation, then verify the exact product and destination-market requirements.", "Artículos basados en especificaciones y preguntas reales de compra B2B. Úselos para una evaluación inicial y verifique después los requisitos del producto y del mercado de destino."],
  ["STPP vs SHMP: How Industrial Buyers Should Compare the Two Phosphates", "STPP frente a SHMP: cómo comparar ambos fosfatos para uso industrial"],
  ["Compare STPP and SHMP by chemical identity, function, grade, specification, physical form and supplier-qualification requirements.", "Compare STPP y SHMP por identidad química, función, grado, especificación, forma física y requisitos de homologación del proveedor."],
  ["MCP vs DCP Feed Phosphates: A Buyer’s Qualification Guia", "MCP frente a DCP para piensos: guía de homologación para compradores"],
  ["Compare nutrient identity, assay, physical form, contaminant limits and documents when sourcing MCP or DCP.", "Compare identidad nutricional, riqueza, forma física, límites de contaminantes y documentos al comprar MCP o DCP."],
  ["Chemical Import Document Checklist for International B2B Buyers", "Lista de documentos para importar productos químicos: compradores B2B"],
  ["Align the specification, SDS, COA, certificates, labels and shipping documents before an international chemical order.", "Alinee especificación, SDS, COA, certificados, etiquetas y documentos de transporte antes de un pedido internacional."],
  ["Grado alimentario vs Technical Grade Phosphates: What Buyers Must Verify", "Fosfatos de grado alimentario frente a grado técnico: qué verificar"],
  ["Understand how grade, specification, impurity limits, manufacturing controls and market suitability change the approval basis.", "Conozca cómo el grado, la especificación, las impurezas, los controles de fabricación y el mercado determinan la homologación."],
  ["How to Qualify a Chemical Supplier in China: A Practical Buyer Checklist", "Cómo homologar a un proveedor químico en China: lista práctica"],
  ["Verify legal identity, product source, specifications, quality documents, traceability and export capability.", "Verifique identidad jurídica, origen, especificaciones, documentos de calidad, trazabilidad y capacidad exportadora."],
  ["Consulte el historial internacional de exposiciones de Bespring Chemical y abra cada pagina para ver fechas, lugar, stand y enfoque del portafolio.", "Consulte el historial internacional de exposiciones de Bespring Chemical: fechas, lugar, stand y productos presentados."],
  ["Global Ingredients Show 2025 · Moscow, Russia", "Global Ingredients Show 2025 · Moscú, Rusia"],
  ["Bespring Chemical exhibited at Global Ingredients Show 2025 in Moscow from April 15–17 at booth A512.", "Bespring Chemical expuso en Global Ingredients Show 2025 en Moscú del 15 al 17 de abril, stand A512."],
  ["Bespring Chemical participated in Fi Vietnam 2024 in Ho Chi Minh City from October 9–11 at booth B40.", "Bespring Chemical participó en Fi Vietnam 2024, Ciudad Ho Chi Minh, del 9 al 11 de octubre, stand B40."],
  ["Global Ingredients Show 2024 · Moscow, Russia", "Global Ingredients Show 2024 · Moscú, Rusia"],
  ["Bespring Chemical participated in Global Ingredients Show 2024 in Moscow from April 23–25 at booth D115.", "Bespring Chemical participó en Global Ingredients Show 2024 en Moscú del 23 al 25 de abril, stand D115."],
  ["Bespring Chemical participated in Fi Europe 2023 in Frankfurt from November 28–30 at booth 3.1A33.", "Bespring Chemical participó en Fi Europe 2023 en Fráncfort del 28 al 30 de noviembre, stand 3.1A33."],
  ["Bespring Chemical participated in Vietfood & Beverage 2023 in Ho Chi Minh City from August 10–12 at booth A3.127.", "Bespring Chemical participó en Vietfood & Beverage 2023, Ciudad Ho Chi Minh, del 10 al 12 de agosto, stand A3.127."],
  ["Lea guias de compra, comparaciones de productos quimicos, notas sobre documentacion de exportacion y novedades de exposiciones de Bespring Chemical.", "Lea guías de compra, comparativas de productos químicos, documentación de exportación y novedades de exposiciones de Bespring Chemical."],
  ["Chemical Industry Insights & Empresa Noticias | Bespring", "Información de la industria química y noticias | Bespring"],
  ["Chemical buyer guides", "Guías para compradores de productos químicos"],
  ["International exhibition news", "Noticias de exposiciones internacionales"],
  ["Bespring Chemical Insights and Noticias", "Información y noticias de Bespring Chemical"],
  ["Bespring Chemical international exhibition archive", "Archivo de exposiciones internacionales de Bespring Chemical"],
  ["Chemical procurement guides by Bespring Chemical", "Guías de compra de productos químicos de Bespring Chemical"]
];

const categoryShared = [
  ["Skip to product catalog", "Ir al catálogo de productos"],
  ["product families", "familias de productos"],
  ["Product directory", "Catálogo de productos"],
  ["Search this product portfolio", "Buscar en esta gama de productos"],
  ["No matching material is listed. Please send us the product name or specification for review.", "No se ha encontrado ningún material. Envíenos el nombre o la especificación para revisarlo."],
  ["Listings indicate sourcing scope, not guaranteed stock or universal grade availability. Confirm the exact product, specification, source, documentation and shipment terms for each inquiry.", "El catálogo indica el alcance de suministro, no existencias garantizadas ni disponibilidad universal de grados. Confirme producto, especificación, origen, documentación y condiciones de envío en cada consulta."],
  ["Buyer documentation", "Documentación para compradores"],
  ["Documents to align before approval", "Documentos que deben acordarse antes de aprobar"],
  ["Availability and scope depend on the exact product and source offered. Request current, applicable documents during qualification.", "La disponibilidad y el alcance dependen del producto y origen ofrecidos. Solicite documentos vigentes y aplicables durante la homologación."],
  ["Product identity, grade, reference limits and technical characteristics for commercial review.", "Identidad, grado, límites de referencia y características técnicas para la revisión comercial."],
  ["Classification, handling, storage, transport and workplace-control information for the offered material.", "Información sobre clasificación, manipulación, almacenamiento, transporte y control laboral del material ofrecido."],
  ["Representative or batch-specific test results compared with the mutually agreed specification.", "Resultados representativos o del lote comparados con la especificación acordada."],
  ["Current quality, product or site documents where relevant to the offered supply and destination.", "Documentos vigentes de calidad, producto o planta pertinentes para el suministro y destino."],
  ["Search this portfolio by product or abbreviation", "Buscar por producto o abreviatura"],
  ["Product family shortcuts", "Accesos por familia de productos"],
  ["Food Ingredients", "Ingredientes alimentarios"],
  ["Water Treatment", "Tratamiento de aguas"],
  ["Mining Chemicals", "Productos químicos para minería"],
  ["Iniciocare &amp; Industrial Cleaning", "Limpieza doméstica e industrial"],
  ["Bespring Chemical home", "Inicio de Bespring Chemical"]
];

const foodCategory = [
  ["Food Ingredients &amp; Additives Supplier | Bespring", "Proveedor de ingredientes y aditivos alimentarios | Bespring"],
  ["Food Ingredients", "Ingredientes alimentarios"],
  ["Browse food-grade phosphates and a broader ingredient portfolio organized by material family. Product identity, grade, specification, regulatory status and documentation should be confirmed for the exact supply offered.", "Explore fosfatos alimentarios y otros ingredientes organizados por familia. Confirme identidad, grado, especificación, situación regulatoria y documentación del suministro concreto."],
  ["Bespring supplies food-grade phosphates, preservatives, acidulants, emulsifiers, fibers, proteins, sweeteners, texturizers and related formulation ingredients.", "Bespring suministra fosfatos alimentarios, conservantes, acidulantes, emulsionantes, fibras, proteínas, edulcorantes, texturizantes e ingredientes de formulación."],
  ["This page is a purchasing directory rather than an application guide. Use it to identify a material family and available product, then review the detailed product dossier where available or send your target specification to our export team.", "Esta página es un catálogo de compra, no una guía de aplicación. Identifique la familia y el producto; consulte su ficha detallada o envíe la especificación requerida al equipo de exportación."],
  ["Search by product name or abbreviation. Linked materials have a detailed technical and procurement page.", "Busque por nombre o abreviatura. Los materiales enlazados disponen de ficha técnica y comercial."],
  ["Preservatives &amp; Shelf-life Ingredients", "Conservantes e ingredientes para prolongar la vida útil"],
  ["Fibers &amp; Prebiotic Ingredients", "Fibras e ingredientes prebióticos"],
  ["Leavening &amp; Processing Ingredients", "Leudantes e ingredientes de proceso"],
  ["Mono- and Diglycerides (MDG)", "Mono y diglicéridos (MDG)"],
  ["Diacetyl Tartaric Acid Esters of Mono- and Diglycerides (DATEM)", "Ésteres diacetiltartáricos de mono y diglicéridos (DATEM)"],
  ["Open a product page for identity, grade distinctions, reference specifications, packing, storage and buyer questions.", "Abra la ficha para consultar identidad, grados, especificaciones de referencia, embalaje, almacenamiento y preguntas de compra."],
  ["Food grade", "Grado alimentario"],
  ["Confirm grade and specification before qualification", "Confirme grado y especificación antes de homologar"],
  ["A food additive name is not a complete approval basis: buyers should confirm chemical identity, food-grade standard, critical specification limits, intended use and destination-market status.", "El nombre del aditivo no basta para aprobarlo: confirme identidad química, norma alimentaria, límites críticos, uso previsto y situación en el mercado de destino."],
  ["The same ingredient may be offered in different hydrates, particle sizes, viscosities, reaction rates or purity standards. A supplier document should be checked against the exact material, source and market being approved.", "Un ingrediente puede ofrecerse con distintos hidratos, granulometrías, viscosidades, velocidades de reacción o purezas. Verifique los documentos frente al material, origen y mercado concretos."],
  ["Food-grade status is product- and source-specific. It should not be inferred from the chemical name alone, and it does not remove the buyer's responsibility to verify local regulatory suitability.", "El grado alimentario depende del producto y origen. No debe deducirse solo del nombre químico ni exime al comprador de verificar la normativa local."],
  ["Confirm the full name, INS or E number where applicable, CAS number, grade and referenced food standard such as FCC or another agreed specification.", "Confirme nombre completo, número INS o E cuando corresponda, CAS, grado y norma alimentaria de referencia, como FCC u otra acordada."],
  ["State the assay and functional limits that matter to your process, including moisture, pH, particle size, viscosity or reaction rate where relevant.", "Indique pureza y límites funcionales importantes: humedad, pH, granulometría, viscosidad o velocidad de reacción."],
  ["Verify permitted use, use level, labeling and destination-market requirements with your regulatory and quality teams.", "Verifique uso autorizado, dosis, etiquetado y requisitos del mercado con sus equipos regulatorios y de calidad."],
  ["Commercial supply", "Suministro comercial"],
  ["Specify quantity, packing, palletization, destination port, required documents and requested shipment window.", "Especifique cantidad, embalaje, paletización, puerto, documentos y periodo de envío."],
  ["Send the product name, food-grade standard, target specification, quantity, packing and destination market for a more precise response.", "Envíe nombre, norma alimentaria, especificación requerida, cantidad, embalaje y mercado para recibir una respuesta precisa."],
  ["Browse food-grade phosphates, preservatives, acidulants, hydrocolloids, proteins, sweeteners and other food ingredients supplied by Bespring Chemical.", "Explore fosfatos, conservantes, acidulantes, hidrocoloides, proteínas, edulcorantes y otros ingredientes alimentarios suministrados por Bespring Chemical."],
  ["Food Ingredients &amp; Additives Supplier | Bespring", "Proveedor de ingredientes y aditivos alimentarios | Bespring"],
  ["Food-grade ingredients and additives supplied by Bespring Chemical", "Ingredientes y aditivos de grado alimentario suministrados por Bespring Chemical"],
  ["Food Ingredients & Additives Supplier | Bespring", "Proveedor de ingredientes y aditivos alimentarios | Bespring"],
  ["Food Ingredients product families", "Familias de ingredientes alimentarios"],
  ["Preservatives & Shelf-life Ingredients", "Conservantes e ingredientes para vida útil"],
  ["Fibers & Prebiotic Ingredients", "Fibras e ingredientes prebióticos"],
  ["Leavening & Processing Ingredients", "Leudantes e ingredientes de proceso"]
];

const animalCategory = [
  ["Proveedor de aditivos para piensos | Bespring Chemical", "Proveedor de aditivos para piensos y nutrición animal | Bespring"],
  ["Source feed minerals, amino acids, organic acids, preservatives, carriers and functional nutrients through a portfolio structured for technical and commercial qualification.", "Obtenga minerales, aminoácidos, ácidos orgánicos, conservantes, vehículos y nutrientes funcionales mediante una gama estructurada para homologación técnica y comercial."],
  ["Bespring's animal nutrition portfolio includes mineral sources, amino acids, acidifiers, preservative ingredients, liquid carriers and functional nutrients.", "La gama de nutrición animal de Bespring incluye fuentes minerales, aminoácidos, acidificantes, conservantes, vehículos líquidos y nutrientes funcionales."],
  ["Product suitability depends on species, feed type, formulation, grade and local feed regulations. This directory identifies offered material families; it does not prescribe inclusion rates or replace formulation and regulatory review.", "La idoneidad depende de la especie, tipo de pienso, formulación, grado y normativa local. Este catálogo no prescribe dosis ni sustituye la revisión nutricional y regulatoria."],
  ["Nutricion animal products", "Productos para nutrición animal"],
  ["Review the listed feed and formulation materials, then confirm grade, assay, physical form and applicable registration requirements.", "Revise los materiales y confirme grado, riqueza, forma física y requisitos de registro aplicables."],
  ["Antioxidant Ingredients", "Ingredientes antioxidantes"],
  ["Preservative Ingredients", "Ingredientes conservantes"],
  ["Qualify the exact feed-grade material", "Homologue el material exacto para piensos"],
  ["For feed additive purchasing, confirm nutrient identity, assay, bioavailable form, carrier or concentration, contaminant limits and destination-market authorization.", "Al comprar aditivos, confirme identidad nutricional, riqueza, forma biodisponible, vehículo o concentración, contaminantes y autorización en destino."],
  ["Names such as lysine, choline chloride or mineral phosphate can represent materially different concentrations and physical forms. Comparison should be made against an agreed specification rather than product name or price alone.", "Nombres como lisina, cloruro de colina o fosfato mineral pueden representar concentraciones y formas distintas. Compare con una especificación acordada, no solo por nombre o precio."],
  ["Inclusion rate, species suitability and legal feed use must be determined by qualified nutrition and regulatory personnel. This portfolio is a supply directory, not feeding advice.", "La dosis, idoneidad por especie y uso legal deben determinarlos profesionales cualificados. Este es un catálogo de suministro, no asesoramiento nutricional."],
  ["State the active compound, chemical form, concentration or assay and feed-grade standard required.", "Indique compuesto activo, forma química, concentración o riqueza y norma requerida para piensos."],
  ["Confirm powder, granule or liquid form, particle-size needs, carrier system and handling characteristics.", "Confirme forma en polvo, granulado o líquido, granulometría, vehículo y manipulación."],
  ["Quality limits", "Límites de calidad"],
  ["Define moisture and relevant impurity, heavy-metal, microbiological or dioxin limits where applicable.", "Defina humedad y límites aplicables de impurezas, metales pesados, microbiología o dioxinas."],
  ["Market requirements", "Requisitos del mercado"],
  ["Provide the destination country, species or feed category, labeling needs and documents required by your approval process.", "Indique país, especie o categoría de pienso, etiquetado y documentos exigidos para aprobar."],
  ["Tell us the feed material, grade or concentration, target specification, packing, quantity and destination market.", "Indique material, grado o concentración, especificación, embalaje, cantidad y mercado de destino."],
  ["Browse feed minerals, amino acids, organic acids, preservatives, liquid carriers and functional nutrients supplied for animal nutrition procurement.", "Explore minerales, aminoácidos, ácidos orgánicos, conservantes, vehículos líquidos y nutrientes funcionales para nutrición animal."],
  ["Feed Additives Supplier | Bespring Chemical", "Proveedor de aditivos para piensos | Bespring Chemical"],
  ["Feed additives and animal nutrition ingredients supplied by Bespring Chemical", "Aditivos para piensos e ingredientes de nutrición animal de Bespring Chemical"],
  ["Nutricion animal product families", "Familias de productos de nutrición animal"]
];

const cleaningCategory = [
  ["Proveedor de quimicos de limpieza | Bespring Chemical", "Proveedor de productos químicos de limpieza | Bespring"],
  ["Quimicos para cuidado del hogar y limpieza industrial", "Productos químicos para limpieza doméstica e industrial"],
  ["Browse surfactants, solvents, inorganic chemicals, acids, alkalis and bleaching agents with the product identity and commercial details needed for responsible sourcing.", "Explore tensioactivos, disolventes, productos inorgánicos, ácidos, álcalis y blanqueantes con la información necesaria para una compra responsable."],
  ["Bespring supplies surfactants, solvents, inorganic builders and salts, acids, alkalis and oxidizing or chlorine-based bleaching materials.", "Bespring suministra tensioactivos, disolventes, coadyuvantes y sales inorgánicas, ácidos, álcalis y blanqueantes oxidantes o clorados."],
  ["This page identifies raw materials available for procurement. Formulation performance, compatibility and safe use depend on concentration, product form and the full cleaning system, which should be assessed separately.", "Esta página identifica materias primas disponibles. El rendimiento, compatibilidad y uso seguro dependen de concentración, forma y sistema completo, que deben evaluarse por separado."],
  ["Iniciocare &amp; Industrial Cleaning products", "Productos para limpieza doméstica e industrial"],
  ["Search the portfolio by common name, chemical name or abbreviation.", "Busque por nombre común, nombre químico o abreviatura."],
  ["Specify active content and physical form", "Especifique contenido activo y forma física"],
  ["Cleaning-chemical quotations should identify active matter or concentration, physical form, key impurity limits, packing and dangerous-goods requirements.", "Las cotizaciones deben identificar materia activa o concentración, forma física, impurezas, embalaje y requisitos de mercancías peligrosas."],
  ["Commercial names can cover different concentrations and grades. LABSA, SLES, hydrogen peroxide, hypochlorite-related materials and caustic alkalis require particularly clear concentration and transport information.", "Los nombres comerciales pueden abarcar distintas concentraciones y grados. LABSA, SLES, peróxido, hipocloritos y álcalis cáusticos requieren datos claros de concentración y transporte."],
  ["Acids, alkalis, oxidizers and chlorine-releasing products can present serious handling and compatibility hazards. Review the current SDS and applicable transport classification before purchase and use.", "Ácidos, álcalis, oxidantes y productos clorados pueden presentar riesgos graves. Revise la SDS vigente y la clasificación de transporte antes de comprar y usar."],
  ["Chemical identity", "Identidad química"],
  ["Provide the exact chemical name, CAS number where relevant and the commercial concentration or active content.", "Indique nombre químico exacto, CAS y concentración comercial o contenido activo."],
  ["State required pH, color, viscosity, solids, salt content or other critical limits used in incoming quality control.", "Indique pH, color, viscosidad, sólidos, sales u otros límites críticos de recepción."],
  ["Confirm drum, IBC, bag or other packing and check material compatibility for the concentration supplied.", "Confirme bidón, IBC, saco u otro embalaje y su compatibilidad con la concentración."],
  ["Provide destination and shipment mode so classification, dangerous-goods documents and packing can be reviewed.", "Indique destino y modo de transporte para revisar clasificación, documentos y embalaje."],
  ["Send the chemical name, concentration, target parameters, packing, quantity and destination for an accurate commercial review.", "Envíe nombre químico, concentración, parámetros, embalaje, cantidad y destino para una revisión precisa."],
  ["Browse surfactants, solvents, inorganic builders, acids, alkalis and bleaching agents for homecare and industrial cleaning chemical procurement.", "Explore tensioactivos, disolventes, coadyuvantes inorgánicos, ácidos, álcalis y blanqueantes para limpieza doméstica e industrial."],
  ["Cleaning Chemicals Supplier | Bespring Chemical", "Proveedor de productos químicos de limpieza | Bespring Chemical"],
  ["Iniciocare and industrial cleaning chemical raw materials", "Materias primas químicas para limpieza doméstica e industrial"],
  ["Iniciocare & Industrial Cleaning", "Limpieza doméstica e industrial"],
  ["Iniciocare & Industrial Cleaning product families", "Familias de productos para limpieza doméstica e industrial"]
];

const waterCategory = [
  ["Browse coagulants, microbial-control materials and neutralizing amines by chemistry, then confirm concentration, form, specification and regulatory suitability for the exact water system.", "Explore coagulantes, agentes de control microbiano y aminas neutralizantes; confirme concentración, forma, especificación e idoneidad regulatoria para el sistema."],
  ["Bespring's water-treatment portfolio covers primary coagulants, oxidizing and non-oxidizing microbial-control materials, and amines used in condensate corrosion-control programs.", "La gama incluye coagulantes, agentes microbianos oxidantes y no oxidantes, y aminas para control de corrosión en condensados."],
  ["Chemical selection and dose depend on source-water chemistry, process conditions, discharge requirements and system metallurgy. This page is a product directory; treatability work and qualified technical review remain necessary.", "La selección y dosis dependen de la química del agua, proceso, vertido y metalurgia del sistema. Este catálogo no sustituye las pruebas de tratabilidad ni la revisión técnica."],
  ["Water Treatment products", "Productos para tratamiento de aguas"],
  ["Search by product name, chemical family or common abbreviation such as PAC, ACH or QAC.", "Busque por producto, familia química o abreviatura como PAC, ACH o QAC."],
  ["Match the chemistry to system conditions", "Adapte la química a las condiciones del sistema"],
  ["Water-treatment chemical sourcing should define active concentration, basicity or charge characteristics where relevant, impurity limits, physical form and intended water-system category.", "La compra debe definir concentración activa, basicidad o carga cuando corresponda, impurezas, forma física y tipo de sistema de agua."],
  ["Productos with the same common name may differ in concentration, basicity, density or metal content. Jar testing, microbiological control studies or corrosion-program review may be required before commercial adoption.", "Productos con el mismo nombre pueden variar en concentración, basicidad, densidad o metales. Pueden requerirse ensayos de jarras, estudios microbiológicos o revisión de corrosión."],
  ["Biocides, oxidizers, chlorine products and amines require product-specific risk assessment. Never infer dosing, compatibility or potable-water approval from a portfolio listing.", "Biocidas, oxidantes, clorados y aminas requieren evaluación específica. No deduzca dosis, compatibilidad o aprobación para agua potable del catálogo."],
  ["Water-system context", "Contexto del sistema de agua"],
  ["Identify municipal, industrial, cooling, boiler, process or wastewater service and provide relevant water-analysis data.", "Identifique si es agua municipal, industrial, refrigeración, caldera, proceso o residual y facilite análisis relevantes."],
  ["Product parameters", "Parámetros del producto"],
  ["Confirm active concentration, density, pH, basicity, charge density or other chemistry-specific parameters.", "Confirme concentración, densidad, pH, basicidad, densidad de carga u otros parámetros."],
  ["State whether the material may contact potable water, food operations or regulated discharge streams.", "Indique si puede contactar con agua potable, operaciones alimentarias o vertidos regulados."],
  ["Logistics &amp; storage", "Logística y almacenamiento"],
  ["Confirm bulk, IBC, drum or bag supply, destination, storage compatibility and dangerous-goods requirements.", "Confirme suministro a granel, IBC, bidón o saco, destino, compatibilidad de almacenamiento y mercancías peligrosas."],
  ["Provide the water-system type, chemistry required, target specification, quantity, packing and destination.", "Indique tipo de sistema, producto requerido, especificación, cantidad, embalaje y destino."],
  ["Browse water treatment coagulants, microbial-control chemicals and neutralizing amines supplied for industrial and municipal procurement.", "Explore coagulantes, agentes de control microbiano y aminas neutralizantes para tratamiento industrial y municipal."],
  ["Quimicos para tratamiento de agua Supplier | Bespring", "Proveedor de productos químicos para tratamiento de aguas | Bespring"],
  ["Water treatment chemicals supplied by Bespring Chemical", "Productos químicos para tratamiento de aguas suministrados por Bespring Chemical"],
  ["Water Treatment product families", "Familias de productos para tratamiento de aguas"]
];

const miningCategory = [
  ["Proveedor de quimicos para mineria | Bespring Chemical", "Proveedor de productos químicos para minería | Bespring"],
  ["Mining Chemicals", "Productos químicos para minería"],
  ["Browse flotation reagents, leaching chemicals, water-treatment materials and refining inputs for specification-based mineral-process procurement.", "Explore reactivos de flotación, lixiviación, tratamiento de aguas y refinado para compras basadas en especificaciones."],
  ["Bespring's mining portfolio includes flotation collectors and frothers, pH modifiers, leaching inputs, water-treatment chemicals and selected smelting or refining materials.", "La gama incluye colectores y espumantes, modificadores de pH, reactivos de lixiviación, tratamiento de aguas y materiales de fundición o refinado."],
  ["This directory organizes purchasable chemistries. Reagent selection and operating conditions depend on ore mineralogy, water chemistry, flowsheet and metallurgical testing and should be established by qualified process personnel.", "El catálogo organiza productos adquiribles. La selección y condiciones dependen de mineralogía, química del agua, diagrama de proceso y ensayos metalúrgicos definidos por personal cualificado."],
  ["Mining Chemicals products", "Productos químicos para minería"],
  ["Search by chemical name, reagent family or abbreviation such as MIBC, PAX, PAC or SMBS.", "Busque por nombre, familia de reactivos o abreviatura como MIBC, PAX, PAC o SMBS."],
  ["Mine &amp; Process Water Treatment", "Tratamiento de agua de mina y proceso"],
  ["Leaching Chemicals", "Productos de lixiviación"],
  ["Refining &amp; Processing Chemicals", "Productos para refinado y procesamiento"],
  ["Define reagent grade and process context", "Defina el grado y el contexto del proceso"],
  ["Mining chemical requests should state the exact reagent, active content or purity, physical form, critical impurities, consumption estimate, packing and destination logistics.", "Las consultas deben indicar reactivo, contenido activo o pureza, forma física, impurezas, consumo estimado, embalaje y logística."],
  ["Collector series, frother composition, lime reactivity, flocculant charge and molecular weight, and reagent concentration can materially affect qualification. Use plant or laboratory test results to define the required specification.", "La serie del colector, composición del espumante, reactividad de la cal, carga y peso molecular del floculante y concentración afectan la homologación. Defina la especificación con ensayos."],
  ["Many mining reagents are corrosive, toxic, oxidizing, flammable or dangerous to the environment. Selection, testing, storage and use require qualified metallurgical and HSE oversight.", "Muchos reactivos son corrosivos, tóxicos, oxidantes, inflamables o peligrosos para el ambiente. Selección, ensayo, almacenamiento y uso requieren supervisión metalúrgica y HSE."],
  ["Identify commodity, ore type and process stage so commercial discussions use the correct reagent family and grade.", "Indique mineral, tipo de mena y etapa del proceso para usar la familia y grado correctos."],
  ["Reagent specification", "Especificación del reactivo"],
  ["State active content, purity, solution strength, particle size or polymer characteristics relevant to the material.", "Indique contenido activo, pureza, concentración, granulometría o características del polímero."],
  ["Provide monthly demand, packing, storage constraints, mine location, destination port and preferred Incoterm.", "Indique demanda mensual, embalaje, restricciones, ubicación de la mina, puerto e Incoterm."],
  ["Request the current SDS, transport classification and handling information for the exact concentration and source.", "Solicite SDS, clasificación de transporte e información de manipulación vigentes para concentración y origen concretos."],
  ["Send the reagent name, target grade, process context, monthly demand, packing and destination port.", "Envíe nombre del reactivo, grado, proceso, demanda mensual, embalaje y puerto."],
  ["Browse flotation reagents, leaching chemicals, water-treatment materials and refining chemicals for mining and mineral processing procurement.", "Explore reactivos de flotación, lixiviación, tratamiento de aguas y refinado para minería y procesamiento de minerales."],
  ["Mining Chemicals Supplier | Bespring Chemical", "Proveedor de productos químicos para minería | Bespring Chemical"],
  ["Mining and mineral processing chemicals supplied by Bespring Chemical", "Productos químicos para minería y tratamiento de minerales de Bespring Chemical"],
  ["Mining Chemicals product families", "Familias de productos químicos para minería"],
  ["Mine & Process Water Treatment", "Tratamiento de agua de mina y proceso"],
  ["Refining & Processing Chemicals", "Productos para refinado y procesamiento"]
];

const fertilizerCategory = [
  ["Browse phosphate and potassium salts available for fertilizer procurement, with clear attention to grade, nutrient analysis, solubility, impurity limits and packing.", "Explore sales fosfatadas y potásicas para fertilizantes, considerando grado, análisis nutricional, solubilidad, impurezas y embalaje."],
  ["Bespring supplies monopotassium phosphate, dipotassium phosphate, monoammonium phosphate, diammonium phosphate and potassium pyrophosphate.", "Bespring suministra fosfato monopotásico, dipotásico, monoamónico, diamónico y pirofosfato potásico."],
  ["Each salt may be offered to different technical or fertilizer specifications. Confirm nutrient declaration, purity, water insolubles, chloride or heavy-metal limits and intended market before approval.", "Cada sal puede ofrecerse con distintas especificaciones. Confirme declaración nutricional, pureza, insolubles, cloruros, metales pesados y mercado antes de aprobar."],
  ["Agricultural Fertilizers products", "Productos fertilizantes agrícolas"],
  ["Review the phosphate fertilizer salts currently listed in this portfolio.", "Revise las sales fosfatadas para fertilizantes incluidas en esta gama."],
  ["Fertilizer salt procurement should confirm the chemical grade, declared nutrient content, solubility, moisture, insolubles, impurity limits and particle-size or form requirements.", "La compra debe confirmar grado, nutrientes declarados, solubilidad, humedad, insolubles, impurezas, granulometría y forma."],
  ["MAP, DAP and potassium phosphates can be supplied to different specifications. An abbreviation does not establish nutrient analysis, suitability for a particular fertilizer system or destination-market registration.", "MAP, DAP y fosfatos potásicos pueden tener distintas especificaciones. La abreviatura no determina análisis nutricional, idoneidad ni registro en destino."],
  ["Compatibility, crop use, nutrient rate and local fertilizer registration must be assessed separately. This page does not provide agronomic recommendations.", "Compatibilidad, uso por cultivo, dosis y registro local deben evaluarse aparte. Esta página no ofrece recomendaciones agronómicas."],
  ["Chemical grade", "Grado químico"],
  ["State fertilizer, technical or another required grade and provide the reference specification.", "Indique grado fertilizante, técnico u otro y facilite la especificación de referencia."],
  ["Confirm the phosphorus, potassium or nitrogen basis used for commercial comparison and labeling.", "Confirme la base de fósforo, potasio o nitrógeno usada para comparación y etiquetado."],
  ["Define moisture, water insolubles, chloride, heavy metals and particle-size limits where relevant.", "Defina humedad, insolubles, cloruros, metales pesados y granulometría."],
  ["Provide quantity, bag size, palletization, destination, registration documents and shipment timing.", "Indique cantidad, tamaño de saco, paletización, destino, documentos de registro y fecha de envío."],
  ["Send the fertilizer salt, grade, nutrient specification, quantity, packing and destination market.", "Envíe sal fertilizante, grado, especificación nutricional, cantidad, embalaje y mercado."],
  ["Browse MKP, DKP, MAP, DAP and potassium pyrophosphate fertilizer salts with procurement guidance for grade, nutrient analysis and packing.", "Explore sales MKP, DKP, MAP, DAP y pirofosfato potásico con orientación sobre grado, análisis nutricional y embalaje."],
  ["Fertilizer Raw Materials Supplier | Bespring", "Proveedor de materias primas para fertilizantes | Bespring"],
  ["Phosphate fertilizer salts supplied by Bespring Chemical", "Sales fosfatadas para fertilizantes suministradas por Bespring Chemical"],
  ["Agricultural Fertilizers product families", "Familias de fertilizantes agrícolas"]
];

const replacements = [
  ...shared, ...productsPage, ...servicesPage, ...contactPage, ...newsPage,
  ...categoryShared, ...foodCategory, ...animalCategory, ...cleaningCategory,
  ...waterCategory, ...miningCategory, ...fertilizerCategory
]
  .sort((a, b) => b[0].length - a[0].length);

for (const relative of corePages) {
  const file = path.join(root, "es", relative);
  let html = await readFile(file, "utf8");
  for (const [from, to] of replacements) html = html.replaceAll(from, to);
  html = html
    .replace(/"alternateName":\s*\[[^\r\n]+/g, '"alternateName": ["Bespring Chemical"],')
    .replaceAll('"@type": "ContactoPage"', '"@type": "ContactPage"');
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((value) => !/^(?:https?:|mailto:|tel:|#)/i.test(value))
    .map((value) => value.split(/[?#]/, 1)[0]);
  for (const ref of new Set(refs)) await access(path.resolve(path.dirname(file), ref));
  await writeFile(file, html, "utf8");
  console.log(`Translated and validated es/${relative}`);
}

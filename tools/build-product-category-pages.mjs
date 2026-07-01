import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = "https://www.bespringchem.com";

const productDetailLinks = {
  "Citric Acid (Anhydrous)": "food-ingredients/citric-acid.html",
  "Calcium Propionate": "food-ingredients/calcium-propionate.html",
  "Carboxymethyl Cellulose Sodium (CMC)": "food-ingredients/sodium-carboxymethyl-cellulose-cmc.html",
  "Dicalcium Phosphate (Anhydrous)": "food-ingredients/dicalcium-phosphate-dcp.html",
  "Dicalcium Phosphate (Anhydrous) (DCP)": "food-ingredients/dicalcium-phosphate-dcp.html",
  "Monocalcium Phosphate (MCP)": "food-ingredients/monocalcium-phosphate-mcp.html",
  "Tetrapotassium Pyrophosphate (TKPP)": "food-ingredients/tetrapotassium-pyrophosphate-tkpp.html",
  "Sodium Aluminum Phosphate (SALP)": "food-ingredients/sodium-aluminum-phosphate-salp.html",
  "Sodium Hexametaphosphate (SHMP)": "food-ingredients/sodium-hexametaphosphate-shmp.html",
  "Sodium Tripolyphosphate (STPP)": "food-ingredients/sodium-tripolyphosphate-stpp.html"
};

const pages = [
  {
    file: "food-ingredients.html",
    title: "Food Ingredients & Additives Supplier | Bespring",
    description: "Browse food-grade phosphates, preservatives, acidulants, hydrocolloids, proteins, sweeteners and other food ingredients supplied by Bespring Chemical.",
    name: "Food Ingredients & Food Additives",
    shortName: "Food Ingredients",
    eyebrow: "Food-grade product portfolio",
    heroImage: "food-ingredients1.jpg",
    ogImage: "food-ingredients-og.jpg",
    twitterImage: "food-ingredients-twitter.jpg",
    imageAlt: "Food-grade ingredients and additives supplied by Bespring Chemical",
    heroLead: "Browse food-grade phosphates and a broader ingredient portfolio organized by material family. Product identity, grade, specification, regulatory status and documentation should be confirmed for the exact supply offered.",
    summaryTitle: "A specification-led food ingredient portfolio",
    directAnswer: "Bespring supplies food-grade phosphates, preservatives, acidulants, emulsifiers, fibers, proteins, sweeteners, texturizers and related formulation ingredients.",
    summaryText: "This page is a purchasing directory rather than an application guide. Use it to identify a material family and available product, then review the detailed product dossier where available or send your target specification to our export team.",
    catalogIntro: "Search by product name or abbreviation. Linked materials have a detailed technical and procurement page.",
    categories: [
      { name: "Phosphates", items: ["Diammonium Phosphate (DAP)", "Tricalcium Phosphate (Anhydrous)", "Dicalcium Phosphate (Anhydrous)", "Dicalcium Phosphate (Dihydrate)", "Monocalcium Phosphate (Anhydrous)", "Monocalcium Phosphate (MCP)", "Phosphate Blends", "Phosphoric Acid", "Dipotassium Phosphate (Anhydrous)", "Monopotassium Phosphate (Anhydrous)", "Tripotassium Phosphate (TKP)", "Potassium Tripolyphosphate (KTPP)", "Tetrapotassium Pyrophosphate (TKPP)", "Potassium Metaphosphate (KMP)", "Sodium Aluminum Phosphate (SALP)", "Sodium Trimetaphosphate (STMP)", "Tetrasodium Pyrophosphate (TSPP)", "Disodium Phosphate (DSP)", "Sodium Dihydrogen Phosphate (MSP)", "Trisodium Phosphate (TSP)", "Sodium Hexametaphosphate (SHMP)", "Sodium Tripolyphosphate (STPP)", "Sodium Acid Pyrophosphate (SAPP)", "Monoammonium Phosphate"] },
      { name: "Preservatives & Shelf-life Ingredients", items: ["EDTA (Ethylenediaminetetraacetic Acid)", "Sodium Erythorbate", "Calcium Propionate", "Sodium Propionate", "Sodium Diacetate", "Sodium Benzoate", "Potassium Sorbate", "Sorbic Acid", "Calcium Sorbate"] },
      { name: "Acidulants & Citrate Salts", items: ["Citric Acid (Anhydrous)", "Calcium Citrate", "Potassium Citrate", "Magnesium Citrate", "Zinc Citrate", "Sodium Citrate", "Lactic Acid", "Cream of Tartar (Potassium Bitartrate)", "Apple Cider Vinegar"] },
      { name: "Cocoa & Chocolate", items: ["Chocolate", "Cocoa Powder"] },
      { name: "Emulsifiers", items: ["Distilled Monoglycerides (DMG)", "Mono- and Diglycerides (MDG)", "Polysorbates", "Diacetyl Tartaric Acid Esters of Mono- and Diglycerides (DATEM)"] },
      { name: "Fibers & Prebiotic Ingredients", items: ["Gum Arabic", "Oligofructose", "Citrus Fiber", "Inulin"] },
      { name: "Flavors & Dairy Powders", items: ["Dry Dairy Powders", "Fruit Crystals", "Vanillin"] },
      { name: "Mineral Fortification", items: ["Calcium Lactate", "Calcium Carbonate", "Calcium Chloride (Anhydrous)", "Monocalcium Phosphate (MCP)", "Dicalcium Phosphate (Anhydrous) (DCP)", "Sodium Lactate", "Potassium Lactate", "Ferrous Lactate", "Magnesium Lactate", "Zinc Lactate", "Magnesium Carbonate", "Potassium Carbonate"] },
      { name: "Oils & Fats", items: ["Canola Oil", "Coconut Oil", "Corn Oil", "Shortening", "Sunflower Oil"] },
      { name: "Leavening & Processing Ingredients", items: ["Sodium Bicarbonate", "Silicon Dioxide", "Propylene Glycol"] },
      { name: "Proteins", items: ["Dairy Protein", "Whey Protein", "Clean Whey", "Lactose", "Sweet Whey", "Faba Protein", "Pea Protein", "Soy Flour", "Textured Soy Protein"] },
      { name: "Sweeteners & Carbohydrates", items: ["Corn Syrup", "Dextrose (Glucose)", "High-intensity Sweeteners", "Lactose", "Maltitol", "Maltodextrin", "Granulated Sugar", "Plant-derived Sugar", "Dextrose Monohydrate", "Erythritol", "Sorbitol"] },
      { name: "Texturizers & Hydrocolloids", items: ["Carboxymethyl Cellulose Sodium (CMC)", "Acetylated Distarch Phosphate", "Carrageenan", "Cellulose Derivatives", "Gellan Gum", "Guar Gum", "Hydrocolloids", "Konjac Gum", "Pectin", "Sodium Alginate", "Xanthan Gum"] }
    ],
    dossiers: [
      ["STPP", "Sodium Tripolyphosphate", "food-ingredients/sodium-tripolyphosphate-stpp.html"],
      ["SHMP", "Sodium Hexametaphosphate", "food-ingredients/sodium-hexametaphosphate-shmp.html"],
      ["TKPP", "Tetrapotassium Pyrophosphate", "food-ingredients/tetrapotassium-pyrophosphate-tkpp.html"],
      ["SALP", "Sodium Aluminum Phosphate", "food-ingredients/sodium-aluminum-phosphate-salp.html"],
      ["MCP", "Monocalcium Phosphate", "food-ingredients/monocalcium-phosphate-mcp.html"],
      ["DCP", "Dicalcium Phosphate", "food-ingredients/dicalcium-phosphate-dcp.html"],
      ["CMC", "Sodium Carboxymethyl Cellulose", "food-ingredients/sodium-carboxymethyl-cellulose-cmc.html"],
      ["E282", "Calcium Propionate", "food-ingredients/calcium-propionate.html"],
      ["E330", "Citric Acid", "food-ingredients/citric-acid.html"]
    ],
    procurementTitle: "Confirm grade and specification before qualification",
    procurementAnswer: "A food additive name is not a complete approval basis: buyers should confirm chemical identity, food-grade standard, critical specification limits, intended use and destination-market status.",
    procurementText: "The same ingredient may be offered in different hydrates, particle sizes, viscosities, reaction rates or purity standards. A supplier document should be checked against the exact material, source and market being approved.",
    checks: [
      ["Identity & standard", "Confirm the full name, INS or E number where applicable, CAS number, grade and referenced food standard such as FCC or another agreed specification."],
      ["Critical parameters", "State the assay and functional limits that matter to your process, including moisture, pH, particle size, viscosity or reaction rate where relevant."],
      ["Compliance scope", "Verify permitted use, use level, labeling and destination-market requirements with your regulatory and quality teams."],
      ["Commercial supply", "Specify quantity, packing, palletization, destination port, required documents and requested shipment window."]
    ],
    safetyNote: "Food-grade status is product- and source-specific. It should not be inferred from the chemical name alone, and it does not remove the buyer's responsibility to verify local regulatory suitability.",
    related: ["animal-nutrition.html", "home-care-industrial-cleaning.html", "agricultural-fertilizers.html"],
    ctaText: "Send the product name, food-grade standard, target specification, quantity, packing and destination market for a more precise response."
  },
  {
    file: "animal-nutrition.html",
    title: "Feed Additives Supplier | Bespring Chemical",
    description: "Browse feed minerals, amino acids, organic acids, preservatives, liquid carriers and functional nutrients supplied for animal nutrition procurement.",
    name: "Feed Additives & Animal Nutrition Ingredients",
    shortName: "Animal Nutrition",
    eyebrow: "Feed-grade product portfolio",
    heroImage: "feedadditives.jpg",
    ogImage: "feedadditives-og.jpg",
    twitterImage: "feedadditives-twitter.jpg",
    imageAlt: "Feed additives and animal nutrition ingredients supplied by Bespring Chemical",
    heroLead: "Source feed minerals, amino acids, organic acids, preservatives, carriers and functional nutrients through a portfolio structured for technical and commercial qualification.",
    summaryTitle: "Feed materials organized for buyer review",
    directAnswer: "Bespring's animal nutrition portfolio includes mineral sources, amino acids, acidifiers, preservative ingredients, liquid carriers and functional nutrients.",
    summaryText: "Product suitability depends on species, feed type, formulation, grade and local feed regulations. This directory identifies offered material families; it does not prescribe inclusion rates or replace formulation and regulatory review.",
    catalogIntro: "Review the listed feed and formulation materials, then confirm grade, assay, physical form and applicable registration requirements.",
    categories: [
      { name: "Organic Acids & Acidifiers", items: ["Citric Acid", "Fumaric Acid"] },
      { name: "Antioxidant Ingredients", items: ["Ascorbic Acid (Vitamin C)", "Citric Acid"] },
      { name: "Preservative Ingredients", items: ["Citric Acid", "Potassium Sorbate"] },
      { name: "Macro Minerals & Buffers", items: ["Salt (Sodium Chloride)", "Sodium Bicarbonate", "Sodium Sulphate", "Monocalcium Phosphate (MCP)", "Dicalcium Phosphate (DCP)"] },
      { name: "Liquid Carriers & Energy Sources", items: ["Glycerin (Glycerol)", "Mono Propylene Glycol (MPG USP)"] },
      { name: "Amino Acids", items: ["DL-Methionine (DL-Met)", "L-Lysine", "L-Threonine", "L-Valine"] },
      { name: "Trace Mineral Sources", items: ["Copper Sulphate", "Manganese Derivatives", "Magnesium Derivatives", "Zinc Derivatives"] },
      { name: "Functional Nutrients", items: ["Betaine", "Choline Chloride"] }
    ],
    procurementTitle: "Qualify the exact feed-grade material",
    procurementAnswer: "For feed additive purchasing, confirm nutrient identity, assay, bioavailable form, carrier or concentration, contaminant limits and destination-market authorization.",
    procurementText: "Names such as lysine, choline chloride or mineral phosphate can represent materially different concentrations and physical forms. Comparison should be made against an agreed specification rather than product name or price alone.",
    checks: [
      ["Nutrient identity", "State the active compound, chemical form, concentration or assay and feed-grade standard required."],
      ["Physical form", "Confirm powder, granule or liquid form, particle-size needs, carrier system and handling characteristics."],
      ["Quality limits", "Define moisture and relevant impurity, heavy-metal, microbiological or dioxin limits where applicable."],
      ["Market requirements", "Provide the destination country, species or feed category, labeling needs and documents required by your approval process."]
    ],
    safetyNote: "Inclusion rate, species suitability and legal feed use must be determined by qualified nutrition and regulatory personnel. This portfolio is a supply directory, not feeding advice.",
    related: ["food-ingredients.html", "agricultural-fertilizers.html", "water-treatment.html"],
    ctaText: "Tell us the feed material, grade or concentration, target specification, packing, quantity and destination market."
  },
  {
    file: "home-care-industrial-cleaning.html",
    title: "Cleaning Chemicals Supplier | Bespring Chemical",
    description: "Browse surfactants, solvents, inorganic builders, acids, alkalis and bleaching agents for homecare and industrial cleaning chemical procurement.",
    name: "Homecare & Industrial Cleaning Chemicals",
    shortName: "Homecare & Industrial Cleaning",
    eyebrow: "Cleaning raw-material portfolio",
    heroImage: "homecareindustrialcleaning1.jpg",
    ogImage: "homecareindustrialcleaning-og.jpg",
    twitterImage: "homecareindustrialcleaning-twitter.jpg",
    imageAlt: "Homecare and industrial cleaning chemical raw materials",
    heroLead: "Browse surfactants, solvents, inorganic chemicals, acids, alkalis and bleaching agents with the product identity and commercial details needed for responsible sourcing.",
    summaryTitle: "Cleaning chemicals grouped by material family",
    directAnswer: "Bespring supplies surfactants, solvents, inorganic builders and salts, acids, alkalis and oxidizing or chlorine-based bleaching materials.",
    summaryText: "This page identifies raw materials available for procurement. Formulation performance, compatibility and safe use depend on concentration, product form and the full cleaning system, which should be assessed separately.",
    catalogIntro: "Search the portfolio by common name, chemical name or abbreviation.",
    categories: [
      { name: "Solvents & Carriers", items: ["Alcohols (Ethanol, Isopropanol etc.)", "Glycerin (Glycerol)", "Mono Propylene Glycol (MPG)"] },
      { name: "Inorganic Builders & Salts", items: ["Calcium Carbonate", "Calcium Chloride", "Soda Ash (Sodium Carbonate)", "Sodium Bicarbonate", "Sodium Silicate", "Sodium Sulphate"] },
      { name: "Surfactants", items: ["Benzalkonium Chloride (BAC)", "Linear Alkylbenzene Sulfonic Acid (LABSA)", "Sodium Lauryl Ether Sulfate (SLES)"] },
      { name: "Acids", items: ["Citric Acid", "Gluconic Acid", "Hydrochloric Acid", "Lactic Acid", "Phosphoric Acid"] },
      { name: "Alkalis", items: ["Caustic Potash (Potassium Hydroxide, KOH)", "Caustic Soda (Sodium Hydroxide, NaOH)"] },
      { name: "Bleaching & Oxidizing Agents", items: ["Hydrogen Peroxide (H₂O₂)", "Sodium Dichloroisocyanurate (SDIC)", "Sodium Percarbonate", "Trichloroisocyanuric Acid (TCCA)"] }
    ],
    procurementTitle: "Specify active content and physical form",
    procurementAnswer: "Cleaning-chemical quotations should identify active matter or concentration, physical form, key impurity limits, packing and dangerous-goods requirements.",
    procurementText: "Commercial names can cover different concentrations and grades. LABSA, SLES, hydrogen peroxide, hypochlorite-related materials and caustic alkalis require particularly clear concentration and transport information.",
    checks: [
      ["Chemical identity", "Provide the exact chemical name, CAS number where relevant and the commercial concentration or active content."],
      ["Formulation parameters", "State required pH, color, viscosity, solids, salt content or other critical limits used in incoming quality control."],
      ["Packing & compatibility", "Confirm drum, IBC, bag or other packing and check material compatibility for the concentration supplied."],
      ["Transport status", "Provide destination and shipment mode so classification, dangerous-goods documents and packing can be reviewed."]
    ],
    safetyNote: "Acids, alkalis, oxidizers and chlorine-releasing products can present serious handling and compatibility hazards. Review the current SDS and applicable transport classification before purchase and use.",
    related: ["water-treatment.html", "mining.html", "food-ingredients.html"],
    ctaText: "Send the chemical name, concentration, target parameters, packing, quantity and destination for an accurate commercial review."
  },
  {
    file: "water-treatment.html",
    title: "Water Treatment Chemicals Supplier | Bespring",
    description: "Browse water treatment coagulants, microbial-control chemicals and neutralizing amines supplied for industrial and municipal procurement.",
    name: "Water Treatment Chemicals",
    shortName: "Water Treatment",
    eyebrow: "Water-process chemical portfolio",
    heroImage: "watertreatment1.jpg",
    ogImage: "watertreatment-og.jpg",
    twitterImage: "watertreatment-twitter.jpg",
    imageAlt: "Water treatment chemicals supplied by Bespring Chemical",
    heroLead: "Browse coagulants, microbial-control materials and neutralizing amines by chemistry, then confirm concentration, form, specification and regulatory suitability for the exact water system.",
    summaryTitle: "Core chemistries for water-treatment procurement",
    directAnswer: "Bespring's water-treatment portfolio covers primary coagulants, oxidizing and non-oxidizing microbial-control materials, and amines used in condensate corrosion-control programs.",
    summaryText: "Chemical selection and dose depend on source-water chemistry, process conditions, discharge requirements and system metallurgy. This page is a product directory; treatability work and qualified technical review remain necessary.",
    catalogIntro: "Search by product name, chemical family or common abbreviation such as PAC, ACH or QAC.",
    categories: [
      { name: "Microbial, Algae & Mussel Control", items: ["Bleach (Sodium Hypochlorite)", "Calcium Hypochlorite", "Chlorine (Cl₂)", "Copper Sulfate", "Quaternary Ammonium Compounds (QACs)", "Sodium Bromide", "Peracetic Acid (PAA)"] },
      { name: "Neutralizing Amines & Condensate Control", items: ["Cyclohexylamine", "Diethanolamine (DEA)", "Diethanolaminoethanol (DEAE)", "Dimethylpropylamine (DMPA)", "Methoxypropylamine (MOPA)", "Monoethanolamine (MEA)", "Morpholine", "Octadecylamine"] },
      { name: "Coagulants & Primary Treatment", items: ["Alum (Aluminum Sulfate)", "Aluminum Chloride", "Aluminum Chlorohydrate (ACH)", "Aluminum Sulfate", "Diallyldimethylammonium Chloride (DADMAC)", "Ferric Chloride", "Ferric Sulfate", "Ferrous Chloride", "Ferrous Sulfate", "Inorganic/Organic Coagulant Blends", "Organic Coagulants", "Polyaluminum Chloride (PAC)", "Polyamine", "Sodium Aluminate"] }
    ],
    procurementTitle: "Match the chemistry to system conditions",
    procurementAnswer: "Water-treatment chemical sourcing should define active concentration, basicity or charge characteristics where relevant, impurity limits, physical form and intended water-system category.",
    procurementText: "Products with the same common name may differ in concentration, basicity, density or metal content. Jar testing, microbiological control studies or corrosion-program review may be required before commercial adoption.",
    checks: [
      ["Water-system context", "Identify municipal, industrial, cooling, boiler, process or wastewater service and provide relevant water-analysis data."],
      ["Product parameters", "Confirm active concentration, density, pH, basicity, charge density or other chemistry-specific parameters."],
      ["Regulatory route", "State whether the material may contact potable water, food operations or regulated discharge streams."],
      ["Logistics & storage", "Confirm bulk, IBC, drum or bag supply, destination, storage compatibility and dangerous-goods requirements."]
    ],
    safetyNote: "Biocides, oxidizers, chlorine products and amines require product-specific risk assessment. Never infer dosing, compatibility or potable-water approval from a portfolio listing.",
    related: ["home-care-industrial-cleaning.html", "mining.html", "agricultural-fertilizers.html"],
    ctaText: "Provide the water-system type, chemistry required, target specification, quantity, packing and destination."
  },
  {
    file: "mining.html",
    title: "Mining Chemicals Supplier | Bespring Chemical",
    description: "Browse flotation reagents, leaching chemicals, water-treatment materials and refining chemicals for mining and mineral processing procurement.",
    name: "Mining & Mineral Processing Chemicals",
    shortName: "Mining Chemicals",
    eyebrow: "Mineral-process chemical portfolio",
    heroImage: "mining1.jpg",
    ogImage: "mining-og.jpg",
    twitterImage: "mining-twitter.jpg",
    imageAlt: "Mining and mineral processing chemicals supplied by Bespring Chemical",
    heroLead: "Browse flotation reagents, leaching chemicals, water-treatment materials and refining inputs for specification-based mineral-process procurement.",
    summaryTitle: "Mining chemicals grouped by process stage",
    directAnswer: "Bespring's mining portfolio includes flotation collectors and frothers, pH modifiers, leaching inputs, water-treatment chemicals and selected smelting or refining materials.",
    summaryText: "This directory organizes purchasable chemistries. Reagent selection and operating conditions depend on ore mineralogy, water chemistry, flowsheet and metallurgical testing and should be established by qualified process personnel.",
    catalogIntro: "Search by chemical name, reagent family or abbreviation such as MIBC, PAX, PAC or SMBS.",
    categories: [
      { name: "Mine & Process Water Treatment", items: ["Aluminum Sulfate", "Caustic Soda (Sodium Hydroxide, NaOH)", "Ferric Chloride", "Flocculants", "Hydrochloric Acid (HCl)", "Polyaluminum Chloride (PAC)", "Quick Lime / Hydrated Lime (CaO / Ca(OH)₂)", "Soda Ash (Sodium Carbonate)", "Sodium Bicarbonate", "Sodium Hexametaphosphate (SHMP)", "Sodium Metabisulfite (SMBS)", "Sulfuric Acid (H₂SO₄)"] },
      { name: "Leaching Chemicals", items: ["Caustic Soda (NaOH)", "Copper Sulfate", "Hydrochloric Acid", "Hydrogen Peroxide (H₂O₂)", "Lead Nitrate", "Quick Lime / Hydrated Lime", "Soda Ash", "Sodium Metabisulfite", "Sulfuric Acid", "Thiocyanate", "Zinc Powder"] },
      { name: "Flotation Reagents", items: ["Carboxymethyl Cellulose (CMC)", "Dithiophosphate (DTP)", "Glycols", "Methyl Isobutyl Carbinol (MIBC)", "Sodium Hydrosulfide (NaHS)", "Sodium Metabisulfite", "Sodium Sulfide (Na₂S)", "Solvents", "Thiocarbamate", "Xanthates (PAX, SIPX, SIBX etc.)"] },
      { name: "Smelting & Electrowinning Inputs", items: ["Copper Sulfate", "Lead Oxide", "Soda Ash", "Sodium Nitrate", "Sulfamic Acid"] },
      { name: "Refining & Processing Chemicals", items: ["Calcium Chloride", "Glycols", "Potassium Carbonate", "Potassium Hydroxide (KOH)", "Soda Ash", "Sodium Bicarbonate", "Sodium Hexametaphosphate", "Sodium Metabisulfite", "Sodium Silicate", "Sodium Sulfate", "Solvents"] }
    ],
    procurementTitle: "Define reagent grade and process context",
    procurementAnswer: "Mining chemical requests should state the exact reagent, active content or purity, physical form, critical impurities, consumption estimate, packing and destination logistics.",
    procurementText: "Collector series, frother composition, lime reactivity, flocculant charge and molecular weight, and reagent concentration can materially affect qualification. Use plant or laboratory test results to define the required specification.",
    checks: [
      ["Ore & process context", "Identify commodity, ore type and process stage so commercial discussions use the correct reagent family and grade."],
      ["Reagent specification", "State active content, purity, solution strength, particle size or polymer characteristics relevant to the material."],
      ["Site logistics", "Provide monthly demand, packing, storage constraints, mine location, destination port and preferred Incoterm."],
      ["HSE documentation", "Request the current SDS, transport classification and handling information for the exact concentration and source."]
    ],
    safetyNote: "Many mining reagents are corrosive, toxic, oxidizing, flammable or dangerous to the environment. Selection, testing, storage and use require qualified metallurgical and HSE oversight.",
    related: ["water-treatment.html", "home-care-industrial-cleaning.html", "agricultural-fertilizers.html"],
    ctaText: "Send the reagent name, target grade, process context, monthly demand, packing and destination port."
  },
  {
    file: "agricultural-fertilizers.html",
    title: "Fertilizer Raw Materials Supplier | Bespring",
    description: "Browse MKP, DKP, MAP, DAP and potassium pyrophosphate fertilizer salts with procurement guidance for grade, nutrient analysis and packing.",
    name: "Phosphate Fertilizers & Fertilizer Salts",
    shortName: "Agricultural Fertilizers",
    eyebrow: "Fertilizer product portfolio",
    heroImage: "agriculture-fertilizers1.jpg",
    ogImage: "agriculture-fertilizers-og.jpg",
    twitterImage: "agriculture-fertilizers-twitter.jpg",
    imageAlt: "Phosphate fertilizer salts supplied by Bespring Chemical",
    heroLead: "Browse phosphate and potassium salts available for fertilizer procurement, with clear attention to grade, nutrient analysis, solubility, impurity limits and packing.",
    summaryTitle: "A focused phosphate fertilizer portfolio",
    directAnswer: "Bespring supplies monopotassium phosphate, dipotassium phosphate, monoammonium phosphate, diammonium phosphate and potassium pyrophosphate.",
    summaryText: "Each salt may be offered to different technical or fertilizer specifications. Confirm nutrient declaration, purity, water insolubles, chloride or heavy-metal limits and intended market before approval.",
    catalogIntro: "Review the phosphate fertilizer salts currently listed in this portfolio.",
    categories: [
      { name: "Phosphate Fertilizer Salts", items: ["Monopotassium Phosphate (MKP)", "Dipotassium Phosphate (DKP)", "Monoammonium Phosphate (MAP)", "Diammonium Phosphate (DAP)", "Potassium Pyrophosphate (TKPP)"] }
    ],
    procurementTitle: "Compare nutrient analysis, not abbreviation alone",
    procurementAnswer: "Fertilizer salt procurement should confirm the chemical grade, declared nutrient content, solubility, moisture, insolubles, impurity limits and particle-size or form requirements.",
    procurementText: "MAP, DAP and potassium phosphates can be supplied to different specifications. An abbreviation does not establish nutrient analysis, suitability for a particular fertilizer system or destination-market registration.",
    checks: [
      ["Chemical grade", "State fertilizer, technical or another required grade and provide the reference specification."],
      ["Nutrient declaration", "Confirm the phosphorus, potassium or nitrogen basis used for commercial comparison and labeling."],
      ["Purity & solubility", "Define moisture, water insolubles, chloride, heavy metals and particle-size limits where relevant."],
      ["Commercial details", "Provide quantity, bag size, palletization, destination, registration documents and shipment timing."]
    ],
    safetyNote: "Compatibility, crop use, nutrient rate and local fertilizer registration must be assessed separately. This page does not provide agronomic recommendations.",
    related: ["animal-nutrition.html", "food-ingredients.html", "water-treatment.html"],
    ctaText: "Send the fertilizer salt, grade, nutrient specification, quantity, packing and destination market."
  }
];

const pageByFile = Object.fromEntries(pages.map((page) => [page.file, page]));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function productMarkup(item, currentPage) {
  const link = currentPage.file === "food-ingredients.html" ? productDetailLinks[item] : null;
  return `<li data-product="${escapeHtml(item.toLowerCase())}">${link ? `<a href="${escapeHtml(link)}">${escapeHtml(item)}</a>` : escapeHtml(item)}</li>`;
}

function schemaFor(page) {
  const url = `${site}/products/${page.file}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: "en",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${site}/#website`,
          url: `${site}/`,
          name: "Bespring Chemical"
        },
        breadcrumb: {"@id": `${url}#breadcrumb`},
        mainEntity: {"@id": `${url}#product-list`},
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${site}/images/${page.ogImage}`
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {"@type": "ListItem", position: 1, name: "Home", item: `${site}/`},
          {"@type": "ListItem", position: 2, name: "Products", item: `${site}/products.html`},
          {"@type": "ListItem", position: 3, name: page.shortName, item: url}
        ]
      },
      {
        "@type": "ItemList",
        "@id": `${url}#product-list`,
        name: `${page.shortName} product families`,
        numberOfItems: page.categories.length,
        itemListElement: page.categories.map((category, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: category.name
        }))
      }
    ]
  };
}

function renderPage(page) {
  const url = `${site}/products/${page.file}`;
  const productCount = page.categories.reduce((sum, category) => sum + category.items.length, 0);
  const familyNav = page.categories.map((category) => `<a href="#${slugify(category.name)}">${escapeHtml(category.name)}</a>`).join("");
  const familyCards = page.categories.map((category) => `
        <article class="pc-family" id="${slugify(category.name)}" data-family="${escapeHtml(`${category.name} ${category.items.join(" ")}`.toLowerCase())}">
          <div class="pc-family__head">
            <h3>${escapeHtml(category.name)}</h3>
            <span>${category.items.length} ${category.items.length === 1 ? "material" : "materials"}</span>
          </div>
          <ul class="pc-products">${category.items.map((item) => productMarkup(item, page)).join("")}</ul>
        </article>`).join("");
  const dossiers = page.dossiers ? `
    <section class="pc-dossiers" aria-labelledby="dossier-heading">
      <div class="container">
        <div class="pc-dossiers__intro">
          <div><p class="pc-eyebrow">Detailed product dossiers</p><h2 id="dossier-heading">Review key food-grade materials in depth</h2></div>
          <p>Open a product page for identity, grade distinctions, reference specifications, packing, storage and buyer questions.</p>
        </div>
        <div class="pc-dossier-grid">
          ${page.dossiers.map(([code, name, href]) => `<a href="${escapeHtml(href)}"><span>${escapeHtml(code)}</span><strong>${escapeHtml(name)}</strong><small>Food grade</small></a>`).join("")}
        </div>
      </div>
    </section>` : "";
  const related = page.related.map((file) => {
    const relatedPage = pageByFile[file];
    return `<a href="${file}"><span>${escapeHtml(relatedPage.shortName)}</span><i class="fas fa-arrow-right" aria-hidden="true"></i></a>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta name="author" content="Bespring Chemical Co., Ltd.">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${url}">
  <link rel="alternate" href="${url}" hreflang="en">
  <link rel="alternate" href="${url}" hreflang="x-default">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Bespring Chemical">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${site}/images/${page.ogImage}">
  <meta property="og:image:alt" content="${escapeHtml(page.imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <meta name="twitter:image" content="${site}/images/${page.twitterImage}">
  <link rel="icon" href="../images/favicon.ico">
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/product-category-page.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <script type="application/ld+json">${JSON.stringify(schemaFor(page))}</script>
</head>
<body class="product-category">
  <a class="pc-skip-link" href="#main-content">Skip to product catalog</a>
  <div class="bs-seo-topbar">
    <div class="container bs-seo-topbar-container">
      <div class="bs-seo-topbar-left">
        <span class="bs-seo-highlight"><i class="fas fa-industry" aria-hidden="true"></i>China-based chemical and ingredient supplier</span>
        <span class="bs-seo-divider" aria-hidden="true">|</span>
        <span><i class="fas fa-globe" aria-hidden="true"></i> Exporting to 60+ countries</span>
      </div>
      <div class="bs-seo-topbar-right">
        <a href="mailto:info@bespringchem.com" class="bs-seo-contact"><i class="fas fa-envelope" aria-hidden="true"></i>info@bespringchem.com</a>
        <a href="tel:+8613914896109" class="bs-seo-contact"><i class="fas fa-phone" aria-hidden="true"></i>+86 139 1489 6109</a>
        <a href="https://wa.me/8613914896109" class="bs-seo-contact" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp" aria-hidden="true"></i>WhatsApp</a>
        <div class="bs-seo-language" aria-label="Language"><a href="${page.file}" class="active" lang="en" aria-current="page">EN</a></div>
      </div>
    </div>
  </div>
  <header class="site-header">
    <div class="container nav-container">
      <div class="logo"><a href="../index.html" aria-label="Bespring Chemical home"><img src="../images/logo.png" alt="Bespring Chemical"></a></div>
      <nav class="main-nav" aria-label="Main navigation"><ul>
        <li><a href="../index.html">Home</a></li>
        <li><a href="../about/company-profile.html">About Us</a></li>
        <li><a href="../products.html" aria-current="page">Products</a></li>
        <li><a href="../services.html">Services</a></li>
        <li><a href="../news.html">News</a></li>
        <li><a href="../contact.html" class="btn-nav">Contact</a></li>
      </ul></nav>
      <button class="hamburger" type="button" aria-label="Open navigation menu" aria-expanded="false"><i class="fas fa-bars" aria-hidden="true"></i></button>
    </div>
  </header>
  <main id="main-content">
    <section class="pc-hero" aria-labelledby="page-title">
      <div class="container pc-hero__inner">
        <nav class="pc-breadcrumb" aria-label="Breadcrumb"><ol>
          <li><a href="../index.html">Home</a></li>
          <li><a href="../products.html">Products</a></li>
          <li aria-current="page">${escapeHtml(page.shortName)}</li>
        </ol></nav>
        <div class="pc-hero__grid">
          <div>
            <p class="pc-eyebrow">${escapeHtml(page.eyebrow)}</p>
            <h1 id="page-title">${escapeHtml(page.name)}</h1>
            <p class="pc-hero__lead">${escapeHtml(page.heroLead)}</p>
            <div class="pc-hero__actions">
              <a class="pc-button pc-button--primary" href="#product-catalog">Browse materials <i class="fas fa-arrow-down" aria-hidden="true"></i></a>
              <a class="pc-button pc-button--outline" href="#procurement-guide">Prepare an inquiry</a>
            </div>
          </div>
          <div class="pc-hero__visual">
            <img class="pc-hero__image" src="../images/${page.heroImage}" alt="${escapeHtml(page.imageAlt)}">
            <div class="pc-hero__facts">
              <div><strong>${page.categories.length}</strong><span>product families</span></div>
              <div><strong>${productCount}</strong><span>listed materials</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="pc-summary" aria-labelledby="summary-title"><div class="container pc-summary__grid">
      <div><p class="pc-eyebrow">Portfolio scope</p><h2 id="summary-title">${escapeHtml(page.summaryTitle)}</h2></div>
      <div class="pc-summary__answer"><p><strong>${escapeHtml(page.directAnswer)}</strong></p><p>${escapeHtml(page.summaryText)}</p></div>
    </div></section>
    <section class="pc-catalog" id="product-catalog" aria-labelledby="catalog-title"><div class="container">
      <div class="pc-section-heading">
        <div><p class="pc-eyebrow">Product directory</p><h2 id="catalog-title">${escapeHtml(page.shortName)} products</h2></div>
        <p>${escapeHtml(page.catalogIntro)}</p>
      </div>
      <div class="pc-tools">
        <label class="pc-search"><i class="fas fa-magnifying-glass" aria-hidden="true"></i><span class="sr-only">Search this product portfolio</span><input type="search" id="catalog-search" placeholder="Search this portfolio by product or abbreviation" autocomplete="off"></label>
        <p class="pc-tools__count" aria-live="polite"><span id="visible-count">${productCount}</span> materials shown</p>
      </div>
      <nav class="pc-family-nav" aria-label="Product family shortcuts">${familyNav}</nav>
      <div class="pc-family-grid">${familyCards}</div>
      <p class="pc-no-results" id="no-results" hidden>No matching material is listed. Please send us the product name or specification for review.</p>
      <p class="pc-catalog__note"><strong>Portfolio note:</strong> Listings indicate sourcing scope, not guaranteed stock or universal grade availability. Confirm the exact product, specification, source, documentation and shipment terms for each inquiry.</p>
    </div></section>
    ${dossiers}
    <section class="pc-procurement" id="procurement-guide" aria-labelledby="procurement-title"><div class="container pc-procurement__grid">
      <div class="pc-procurement__copy">
        <p class="pc-eyebrow">Procurement guidance</p>
        <h2 id="procurement-title">${escapeHtml(page.procurementTitle)}</h2>
        <p class="pc-direct-answer"><strong>${escapeHtml(page.procurementAnswer)}</strong></p>
        <p>${escapeHtml(page.procurementText)}</p>
        <p class="pc-safety-note"><strong>Important:</strong> ${escapeHtml(page.safetyNote)}</p>
      </div>
      <div class="pc-checks">${page.checks.map(([title, text], index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div></article>`).join("")}</div>
    </div></section>
    <section class="pc-documents" aria-labelledby="documents-title"><div class="container">
      <div class="pc-section-heading"><div><p class="pc-eyebrow">Buyer documentation</p><h2 id="documents-title">Documents to align before approval</h2></div><p>Availability and scope depend on the exact product and source offered. Request current, applicable documents during qualification.</p></div>
      <div class="pc-document-grid">
        <article><span>SPEC</span><h3>Specification / TDS</h3><p>Product identity, grade, reference limits and technical characteristics for commercial review.</p></article>
        <article><span>SDS</span><h3>Safety Data Sheet</h3><p>Classification, handling, storage, transport and workplace-control information for the offered material.</p></article>
        <article><span>COA</span><h3>Certificate of Analysis</h3><p>Representative or batch-specific test results compared with the mutually agreed specification.</p></article>
        <article><span>CERT</span><h3>Applicable Certificates</h3><p>Current quality, product or site documents where relevant to the offered supply and destination.</p></article>
      </div>
    </div></section>
    <section class="pc-related" aria-labelledby="related-title"><div class="container">
      <div class="pc-related__head"><div><p class="pc-eyebrow">Continue browsing</p><h2 id="related-title">Related product portfolios</h2></div><a href="../products.html">View all products</a></div>
      <div class="pc-related__grid">${related}</div>
    </div></section>
    <section class="pc-cta" aria-labelledby="cta-title"><div class="container pc-cta__box">
      <div><p class="pc-eyebrow">Specification-led inquiry</p><h2 id="cta-title">Request a product and supply review</h2><p>${escapeHtml(page.ctaText)}</p></div>
      <div class="pc-cta__actions"><a class="pc-button pc-button--white" href="../contact.html">Send your requirements <i class="fas fa-paper-plane" aria-hidden="true"></i></a><a href="mailto:info@bespringchem.com">info@bespringchem.com</a></div>
    </div></section>
  </main>
  <footer class="crc-footer">
    <div class="container footer-grid">
      <div class="footer-col"><h3>Bespring Chemical</h3><p>China-based supplier of food, feed and industrial chemical raw materials for global B2B procurement.</p><ul class="social-icons1"><li><a href="https://www.facebook.com/profile.php?id=61560682190445" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fab fa-facebook-f" aria-hidden="true"></i></a></li><li><a href="https://www.linkedin.com/company/bespring" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fab fa-linkedin-in" aria-hidden="true"></i></a></li></ul></div>
      <div class="footer-col footer-links"><h3>Quick Links</h3><ul><li><a href="../about/company-profile.html">About Us</a></li><li><a href="../products.html">Products</a></li><li><a href="../services.html">Services</a></li><li><a href="../news.html">News</a></li></ul></div>
      <div class="footer-col"><h3>Contact Us</h3><p><i class="fas fa-phone-alt" aria-hidden="true"></i> Sales: <a href="tel:+8613914896109">+86 139 1489 6109</a></p><p><i class="fas fa-phone-alt" aria-hidden="true"></i> Office: <a href="tel:+8651683579827">+86 516 83579827</a></p><p><i class="fas fa-envelope" aria-hidden="true"></i> <a href="mailto:info@bespringchem.com">info@bespringchem.com</a></p><p><i class="fas fa-location-dot" aria-hidden="true"></i> Ruixing North Road, Yunhe Town, Pizhou City, Jiangsu Province, China</p><a href="../contact.html" class="contact-btn-footer"><i class="fas fa-paper-plane" aria-hidden="true"></i> Get in Touch</a></div>
    </div>
    <div class="footer-bottom">&copy; 2026 Bespring Chemical Co., Ltd. All rights reserved.</div>
  </footer>
  <script>
    const hamburger = document.querySelector(".hamburger");
    const navigation = document.querySelector(".main-nav");
    hamburger.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", String(isOpen));
      hamburger.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });

    const search = document.getElementById("catalog-search");
    const families = [...document.querySelectorAll(".pc-family")];
    const visibleCount = document.getElementById("visible-count");
    const noResults = document.getElementById("no-results");
    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();
      let count = 0;
      let visibleFamilies = 0;
      families.forEach((family) => {
        const items = [...family.querySelectorAll("[data-product]")];
        let familyMatches = false;
        items.forEach((item) => {
          const matches = !query || item.dataset.product.includes(query) || family.querySelector("h3").textContent.toLowerCase().includes(query);
          item.hidden = !matches;
          if (matches) {
            count += 1;
            familyMatches = true;
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

for (const page of pages) {
  await writeFile(path.join(workspace, "products", page.file), renderPage(page), "utf8");
}

console.log(`Generated ${pages.length} product category pages.`);

import { access, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const esRoot = path.join(root, "es");

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const words = [
  ["quimicos", "químicos"], ["quimicas", "químicas"], ["quimico", "químico"], ["quimica", "química"],
  ["informacion", "información"], ["documentacion", "documentación"],
  ["exportacion", "exportación"], ["aplicacion", "aplicación"],
  ["aplicaciones", "aplicaciones"], ["especificacion", "especificación"],
  ["calificacion", "homologación"], ["produccion", "producción"],
  ["cotizacion", "cotización"], ["paises", "países"], ["pais", "país"],
  ["mineria", "minería"], ["guia", "guía"], ["guias", "guías"],
  ["tecnico", "técnico"], ["tecnica", "técnica"], ["tecnicos", "técnicos"],
  ["analisis", "análisis"], ["metodo", "método"], ["metodos", "métodos"],
  ["parametros", "parámetros"], ["limites", "límites"], ["fisica", "física"],
  ["solucion", "solución"], ["nutricion", "nutrición"], ["fosforo", "fósforo"],
  ["calcio", "calcio"], ["acido", "ácido"], ["acidez", "acidez"],
  ["panaderia", "panadería"], ["lacteos", "lácteos"], ["bebidas", "bebidas"],
  ["numero", "número"], ["tamano", "tamaño"], ["particula", "partícula"],
  ["particulas", "partículas"], ["humedad", "humedad"], ["embalaje", "embalaje"],
  ["validez", "validez"], ["rapidas", "rápidas"], ["practica", "práctica"],
  ["practico", "práctico"], ["Moscu", "Moscú"], ["concluyo", "concluyó"],
  ["participo", "participó"], ["exposicion", "exposición"], ["arsenico", "arsénico"],
  ["fluoruro", "fluoruro"], ["pagina", "página"], ["portafolio", "catálogo"],
  ["importacion", "importación"], ["clasificacion", "clasificación"],
  ["comparacion", "comparación"], ["carnico", "cárnico"], ["avicola", "avícola"],
  ["caracteristicas", "características"], ["revision", "revisión"],
  ["concentracion", "concentración"], ["aprobacion", "aprobación"],
  ["envio", "envío"], ["envios", "envíos"], ["operacion", "operación"],
  ["poliza", "póliza"], ["especificas", "específicas"], ["emision", "emisión"],
  ["automaticamente", "automáticamente"], ["mercancias", "mercancías"],
  ["funcion", "función"], ["formula", "fórmula"], ["sodicos", "sódicos"],
  ["vitreo", "vítreo"], ["comunmente", "comúnmente"], ["hidratacion", "hidratación"],
  ["desempeno", "desempeño"], ["seleccion", "selección"], ["composicion", "composición"],
  ["granulo", "gránulo"], ["disolucion", "disolución"], ["alimentacion", "alimentación"],
  ["proteccion", "protección"], ["articulo", "artículo"], ["asesoria", "asesoría"],
  ["formulacion", "formulación"], ["logisticos", "logísticos"], ["calificados", "cualificados"],
  ["ubicacion", "ubicación"], ["ofrecio", "ofreció"], ["planificacion", "planificación"],
  ["conversacion", "conversación"], ["estan", "están"], ["revisara", "revisará"],
  ["segun", "según"], ["validacion", "validación"], ["precision", "precisión"],
  ["disenado", "diseñado"], ["mas", "más"], ["alla", "allá"],
  ["rapidos", "rápidos"], ["Contactenos", "Contáctenos"],
  ["Quien", "Quién"], ["Cual", "Cuál"],
  ["Como", "Cómo"], ["Que", "Qué"], ["Guia", "Guía"], ["Por que", "Por qué"],
  ["Cuentenos", "Cuéntenos"], ["Diganos", "Díganos"], ["Envienos", "Envíenos"]
];

for (const file of await walk(esRoot)) {
  let html = await readFile(file, "utf8");
  for (const [from, to] of words) {
    html = html.replace(new RegExp(`\\b${from}\\b`, "g"), to);
  }
  html = html.replaceAll("All rights reserved.", "Todos los derechos reservados.");
  html = html.replaceAll("Exportando a mas de 60 países", "Exportamos a más de 60 países");
  html = html.replaceAll("Navegacion principal", "Navegación principal");
  html = html.replaceAll("Abrir menu de navegacion", "Abrir el menú de navegación");
  html = html.replaceAll("Cerrar menu de navegacion", "Cerrar el menú de navegación");
  html = html.replaceAll("Miga de pan", "Ruta de navegación");
  html = html.replaceAll('open?"Close navigation menu":"Open navigation menu"', 'open?"Cerrar el menú de navegación":"Abrir el menú de navegación"');
  html = html.replaceAll("Ho Chi Minh City, Vietnam", "Ciudad Ho Chi Minh, Vietnam");
  html = html.replaceAll("Frankfurt, Germany", "Fráncfort, Alemania");
  html = html.replaceAll("Fi Europe 2023 en Frankfurt", "Fi Europe 2023 en Fráncfort");
  html = html.replaceAll("STPP builder para detergentes en polvo", "STPP como coadyuvante en detergentes en polvo");
  html = html.replaceAll("Fosfatos grado alimentario vs grado técnico", "Fosfatos de grado alimentario frente a grado técnico");
  html = html.replaceAll("Cómo calificar a un proveedor químico", "Cómo homologar a un proveedor químico");
  html = html.replaceAll("Lista de documentos para importar productos químicos | Bespring Chemical", "Documentos para importar productos químicos | Bespring");
  html = html.replaceAll("Fosfatos de grado alimentario frente a grado técnico | Bespring Chemical", "Fosfatos alimentarios frente a técnicos | Bespring");
  html = html.replaceAll("Bespring Chemical participó en Vietfood & Beverage 2023 en Ciudad Ho Chi Minh del 10 al 12 de agosto en el stand A3.127. Lugar del evento, información del stand y enfoque del catálogo.", "Participación de Bespring Chemical en Vietfood & Beverage 2023, Ciudad Ho Chi Minh, del 10 al 12 de agosto, stand A3.127.");
  html = html.replaceAll(">Sales:", ">Ventas:");
  html = html.replaceAll(">Office:", ">Oficina:");
  html = html.replaceAll("Ruixing North Road, Yunhe Town, Pizhou City, Jiangsu Province, China", "Carretera Ruixing Norte, Yunhe, Pizhou, Jiangsu, China");
  html = html.replaceAll("Proveedor chino de productos químicos ", "Proveedor chino de productos químicos");
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((value) => !/^(?:https?:|mailto:|tel:|#)/i.test(value))
    .map((value) => value.split(/[?#]/, 1)[0]);
  for (const ref of new Set(refs)) await access(path.resolve(path.dirname(file), ref));
  await writeFile(file, html, "utf8");
}
console.log("Polished Spanish copy across all localized HTML pages.");

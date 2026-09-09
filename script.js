"use strict";

// Edit this data to update labels or add reviewed annotations.
// Anotaciones de la usuaria contrastadas con el texto oficial de BCN el 08-09-2026.
const nodos = [
  { id: "inicio", titulo: "INICIO", nota: "", norma: "", url: "" },
  { id: "cotizacion", titulo: "SE COTIZA CON PROVEEDOR NACIONAL", nota: "", norma: "", url: "" },
  { id: "acuerdo", titulo: "SE ACUERDA LA COMPRA CON PROVEEDOR NACIONAL", nota: "El momento del pago depende de las condiciones comerciales acordadas con el proveedor.", norma: "", url: "" },
  { id: "pago", titulo: "IBERIA PAGA NETO + IVA", nota: "Salida de caja según el plazo pactado: pago anticipado, al contado, a 30 días, a 60 días, etc. Su ubicación lateral no fija el momento del pago.", norma: "", url: "", etiqueta: "EVENTO DE CAJA · MOMENTO VARIABLE", aclaracion: "Anticipado · contado · 30 / 60 días, etc. Según el plazo pactado." },
  { id: "factura", titulo: "PROVEEDOR EMITE FACTURA ELECTRÓNICA AFECTA A IVA", nota: "Factura y recepción se agrupan sin establecer un orden temporal o legal rígido entre ambas.", norma: "", url: "" },
  { id: "recepcion", titulo: "IBERIA RECIBE LA MERCADERÍA", nota: "La posición de este nodo no exige que la recepción ocurra después de la emisión de la factura.", norma: "", url: "" },
  { id: "credito", titulo: "IBERIA REGISTRA IVA COMO CRÉDITO FISCAL", nota: "El pago al proveedor no genera por sí mismo el crédito fiscal. El diagrama no desarrolla los requisitos tributarios aplicables.", norma: "", url: "", aclaracion: "Cuando corresponda. No se origina por el solo hecho de pagar." },
  { id: "fin", titulo: "FIN", nota: "", norma: "", url: "" }
];

const fuenteIVA = "https://www.bcn.cl/leychile/navegar?idNorma=6369";
// Mantener norma y url como campos simples facilita modificar o exportar los nodos.
const anotaciones = {
  inicio: { nota: "Inicio de la ruta de adquisición. Es un marcador del diagrama; no requiere respaldo normativo.", norma: "No aplica: inicio del proceso.", url: "" },
  cotizacion: { nota: "Etapa comercial previa: permite conocer precio y condiciones que afectarán el costo y la caja de Iberia. La cotización por sí sola no genera IVA, crédito fiscal ni obligación de emitir factura.", norma: "No aplica norma tributaria específica a esta etapa comercial.", url: "" },
  acuerdo: { nota: "Se acuerdan precio, cantidad y condiciones de adquisición, sin exigir que exista una orden de compra formal. El acuerdo por sí solo no otorga crédito fiscal. Las condiciones de pago determinan el flujo de caja, dentro del marco legal aplicable; este nodo no establece un plazo legal de pago.", norma: "No aplica norma tributaria específica al acuerdo comercial representado.", url: "" },
  factura: { nota: "Por qué factura: la operación modelada es una venta a Iberia, otro vendedor (arts. 52 y 53 letra a).\n\nPor qué electrónica: es la regla general del art. 54. Las excepciones por falta de conectividad, electricidad o zona de catástrofe se sujetan al mecanismo del SII previsto en ese artículo; no son el escenario de esta ruta.\n\nCuándo: en ventas de mercadería, la regla es emitir al efectuar la entrega real o simbólica (art. 55). Si la factura se posterga conforme a ese artículo, la entrega se respalda con guía de despacho. Por eso no se dibuja una secuencia obligatoria factura → recepción física.", norma: "DL 825 · arts. 52, 53 letra a), 54 y 55.", url: fuenteIVA },
  recepcion: { nota: "Iberia recibe la mercadería. La entrega debe quedar respaldada por factura o, si esta no se emite en ese momento, por la guía de despacho correspondiente. El art. 55 contempla entrega real o simbólica: la ubicación de los nodos no impone que la factura preceda a la recepción física.", norma: "DL 825 · art. 55.", url: fuenteIVA },
  pago: { nota: "Iberia paga el precio neto más IVA, según las condiciones de pago aplicables.\n\nEjemplo: neto $100.000 + IVA $19.000 = salida de caja $119.000. La tasa de 19% está en el art. 14.\n\nEl pago puede ser anticipado, al contado o a plazo; 30 y 60 días son escenarios comerciales sujetos a las reglas de pago aplicables, no plazos autorizados por el art. 14. Su posición lateral no fija el momento del desembolso ni lo convierte en requisito que genere el crédito fiscal.", norma: "DL 825 · art. 14 (tasa de IVA: 19%; no regula el plazo de pago).", url: fuenteIVA },
  credito: { nota: "El IVA recargado en la compra de mercadería destinada a la actividad afecta de Iberia puede utilizarse como crédito contra el IVA de sus ventas, cumpliendo los requisitos legales.\n\nEjemplo: compra neta $100.000 + IVA $19.000 → crédito fiscal de $19.000, si procede. Se habla de IVA recargado, para no sugerir que deba estar pagado al proveedor.\n\nEl art. 23 N.º 1 vincula el crédito con las adquisiciones destinadas al activo realizable, activo fijo o gastos relacionados con el giro. Para la factura electrónica de esta compra, el N.º 7 vincula el período del crédito con el acuse de recibo o con que la mercadería se entienda recibida conforme a la remisión legal que contiene. No basta con pagar: deben cumplirse los requisitos de la compra, de la factura y de recepción/acuse correspondientes. Este resumen no agota las restricciones del art. 23.", norma: "DL 825 · art. 23 N.º 1 y N.º 7.", url: fuenteIVA },
  fin: { nota: "Cierre de la ruta representada. No indica que el pago deba haber ocurrido antes del crédito fiscal ni requiere respaldo normativo propio.", norma: "No aplica: cierre del proceso.", url: "" }
};
for (const nodo of nodos) Object.assign(nodo, anotaciones[nodo.id]);

const diagram = document.querySelector("#diagram");
const dialog = document.querySelector("#node-detail");
const notes = document.querySelector("#annotations");
const toggle = document.querySelector("#toggle-notes");

function element(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

// DOM textContent keeps future annotation text separate from HTML markup.
function appendDetails(container, data) {
  if (data.nota) for (const paragraph of data.nota.split("\n\n")) container.append(element("p", "", paragraph));
  if (data.norma) container.append(element("p", "legal-basis", data.norma));
  if (data.url) {
    try {
      const url = new URL(data.url);
      if (["https:", "http:"].includes(url.protocol)) {
        const link = element("a", "", data.fuente || "Abrir DL 825 en BCN · consultar los artículos indicados");
        link.href = url.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        container.append(link);
      }
    } catch { /* Leave invalid URLs unlinked until corrected. */ }
  }
  for (const ref of data.referencias || []) {
    appendDetails(container, { nota: "", norma: ref.norma, url: ref.url, fuente: ref.fuente || "Consultar fuente oficial" });
  }
  if (!data.nota && !data.norma && !data.url) container.append(element("p", "", "Sin anotaciones adicionales."));
}

function createNode(id, classes = "", dataset = nodos) {
  const data = dataset.find(node => node.id === id);
  const node = element("button", `node ${classes}`);
  node.type = "button";
  node.id = data.id;
  node.setAttribute("aria-haspopup", "dialog");
  node.setAttribute("aria-label", `${data.titulo}. Ver detalle`);
  // Native tooltip on hover; click, Enter or Space opens a touch-accessible detail.
  node.title = [data.norma, data.nota].filter(Boolean).join("\n\n");
  if (data.etiqueta) node.append(element("span", "node-label", data.etiqueta));
  node.append(element("span", "node-title", data.titulo));
  if (data.aclaracion) node.append(element("span", "essential", data.aclaracion));
  if (data.url) node.append(element("span", "node-source", data.norma));
  else if (!["inicio", "fin"].includes(id) && !id.startsWith("b-inicio") && !id.startsWith("b-fin")) node.append(element("span", "node-source", data.norma || "Sin norma tributaria específica"));
  node.addEventListener("click", () => {
    document.querySelector("#detail-title").textContent = data.titulo;
    const content = document.querySelector("#detail-content");
    content.replaceChildren();
    appendDetails(content, data);
    dialog.showModal();
  });
  return node;
}

function arrow() {
  const line = element("div", "arrow");
  line.setAttribute("aria-hidden", "true");
  diagram.append(line);
}

function renderA() {
diagram.append(createNode("inicio", "terminal main-node"));
arrow();
diagram.append(createNode("cotizacion", "main-node"));
arrow();
diagram.append(createNode("acuerdo", "agreement"));
const cash = element("aside", "cash");
cash.setAttribute("aria-label", "Evento de caja asociado al acuerdo; momento variable");
cash.append(createNode("pago"));
diagram.append(cash);
arrow();

// No directed edge between invoice and receipt: the pair is a conceptual group.
const pair = element("section", "pair");
pair.setAttribute("aria-label", "Documentación y recepción, sin orden fijo entre ambas");
pair.append(element("h2", "pair-header", "DOCUMENTACIÓN Y RECEPCIÓN"));
const pairNodes = element("div", "pair-nodes");
pairNodes.append(createNode("factura"), createNode("recepcion"));
pair.append(pairNodes, element("p", "pair-caption", "Sin orden fijo entre factura y recepción. La disposición no implica simultaneidad ni una secuencia legal obligatoria."));
diagram.append(pair);
arrow();
diagram.append(createNode("credito", "main-node credit"));
arrow();
diagram.append(createNode("fin", "terminal main-node"));
}

function renderNotes(dataset) {
notes.replaceChildren();
notes.append(element("h2", "", "Anotaciones y fundamento normativo"));
notes.append(element("p", "", "Fuentes oficiales consultadas el 08-09-2026. Las precisiones de implementación se indican en los nodos correspondientes. Pulsa un nodo para abrir su explicación y fuente."));
for (const data of dataset.filter(node => node.nota || node.norma || node.url)) {
  const item = element("section");
  item.append(element("h3", "", data.titulo));
  appendDetails(item, data);
  notes.append(item);
}
}
toggle.addEventListener("click", () => {
  notes.hidden = !notes.hidden;
  toggle.setAttribute("aria-pressed", String(!notes.hidden));
  toggle.textContent = notes.hidden ? "Mostrar anotaciones" : "Ocultar anotaciones";
});
document.querySelector("#close-detail").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

// RUTA B. Fuentes de procedimiento, modificación, implementación y recuperación.
// No se reutiliza la Res. 74/1984 como fundamento universal vigente.
const fuentesB = {
  manual: "https://www.aduana.cl/aduana/site/docs/20200915/20200915161445/manual_zona_franca_con_anexos_v20200807.pdf",
  modificacion: "https://www.aduana.cl/aduana/site/docs/20191202/20191202145000/resolucion_1172_2025_modificacion_resolucion_2806_2020.pdf",
  calendario: "https://www.diariooficial.interior.gob.cl/publicaciones/2026/02/09/44371/01/2762094.pdf",
  zofri: "https://www.zofri.cl/es/nna",
  ley: "https://www.bcn.cl/leychile/navegar?idNorma=29631",
  recuperacion: "https://www.bcn.cl/leychile/navegar?idNorma=17186"
};
const implementacion = "La nomenclatura del Manual es DSZF. La Res. 358/2026 establece un calendario por grupos de usuarios de Iquique y ZOFRI publica otras modificaciones y postergaciones. Confirma con el usuario vendedor el procedimiento habilitado para su operación; no se afirma que SRF haya desaparecido universalmente ni que toda la salida electrónica estuviera implementada en marzo de 2025.";
const refImplementacion = [
  { norma: "Res. 358/2026 · calendario de implementación para Iquique (extracto oficial).", url: fuentesB.calendario },
  { norma: "ZOFRI · normativa e implementación, incluidas publicaciones de 2026.", url: fuentesB.zofri }
];
function datoB(id, titulo, nota, norma, row, col = 2, extra = {}) {
  return { id: `b-${id}`, titulo, nota, norma, url: fuentesB.manual,
    fuente: "Abrir Manual de Zona Franca · Res. 2806/2020", row, col, ...extra };
}
const nodosB = [
  datoB("inicio", "INICIO", "Inicio de la Ruta B. Marcador del diagrama sin efecto jurídico propio.", "No aplica.", 1, 2, { url: "", tipo: "terminal" }),
  datoB("mercaderia", "MERCADERÍA EXTRANJERA EN RECINTO AMURALLADO ZOFRI", "La mercadería ya está almacenada en ZOFRI Iquique bajo régimen de zona franca. Iberia la comprará para llevarla a Arica/ZFE. Su presencia física en Chile no equivale a una importación al régimen general: mientras permanece bajo el régimen se aplica la presunción de extraterritorialidad aduanera.", "Res. 2806/2020 · Cap. I, párr. 2 N.º 4 y párr. 4 N.º 5.", 2),
  datoB("compra", "COTIZACIÓN Y ACUERDO DE COMPRA CON USUARIO ZOFRI", "Iberia acuerda mercadería, cantidad, precio y condiciones de pago con el usuario vendedor. Es una etapa comercial previa; no determina por sí sola que la mercancía pueda salir. Se identifica al usuario ZOFRI porque es quien confecciona y tramita el documento de salida.", "Etapa comercial · sin norma tributaria específica.", 3, 2, { url: "", referencias: [{ norma: "Responsable del documento: Manual, Cap. III, párr. 2 N.º 6.", url: fuentesB.manual }] }),
  datoB("art11", "USUARIO ZOFRI RETIENE ART. 11 EN LA VENTA", "El impuesto del art. 11 grava la importación de mercancía extranjera a ZFE. El usuario vendedor lo retiene al momento de la venta y lo entera al Fisco en los plazos de declaración y pago de IVA. Su base es el valor CIF de la mercancía, que no debe confundirse automáticamente con el precio de compra.\n\nPara Iberia: el desembolso asociado a la adquisición comprende mercadería más art. 11 retenido, sin modelar aquí otros gastos. Las fechas efectivas de los pagos dependen de las condiciones aplicables. La asociación lateral no posterga la retención hasta la salida física. No se fija una tasa en este diagrama: debe verificarse la vigente para la fecha de la operación.", "Ley 18.211 · art. 11; Manual, Cap. III, párr. 2 N.º 4.", 3, 3, { tipo: "event", url: fuentesB.ley, fuente: "Abrir Ley 18.211 · art. 11", etiqueta: "EVENTO TRIBUTARIO / CAJA", aclaracion: "Base CIF · retención en la venta", referencias: [{ norma: "Manual · Cap. III, párr. 2 N.º 4; Res. 1172/2025, apartado I.2.b (modificación).", url: fuentesB.modificacion }, { norma: "Calendario y modificaciones de implementación publicadas por ZOFRI.", url: fuentesB.zofri }] }),
  datoB("destino", "DESTINO DE LA COMPRA: ARICA / ZFE", "El destino determina que se tramite una salida de zona franca a su zona franca de extensión. Esta ruta representa mercancía extranjera destinada a Arica/ZFE, no una importación directa de Iberia desde el extranjero ni una salida al resto del país.", "Res. 2806/2020 · Cap. III, párr. 2 N.º 1 y N.º 5.", 4, 2, { referencias: [{ norma: "Ley 18.211 · art. 11.", url: fuentesB.ley }] }),
  datoB("credito", "ART. 11: POSIBLE RECUPERACIÓN COMO CRÉDITO FISCAL", "Puede recuperarse bajo los requisitos aplicables a contribuyentes establecidos en ZFE y sujetos al IVA. El Decreto 1197/1995 exige registrar separadamente el impuesto retenido, con número y fecha del documento y valor CIF; el vendedor también debe consignarlo separadamente.\n\nEl impuesto que da derecho a crédito se adiciona al crédito fiscal del período respectivo. Un saldo no recuperado incrementa el remanente del período siguiente. Esta recuperación no equivale a recibir efectivo inmediatamente ni es un requisito para autorizar la salida física.", "Ley 18.211 · art. 11; Decreto 1197/1995 · arts. 1–3.", 5, 3, { tipo: "event", url: fuentesB.recuperacion, fuente: "Abrir Decreto 1197/1995 · arts. 1–3", etiqueta: "TRATAMIENTO TRIBUTARIO", aclaracion: "Sujeto a requisitos · no es devolución inmediata", referencias: [{ norma: "Ley 18.211 · art. 11, recuperación como crédito fiscal.", url: fuentesB.ley }] }),
  datoB("documento", "USUARIO ZOFRI CONFECCIONA DOCUMENTO DE SALIDA A ZFE", "El usuario vendedor prepara los antecedentes que respaldan la salida. El Manual denomina este documento Declaración de Salida de Zona Franca (DSZF), destinada a ZFE; su formato se regula en el Anexo 2.\n\n" + implementacion, "Res. 2806/2020 · Cap. III, párr. 2 N.º 5–6 y Anexo 2.", 5, 2, { referencias: refImplementacion }),
  datoB("transmite", "USUARIO ZOFRI TRAMITA DOCUMENTO ELECTRÓNICAMENTE", "El vendedor transmite el documento por el sistema de tramitación electrónica de la sociedad administradora, integrado con Aduanas. El procedimiento admite al usuario o a su agente cuando interviene; no impone un honorario de agente por cada compra de esta ruta.\n\n" + implementacion, "Res. 2806/2020 · Cap. III, párr. 2 N.º 6; Cap. I, párr. 7 N.º 3 y N.º 7.", 6, 2, { referencias: refImplementacion }),
  datoB("visa", "ZOFRI / SISTEMA VALIDA Y VISA DOCUMENTO DE SALIDA", "El sistema valida la información y otorga la visación si corresponde. Si rechaza el documento, comunica electrónicamente los fundamentos al usuario para su corrección. La visación de la sociedad administradora y la legalización de Aduanas son actuaciones distintas; no se representan como un timbre manual.", "Res. 2806/2020 · Cap. III, párr. 2 N.º 6 y N.º 8.", 7),
  datoB("corrige", "USUARIO CORRIGE EL DOCUMENTO", "Ante el rechazo comunicado por el sistema, el usuario atiende sus fundamentos y vuelve a tramitar el documento. La flecha de retorno representa esta corrección; no autoriza a modificar libremente una declaración una vez notificado un acto de fiscalización.", "Res. 2806/2020 · Cap. III, párr. 2 N.º 6; Cap. I, párr. 13 N.º 5.", 7, 1),
  datoB("legaliza", "ADUANAS RECIBE, VERIFICA Y LEGALIZA LA DECLARACIÓN", "Una vez visada, la declaración se envía a Aduanas para su legalización. El Manual vincula esta actuación con presentación, recepción, verificación y aceptación a trámite. La operación queda sujeta al tipo de inspección y a los controles que correspondan.", "Res. 2806/2020 · Cap. III, párr. 2 N.º 8; Cap. I, párr. 7 N.º 5.", 8),
  datoB("inspeccion", "¿OPERACIÓN SELECCIONADA PARA INSPECCIÓN?", "El Manual dispone que las mercancías seleccionadas para algún tipo de inspección concurran al punto de control antes del despacho. La fiscalización puede ser documental, física o apoyarse en medios no invasivos.\n\nLa gestión de riesgo y los perfiles regionales o nacionales orientan el control; la autoridad puede elevar el tipo de inspección. No se ha identificado una probabilidad pública fija específica para esta ruta en las fuentes consultadas. Para parametrizarla, Iberia necesitaría antecedentes históricos propios. Ser seleccionado no prueba una falta de Iberia.", "Res. 2806/2020 · Cap. III, párr. 2 N.º 9; Cap. I, párr. 13 N.º 4, 6 y 7.", 9, 2, { tipo: "decision" }),
  datoB("presenta", "MERCADERÍA Y DOCUMENTO SE PRESENTAN AL CONTROL", "Si corresponde inspección, la mercadería y sus antecedentes concurren al punto de control dispuesto por Aduanas. No se atribuye necesariamente la ejecución física de este trámite a Iberia. La ruta no obliga a pasar por este punto a una operación no seleccionada.", "Res. 2806/2020 · Cap. III, párr. 2 N.º 9 y N.º 14.", 10),
  datoB("verifica", "ADUANAS VERIFICA DOCUMENTO Y ANTECEDENTES", "En la operación sometida a control, Aduanas verifica la correspondencia de los antecedentes. Una diferencia documental también puede requerir medidas: la rama sin revisión física no equivale a una autorización incondicional.", "Res. 2806/2020 · Cap. III, párr. 2 N.º 14–15; Cap. I, párr. 13.", 11),
  datoB("fisica", "¿CORRESPONDE REVISIÓN FÍSICA?", "La inspección física depende de la selectividad y de las decisiones de fiscalización de Aduanas. No es una elección de Iberia.\n\nNo se fija probabilidad, duración promedio ni tarifa. El Manual prevé un plazo de presentación para fiscalización que no puede exceder 48 horas desde la notificación; ese plazo no es la duración de la revisión ni una promesa de liberación en 48 horas. No se agrega un costo obligatorio de agente solo por ser seleccionado; eso tampoco significa que todos los costos operativos sean cero.", "Res. 2806/2020 · Cap. I, párr. 13 N.º 4, 6 y 7; Cap. III, párr. 2 N.º 9.", 12, 2, { tipo: "decision" }),
  datoB("reconoce", "ADUANAS REALIZA RECONOCIMIENTO FÍSICO", "Aduanas compara la mercadería presentada con lo declarado y sus documentos: cantidad, tipo o naturaleza de las mercancías, entre otros antecedentes pertinentes. Puede existir espera adicional; su duración debe medirse con información operativa, no suponerse como un valor normativo.", "Res. 2806/2020 · Cap. I, párr. 13 N.º 6–8; Cap. III, párr. 2 N.º 9.", 13),
  datoB("conforme", "¿MERCADERÍA / DOCUMENTOS CONFORMES?", "El resultado del control se evalúa según la inspección practicada. Si existen diferencias entre lo declarado, la mercadería o los documentos, se aplica la rama de denuncia y retención. Una denuncia no significa automáticamente una condena por contrabando: la calificación y resolución corresponden a las autoridades competentes.", "Res. 2806/2020 · Cap. III, párr. 2 N.º 15; Cap. I, párr. 13 N.º 17.", 14, 2, { tipo: "decision" }),
  datoB("retiene", "ADUANAS FORMULA DENUNCIA Y RETIENE MERCADERÍA / MEDIO DE TRANSPORTE", "El numeral 15 dispone denuncia ante diferencias entre declaración, mercancía y/o documentos, y retención de la mercancía y su medio de transporte hasta resolver la situación ante Aduanas. Es un evento condicionado a esas diferencias, no una consecuencia automática de ser seleccionado para inspección. No se modela como costo base ni con una probabilidad inventada.", "Res. 2806/2020 · Cap. III, párr. 2 N.º 15.", 15, 3),
  datoB("resuelve", "ADUANAS RESUELVE LA SITUACIÓN", "La situación debe resolverse ante Aduanas antes de continuar. Este nodo resume la gestión de la incidencia; no establece un plazo, una sanción fija ni un resultado favorable garantizado.", "Res. 2806/2020 · Cap. III, párr. 2 N.º 15.", 16, 3),
  datoB("autoriza", "¿SE AUTORIZA LA SALIDA?", "Rombo de síntesis: representa el resultado que habilita o impide continuar después de resolver la incidencia. El numeral 15 fundamenta la retención hasta su resolución; no garantiza que esta siempre termine en autorización.", "Res. 2806/2020 · Cap. III, párr. 2 N.º 15 (síntesis del desenlace).", 17, 3, { tipo: "decision" }),
  datoB("salida", "ADUANAS AUTORIZA SALIDA", "La operación puede continuar cuando cuenta con la legalización y se han cumplido los controles aplicables. La rama sin inspección supone que los antecedentes y autorizaciones están en regla. Este nodo agrupa los caminos favorables del diagrama.", "Res. 2806/2020 · Cap. III, párr. 2 N.º 8–9 y N.º 15.", 18),
  datoB("detenida", "SIN SALIDA AUTORIZADA", "La mercancía no continúa por la ruta de despacho. Este es el fin del recorrido representado para ese resultado; no se inventa el destino jurídico posterior ni se conecta con la salida exitosa.", "Res. 2806/2020 · Cap. III, párr. 2 N.º 15.", 18, 3, { tipo: "stop" }),
  datoB("despacho", "MERCADERÍA SALE DE ZOFRI CON DESTINO A ARICA / ZFE", "Se materializa la salida con destino a Arica/ZFE, amparada en la documentación y autorizaciones correspondientes. Este punto cierra el recorrido físico/aduanero solicitado; no fija el momento en que Iberia recupera el art. 11 como crédito.", "Res. 2806/2020 · Cap. III, párr. 2 N.º 5, 8 y 9.", 19),
  datoB("fin", "FIN", "Fin del flujo físico/aduanero representado, con salida hacia Arica/ZFE.", "No aplica.", 20, 2, { url: "", tipo: "terminal" })
];

// Las conexiones están separadas de las anotaciones. Los eventos laterales no tienen flecha temporal.
const enlacesB = [];
function linkB(from, to, label = "", route = "down", event = false) {
  enlacesB.push({ from: `b-${from}`, to: `b-${to}`, label, route, event });
}
const inicioB = ["inicio", "mercaderia", "compra", "destino", "documento", "transmite", "visa", "legaliza", "inspeccion"];
inicioB.slice(1).forEach((id, i) => linkB(inicioB[i], id, inicioB[i] === "visa" ? "Visado" : ""));
linkB("compra", "art11", "", "across", true);
linkB("art11", "credito", "", "down", true);
linkB("visa", "corrige", "Rechazado", "across");
linkB("corrige", "documento", "Reenvío", "return");
linkB("inspeccion", "presenta", "SÍ");
linkB("inspeccion", "salida", "NO", "outer-left");
linkB("presenta", "verifica");
linkB("verifica", "fisica");
linkB("fisica", "reconoce", "SÍ");
linkB("fisica", "conforme", "NO", "inner-left");
linkB("reconoce", "conforme");
linkB("conforme", "salida", "SÍ", "inner-left");
linkB("conforme", "retiene", "NO", "elbow");
linkB("retiene", "resuelve");
linkB("resuelve", "autoriza");
linkB("autoriza", "salida", "SÍ", "to-left");
linkB("autoriza", "detenida", "NO");
linkB("salida", "despacho");
linkB("despacho", "fin");

let rutaActual = "B";
let frameB = 0;
function renderB() {
  diagram.className = "diagram diagram-b";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("connectors");
  svg.setAttribute("aria-hidden", "true");
  diagram.append(svg);
  // Orden de lectura por fila; los eventos se identifican expresamente como laterales.
  for (const data of [...nodosB].sort((a, b) => a.row - b.row || a.col - b.col)) {
    const wrap = element("div", `b-node-wrap ${data.tipo || "process"}`);
    wrap.style.gridColumn = data.col;
    wrap.style.gridRow = data.row;
    const node = createNode(data.id, data.tipo === "terminal" ? "terminal" : "", nodosB);
    wrap.append(node);
    const outcomes = element("div", "mobile-outcomes");
    for (const edge of enlacesB.filter(item => item.from === data.id)) {
      const target = nodosB.find(item => item.id === edge.to);
      const jump = element("button", "outcome", `${edge.event ? "Asociado" : edge.label || "Continúa"} → ${target.titulo}`);
      jump.type = "button";
      jump.addEventListener("click", () => {
        const destination = document.getElementById(edge.to);
        destination.scrollIntoView({ block: "center" });
        destination.focus({ preventScroll: true });
      });
      outcomes.append(jump);
    }
    wrap.append(outcomes);
    diagram.append(wrap);
  }
  scheduleConnections();
}

// Conectores SVG calculados a partir de las cajas reales: se adaptan al texto y al ancho.
function scheduleConnections() {
  cancelAnimationFrame(frameB);
  frameB = requestAnimationFrame(drawConnections);
}
function drawConnections() {
  if (rutaActual !== "B") return;
  const svg = diagram.querySelector("svg");
  if (!svg) return;
  const ns = "http://www.w3.org/2000/svg";
  const shape = (tag, attrs) => {
    const el = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    return el;
  };
  svg.replaceChildren();
  svg.setAttribute("viewBox", `0 0 ${diagram.clientWidth} ${diagram.clientHeight}`);
  const defs = shape("defs", {});
  const marker = shape("marker", { id: "b-arrow", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto-start-reverse" });
  marker.append(shape("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#81969e" }));
  defs.append(marker); svg.append(defs);
  const origin = diagram.getBoundingClientRect();
  const box = id => {
    const r = document.getElementById(id).getBoundingClientRect();
    return { l: r.left - origin.left, r: r.right - origin.left, t: r.top - origin.top, b: r.bottom - origin.top, x: r.left - origin.left + r.width / 2, y: r.top - origin.top + r.height / 2 };
  };
  for (const edge of enlacesB) {
    const a = box(edge.from), b = box(edge.to);
    let points, tx, ty;
    if (edge.route === "across") {
      const right = b.x > a.x;
      points = [[right ? a.r : a.l, a.y], [right ? b.l : b.r, b.y]];
      tx = (points[0][0] + points[1][0]) / 2; ty = a.y - 10;
    } else if (edge.route.includes("left" ) && edge.route !== "to-left") {
      const lane = a.l - (edge.route === "outer-left" ? 42 : 22);
      points = [[a.l, a.y], [lane, a.y], [lane, b.y], [b.l, b.y]];
      tx = lane - 13; ty = a.y - 10;
    } else if (edge.route === "return") {
      points = [[a.x, a.t], [a.x, b.y], [b.l, b.y]];
      tx = a.x; ty = b.y - 12;
    } else if (edge.route === "elbow") {
      points = [[a.r, a.y], [b.x, a.y], [b.x, b.t]];
      tx = a.r + 22; ty = a.y - 10;
    } else if (edge.route === "to-left") {
      // La rama favorable llega por el lado derecho, sin atravesar la salida denegada.
      const lane = b.r + 24;
      points = [[a.l, a.y], [lane, a.y], [lane, b.y], [b.r, b.y]];
      tx = a.l - 16; ty = a.y - 10;
    } else {
      points = [[a.x, a.b], [b.x, b.t]];
      tx = a.x + 18; ty = (a.b + b.t) / 2 + 4;
    }
    const path = shape("path", { d: points.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" "), fill: "none", stroke: edge.event ? "#1d5964" : "#81969e", "stroke-width": 1.5 });
    if (edge.event) path.setAttribute("stroke-dasharray", "5 5");
    else path.setAttribute("marker-end", "url(#b-arrow)");
    svg.append(path);
    if (edge.label) {
      const text = shape("text", { x: tx, y: ty, "text-anchor": "middle", class: "edge-label" });
      text.textContent = edge.label;
      svg.append(text);
    }
  }
}

function selectRoute(route) {
  rutaActual = route;
  diagram.replaceChildren();
  diagram.className = "diagram";
  diagram.setAttribute("aria-label", `Diagrama de la Ruta ${route}`);
  document.title = `Ruta ${route} · Ferreterías Iberia`;
  document.querySelectorAll("[data-route]").forEach(button => {
    const active = button.dataset.route === route;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  document.querySelector("#route-title").textContent = route === "A" ? "RUTA A — COMPRA A PROVEEDOR NACIONAL" : "RUTA B — COMPRA ZOFRI → ARICA / ZFE";
  document.querySelector(".heading .eyebrow").textContent = route === "A" ? "ADQUISICIÓN NACIONAL" : "MERCADERÍA EXTRANJERA · ZONA FRANCA";
  document.querySelector(".heading p").textContent = route === "A" ? "Proceso comercial · Documentación y recepción · Flujo de caja" : "Compra a usuario ZOFRI · Salida a ZFE · Artículo 11";
  const context = document.querySelector("#route-context");
  context.hidden = route === "A";
  context.textContent = "DSZF: Declaración de Salida de Zona Franca. La tramitación aplicable depende de la implementación para el usuario vendedor. Consulta el detalle de los nodos de documentación.";
  if (route === "A") renderA(); else renderB();
  renderNotes(route === "A" ? nodos : nodosB);
}
document.querySelectorAll("[data-route]").forEach(button => button.addEventListener("click", () => selectRoute(button.dataset.route)));
new ResizeObserver(scheduleConnections).observe(diagram);
window.addEventListener("beforeprint", drawConnections);
selectRoute("B");

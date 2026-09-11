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
  for (const section of data.secciones || []) {
    const block = element("section", "detail-section");
    if (section.titulo) block.append(element("h3", "", section.titulo));
    if (section.texto) for (const paragraph of section.texto.split("\n\n")) block.append(element("p", "", paragraph));
    if (section.ejemplo) block.append(element("pre", "operational-example", section.ejemplo));
    if (section.lista) {
      const list = element("ul", "control-list");
      for (const item of section.lista) list.append(element("li", "", item));
      block.append(list);
    }
    if (section.conclusion) block.append(element("p", "detail-conclusion", section.conclusion));
    container.append(block);
  }
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
  node.title = data.riesgos ? "Ver riesgos, controles y fuentes oficiales" : [data.norma, data.nota].filter(Boolean).join("\n\n");
  if (data.etiqueta) node.append(element("span", "node-label", data.etiqueta));
  node.append(element("span", "node-title", data.titulo));
  if (data.aclaracion) node.append(element("span", "essential", data.aclaracion));
  if (data.riesgos) appendRiskBadge(node, data.riesgos, data.matriz);
  if (!data.riesgos && data.url) node.append(element("span", "node-source", data.norma));
  else if (!data.riesgos && !["inicio", "fin"].includes(id) && !id.endsWith("-inicio") && !id.endsWith("-fin")) node.append(element("span", "node-source", data.norma || "Sin norma tributaria específica"));
  if(data.matriz){const rs=data.matriz.filter(r=>data.riesgos.includes(r.id));const count=new Set(rs.flatMap(r=>r.urls)).size;node.append(element("span","audit-metrics",`${rs.length} controles · ${count} fuentes · ${rs.length} evidencias sugeridas`));}
  node.addEventListener("click", () => {
    document.querySelector("#detail-title").textContent = data.titulo;
    const content = document.querySelector("#detail-content");
    content.replaceChildren();
    dialog.classList.toggle("risk-drawer", Boolean(data.riesgos));
    appendDetails(content, data);
    if (data.riesgos) appendRiskCards(content, data.riesgos, data.matriz);
    if(data.filtrosB) appendFilterCards(content, filtrosRiesgoB);
    if(data.filtrosC) appendFilterCards(content, filtrosRiesgoC);
    if(data.filtrosSeleccionados) appendFilterCards(content, data.filtrosSeleccionados);
    if (data.filtros) appendFilterCards(content);
    dialog.showModal();
    dialog.scrollTop = 0;
  });
  return node;
}

function arrow() {
  const line = element("div", "arrow");
  line.setAttribute("aria-hidden", "true");
  diagram.append(line);
}

function renderA() { renderNetwork(nodosA, enlacesA, "route-a route-a-flow"); renderRiskTools(); }

function renderNotes(dataset) {
notes.replaceChildren();
notes.append(element("h2", "", "Anotaciones y fundamento normativo"));
notes.append(element("p", "", "Fuentes oficiales consultadas y contrastadas al 10-09-2026. Las precisiones de implementación se indican en los nodos correspondientes. Pulsa un nodo para abrir su explicación y fuente."));
for (const data of dataset.filter(node => node.nota || node.norma || node.url || node.matriz)) {
  const item = element("section");
  item.append(element("h3", "", data.titulo));
  appendDetails(item, data);
  if(data.matriz)appendRiskCards(item,data.riesgos,data.matriz);
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
  recuperacion: "https://www.bcn.cl/leychile/navegar?idNorma=17186",
  ordenanza: "https://www.bcn.cl/leychile/navegar?idNorma=238919",
  reglamento: "https://www.bcn.cl/leychile/navegar?idNorma=234023"
};
const implementacion = "La nomenclatura del Manual es DSZF. La Res. 358/2026 establece un calendario por grupos de usuarios de Iquique y ZOFRI publica otras modificaciones y postergaciones. Confirma con el usuario vendedor el procedimiento habilitado para su operación; no se afirma que SRF haya desaparecido universalmente ni que toda la salida electrónica estuviera implementada en marzo de 2025.";
const refImplementacion = [
  { norma: "Res. 358/2026 · calendario de implementación para Iquique (extracto oficial).", url: fuentesB.calendario },
  { norma: "ZOFRI · normativa e implementación, incluidas publicaciones de 2026.", url: fuentesB.zofri }
];
// Ruta B usa exclusivamente flujoRiesgoB y conexionesRiesgoB.

// RUTA C · Importación directa desde el extranjero al régimen general chileno.
// Las obligaciones sectoriales dependen del SKU: se enlaza la fuente oficial sin
// atribuir permisos concretos a una mercancía que todavía no ha sido definida.
const fuentesC = {
  ordenanza: "https://www.bcn.cl/leychile/navegar?idNorma=238919",
  leyArancel: "https://www.bcn.cl/leychile/navegar?idNorma=237264",
  arancel: "https://www.aduana.cl/arancel-aduanero-vigente/aduana/2016-12-30/090118.html",
  vistos: "https://www.aduana.cl/productos-que-requieren-autorizacion-o-visto-bueno/aduana/2018-12-13/161927.html",
  compendioI: "https://www.aduana.cl/aduana/site/docs/20070227/20070227202412/asocfile220060316125825.pdf",
  compendioIII: "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf",
  acuerdos: "https://www.subrei.gob.cl/acuerdos-comerciales/acuerdos-comerciales-vigentes",
  buscador: "https://aranceles.subrei.gob.cl/",
  iva: "https://www.bcn.cl/leychile/navegar?idNorma=6369",
  rep: "https://www.bcn.cl/leychile/navegar?idNorma=1090894",
  mandato: "https://www.bcn.cl/leychile/navegar?idNorma=1166120",
  manifiesto: "https://www.bcn.cl/leychile/navegar?idNorma=1218188",
  anticipada: "https://www.bcn.cl/leychile/navegar?idNorma=1144669",
  valoracion: "https://www.bcn.cl/leychile/navegar?idNorma=199526"
};
function datoC(id, titulo, nota, norma, row, col = 2, extra = {}) {
  return { id: `c-${id}`, titulo, nota, norma, url: fuentesC.ordenanza,
    fuente: "Abrir Ordenanza de Aduanas vigente en BCN", row, col, ...extra };
}
const nodosC = [
  datoC("inicio", "INICIO", "Inicio de la Ruta C. Es un marcador del diagrama y no produce por sí mismo efectos jurídicos o tributarios.", "No aplica.", 1, 1, { url: "", tipo: "terminal" }),
  datoC("producto", "DEFINIR PRODUCTO A IMPORTAR", "Iberia reúne los antecedentes técnicos y comerciales necesarios para identificar cada SKU: composición, función, presentación, marca/modelo, origen, fabricante y uso. Todavía no se determina un permiso ni un tributo; esos resultados dependen de la clasificación y de las características verificadas.", "DFL 31/2004 (Ley 18.525) · arts. 2–4; Arancel Aduanero Nacional vigente.", 2, 1, { url: fuentesC.leyArancel, fuente: "Abrir DFL 31/2004 en BCN", referencias: [{ norma: "Aduanas · Arancel Aduanero Nacional vigente, establecido por Decreto 473/2021 y sus modificaciones.", url: fuentesC.arancel }] }),
  datoC("clasificar", "CLASIFICAR PRODUCTO EN EL ARANCEL", "Se determina el ítem arancelario nacional aplicando las Reglas Generales de Interpretación, las notas legales y, como apoyo interpretativo, las Notas Explicativas. La clasificación se realiza por producto; una descripción comercial genérica no basta.", "DFL 31/2004 (Ley 18.525) · arts. 2, 3 y 4.", 3, 1, { url: fuentesC.leyArancel, fuente: "Abrir DFL 31/2004 en BCN", referencias: [{ norma: "Arancel Aduanero Nacional vigente.", url: fuentesC.arancel }, { norma: "Res. Ex. 1.629/2020 · procedimiento de resoluciones anticipadas, cuando se requiera certeza previa.", url: fuentesC.anticipada }] }),
  datoC("importable", "¿LA MERCANCÍA PUEDE IMPORTARSE?", "Con el producto identificado y clasificado se verifica si su importación está permitida. Si existe una prohibición aplicable, la operación no continúa. Si puede importarse, se revisan los controles y autorizaciones que correspondan.", "Ordenanza de Aduanas · art. 168; Compendio de Normas Aduaneras · Anexo 14, según la mercancía.", 4, 1, { tipo: "decision", referencias: [{ norma: "Aduanas · productos sujetos a autorización o visto bueno.", url: fuentesC.vistos }] }),
  datoC("no-importar", "NO IMPORTAR", "Fin de esta rama cuando la mercancía está legalmente prohibida. El diagrama no inventa una vía de regularización ni un destino alternativo.", "Ordenanza de Aduanas · art. 168, cuando se trate de mercancía de importación prohibida.", 4, 2, { tipo: "stop" }),
  datoC("controles", "IDENTIFICAR CONTROLES SECTORIALES Y/O REP", "Iberia identifica, por ítem arancelario y características del SKU, el organismo competente, el requisito aplicable y el momento en que debe cumplirse: antes del embarque, de la destinación, del retiro o de la comercialización. Pueden intervenir, según el producto, SAG, autoridad sanitaria, SEC, SUBTEL u otros organismos. La Ley REP se revisa de forma condicional cuando Iberia califique como productor respecto de un producto prioritario o de envases y embalajes; no es un requisito aduanero universal.", "Compendio de Normas Aduaneras · Anexo 14; Ley 20.920 · arts. 3 N.º 20, 9 y 10, cuando corresponda.", 5, 1, { url: fuentesC.vistos, fuente: "Abrir listado oficial de vistos buenos", referencias: [{ norma: "Ley 20.920 · productos prioritarios y obligaciones REP condicionadas al supuesto legal y al decreto aplicable.", url: fuentesC.rep }] }),
  datoC("tratamiento", "DETERMINAR TRATAMIENTO ARANCELARIO Y ACUERDO COMERCIAL APLICABLE", "Iberia verifica el arancel general o específico y, si pretende una preferencia, el acuerdo vigente para el país de origen, la preferencia del producto, su regla de origen y la prueba o declaración exigida por ese acuerdo. El buscador de SUBREI es una ayuda referencial: prevalecen el texto del acuerdo, sus enmiendas y la información oficial de Aduanas.", "DFL 31/2004 (Ley 18.525) · arts. 1–6; acuerdo comercial aplicable, si existe.", 6, 1, { url: fuentesC.leyArancel, fuente: "Abrir DFL 31/2004 en BCN", referencias: [{ norma: "SUBREI · acuerdos comerciales vigentes.", url: fuentesC.acuerdos }, { norma: "SUBREI · buscador referencial de aranceles.", url: fuentesC.buscador }] }),
  datoC("compra", "COTIZAR Y ACORDAR COMPRA", "Iberia acuerda producto, cantidad, precio, moneda, Incoterm con lugar y versión, flete, seguro, forma y plazo de pago y documentos. Estas condiciones alimentan el valor aduanero y el flujo de caja. La compraventa por sí sola no paga ni genera el IVA de importación.", "DFL 31/2004 · art. 6 y reglas de valoración aduanera; DS 1.134/2001, según corresponda.", 7, 1, { url: fuentesC.leyArancel, fuente: "Abrir DFL 31/2004 en BCN", referencias: [{ norma: "DS 1.134/2001 · Reglamento de Valoración Aduanera.", url: fuentesC.valoracion }] }),
  datoC("fob", "¿VALOR FOB SUPERA US$ 1.000?", "El umbral se aplica al valor FOB facturado de la importación comercial. Si supera US$1.000, corresponde encomendar el despacho a un Agente de Aduanas. Si no lo supera, puede evaluarse el procedimiento simplificado que permite actuar al importador; el diagrama no afirma que usar agente quede prohibido.", "Ordenanza de Aduanas · art. 191; Compendio, Cap. III · despachos especiales hasta US$1.000 FOB facturado.", 8, 1, { tipo: "decision", referencias: [{ norma: "Compendio de Normas Aduaneras · Capítulo III.", url: fuentesC.compendioIII }] }),
  datoC("simplificado", "EVALUAR DESPACHO SIMPLIFICADO (IMPORTADOR)", "Para una importación comercial cuyo valor FOB facturado no excede US$1.000, Iberia puede tramitar personalmente conforme al procedimiento especial aplicable. Debe igualmente presentar los documentos, pagar los gravámenes y cumplir los controles que correspondan.", "Ordenanza de Aduanas · art. 191; Compendio, Cap. III · excepción de despacho especial.", 8, 2, { tipo: "alternative", referencias: [{ norma: "Compendio de Normas Aduaneras · Capítulo III.", url: fuentesC.compendioIII }] }),
  datoC("agente", "CONTRATAR AGENTE DE ADUANAS Y OTORGAR MANDATO", "Si el FOB supera el umbral, Iberia encomienda el despacho a un Agente de Aduanas y le otorga mandato en una forma admitida por la normativa vigente. El agente confecciona y tramita la declaración como auxiliar de la función pública aduanera; Iberia debe entregar antecedentes completos y conserva sus responsabilidades como importadora.", "Ordenanza de Aduanas · arts. 191, 195, 197 y 199; Res. Ex. 2.299/2021.", 9, 1, { referencias: [{ norma: "Res. Ex. 2.299/2021 · actualización de normas sobre mandato.", url: fuentesC.mandato }] }),
  datoC("documentos", "PREPARAR DOCUMENTACIÓN Y DESPACHO", "Iberia, directamente o por medio del agente cuando corresponde, reúne los documentos base de la operación. Según el caso pueden comprender factura comercial, documento de transporte, lista de empaque, seguro, prueba de origen, autorizaciones y mandato. La DIN debe concordar con sus antecedentes; la lista no convierte cada documento en obligatorio para toda importación.", "Ordenanza de Aduanas · arts. 76–78; Compendio, Cap. III · N.º 10.1 y Anexo 18.", 9, 2, { referencias: [{ norma: "Compendio de Normas Aduaneras · Capítulo III.", url: fuentesC.compendioIII }] }),
  datoC("transporte", "TRANSPORTE INTERNACIONAL Y ARRIBO A CHILE", "El transportista o su representante presenta el manifiesto correspondiente. Al ingresar desde el extranjero, la mercancía queda sometida a potestad aduanera; el arribo no significa que esté nacionalizada ni disponible para Iberia.", "Ordenanza de Aduanas · arts. 33–36; Compendio de Normas Aduaneras · Cap. III.", 10, 2, { referencias: [{ norma: "Res. Ex. 4.494/2025 · actualización del manifiesto marítimo electrónico, cuando esa vía corresponda.", url: fuentesC.manifiesto }] }),
  datoC("din", "VALIDAR DOCUMENTOS, DETERMINAR VALOR ADUANERO Y TRIBUTOS Y TRANSMITIR DIN", "El agente o Iberia en el procedimiento simplificado valida los documentos, determina clasificación, origen, valor aduanero y gravámenes, confecciona la Declaración de Importación contenida en la DIN y la transmite. La liquidación forma parte de la declaración; no se calculan los tributos recién después de legalizarla. La DIN puede tramitarse anticipadamente en los casos permitidos, por lo que la ubicación gráfica no impone que su transmisión siempre ocurra después del arribo.", "Ordenanza de Aduanas · arts. 71, 72, 76–82; DFL 31/2004 · art. 6; Compendio, Caps. II y III y Anexo 18.", 11, 2, { referencias: [{ norma: "DFL 31/2004 · valoración y base aduanera.", url: fuentesC.leyArancel }, { norma: "DS 1.134/2001 · Reglamento de Valoración Aduanera.", url: fuentesC.valoracion }, { norma: "Compendio de Normas Aduaneras · Capítulo III.", url: fuentesC.compendioIII }] }),
  datoC("aceptada", "¿DIN ACEPTADA A TRÁMITE?", "Aduanas verifica que la declaración contenga los datos y formalidades exigidos, sea coherente y unívoca. La aceptación fija, como regla general, los derechos, impuestos, tasas y gravámenes vigentes aplicables. Antes de la aceptación puede corregirse y retransmitirse; después rigen los mecanismos formales de modificación o aclaración.", "Ordenanza de Aduanas · arts. 81–83.", 12, 2, { tipo: "decision" }),
  datoC("corregir", "CORREGIR / RETRANSMITIR", "Si la DIN no es aceptada, se identifica el error, se corrigen los datos o antecedentes y se retransmite. Este retorno representa una corrección previa a la aceptación a trámite.", "Ordenanza de Aduanas · art. 81; Compendio, Cap. III.", 12, 3, { tipo: "issue" }),
  datoC("observaciones", "¿ADUANAS FORMULA OBSERVACIONES?", "Aduanas puede efectuar revisión documental, examen físico o aforo. Si no formula observaciones, continúa la liquidación validada. Si las formula, deben resolverse y puede corresponder una nueva liquidación u otro efecto previsto en la normativa. La selección o una observación no implica por sí sola una infracción.", "Ordenanza de Aduanas · arts. 84, 85 y 88; art. 92 bis cuando corresponda.", 13, 2, { tipo: "decision" }),
  datoC("resolver", "RESOLVER OBSERVACIONES Y AJUSTAR LIQUIDACIÓN SI CORRESPONDE", "Se atienden los antecedentes observados y se determina su efecto. Una diferencia puede afectar clasificación, valor, origen, cantidad, permisos o liquidación. Este nodo no presume una sanción ni asegura que toda observación cambie los tributos.", "Ordenanza de Aduanas · arts. 84, 85 y 88; arts. 92 bis y 185, según el caso.", 13, 3, { tipo: "issue" }),
  datoC("legalizacion", "LEGALIZACIÓN + PAGO DE GRAVÁMENES Y RETIRO DE LA MERCANCÍA", "Aduanas valida o ajusta la liquidación; la declaración que causa gravámenes incluye su documento de pago, luego se legaliza y notifica. Como regla general, el pago vence dentro de 15 días desde la notificación y precede al retiro. Para retirar también deben cumplirse los controles y acreditarse los pagos exigibles de almacenamiento y movilización. Legalización, pago y retiro son hitos distintos. El diagrama reconoce las modalidades legales especiales sin convertirlas en el caso base.", "Ordenanza de Aduanas · arts. 88, 89, 92–95, 99–105.", 14, 2),
  datoC("habilitado", "¿PRODUCTO HABILITADO PARA COMERCIALIZARSE?", "La nacionalización no garantiza por sí sola que el producto pueda venderse. Iberia comprueba que se hayan completado las certificaciones, autorizaciones, rotulado u otras exigencias sectoriales aplicables al SKU. Cuando corresponda, también debe atender las obligaciones REP que le sean exigibles como productor/importador.", "Normativa sectorial aplicable al SKU; Ley 20.920 · arts. 3 N.º 20, 9 y 10, cuando corresponda.", 15, 2, { tipo: "decision", url: fuentesC.vistos, fuente: "Abrir listado oficial de vistos buenos", referencias: [{ norma: "Ley 20.920 · obligaciones REP condicionadas al producto y al decreto aplicable.", url: fuentesC.rep }] }),
  datoC("pendiente", "COMPLETAR REQUISITO PENDIENTE", "Iberia completa el requisito sectorial que resulte aplicable antes de comercializar. El diagrama no inventa cuál es: debe obtenerse de la clasificación, la matriz oficial y la normativa del organismo competente para el producto concreto.", "Normativa sectorial aplicable al SKU; Compendio · Anexo 14.", 15, 3, { tipo: "issue", url: fuentesC.vistos, fuente: "Abrir listado oficial de vistos buenos" }),
  datoC("inventario", "INGRESO A INVENTARIO, VENTA Y F29", "Iberia registra la mercancía en inventario y, una vez habilitada, la vende en Chile emitiendo los documentos tributarios que correspondan. El IVA pagado en la importación puede constituir crédito fiscal si cumple el art. 23; las ventas afectas generan débito fiscal. El F29 consolida el período mensual completo de Iberia: no pertenece a una importación individual.", "DL 825 · arts. 20, 23, 52–55 y 64, según corresponda.", 16, 2, { url: fuentesC.iva, fuente: "Abrir DL 825 en BCN" }),
  datoC("fin", "FIN", "Cierre de la Ruta C representada, una vez incorporada la mercancía habilitada al ciclo de inventario, venta y declaración mensual.", "No aplica.", 17, 2, { url: "", tipo: "terminal" })
];

const enlacesC = [];
function linkC(from, to, label = "", route = "down") {
  enlacesC.push({ from: `c-${from}`, to: `c-${to}`, label, route, event: false });
}
linkC("inicio", "producto");
linkC("producto", "clasificar");
linkC("clasificar", "importable");
linkC("importable", "controles", "SÍ");
linkC("importable", "no-importar", "NO", "across");
linkC("controles", "tratamiento");
linkC("tratamiento", "compra");
linkC("compra", "fob");
linkC("fob", "agente", "SÍ");
linkC("fob", "simplificado", "NO", "across");
linkC("agente", "documentos", "", "elbow");
linkC("simplificado", "documentos");
linkC("documentos", "transporte");
linkC("transporte", "din");
linkC("din", "aceptada");
linkC("aceptada", "observaciones", "SÍ");
linkC("aceptada", "corregir", "NO", "across");
linkC("corregir", "aceptada", "Retransmitir", "loop");
linkC("observaciones", "legalizacion", "NO");
linkC("observaciones", "resolver", "SÍ", "across");
linkC("resolver", "legalizacion", "", "to-left");
linkC("legalizacion", "habilitado");
linkC("habilitado", "inventario", "SÍ");
linkC("habilitado", "pendiente", "NO", "across");
linkC("pendiente", "habilitado", "Completar", "loop");
linkC("inventario", "fin");

// Ruta A: matriz proporcionada por la usuaria; controles internos diferenciados de la norma.
const riesgosA = [
  {
    "id": 1,
    "titulo": "Clasificar operación",
    "falla": "Tratar como compra nacional algo que en realidad es consignación, mercancía bajo Zona Franca u otro régimen",
    "consecuencia": "Todo el tratamiento documental/tributario posterior puede quedar mal",
    "control": "Confirmar que Iberia realmente compra/adquiere mercancía nacional o nacionalizada y que no está entrando mediante régimen especial",
    "responsable": "Compras / Contabilidad",
    "norma": "El DS 55 distingue compra de consignación, y el DFL 2 establece controles especiales cuando mercancía nacional/nacionalizada entra a Zona Franca Primaria.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Clasificación documentada de la operación y antecedentes del régimen",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=8355",
      "https://www.bcn.cl/leychile/navegar?idNorma=188367"
    ],
    "bloqueo": true
  },
  {
    "id": 2,
    "titulo": "Proveedor",
    "falla": "Proveedor inexistente, irregular, factura que no representa una operación real",
    "consecuencia": "Rechazo del CF, diferencias tributarias y mayor exposición si existió conocimiento de falsedad",
    "control": "Validar RUT, proveedor, correspondencia comercial y existencia material de la compra",
    "responsable": "Compras + Contabilidad",
    "norma": "DL 825 art. 23 N.º 5: las facturas falsas/no fidedignas pueden perder el CF; si son cuestionadas debe poder demostrarse la realidad material de la operación.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Consulta RUT, cotización y antecedentes de la compra real",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": false
  },
  {
    "id": 3,
    "titulo": "Compra / OC",
    "falla": "Precio, cantidad, SKU o condiciones diferentes de lo aprobado",
    "consecuencia": "Sobrepago, recepción equivocada, dificultad posterior para demostrar operación",
    "control": "Mantener vínculo cotización/OC → proveedor → SKU → cantidad → precio → condición de pago",
    "responsable": "Compras",
    "norma": "Control interno propuesto: la OC no es una exigencia tributaria universal. El vínculo documental respalda la materialidad de la compra (DL 825, art. 23 N.º 5).",
    "estado": "🟢",
    "nivel": "preventivo",
    "evidencia": "Cotización, OC o acuerdo comercial y aprobación",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": false
  },
  {
    "id": 4,
    "titulo": "Documento tributario",
    "falla": "Iberia compra como empresa pero termina con boleta/voucher o sin factura cuando correspondía factura",
    "consecuencia": "Puede perder CF y existe infracción propia del comprador por no exigir el documento",
    "control": "Antes de cerrar la compra: ¿documento tributario correcto y emitido a Iberia?",
    "responsable": "Compras / receptor",
    "norma": "Código Tributario art. 88 y art. 97 N.º19: el adquirente debe exigir el documento que corresponda; no exigir factura puede ser sancionado con hasta 20 UTM.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Factura emitida a Iberia y consulta de validez",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6374",
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": true
  },
  {
    "id": 5,
    "titulo": "Datos de factura",
    "falla": "RUT comprador, proveedor, producto, cantidad, precio, IVA o total incorrectos",
    "consecuencia": "CF discutible, pago incorrecto y problemas de trazabilidad",
    "control": "Validar RUT Iberia + proveedor + folio + fecha + SKU/descripción + cantidad + neto + IVA + total",
    "responsable": "Contabilidad / Compras",
    "norma": "Reglamento del IVA exige identificar comprador, mercadería, monto y el IVA separado.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "DTE y conciliación de sus datos con la compra",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=8355"
    ],
    "bloqueo": false
  },
  {
    "id": 6,
    "titulo": "Entrega y documentación",
    "falla": "Se entrega mercadería y no existe factura ni guía que respalde la operación",
    "consecuencia": "Riesgo tributario/documental y de transporte",
    "control": "Si se factura al entregar → factura. Si no → guía al entregar + factura posterior que referencia la guía",
    "responsable": "Proveedor; Iberia debe controlarlo",
    "norma": "DL 825 art. 55: factura al producirse la entrega real o simbólica; si se posterga, se usa guía y la factura posterior debe referenciarla.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Factura o guía que respalda la entrega",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": true
  },
  {
    "id": 7,
    "titulo": "Guía pendiente",
    "falla": "Mercadería llegó con guía y la factura nunca aparece o no referencia correctamente todas las guías",
    "consecuencia": "Operación queda incompleta; CF mal registrado",
    "control": "Control automático de guías pendientes de facturación y enlace guía↔factura",
    "responsable": "Proveedor + Contabilidad",
    "norma": "Art. 55 permite postergar la factura sólo hasta el 10.º día posterior al cierre del período, manteniendo la fecha tributaria del período de la operación.",
    "estado": "🟠",
    "nivel": "atencion",
    "evidencia": "Listado de guías pendientes y factura que las referencia",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": false
  },
  {
    "id": 8,
    "titulo": "Factura anticipada",
    "falla": "Factura aparece en SII antes que la mercadería y nadie la controla",
    "consecuencia": "Puede correr la ventana de 8 días antes de la entrega física",
    "control": "DTE recibido + mercadería aún no entregada → revisión especial; no aceptar automáticamente",
    "responsable": "Compras + Contabilidad",
    "norma": "Los 8 días del DTE se relacionan con su recepción por el SII; por eso las facturas deben revisarse directamente en los registros del Servicio.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Fecha de recepción SII, contrato y fecha comprometida de entrega",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": false
  },
  {
    "id": 9,
    "titulo": "DTE antes del transporte",
    "falla": "Camión sale con factura/guía todavía no recibida por SII o rechazada",
    "consecuencia": "Traslado irregular",
    "control": "Confirmar DTE generado → enviado → recibido por SII → no rechazado antes de iniciar traslado, salvo excepción de conectividad",
    "responsable": "Emisor / transportista; Iberia supervisa",
    "norma": "Res. Ex. SII 99/2019: esas condiciones deben cumplirse antes del traslado; contempla excepción si no hay cobertura de datos.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Estado de recepción y rechazo del DTE en SII",
    "urls": [
      "https://www.sii.cl/normativa_legislacion/resoluciones/2019/reso99.pdf"
    ],
    "bloqueo": true
  },
  {
    "id": 10,
    "titulo": "Documento durante traslado",
    "falla": "Existe DTE pero el transportista no puede exhibir el respaldo",
    "consecuencia": "Fiscalización, multa e impedimento de continuar",
    "control": "Representación gráfica digital o impresa disponible durante el viaje",
    "responsable": "Transportista",
    "norma": "Res. 99/2019 permite exhibición digital o impresa. Código Tributario art. 97 N.º17: trasladar carga sin factura/guía válida puede implicar multa de 10% a 200% de una UTA y el vehículo no sigue hasta acreditar documento.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Representación gráfica digital o impresa del documento",
    "urls": [
      "https://www.sii.cl/normativa_legislacion/resoluciones/2019/reso99.pdf",
      "https://www.bcn.cl/leychile/navegar?idNorma=6374"
    ],
    "bloqueo": true
  },
  {
    "id": 11,
    "titulo": "Recepción física",
    "falla": "Factura dice 100 unidades y llegan 90, otro modelo o mercancía dañada",
    "consecuencia": "Iberia podría aceptar una factura que no representa la entrega",
    "control": "Conciliar SKU + cantidad + estado + factura/guía al recibir",
    "responsable": "Bodega",
    "norma": "Ley 19.983 permite reclamar falta total/parcial; el recibo debe poder identificar entrega y receptor.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Registro de recepción, cantidades, estado y diferencias",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=233421"
    ],
    "bloqueo": true
  },
  {
    "id": 12,
    "titulo": "Quién recibe",
    "falla": "Cualquier trabajador firma sin revisar",
    "consecuencia": "Esa recepción puede producir efectos frente a Iberia",
    "control": "Registrar fecha, recinto y persona que recibe; capacitar/restringir receptores",
    "responsable": "Bodega",
    "norma": "Ley 19.983 art. 4: se presume que representa al comprador la persona adulta que recibe los bienes a su nombre.",
    "estado": "🟠",
    "nivel": "atencion",
    "evidencia": "Fecha, recinto e identidad del receptor",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=233421"
    ],
    "bloqueo": false
  },
  {
    "id": 13,
    "titulo": "Aceptar/reclamar factura",
    "falla": "Nadie revisa el DTE o alguien lo acepta prematuramente",
    "consecuencia": "Después puede perderse la posibilidad normal de reclamar diferencias",
    "control": "Revisar DTE diariamente; si hay error, gestionar reclamo dentro de 8 días corridos desde la recepción del DTE por el SII; registrar el evento en SII y conservar la comunicación fehaciente al proveedor.",
    "responsable": "Contabilidad / Compras",
    "norma": "Ley 19.983: aceptación expresa impide después reclamar normalmente contenido, falta de entrega o plazo de pago; sin reclamo opera la aceptación legal.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Registro de reclamo en SII y comunicación fehaciente al proveedor",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=233421",
      "https://www.sii.cl/destacados/f29/usocreditofiscal.htm"
    ],
    "bloqueo": false
  },
  {
    "id": 14,
    "titulo": "Acuse vs. aceptación",
    "falla": "Confundir “Aceptar contenido DTE” con “Recibo de mercaderías”",
    "consecuencia": "CF usado en momento incorrecto",
    "control": "Mantener campos separados: estado DTE / reclamo / acuse mercadería / período CF",
    "responsable": "Contabilidad",
    "norma": "El SII vincula el CF de factura electrónica al acuse —expreso o automático—; una factura reclamada no da derecho a CF mientras siga así.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Estados separados de aceptación, acuse, reclamo y CF",
    "urls": [
      "https://www.sii.cl/destacados/f29/usocreditofiscal.htm"
    ],
    "bloqueo": false
  },
  {
    "id": 15,
    "titulo": "Factura al contado",
    "falla": "Esperar innecesariamente un acuse o asignar CF al período equivocado",
    "consecuencia": "Distorsión del F29 y del análisis financiero",
    "control": "Si el DTE está correctamente emitido al contado, aplicar su tratamiento específico",
    "responsable": "Contabilidad",
    "norma": "El SII señala que una factura electrónica al contado no necesita un acuse separado y puede utilizar el CF desde el período de recepción por SII.",
    "estado": "🟠",
    "nivel": "atencion",
    "evidencia": "DTE con forma de pago al contado y recepción SII",
    "urls": [
      "https://www.sii.cl/preguntas_frecuentes/factura_electronica/001_003_6607.htm"
    ],
    "bloqueo": false
  },
  {
    "id": 16,
    "titulo": "Derecho real a CF",
    "falla": "“Hay factura + IVA = tengo CF”",
    "consecuencia": "Rechazo del crédito, reliquidación, intereses/sanciones según caso",
    "control": "Preguntar: ¿compra relacionada con actividad que da derecho a CF? ¿factura válida? ¿IVA correctamente recargado?",
    "responsable": "Contabilidad",
    "norma": "DL 825 arts. 23–25: el CF tiene condiciones; el IVA debe estar respaldado y recargado separadamente.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Factura, destino de la compra y respaldo del derecho a CF",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": true
  },
  {
    "id": 17,
    "titulo": "Factura reclamada parcialmente",
    "falla": "Llegaron 90 de 100 y alguien usa “90% del IVA” por cuenta propia",
    "consecuencia": "Utilización improcedente del CF",
    "control": "Si la factura fue reclamada por falta parcial → no utilizar CF mientras siga reclamada; regularizar primero",
    "responsable": "Contabilidad",
    "norma": "SII: una factura reclamada por contenido, falta total o parcial no da derecho a CF mientras permanezca reclamada.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Reclamo, regularización documental y revisión RCV",
    "urls": [
      "https://www.sii.cl/destacados/f29/usocreditofiscal.htm"
    ],
    "bloqueo": true
  },
  {
    "id": 18,
    "titulo": "RCV",
    "falla": "El SII la clasifica automáticamente “del giro” y nadie revisa",
    "consecuencia": "CF usado en categoría incorrecta",
    "control": "Revisar clasificación: giro, activo fijo, uso común, no recuperable, no incluir, etc.",
    "responsable": "Contabilidad",
    "norma": "El SII dice expresamente que la clasificación inicial del Registro de Compras puede y debe corregirse cuando corresponda.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Clasificación revisada en RCV",
    "urls": [
      "https://www.sii.cl/destacados/f29/"
    ],
    "bloqueo": false
  },
  {
    "id": 19,
    "titulo": "Período del CF",
    "falla": "Registrar el crédito por mes de factura sin mirar acuse/guías",
    "consecuencia": "CF adelantado o desplazado a período incorrecto",
    "control": "Guardar fecha DTE SII + fecha guía + fecha entrega + fecha acuse + período CF",
    "responsable": "Contabilidad",
    "norma": "El SII explica que el período depende del acuse; si hubo acuse en guía correctamente referenciada, puede afectar el período en que se reconoce el CF.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Fechas de recepción SII, guía, entrega, acuse y período CF",
    "urls": [
      "https://www.sii.cl/destacados/f29/usocreditofiscal.htm"
    ],
    "bloqueo": false
  },
  {
    "id": 20,
    "titulo": "NC/ND, descuentos y bonificaciones",
    "falla": "Después cambia precio/mercadería y se mantiene el CF original",
    "consecuencia": "CF mayor o menor al que corresponde",
    "control": "Detectar cualquier NC/ND asociada antes de cerrar RCV/F29; ajustar",
    "responsable": "Contabilidad",
    "norma": "DL 825 art. 24: descuentos, bonificaciones y devoluciones disminuyen CF; ND puede aumentarlo.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "NC/ND relacionadas y conciliación de ajustes",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": false
  },
  {
    "id": 21,
    "titulo": "F29",
    "falla": "Cálculo correcto pero declaración/pago atrasados",
    "consecuencia": "Multas, reajustes e intereses según situación",
    "control": "Conciliar RCV → débito → CF → F29 y presentar/pagar dentro del plazo aplicable a Iberia",
    "responsable": "Contabilidad",
    "norma": "El IVA es de declaración mensual. Algunos contribuyentes electrónicos pueden tener plazo hasta el día 20, por lo que no fijaría un día único sin revisar la situación tributaria concreta de Iberia.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Conciliación RCV/F29 y comprobante de presentación/pago",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": false
  },
  {
    "id": 22,
    "titulo": "Condición de pago al proveedor",
    "falla": "Excel permite “60/90 días” aunque jurídicamente el acuerdo no cumpla requisitos",
    "consecuencia": "Mora, intereses, comisión de cobranza",
    "control": "≤30 días = regla general. >30 → comprobar acuerdo excepcional válido y registrado",
    "responsable": "Finanzas / Compras",
    "norma": "Ley 19.983 art. 2: máximo general 30 días corridos desde recepción de factura; plazo mayor exige acuerdo escrito y requisitos. Arts. 2 bis y 2 ter: mora genera interés y comisión fija del 1% del saldo insoluto.",
    "estado": "🟠",
    "nivel": "atencion",
    "evidencia": "Acuerdo de pago, vencimiento e inscripción cuando corresponda",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=233421"
    ],
    "bloqueo": false
  },
  {
    "id": 23,
    "titulo": "Factoring / cesión",
    "falla": "Iberia paga al proveedor cuando la factura ya fue cedida",
    "consecuencia": "Riesgo de pagar a quien ya no corresponde; potencial disputa de cobro",
    "control": "Verificar estado de cesión inmediatamente antes del pago, especialmente en facturas relevantes",
    "responsable": "Tesorería",
    "norma": "Ley 19.983 regula la cesión. Además, NC/ND posteriores a una factura irrevocablemente aceptada pueden ser inoponibles al cesionario.",
    "estado": "🔴 financiero",
    "nivel": "critico",
    "evidencia": "Consulta actual de cesión e identificación del acreedor",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=233421"
    ],
    "bloqueo": false
  },
  {
    "id": 24,
    "titulo": "Pago y materialidad",
    "falla": "Existe factura y pago, pero después no se puede probar que realmente llegaron los bienes",
    "consecuencia": "Pérdida del CF si factura es objetada",
    "control": "Mantener expediente: OC → DTE → guía → recepción → inventario → pago",
    "responsable": "Compras + Contabilidad",
    "norma": "Art. 23 N.º5 exige poder acreditar efectividad material y monto de la operación cuando SII lo solicita; pagar por sí solo no basta.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "OC, DTE, guía, recepción, inventario y pago",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": false
  },
  {
    "id": 25,
    "titulo": "Inventario",
    "falla": "Stock físico y sistema no coinciden sin explicación",
    "consecuencia": "Un faltante no justificado puede considerarse retiro afecto a IVA",
    "control": "Conciliación periódica; todo faltante debe tener causa + documento + ajuste",
    "responsable": "Bodega + Contabilidad",
    "norma": "DL 825 art. 8 letra d): bienes faltantes cuya salida no puede justificarse fehacientemente pueden considerarse retirados y gravados.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Conciliación de inventario, causal y ajuste documentado",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": false
  },
  {
    "id": 26,
    "titulo": "Salida del inventario",
    "falla": "Producto sale como regalo, promoción, uso personal, merma, devolución o traslado y sólo se baja del stock",
    "consecuencia": "Tratamiento tributario/documental incorrecto",
    "control": "Toda salida debe tener causal identificada y tratamiento correspondiente",
    "responsable": "Bodega + Contabilidad",
    "norma": "El art. 8 letra d) contempla retiros y ciertos destinos gratuitos; los faltantes tampoco deben simplemente desaparecer del registro.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Causal de salida y documentos asociados",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": false
  },
  {
    "id": 27,
    "titulo": "Traslado posterior",
    "falla": "La factura/guía del proveedor se usa como si cubriera futuros movimientos entre bodegas",
    "consecuencia": "Mercadería movida sin documento actual que ampare ese traslado",
    "control": "Cada nuevo movimiento debe evaluarse y emitir guía cuando corresponda",
    "responsable": "Logística Iberia",
    "norma": "DL 825 art. 55: también se emite guía para traslados que no constituyen venta.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Guía del nuevo movimiento cuando corresponda",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": true
  },
  {
    "id": 28,
    "titulo": "Devolución al proveedor",
    "falla": "Se devuelve mercancía físicamente pero sólo se ajusta contabilidad, o viceversa",
    "consecuencia": "Traslado sin respaldo / CF sin corregir",
    "control": "Devolución = documentar movimiento + NC correspondiente + ajuste RCV/CF",
    "responsable": "Bodega + proveedor + Contabilidad",
    "norma": "El movimiento físico debe estar respaldado conforme al art. 55 y el ajuste del CF se rige por art. 24.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Documento de traslado, NC y ajuste CF",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": false
  },
  {
    "id": 29,
    "titulo": "Archivo",
    "falla": "Meses/años después no existen respaldos de la compra",
    "consecuencia": "Dificultad para defender CF, costo e inventario en fiscalización",
    "control": "Archivo asociado por operación: DTE, guías, recepción, NC/ND y antecedentes comerciales",
    "responsable": "Contabilidad",
    "norma": "DL 825 art. 58: DTE deben conservarse bajo el plazo de 6 años indicado por el SII.",
    "estado": "🟠",
    "nivel": "atencion",
    "evidencia": "Expediente completo y respaldo recuperable",
    "urls": [
      "https://www.sii.cl/preguntas_frecuentes/factura_electronica/001_003_2356.htm",
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": false
  },
  {
    "id": 30,
    "titulo": "Pérdida de documentación",
    "falla": "Se pierden libros/documentos relevantes y nadie informa",
    "consecuencia": "Infracción adicional y dificultad para acreditar compras",
    "control": "Activar procedimiento de pérdida: aviso y reconstitución según corresponda",
    "responsable": "Contabilidad",
    "norma": "Res. SII 61/2023: aviso dentro de 10 días hábiles para libros/documentos comprendidos por la regla; luego procede reconstitución. Si el DTE ya fue recibido correctamente por SII, corresponde recuperar el respaldo; la resolución distingue ese caso de la documentación comprendida en el aviso.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Aviso de pérdida y reconstitución cuando proceda",
    "urls": [
      "https://www.sii.cl/normativa_legislacion/resoluciones/2023/reso61.pdf"
    ],
    "bloqueo": false
  },
  {
    "id": 31,
    "titulo": "Fiscalización posterior",
    "falla": "SII objeta una factura y la empresa improvisa la evidencia meses después",
    "consecuencia": "Rechazo CF, diferencias de impuesto y sanciones según caso",
    "control": "Mantener expediente preparado; responder requerimientos dentro del plazo concreto notificado",
    "responsable": "Contabilidad / asesor tributario",
    "norma": "El art. 23 N.º5 exige factura formal, pago en las condiciones aplicables y materialidad de la operación cuando el SII la cuestiona.",
    "estado": "🔴",
    "nivel": "critico",
    "evidencia": "Requerimiento, respuesta y expediente de materialidad",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": false
  }
];
const filtrosA = [
  {
    "titulo": "Producto eléctrico o combustible regulado",
    "falla": "Comercializar producto que requería certificación",
    "control": "¿ESTE SKU ESTÁ SUJETO A CERTIFICACIÓN SEC? ¿Tiene certificado/Sello SEC vigente?",
    "norma": "SEC señala que los productos incluidos en certificación obligatoria deben estar certificados y llevar Sello SEC para comercializarse.",
    "estado": "🔴",
    "urls": [
      "https://www.sec.cl/sistema-de-certificacion-de-productos-sec/"
    ]
  },
  {
    "titulo": "Pintura, solvente u otra sustancia peligrosa",
    "falla": "Almacenamiento o transporte incumpliendo normas de seguridad",
    "control": "¿ES SUSTANCIA PELIGROSA? Si sí, revisar almacenamiento y transporte específico",
    "norma": "DS 43/2015 regula almacenamiento; DS 298 regula transporte de cargas peligrosas.",
    "estado": "🔴",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=1088802",
      "https://www.bcn.cl/leychile/navegar?idNorma=12087"
    ]
  },
  {
    "titulo": "Consignación",
    "falla": "Registrar como compra/CF mercancía que sigue siendo del proveedor",
    "control": "¿IBERIA COMPRÓ LOS BIENES O SÓLO LOS RECIBIÓ PARA VENDERLOS?",
    "norma": "DS 55 art. 16: la mera entrega en consignación no devenga IVA hasta que el consignatario venda.",
    "estado": "🔴",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=8355"
    ]
  },
  {
    "titulo": "Entrega simbólica",
    "falla": "Confundir movimiento físico con momento de entrega tributaria",
    "control": "¿LA MERCADERÍA YA QUEDÓ A DISPOSICIÓN DE IBERIA AUNQUE SIGA EN BODEGA DEL PROVEEDOR?",
    "norma": "DS 55 art. 17 reconoce distintos supuestos de entrega simbólica.",
    "estado": "🟡",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=8355"
    ]
  },
  {
    "titulo": "Ingreso a Zona Franca Primaria",
    "falla": "Aplicar Ruta A normal a un movimiento que entra al recinto franco",
    "control": "¿LA MERCADERÍA NACIONAL/NACIONALIZADA ENTRARÁ A ZONA FRANCA PRIMARIA?",
    "norma": "DFL 2 art. 10 bis: puede ingresar, pero queda sujeta a controles administrativos de Aduanas.",
    "estado": "🔴",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=188367"
    ]
  },
  {
    "titulo": "Cambio de sujeto IVA",
    "falla": "Aplicar factura/IVA normal cuando existe régimen especial de retención",
    "control": "¿IBERIA O EL PROVEEDOR ESTÁN SUJETOS A UN RÉGIMEN DE CAMBIO DE SUJETO PARA ESTA OPERACIÓN?",
    "norma": "En 2026 existen nóminas vigentes de agentes retenedores y contribuyentes sujetos a retención; si aplica, puede corresponder Factura de Compra.",
    "estado": "🟡/🔴",
    "urls": [
      "https://www.sii.cl/normativa_legislacion/resoluciones/2026/res_ind2026.htm"
    ]
  },
  {
    "titulo": "Pérdida de existencias por caso fortuito/fuerza mayor",
    "falla": "Inventario destruido y empresa simplemente lo elimina",
    "control": "¿EXISTE SINIESTRO REAL Y DOCUMENTABLE?",
    "norma": "Instrucciones generales del SII mantienen aviso de pérdidas de existencias por caso fortuito/fuerza mayor dentro de 48 horas, junto con acreditación cuando proceda.",
    "estado": "🔴",
    "urls": [
      "https://www.sii.cl/normativa_legislacion/circulares/2026/circu4.pdf"
    ]
  },
  {
    "titulo": "Vehículo de carga y control carretero SII",
    "falla": "No detenerse en punto de control habilitado",
    "control": "¿EL VEHÍCULO ENCONTRÓ CONTROL CARRETERO/MÓVIL SII?",
    "norma": "Res. SII 91/2026 hace imputable también al propietario del vehículo de carga el incumplimiento de la obligación de detención en esos controles.",
    "estado": "🔴",
    "urls": [
      "https://www.sii.cl/normativa_legislacion/resoluciones/2026/reso91.pdf"
    ]
  },
  {
    "titulo": "Factura/guía en papel",
    "falla": "Bloquear un documento que excepcionalmente sí está autorizado, o aceptar papel sin autorización",
    "control": "¿EXISTE UNA AUTORIZACIÓN/EXCEPCIÓN VIGENTE PARA ESTE EMISOR?",
    "norma": "Facturación electrónica es la regla; las excepciones deben verificarse caso por caso.",
    "estado": "🟡",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ]
  },
  {
    "titulo": "Nuevas reglas de traslado",
    "falla": "Sistema queda desactualizado dentro de semanas",
    "control": "Preparar ahora datos de origen/destino, chofer, transportista, vehículo, vigencia de guía, etc.",
    "norma": "Res. 154/2025, modificada por Res. 52/2026, entra en vigor 1 de noviembre de 2026. Hasta el 31 de octubre se mantienen las reglas actuales.",
    "estado": "🟡 ahora / 🔴 01-11",
    "urls": [
      "https://www.sii.cl/normativa_legislacion/resoluciones/2026/reso52.pdf",
      "https://www.sii.cl/normativa_legislacion/resoluciones/2025/reso154.pdf"
    ]
  }
];

// Nodos y conexiones independientes: las referencias numéricas son IDs de riesgos,
// no numerales visibles de etapas. Las flechas describen controles, no relojes fiscales.
// Desde inventario, Ruta A se divide expresamente en dos carriles:
// 1) flujo operacional de la mercadería; 2) control tributario mensual asociado.
function datoA(id, titulo, row, riesgos = [], extra = {}) {
  return {id:`a-${id}`,titulo,row,col:"2 / 4",riesgos,nota:"",norma:"",url:"",...extra};
}
const nodosA = [
 datoA('inicio','INICIO · ADQUISICIÓN NACIONAL',1,[],{tipo:'terminal'}),
 datoA('regimen','¿ES UNA COMPRA NACIONAL ORDINARIA?',2,[1],{tipo:'decision'}),
 datoA('validar-regimen','VALIDAR RÉGIMEN · NO AVANZAR',2,[1],{col:1,aclaracion:'ZF/ZFE · consignación · otro régimen',nota:'Arica como destino no convierte por sí sola una compra nacional en una operación ZF. Confirmar régimen y procedencia documental. Una vez aclarado, volver a clasificar la operación antes de continuar.'}),
 datoA('especial','¿EXISTEN REQUISITOS ESPECIALES DEL PRODUCTO U OPERACIÓN?',3,[],{tipo:'decision',filtros:true,aclaracion:'Consultar filtros condicionales'}),
 datoA('requisitos','VALIDAR REQUISITOS APLICABLES',3,[],{col:4,filtros:true,aclaracion:'Si no cumple: bloquear. Reanudar al cumplir.',nota:'El cambio de sujeto depende de la operación y de los contribuyentes, no sólo del producto. Esta validación usa los filtros condicionales de la matriz.'}),
 datoA('compra','COTIZAR Y APROBAR COMPRA',4,[2,3],{aclaracion:'Proveedor · SKU · cantidad · precio · condiciones'}),
 datoA('pago','PAGO DE LA ADQUISICIÓN',4,[22,23,24],{col:4,tipo:'event',etiqueta:'EVENTO DE CAJA · MOMENTO VARIABLE',aclaracion:'Normal: neto + IVA · según documento y condiciones comerciales',nota:'Antes de pagar: comprobar monto, vencimiento, acreedor, cesión y respaldo. Ante diferencia: detener el pago y validar. En una compra nacional ordinaria afecta, el desembolso normal corresponde al precio neto más IVA; regímenes especiales o excepciones deben tratarse conforme al documento y regla aplicable. El pago puede ocurrir antes, durante o después de la entrega y no genera por sí solo crédito fiscal.'}),
 datoA('documenta','¿CÓMO SE RESPALDA LA ENTREGA?',5,[6,7,8],{tipo:'decision',nota:'La factura puede anticiparse a la entrega. Si la entrega se respalda con guía, la factura posterior debe referenciarla. La factura definitiva no se exige aquí antes del traslado respaldado por guía.'}),
 datoA('factura','FACTURA',6,[4,8],{col:1,aclaracion:'Anticipada o al entregar',nota:'Vigilar el plazo de revisión desde que el SII recibe el DTE, incluso si la entrega física será posterior. No automatizar un reclamo sin revisar la operación.'}),
 datoA('guia','GUÍA DE DESPACHO',6,[6,7],{col:4,aclaracion:'Controlar factura posterior y referencia a guía(s)',nota:'La guía respalda la entrega/traslado. La factura posterior se controla como pendiente documental; no es una condición para iniciar un traslado válidamente respaldado por guía.'}),
 datoA('valido','¿DOCUMENTO VÁLIDO Y DATOS CORRECTOS?',7,[4,5],{tipo:'decision',nota:'Verificar el documento exigible en esta etapa: RUT emisor e Iberia, folio, fecha, descripción, cantidad, montos y condiciones que correspondan al tipo de documento. Facturación electrónica es la regla; verificar excepciones autorizadas.'}),
 datoA('corregir-doc','CORREGIR · NO CERRAR',7,[4,5],{col:1,aclaracion:'Corregir y volver a validar el documento'}),
 datoA('sii','¿FACTURA / GUÍA QUE AMPARA EL TRASLADO FUE RECIBIDA POR SII Y NO RECHAZADA?',8,[9],{tipo:'decision',nota:'Aplicable al documento electrónico que ampara el traslado, considerando la excepción de conectividad y las autorizaciones válidas de papel. Consultar el filtro de documentación excepcional.'}),
 datoA('no-despachar','NO DESPACHAR · REGULARIZAR',8,[9],{col:4,aclaracion:'Regularizar y revalidar antes del despacho'}),
 datoA('traslado','TRASLADO DOCUMENTADO',9,[10],{aclaracion:'Respaldo exhibible digital o impreso'}),
 datoA('recepcion','RECEPCIÓN EN IBERIA',10,[11,12],{aclaracion:'Fecha · recinto · receptor · SKU · cantidad · estado'}),
 datoA('coincide','¿MERCADERÍA REAL Y DOCUMENTACIÓN COINCIDEN?',11,[11,13,17],{tipo:'decision'}),
 datoA('reclamo','RECLAMAR / REGULARIZAR',11,[13,17],{col:4,aclaracion:'Sin CF de la factura reclamada',nota:'El plazo de 8 días corridos se controla desde la recepción del DTE por SII, no desde la recepción física. Registrar el reclamo oportuno y guardar comunicación fehaciente al proveedor. Regularizar documentalmente y volver a comprobar la concordancia antes de cerrar la recepción.'}),
 datoA('inventario','INGRESO Y CONTROL DE INVENTARIO',12,[25],{aclaracion:'SKU · lote · procedencia documental · cantidad · ubicación',nota:'Registrar la recepción física sin esperar al F29 o al pago. Nacional/nacionalizada describe el régimen o procedencia documental; el país de origen puede ser extranjero. Conservar diferencias y pendientes sin presentarlos como recepción conforme.'}),

 // Carril operacional: la mercadería puede continuar su ciclo sin esperar el cierre mensual de IVA.
 datoA('destino','¿QUÉ OCURRE DESPUÉS CON LA MERCADERÍA?',13,[26,27,28],{col:'1 / 3',tipo:'decision operation',etiqueta:'FLUJO OPERACIONAL',aclaracion:'Venta · traslado · devolución · otra salida',nota:'Las salidas posteriores se controlan cuando ocurren. No dependen de que el F29 del período ya haya sido presentado o pagado. Seleccionar la causal real y conservar su documentación.'}),
 datoA('venta','VENTA NORMAL',14,[],{col:1,tipo:'operation',nota:'Continuar el flujo de venta con la documentación tributaria correspondiente.',norma:'DL 825 · arts. 52–55.',url:fuenteIVA,fuente:'Consultar DL 825'}),
 datoA('interno','TRASLADO INTERNO',14,[27],{col:2,tipo:'operation',aclaracion:'Nueva guía cuando corresponda'}),
 datoA('devolucion','DEVOLUCIÓN AL PROVEEDOR',15,[28],{col:1,tipo:'operation',aclaracion:'Movimiento documentado · NC · ajuste CF'}),
 datoA('otra','OTRA SALIDA / FALTANTE',15,[25,26],{col:2,tipo:'operation',aclaracion:'Validar causa y tratamiento; sin respaldo: bloquear o investigar',filtros:true}),

 // Carril tributario: control asociado, con calendario propio y sin bloquear el movimiento físico por sí solo.
 datoA('acuse','ACEPTACIÓN / ACUSE CUANDO CORRESPONDA',13,[14,15],{col:'3 / 5',tipo:'tax',etiqueta:'FLUJO TRIBUTARIO · CALENDARIO PROPIO',nota:'Distinguir aceptación del contenido y recibo de mercaderías. Aplicar la regla específica de los DTE emitidos al contado y el acuse expreso o automático cuando corresponda. Su posición gráfica representa un carril tributario asociado, no una regla de que el acuse siempre ocurra después del ingreso físico a inventario.'}),
 datoA('cf','¿EL IVA DA DERECHO A CRÉDITO FISCAL?',14,[16,17],{col:'3 / 5',tipo:'decision tax',nota:'Verificar compra real, destino con derecho a crédito, factura válida, IVA separado, recepción/acuse aplicable y ausencia de reclamo. Completar la factura pendiente cuando la entrega se documentó con guía.'}),
 datoA('sin-cf','NO UTILIZAR CF · CLASIFICAR TRATAMIENTO',15,[16,17],{col:3,tipo:'tax',aclaracion:'Si definitivamente no procede, registrar el IVA sin crédito conforme al caso',nota:'No detener por ello toda la operación física. Resolver si existe derecho a crédito; si no existe, registrar el tratamiento tributario que corresponda y continuar al Registro de Compras con la clasificación adecuada.'}),
 datoA('rcv','REGISTRO DE COMPRAS',15,[18,20],{col:4,tipo:'tax',aclaracion:'Clasificación RCV · NC/ND · ajustes'}),
 datoA('periodo','¿PERÍODO DEL CRÉDITO CORRECTO?',16,[19],{col:'3 / 5',tipo:'decision tax'}),
 datoA('corregir-periodo','CORREGIR EL PERÍODO',17,[19],{col:3,tipo:'tax',aclaracion:'Corregir y volver a validar antes de declarar'}),
 datoA('f29','F29 · DECLARAR IVA · PAGAR SI CORRESPONDE',17,[21],{col:4,tipo:'tax',aclaracion:'Dentro del plazo aplicable a Iberia'}),

 datoA('archivo','ARCHIVO Y TRAZABILIDAD',18,[29,30,31],{nota:'Conservar un expediente reconstruible por operación. Los controles de archivo y respaldo acompañan todo el recorrido; no comienzan recién al final. El expediente vincula tanto los movimientos físicos como el tratamiento tributario correspondiente.'}),
 datoA('fin','OPERACIÓN CONTROLADA',19,[],{tipo:'terminal',nota:'Cierre conceptual de controles; no certifica que una operación real haya sido revisada por este diagrama.'})
];
const enlacesA=[];
function linkA(from,to,label='',route='down',event=false){enlacesA.push({from:`a-${from}`,to:`a-${to}`,label,route,event});}

// Tramo común.
linkA('inicio','regimen');
linkA('regimen','especial','SÍ');
linkA('regimen','validar-regimen','NO / DUDA','across');
linkA('validar-regimen','regimen','Reclasificar','loop');
linkA('especial','compra','NO');
linkA('especial','requisitos','SÍ','across');
linkA('requisitos','compra','Cumple','to-left');
linkA('compra','pago','','across',true);
linkA('compra','documenta');
linkA('documenta','factura','Factura','a-branch');
linkA('documenta','guia','Guía','a-branch');
linkA('factura','valido','','a-branch');
linkA('guia','valido','','a-branch');
linkA('valido','sii','SÍ');
linkA('valido','corregir-doc','NO / DUDA','across');
linkA('corregir-doc','valido','Revalidar','loop');
linkA('sii','traslado','SÍ');
linkA('sii','no-despachar','NO','across');
linkA('no-despachar','sii','Revalidar','loop');
linkA('traslado','recepcion');
linkA('recepcion','coincide');
linkA('coincide','inventario','SÍ');
linkA('coincide','reclamo','NO','across');
linkA('reclamo','coincide','Regularizado','loop');

// Desde inventario se separa el proceso operativo del control tributario mensual.
linkA('inventario','destino','Continúa operación','a-branch');
linkA('inventario','acuse','Control tributario asociado','a-branch',true);

// Flujo operacional.
linkA('destino','venta','Venta','a-branch');
linkA('destino','interno','Traslado','a-branch');
linkA('destino','devolucion','Devolución','outer-left');
linkA('destino','otra','Otra','bypass-right');
for(const id of ['venta','interno','devolucion']) linkA(id,'archivo','','a-outer');
linkA('otra','archivo','Respaldo validado','a-outer');

// Flujo tributario.
linkA('acuse','cf');
linkA('cf','rcv','SÍ','a-branch');
linkA('cf','sin-cf','NO / DUDA','a-branch');
linkA('sin-cf','rcv','Clasificado','across');
linkA('rcv','periodo');
linkA('periodo','f29','SÍ','a-branch');
linkA('periodo','corregir-periodo','NO / DUDA','a-branch');
linkA('corregir-periodo','periodo','Revalidar','loop');
linkA('f29','archivo','Cierre tributario asociado','a-branch',true);
linkA('archivo','fin');

function appendRiskBadge(node,ids,matrix=riesgosA){
 if(!ids.length)return;
 const items=matrix.filter(r=>ids.includes(r.id));
 const badges=element('span','risk-badges');
 badges.append(element('span','risk-count',`◇ ${items.length} ${items.length===1?'riesgo':'riesgos'}`));
 const critical=items.filter(r=>r.nivel==='critico').length;
 if(critical)badges.append(element('span','risk-critical',`● ${critical} ${critical===1?'crítico':'críticos'}`));
 node.append(badges);
}
function appendSourceLinks(container,urls){
 for(const [i,url] of urls.entries()){
  const a=element('a','risk-source',`Fuente oficial ${i+1} · ${new URL(url).hostname}`);
  a.href=url;a.target='_blank';a.rel='noopener noreferrer';container.append(a);
 }
}
function appendRiskCards(container,ids,matrix=riesgosA){
 for(const r of matrix.filter(r=>ids.includes(r.id))){
  const card=element('details',`risk-card ${r.nivel}`);
  const summary=element('summary','',`${r.titulo} · ${r.nivel==='critico'?'Crítico':r.nivel==='atencion'?'Atención':'Preventivo'}`);
  card.append(summary);
  if(matrix===riesgosB || matrix===riesgosC)card.append(element("p","",`Estado de revisión aportado: ${r.estado}`));
  for(const [label,value] of [['Qué puede salir mal',r.falla],['Consecuencia para Iberia',r.consecuencia],['Control',r.control],['Responsable principal',r.responsable],['Evidencia sugerida de control',r.evidencia],['Base normativa · en simple',r.norma]]){
   card.append(element('h3','',label),element('p','',value));
  }
  if(r.bloqueo)card.append(element('p','risk-action','Control de detención propuesto: resolver el incumplimiento antes de la acción afectada.'));
  appendSourceLinks(card,r.urls);card.open=ids.length<=3;container.append(card);
 }
}
function appendFilterCards(container,filters=filtrosA){
 container.append(element('p','','Se activan sólo cuando la condición aplica al SKU, contribuyente u operación.'));
 for(const f of filters){
  const card=element('details','risk-card');card.append(element('summary','',f.titulo));
  card.append(element('h3','','Riesgo'),element('p','',f.falla),element('h3','','Pregunta de control'),element('p','',f.control),element('h3','','Base normativa · en simple'),element('p','',f.norma));
  appendSourceLinks(card,f.urls);container.append(card);
 }
}
function openRiskPanel(title,render){
 document.querySelector('#detail-title').textContent=title;
 const content=document.querySelector('#detail-content');content.replaceChildren();
 dialog.classList.add('risk-drawer');render(content);dialog.showModal();dialog.scrollTop=0;
}
function renderRiskTools(){
 const tools=element('section','risk-tools');tools.id='risk-tools';
 tools.append(element('p','','Matriz de riesgos V1.0 · 31 riesgos · 10 filtros condicionales'));
 const actions=element('div','risk-tool-actions');
 for(const [label,action] of [
  ['Ver matriz completa',()=>openRiskPanel('MATRIZ DE RIESGOS · RUTA A',c=>{
   c.append(element('p','','Los niveles reflejan la prioridad de la matriz; no son un estado de cumplimiento de una compra real. La evidencia y los responsables son controles propuestos para Iberia.'));
   const input=element('input','risk-search');input.type='search';input.placeholder='Buscar etapa, riesgo o responsable';input.setAttribute('aria-label','Buscar en la matriz');c.append(input);
   const list=element('div');c.append(list);const update=()=>{list.replaceChildren();const q=input.value.toLocaleLowerCase('es');appendRiskCards(list,riesgosA.filter(r=>[r.titulo,r.falla,r.control,r.responsable,r.norma].join(' ').toLocaleLowerCase('es').includes(q)).map(r=>r.id));if(!list.children.length)list.append(element('p','','Sin coincidencias.'));};input.addEventListener('input',update);update();
  })],
  ['Filtros condicionales',()=>openRiskPanel('FILTROS POR SKU / OPERACIÓN',appendFilterCards)],
  ['Trazabilidad',()=>openRiskPanel('EXPEDIENTE DE TRAZABILIDAD',c=>{
   c.append(element('h3','','Por lote / operación'),element('p','','SKU → proveedor → régimen/procedencia → OC → factura → guía(s) → recepción → cantidad → ubicación → RCV/CF → pago → movimientos posteriores → saldo final.'));
   c.append(element('h3','','Por DTE'),element('p','','Folio · RUT emisor · RUT Iberia · fecha de emisión · recepción SII · estado SII · fecha y estado del reclamo · fecha del acuse · período CF · NC/ND asociadas · estado de pago.'));
   c.append(element('p','risk-action','¿Puede Iberia reconstruir de dónde salió la mercadería, cómo llegó, qué documento la respaldó, cuándo utilizó el IVA y qué pasó con ella?'));
  })]
 ]){const b=element('button','',label);b.type='button';b.addEventListener('click',action);actions.append(b);}
 tools.append(actions,element('p','risk-help','Pulsa una etapa para ver riesgo, consecuencia, control, responsable, evidencia y norma. Crítico no significa bloqueo de toda la compra: cada control identifica la acción afectada.'));
 diagram.before(tools);
 document.querySelector('#route-context').hidden=false;
 document.querySelector('#route-context').textContent='Ruta A separa dos carriles después de la recepción: flujo operacional de la mercadería y control tributario mensual. Venta, traslado o devolución no esperan al F29; pago, DTE, entrega, acuse y declaración tienen fechas propias.';
}

const riesgosB = [
  {
    "id": 1,
    "titulo": "Selección de mercancía",
    "falla": "Se pretende usar Ruta B para una mercancía que no puede adquirirse con franquicias de ZFE.",
    "consecuencia": "La operación puede quedar sometida a un régimen distinto al modelado; riesgo de internación incorrecta y contingencia aduanera.",
    "control": "Antes de comprar, verificar que el SKU no esté incluido entre las mercancías excluidas del régimen ZFE.",
    "responsable": "Iberia",
    "norma": "DFL 2/2001, art. 21: existe una lista de mercancías que no pueden importarse con franquicias desde Zona Franca; las demás se entienden de adquisición permitida para uso o consumo en ZFE.",
    "estado": "🟢 VALIDADO",
    "nivel": "preventivo",
    "evidencia": "Ficha SKU y revisión de admisibilidad",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=188367"
    ],
    "bloqueo": false
  },
  {
    "id": 2,
    "titulo": "Definición del destino",
    "falla": "Se formaliza la operación como ZOFRI → ZFE pero el destino real no es Arica/ZFE.",
    "consecuencia": "Se aplica un régimen que no corresponde al destino efectivo de la mercancía.",
    "control": "Definir y documentar el destino Arica/ZFE antes del despacho.",
    "responsable": "Iberia + usuario ZOFRI",
    "norma": "DFL 2/2001, art. 21: las mercancías acogidas a este régimen deben ser usadas o consumidas dentro de la ZFE; su importación posterior al resto del país tiene tratamiento distinto.",
    "estado": "🟢 VALIDADO",
    "nivel": "preventivo",
    "evidencia": "Acuerdo comercial y destino documentado",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=188367"
    ],
    "bloqueo": false
  },
  {
    "id": 3,
    "titulo": "Compra al usuario ZOFRI / Art. 11",
    "falla": "Se calcula el Art. 11 sobre una base incorrecta, se usa una tasa desactualizada o no se incorpora correctamente a la operación.",
    "consecuencia": "Diferencia tributaria, error en caja y eventual pérdida o cuestionamiento del crédito fiscal.",
    "control": "Vincular cada operación a su CIF documentado y aplicar la tasa vigente. Mantener precio de compra y Art. 11 separados en el modelo.",
    "responsable": "Usuario ZOFRI para retención; Iberia/Contabilidad para registro y control.",
    "norma": "Ley 18.211, art. 11: grava la importación a ZFE sobre el valor CIF y el impuesto debe ser retenido por el usuario de Zona Franca. Desde el 1-4-2026 la tasa es 0,33%.",
    "estado": "🟢 VALIDADO",
    "nivel": "preventivo",
    "evidencia": "CIF documentado, cálculo, tasa y comprobante de retención",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=29631",
      "https://www.bcn.cl/leychile/navegar?idNorma=1221834"
    ],
    "bloqueo": false
  },
  {
    "id": 4,
    "titulo": "Documento de salida",
    "falla": "Se utiliza un documento, tipo de operación o procedimiento que no corresponde a la salida hacia Arica/ZFE.",
    "consecuencia": "Aduanas puede observar o impedir que continúe el despacho; pérdida de trazabilidad documental.",
    "control": "Verificar antes del movimiento cuál es el documento de salida a ZFE vigente para la operación y usuario correspondiente.",
    "responsable": "Usuario ZOFRI",
    "norma": "El Manual de Zona Franca regula las declaraciones/documentos de salida y su operatoria. La normativa ha tenido implementación y modificaciones recientes, por lo que conviene conservar en el diagrama la denominación funcional “documento de salida a ZFE” y validar la modalidad concreta al ejecutar. La Res. 1844/2026 volvió a modificar el Manual.",
    "estado": "🟡 POR CONFIRMAR EN OPERACIÓN REAL",
    "nivel": "atencion",
    "evidencia": "Documento de salida y modalidad confirmada con usuario",
    "urls": [
      "https://www.aduana.cl/aduana/site/docs/20200915/20200915161445/manual_zona_franca_con_anexos_v20200807.pdf",
      "https://www.bcn.cl/leychile/navegar?idNorma=1227294"
    ],
    "bloqueo": false
  },
  {
    "id": 5,
    "titulo": "Datos del documento de salida",
    "falla": "Producto, cantidad, valor, CIF, origen u otros antecedentes no coinciden con la operación real.",
    "consecuencia": "Observación aduanera, retraso, rectificación y eventualmente procedimiento infraccional según la naturaleza de la diferencia.",
    "control": "Conciliar documento ↔ factura/venta ↔ SKU ↔ cantidad ↔ CIF ↔ mercancía física antes del despacho.",
    "responsable": "Usuario ZOFRI, con control de Iberia sobre su compra",
    "norma": "La documentación de salida distingue valores de venta, CIF y antecedentes de la mercancía; para mercancías destinadas a ZFE se registra además el impuesto de la Ley 18.211.",
    "estado": "🟢 VALIDADO",
    "nivel": "preventivo",
    "evidencia": "Conciliación documental y física",
    "urls": [
      "https://www.aduana.cl/aduana/site/docs/20200915/20200915161445/manual_zona_franca_con_anexos_v20200807.pdf",
      "https://www.bcn.cl/leychile/navegar?idNorma=1227294"
    ],
    "bloqueo": false
  },
  {
    "id": 6,
    "titulo": "Visación ZOFRI",
    "falla": "Se interpreta la visación del sistema de ZOFRI como si fuera por sí sola una autorización total de Aduanas.",
    "consecuencia": "Se podría mover mercancía antes de completar el control aduanero que corresponda.",
    "control": "Diferenciar expresamente visación/validación ZOFRI de la actuación y autorización del Servicio Nacional de Aduanas.",
    "responsable": "Usuario ZOFRI / ZOFRI S.A.",
    "norma": "La documentación de Zona Franca contempla actuaciones diferenciadas de usuario, administración de ZF y Aduanas. En formularios históricos/vigentes del sistema, la autorización de salida aparece reservada al control aduanero.",
    "estado": "🟢 VALIDADO",
    "nivel": "preventivo",
    "evidencia": "Estado de visación y actuación de Aduanas separados",
    "urls": [
      "https://www.aduana.cl/aduana/site/docs/20200915/20200915161445/manual_zona_franca_con_anexos_v20200807.pdf"
    ],
    "bloqueo": false
  },
  {
    "id": 7,
    "titulo": "Control aduanero previo a salida",
    "falla": "La mercancía se retira físicamente sin haber cumplido el control o autorización de salida que corresponda.",
    "consecuencia": "Bloqueo del despacho y riesgo infraccional si se retira mercancía contraviniendo el régimen.",
    "control": "No liberar ni transportar la mercancía hasta que el estado documental/aduanero permita la salida.",
    "responsable": "Usuario ZOFRI + transportista; fiscaliza Aduanas",
    "norma": "DFL 2/2001, art. 22: retirar o introducir mercancías de ZF/ZFE contraviniendo el régimen puede constituir contrabando o fraude aduanero, según corresponda.",
    "estado": "🔴 CONTROL CRÍTICO",
    "nivel": "critico",
    "evidencia": "Estado aduanero habilitante para retiro",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=188367",
      "https://www.aduana.cl/aduana/site/docs/20200915/20200915161445/manual_zona_franca_con_anexos_v20200807.pdf"
    ],
    "bloqueo": true
  },
  {
    "id": 8,
    "titulo": "Revisión documental / física",
    "falla": "Aduanas detecta diferencias entre la documentación y la mercancía o antecedentes insuficientes.",
    "consecuencia": "Detención de la operación, aclaraciones, rectificaciones y posibles medidas sancionatorias según el incumplimiento efectivo.",
    "control": "Gate obligatorio: ¿control aduanero conforme? Si NO, no continuar hasta que Aduanas resuelva.",
    "responsable": "Usuario ZOFRI / Aduanas",
    "norma": "El procedimiento de salida contempla control aduanero y posibilidad de examen físico conforme a selectividad. No conviene afirmar que toda diferencia produce automáticamente la misma sanción; la consecuencia depende del incumplimiento concreto.",
    "estado": "🟡 CONSECUENCIA ESPECÍFICA SEGÚN CASO",
    "nivel": "atencion",
    "evidencia": "Resultado de revisión y resolución de diferencias",
    "urls": [
      "https://www.aduana.cl/aduana/site/docs/20200915/20200915161445/manual_zona_franca_con_anexos_v20200807.pdf",
      "https://www.bcn.cl/leychile/navegar?idNorma=1227294"
    ],
    "bloqueo": false
  },
  {
    "id": 9,
    "titulo": "Permisos o vistos buenos",
    "falla": "El producto requiere autorización, certificación o V°B° sectorial y se intenta despachar sin ella.",
    "consecuencia": "Despacho detenido o mercancía no habilitada para su destino/comercialización.",
    "control": "Revisar por SKU si existe requisito SEC, SAG, sanitario u otro y comprobarlo en el momento exigido.",
    "responsable": "Iberia / proveedor / usuario ZOFRI, según requisito",
    "norma": "No existe una exigencia sectorial universal para toda ferretería: depende de la naturaleza del producto. Por eso debe tratarse como Gate condicional, no como obligación automática para todo SKU.",
    "estado": "🟡 SEGÚN PRODUCTO",
    "nivel": "atencion",
    "evidencia": "Certificado, permiso o visto bueno aplicable al SKU",
    "urls": [
      "https://www.sec.cl/sistema-de-certificacion-de-productos-sec/",
      "https://www.sag.gob.cl/ambitos-de-accion/productos-agricolas"
    ],
    "bloqueo": false
  },
  {
    "id": 10,
    "titulo": "Traslado ZOFRI → Arica",
    "falla": "Durante el movimiento se pierde la correspondencia entre mercancía física y documentación.",
    "consecuencia": "Iberia puede recibir mercadería cuyo origen/régimen no puede demostrar posteriormente.",
    "control": "Transporte acompañado por documentación correspondiente y recepción conciliada contra origen, cantidades y documento de salida.",
    "responsable": "Usuario ZOFRI + transportista + Iberia",
    "norma": "El DFL 2 exige que los movimientos de mercancías se efectúen conforme al régimen; el problema material no es que las cajas estén físicamente juntas, sino perder la capacidad de acreditar su situación.",
    "estado": "🟢 VALIDADO",
    "nivel": "preventivo",
    "evidencia": "Documentos del traslado y conciliación de recepción",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=188367"
    ],
    "bloqueo": false
  },
  {
    "id": 11,
    "titulo": "Recepción en Arica/ZFE",
    "falla": "Iberia recibe mercadería pero no registra inmediatamente origen, documento, lote o cantidad.",
    "consecuencia": "Pérdida de trazabilidad; después puede ser imposible distinguir mercadería nacional de mercancía acogida a ZFE.",
    "control": "En la recepción registrar al menos SKU, origen, documento, lote/recepción, cantidad, ubicación y régimen.",
    "responsable": "Iberia",
    "norma": "El DFL 2 distingue las mercancías acogidas a ZFE y condiciona su tratamiento posterior al régimen y destino. La trazabilidad interna es un control, no necesariamente una obligación legal de usar físicamente bodegas separadas.",
    "estado": "🟢 CONTROL INTERNO",
    "nivel": "preventivo",
    "evidencia": "Registro de recepción con régimen, lote y cantidades",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=188367"
    ],
    "bloqueo": false
  },
  {
    "id": 12,
    "titulo": "Inventario",
    "falla": "Mercadería nacional y ZFE se mezcla en el ERP o inventario sin identificación lógica de origen.",
    "consecuencia": "Riesgo de despachar al resto del país una unidad ZFE creyendo que era mercancía nacionalizada.",
    "control": "Mantener separación lógica por origen/régimen, aun cuando exista almacenamiento físico conjunto.",
    "responsable": "Iberia",
    "norma": "DFL 2, arts. 21 y 22: el régimen cambia según destino y forma de salida; por eso Iberia necesita poder saber qué mercancía está bajo ZFE antes de moverla.",
    "estado": "🔴 CONTROL CRÍTICO",
    "nivel": "critico",
    "evidencia": "Inventario por procedencia documental y saldo",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=188367"
    ],
    "bloqueo": true
  },
  {
    "id": 13,
    "titulo": "Comercialización",
    "falla": "Se vende un producto que todavía no cumple exigencias sectoriales aplicables para comercializarse o utilizarse.",
    "consecuencia": "Prohibición de venta, retiro de producto o sanciones sectoriales, dependiendo del SKU.",
    "control": "Estado de inventario “no comercializable” hasta que se cumpla el requisito aplicable; no asumir que todo incumplimiento puede regularizarse después.",
    "responsable": "Iberia",
    "norma": "La obligación concreta depende del producto y de la autoridad competente. No debe presentarse SEC/SAG/Salud como exigencia universal para toda la Ruta B.",
    "estado": "🟡 SEGÚN PRODUCTO",
    "nivel": "atencion",
    "evidencia": "Estado comercializable y respaldo sectorial",
    "urls": [
      "https://www.sec.cl/sistema-de-certificacion-de-productos-sec/"
    ],
    "bloqueo": true
  },
  {
    "id": 14,
    "titulo": "Registro tributario Art. 11",
    "falla": "Iberia trata el Art. 11 como si fuera un IVA crédito fiscal normal del 19%, o lo registra sin respaldo.",
    "consecuencia": "F29 incorrecto y riesgo de rechazo del crédito fiscal.",
    "control": "Registrar separadamente el CF Art. 11, con documento y período tributario correspondiente.",
    "responsable": "Contabilidad Iberia",
    "norma": "Ley 18.211 art. 11 + Ley Arica art. 24: el contribuyente establecido en ZFE sujeto al IVA puede recuperar como crédito fiscal el impuesto Art. 11 que haya pagado por la importación. No es un CF de IVA de compra de 19%.",
    "estado": "🟢 VALIDADO",
    "nivel": "preventivo",
    "evidencia": "Registro separado, documento y período del Art. 11",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=29631",
      "https://www.bcn.cl/leychile/navegar?idNorma=17186"
    ],
    "bloqueo": false
  },
  {
    "id": 15,
    "titulo": "Venta en Arica / F29",
    "falla": "Se mezcla temporalmente el CF Art. 11 con el débito IVA de una venta realizada en otro período.",
    "consecuencia": "F29 mal modelado y flujo de caja incorrecto.",
    "control": "Separar período del Art. 11 y período de la venta. El DF IVA nace de las operaciones de venta del período correspondiente.",
    "responsable": "Contabilidad Iberia",
    "norma": "El Art. 11 puede recuperarse como CF conforme a sus requisitos; la venta posterior dentro de ZFE se somete a las reglas del DL 825. Por tanto, CF y DF no necesariamente ocurren el mismo mes.",
    "estado": "🟢 VALIDADO",
    "nivel": "preventivo",
    "evidencia": "Documentos de venta y conciliación de períodos",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=29631",
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ],
    "bloqueo": false
  },
  {
    "id": 16,
    "titulo": "Destino posterior de la mercadería",
    "falla": "Aplicar al movimiento posterior un régimen que no corresponde: despachar B extranjera sin el trámite exigible o tratar B2 correctamente reingresada como si continuara bajo la restricción ZFE de B.",
    "consecuencia": "En B, salida contraria al régimen y contingencias aduaneras según el caso. En B2, bloqueo improcedente o tratamiento documental incorrecto por no reconocer el régimen resultante del reingreso.",
    "control": "Si régimen = B extranjera: verificar permanencia en ZFE o procedimiento aduanero previo para salir al resto del país; sin el trámite exigible, bloquear el despacho. Si régimen = B2 nacional/nacionalizada: verificar que el reingreso del art. 10 bis por el mismo adquirente esté correctamente documentado y aplicar desde entonces el régimen resultante; no bloquear automáticamente un despacho a Santiago por la regla ZFE de B.",
    "responsable": "Iberia",
    "norma": "DFL 2/2001 · arts. 21 y 22 para B extranjera acogida a ZFE; art. 10 bis para B2 nacional/nacionalizada y su reingreso. Las restricciones de permanencia de B no se trasladan automáticamente a B2 tras su correcto reingreso.",
    "estado": "CONTROL CRÍTICO · respaldo completado",
    "nivel": "critico",
    "evidencia": "Régimen B/B2, destino y documentación del movimiento; en B2, respaldo del reingreso art. 10 bis por el mismo adquirente.",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=188367"
    ],
    "bloqueo": true
  }
];
// Ruta B: mismo componente visual que A; datos y controles propios del régimen ZFE.
const zfB='https://www.bcn.cl/leychile/navegar?idNorma=188367';
const filtrosRiesgoB=[
 {titulo:'Certificación SEC',falla:'Comercializar un SKU regulado sin certificado, sello o autorización aplicable.',control:'¿El SKU está regulado? Verificar certificado, marcado o autorización vigente antes de vender.',norma:'SEC: certificación y marcado exigibles a productos regulados, según el producto.',urls:['https://www.sec.cl/sistema-de-certificacion-de-productos-sec/']},
 {titulo:'Sustancias peligrosas · transporte',falla:'Despachar sin documentación, identificación, vehículo o estiba adecuados.',control:'¿La carga está clasificada como peligrosa? Validar expedidor y transportista antes del viaje.',norma:'DS 298/1994 Transportes · arts. 1, 2, 7 y 30. Identificación, documentación y condiciones aplicables al transporte.',urls:['https://www.bcn.cl/leychile/navegar?idNorma=12087']},
 {titulo:'Sustancias peligrosas · almacenamiento',falla:'La bodega no cumple las condiciones para la clase y cantidad almacenada.',control:'Determinar sustancia, cantidad y condiciones exigidas a la instalación de Iberia.',norma:'DS 43/2015 Salud: condiciones de almacenamiento diferenciadas según clase y cantidad.',urls:['https://www.bcn.cl/leychile/navegar?idNorma=1088802']},
 {titulo:'Productos regulados por SAG',falla:'Asumir que estar en ZOFRI elimina los requisitos fitosanitarios.',control:'Verificar requisito concreto del producto, condición y origen; consultar SAG cuando corresponda.',norma:'SAG: exigencias fitosanitarias para productos agrícolas, forestales y artículos reglamentados.',urls:['https://www.sag.gob.cl/ambitos-de-accion/productos-agricolas']},
 {"titulo": "Salida posterior al resto de Chile", "falla": "Aplicar al movimiento posterior un régimen que no corresponde: despachar B extranjera sin el trámite exigible o tratar B2 correctamente reingresada como si continuara bajo la restricción ZFE de B.", "control": "Si régimen = B extranjera: verificar permanencia en ZFE o procedimiento aduanero previo para salir al resto del país; sin el trámite exigible, bloquear el despacho. Si régimen = B2 nacional/nacionalizada: verificar que el reingreso del art. 10 bis por el mismo adquirente esté correctamente documentado y aplicar desde entonces el régimen resultante; no bloquear automáticamente un despacho a Santiago por la regla ZFE de B.", "norma": "DFL 2/2001 · arts. 21 y 22 para B extranjera acogida a ZFE; art. 10 bis para B2 nacional/nacionalizada y su reingreso. Las restricciones de permanencia de B no se trasladan automáticamente a B2 tras su correcto reingreso.", "urls": ["https://www.bcn.cl/leychile/navegar?idNorma=188367"]},
 {titulo:'Devolución, traslado o cambio de destino',falla:'Perder la trazabilidad del régimen en un movimiento posterior.',control:'Identificar unidad/lote, documento y régimen antes del movimiento; comprobar nuevo destino.',norma:'DFL 2/2001 · arts. 21 y 22. La identificación lógica propuesta es control interno; no establece segregación física universal.',urls:[zfB]}
];
function bControl(id,titulo,row,riesgos=[],extra={}){return {id:'br-'+id,titulo,row,col:2,riesgos,matriz:riesgosB,nota:'',norma:'',url:'',...extra};}
const flujoRiesgoB=[
 bControl('inicio','INICIO',1,[],{tipo:'terminal'}),
 bControl('mercancia','MERCADERÍA EN ZOFRI IQUIQUE',2,[1,2],{aclaracion:'Mercancía extranjera · vendedor usuario ZOFRI'}),
 bControl('regimen','¿LA OPERACIÓN ES REALMENTE RUTA B?',3,[2],{tipo:'decision',aclaracion:'ZOFRI → Arica / ZFE'}),
 bControl('reclasificar','RECLASIFICAR OPERACIÓN',3,[2],{col:1,aclaracion:'No aplicar Ruta B hasta validar régimen'}),
 bControl('admisible','¿LA MERCANCÍA PUEDE ACOGERSE A ZFE?',4,[1],{tipo:'decision'}),
 bControl('otra-ruta','NO UTILIZAR RUTA B BAJO ZFE',4,[1],{col:3,tipo:'stop',aclaracion:'Evaluar otra ruta o tratamiento'}),
 bControl('destino','DEFINIR DESTINO: ARICA / ZFE',5,[2],{aclaracion:'Comprador Iberia · destino documentado'}),
 bControl('compra','COTIZAR Y FORMALIZAR COMPRA',6,[3],{aclaracion:'Proveedor · SKU · cantidad · precio · CIF documentado · Art. 11 · condiciones'}),
 bControl('caja','PAGO DE LA ADQUISICIÓN',6,[],{col:3,tipo:'event',etiqueta:'CAJA · MOMENTO VARIABLE',aclaracion:'Según condiciones comerciales',nota:'La posición lateral no fija fecha de pago. Separar precio de compra, impuesto art. 11 y otros gastos identificados. La retención y los requisitos de recuperación tienen reglas propias.'}),
 bControl('base','¿DATOS, CIF Y ART. 11 CORRECTOS Y RESPALDADOS?',7,[3],{tipo:'decision',nota:'Tasa 0,33 % desde el 01-04-2026, según Res. 611/2026. Base CIF; no sustituirla automáticamente por el precio de venta. El usuario ZOFRI retiene conforme al régimen.',norma:'Ley 18.211 · art. 11; Res. 611/2026.',url:'https://www.bcn.cl/leychile/navegar?idNorma=1221834',fuente:'Consultar tasa oficial · Res. 611/2026'}),
 bControl('corregir-base','CORREGIR DATOS Y CÁLCULO',7,[3],{col:1,aclaracion:'Revalidar antes de documentar salida'}),
 bControl('documento','CONFECCIONAR DOCUMENTO DE SALIDA A ZFE',8,[4],{nota:implementacion+' La Res. 1844/2026 modifica el Manual; comprobar modalidad concreta habilitada para usuario y operación.'}),
 bControl('documento-ok','¿DOCUMENTO COINCIDE CON LA OPERACIÓN REAL?',9,[5,9],{tipo:'decision',filtrosB:true}),
 bControl('corregir-doc','NO DESPACHAR · CORREGIR',9,[5,9],{col:3,aclaracion:'Comprador · SKU · cantidad · CIF · destino · permisos aplicables'}),
 bControl('visa','ZOFRI / SISTEMA VISA O VALIDA',10,[6],{aclaracion:'Visación ZOFRI ≠ autorización Aduanas'}),
 bControl('aduanas','CONTROL / LEGALIZACIÓN DE ADUANAS',11,[7,8],{aclaracion:'Actuación según procedimiento vigente'}),
 bControl('inspeccion','¿SE REQUIERE REVISIÓN FÍSICA?',12,[8],{tipo:'decision'}),
 bControl('fisica','RECONOCIMIENTO ADUANERO',13,[8]),
 bControl('diferencias','¿SE DETECTAN DIFERENCIAS?',14,[8],{tipo:'decision'}),
 bControl('detener','DETENER OPERACIÓN · ESPERAR RESOLUCIÓN ADUANAS',14,[8],{col:3,tipo:'issue',aclaracion:'No mover hasta resolución / habilitación',nota:'La consecuencia depende del incumplimiento efectivo. No toda diferencia produce automáticamente la misma sanción. Este nodo no es un fin: si Aduanas resuelve y habilita la operación, se revalida el estado de salida.'}),
 bControl('salida-ok','¿EL ESTADO ADUANERO PERMITE LA SALIDA?',15,[7],{tipo:'decision'}),
 bControl('no-retirar','NO RETIRAR MERCADERÍA',15,[7],{col:1,tipo:'stop',aclaracion:'Esperar corrección o resolución'}),
 bControl('salida','SALIDA DE ZOFRI → ARICA / ZFE',16,[10],{aclaracion:'Mercancía + documentos + trazabilidad',filtrosB:true}),
 bControl('recepcion','RECEPCIÓN EN ARICA / ZFE',17,[11],{aclaracion:'Control aplicable · SKU · cantidades · documento · régimen'}),
 bControl('traza','¿TRAZABILIDAD COMPLETA?',18,[11,12],{tipo:'decision'}),
 bControl('bloqueo-traza','BLOQUEAR DESPACHOS · ACLARAR',18,[12],{col:3,aclaracion:'Recuperar identificación antes de mover o vender'}),
 bControl('inventario','INGRESO A INVENTARIO IBERIA',19,[12],{aclaracion:'SKU · procedencia ZOFRI → ZFE · documento · lote · cantidad',nota:'Procedencia/régimen no equivale a país de origen. Conservar identificación lógica aun con almacenamiento conjunto; no se establece una obligación general de bodegas separadas.'}),
 bControl('habilitado','¿SKU HABILITADO PARA COMERCIALIZARSE?',20,[13],{tipo:'decision',filtrosB:true}),
 bControl('no-vender','BLOQUEAR PARA VENTA',20,[13],{col:1,aclaracion:'Actuar según autoridad y posibilidad de subsanar'}),
 bControl('tributos','TRATAMIENTO TRIBUTARIO · ART. 11',21,[14,15],{aclaracion:'Registro separado · CF si procede · período correcto',nota:'No es IVA de compra del 19 %. La recuperación requiere cumplir las condiciones de Ley 18.211 y Decreto 1197/1995. CF y débito de venta pueden corresponder a meses distintos. Este control no obliga a esperar el F29 antes de vender.'}),
 bControl('destino-final','ANTES DE MOVER: ¿DESTINO DENTRO DE ZFE?',22,[16],{tipo:'decision',filtrosB:true}),
 bControl('previo','¿PROCEDIMIENTO PREVIO PARA SALIR AL RESTO DEL PAÍS CUMPLIDO?',23,[16],{col:3,tipo:'decision',nota:'La rama representa salida al resto de Chile. Una devolución a ZOFRI u otro destino requiere su procedimiento específico; no convertir todo destino fuera de ZFE en una importación al resto del país.'}),
 bControl('venta','VENTA / DESPACHO DENTRO DE ZFE',24,[15,16],{aclaracion:'DTE correspondiente · IVA débito cuando proceda',nota:'Conservar el período de la venta y los documentos del movimiento. Para traslados o devoluciones no representarlos automáticamente como una venta.'}),
 bControl('bloqueo-final','BLOQUEAR DESPACHO',24,[16],{col:3,tipo:'stop',aclaracion:'Sin procedimiento previo no sale'}),
 bControl('continuar','CONTINUAR SEGÚN TRÁMITE',25,[16],{col:3}),
 bControl('fin','FIN',26,[],{tipo:'terminal',nota:'Cierre del flujo representado. No certifica cumplimiento de una operación real.'})
];
const conexionesRiesgoB=[];
function eb(a,b,label='',route='down',event=false){conexionesRiesgoB.push({from:'br-'+a,to:'br-'+b,label,route,event});}
const cadenaB=['inicio','mercancia','regimen','admisible','destino','compra','base','documento','documento-ok','visa','aduanas','inspeccion','fisica','diferencias','salida-ok','salida','recepcion','traza','inventario','habilitado','tributos','destino-final'];
cadenaB.slice(1).forEach((n,i)=>eb(cadenaB[i],n,cadenaB[i]==='diferencias'?'NO':['regimen','admisible','base','documento-ok','inspeccion','salida-ok','traza','habilitado'].includes(cadenaB[i])?'SÍ':''));
for(const [a,b,label] of [['regimen','reclasificar','NO / DUDA'],['admisible','otra-ruta','NO'],['base','corregir-base','NO / DUDA'],['documento-ok','corregir-doc','NO / DUDA'],['diferencias','detener','SÍ'],['salida-ok','no-retirar','NO'],['traza','bloqueo-traza','NO'],['habilitado','no-vender','NO']])eb(a,b,label,'across');
eb('corregir-base','base','Revalidar','return');
eb('corregir-doc','documento','Corregir / reenviar','return');
eb('bloqueo-traza','traza','Aclarar / revalidar','return');
eb('compra','caja','','across',true);eb('inspeccion','salida-ok','NO','outer-left');
eb('detener','salida-ok','Resolución / habilitación','to-left');
eb('destino-final','venta','SÍ');eb('destino-final','previo','NO · resto de Chile','a-branch');
eb('previo','bloqueo-final','NO');eb('previo','continuar','SÍ','bypass-right');eb('venta','fin');eb('continuar','fin','','a-branch');
function renderBTools(){
 const t=element('section','risk-tools');t.id='risk-tools';
 t.append(element('p','','Compra en ZOFRI · B/B2 · 20 riesgos · 6 filtros condicionales'));
 const bar=element('div','risk-tool-actions');
 const add=(label,fn)=>{const b=element('button','',label);b.type='button';b.onclick=fn;bar.append(b);};
 add('Ver matriz completa',()=>openRiskPanel('MATRIZ DE RIESGOS · RUTA B',c=>{
  c.append(element('p','','“Validado” reproduce el estado de revisión de la matriz suministrada; no acredita controles cumplidos en una operación real. Evidencia sugerida y prioridad visual son controles internos.'));
  const q=element('input','risk-search');q.type='search';q.placeholder='Buscar etapa, riesgo o responsable';q.setAttribute('aria-label','Buscar en matriz Ruta B');c.append(q);
  const list=element('div');c.append(list);const update=()=>{list.replaceChildren();appendRiskCards(list,riesgosB.filter(r=>JSON.stringify(r).toLowerCase().includes(q.value.toLowerCase())).map(r=>r.id),riesgosB);};q.oninput=update;update();
 }));
 add('Filtros condicionales',()=>openRiskPanel('FILTROS CONDICIONALES · RUTA B',c=>appendFilterCards(c,filtrosRiesgoB)));
 add('Trazabilidad',()=>openRiskPanel('TRAZABILIDAD · RUTA B',c=>{c.append(element('p','','SKU → usuario ZOFRI → régimen B/B2 → compra y valores aplicables → documento de salida propio → estado aduanero → traslado → recepción → lote/cantidad/ubicación → tratamiento tributario según régimen → destino posterior.'));c.append(element('p','','La identificación lógica es un control interno. Mismo SKU y misma bodega no significan mismo régimen.'));}));
 add('Modo auditoría',()=>{const on=diagram.classList.toggle('audit-mode');bar.lastChild.textContent=on?'Modo flujo':'Modo auditoría';scheduleConnections();});
 t.append(bar,element('p','risk-help','Selecciona una etapa: riesgo → consecuencia → control → responsable → evidencia → norma. No se calcula un porcentaje de seguridad jurídica.'));diagram.before(t);
}

const riesgosC = [
  {
    "id": 1,
    "titulo": "Definir producto a importar",
    "falla": "Descripción técnica incompleta o distinta al producto real",
    "consecuencia": "Puede arrastrar errores de clasificación, permisos, valoración y documentación",
    "control": "Ficha técnica mínima: descripción, composición/material, función, marca/modelo y uso",
    "responsable": "Iberia",
    "norma": "Ordenanza de Aduanas + Compendio de Normas Aduaneras (CNA). La declaración debe representar correctamente la mercancía que realmente se importa",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "Ficha técnica, composición y uso",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "id": 2,
    "titulo": "Clasificación arancelaria",
    "falla": "Asignar una partida arancelaria incorrecta",
    "consecuencia": "Derechos mal calculados, permisos omitidos, diferencias tributarias o sanciones",
    "control": "Validar código arancelario con antecedentes técnicos; consultar al agente cuando exista duda",
    "responsable": "Iberia / Agente de Aduanas",
    "norma": "Arancel Aduanero + Ordenanza de Aduanas. La clasificación determina el tratamiento aduanero del producto",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "Código arancelario y antecedentes técnicos",
    "urls": [
      "https://www.aduana.cl/arancel-aduanero-vigente/aduana/2016-12-30/090118.html",
      "https://www.bcn.cl/leychile/navegar?idNorma=237264"
    ]
  },
  {
    "id": 3,
    "titulo": "Importabilidad",
    "falla": "Comprar o embarcar mercancía cuya importación está prohibida o restringida sin cumplir requisitos",
    "consecuencia": "Retención, imposibilidad de importar y eventualmente infracción aduanera grave",
    "control": "Gate previo: ¿la mercancía puede importarse legalmente?",
    "responsable": "Iberia",
    "norma": "Ordenanza de Aduanas, especialmente régimen de mercancías prohibidas. Antes de importar debe comprobarse que el producto puede ingresar al país",
    "estado": "🟢 VALIDADO",
    "nivel": "critico",
    "bloqueo": true,
    "evidencia": "Revisión de importabilidad por SKU",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "id": 4,
    "titulo": "Controles sectoriales",
    "falla": "No detectar que el SKU requiere autorización, certificación, visto bueno o registro",
    "consecuencia": "Rechazo del despacho, retención o imposibilidad de comercializar",
    "control": "Identificar autoridad competente y el momento exacto en que debe cumplirse el requisito",
    "responsable": "Iberia",
    "norma": "CNA, Anexo 14 + normativa sectorial correspondiente. Algunos productos requieren autorización de SAG, Salud, SEC u otros organismos",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "Matriz de requisitos y autoridad competente",
    "urls": [
      "https://www.aduana.cl/productos-que-requieren-autorizacion-o-visto-bueno/aduana/2018-12-13/161927.html"
    ]
  },
  {
    "id": 5,
    "titulo": "Momento del requisito sectorial",
    "falla": "Tener identificado el permiso, pero intentar obtenerlo demasiado tarde",
    "consecuencia": "La operación puede quedar detenida aunque el permiso eventualmente pueda conseguirse",
    "control": "Determinar si el requisito debe cumplirse antes del embarque, DIN, retiro o comercialización",
    "responsable": "Iberia / Agente",
    "norma": "Normativa sectorial específica. No basta con saber qué documento se necesita; importa cuándo debe existir",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "Requisito y fecha límite de cumplimiento",
    "urls": [
      "https://www.aduana.cl/productos-que-requieren-autorizacion-o-visto-bueno/aduana/2018-12-13/161927.html"
    ]
  },
  {
    "id": 6,
    "titulo": "Tratamiento arancelario",
    "falla": "Aplicar incorrectamente el arancel general o una preferencia TLC",
    "consecuencia": "Pago inferior al debido, reliquidación, intereses o mayor desembolso",
    "control": "Verificar país de origen, acuerdo aplicable, regla de origen y prueba documental",
    "responsable": "Iberia / Agente",
    "norma": "Ley 18.525 + acuerdo comercial aplicable. El 0% por TLC no se obtiene sólo porque el producto venga de un país con tratado",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "Prueba de origen y texto del acuerdo aplicable",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=237264",
      "https://www.subrei.gob.cl/acuerdos-comerciales/acuerdos-comerciales-vigentes"
    ]
  },
  {
    "id": 7,
    "titulo": "Medidas especiales",
    "falla": "Modelar sólo ad valorem e IVA cuando el producto está afecto a sobretasa, antidumping, compensatorio u otra medida",
    "consecuencia": "Costo real de importación subestimado y tributos incorrectos",
    "control": "Consultar medidas vigentes para partida + origen antes de cerrar el cálculo",
    "responsable": "Agente / Iberia",
    "norma": "Ley 18.525 y medidas oficiales vigentes. Algunos productos pueden tener gravámenes adicionales al arancel ordinario",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "Consulta de medidas por partida, origen y fecha",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=237264",
      "https://www.aduana.cl/arancel-aduanero-vigente/aduana/2016-12-30/090118.html"
    ]
  },
  {
    "id": 8,
    "titulo": "Cotización y compra",
    "falla": "Factura, cantidad, precio, Incoterm, flete, seguro o producto no coinciden con lo efectivamente contratado",
    "consecuencia": "Valoración y DIN confeccionados con antecedentes incorrectos",
    "control": "Conciliar OC/cotización, factura comercial, Incoterm, flete, seguro y documentación",
    "responsable": "Iberia / Proveedor",
    "norma": "CNA sobre documentos base y valoración aduanera. Los antecedentes comerciales deben reflejar la operación real",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "OC/cotización, factura, Incoterm, flete y seguro",
    "urls": [
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf",
      "https://www.bcn.cl/leychile/navegar?idNorma=199526"
    ]
  },
  {
    "id": 9,
    "titulo": "Umbral de despacho",
    "falla": "Aplicar la regla de US$1.000 FOB como si fuera universal",
    "consecuencia": "Utilizar procedimiento o actor incorrecto para despachar",
    "control": "Primero identificar modalidad: importación comercial general, courier u otra modalidad especial",
    "responsable": "Iberia / Agente",
    "norma": "Ordenanza/CNA. En el régimen general existe el umbral de US$1.000 FOB para intervención obligatoria de agente; existen regímenes especiales con reglas distintas",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "Modalidad de despacho y valor FOB facturado",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "id": 10,
    "titulo": "Agente y mandato",
    "falla": "Tramitar mediante agente sin representación válida o no contratarlo cuando legalmente corresponde",
    "consecuencia": "Imposibilidad o irregularidad en la tramitación",
    "control": "Verificar obligación de agente y otorgar mandato válido antes de tramitar",
    "responsable": "Iberia / Agente",
    "norma": "Ordenanza de Aduanas, arts. sobre despacho y mandato. El agente actúa por cuenta del importador y requiere representación válida",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "Mandato y encargo al agente",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.bcn.cl/leychile/navegar?idNorma=1166120"
    ]
  },
  {
    "id": 11,
    "titulo": "Documentación de despacho",
    "falla": "Factura, BL/AWB, origen, permisos u otros documentos no coinciden entre sí",
    "consecuencia": "DIN rechazada, observada o declaración incorrecta",
    "control": "Checklist documental y conciliación antes de transmitir",
    "responsable": "Agente / Iberia",
    "norma": "CNA, Capítulo III. La DIN se confecciona utilizando documentos base que deben respaldar efectivamente la operación",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "Checklist y documentos base conciliados",
    "urls": [
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "id": 12,
    "titulo": "Transporte y arribo",
    "falla": "Perder control del estado, documento de transporte o recepción de carga",
    "consecuencia": "Demoras, mayores costos y problemas para efectuar el despacho",
    "control": "Control de embarque, documento transporte, arribo y recepción en depósito",
    "responsable": "Iberia / Transportista / Agente",
    "norma": "Ordenanza + CNA. Al arribar, la mercancía queda sometida a potestad aduanera hasta su destinación y retiro conforme al procedimiento",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "Documento de transporte, arribo y recepción en depósito",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "id": 13,
    "titulo": "Plazo en depósito aduanero",
    "falla": "Dejar transcurrir el plazo sin completar oportunamente el desaduanamiento",
    "consecuencia": "Presunción de abandono, recargos y eventual riesgo de subasta",
    "control": "Alerta de vencimiento desde la fecha de recepción y escalamiento antes del plazo legal",
    "responsable": "Iberia / Agente",
    "norma": "Ordenanza de Aduanas, arts. 140 y 154 + reglamentación de depósito. La mercancía no puede permanecer indefinidamente sin ser desaduanada",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "Recepción en depósito, plazo aplicable y alerta de vencimiento",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919"
    ]
  },
  {
    "id": 14,
    "titulo": "Valor aduanero",
    "falla": "Declarar incorrectamente FOB, ajustes, flete, seguro o valor aduanero",
    "consecuencia": "Tributos incorrectos y posible reliquidación/sanción",
    "control": "Reconciliar factura + ajustes + transporte + seguro y antecedentes de valoración",
    "responsable": "Agente / Iberia",
    "norma": "Acuerdo de Valoración OMC + Ley 18.525 + CNA. Los tributos deben calcularse usando el valor aduanero determinado conforme a las reglas vigentes",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "Factura, ajustes, transporte, seguro y respaldo del valor",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=237264",
      "https://www.bcn.cl/leychile/navegar?idNorma=199526"
    ]
  },
  {
    "id": 15,
    "titulo": "Cálculo de gravámenes",
    "falla": "Aplicar tasa, preferencia, base imponible o impuestos incorrectamente",
    "consecuencia": "Diferencia tributaria, multas/intereses y error en flujo de caja",
    "control": "Motor de cálculo separado: valor aduanero → derechos → base IVA → IVA + otros gravámenes",
    "responsable": "Agente / Iberia",
    "norma": "DL 825, art. 16 + Ley 18.525. En la importación, la base del IVA incorpora el valor aduanero y los gravámenes aduaneros que correspondan",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "Liquidación detallada de derechos, base IVA y demás gravámenes",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369",
      "https://www.bcn.cl/leychile/navegar?idNorma=237264"
    ]
  },
  {
    "id": 16,
    "titulo": "Transmisión DIN",
    "falla": "Transmitir información incompleta o inconsistente",
    "consecuencia": "Rechazo a trámite y retraso de la operación",
    "control": "Validación previa de campos y documentos base",
    "responsable": "Agente",
    "norma": "Ordenanza de Aduanas, arts. 76 y siguientes. Aduanas verifica requisitos de la declaración antes de aceptarla a trámite",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "DIN transmitida y validación de campos",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "id": 17,
    "titulo": "DIN no aceptada",
    "falla": "Intentar seguir operando pese al rechazo",
    "consecuencia": "No existe declaración válidamente aceptada para continuar el despacho",
    "control": "NO → corregir causa y retransmitir; no avanzar hasta aceptación",
    "responsable": "Agente",
    "norma": "Ordenanza de Aduanas. Una declaración rechazada debe ser corregida antes de continuar",
    "estado": "🟢 VALIDADO",
    "nivel": "critico",
    "bloqueo": true,
    "evidencia": "Rechazo, corrección y nueva aceptación",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "id": 18,
    "titulo": "DIN ya aceptada",
    "falla": "Tratar una DIN aceptada como si pudiera editarse libremente",
    "consecuencia": "Rectificación improcedente o nueva contingencia aduanera",
    "control": "Separar rechazo previo de modificación posterior a aceptación/legalización",
    "responsable": "Agente",
    "norma": "Ordenanza de Aduanas, arts. 83 y 92. Después de la aceptación existen procedimientos específicos; no se cambia la declaración simplemente “editándola”",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "Solicitud y resolución de modificación según procedimiento",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "id": 19,
    "titulo": "Revisión / aforo / examen",
    "falla": "Retirar mercancía sin cumplir revisión documental, examen físico o aforo dispuesto por Aduanas",
    "consecuencia": "Retención, diferencias detectadas, denuncia o regularización",
    "control": "Gate: ¿existe revisión/aforo/examen/observación pendiente?",
    "responsable": "Aduanas / Agente / Iberia",
    "norma": "Ordenanza + CNA. Si Aduanas dispone controles, deben quedar cumplidos antes de completar el despacho",
    "estado": "🟢 VALIDADO",
    "nivel": "critico",
    "bloqueo": true,
    "evidencia": "Resultado de revisión, aforo o examen y observaciones resueltas",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "id": 20,
    "titulo": "Legalización",
    "falla": "Dar por terminado el despacho sin que la declaración esté legalizada",
    "consecuencia": "Operación aduanera aún no concluida correctamente",
    "control": "Confirmar estado de legalización antes de retiro",
    "responsable": "Agente / Aduanas",
    "norma": "Ordenanza de Aduanas, art. 92. Legalizar significa que Aduanas aprueba formalmente la declaración una vez cumplidos los trámites",
    "estado": "🟢 VALIDADO",
    "nivel": "critico",
    "bloqueo": true,
    "evidencia": "Estado de legalización",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "id": 21,
    "titulo": "Pago de gravámenes",
    "falla": "Pagar monto incorrecto o intentar retirar sin pago cuando el régimen exige pago previo",
    "consecuencia": "Mercancía no liberada, diferencias e intereses",
    "control": "Confirmar liquidación y comprobante de pago antes del retiro",
    "responsable": "Iberia / Agente",
    "norma": "Ordenanza de Aduanas. En el régimen general los derechos, IVA y demás cargos deben encontrarse cumplidos antes del retiro",
    "estado": "🟢 VALIDADO",
    "nivel": "critico",
    "bloqueo": true,
    "evidencia": "Liquidación y comprobante de pago",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "id": 22,
    "titulo": "Retiro de mercancía",
    "falla": "Retirar sin que estén cumplidos todos los requisitos aduaneros",
    "consecuencia": "Salida irregular desde zona primaria o depósito",
    "control": "Liberación documental + pago + controles aduaneros cumplidos",
    "responsable": "Agente / Transportista / Iberia",
    "norma": "Ordenanza + CNA. El retiro debe producirse sólo después de que Aduanas habilite legalmente la salida",
    "estado": "🟢 VALIDADO",
    "nivel": "critico",
    "bloqueo": true,
    "evidencia": "Liberación, controles y pagos exigibles acreditados",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "id": 23,
    "titulo": "Habilitación para comercializar",
    "falla": "Confundir “mercancía desaduanada” con “producto automáticamente vendible”",
    "consecuencia": "Multa sectorial, retiro del mercado o prohibición de venta",
    "control": "Gate: ¿queda algún requisito sectorial previo a comercialización?",
    "responsable": "Iberia",
    "norma": "Normativa sectorial del producto. Desaduanar no reemplaza certificaciones o exigencias necesarias para vender ciertos SKU",
    "estado": "🟢 VALIDADO",
    "nivel": "critico",
    "bloqueo": true,
    "evidencia": "Certificación o autorización aplicable a venta",
    "urls": [
      "https://www.aduana.cl/productos-que-requieren-autorizacion-o-visto-bueno/aduana/2018-12-13/161927.html",
      "https://www.sec.cl/sistema-de-certificacion-de-productos-sec/"
    ]
  },
  {
    "id": 24,
    "titulo": "Inventario y trazabilidad",
    "falla": "Perder vínculo entre DIN, recepción, costo, lote y SKU",
    "consecuencia": "Dificultad para defender costo, origen, CF o movimientos posteriores",
    "control": "DIN → recepción → lote/SKU → cantidad → costo → ubicación",
    "responsable": "Iberia / Contabilidad",
    "norma": "Control interno respaldado por obligaciones documentales tributarias/aduaneras. La trazabilidad debe permitir reconstruir la operación",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "DIN, recepción, lote/SKU, cantidad, costo y ubicación",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf",
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ]
  },
  {
    "id": 25,
    "titulo": "Crédito fiscal IVA",
    "falla": "Usar como CF un IVA que no cumple los requisitos legales o registrarlo incorrectamente",
    "consecuencia": "Diferencia F29, intereses, reajustes o sanción tributaria",
    "control": "Conciliar DIN, IVA pagado, derecho a crédito, documentación y período",
    "responsable": "Contabilidad / Iberia",
    "norma": "DL 825, arts. 23 y 25. El IVA de importación puede constituir crédito fiscal cuando corresponde y existe respaldo válido",
    "estado": "🟢 VALIDADO",
    "nivel": "critico",
    "bloqueo": true,
    "evidencia": "DIN, IVA pagado, derecho a CF y período",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ]
  },
  {
    "id": 26,
    "titulo": "Venta y F29",
    "falla": "No emitir correctamente documentos tributarios o determinar mal IVA débito/crédito",
    "consecuencia": "Diferencias de IVA y contingencia tributaria",
    "control": "Conciliación mensual ventas + IVA débito + CF importaciones + demás operaciones",
    "responsable": "Contabilidad / Iberia",
    "norma": "DL 825 y normativa SII. El IVA mensual se determina considerando los débitos y créditos fiscales que legalmente correspondan",
    "estado": "🟢 VALIDADO",
    "nivel": "atencion",
    "bloqueo": false,
    "evidencia": "DTE de ventas y conciliación mensual F29",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ]
  }
];
const filtrosRiesgoC = [
  {
    "titulo": "Importación vía courier / empresa de entrega rápida",
    "falla": "Aplicar erróneamente el límite o procedimiento del régimen general",
    "control": "¿Esta operación realmente corresponde a courier y cumple los límites/requisitos de ese régimen?",
    "norma": "Ordenanza de Aduanas + reglamentación de empresas de entrega rápida",
    "estado": "🟡 CONDICIONAL",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "titulo": "Mercancía sujeta a SEC",
    "falla": "Importar o comercializar un producto eléctrico sin certificación/autorización exigida",
    "control": "¿Este SKU está sometido a certificación SEC y en qué momento debe estar aprobada?",
    "norma": "Ley 18.410 + reglamentos/protocolos SEC vigentes según producto",
    "estado": "🟡 POR SKU",
    "urls": [
      "https://www.sec.cl/sistema-de-certificacion-de-productos-sec/"
    ]
  },
  {
    "titulo": "Mercancía sujeta a SAG",
    "falla": "Ingresar mercancía vegetal, animal o relacionada sin autorización",
    "control": "¿Este producto está sujeto a control SAG antes del ingreso o retiro?",
    "norma": "Ley 18.755 + normativa SAG + CNA Anexo 14",
    "estado": "🟡 POR SKU",
    "urls": [
      "https://www.sag.gob.cl/ambitos-de-accion/importaciones-y-transito",
      "https://www.aduana.cl/productos-que-requieren-autorizacion-o-visto-bueno/aduana/2018-12-13/161927.html"
    ]
  },
  {
    "titulo": "Mercancía sujeta a autoridad sanitaria",
    "falla": "Importar/comercializar producto sujeto a autorización sanitaria sin cumplirla",
    "control": "¿Este SKU requiere resolución, registro, autorización o visto bueno sanitario?",
    "norma": "Código Sanitario + reglamentación específica + CNA Anexo 14",
    "estado": "🟡 POR SKU",
    "urls": [
      "https://www.aduana.cl/productos-que-requieren-autorizacion-o-visto-bueno/aduana/2018-12-13/161927.html",
      "https://www.bcn.cl/leychile/navegar?idNorma=5595"
    ]
  },
  {
    "titulo": "Producto prioritario REP",
    "falla": "Iberia podría adquirir obligaciones como productor/importador regulado",
    "control": "¿Por importar este producto Iberia adquiere calidad de productor bajo REP?",
    "norma": "Ley 20.920 + decretos de metas del producto prioritario correspondiente",
    "estado": "🟡 POR SKU",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=1090894"
    ]
  },
  {
    "titulo": "Preferencia arancelaria TLC",
    "falla": "Aplicar 0% sin acreditar origen preferencial",
    "control": "¿Existe acuerdo aplicable y prueba de origen válida para esta mercancía?",
    "norma": "Acuerdo comercial específico + instrucciones Aduanas",
    "estado": "🟡 CONDICIONAL",
    "urls": [
      "https://www.subrei.gob.cl/acuerdos-comerciales/acuerdos-comerciales-vigentes"
    ]
  },
  {
    "titulo": "Antidumping / compensatorio / salvaguardia / sobretasa",
    "falla": "Presupuestar sólo ad valorem e IVA cuando existe una medida adicional vigente",
    "control": "¿Partida + origen están sujetos actualmente a una medida de defensa comercial?",
    "norma": "Ley 18.525 + decreto/resolución específica vigente",
    "estado": "🟡 POR PARTIDA/ORIGEN",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=237264",
      "https://www.aduana.cl/arancel-aduanero-vigente/aduana/2016-12-30/090118.html"
    ]
  },
  {
    "titulo": "Impuesto adicional o específico",
    "falla": "Subestimar tributos de importación",
    "control": "¿El producto paga algún impuesto adicional además de IVA y derechos aduaneros?",
    "norma": "DL 825 + legislación especial correspondiente",
    "estado": "🟡 POR SKU",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=6369"
    ]
  },
  {
    "titulo": "Mercancía peligrosa",
    "falla": "Incumplir requisitos de transporte, almacenamiento o manipulación",
    "control": "¿El producto está clasificado como mercancía/sustancia peligrosa?",
    "norma": "DS 298 y demás normativa aplicable según producto/transporte",
    "estado": "🟡 POR SKU",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=12087",
      "https://www.bcn.cl/leychile/navegar?idNorma=1088802"
    ]
  },
  {
    "titulo": "Mercancía usada",
    "falla": "Encontrarse con una prohibición, recargo o condición especial",
    "control": "¿La legislación permite importar este producto usado bajo estas condiciones?",
    "norma": "Ordenanza, Arancel Aduanero y normativa específica del bien",
    "estado": "🟡 POR SKU",
    "urls": [
      "https://www.aduana.cl/arancel-aduanero-vigente/aduana/2016-12-30/090118.html",
      "https://www.bcn.cl/leychile/navegar?idNorma=238919"
    ]
  },
  {
    "titulo": "Tramitación anticipada",
    "falla": "Suponer que la DIN sólo puede tramitarse después del arribo",
    "control": "¿Conviene y está permitido presentar la destinación antes de la llegada?",
    "norma": "Ordenanza de Aduanas, art. 80 + CNA",
    "estado": "🟢 SUBCASO",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "titulo": "Modalidad especial de pago/retiro",
    "falla": "Asumir que Iberia puede retirar antes de pagar gravámenes",
    "control": "¿Iberia está efectivamente autorizada y cumple las garantías/requisitos de una modalidad especial?",
    "norma": "Ordenanza de Aduanas + normativa específica del beneficio",
    "estado": "🟡 CONDICIONAL",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "titulo": "Almacén particular u otro régimen suspensivo",
    "falla": "Confundir una modalidad suspensiva con una importación definitiva normal",
    "control": "¿La operación está autorizada bajo un régimen suspensivo específico?",
    "norma": "Ordenanza de Aduanas + CNA",
    "estado": "🟡 CONDICIONAL",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=238919",
      "https://www.aduana.cl/aduana/site/docs/20070227/20070227210427/asocfile120050803143905.pdf"
    ]
  },
  {
    "titulo": "Producto sujeto a rotulación técnica o advertencias",
    "falla": "Desaduanar correctamente pero vender incumpliendo reglas del producto",
    "control": "¿Existe rotulación obligatoria antes de ponerlo a disposición del consumidor?",
    "norma": "Norma sectorial específica",
    "estado": "🟡 POR SKU",
    "urls": [
      "https://www.aduana.cl/productos-que-requieren-autorizacion-o-visto-bueno/aduana/2018-12-13/161927.html"
    ]
  },
  {
    "titulo": "Origen o proveedor genera duda razonable sobre valor",
    "falla": "Aduanas cuestiona el valor declarado",
    "control": "¿Existe documentación suficiente para demostrar que el valor declarado corresponde a la operación?",
    "norma": "Acuerdo de Valoración OMC + Ley 18.525 + CNA",
    "estado": "🟡 CONDICIONAL",
    "urls": [
      "https://www.bcn.cl/leychile/navegar?idNorma=199526",
      "https://www.bcn.cl/leychile/navegar?idNorma=237264"
    ]
  }
];
// Réutilise la même UI de risques, sans copier les règles de CF des achats nationaux.
function cControl(id,row,ids=[],extra={}){
 const base=nodosC.find(n=>n.id==='c-'+id)||{id:'c-'+id,titulo:id,nota:'',norma:'',url:''};
 return {...base,row,col:2,riesgos:ids,matriz:riesgosC,...extra};
}
const flujoRiesgoC=[
 cControl('inicio',1),cControl('producto',2,[1]),cControl('clasificar',3,[2]),
 cControl('importable',4,[3]),cControl('no-importar',4,[3],{col:1}),
 cControl('controles',5,[4,5],{filtrosC:true}),cControl('tratamiento',6,[6,7],{filtrosC:true}),
 cControl('compra',7,[8]),
 cControl('caja',7,[],{col:3,tipo:'event',titulo:'PAGO AL PROVEEDOR EXTRANJERO',etiqueta:'CAJA · MOMENTO VARIABLE',aclaracion:'Anticipo · contado · a plazo',nota:'Según condiciones comerciales. Separar pago al proveedor de pago de gravámenes de importación. El desembolso al proveedor no genera por sí solo crédito fiscal chileno.'}),
 cControl('fob',8,[9],{titulo:'RÉGIMEN GENERAL: ¿FOB SUPERA US$1.000?',filtrosC:true,nota:'Antes de aplicar el umbral, confirmar que se trata de importación comercial general. Courier y otras modalidades especiales tienen reglas propias: activar el filtro correspondiente.'}),
 cControl('simplificado',9,[9],{col:1}),cControl('agente',9,[10],{col:3}),
 cControl('documentos',10,[11]),cControl('transporte',11,[12,13],{filtrosC:true,aclaracion:'Controlar recepción y vencimiento en depósito'}),
 cControl('din',12,[14,15,16],{filtrosC:true}),cControl('aceptada',13,[17,18]),
 cControl('corregir',13,[17],{col:3}),
 cControl('observaciones',14,[19],{titulo:'¿REVISIÓN, AFORO U OBSERVACIONES PENDIENTES?',nota:'Si Aduanas dispone un control documental o físico, cumplirlo antes del retiro. La mera aceptación de la DIN no acredita que toda revisión haya concluido.'}),
 cControl('resolver',14,[18,19],{col:3}),
 cControl('legalizacion',15,[20],{titulo:'CONFIRMAR LEGALIZACIÓN',nota:'Verificar el estado de legalización. Este hito es distinto de la aceptación a trámite, del pago y de la autorización de retiro.',norma:'Ordenanza de Aduanas · art. 92.'}),
 cControl('pago',16,[21],{titulo:'PAGAR GRAVÁMENES EXIGIBLES',aclaracion:'Liquidación y comprobante de pago',nota:'Caso base de importación general: acreditar el pago exigible antes del retiro. Las modalidades especiales requieren autorización y cumplimiento de sus requisitos.',norma:'Ordenanza de Aduanas · arts. 89 y 99–105, según corresponda.',url:fuentesC.ordenanza,filtrosC:true}),
 cControl('retiro',17,[22],{titulo:'RETIRAR MERCANCÍA HABILITADA',nota:'Comprobar liberación documental, legalización, controles y pagos exigibles. Si falta alguno, no retirar hasta resolverlo.',norma:'Ordenanza de Aduanas · arts. 94–95; CNA, Capítulo III.',url:fuentesC.ordenanza}),
 cControl('inventario',18,[24],{titulo:'RECEPCIÓN E INVENTARIO CON TRAZABILIDAD',aclaracion:'DIN → recepción → lote/SKU → cantidad → costo → ubicación',nota:'Registrar la recepción física y sus diferencias. Los productos con requisitos comerciales pendientes deben quedar identificados como no comercializables; el inventario no depende de haber presentado el F29.',norma:'Control interno de trazabilidad apoyado en los documentos de importación y registros tributarios.'}),
 cControl('habilitado',19,[23],{filtrosC:true}),cControl('pendiente',19,[23],{col:3,titulo:'NO VENDER · VALIDAR REQUISITO',nota:'Determinar si el requisito es subsanable y actuar según la autoridad competente. No asumir que todo incumplimiento puede regularizarse después.',filtrosC:true}),
 cControl('cf',20,[25],{titulo:'VALIDAR CRÉDITO FISCAL DE IMPORTACIÓN',nota:'Conciliar DIN, IVA pagado en la importación, destino de los bienes con derecho a crédito, documentación y período. La regla de acuse o reclamo del DTE de una compra nacional no se traslada automáticamente a la factura comercial extranjera.',norma:'DL 825 · arts. 23 y 25.',url:fuentesC.iva,fuente:'Consultar DL 825'}),
 cControl('venta',21,[26],{titulo:'VENTA Y F29 DEL PERÍODO',nota:'Emitir los documentos tributarios que correspondan y conciliar débito de ventas, CF de importaciones y demás operaciones del período. No significa que importación, crédito y venta deban ocurrir en el mismo mes.',norma:'DL 825 · arts. 20, 23, 52–55 y 64.',url:fuentesC.iva,fuente:'Consultar DL 825'}),
 cControl('fin',22)
];
const conexionesRiesgoC=[];
function ec(a,b,label='',route='down',event=false){conexionesRiesgoC.push({from:'c-'+a,to:'c-'+b,label,route,event});}
const seqC=['inicio','producto','clasificar','importable','controles','tratamiento','compra','fob'];
seqC.slice(1).forEach((n,i)=>ec(seqC[i],n,seqC[i]==='importable'?'SÍ':''));
ec('importable','no-importar','NO','across');ec('compra','caja','','across',true);
ec('fob','simplificado','NO','a-branch');ec('fob','agente','SÍ','a-branch');
ec('simplificado','documentos','','a-branch');ec('agente','documentos','','a-branch');
const tailC=['documentos','transporte','din','aceptada','observaciones','legalizacion','pago','retiro','inventario','habilitado','cf','venta','fin'];
tailC.slice(1).forEach((n,i)=>ec(tailC[i],n,tailC[i]==='observaciones'?'NO':['aceptada','habilitado'].includes(tailC[i])?'SÍ':''));
ec('aceptada','corregir','NO','across');ec('corregir','aceptada','Retransmitir','loop');
ec('observaciones','resolver','SÍ','across');ec('resolver','legalizacion','Resuelto','to-left');
ec('habilitado','pendiente','NO','across');ec('pendiente','habilitado','Si se subsana','loop');
function renderCTools(){
 const tools=element('section','risk-tools');tools.id='risk-tools';tools.append(element('p','','Ruta C · 26 riesgos · 15 filtros condicionales'));
 const bar=element('div','risk-tool-actions');
 const add=(label,fn)=>{const b=element('button','',label);b.type='button';b.onclick=fn;bar.append(b);};
 add('Ver matriz completa',()=>openRiskPanel('MATRIZ DE RIESGOS · RUTA C',c=>{
  c.append(element('p','','“Validado” corresponde al estado de revisión aportado en la matriz. No acredita cumplimiento de una importación real. La prioridad visual y la evidencia sugerida organizan los controles internos.'));
  const q=element('input','risk-search');q.type='search';q.placeholder='Buscar etapa, riesgo o responsable';q.setAttribute('aria-label','Buscar en matriz Ruta C');c.append(q);const list=element('div');c.append(list);
  const update=()=>{list.replaceChildren();appendRiskCards(list,riesgosC.filter(r=>JSON.stringify(r).toLowerCase().includes(q.value.toLowerCase())).map(r=>r.id),riesgosC);if(!list.children.length)list.append(element('p','','Sin coincidencias.'));};q.oninput=update;update();
 }));
 add('Filtros condicionales',()=>openRiskPanel('FILTROS CONDICIONALES · RUTA C',c=>appendFilterCards(c,filtrosRiesgoC)));
 add('Trazabilidad',()=>openRiskPanel('EXPEDIENTE DE IMPORTACIÓN',c=>{
  c.append(element('p','','Ficha SKU → clasificación → proveedor/origen → compra → factura comercial → transporte → permisos aplicables → valoración → DIN y sus modificaciones → liquidación/pago → controles y retiro → recepción → lote/costo/ubicación → CF → venta/F29.'));
  c.append(element('p','','Registrar por separado fechas de arribo, recepción en depósito, aceptación DIN, legalización, pago, retiro, recepción Iberia y período tributario. El vencimiento en depósito depende del régimen aplicable.'));
 }));
 add('Modo auditoría',()=>{const on=diagram.classList.toggle('audit-mode');bar.lastChild.textContent=on?'Modo flujo':'Modo auditoría';scheduleConnections();});
 tools.append(bar,element('p','risk-help','Pulsa una etapa para abrir sus riesgos, controles y fuentes. Los filtros sólo se activan por SKU, origen o modalidad.'));diagram.before(tools);
 document.querySelector('#route-context').textContent='Importación directa al régimen general. Confirmar modalidad antes de aplicar el umbral FOB. La DIN anticipada es posible cuando procede; pago al proveedor, gravámenes, CF y venta tienen fechas propias.';
}

// Ajustes consolidados solicitados por la usuaria, 11-09-2026.
// Conserva IDs y matrices para mantener enlaces, búsqueda y paneles.
function actualizar(lista,id,campos){
 const item=lista.find(n=>n.id===id);
 if(!item)throw new Error(`No existe ${id}`);
 Object.assign(item,campos);
}
const a=(id,campos)=>actualizar(nodosA,'a-'+id,campos);
a('documenta',{titulo:'¿SE EMITE FACTURA AL MOMENTO DE LA ENTREGA?',nota:'Regla de entrega real o simbólica: factura al entregar; si se posterga conforme al art. 55, emitir GDD y facturar posteriormente referenciando la(s) GDD. Si ya existe factura anticipada, verificarla y no duplicarla. La factura posterior no impide trasladar con una GDD válida.',norma:'DL 825 · art. 55.',url:fuenteIVA});
a('guia',{titulo:'GDD · GUÍA DE DESPACHO',aclaracion:'GDD → factura posterior referenciando la(s) GDD',nota:'La GDD ampara la entrega/traslado. Mantener pendiente de facturación y conciliar la factura posterior con todas las GDD correspondientes. El art. 55 permite postergar hasta el décimo día posterior al término del período, conservando la fecha del período de la operación; no significa esperar esa factura para trasladar con GDD válida.'});
enlacesA.find(e=>e.from==='a-documenta'&&e.to==='a-factura').label='SÍ';
enlacesA.find(e=>e.from==='a-documenta'&&e.to==='a-guia').label='NO';
a('valido',{titulo:'¿EL DTE ES VÁLIDO ANTE EL SII Y COINCIDE CON LA OPERACIÓN REAL?',nota:'Verificar proveedor/RUT emisor, receptor Iberia, folio, fecha, productos, cantidades, neto, IVA, total y referencias a GDD cuando corresponda al documento. Validar el estado ante SII. El control se aplica al documento exigible en esta etapa; no exige factura definitiva si el traslado se respalda válidamente con GDD.'});
a('corregir-doc',{titulo:'GESTIONAR CORRECCIÓN · NO CERRAR',aclaracion:'Gestionar con el emisor y revalidar',nota:'Iberia no modifica la factura del proveedor. Gestionar NC, ND, anulación/reemisión u otro mecanismo aplicable y conservar la trazabilidad de la regularización.'});
a('reclamo',{titulo:'RECLAMAR / REGULARIZAR SEGÚN CORRESPONDA',aclaracion:'Si la factura electrónica está reclamada: no utilizar su CF',nota:'Distinguir una diferencia con GDD de un reclamo de factura electrónica. Verificar el documento y gestionar la regularización aplicable. Si existe factura electrónica, controlar el plazo de reclamo desde su recepción por SII. Mientras esté reclamada, no utilizar su CF. No presumir reclamo si sólo existe GDD o se regulariza por otra vía.'});
a('acuse',{titulo:'ACEPTACIÓN / RECLAMO Y ACUSE DE RECIBO, SEGÚN CORRESPONDA',etiqueta:'CONTROL TRIBUTARIO · CALENDARIO PROPIO'});
a('interno',{aclaracion:'Emitir GDD por traslado interno cuando exista traslado físico que deba documentarse.'});
a('devolucion',{aclaracion:'GDD de devolución → NC del proveedor cuando corresponda → ajuste CF de Iberia',nota:'Respaldar el movimiento físico y gestionar la regularización del proveedor con NC cuando corresponda. Iberia ajusta su CF según el documento y período aplicable.',norma:'DL 825 · arts. 24 y 55.',url:fuenteIVA});
a('rcv',{titulo:'REVISAR / CLASIFICAR EN RCV',nota:'Revisar la información incorporada al Registro de Compras y Ventas y corregir su clasificación cuando corresponda. Conciliar NC/ND y ajustes; este nodo no representa crear manualmente el registro.'});
actualizar(riesgosA,9,{falla:'El traslado se inicia con factura/GDD aún no recibida por el SII o rechazada.',consecuencia:'El traslado queda sin DTE válido que lo ampare, con contingencia ante fiscalización.'});
actualizar(riesgosA,5,{control:'Revisar proveedor/RUT, receptor Iberia, folio, fecha, productos, cantidades, neto, IVA, total y referencias a GDD cuando corresponda.'});
actualizar(riesgosA,28,{control:'GDD de devolución → proveedor regulariza con NC cuando corresponda → Iberia ajusta CF.'});

// C: filtros asociados a la etapa; la matriz completa continúa disponible arriba.
const c=(id,campos)=>actualizar(flujoRiesgoC,'c-'+id,campos);
const rc=(id,campos)=>actualizar(riesgosC,id,campos);
c('producto',{norma:'Arancel Aduanero Nacional vigente, contenido en el Decreto Exento N.º 473/2021 y sus modificaciones posteriores.',nota:'La mercancía debe identificarse con antecedentes suficientes para describirla y clasificarla correctamente conforme al Arancel Aduanero Nacional.',url:'https://www.bcn.cl/leychile/navegar?i=1169544',fuente:'Consultar Decreto Exento 473/2021',referencias:[{norma:'Arancel Aduanero Nacional vigente y modificaciones.',url:fuentesC.arancel}]});
rc(1,{norma:'Arancel Aduanero Nacional vigente, Decreto Exento N.º 473/2021 y sus modificaciones posteriores.',urls:['https://www.bcn.cl/leychile/navegar?i=1169544',fuentesC.arancel]});
rc(2,{control:'Validar clasificación con antecedentes técnicos, Reglas Generales, notas legales y Arancel vigente. Si subsiste duda material, consultar al Agente de Aduanas y evaluar resolución anticipada.'});
c('clasificar',{nota:riesgosC.find(r=>r.id===2).control});
c('importable',{titulo:'¿LA IMPORTACIÓN ESTÁ LEGALMENTE PERMITIDA?',nota:'NO conduce a NO IMPORTAR únicamente ante una prohibición legal aplicable. Un producto regulado puede continuar a la identificación y cumplimiento de permisos y requisitos; regulado no significa prohibido.'});
rc(3,{falla:'Intentar importar mercancía legalmente prohibida o confundir regulación con prohibición.',control:'Identificar prohibiciones reales. Para mercancía regulada permitida, continuar a controles sectoriales y cumplir sus requisitos.',consecuencia:'Una prohibición impide importar. Una mercancía regulada exige los permisos aplicables; no implica por sí sola prohibición.'});
c('tratamiento',{nota:'Para una preferencia: ítem arancelario + origen preferencial + acuerdo vigente + regla de origen + preferencia aplicable + prueba/certificación exigida. Revisar además antidumping, compensatorios, salvaguardias y sobretasas vigentes según producto y origen.'});
rc(6,{control:flujoRiesgoC.find(n=>n.id==='c-tratamiento').nota});
rc(8,{control:'Conciliar OC/cotización, factura comercial, precio, moneda, Incoterm, flete, seguro y documentación. Separar pago al proveedor de gravámenes chilenos.'});
c('fob',{nota:'Umbral del régimen general. Confirmar modalidad antes de aplicarlo: courier y otros regímenes tienen reglas propias. No fraccionar artificialmente una operación para quedar bajo el límite.'});
rc(9,{control:flujoRiesgoC.find(n=>n.id==='c-fob').nota});
c('simplificado',{titulo:'EVALUAR DESPACHO ESPECIAL / SIMPLIFICADO, CUANDO CORRESPONDA'});
rc(11,{control:'Factura comercial + documento de transporte + packing list si existe + seguro + origen + permisos + mandato cuando corresponda. Conciliar documentos antes de transmitir.'});
c('documentos',{nota:riesgosC.find(r=>r.id===11).control});
c('transporte',{aclaracion:'Arribo ≠ nacionalización · controlar plazo de depósito'});
rc(13,{consecuencia:'Demoras, almacenaje/recargos y eventual presunción de abandono según el régimen y plazo aplicable.'});
c('din',{nota:'El agente, o Iberia en el procedimiento permitido, valida documentos, determina valor aduanero y tributos, confecciona y transmite la Declaración de Ingreso (DIN), en la modalidad de importación que corresponda. Puede existir tramitación anticipada cuando procede; la ubicación gráfica no fija obligatoriamente la transmisión después del arribo.'});
for(const id of ['observaciones','resolver'])c(id,{norma:'Ordenanza de Aduanas · arts. 84, 85 y 88. Art. 185 sólo si existe contravención.',url:fuentesC.ordenanza,fuente:'Consultar Ordenanza de Aduanas'});
rc(19,{norma:'Ordenanza de Aduanas · arts. 84, 85 y 88; art. 185 sólo si existe contravención. Una observación no implica automáticamente infracción.'});
rc(21,{consecuencia:'No se autoriza el retiro; si además existe mora, pueden generarse reajustes/intereses.'});
c('pago',{fuente:'Consultar Ordenanza de Aduanas'});
c('retiro',{norma:'Ordenanza de Aduanas · arts. 94, 104 y 105; CNA, Capítulo III.',fuente:'Consultar Ordenanza de Aduanas'});
rc(22,{norma:'Ordenanza de Aduanas · arts. 94, 104 y 105. Declaración tramitada, controles y pagos exigibles habilitan el retiro, con las excepciones legales aplicables.'});
c('inventario',{aclaracion:'Origen/proveedor · DIN · fecha recepción · lote/SKU · cantidad · costo · ubicación',nota:'Registrar recepción y diferencias con trazabilidad. Identificar como no comercializable sólo cuando exista un requisito pendiente que efectivamente condicione la venta. El registro de inventario no espera al F29.'});
rc(24,{control:flujoRiesgoC.find(n=>n.id==='c-inventario').aclaracion});
for(const id of ['habilitado','pendiente'])c(id,{nota:'Comprobar si existe un requisito que sea condición efectiva para vender el SKU. Si falta, no vender y gestionar según autoridad competente. REP puede imponer obligaciones paralelas; no equivale automáticamente a prohibición de venta.'});
rc(23,{control:'Bloquear venta sólo si falta un requisito que efectivamente la condicione. Evaluar obligaciones REP según supuesto y decreto aplicable; no tratarlas como prohibición automática de venta.'});
const gruposC={controles:[1,2,3,4,8,13],tratamiento:[5,6,7],fob:[0],transporte:[10,12],din:[10,14,7],pago:[11],habilitado:[1,2,3,4,8,13],pendiente:[1,2,3,4,8,13],importable:[9]};
for(const n of flujoRiesgoC){n.filtrosC=false;if(gruposC[n.id.slice(2)])n.filtrosSeleccionados=gruposC[n.id.slice(2)].map(i=>filtrosRiesgoC[i]);}
// Dos carriles después de inventario, sin condicionar el CF a SEC ni a la venta.
c('habilitado',{row:19,col:1});c('pendiente',{row:20,col:2});
c('cf',{row:19,col:3,etiqueta:'CONTROL TRIBUTARIO · CALENDARIO PROPIO'});
c('venta',{row:21,col:1,titulo:'VENTA / DOCUMENTACIÓN TRIBUTARIA',nota:'Emitir el documento tributario de la venta y conservar su período. La venta no genera el crédito fiscal de importación ni necesita ocurrir en el mismo mes.',norma:'DL 825 · arts. 20 y 52–55.'});
flujoRiesgoC.push(cControl('f29',21,[26],{col:3,titulo:'F29 DEL PERÍODO',nota:'Consolidar el CF de importaciones, IVA débito de ventas y demás operaciones del período. Importación, crédito fiscal, habilitación comercial y venta pueden ocurrir en meses distintos.',norma:'DL 825 · arts. 23, 25 y 64.',url:fuentesC.iva,fuente:'Consultar DL 825',tipo:'tax'}));
c('fin',{row:22,col:2});
for(let i=conexionesRiesgoC.length-1;i>=0;i--)if(['c-inventario','c-habilitado','c-cf','c-venta','c-pendiente'].includes(conexionesRiesgoC[i].from))conexionesRiesgoC.splice(i,1);
ec('inventario','habilitado','Control comercial','a-branch');ec('inventario','cf','Control tributario','a-branch',true);
ec('habilitado','venta','SÍ');ec('habilitado','pendiente','NO','a-branch');ec('pendiente','habilitado','Si se subsana','loop');
ec('cf','f29');ec('venta','fin','','a-branch');ec('f29','fin','Cierre del período','a-branch',true);

// B/B2: puerta común; separación jurídica hasta que cada salida esté habilitada.
const b=(id,campos)=>actualizar(flujoRiesgoB,'br-'+id,campos);
b('mercancia',{riesgos:[],aclaracion:'Vendedor usuario ZOFRI · verificar estatus documental',norma:'DFL 2/2001 · arts. 9, 10 bis y 21.',url:zfB,fuente:'Consultar DFL 2/2001'});
b('regimen',{titulo:'¿ESTATUS DE LA MERCADERÍA?',riesgos:[],col:'3 / 5',nota:'Separar mercancía extranjera bajo régimen ZF de mercancía nacional/nacionalizada del art. 10 bis. En caso de duda, no avanzar y verificar antecedentes de ingreso y régimen.',norma:'DFL 2/2001 · arts. 10 bis y 21; Ley 18.211 · art. 11.',url:zfB,fuente:'Consultar DFL 2/2001'});
b('reclasificar',{titulo:'NO AVANZAR · VERIFICAR RÉGIMEN',col:1,riesgos:[]});
b('admisible',{etiqueta:'B · EXTRANJERA BAJO RÉGIMEN ZF'});
b('documento',{titulo:'DOCUMENTO DE SALIDA APLICABLE · MERCANCÍA EXTRANJERA',nota:'Validar documento, campos y procedimiento vigente para la salida de mercancía extranjera a ZFE. Mantener separados CIF e impuesto art. 11. La Res. 1844/2026 modifica el Manual: confirmar implementación aplicable al usuario.',norma:'DFL 2/2001 · art. 9; Manual de Zona Franca y modificaciones.',url:'https://www.bcn.cl/leychile/navegar?idNorma=1227294',fuente:'Consultar modificación oficial del Manual'});
// Matriz B2 acotada a los controles expresamente pedidos, con prioridad propuesta.
const datosB2=[
 [17,'Estatus nacional/nacionalizada','Aplicar CIF y Art. 11 de mercancía extranjera a una operación art. 10 bis.','Tratamiento documental y tributario incorrecto.','Verificar el estatus documental antes de aplicar B2. No usar Art. 11 para esta rama.'],
 [18,'Requisitos de adquisición art. 10 bis','Comprar sin acreditar requisitos del comprador o del monto de la operación.','La operación no cumple las condiciones de adquisición del régimen.','Verificar Iberia comerciante, compra para reventa, monto superior a 95 UTM como regla general y acreditación SII correspondiente. Documentar una excepción sólo si efectivamente aplica.'],
 [19,'Documento y control aduanero B2','Usar la declaración o campos de mercancía extranjera para nacional/nacionalizada.','Observaciones, retraso o salida sin respaldo adecuado.','Confirmar documento de salida aplicable a mercancía nacional/nacionalizada, antecedentes y procedimiento vigente; completar control aduanero propio.'],
 [20,'Salida / reingreso B2','Retirar sin que el trámite de esta rama permita materializar la salida.','Salida irregular y pérdida de trazabilidad del régimen.','Comprobar habilitación documental y aduanera del reingreso/salida antes de unirse al traslado común.']
];
for(const [id,titulo,falla,consecuencia,control] of datosB2)riesgosB.push({id,titulo,falla,consecuencia,control,responsable:'Compras / Contabilidad + usuario ZOFRI y tramitante, según actuación',evidencia:'Antecedentes de estatus, acreditación, compra y documento/estado aduanero correspondiente',norma:'DFL 2/2001 · arts. 9 y 10 bis. Requisitos y excepciones del art. 10 bis; procedimiento administrativo de Aduanas.',urls:[zfB,'https://www.sii.cl/documentos/normativa_ddrr/2020/iquique/reso77319098618_59550.pdf','https://www.bcn.cl/leychile/navegar?idNorma=1227294'],estado:'CONTROL PROPUESTO · VERIFICAR EN LA OPERACIÓN',nivel:'critico',bloqueo:true});
const addB2=(id,titulo,row,ids,extra={})=>flujoRiesgoB.push(bControl('b2-'+id,titulo,row,ids,{col:5,norma:'DFL 2/2001 · arts. 9 y 10 bis.',url:zfB,fuente:'Consultar DFL 2/2001',...extra}));
addB2('requisitos','¿CUMPLE REQUISITOS ART. 10 BIS PARA REINGRESO / SALIDA A ARICA?',4,[17,18],{tipo:'decision',etiqueta:'B2 · NACIONAL / NACIONALIZADA',aclaracion:'Iberia comerciante · reventa · >95 UTM, regla general · acreditación SII'});
addB2('no','NO AVANZAR · VALIDAR REQUISITOS',4,[18],{col:6,nota:'No asumir cumplidos los requisitos ni aplicar excepciones sin respaldo.'});
addB2('compra','COTIZAR Y FORMALIZAR COMPRA B2',6,[18],{aclaracion:'Proveedor · SKU · cantidad · precio · destino · condición de pago'});
addB2('documento','DOCUMENTO DE SALIDA APLICABLE · MERCANCÍA NACIONAL',8,[19],{aclaracion:'Procedimiento propio · sin Art. 11',nota:'Confirmar la declaración aplicable a mercancía nacional/nacionalizada y sus campos. No reutilizar por defecto la documentación extranjera ni su cálculo CIF/Art. 11.'});
addB2('control','CONTROL ADUANERO B2',11,[19,20],{nota:'Cumplir las actuaciones, revisiones y regularizaciones del procedimiento específico. La validación de ZOFRI no reemplaza la habilitación aduanera.'});
addB2('autorizada','¿SALIDA / REINGRESO AUTORIZADO?',15,[20],{tipo:'decision'});
addB2('esperar','NO RETIRAR · RESOLVER PENDIENTES',15,[20],{col:6});
// Las dos ramas sólo convergen después del control de salida.
b('inicio',{col:'3 / 5'});b('mercancia',{col:'3 / 5'});
const comunes=['salida','recepcion','traza','inventario','habilitado','destino-final','venta','fin'];
for(const id of comunes)b(id,{col:'3 / 5'});
b('bloqueo-traza',{col:5});b('no-vender',{col:2});b('previo',{col:5});b('bloqueo-final',{col:5});b('continuar',{col:6});
b('salida',{titulo:'SALIDA FÍSICA AUTORIZADA → TRASLADO A ARICA',nota:'Convergencia sólo después de habilitar la salida de B o B2. Conservar el régimen original en documentos, traslado y recepción.',riesgos:[10,20]});
b('recepcion',{aclaracion:'SKU · cantidades · documento · régimen B o B2'});
b('inventario',{aclaracion:'SKU · régimen B/B2 · documento · lote · cantidad',nota:'Mantener trazabilidad diferenciada por régimen; compartir bodega no convierte la mercancía B en nacionalizada. B2 no adquiere por convergencia el tratamiento Art. 11 de B.'});
b('tributos',{row:9,col:1,titulo:'REGISTRO / CF ART. 11 SI PROCEDE',etiqueta:'SÓLO B · CALENDARIO TRIBUTARIO',tipo:'tax'});
flujoRiesgoB.push(bControl('retencion','RETENCIÓN ART. 11',8,[3],{col:1,tipo:'tax',nota:'Retención por el usuario ZOFRI conforme al art. 11. Carril exclusivo de mercancía extranjera; su ubicación no fija el momento del pago al proveedor.',norma:'Ley 18.211 · art. 11.',url:'https://www.bcn.cl/leychile/navegar?idNorma=29631',fuente:'Consultar Ley 18.211'}));
flujoRiesgoB.push(bControl('f29','F29 DEL PERÍODO · ART. 11',10,[14,15],{col:1,tipo:'tax',nota:'Registrar el crédito Art. 11 sólo si procede y en el período correspondiente. Este carril no condiciona por sí solo la venta ni se aplica a B2.',norma:'Ley 18.211 · art. 11; DL 825, en lo pertinente.',url:'https://www.bcn.cl/leychile/navegar?idNorma=29631',fuente:'Consultar Ley 18.211'}));
b('destino-final',{titulo:'ANTES DE MOVER: ¿DESTINO Y RÉGIMEN PERMITEN EL DESPACHO?',nota:'B extranjera: si sale de ZFE al resto del país, cumplir previamente el procedimiento aduanero aplicable. B2 nacional/nacionalizada: el art. 10 bis contempla el reingreso por los mismos adquirentes. Una vez completado correctamente ese reingreso, no aplicar automáticamente la restricción de permanencia en ZFE propia de B. Los movimientos posteriores, incluido un despacho a Santiago, se tratan conforme al régimen que resulte del reingreso y su documentación.',riesgos:[16,20]});
b('venta',{titulo:'VENTA / DESPACHO SEGÚN RÉGIMEN',nota:'Emitir DTE y conservar documentación y período del movimiento. Para B2, definir su tratamiento tributario con los antecedentes específicos; no atribuir Art. 11 ni una equivalencia automática con Ruta A.'});
for(let i=conexionesRiesgoB.length-1;i>=0;i--){const e=conexionesRiesgoB[i];if((e.from==='br-habilitado'&&e.to==='br-tributos')||e.from==='br-tributos')conexionesRiesgoB.splice(i,1);}
conexionesRiesgoB.find(e=>e.from==='br-regimen'&&e.to==='br-admisible').label='B · Extranjera';
conexionesRiesgoB.find(e=>e.from==='br-regimen'&&e.to==='br-admisible').route='a-branch';
eb('regimen','b2-requisitos','B2 · Nacional / nacionalizada','a-branch');
eb('b2-requisitos','b2-no','NO / DUDA','across');eb('b2-no','b2-requisitos','Revalidar','loop');
eb('b2-requisitos','b2-compra','SÍ');eb('b2-compra','b2-documento');eb('b2-documento','b2-control');eb('b2-control','b2-autorizada');
eb('b2-autorizada','b2-esperar','NO','across');eb('b2-esperar','b2-autorizada','Revalidar','loop');eb('b2-autorizada','salida','SÍ','a-branch');
conexionesRiesgoB.find(e=>e.from==='br-salida-ok'&&e.to==='br-salida').route='a-branch';
eb('base','retencion','Sólo B','a-branch',true);eb('retencion','tributos');eb('tributos','f29');
eb('habilitado','destino-final','SÍ');
b('venta',{riesgos:[16,20]});
b('previo',{titulo:'¿PROCEDIMIENTO EXIGIBLE SEGÚN RÉGIMEN CUMPLIDO?',nota:'B extranjera: si sale de ZFE al resto del país, cumplir previamente el procedimiento aduanero aplicable. B2 nacional/nacionalizada: el art. 10 bis contempla el reingreso por los mismos adquirentes. Una vez completado correctamente ese reingreso, no aplicar automáticamente la restricción de permanencia en ZFE propia de B. Los movimientos posteriores, incluido un despacho a Santiago, se tratan conforme al régimen que resulte del reingreso y su documentación.',riesgos:[16,20]});
conexionesRiesgoB.find(e=>e.from==='br-destino-final'&&e.to==='br-previo').label='NO / trámite previo';
// Los controles comunes explicitan que se aplica la norma del régimen identificado.
for(const id of [10,11,12,13,16]){
 const r=riesgosB.find(r=>r.id===id);
 r.norma+=' Aplicar las referencias ZFE a la rama B extranjera; en B2 conservar y verificar el régimen del art. 10 bis y del reingreso documentado.';
}


let rutaActual = "A";
let frameB = 0;
let enlacesActivos = [];
function renderNetwork(dataset, edges, routeClass) {
  enlacesActivos = edges;
  diagram.className = `diagram diagram-b ${routeClass}`;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("connectors");
  svg.setAttribute("aria-hidden", "true");
  diagram.append(svg);
  // Orden de lectura por fila; los eventos se identifican expresamente como laterales.
  const gridColumnStart = value => Number(String(value ?? 1).match(/\d+/)?.[0] || 1);
  for (const data of [...dataset].sort((a, b) => a.row - b.row || gridColumnStart(a.col) - gridColumnStart(b.col))) {
    const wrap = element("div", `b-node-wrap ${data.tipo || "process"}`);
    wrap.style.gridColumn = data.col;
    wrap.style.gridRow = data.row;
    const node = createNode(data.id, data.tipo === "terminal" ? "terminal" : "", dataset);
    wrap.append(node);
    const outcomes = element("div", "mobile-outcomes");
    for (const edge of edges.filter(item => item.from === data.id)) {
      const target = dataset.find(item => item.id === edge.to);
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
function renderB() { renderNetwork(flujoRiesgoB, conexionesRiesgoB, "route-a route-b-risks"); renderBTools(); }
function renderC() { renderNetwork(flujoRiesgoC, conexionesRiesgoC, "route-a route-c-risks"); renderCTools(); }

// Conectores SVG calculados a partir de las cajas reales: se adaptan al texto y al ancho.
function scheduleConnections() {
  cancelAnimationFrame(frameB);
  frameB = requestAnimationFrame(drawConnections);
}
function drawConnections() {
  if (!["A", "B", "C"].includes(rutaActual)) return;
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
  for (const edge of enlacesActivos) {
    const a = box(edge.from), b = box(edge.to);
    let points, tx, ty;
    if (rutaActual === "A" && edge.route === "loop") {
      // Retorno local por el espacio superior; entra por el vértice del control.
      const lane = Math.min(a.t,b.t)-22;
      points=[[a.x,a.t],[a.x,lane],[b.x,lane],[b.x,b.t]];
      tx=(a.x+b.x)/2;ty=lane-7;
      if(edge.from==='a-corregir-periodo') {
        const laneX=Math.min(a.l,b.l)-22;
        points=[[a.l,a.y],[laneX,a.y],[laneX,b.y],[b.l,b.y]];
        tx=laneX;ty=(a.y+b.y)/2;
      }
    } else if (rutaActual === "A" && edge.to==='a-archivo' && edge.from!=='a-f29') {
      // Las cuatro salidas comparten un colector dentro del carril operacional.
      const center=box('a-destino').x;
      const bottom=Math.max(box('a-devolucion').b,box('a-otra').b)+26;
      points=[[a.x<center?a.r:a.l,a.y],[center,a.y],[center,bottom],[center,b.t-28],[b.x,b.t-28],[b.x,b.t]];
      tx=center;ty=bottom+18;
    } else if (rutaActual === "A" && edge.from==='a-destino' && ['a-devolucion','a-otra'].includes(edge.to)) {
      const left=edge.to==='a-devolucion';
      const lane=left?box('a-venta').l-20:box('a-interno').r+20;
      points=[[left?a.l:a.r,a.y],[lane,a.y],[lane,b.y],[left?b.l:b.r,b.y]];
      tx=lane;ty=a.y-10;
    } else if (rutaActual === "A" && edge.from==='a-requisitos') {
      const lane=(a.b+b.t)/2;
      points=[[a.x,a.b],[a.x,lane],[b.x,lane],[b.x,b.t]];
      tx=(a.x+b.x)/2;ty=lane-8;
    } else if (edge.route === "a-branch" || (rutaActual === "A" && edge.from==='a-rcv')) {
      const mid = (a.b + b.t) / 2;
      points = [[a.x,a.b],[a.x,mid],[b.x,mid],[b.x,b.t]];
      tx = (a.x+b.x)/2; ty=mid-8;
    } else if (edge.route === "a-outer") {
      const right = a.x > b.x;
      const lane = right ? a.r+18 : a.l-18;
      points = [[right?a.r:a.l,a.y],[lane,a.y],[lane,b.y],[right?b.r:b.l,b.y]];
      tx=lane;ty=a.y;
    } else if (edge.route === "across") {
      const right = b.x > a.x;
      points = [[right ? a.r : a.l, a.y], [right ? b.l : b.r, b.y]];
      tx = (points[0][0] + points[1][0]) / 2; ty = a.y - 10;
    } else if (edge.route === "bypass-right") {
      const lane=Math.max(a.r,b.r)+24;points=[[a.r,a.y],[lane,a.y],[lane,b.y],[b.r,b.y]];tx=lane;ty=a.y-10;
    } else if (edge.route.includes("left" ) && edge.route !== "to-left") {
      const lane = a.l - (edge.route === "outer-left" ? 42 : 22);
      points = [[a.l, a.y], [lane, a.y], [lane, b.y], [b.l, b.y]];
      tx = lane - 13; ty = a.y - 10;
    } else if (rutaActual === "C" && edge.from === 'c-pendiente') {
      const lane=(a.l+b.r)/2;
      points=[[a.l,a.y],[lane,a.y],[lane,b.y],[b.r,b.y]];
      tx=lane;ty=(a.y+b.y)/2;
    } else if (edge.route === "loop") {
      const lane = Math.min(a.t, b.t) - 24;
      points = [[a.x, a.t], [a.x, lane], [b.x, lane], [b.x, b.t]];
      tx = (a.x + b.x) / 2; ty = lane - 7;
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
      tx = a.l - 16; ty = a.y + (["A", "B"].includes(rutaActual) ? 24 : -10);
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

const descargasSimplificadas = {
  A: { href: "assets/ruta-a-flujo-simplificado.png", archivo: "Ruta-A-Flujo-Simplificado.png" },
  B: { href: "assets/ruta-b-flujo-simplificado.png", archivo: "Ruta-B-Flujo-Simplificado.png" },
  C: { href: "assets/ruta-c-flujo-simplificado.png", archivo: "Ruta-C-Flujo-Simplificado.png" }
};

function selectRoute(route) {
  rutaActual = route;
  diagram.replaceChildren();
  document.querySelector("#risk-tools")?.remove();
  diagram.className = "diagram";
  diagram.setAttribute("aria-label", `Diagrama de la Ruta ${route}`);
  document.title = `Ruta ${route} · Ferreterías Iberia`;
  document.querySelectorAll("[data-route]").forEach(button => {
    const active = button.dataset.route === route;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  const download = document.querySelector("#download-flow");
  download.href = descargasSimplificadas[route].href;
  download.download = descargasSimplificadas[route].archivo;
  download.setAttribute("aria-label", `Descargar flujo simplificado de la Ruta ${route}`);
  const content = {
    A: { title: "RUTA A — COMPRA A PROVEEDOR NACIONAL", eyebrow: "ADQUISICIÓN NACIONAL", subtitle: "Flujo operacional · Control tributario paralelo · Riesgos y trazabilidad", context: "" },
    B: { title: "RUTA B — COMPRA ZOFRI → ARICA / ZFE", eyebrow: "MERCANCÍA EXTRANJERA / NACIONAL / NACIONALIZADA", subtitle: "B extranjera · B2 art. 10 bis · Salida autorizada y trazabilidad", context: "B y B2 se separan por estatus hasta completar su salida aduanera. Art. 11 pertenece exclusivamente a B. B2 conserva tratamiento propio: compartir traslado e inventario no iguala sus regímenes." },
    C: { title: "RUTA C — IMPORTACIÓN DIRECTA", eyebrow: "PROCESO DE IMPORTACIÓN", subtitle: "Desde la definición del producto hasta la venta en Chile", context: "Las autorizaciones sectoriales y obligaciones REP dependen del producto concreto. La secuencia de arribo y DIN no excluye la tramitación anticipada permitida por la normativa." }
  }[route];
  document.querySelector("#route-title").textContent = content.title;
  document.querySelector(".heading .eyebrow").textContent = content.eyebrow;
  document.querySelector(".heading p").textContent = content.subtitle;
  const context = document.querySelector("#route-context");
  context.hidden = !content.context;
  context.textContent = content.context;
  if (route === "A") renderA();
  else if (route === "B") renderB();
  else renderC();
  const dataset = route === "A" ? nodosA : route === "B" ? flujoRiesgoB : flujoRiesgoC;
  renderNotes(dataset);
  const dashedLegend = document.querySelector(".legend span:nth-child(2)");
  dashedLegend.hidden = false;
}
document.querySelectorAll("[data-route]").forEach(button => button.addEventListener("click", () => selectRoute(button.dataset.route)));
new ResizeObserver(scheduleConnections).observe(diagram);
window.addEventListener("beforeprint", drawConnections);
selectRoute("A");


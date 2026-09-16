/**
 * PROYECTO: Sistema de Registro de Solicitud de Activos - Silocom C.A.
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Google AI Studio & Antigravity IDE
 * ROL: Backend Google Apps Script (Container-Bound) con Doble Capa: Web App Nativa + API REST para Vercel
 */

/**
 * ====================================================================
 * SILOCOM C.A. — REGISTRO DE SOLICITUD DE ACTIVOS (Backend Unificado)
 * ====================================================================
 * V3: API REST PÚBLICA PARA VERCEL + WEB APP NATIVA COEXISTENTE
 *
 * Características:
 *  - Script Container-Bound al Google Sheets: usa SpreadsheetApp.getActiveSpreadsheet().
 *  - Compatible con el frontend original vía google.script.run (Formulario.html).
 *  - Compatible con el frontend moderno en Vercel (React + Vite) vía HTTP REST.
 *  - Token de seguridad compartido: "SILOCOM-SOL-2026".
 *  - Manejo de CORS y Content-Type: application/json con ContentService.
 * ====================================================================
 */

// Token compartido para autorizar peticiones REST desde Vercel
var API_TOKEN_SECRET = "SILOCOM-SOL-2026";

/**
 * Conexión directa al archivo Sheets al que pertenece este script.
 * Al estar integrado al Sheets, Apps Script accede sin necesidad de ID remoto.
 */
function conectarSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Procesa la petición GET.
 * Si recibe e.parameter.action -> responde JSON como API REST.
 * Si no -> sirve Formulario.html para acceso Web App nativo como hoy.
 */
function doGet(e) {
  try {
    // Si viene con parámetro 'action', procesar como solicitud REST
    if (e && e.parameter && e.parameter.action) {
      return handleRestRequest(e.parameter.action, e.parameter, e.parameter.token);
    }

    // Ruta por defecto: servir Web App nativa
    return HtmlService.createHtmlOutputFromFile('Formulario')
      .setTitle('INGRESAR NUEVA SOLICITUD DE ACTIVOS')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    return jsonResponse({
      success: false,
      error: String(err && err.message ? err.message : err)
    }, 500);
  }
}

/**
 * Procesa la petición POST desde clientes externos (Vercel / React).
 * Lee JSON enviado en e.postData.contents (Content-Type: text/plain).
 */
function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    var body = {};

    try {
      body = JSON.parse(raw);
    } catch (parseErr) {
      body = {};
    }

    // El token y la acción pueden venir en el body JSON o en query parameter
    var token = (body && body.token) || (e && e.parameter && e.parameter.token);
    var action = (body && body.action) || (e && e.parameter && e.parameter.action);

    // Validación de Token
    if (token !== API_TOKEN_SECRET) {
      return jsonResponse({
        success: false,
        error: "No autorizado"
      }, 403);
    }

    if (!action) {
      return jsonResponse({
        success: false,
        error: "Parámetro 'action' no especificado"
      }, 400);
    }

    // Mezclar parámetros de query y body (body tiene prioridad)
    var params = {};
    if (e && e.parameter) {
      for (var key in e.parameter) {
        params[key] = e.parameter[key];
      }
    }
    for (var bKey in body) {
      params[bKey] = body[bKey];
    }

    return executeRouterAction(action, params);

  } catch (err) {
    return jsonResponse({
      success: false,
      error: String(err && err.message ? err.message : err)
    }, 500);
  }
}

/**
 * Validador y despachador para peticiones GET REST.
 */
function handleRestRequest(action, params, token) {
  if (token !== API_TOKEN_SECRET) {
    return jsonResponse({
      success: false,
      error: "No autorizado"
    }, 403);
  }
  return executeRouterAction(action, params);
}

/**
 * Router REST centralizado para las 5 acciones del sistema.
 */
function executeRouterAction(action, params) {
  switch (action) {
    case 'getFormInitialData':
      var initialData = getFormInitialData();
      return jsonResponse({
        success: true,
        data: initialData
      });

    case 'getProductos':
      var categoria = params.categoria;
      if (!categoria) {
        return jsonResponse({ success: false, error: "Parámetro 'categoria' requerido" }, 400);
      }
      var productos = getProductos(categoria);
      return jsonResponse({
        success: true,
        data: productos
      });

    case 'getMarcas':
      var catMarca = params.categoria;
      var prodMarca = params.producto;
      if (!catMarca || !prodMarca) {
        return jsonResponse({ success: false, error: "Parámetros 'categoria' y 'producto' requeridos" }, 400);
      }
      var marcas = getMarcas(catMarca, prodMarca);
      return jsonResponse({
        success: true,
        data: marcas
      });

    case 'getModelos':
      var catMod = params.categoria;
      var prodMod = params.producto;
      var marcaMod = params.marca;
      if (!catMod || !prodMod || !marcaMod) {
        return jsonResponse({ success: false, error: "Parámetros 'categoria', 'producto' y 'marca' requeridos" }, 400);
      }
      var modelos = getModelos(catMod, prodMod, marcaMod);
      return jsonResponse({
        success: true,
        data: modelos
      });

    case 'guardarSolicitud':
      var payload = params.payload || params;
      var resultado = guardarSolicitud(payload);
      return jsonResponse({
        success: true,
        message: resultado || "¡Solicitud registrada correctamente en la base de datos!"
      });

    default:
      return jsonResponse({
        success: false,
        error: "Acción no reconocida: " + action
      }, 404);
  }
}

/**
 * Helper para estructurar respuestas JSON vía ContentService con cabeceras MIME.
 */
function jsonResponse(payload, httpStatusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/* ===== OPCIONAL: Menú dentro del Sheets para abrir el formulario ===== */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Solicitud de Activos')
    .addItem('Abrir Formulario', 'abrirFormularioModal')
    .addToUi();
}

function abrirFormularioModal() {
  var html = HtmlService.createHtmlOutputFromFile('Formulario')
    .setTitle('NUEVA SOLICITUD DE ACTIVOS - SILOCOM C.A.')
    .setWidth(1060)
    .setHeight(840);
  SpreadsheetApp.getUi().showModalDialog(html, 'NUEVA SOLICITUD DE ACTIVOS - SILOCOM C.A.');
}

/**
 * Obtiene los datos únicos iniciales de la hoja "BD" para poblar los selectores simples.
 */
function getFormInitialData() {
  var ss = conectarSpreadsheet();
  var sheetBD = ss.getSheetByName('BD');
  if (!sheetBD) throw new Error('La pestaña "BD" no se encuentra en el archivo configurado.');

  var data = sheetBD.getDataRange().getValues();

  var categorias = [];
  var tecnicoCliente = [];
  var operadoras = [];
  var statusList = [];
  var prioridades = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] && categorias.indexOf(row[0]) === -1) categorias.push(row[0]);
    if (row[5] && tecnicoCliente.indexOf(row[5]) === -1) tecnicoCliente.push(row[5]);
    if (row[6] && tecnicoCliente.indexOf(row[6]) === -1) tecnicoCliente.push(row[6]);
    if (row[8] && operadoras.indexOf(row[8]) === -1) operadoras.push(row[8]);
    if (row[9] && statusList.indexOf(row[9]) === -1) statusList.push(row[9]);
    if (row[10] && prioridades.indexOf(row[10]) === -1) prioridades.push(row[10]);
  }

  return {
    categorias: categorias.sort(),
    tecnicoCliente: tecnicoCliente.sort(),
    operadoras: operadoras.sort(),
    statusList: statusList.sort(),
    prioridades: prioridades.sort(),
    carriers: ["VENTA", "CAMBIO-BANE", "CAMBIO-PLATCO", "DEVOLUCION", "CAMBIO-SENSORIZEIT", "CAMBIO-FLOTA", "REEMPLAZO"]
  };
}

/**
 * Filtra los Productos mapeando la hoja "BD" según la Categoría.
 */
function getProductos(categoria) {
  var data = conectarSpreadsheet().getSheetByName('BD').getDataRange().getValues();
  var productos = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === categoria && data[i][1] && productos.indexOf(data[i][1]) === -1) {
      productos.push(data[i][1]);
    }
  }
  return productos.sort();
}

/**
 * Filtra las Marcas mapeando la hoja "BD" según Categoría y Producto.
 */
function getMarcas(categoria, producto) {
  var data = conectarSpreadsheet().getSheetByName('BD').getDataRange().getValues();
  var marcas = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === categoria && data[i][1] === producto && data[i][2] && marcas.indexOf(data[i][2]) === -1) {
      marcas.push(data[i][2]);
    }
  }
  return marcas.sort();
}

/**
 * Filtra los Modelos en la hoja "BD" basados en la triple dependencia previa.
 */
function getModelos(categoria, producto, marca) {
  var data = conectarSpreadsheet().getSheetByName('BD').getDataRange().getValues();
  var modelos = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === categoria && data[i][1] === producto && data[i][2] === marca && data[i][3] && modelos.indexOf(data[i][3]) === -1) {
      modelos.push(data[i][3]);
    }
  }
  return modelos.sort();
}

/**
 * Registra los datos del formulario en la hoja "NUEVAS SOLICITUDES" (Columnas C a N).
 */
function guardarSolicitud(formData) {
  var ss = conectarSpreadsheet();
  var sheetDestino = ss.getSheetByName('NUEVAS SOLICITUDES');
  if (!sheetDestino) throw new Error('La pestaña de destino "NUEVAS SOLICITUDES" no existe en el archivo.');

  var fechaFormateada = formData.fechaSolicitud ? new Date(formData.fechaSolicitud + "T00:00:00") : new Date();

  // Mapeo estructural idéntico de base de datos (Columnas C a N)
  var filaEscribir = [
    fechaFormateada,          // Columna C (Fecha Solicitud)
    formData.tecnicoCliente,  // Columna D (Técnico / Cliente)
    formData.categoria,       // Columna E (Categoría)
    formData.producto,        // Columna F (Producto)
    formData.marca,           // Columna G (Marca)
    formData.modelo,          // Columna H (Modelo)
    formData.carrier,         // Columna I (Carrier)
    formData.operadora,       // Columna J (Operadora)
    Number(formData.cantidad),// Columna K (Cantidad)
    formData.status,          // Columna L (Status)
    formData.prioridad,       // Columna M (Prioridad)
    formData.observaciones    // Columna N (Observaciones)
  ];

  var proximaFila = sheetDestino.getLastRow() + 1;
  // Escribe a partir de la columna 3 (C)
  sheetDestino.getRange(proximaFila, 3, 1, filaEscribir.length).setValues([filaEscribir]);

  return "¡Solicitud registrada correctamente en la base de datos!";
}

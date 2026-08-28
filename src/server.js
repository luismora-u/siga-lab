'use strict';

const http = require('node:http');
const { config } = require('./config');
const laboratorios = require('./modules/laboratorios');
const reservas = require('./modules/reservas');

const VERSION = require('../package.json').version;
const COMMIT = process.env.GIT_COMMIT || 'sin-commit';

function responder(res, codigo, cuerpo) {
  res.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(cuerpo, null, 2));
}

function leerCuerpo(req) {
  return new Promise((resolve, reject) => {
    let datos = '';
    req.on('data', (trozo) => {
      datos += trozo;
      if (datos.length > 1e6) reject(new Error('Cuerpo demasiado grande'));
    });
    req.on('end', () => {
      try {
        resolve(datos ? JSON.parse(datos) : {});
      } catch {
        reject(new Error('JSON invalido'));
      }
    });
    req.on('error', reject);
  });
}

// Endpoint de salud: usado por el pipeline para verificar el despliegue (criterio C5).
function manejarSalud(req, res) {
  return responder(res, 200, { estado: 'ok', version: VERSION, entorno: config.entorno, commit: COMMIT });
}

function manejarListarLaboratorios(req, res) {
  return responder(res, 200, laboratorios.listar());
}

function manejarListarReservas(req, res) {
  return responder(res, 200, reservas.listar());
}

async function manejarCrearReserva(req, res) {
  try {
    const cuerpo = await leerCuerpo(req);
    const reserva = reservas.crear({
      labId: cuerpo.labId,
      usuarioId: cuerpo.usuarioId,
      inicio: new Date(cuerpo.inicio),
    });
    return responder(res, 201, reserva);
  } catch (error) {
    const codigo = error instanceof reservas.ErrorReserva ? 409 : 400;
    return responder(res, codigo, { error: error.codigo || 'SOLICITUD_INVALIDA', mensaje: error.message });
  }
}

// Tabla declarativa de rutas (DT-3): agregar un endpoint es agregar una entrada,
// no extender una cadena de condicionales que compite por el mismo archivo.
const rutas = [
  { metodo: 'GET', ruta: '/salud', manejador: manejarSalud },
  { metodo: 'GET', ruta: '/laboratorios', manejador: manejarListarLaboratorios },
  { metodo: 'GET', ruta: '/reservas', manejador: manejarListarReservas },
  { metodo: 'POST', ruta: '/reservas', manejador: manejarCrearReserva },
];

function encontrarRuta(metodo, ruta) {
  return rutas.find((r) => r.metodo === metodo && r.ruta === ruta) || null;
}

const servidor = http.createServer(async (req, res) => {
  const ruta = new URL(req.url, `http://${req.headers.host}`).pathname;
  const coincidencia = encontrarRuta(req.method, ruta);

  if (!coincidencia) {
    return responder(res, 404, { error: 'RUTA_NO_ENCONTRADA', mensaje: `No existe ${req.method} ${ruta}` });
  }

  return coincidencia.manejador(req, res);
});

if (require.main === module) {
  servidor.listen(config.puerto, () => {
    console.log(`SIGA-Lab v${VERSION} [${config.entorno}] escuchando en http://localhost:${config.puerto}`);
  });
}

module.exports = servidor;

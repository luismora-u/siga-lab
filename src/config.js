'use strict';

// Criterio C2: ningun parametro de negocio embebido en el codigo.
// Todo valor configurable se lee del entorno y tiene un valor por defecto explicito.

function leerEntero(nombre, porDefecto) {
  const bruto = process.env[nombre];
  if (bruto === undefined || bruto === '') return porDefecto;
  const valor = Number.parseInt(bruto, 10);
  if (Number.isNaN(valor)) {
    throw new Error(`Configuracion invalida: ${nombre} debe ser un entero, se recibio "${bruto}"`);
  }
  return valor;
}

const config = {
  entorno: process.env.SIGA_ENV || 'desarrollo',
  puerto: leerEntero('SIGA_PUERTO', 3000),

  // Reglas de negocio parametrizables por la coordinacion
  duracionFranjaMinutos: leerEntero('SIGA_DURACION_FRANJA_MIN', 60),
  antelacionMinimaHoras: leerEntero('SIGA_ANTELACION_MINIMA_H', 2),
  maxReservasPorUsuario: leerEntero('SIGA_MAX_RESERVAS_USUARIO', 3),
};

module.exports = { config, leerEntero };

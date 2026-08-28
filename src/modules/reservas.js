'use strict';

const { config } = require('../config');
const laboratorios = require('./laboratorios');

// Modulo de Reservas: motor de agendamiento con validacion de solapamientos.
// Es el modulo critico del sistema y el objetivo de cobertura de pruebas (criterio C8).

const reservas = [];
let secuencia = 0;

class ErrorReserva extends Error {
  constructor(codigo, mensaje) {
    super(mensaje);
    this.codigo = codigo;
  }
}

function finDeFranja(inicio) {
  return new Date(inicio.getTime() + config.duracionFranjaMinutos * 60_000);
}

function haySolapamiento(labId, inicio) {
  const fin = finDeFranja(inicio);
  return reservas.some((r) => {
    if (r.labId !== labId || r.estado !== 'CONFIRMADA') return false;
    return inicio < finDeFranja(r.inicio) && r.inicio < fin;
  });
}

function reservasActivasDe(usuarioId) {
  return reservas.filter((r) => r.usuarioId === usuarioId && r.estado === 'CONFIRMADA').length;
}

/**
 * Crea una reserva aplicando las tres reglas de negocio parametrizadas.
 * @param {{labId: string, usuarioId: string, inicio: Date, ahora?: Date}} datos
 */
function crear({ labId, usuarioId, inicio, ahora = new Date() }) {
  if (!laboratorios.buscarPorId(labId)) {
    throw new ErrorReserva('LAB_NO_EXISTE', `El laboratorio ${labId} no existe`);
  }

  if (Number.isNaN(inicio.getTime())) {
    throw new ErrorReserva('FECHA_INVALIDA', 'La fecha de inicio no es valida');
  }

  const horasDeAntelacion = (inicio.getTime() - ahora.getTime()) / 3_600_000;
  if (horasDeAntelacion < config.antelacionMinimaHoras) {
    throw new ErrorReserva(
      'ANTELACION_INSUFICIENTE',
      `Se requieren al menos ${config.antelacionMinimaHoras} horas de antelacion`,
    );
  }

  if (reservasActivasDe(usuarioId) >= config.maxReservasPorUsuario) {
    throw new ErrorReserva(
      'LIMITE_ALCANZADO',
      `El usuario alcanzo el limite de ${config.maxReservasPorUsuario} reservas activas`,
    );
  }

  if (haySolapamiento(labId, inicio)) {
    throw new ErrorReserva('FRANJA_OCUPADA', 'La franja solicitada ya esta ocupada');
  }

  const reserva = {
    id: `RES-${String(++secuencia).padStart(4, '0')}`,
    labId,
    usuarioId,
    inicio,
    fin: finDeFranja(inicio),
    estado: 'CONFIRMADA',
  };
  reservas.push(reserva);
  return { ...reserva };
}

function cancelar(id) {
  const reserva = reservas.find((r) => r.id === id);
  if (!reserva) throw new ErrorReserva('NO_ENCONTRADA', `La reserva ${id} no existe`);
  reserva.estado = 'CANCELADA';
  return { ...reserva };
}

function listar() {
  return reservas.map((r) => ({ ...r }));
}

// Utilidad para aislar las pruebas entre si.
function reiniciar() {
  reservas.length = 0;
  secuencia = 0;
}

module.exports = { crear, cancelar, listar, reiniciar, ErrorReserva };

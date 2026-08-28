'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { config } = require('../src/config');
const reservas = require('../src/modules/reservas');

const AHORA = new Date('2026-08-03T08:00:00Z');
const enHoras = (h) => new Date(AHORA.getTime() + h * 3_600_000);

test.beforeEach(() => reservas.reiniciar());

test('crea una reserva valida', () => {
  const r = reservas.crear({ labId: 'LAB-COMP-01', usuarioId: 'est-001', inicio: enHoras(5), ahora: AHORA });
  assert.equal(r.estado, 'CONFIRMADA');
  assert.equal(r.labId, 'LAB-COMP-01');
  assert.match(r.id, /^RES-\d{4}$/);
});

test('rechaza un laboratorio inexistente', () => {
  assert.throws(
    () => reservas.crear({ labId: 'LAB-XXX', usuarioId: 'est-001', inicio: enHoras(5), ahora: AHORA }),
    (e) => e.codigo === 'LAB_NO_EXISTE',
  );
});

// Reproduce el defecto MC-2 verificado empiricamente en la Unidad 1 (Anexo D):
// una fecha invalida producia una reserva CONFIRMADA con inicio/fin nulos.
test('rechaza una fecha de inicio invalida (MC-2)', () => {
  assert.throws(
    () => reservas.crear({ labId: 'LAB-COMP-01', usuarioId: 'est-001', inicio: new Date('fecha-basura'), ahora: AHORA }),
    (e) => e.codigo === 'FECHA_INVALIDA',
  );
});

test('rechaza una reserva sin la antelacion minima configurada', () => {
  const insuficiente = config.antelacionMinimaHoras - 0.5;
  assert.throws(
    () => reservas.crear({ labId: 'LAB-COMP-01', usuarioId: 'est-001', inicio: enHoras(insuficiente), ahora: AHORA }),
    (e) => e.codigo === 'ANTELACION_INSUFICIENTE',
  );
});

test('rechaza el solapamiento de franjas en el mismo laboratorio', () => {
  reservas.crear({ labId: 'LAB-COMP-01', usuarioId: 'est-001', inicio: enHoras(5), ahora: AHORA });
  assert.throws(
    () => reservas.crear({ labId: 'LAB-COMP-01', usuarioId: 'est-002', inicio: enHoras(5), ahora: AHORA }),
    (e) => e.codigo === 'FRANJA_OCUPADA',
  );
});

test('permite la misma franja en laboratorios distintos', () => {
  reservas.crear({ labId: 'LAB-COMP-01', usuarioId: 'est-001', inicio: enHoras(5), ahora: AHORA });
  const r = reservas.crear({ labId: 'LAB-RED-01', usuarioId: 'est-002', inicio: enHoras(5), ahora: AHORA });
  assert.equal(r.estado, 'CONFIRMADA');
});

test('aplica el limite de reservas activas por usuario', () => {
  for (let i = 0; i < config.maxReservasPorUsuario; i++) {
    reservas.crear({ labId: 'LAB-COMP-01', usuarioId: 'est-001', inicio: enHoras(5 + i * 2), ahora: AHORA });
  }
  assert.throws(
    () => reservas.crear({ labId: 'LAB-COMP-01', usuarioId: 'est-001', inicio: enHoras(50), ahora: AHORA }),
    (e) => e.codigo === 'LIMITE_ALCANZADO',
  );
});

test('una cancelacion libera la franja y el cupo del usuario', () => {
  const r = reservas.crear({ labId: 'LAB-COMP-01', usuarioId: 'est-001', inicio: enHoras(5), ahora: AHORA });
  reservas.cancelar(r.id);
  const nueva = reservas.crear({ labId: 'LAB-COMP-01', usuarioId: 'est-002', inicio: enHoras(5), ahora: AHORA });
  assert.equal(nueva.estado, 'CONFIRMADA');
});

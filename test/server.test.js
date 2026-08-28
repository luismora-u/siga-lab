'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const servidor = require('../src/server');

test('POST /reservas rechaza una fecha de inicio invalida (MC-2)', async () => {
  await new Promise((resolve) => servidor.listen(0, resolve));
  const puerto = servidor.address().port;

  const respuesta = await fetch(`http://localhost:${puerto}/reservas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ labId: 'LAB-COMP-01', usuarioId: 'est-001', inicio: 'fecha-basura' }),
  });
  const cuerpo = await respuesta.json();

  assert.notEqual(respuesta.status, 201);
  assert.equal(cuerpo.error, 'FECHA_INVALIDA');

  await new Promise((resolve) => servidor.close(resolve));
});

test('el endpoint /salud expone estado, version, entorno y commit', async () => {
  await new Promise((resolve) => servidor.listen(0, resolve));
  const puerto = servidor.address().port;

  const respuesta = await fetch(`http://localhost:${puerto}/salud`);
  const cuerpo = await respuesta.json();

  assert.equal(respuesta.status, 200);
  assert.equal(cuerpo.estado, 'ok');
  assert.ok('version' in cuerpo);
  assert.ok('entorno' in cuerpo);
  assert.ok('commit' in cuerpo);

  await new Promise((resolve) => servidor.close(resolve));
});

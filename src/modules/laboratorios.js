'use strict';

// Modulo de Catalogo de Laboratorios (almacenamiento en memoria para el prototipo).

const laboratorios = [
  { id: 'LAB-COMP-01', nombre: 'Laboratorio de Computo 1', capacidad: 30, sede: 'Bloque A' },
  { id: 'LAB-ELEC-01', nombre: 'Laboratorio de Electronica', capacidad: 18, sede: 'Bloque B' },
  { id: 'LAB-RED-01', nombre: 'Laboratorio de Redes', capacidad: 12, sede: 'Bloque B' },
];

function listar() {
  return laboratorios.map((lab) => ({ ...lab }));
}

function buscarPorId(id) {
  return laboratorios.find((lab) => lab.id === id) || null;
}

module.exports = { listar, buscarPorId };

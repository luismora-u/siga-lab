# Changelog

## [0.2.1] - 2026-08-28
### Cambiado
- `src/server.js`: el enrutamiento pasa de una cadena de condicionales a
  una tabla declarativa de rutas (reduce DT-3). Sin cambio de contrato;
  verificado por la suite existente sin modificar sus aserciones.
  Refs: CR-005

## [0.2.0] - 2026-08-19
### Agregado
- CI-INF-01: pipeline de integración continua con GitHub Actions
  (`npm install` + `npm test` en cada push y pull request hacia main).
  Refs: CR-002
- Campo `commit` en el endpoint `/salud`, cerrando el eslabón de
  trazabilidad extremo a extremo. Refs: CR-001
- Prueba de cobertura para `/salud` (antes sin cobertura, DT-5 parcial).

### Corregido
- Descubrimiento de archivos de prueba portátil entre Windows y el
  runner de Ubuntu (antes fallaba con el patrón glob explícito). Refs: CR-002

## [0.1.0] - 2026-07-22
### Agregado
- Línea base inicial del sistema SIGA-Lab.
- CI-COD-01 Servidor HTTP y enrutamiento (`src/server.js`)
- CI-COD-02 Módulo de Reservas (`src/modules/reservas.js`)
- CI-COD-03 Módulo de Catálogo de Laboratorios (`src/modules/laboratorios.js`)
- CI-CFG-01 Configuración parametrizada (`src/config.js`)
- CI-CFG-02 Plantilla de variables de entorno (`.env.example`)
- CI-CFG-03 Manifiesto de paquete (`package.json`)
- CI-TST-01 Suite de pruebas de Reservas (`test/reservas.test.js`)
- CI-DOC-01 Guía de uso del repositorio (`README.md`)
# SIGA-Lab

Prototipo del **Sistema de Gestion de Agendamiento de Laboratorios**, caso de estudio del curso de Gestion de Configuracion y Mantenimiento de Software.

No requiere dependencias externas: solo Node.js 18 o superior.

## Ejecucion

```bash
cp .env.example .env      # ajustar valores segun el entorno
npm start                 # http://localhost:3000
```

## Pruebas

```bash
npm test                  # ejecuta la suite del modulo de reservas
npm run test:cobertura    # incluye reporte de cobertura
```

## Endpoints

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/salud` | Version y entorno desplegado (verificacion post-despliegue) |
| GET | `/laboratorios` | Catalogo de laboratorios |
| GET | `/reservas` | Reservas registradas |
| POST | `/reservas` | Crea una reserva: `{ "labId", "usuarioId", "inicio" }` |

## Configuracion

Todas las reglas de negocio se leen de variables de entorno (ver `.env.example`). No hay parametros embebidos en el codigo fuente.

| Variable | Por defecto | Significado |
|---|---|---|
| `SIGA_DURACION_FRANJA_MIN` | 60 | Duracion de cada franja en minutos |
| `SIGA_ANTELACION_MINIMA_H` | 2 | Horas minimas de antelacion para reservar |
| `SIGA_MAX_RESERVAS_USUARIO` | 3 | Reservas activas simultaneas por usuario |

## Estado

Version 0.1.0 — linea base inicial de la Unidad 1. Persistencia en memoria; los modulos de autenticacion, notificaciones y reportes se incorporaran en unidades posteriores.

# Plan Técnico y de Arquitectura: SoundBox Studios (plan.md)

Este documento detalla la arquitectura técnica, la justificación de la base de datos, el modelo de datos relacional, el diseño de contratos de la API REST, la ubicación exacta de cada regla de negocio en el código, las decisiones técnicas y las preguntas coordinadas con el analista.

---

## 1. Arquitectura General del Sistema

El sistema implementa una arquitectura desacoplada en capas (Layered Clean Architecture):

```
┌────────────────────────────────────────────────────────┐
│            Frontend (React + TypeScript + Vite)        │
│  - Vistas: Catálogo, Reserva, Mis Reservas, Admin, RN │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON (REST API)
┌───────────────────────────▼────────────────────────────┐
│                  Backend (Express + Node.js)           │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Controllers & Routes (Mapeo HTTP, Códigos Estado)  │ │
│ └─────────────────────────┬──────────────────────────┘ │
│                           ▼                            │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Services (Orquestación de Casos de Uso y Flujos)   │ │
│ └───────────┬───────────────────────────┬────────────┘ │
│             │                           │              │
│             ▼                           ▼              │
│ ┌──────────────────────┐    ┌────────────────────────┐ │
│ │ Domain (Reglas Puras │    │ Repositories (Acceso   │ │
│ │ RN1-RN8, Matemáticas)│    │ a Datos y Persistencia)│ │
│ └──────────────────────┘    └───────────┬────────────┘ │
└─────────────────────────────────────────┼──────────────┘
                                          ▼
                      ┌───────────────────────────────────────┐
                      │ Base de Datos: Local Data Store       │
                      │ + PostgreSQL Neon Cloud Ready         │
                      └───────────────────────────────────────┘
```

### Ventajas de esta Arquitectura:
1. **Testabilidad Máxima**: El núcleo de reglas de negocio (`src/domain/`) se prueba de forma aislada sin levantar servidores web ni bases de datos lentas.
2. **Independencia Tecnológica**: La capa de repositorio abstrae la persistencia; cambiar de un almacenamiento local de alta velocidad a Neon / PostgreSQL en la nube requiere únicamente configurar la variable `DATABASE_URL`.
3. **Mantenibilidad**: Si una regla de negocio cambia (por ejemplo, el porcentaje de seña o los minutos de buffer), solo se modifica el módulo de dominio correspondiente sin tocar controladores ni rutas.

---

## 2. Base de Datos y su Justificación

### Decisión de Persistencia
Para el desarrollo, testing automatizado y despliegue ágil, se diseñó un **Repositorio Relacional Híbrido**:
1. **Entorno Local y Tests**: Repositorio de alta velocidad en memoria / archivo estructurado que inicializa datos semilla (*seeding*) de salas y equipamiento, permitiendo que la suite completa de tests de integración y unitarios se ejecute en menos de 1 segundo sin requerir un demonio de PostgreSQL instalado localmente.
2. **Entorno Cloud (Producción en Neon)**: Compatible con esquema relacional PostgreSQL estándar (`DATABASE_URL`). Las entidades y consultas respetan tipos SQL estándar con claves foráneas e integridad referencial.

### Justificación:
- **Neon** (PostgreSQL Serverless) fue la recomendación oficial del curso (Clase 10, diapositivas 7-8).
- Permite branch de base de datos y escalabilidad automática a costo cero durante el período de evaluación.
- Al aislar la persistencia detrás de interfaces de repositorio (`IRoomRepository`, `IReservationRepository`, `IEquipmentRepository`), el código es 100% portable y no genera bloqueos al docente al evaluar el proyecto.

---

## 3. Modelo de Datos Relacional

### Entidades y Relaciones

#### Tabla: `rooms` (Salas)
- `id`: `string` (PK, ej. `"room-abbey"`, `"room-electric"`, `"room-stadium"`)
- `name`: `string` (ej. `"Sala Abbey"`)
- `type`: `string` (`"acustica"` | `"estandar"` | `"escenario"`)
- `capacity`: `number` (aforo máximo: 4, 8, 15)
- `hourly_rate`: `number` (tarifa base en ARS: 12000, 18000, 28000)
- `description`: `string`
- `included_gear`: `string[]` (batería básica, 2 amplis guitarra, 1 bajo, sistema PA, 2 mics)

#### Tabla: `equipment` (Equipamiento Compartido)
- `id`: `string` (PK, ej. `"eq-shure-sm7b"`, `"eq-marshall-jcm800"`)
- `name`: `string`
- `category`: `string` (`"microfono"` | `"amplificador"` | `"bateria"` | `"sintetizador"`)
- `total_stock`: `number` (unidades totales en el estudio)
- `hourly_price`: `number` (costo adicional por hora)

#### Tabla: `reservations` (Reservas)
- `id`: `string` (PK, UUID)
- `code`: `string` (Código público único, ej. `"SB-4921"`)
- `room_id`: `string` (FK -> `rooms.id`)
- `client_name`: `string`
- `client_email`: `string`
- `client_phone`: `string`
- `band_name`: `string`
- `attendees_count`: `number` (validado contra `rooms.capacity`)
- `date`: `string` (`YYYY-MM-DD`)
- `start_time`: `string` (`HH:mm`, ej. `"18:00"`)
- `end_time`: `string` (`HH:mm`, ej. `"20:00"`)
- `duration_hours`: `number` (ej. 2.0)
- `subtotal_room`: `number` (costo sala con descuentos/recargos aplicados)
- `subtotal_equipment`: `number` (costo acumulado de extras)
- `total_price`: `number` (suma total)
- `deposit_amount`: `number` (30% obligatorio)
- `remaining_balance`: `number` (70% a cobrar en check-in)
- `status`: `string` (`"PENDIENTE"` | `"CONFIRMADA"` | `"EN_CURSO"` | `"COMPLETADA"` | `"CANCELADA"` | `"NO_SHOW"`)
- `cancellation_reason`: `string` (opcional)
- `cancellation_refund`: `number` (monto liquidado al cancelar según RN5)
- `created_at`: `string` (ISO-8601)
- `check_in_at`: `string` (opcional ISO-8601)

#### Tabla: `reservation_equipment` (Equipos Alquilados por Reserva)
- `reservation_id`: `string` (FK -> `reservations.id`)
- `equipment_id`: `string` (FK -> `equipment.id`)
- `quantity`: `number`
- `hourly_price_snapshot`: `number`

---

## 4. Diseño de la API REST

| Método | Endpoint | Descripción | Códigos HTTP |
|---|---|---|---|
| `GET` | `/api/health` | Estado del servicio y uptime | 200 |
| `GET` | `/api/rooms` | Catálogo de salas con aforos y precios | 200 |
| `GET` | `/api/rooms/:id/availability?date=YYYY-MM-DD` | Grilla de disponibilidad y bloques con buffer | 200, 404 |
| `GET` | `/api/equipment` | Catálogo de equipamiento compartido y stock | 200 |
| `POST` | `/api/reservations/quote` | Simulación y cotización reactiva en tiempo real | 200, 400 |
| `POST` | `/api/reservations` | Creación y confirmación de nueva reserva | 201, 400, 409 |
| `GET` | `/api/reservations/:code` | Consulta de reserva por código público | 200, 404 |
| `POST` | `/api/reservations/:code/check-in` | Check-in presencial y registro de saldo | 200, 400, 404 |
| `POST` | `/api/reservations/:code/cancel` | Cancelación de reserva y liquidación de seña | 200, 400, 404 |
| `GET` | `/api/admin/timeline?date=YYYY-MM-DD` | Vista timeline para sonidistas con buffer visible | 200 |

---

## 5. Dónde Vive Cada Regla de Negocio en el Código

| Regla | Descripción | Módulo y Archivo Responsable |
|---|---|---|
| **RN1** | Buffer Técnico de 15 minutos | `src/domain/buffer.ts` (`hasBufferCollision`, `addTechnicalBuffer`) |
| **RN2** | Capacidad Máxima de Integrantes | `src/domain/capacity.ts` (`validateCapacity`) |
| **RN3** | Duración 1 a 4 hs en bloques de 30m | `src/domain/duration.ts` (`validateDurationAndSlots`) |
| **RN4** | Franjas Tarifarias y Seña del 30% | `src/domain/pricing.ts` (`calculateQuote`, `applyTimeSlotRates`) |
| **RN5** | Liquidación Escalonada de Cancelación | `src/domain/cancellation.ts` (`calculateCancellationRefund`) |
| **RN6** | Detección de Colisiones de Horario | `src/domain/collision.ts` (`isTimeSlotOccupied`) |
| **RN7** | Control de Stock de Equipos Compartidos| `src/domain/equipment.ts` (`checkEquipmentAvailability`) |
| **RN8** | Ciclo de Vida y Transiciones de Estado | `src/domain/status.ts` (`validateStatusTransition`, `canCheckIn`) |

---

## 6. Decisiones Técnicas y Preguntas para el Analista

### Decisiones Técnicas:
1. **Fechas y Timezones**: Se procesan las horas de reservas como minutos absolutos desde las 00:00 (ej. 10:00 = 600 min, 10:15 = 615 min) para garantizar precisión aritmética de microsegundos en la detección de colisiones de buffer sin problemas de Daylight Saving Time.
2. **Validación de Errores con Estructura Uniforme**: Las respuestas de rechazo por reglas de negocio devuelven:
   ```json
   {
     "success": false,
     "error": "BUFFER_COLLISION",
     "message": "El turno de 18:00 a 20:00 cuenta con 15 minutos de buffer técnico obligatorio hasta las 20:15.",
     "details": { "suggestedNextSlot": "20:15" }
   }
   ```
3. **CORS Dinámico**: Soporta tanto orígenes locales (`http://localhost:5173`, `http://localhost:3000`) como el dominio productivo de Netlify mediante la variable de entorno `FRONTEND_URL`.

### Preguntas Coordinadas con el Analista:
- *Coordinado*: ¿La seña del 30% aplica también a los extras de equipamiento? -> **Sí**, sobre el presupuesto global total para garantizar el compromiso del cliente.
- *Coordinado*: ¿Qué ocurre si un cliente se retrasa 10 minutos para iniciar su turno? -> **El horario de fin no se corre** para respetar el turno y el buffer de la banda posterior.

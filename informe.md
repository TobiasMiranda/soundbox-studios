# Informe Final del Proyecto: SoundBox Studios (informe.md)
**Generación T · Bootcamp IA-First · Módulo 4 y Módulo 5**

---

## 1. Resumen Ejecutivo y Alcance
**SoundBox Studios** es un sistema integral de reservas y gestión operativa para un complejo de salas de ensayo y grabación musical profesional. El proyecto fue concebido y desarrollado siguiendo estrictamente la metodología **IA-First** enseñada en el curso:
- **Specification-Driven Development (SDD)**: Redacción exhaustiva y sin huecos de especificaciones funcionales (`spec.md`), reglas de negocio numeradas con cifras concretas (RN1 a RN8), historias de usuario estructuradas (HU1 a HU6), registro de decisiones (`decisiones.md`), glosario (`glosario.md`) y preguntas abiertas cerradas (`preguntas-abiertas.md`).
- **Arquitectura de Agentes Especializados**: Adopción de 6 roles bien diferenciados (Analista, Arquitecto, Backend, Frontend, Tester, Revisor) con sus directivas explícitas en `.cursor/rules/` y su reglamento unificado en `AGENTS.md`.
- **Desarrollo Guiado por Pruebas (TDD / Rojo-Verde-Refactor)**: 41 tests automáticos unitarios y de integración que cubren el 100% de las reglas de negocio, ejecutados con Vitest y Supertest.
- **Git Disciplinado (Un commit por tarea)**: Historial de commits atómicos reflejando secuencialmente las tareas de `tasks.md`.
- **Despliegue y Arquitectura Cloud-Ready**: Separación estricta de frontend (Vite/React para Netlify), backend (Express/Node.js para Render) y base de datos relacional (PostgreSQL para Neon), con secretos 100% aislados en variables de entorno.

---

## 2. Justificación Rigurosa del Orden de las Tareas (tasks.md)

De acuerdo con lo enfatizado en las Clases 6, 8 y 10 del Módulo 4 (*"la parte más difícil de construir siempre tiene que darse como prioridad"*), el plan de tareas se ordenó siguiendo una estrategia de **máxima dependencia y mayor complejidad lógica descendente**:

```
[T-01 & T-02: Especificación y Arquitectura]
                     │
                     ▼
[T-03: Buffer 15m y Colisiones] ◄─── MÁXIMA COMPLEJIDAD LÓGICA (Núcleo crítico)
                     │
                     ▼
[T-04: Tarifas Dinámicas y Seña] ◄── CRÍTICO (Cálculo de dinero y franjas)
                     │
                     ▼
[T-05 a T-07: Aforo, Cancelaciones, Stock]
                     │
                     ▼
[T-08 & T-09: Repositorios y Servicios de Aplicación]
                     │
                     ▼
[T-10 & T-11: Controladores REST, CORS y Tests HTTP]
                     │
                     ▼
[T-12 a T-14: Frontend React, Wizard, Timeline y Verificador RN]
                     │
                     ▼
[T-15: Auditoría, Informe y Despliegue]
```

### ¿Por qué se construyó en este orden exacto?
1. **Prioridad a la lógica más compleja y propensa a fallas (T-03 y T-04)**:
   - El **buffer técnico obligatorio de 15 minutos** y la **detección de colisiones de horario** constituyen el corazón de SoundBox. Si el algoritmo de solapamiento horario falla, se sobrevenden salas y el negocio colapsa.
   - Las **tarifas dinámicas con cruces de franja horaria** (descuentos diurnos del 20%, recargos nocturnos del 25% y recargo de fin de semana del 15% prorrateados en bloques de 30 minutos) representan la matemática más delicada del sistema.
   - Construir esto primero garantizó que todo el resto del sistema (servicios, controladores, interfaces) se apoyara sobre una base de dominio probada, determinística e inmutable.
2. **Desacoplamiento antes de la persistencia (T-05 a T-07 antes de T-08)**:
   - Validar el aforo (RN2), la política de cancelación escalonada (RN5) y el stock compartido (RN7) en funciones puras permitió alcanzar 27 tests unitarios en verde antes de escribir una sola línea de almacenamiento o SQL.
3. **Persistencia y Servicios como capa de orquestación (T-08 y T-09)**:
   - Una vez que las reglas de dominio estuvieron blindadas, los repositorios y servicios se limitaron a persistir y orquestar llamadas sin duplicar lógica de negocio.
4. **Infraestructura HTTP al final del backend (T-10 y T-11)**:
   - Los controladores y Express solo mapean solicitudes HTTP a los servicios existentes. Esto permitió que las pruebas de integración con Supertest y la colección Postman se redactaran sobre endpoints completamente estables.
5. **Frontend como consumidor final de contratos garantizados (T-12 a T-14)**:
   - El equipo frontend trabajó sobre una API REST terminada y predecible, permitiendo construir interfaces ricas (wizard con cálculo en tiempo real, timeline visual con bloques de buffer violetas y el verificador de reglas interactivo) sin incertidumbre sobre los payloads.

---

## 3. Plan Técnico y Arquitectura del Sistema

### 3.1. Modelo Relacional de Datos
- **Entidad `Room`**: Modela las salas físicas con aforos innegociables (Abbey: 4, Electric: 8, Stadium: 15) y equipamiento base incluido.
- **Entidad `Equipment`**: Modela el inventario centralizado de periféricos de alta gama (Shure SM7B, Marshall JCM800, Mapex Pro, Korg Minilogue) con cantidades finitas compartidas.
- **Entidad `Reservation`**: Registra la contratación con código único `SB-XXXX`, horario `[inicio, fin]`, cálculo de buffer `fin + 15 min`, desglose de tarifa, seña del 30% y saldo remanente del 70%.
- **Transición de Estados (RN8)**: `PENDIENTE` -> `CONFIRMADA` -> `EN_CURSO` (Check-in presencial en ventana de -15 min a +30 min) -> `COMPLETADA` o `CANCELADA`.

### 3.2. Asignación de Reglas de Negocio en el Código
- **RN1 (Buffer 15m)**: `src/domain/buffer.ts` (`checkIntervalCollision`, `TECHNICAL_BUFFER_MINUTES = 15`).
- **RN2 (Aforo)**: `src/domain/capacity.ts` (`validateCapacity`).
- **RN3 (Duración 1-4h)**: `src/domain/duration.ts` (`validateDurationAndSlots`).
- **RN4 (Tarifas y Seña 30%)**: `src/domain/pricing.ts` (`calculateQuote`, `getSlotRateMultiplier`, `isWeekend`).
- **RN5 (Cancelación Escalonada)**: `src/domain/cancellation.ts` (`calculateCancellationRefund`).
- **RN6 (Solapamiento)**: `src/domain/collision.ts` (`validateSlotAvailability`).
- **RN7 (Stock Compartido)**: `src/domain/equipment.ts` (`checkEquipmentAvailability`).
- **RN8 (Estados y Check-in)**: `src/domain/status.ts` (`canTransitionStatus`, `canCheckIn`).

---

## 4. Registro y Resultados de las Pruebas

El sistema cuenta con dos niveles de validación exhaustiva: suite automatizada en tiempo de compilación/CI y colección de pruebas de endpoints Postman.

### 4.1. Suite Automatizada (Vitest + Supertest)
Ejecución completa realizada con comando `npm test`:

```
 RUN  v2.1.9 C:/Users/Toco/.gemini/antigravity/scratch/soundbox-studio/backend

 ✓ tests/capacity.test.ts (3 tests)
   - debe aprobar si la cantidad de integrantes no supera la capacidad de la sala
   - debe rechazar si la cantidad de integrantes excede el aforo de la sala
   - debe rechazar cantidades inválidas (0 o números negativos o decimales)

 ✓ tests/cancellation.test.ts (4 tests)
   - debe reintegrar el 100% de la seña si se cancela con más de 48 horas de antelación
   - debe reintegrar el 50% de la seña si se cancela entre 24 y 48 horas de antelación
   - debe retener el 100% de la seña (0% reintegro) si se cancela con menos de 24 horas
   - debe rechazar cancelaciones cuando el horario pactado ya inició o transcurrió

 ✓ tests/equipment.test.ts (3 tests)
   - debe permitir la reserva si hay stock suficiente en el catálogo y sin colisiones
   - debe rechazar si la cantidad solicitada supera el stock total del estudio
   - debe rechazar si las unidades disponibles están comprometidas en otra sala en el mismo horario

 ✓ tests/status.test.ts (3 tests)
   - debe permitir transiciones válidas de estado
   - debe bloquear transiciones ilegales de estado
   - debe validar la tolerancia horaria para realizar el Check-in (15 min antes a 30 min después)

 ✓ tests/buffer.test.ts (6 tests)
   - debe convertir correctamente strings HH:mm a minutos y viceversa
   - debe permitir reservas consecutivas si se respeta el buffer técnico de 15 minutos
   - debe rechazar reservas que inicien inmediatamente al terminar el turno anterior sin buffer
   - debe rechazar reservas que se solapen directamente en horario
   - debe permitir reservas si la anterior fue cancelada
   - debe rechazar si colisiona con cualquier reserva activa en la lista

 ✓ tests/pricing.test.ts (8 tests)
   - duraciones menores a 60 min rechazadas
   - duraciones mayores a 4 hs rechazadas
   - granularidad fuera de bloques de 30 min rechazada
   - duraciones válidas aprobadas
   - 20% descuento en horario Off-Peak (11:00 a 13:00 día de semana)
   - 25% recargo en horario Nocturno (22:00 a 24:00)
   - 15% recargo de Fin de Semana (Sábados/Domingos)
   - liquidación correcta de equipamiento adicional y seña del 30%

 ✓ tests/bookingService.test.ts (6 tests)
   - ciclo completo de creación de reserva con cálculo de seña
   - rechazo por invasión del buffer de 15 minutos de la reserva previa
   - aprobación de reserva inmediata tras finalizar el buffer (16:15)
   - rechazo por aforo excedido
   - cancelación con liquidación de reintegro >48h
   - check-in en recepción con cobro del 70% restante

 ✓ tests/api.test.ts (8 tests)
   - GET /api/health -> 200 OK
   - GET /api/rooms -> 200 OK
   - GET /api/equipment -> 200 OK
   - POST /api/reservations/quote -> 200 OK con desglose
   - POST /api/reservations -> 201 Created con código SB-XXXX
   - POST /api/reservations -> 409 Conflict al invadir buffer de 15 min
   - GET /api/reservations/:code -> 200 OK
   - POST /api/reservations/:code/cancel -> 200 OK con reembolso

TOTAL: 8 archivos de test | 41 tests ejecutados | 41 pasaron exitosamente (100% verde)
DURACIÓN: 902 ms
```

### 4.2. Colección de Endpoints Postman (`postman_collection.json`)
La colección incluye 11 peticiones configuradas con variables de entorno (`{{baseUrl}}`, `{{reservationCode}}`), cubriendo:
1. `GET /api/health`: Chequeo de salud del servicio.
2. `GET /api/rooms`: Listado de salas y aforos.
3. `GET /api/rooms/:id/availability?date=...`: Consulta de horarios ocupados y buffers calculados.
4. `GET /api/equipment`: Catálogo de periféricos y stock.
5. `POST /api/reservations/quote`: Cotización reactiva con desglose de descuentos y seña.
6. `POST /api/reservations`: Creación de reserva exitosa.
7. `POST /api/reservations` (Colisión): Prueba negativa que verifica la respuesta HTTP 409 ante invasión de buffer.
8. `GET /api/reservations/:code`: Consulta de estado por código público.
9. `POST /api/reservations/:code/check-in`: Simulación de check-in presencial en recepción.
10. `POST /api/reservations/:code/cancel`: Cancelación con cálculo de reintegro según antelación.
11. `GET /api/admin/timeline?date=...`: Timeline para el operador con bloques de buffer diferenciados.

---

## 5. Guía de Publicación en la Nube (Netlify, Render y Neon)

Siguiendo las recomendaciones del Módulo 4 (Clase 10):

### 5.1. Base de Datos en Neon (PostgreSQL Serverless)
1. Crear proyecto gratuito en [neon.tech](https://neon.tech).
2. Copiar la cadena de conexión generada con soporte SSL.
3. Configurar dicha cadena en el panel de Render como variable de entorno `DATABASE_URL`.

### 5.2. Backend en Render
1. Crear un nuevo **Web Service** conectado al repositorio de GitHub.
2. Configurar:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Cargar las Variables de Entorno en el panel de Render:
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: URL asignada por Netlify (ej: `https://soundbox-studios.netlify.app`)
   - `DATABASE_URL`: Cadena de conexión de Neon.

### 5.3. Frontend en Netlify
1. Crear un nuevo sitio en [netlify.com](https://netlify.com) desde el repositorio de GitHub.
2. Configurar:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
3. Configurar la redirección de API en `frontend/public/_redirects` o proxy de Vite apuntando al dominio de Render.

---

## 6. Conclusión y Verificación contra el Checklist de Entrega

El proyecto SoundBox Studios satisface íntegramente cada uno de los puntos exigidos en la consigna reconstruida:
- [x] Proyecto original propio, distinto a ReservaClub.
- [x] Complejidad lógica real (buffer de 15m, tarifas dinámicas por franja, aforos, stock compartido, cancelaciones escalonadas).
- [x] Documentación obligatoria completa: `idea.md`, `decisiones.md`, `glosario.md`, `preguntas-abiertas.md`, `spec.md`, `AGENTS.md`, `plan.md`, `tasks.md`, `informe.md`, `README.md`.
- [x] 6 reglas de agentes en `.cursor/rules/`.
- [x] Todos los tests automáticos pasando (41 tests, 0 fallos).
- [x] Un commit por tarea en Git.
- [x] Secretos fuera del código (.gitignore y .env.example).
- [x] Frontend moderno con todas las pantallas funcionales (Catálogo, Wizard, Mis Reservas, Timeline y Verificador).
- [x] CORS configurado estrictamente.
- [x] Preparado para despliegue en Netlify / Render / Neon.

# Plan de Tareas: SoundBox Studios (tasks.md)

Este documento contiene la secuencia estructurada de tareas técnicas del proyecto, ordenadas rigurosamente por dependencias y prioridad de dificultad (la lógica de negocio central y más compleja se resuelve primero). Cada tarea documenta su agente responsable, dependencias, reglas/historias cubiertas y criterio de terminado.

---

### **T-01: Relevamiento Funcional, Especificación Formal y Reglas del Negocio**
- **Agente**: Analista
- **Qué hacer**: Redactar los documentos fundacionales: `idea.md`, `decisiones.md`, `glosario.md`, `preguntas-abiertas.md` y `spec.md` con las 8 Reglas de Negocio (RN1 a RN8) y las Historias de Usuario (HU1 a HU6) con criterios Dado/Cuando/Entonces.
- **RN y HU que cubre**: RN1 a RN8, HU1 a HU6.
- **Dependencias**: Ninguna (inicio de proyecto).
- **Criterio de terminado**: Documentos creados sin ambigüedades, con cifras concretas y sección de pendientes cerrada en 0.
- **Estado**: [x] Hecho

---

### **T-02: Definición de Arquitectura, Reglamento de Agentes y Plan Técnico**
- **Agente**: Arquitecto
- **Qué hacer**: Redactar `AGENTS.md`, las reglas especializadas en `.cursor/rules/` para los 6 roles, y el documento `plan.md` con la arquitectura en capas, justificación de BD, modelo relacional, contratos de API REST y asignación de reglas en el código.
- **RN y HU que cubre**: Estructura técnica global.
- **Dependencias**: T-01.
- **Criterio de terminado**: Todos los documentos de arquitectura y reglas de agentes redactados y validados.
- **Estado**: [x] Hecho

---

### **T-03: Módulo de Dominio: Algoritmo de Detección de Colisiones y Buffer Técnico (15 min)**
- **Agente**: Backend Developer & Tester
- **Qué hacer**: Implementar la lógica pura de detección de solapamiento horario en `src/domain/buffer.ts` y `src/domain/collision.ts`. Contemplar el intervalo obligatorio de 15 minutos posterior a cada turno, cálculo de minutos absolutos e intersección de intervalos abiertos/cerrados.
- **RN y HU que cubre**: RN1, RN6, HU02.
- **Dependencias**: T-02.
- **Criterio de terminado**: Tests unitarios en `tests/buffer.test.ts` verificando colisiones directas, reservas contiguas válidas con 15 min de separación y rechazo de reservas que invadan el buffer.
- **Estado**: [x] Hecho

---

### **T-04: Módulo de Dominio: Motor de Tarifas Dinámicas y Cálculo de Seña (30%)**
- **Agente**: Backend Developer & Tester
- **Qué hacer**: Implementar `src/domain/pricing.ts` con el cálculo de precios por fracciones de 30 min, descuento diurno Off-Peak (-20%), tarifa estándar Prime, recargo nocturno Late-Night (+25%), adicional de fin de semana (+15%) y retención del 30% en concepto de seña.
- **RN y HU que cubre**: RN3, RN4, HU01.
- **Dependencias**: T-02.
- **Criterio de terminado**: Tests unitarios en `tests/pricing.test.ts` comprobando cotizaciones diurnas, nocturnas, fines de semana y cruces de franja horaria con precisión monetaria.
- **Estado**: [x] Hecho

---

### **T-05: Módulo de Dominio: Validador de Capacidad y Aforo de Integrantes**
- **Agente**: Backend Developer & Tester
- **Qué hacer**: Implementar `src/domain/capacity.ts` validando el límite máximo estricto de cada sala (Abbey: 4, Electric: 8, Stadium: 15). Rechazo determinístico con código explicativo ante excesos.
- **RN y HU que cubre**: RN2, HU03.
- **Dependencias**: T-02.
- **Criterio de terminado**: Tests unitarios en `tests/capacity.test.ts` verificando que aforos válidos sean aprobados y excesos sean rechazados.
- **Estado**: [x] Hecho

---

### **T-06: Módulo de Dominio: Política Escalonada de Cancelación y Reintegro**
- **Agente**: Backend Developer & Tester
- **Qué hacer**: Implementar `src/domain/cancellation.ts` calculando la antelación exacta en horas respecto a la fecha de inicio. Aplicar tramos: >48h (100% devolución), 24h-48h (50% devolución), <24h (0% devolución).
- **RN y HU que cubre**: RN5, HU05.
- **Dependencias**: T-02.
- **Criterio de terminado**: Tests unitarios en `tests/cancellation.test.ts` cubriendo los tres tramos de tiempo y casos borde temporales.
- **Estado**: [x] Hecho

---

### **T-07: Módulo de Dominio: Control de Stock de Equipamiento Compartido y Máquina de Estados**
- **Agente**: Backend Developer & Tester
- **Qué hacer**: Implementar `src/domain/equipment.ts` para validar disponibilidad de stock compartido en la franja con buffer, y `src/domain/status.ts` para transiciones válidas (`PENDIENTE` -> `CONFIRMADA` -> `EN_CURSO` -> `COMPLETADA` / `CANCELADA`).
- **RN y HU que cubre**: RN7, RN8, HU04, HU06.
- **Dependencias**: T-03, T-04.
- **Criterio de terminado**: Tests unitarios en `tests/equipment.test.ts` y `tests/status.test.ts` pasando exitosamente.
- **Estado**: [x] Hecho

---

### **T-08: Capa de Persistencia y Repositorios con Datos Semilla (Seeding)**
- **Agente**: Backend Developer
- **Qué hacer**: Crear `src/repositories/db.ts` con almacenamiento persistente de salas, equipamiento y reservas. Implementar repositorios tipados: `roomRepository`, `reservationRepository`, `equipmentRepository`. Carga inicial de salas y equipamiento base.
- **RN y HU que cubre**: Base de datos, persistencia de todas las RN.
- **Dependencias**: T-03 a T-07.
- **Criterio de terminado**: Repositorios operativos con métodos de búsqueda por ID, código, fecha y filtrado de solapamiento horario.
- **Estado**: [x] Hecho

---

### **T-09: Capa de Servicios de Aplicación y Orquestación**
- **Agente**: Backend Developer
- **Qué hacer**: Implementar `src/services/bookingService.ts` y `src/services/roomService.ts` integrando todas las validaciones de dominio (aforo, duración, solapamiento con buffer, equipamiento, cotización) en un flujo unificado y atómico.
- **RN y HU que cubre**: RN1 a RN8, HU01 a HU06.
- **Dependencias**: T-08.
- **Criterio de terminado**: Tests de integración en `tests/bookingService.test.ts` validando el ciclo completo de creación, consulta, check-in y cancelación.
- **Estado**: [x] Hecho

---

### **T-10: Controladores HTTP, Rutas REST, CORS y Seguridad de Secretos**
- **Agente**: Backend Developer
- **Qué hacer**: Crear servidor Express en `src/index.ts`, controladores en `src/controllers/`, rutas en `src/routes/api.ts`, middleware de errores, configuración de CORS restringido a `FRONTEND_URL` y variables de entorno en `.env.example`.
- **RN y HU que cubre**: Toda la API pública, CORS, manejo de secretos fuera de código.
- **Dependencias**: T-09.
- **Criterio de terminado**: Servidor Express inicializable, sin credenciales expuestas en código y con endpoints REST documentados.
- **Estado**: [x] Hecho

---

### **T-11: Suite Completa de Tests Automatizados y Colección de Pruebas Postman**
- **Agente**: Tester
- **Qué hacer**: Ejecutar la suite completa de pruebas unitarias y de integración con Vitest y Supertest. Generar archivo `postman_collection.json` con todos los endpoints y aserciones automáticas de respuesta.
- **RN y HU que cubre**: Verificación integral de todos los endpoints y reglas.
- **Dependencias**: T-10.
- **Criterio de terminado**: 100% de tests en verde (0 fallos) y archivo `postman_collection.json` generado y validado.
- **Estado**: [x] Hecho

---

### **T-12: Estructura del Frontend React y Sistema de Diseño "SoundBox Dark Wave"**
- **Agente**: Frontend Developer
- **Qué hacer**: Inicializar aplicación React con TypeScript y Vite en carpeta `frontend/`. Configurar estilos responsivos temáticos de estudio de sonido profesional, barra de navegación, tipografías y cliente API en `src/services/api.ts`.
- **RN y HU que cubre**: Infraestructura y diseño base de la aplicación cliente.
- **Dependencias**: T-10.
- **Criterio de terminado**: Frontend compila con Vite sin errores y renderiza la estructura principal.
- **Estado**: [x] Hecho

---

### **T-13: Pantallas de Catálogo, Wizard de Reserva Reactiva y Gestión de Reservas**
- **Agente**: Frontend Developer
- **Qué hacer**: Implementar componentes `RoomList.tsx`, `BookingWizard.tsx` (con cálculo reactivo instantáneo de precio, descuento diurno, recargo nocturno, selección de extras y cálculo de seña) y `MyReservations.tsx` (con búsqueda por código, Check-in y simulador interactivo de cancelación con reembolso en tiempo real).
- **RN y HU que cubre**: HU01, HU03, HU04, HU05, HU06.
- **Dependencias**: T-12.
- **Criterio de terminado**: Pantallas plenamente operativas interactuando con el backend.
- **Estado**: [x] Hecho

---

### **T-14: Pantalla de Agenda / Timeline con Buffer de 15 min y Verificador de Reglas de Negocio**
- **Agente**: Frontend Developer
- **Qué hacer**: Implementar `AdminTimeline.tsx` donde se grafica la jornada de salas mostrando visualmente los bloques de ensayo y los intervalos de buffer de 15 minutos. Implementar `BusinessRulesVerifier.tsx` con pruebas en vivo de las 8 reglas para el docente.
- **RN y HU que cubre**: RN1 a RN8, demostración interactiva evaluativa.
- **Dependencias**: T-13.
- **Criterio de terminado**: Timeline renderiza bloques de buffer claramente diferenciados y el verificador interactivo valida cada regla.
- **Estado**: [x] Hecho

---

### **T-15: Informe Final Académico, Auditoría de Secretos y README con Guía de Despliegue**
- **Agente**: Revisor & Analista
- **Qué hacer**: Redactar `informe.md` con los resultados de pruebas, justificación del orden de tareas y guía de publicación en Render/Netlify/Neon. Crear `README.md` exhaustivo con enlaces de demostración e instrucciones de despliegue.
- **RN y HU que cubre**: Cierre del proyecto, checklist final de entrega del Módulo 5.
- **Dependencias**: T-11, T-14.
- **Criterio de terminado**: Documentos redactados, repositorio limpio sin archivos sensibles y verificado.
- **Estado**: [x] Hecho

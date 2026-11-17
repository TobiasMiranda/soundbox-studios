# Reglamento de la Obra: SoundBox Studios (AGENTS.md)

Este documento establece las normas de convivencia, gobernanza y flujo de trabajo para todos los agentes de Inteligencia Artificial y desarrolladores humanos que colaboran en el proyecto **SoundBox Studios**.

---

## 1. ¿Qué es este Proyecto?
**SoundBox Studios** es una plataforma de software para la gestión automatizada y reserva inteligente de salas de ensayo y estudios de grabación musical. Su valor diferencial radica en la rigurosidad de sus reglas de negocio: cálculo dinámico de tarifas con franjas horarias, obligatoriedad de un buffer técnico de 15 minutos entre ensayos, aforo estricto, gestión de inventario compartido de equipos premium y política escalonada de retención de señas.

---

## 2. Mapa Documental y Fuente de Verdad

Todos los agentes deben consultar y respetar la jerarquía documental:

| Documento | Propósito | Responsabilidad |
|---|---|---|
| `spec.md` | **Fuente Suprema de Verdad Funcional**. Contiene todas las RN (con números concretos) y HU. | Nadie puede inventar reglas no especificadas aquí. |
| `idea.md` | Requerimiento original del cliente en limpio. | Contexto general de la necesidad de negocio. |
| `decisiones.md` | Bitácora de resoluciones justificadas pregunta por pregunta. | Consulta de antecedentes y por qué se decidió cada aspecto. |
| `glosario.md` | Definiciones canónicas de términos de dominio. | Unificación de nombres de variables y conceptos. |
| `preguntas-abiertas.md` | Registro de dudas analizadas y su impacto. | Trazabilidad del análisis previo. |
| `plan.md` | Arquitectura técnica, justificación de DB, API y modelo. | Guía para el diseño de base de datos y endpoints. |
| `tasks.md` | Lista ordenada de tareas atómicas con dependencias y criterios de fin. | Hoja de ruta estricta de ejecución y control de commits. |
| `informe.md` | Registro final de pruebas, plan ejecutado y justificación de orden. | Entrega académica y evaluación. |

> **Regla de Oro**: Si existe discrepancia entre el código y `spec.md`, el código está equivocado y debe ser corregido para ajustarse a `spec.md`.

---

## 3. Stack Tecnológico Oficial

- **Backend**:
  - Runtime: Node.js (v20+ LTS).
  - Lenguaje: TypeScript (modo estricto).
  - Framework Web: Express.js.
  - Validación: Tipos TypeScript y middleware de validación schema.
  - Testing: Vitest + Supertest (ejecución ultrarrápida sin transpilar en memoria).
  - Base de Datos: Arquitectura de Repositorio (Almacenamiento persistente local JSON/SQLite y compatibilidad nativa con PostgreSQL en Neon mediante `DATABASE_URL`).
  - Seguridad: `dotenv` para variables de entorno, `cors` configurado con lista blanca estricta.

- **Frontend**:
  - Framework: React 18 / Vite.
  - Lenguaje: TypeScript.
  - Estilos: Tailwind CSS / Modern CSS responsivo con paleta oscura de estudio musical ("SoundBox Dark Wave").
  - Iconos y componentes accesibles, modales y visualizador de timeline de buffer.

---

## 4. Reglas Generales de Convivencia Técnica
1. **Ningún secreto en el repositorio**: Jamás commitear archivos `.env` reales, tokens, passwords o cadenas de conexión. Siempre utilizar variables de entorno y documentarlas en `.env.example`.
2. **CORS explícito**: El backend debe permitir únicamente peticiones procedentes del dominio del frontend configurado en la variable `FRONTEND_URL` (o `localhost:5173` en desarrollo).
3. **Manejo de fechas en UTC/ISO**: Todas las fechas y horas se procesan en formato ISO-8601 para evitar ambigüedades de zona horaria en el cálculo del buffer y las penalidades.
4. **Respuestas HTTP estándar**: Código 200/201 en éxito, 400 en datos inválidos o reglas violadas con mensaje explicativo, 404 en recursos no hallados, 409 en conflicto horario de sala o buffer.

---

## 5. El Equipo de Agentes y sus Roles

En este proyecto colaboran 6 agentes especializados (definidos en `.cursor/rules/`):
1. **Analista**: Vela por el entendimiento del negocio, la integridad de `spec.md`, las reglas RN1-RN8 y las historias de usuario HU1-HU6. No escribe código de producción.
2. **Arquitecto**: Diseña la arquitectura en capas, el modelo de datos, la justificación de tecnologías y los contratos de la API en `plan.md`.
3. **Tester**: Implementa los casos de prueba automáticos basados en los criterios de aceptación antes o en paralelo a la implementación (TDD). Verifica que las reglas fallen inicialmente (Rojo) y luego pasen (Verde).
4. **Desarrollador Backend**: Implementa la lógica de negocio, repositorios, servicios, controladores y endpoints en TypeScript, sin alterar los tests existentes.
5. **Desarrollador Frontend**: Construye la interfaz de usuario en React, garantizando que todas las pantallas funcionen, consuman la API y presenten información fidedigna del buffer y los precios.
6. **Revisor (Code Reviewer)**: Audita que el código cumpla con los estándares, que no haya secretos expuestos, que la cobertura de tests sea completa y autoriza el commit de cada tarea.

---

## 6. Ciclo de Trabajo de cada Tarea (Rojo - Verde - Refactor)

Cada tarea definida en `tasks.md` debe seguir obligatoriamente este ciclo:
1. **Lectura**: El agente responsable lee la tarea en `tasks.md`, sus dependencias, su criterio de terminado y las RN/HU asociadas en `spec.md`.
2. **Fase Roja (Tester)**: El Tester escribe el test unitario o de integración reflejando los criterios de aceptación. El test debe fallar inicialmente si la funcionalidad aún no existe.
3. **Fase Verde (Desarrollador)**: El Backend o Frontend Developer escribe el código mínimo y necesario para que el test pase, respetando la arquitectura de capas.
4. **Fase Refactor / Revisión (Revisor)**: El Revisor audita la calidad, tipado, legibilidad y ausencia de secretos. Se ejecutan todos los tests del suite para garantizar que nada se haya roto.
5. **Commit Atómico**: Una vez aprobada la tarea y con todos los tests en verde, se realiza un único commit en Git con el mensaje estructurado:
   `feat(T-XX): <título de la tarea> [RN-X, HU-Y]`
6. **Actualización de Estado**: Se marca la tarea como completada `[x]` en `tasks.md`.

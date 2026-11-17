# SoundBox Studios 🎙️⚡
**Sistema Inteligente de Gestión y Reserva de Salas de Ensayo y Grabación**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/tests-41%2F41%20passing-success.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)]()
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)]()
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)]()
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)]()

> **Proyecto Final Obligatorio — Módulo 4 y Módulo 5**  
> **Curso / Bootcamp**: Generación T · Bootcamp IA-First  
> **Metodología**: Specification-Driven Development (SDD) & Agentes Especializados de IA

---

## 🌐 Enlaces Públicos de Despliegue (Producción)

- **Frontend en Netlify**: [https://soundbox-studios.netlify.app](https://soundbox-studios.netlify.app) *(o entorno local en `http://localhost:5173`)*
- **Backend API en Render**: [https://soundbox-backend.onrender.com](https://soundbox-backend.onrender.com) *(o entorno local en `http://localhost:3000`)*
- **Colección Postman**: [`postman_collection.json`](./postman_collection.json)

---

## 📖 Índice Documental Obligatorio

El proyecto cuenta con el árbol completo de documentación exigido por la metodología de la cátedra:

1. [`idea.md`](./idea.md): Requerimiento original del cliente en limpio, sin huecos ni ambigüedades.
2. [`decisiones.md`](./decisiones.md): Bitácora de resoluciones y justificaciones organizadas por tema.
3. [`glosario.md`](./glosario.md): Definición canónica de términos del dominio en 1 o 2 líneas.
4. [`preguntas-abiertas.md`](./preguntas-abiertas.md): Registro de dudas, reglas afectadas, nivel de impacto y resolución final.
5. [`spec.md`](./spec.md): **Fuente de verdad suprema**. Contiene las 8 Reglas de Negocio (RN1 a RN8) con números concretos, 6 Historias de Usuario (HU1 a HU6) con criterios Dado/Cuando/Entonces, casos borde y sección de pendientes en cero.
6. [`AGENTS.md`](./AGENTS.md): "Reglamento de la obra", delimitación de roles, fuentes de verdad y ciclo de trabajo Rojo-Verde-Refactor.
7. [`.cursor/rules/`](./.cursor/rules/): Reglas individuales para los 6 roles de agentes:
   - [`analista.md`](./.cursor/rules/analista.md)
   - [`arquitecto.md`](./.cursor/rules/arquitecto.md)
   - [`tester.md`](./.cursor/rules/tester.md)
   - [`backend.md`](./.cursor/rules/backend.md)
   - [`frontend.md`](./.cursor/rules/frontend.md)
   - [`revisor.md`](./.cursor/rules/revisor.md)
8. [`plan.md`](./plan.md): Arquitectura en capas, justificación de base de datos, modelo relacional, diseño REST y mapa de reglas en el código.
9. [`tasks.md`](./tasks.md): Plan de 15 tareas secuenciales ordenadas por dependencia y complejidad, con todas las tareas marcadas como hechas `[x]`.
10. [`informe.md`](./informe.md): Informe académico con justificación obligatoria del orden de tareas, resultados de los 41 tests y guía de despliegue en la nube.
11. [`postman_collection.json`](./postman_collection.json): Colección exportada lista para importar en Postman.

---

## 🎯 Complejidad del Negocio (Más allá de un simple CRUD)

SoundBox Studios implementa lógica de negocio real, determinística e interconectada:
- **RN1 — Buffer Técnico de 15 Minutos**: Bloqueo automático e inviolable de 15 minutos posteriores a cada ensayo para ventilación y calibración acústica. Ninguna reserva puede invadir este intervalo.
- **RN2 — Aforo Estricto por Sala**: Abbey (máx 4), Electric (máx 8), Stadium (máx 15). Rechazo con código 400 ante excesos.
- **RN3 — Franja de Duración**: Duración permitida de 1 a 4 horas en múltiplos de 30 minutos.
- **RN4 — Tarifas Dinámicas y Seña del 30%**:
  - Diurno / Off-Peak (10:00 a 16:00): **20% de descuento**.
  - Tarde / Prime (16:00 a 22:00): Tarifa base regular.
  - Noche / Late-Night (22:00 a 02:00): **25% de recargo nocturno**.
  - Fines de Semana (Sáb/Dom): **15% de recargo adicional**.
  - **Seña obligatoria del 30%** para confirmación, con saldo restante del 70% cobrado en el check-in.
- **RN5 — Cancelación Escalonada de Seña**:
  - Más de 48 horas de antelación: **100% de reembolso**.
  - Entre 24 y 48 horas de antelación: **50% de reembolso** (50% de retención).
  - Menos de 24 horas o No-Show: **0% de reembolso** (100% de retención).
- **RN6 — Prevención de Solapamiento**: Detección de colisiones considerando `[inicio, fin + 15m]`.
- **RN7 — Stock Compartido de Equipos**: Control de inventario en tiempo real para periféricos compartidos entre salas.
- **RN8 — Ciclo de Vida y Tolerancia de Check-in**: Ventana de ingreso presencial entre 15 min antes y 30 min después del inicio.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Backend** | Node.js (v20+), Express.js, TypeScript, CORS, Dotenv |
| **Testing** | Vitest, Supertest (41 tests automatizados con 100% éxito) |
| **Frontend** | React 18, TypeScript, Vite, Tailwind/Modern CSS, Lucide Icons |
| **Persistencia** | Almacenamiento relacional tipado con seeders y soporte nativo PostgreSQL (Neon) |
| **Despliegue** | Netlify (Frontend) + Render (Backend) + Neon (Database) |

---

## 🚀 Puesta en Marcha en Local

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd soundbox-studio
```

### 2. Iniciar el Backend
```bash
cd backend
npm install
npm run dev
```
El servidor backend se iniciará en `http://localhost:3000`.

### 3. Iniciar el Frontend
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
La aplicación web estará disponible en `http://localhost:5173`.

---

## 🧪 Ejecución de Pruebas Automatizadas

Para correr los 41 tests unitarios y de integración:
```bash
cd backend
npm test
```
Para ejecutar los tests en modo observador continuo (*watch mode*):
```bash
npm run test:watch
```

---

## 🔒 Manejo de Secretos y Variables de Entorno

Siguiendo el punto 5.7 de la consigna (*"Los secretos fuera del código"*), ningún archivo `.env` está subido al repositorio (se encuentra ignorado en [`.gitignore`](./.gitignore)).

Para configurar entornos locales o en la nube, copie los archivos de plantilla:
- Backend: [`.env.example`](./backend/.env.example) -> `backend/.env`
- Raíz: [`.env.example`](./.env.example)

### Variables requeridas en Render:
- `PORT=3000`
- `NODE_ENV=production`
- `FRONTEND_URL=https://tu-sitio.netlify.app`
- `DATABASE_URL=postgresql://usuario:password@ep-ejemplo.neon.tech/neondb?sslmode=require`

---

## 💻 Pantallas Disponibles en el Frontend

1. **Catálogo de Salas**: Galería interactiva con capacidades, fotos, tarifas y equipamiento incluido.
2. **Wizard de Reserva Reactivo**: Cálculo automático e instantáneo de cotización con descuentos diurnos, recargos nocturnos, extras y seña del 30%.
3. **Mis Reservas & Check-in**: Búsqueda por código `SB-XXXX`, check-in de recepción y simulador de cancelación con reembolso en tiempo real.
4. **Agenda & Visualizador de Buffer**: Vista tipo timeline que muestra gráficamente los bloques de reserva y las franjas violetas de **15 minutos de buffer técnico obligatorio** posteriores a cada sesión.
5. **Validador de Reglas de Negocio (RN)**: Panel exclusivo para el docente donde puede probar con 1 clic cada regla contra la API del backend.

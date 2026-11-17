# Registro de Decisiones de Negocio y Arquitectura (decisiones.md)

Este documento registra formalmente las preguntas planteadas durante la etapa de relevamiento, análisis y diseño del proyecto **SoundBox Studios**, junto a las decisiones tomadas y justificadas por tema.

---

## 1. Tema: Gestión del Tiempo y Disponibilidad de Salas

### Pregunta 1.1: ¿Cuánto tiempo necesita el equipo técnico para preparar una sala entre bandas?
- **Opciones analizadas**:
  a) Sin tiempo intermedio (inicio inmediato de la siguiente reserva).
  b) 10 minutos de intervalo.
  c) 15 minutos de intervalo obligatorio.
  d) 30 minutos de intervalo.
- **Decisión**: Se establece un **buffer técnico obligatorio de 15 minutos** inmediatamente posterior al término de cada reserva.
- **Justificación**: 10 minutos resultan insuficientes para desenrollar cables, guardar micrófonos y ventilar la sala tras un ensayo de rock; 30 minutos reduce excesivamente la ocupación rentable diaria. 15 minutos es el balance perfecto para calibrar la acústica y chequear cables sin penalizar la facturación.

### Pregunta 1.2: ¿Cuál debe ser la duración mínima y máxima de una reserva?
- **Opciones analizadas**:
  a) Fracciones libres de 15 minutos.
  b) Mínimo 1 hora (60 min) y máximo 4 horas (240 min) en bloques múltiplos de 30 minutos.
  c) Solo turnos fijos de 2 horas.
- **Decisión**: **Mínimo 1 hora (60 minutos) y máximo 4 horas** continuas por cliente en una misma fecha, contratables en incrementos de **30 minutos**.
- **Justificación**: Menos de una hora no alcanza para armar instrumentos y ensayar un setlist. Más de 4 horas genera fatiga auditiva y monopoliza la sala perjudicando a otros clientes.

---

## 2. Tema: Precios, Tarifas Dinámicas y Señas

### Pregunta 2.1: ¿Cómo incentivar la ocupación en horarios de baja demanda sin perjudicar la rentabilidad?
- **Opciones analizadas**:
  a) Tarifa plana fija las 24 horas.
  b) Descuento matutino off-peak y recargo nocturno/fin de semana.
  c) Precios por subasta dinámica.
- **Decisión**: Se implementa un esquema de **franjas tarifarias horarias**:
  - **Off-Peak (10:00 a 16:00)**: 20% de descuento sobre la tarifa por hora de la sala.
  - **Prime (16:00 a 22:00)**: Tarifa regular base (100%).
  - **Night (22:00 a 02:00)**: 25% de recargo nocturno por costos de seguridad y personal sonidista.
  - **Fin de Semana (Sáb/Dom)**: 15% de recargo adicional.
- **Justificación**: Estimula a bandas jóvenes y músicos sesionistas a ensayar por la mañana a menor costo, y compensa el mayor costo operativo del personal en horarios nocturnos y fines de semana.

### Pregunta 2.2: ¿Qué porcentaje de seña debe exigirse para reservar?
- **Opciones analizadas**:
  a) Pago 100% por adelantado.
  b) Seña del 30% al reservar y saldo restante del 70% al ingresar a la sala (check-in).
  c) Sin seña (reserva bajo palabra).
- **Decisión**: Seña obligatoria del **30% del costo total** estimado.
- **Justificación**: Sin seña la tasa de inasistencia ("no-show") superaba el 35%. Exigir el 100% disminuía las conversiones de bandas que recién cobran al tocar el fin de semana. El 30% cubre el costo fijo mínimo del estudio y compromete al cliente.

---

## 3. Tema: Política de Cancelación y Reembolsos

### Pregunta 3.1: ¿Qué sucede si una banda cancela su turno? ¿Se devuelve la seña?
- **Opciones analizadas**:
  a) No reembolsar nunca la seña.
  b) Devolver siempre el 100% sin importar la antelación.
  c) Política escalonada por franjas de aviso previo (>48h, 24-48h, <24h).
- **Decisión**: Se adopta una **política escalonada transparente**:
  - Cancelación con **más de 48 horas**: reintegro del **100% de la seña**.
  - Cancelación entre **24 y 48 horas**: reintegro del **50% de la seña** (50% de retención).
  - Cancelación con **menos de 24 horas** o no-show: **0% de reintegro** (retención del 100%).
- **Justificación**: Brinda flexibilidad justa al músico con anticipación suficiente para que el estudio reasigne la sala, y protege el ingreso del estudio cuando el aviso es tardío.

---

## 4. Tema: Seguridad, Capacidad y Equipamiento Compartido

### Pregunta 4.1: ¿Debe el sistema controlar la cantidad de integrantes que ingresan a una sala?
- **Opciones analizadas**:
  a) Dejarlo a criterio de la banda.
  b) Límite estricto de capacidad según metros cuadrados y acondicionamiento acústico de la sala.
- **Decisión**: Capacidad máxima infranqueable:
  - Sala Acústica "Abbey": máx **4 personas**.
  - Sala Estándar "Electric": máx **8 personas**.
  - Sala Escenario "Stadium": máx **15 personas**.
- **Justificación**: Garantiza la seguridad e higiene acústica, previene roturas de equipamiento por amontonamiento y cumple con normativas de habilitación municipal.

### Pregunta 4.2: ¿Cómo se maneja el equipamiento adicional premium?
- **Opciones analizadas**:
  a) Cada sala tiene su propio stock fijo sin posibilidad de compartir.
  b) Un depósito central compartido con stock cuantificado y reserva atada al horario del turno (con su buffer).
- **Decisión**: Inventario central compartido con validación temporal de disponibilidad atada al rango `[inicio_reserva, fin_reserva + 15m]`.
- **Justificación**: Optimiza el retorno sobre la inversión en equipos costosos (ej. micrófonos de cinta, cabezales valvulares) permitiendo que cualquier sala los aproveche según demanda.

---

## 5. Tema: Arquitectura Técnica y Despliegue

### Pregunta 5.1: ¿Qué stack técnico y base de datos utilizar?
- **Decisión**:
  - Backend: **Node.js + Express con TypeScript**, arquitectura limpia en capas (Domain, Repository, Service, Controller).
  - Frontend: **React con TypeScript + Vite**, diseño responsivo oscuro tipo estudio musical.
  - Base de Datos: Capa de persistencia con soporte dual (almacenamiento relacional estructurado en memoria y archivo JSON/SQLite para ejecución inmediata local y tests, compatible con conexión a PostgreSQL en **Neon** mediante cadena de conexión de variables de entorno).
  - Tests: **Vitest** + **Supertest** para pruebas unitarias de reglas de negocio y de integración de endpoints.
- **Justificación**: Máxima velocidad de ejecución de tests sin latencia de red, TypeScript de extremo a extremo que previene errores de tipado, y portabilidad absoluta para despliegue en Render/Neon/Netlify.

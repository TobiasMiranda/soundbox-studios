# Especificación del Sistema: SoundBox Studios (spec.md)

Este es el documento central de especificación funcional y fuente de verdad técnica del proyecto.

---

## 1. Objetivo General, Usuarios y Roles, Alcance

### 1.1. Objetivo
Proveer una solución web integral para el estudio de grabación y salas de ensayo **SoundBox Studios**, automatizando la reserva horaria inteligente, el cálculo dinámico de tarifas, el respeto estricto de intervalos de mantenimiento técnico (buffer), la gestión de equipamiento de alta gama compartido y una política transparente de señas y cancelaciones.

### 1.2. Usuarios y Roles
- **Cliente / Músico**:
  - Explora salas y equipamiento disponible.
  - Cotiza reservas con desglose transparente y confirmación mediante seña (30%).
  - Consulta y gestiona sus reservas mediante un código único de reserva (`SB-XXXX`).
  - Solicita cancelaciones con cálculo automático de reembolso.
- **Administrador / Sonidista**:
  - Consulta la agenda diaria en una vista de línea de tiempo que visibiliza los bloques de ensayo y los buffers técnicos de 15 minutos.
  - Realiza el Check-in (ingreso de la banda y cobro del saldo restante del 70%).
  - Cierra la sesión (Check-out) para habilitar el buffer y la siguiente sesión.
  - Supervisa el inventario de equipamiento compartido en tiempo real.

### 1.3. Alcance del Sistema
- **Enfoque**: Plataforma cliente-servidor con backend API REST y frontend interactivo.
- **Validaciones**: Lógica de negocio rigurosa y determinística en backend, validada con tests automáticos continuos.

---

## 2. Reglas de Negocio Numeradas (RN) con Cifras Concretas

### **RN1: Buffer Técnico de Mantenimiento y Calibración (15 minutos)**
Entre la finalización de cualquier reserva y el comienzo de la subsiguiente en la misma sala física, rige un intervalo técnico obligatorio e inamovible de exactamente **15 minutos**. Ningún cliente puede reservar un horario que intercepte el bloque `[hora_fin, hora_fin + 15 min]`.

### **RN2: Límite Estricto de Integrantes por Sala (Capacidad Máxima)**
Cada sala cuenta con una capacidad máxima innegociable de músicos simultáneos por motivos de aislamiento acústico y seguridad:
- **Sala Abbey (Acústica / Trío-Cuarteto)**: máximo **4 personas**.
- **Sala Electric (Banda Estándar)**: máximo **8 personas**.
- **Sala Stadium (Big Band / Orquesta / Escenario)**: máximo **15 personas**.
Si una solicitud de reserva indica un número de asistentes mayor al límite de la sala seleccionada, el sistema rechaza la operación inmediatamente con error 400.

### **RN3: Duración y Bloques de Reserva Permitidos**
- Duración mínima de reserva: **1 hora (60 minutos)**.
- Duración máxima continua: **4 horas (240 minutos)** por cliente por sala en un mismo día.
- Granularidad de horarios: Las reservas inician y finalizan en bloques múltiplos de **30 minutos** (ej.: 14:00, 14:30, 15:00, 15:30).

### **RN4: Franjas Tarifarias Dinámicas, Recargos y Cálculo de Seña**
- **Tarifas Base por Hora**:
  - Sala Abbey: **\$12.000 / hora**.
  - Sala Electric: **\$18.000 / hora**.
  - Sala Stadium: **\$28.000 / hora**.
- **Franja Diurna / Off-Peak (10:00 a 16:00 hs)**: Aplica un **20% de descuento** sobre el costo base de la sala para las fracciones horarias comprendidas en este rango.
- **Franja Tarde / Prime (16:00 a 22:00 hs)**: Tarifa estándar base (100%).
- **Franja Nocturna / Late-Night (22:00 a 02:00 hs)**: Aplica un **25% de recargo nocturno** sobre las fracciones comprendidas en este rango.
- **Recargo de Fin de Semana (Sábados y Domingos)**: Aplica un **15% de recargo adicional** sobre el total de la sala para toda reserva efectuada durante sábados o domingos.
- **Cálculo de Seña Requerida**: Para confirmar cualquier reserva, el cliente debe abonar en concepto de seña exactamente el **30% del presupuesto total** (sala + equipamiento adicional). El saldo del **70% restante** se abona presencialmente en el Check-in.

### **RN5: Política Escalonada de Cancelación y Reintegro de Seña**
El porcentaje de reintegro de la seña pagada al cancelar una reserva se liquida de acuerdo con la antelación temporal respecto a la hora pactada de inicio:
- **Antelación mayor a 48 horas (> 48h)**: Reintegro del **100% de la seña**.
- **Antelación entre 24 y 48 horas (24h - 48h)**: Reintegro del **50% de la seña** (50% de penalidad/retención administrativa).
- **Antelación menor a 24 horas (< 24h)** o No-Show: Reintegro del **0%** (retención del 100% de la seña).

### **RN6: Prevención Estricta de Solapamiento de Horarios (Detección de Colisiones)**
Ninguna sala puede aceptar dos reservas coincidentes en el tiempo.
Se produce colisión si:
`Nueva_Inicio < Existente_FinConBuffer` Y `Nueva_FinConBuffer > Existente_Inicio`.
Donde:
`FinConBuffer = hora_fin + 15 minutos`.

### **RN7: Control de Inventario Compartido de Equipamiento Adicional**
El catálogo de equipamiento extra cuenta con un stock global limitado que se comparte entre todas las salas:
- **Batería Mapex Pro Serie Especial**: 1 unidad (Costo: \$5.000/hora).
- **Micrófono Shure SM7B Vocal Studio**: 2 unidades (Costo: \$2.500/hora por unidad).
- **Cabezal Valvular Marshall JCM800**: 2 unidades (Costo: \$4.000/hora por unidad).
- **Sintetizador Analógico Korg Minilogue**: 1 unidad (Costo: \$3.500/hora).
Si para el rango horario solicitado `[inicio, fin + 15 min]` no hay stock disponible de la cantidad solicitada de un equipo, la reserva con dicho accesorio no puede procesarse.

### **RN8: Ciclo de Vida y Transición Determinística de Estados**
Una reserva transita exclusivamente por los siguientes estados:
- `PENDIENTE`: Creada pero aguardando confirmación de seña.
- `CONFIRMADA`: Seña del 30% pagada y registrada. Horario bloqueado.
- `EN_CURSO`: Check-in realizado en recepción. Permitido desde **15 min antes** y hasta **30 min después** de la hora de inicio acordada. Se marca el saldo restante como cobrado.
- `COMPLETADA`: Check-out realizado con éxito al término del turno.
- `CANCELADA`: Cancelada por el usuario o administrador con liquidación de reembolso según RN5.
- `NO_SHOW`: Marcada por el operador si pasaron 30 min del inicio sin asistencia.

---

## 3. Historias de Usuario (HU) con Criterios de Aceptación (Dado / Cuando / Entonces)

### **HU-01: Cotizar y Reservar Sala con Franja Horaria y Descuento/Recargo**
- **Reglas cubiertas**: RN1, RN3, RN4, RN6.
- **Como** músico independiente,
- **Quiero** seleccionar una sala, fecha y rango horario para ensayar,
- **Para** obtener una cotización transparente con los descuentos o recargos correspondientes y reservar mi lugar.
- **Criterios de Aceptación**:
  - **Escenario 1 (Descuento Off-Peak)**:
    - *Dado* que la Sala Electric cuesta \$18.000/h y el cliente solicita 2 horas un día miércoles de 11:00 a 13:00 (franja diurna 10:00-16:00),
    - *Cuando* solicita la cotización,
    - *Entonces* el sistema aplica el 20% de descuento ($18.000 * 0.8 = $14.400/h), arrojando un total de \$28.800 y una seña del 30% de \$8.640.
  - **Escenario 2 (Recargo de Fin de Semana y Nocturno)**:
    - *Dado* que la Sala Abbey cuesta \$12.000/h y el cliente solicita 2 horas un sábado de 22:00 a 24:00 (franja nocturna y fin de semana),
    - *Cuando* solicita la cotización,
    - *Entonces* el sistema aplica el 25% de recargo nocturno (\$15.000/h) y el 15% de recargo de fin de semana sobre el subtotal, calculando la seña del 30% sobre el total acumulado.
  - **Escenario 3 (Rechazo por duración fuera de límites)**:
    - *Dado* que el cliente intenta reservar 5 horas continuas o 30 minutos,
    - *Cuando* envía la solicitud,
    - *Entonces* el sistema rechaza la reserva indicando que la duración debe ser de entre 1 y 4 horas.

### **HU-02: Rechazo Automático de Reserva por Violación del Buffer Técnico**
- **Reglas cubiertas**: RN1, RN6.
- **Como** administrador del estudio,
- **Quiero** que el sistema impida reservas consecutivas sin intervalo,
- **Para** garantizar los 15 minutos necesarios de ventilación y calibración.
- **Criterios de Aceptación**:
  - **Escenario 1 (Colisión directa de buffer)**:
    - *Dado* que existe una reserva en la Sala Electric de 18:00 a 20:00 (con buffer técnico hasta las 20:15),
    - *Cuando* otro cliente solicita reservar la misma sala de 20:00 a 22:00,
    - *Entonces* el sistema rechaza la solicitud indicando colisión por buffer técnico y sugiere como primer horario libre las 20:15.

### **HU-03: Validación Estricta de Capacidad de Integrantes**
- **Reglas cubiertas**: RN2.
- **Como** administrador del estudio,
- **Quiero** que se valide el número de músicos al momento de reservar,
- **Para** evitar la saturación de salas reducidas.
- **Criterios de Aceptación**:
  - **Escenario 1 (Capacidad excedida)**:
    - *Dado* que la Sala Abbey tiene un aforo máximo de 4 personas,
    - *Cuando* un grupo de 6 músicos intenta reservarla,
    - *Entonces* el sistema rechaza la reserva y recomienda seleccionar la Sala Electric (hasta 8 personas) o Stadium (hasta 15 personas).

### **HU-04: Alquiler de Equipamiento Compartido con Validación de Stock**
- **Reglas cubiertas**: RN7.
- **Como** guitarrista de una banda,
- **Quiero** agregar al alquiler un amplificador Marshall valvular para mi sesión,
- **Para** contar con equipamiento profesional sin tener que trasladarlo.
- **Criterios de Aceptación**:
  - **Escenario 1 (Stock disponible)**:
    - *Dado* que hay 2 cabezales Marshall en stock y solo 1 está asignado en esa franja horaria,
    - *Cuando* el usuario selecciona 1 cabezal Marshall,
    - *Entonces* el sistema lo añade al presupuesto sumando \$4.000 por hora y reserva la unidad para ese turno.
  - **Escenario 2 (Stock agotado)**:
    - *Dado* que las 2 unidades de Marshall ya se encuentran reservadas para ese horario,
    - *Cuando* el usuario intenta seleccionarlo,
    - *Entonces* el sistema muestra el equipo como "Agotado en este horario" y no permite confirmar la reserva con dicho accesorio.

### **HU-05: Cancelación de Turno y Liquidación Escalonada de Seña**
- **Reglas cubiertas**: RN5, RN8.
- **Como** cliente que reservó un turno y tuvo un imprevisto,
- **Quiero** cancelar mi reserva mediante mi código `SB-XXXX`,
- **Para** liberar la sala y conocer el reintegro de mi seña de acuerdo con la política del estudio.
- **Criterios de Aceptación**:
  - **Escenario 1 (Aviso con más de 48 horas)**:
    - *Dado* que faltan 72 horas para el inicio del turno y la seña abonada fue de \$9.000,
    - *Cuando* el cliente confirma la cancelación,
    - *Entonces* el estado cambia a `CANCELADA`, se devuelve el 100% (\$9.000) y la sala queda inmediatamente disponible.
  - **Escenario 2 (Aviso entre 24 y 48 horas)**:
    - *Dado* que faltan 30 horas para el inicio y la seña fue de \$9.000,
    - *Cuando* el cliente cancela,
    - *Entonces* se reintegra el 50% (\$4.500) y se retiene el 50% (\$4.500) en concepto de penalidad.
  - **Escenario 3 (Aviso con menos de 24 horas)**:
    - *Dado* que faltan 8 horas para el inicio,
    - *Cuando* el cliente cancela,
    - *Entonces* se reintegra el 0% (\$0) y se retiene el 100% de la seña.

### **HU-06: Check-in y Cobro de Saldo Presencial**
- **Reglas cubiertas**: RN4, RN8.
- **Como** sonidista del estudio,
- **Quiero** registrar el arribo de la banda mediante el código de reserva,
- **Para** pasar la reserva a estado `EN_CURSO` y registrar el cobro del 70% restante.
- **Criterios de Aceptación**:
  - **Escenario 1 (Check-in a tiempo)**:
    - *Dado* que la reserva inicia a las 18:00 y son las 17:50 (dentro de los 15 min de tolerancia previa),
    - *Cuando* el operador presiona "Realizar Check-in",
    - *Entonces* el estado cambia a `EN_CURSO` y se muestra el saldo remanente a cobrar.

---

## 4. Casos Borde Contemplados

1. **Reserva cruzada de medianoche**: Una reserva de 23:00 a 01:00 abarca dos días cronológicos; el cálculo de franja nocturna opera correctamente sumando las horas de recargo correspondientes.
2. **Buffer que cruza el horario de cierre**: Si una reserva termina a las 01:45, su buffer de 15 minutos llega a las 02:00 (cierre del estudio). Es válida porque el personal permanece hasta el cierre.
3. **Peticiones concurrentes idénticas**: Dos clientes intentan reservar simultáneamente el mismo turno. El servicio evalúa la disponibilidad de forma atómica; el primero confirma y el segundo recibe error 409 con el detalle de solapamiento.
4. **Cancelación de una reserva ya en curso o cancelada**: El sistema impide transiciones inválidas de estado lanzando excepción y manteniendo la integridad de la base de datos.
5. **Cantidad de asistentes igual a 0 o negativa**: Validado en el payload de entrada con rechazo inmediato con código 400.

---

## 5. Sección de Pendientes

- **Estado de pendientes**: **0 pendientes (Sección cerrada)**.
- Todos los puntos de negocio, montos, porcentajes, capacidades, duraciones y tolerancias han sido definidos con cifras exactas y consensuadas sin cabos sueltos.

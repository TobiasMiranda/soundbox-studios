# Preguntas Abiertas del Proyecto (preguntas-abiertas.md)

Este documento registra las dudas analizadas durante el proceso de especificación, la regla de negocio que afectaron, su nivel de impacto (ordenadas de mayor a menor) y la resolución adoptada para cerrar la especificación sin ambigüedades.

---

### PA-01: Manejo de reservas que abarcan múltiples franjas horarias (Cruces de franja)
- **Regla afectada**: RN4 (Franjas Tarifarias Dinámicas).
- **Impacto**: **Alto** (Afecta directamente el cálculo del precio, la facturación del negocio y la confianza del usuario en el desglose).
- **Duda inicial**: Si una banda reserva de 15:00 a 17:00, ¿se cobra todo con descuento Off-Peak (15:00-16:00), todo a tarifa Prime (16:00-17:00), o se prorratea hora por hora?
- **Resolución**: **Prorrateo horario estricto por bloques de 30 minutos**. Cada bloque de 30 minutos se tarifará según la franja horaria en la que caiga su inicio. En el ejemplo: 15:00 a 16:00 se factura con el 20% de descuento off-peak, y 16:00 a 17:00 se factura a tarifa estándar. Queda transparente en el desglose final.
- **Estado**: Resuelto y documentado en la spec.

---

### PA-02: Disponibilidad de equipamiento compartido durante el buffer técnico
- **Regla afectada**: RN7 (Stock Compartido de Equipamiento) y RN1 (Buffer Técnico).
- **Impacto**: **Alto** (Riesgo de comprometer el mismo micrófono o amplificador en dos salas contiguas si una banda se demora en desconectar).
- **Duda inicial**: ¿El equipamiento extra se considera liberado apenas termina la reserva o queda bloqueado también durante los 15 minutos de buffer de la sala?
- **Resolución**: **El equipamiento extra permanece bloqueado durante todo el turno y sus 15 minutos de buffer técnico**. El sonidista necesita esos 15 minutos para guardar el micrófono o trasladar el amplificador a la otra sala y comprobar su funcionamiento antes del próximo turno.
- **Estado**: Resuelto y codificado en las funciones de solapamiento.

---

### PA-03: Cálculo de antelación para la política de cancelación ante cambios de horario
- **Regla afectada**: RN5 (Política Escalonada de Cancelación y Reintegro).
- **Impacto**: **Medio** (Afecta el monto monetario a devolver y posibles reclamos de clientes).
- **Duda inicial**: ¿El cálculo de las 48h o 24h previas se hace contra la hora exacta de inicio de la reserva o contra las 00:00 del día del turno?
- **Resolución**: Se calcula con **precisión de milisegundos contra la fecha y hora exacta pactada de inicio de la reserva** (`startTime - cancelRequestTime >= 48 hours`). Si la diferencia es de 47 horas y 59 minutos, corresponde el tramo de 24 a 48 hs (50% de retención).
- **Estado**: Resuelto e implementado en el motor de cancelación.

---

### PA-04: Tolerancia horaria para el Check-in y declaración de No-Show
- **Regla afectada**: RN8 (Ciclo de Vida y Transición de Estados).
- **Impacto**: **Bajo** (Gestión operativa en recepción del estudio).
- **Duda inicial**: ¿Hasta cuántos minutos puede demorarse una banda antes de liberar la sala para otros o darla por perdida?
- **Resolución**: La banda puede ingresar desde **15 minutos antes** de su turno y hasta **30 minutos después**. Pasados 30 minutos sin presentación ni aviso al estudio, el operador puede marcar la reserva como `NO_SHOW` (asimilable a cancelación con 0% de reintegro), quedando la sala libre para ser contratada de urgencia.
- **Estado**: Resuelto en la máquina de estados.

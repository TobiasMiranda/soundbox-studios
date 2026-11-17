# Documento de Idea: SoundBox Studios
**Sistema Inteligente de Gestión y Reserva de Salas de Ensayo y Estudio de Grabación**

## 1. Descripción del Problema
Los estudios de ensayo y grabación de mediana escala suelen gestionar sus reservas de forma manual (mediante chats de WhatsApp, planillas de cálculo o cuadernos de papel). Esta modalidad ocasiona errores recurrentes y pérdidas económicas:
- **Solapamientos de bandas**: una banda llega mientras otra todavía está desalojando la sala, provocando demoras y quejas.
- **Falta de tiempo técnico de calibración y sanitización**: los sonidistas no cuentan con tiempo entre turnos para acomodar cables, micrófonos y ventilar la sala, degradando la calidad acústica y la higiene.
- **Capacidades excedidas**: grupos musicales numerosos ingresan a salas pequeñas destinadas a tríos o cuartetos, desgastando el equipamiento y generando saturación acústica.
- **Conflictos con equipamiento compartido**: dos salas alquilan al mismo tiempo el único amplificador valvular o micrófono de estudio de gama alta disponible en el inventario del estudio.
- **Cancelaciones de último momento sin compensación**: bandas que avisan dos horas antes que no asisten, dejando la sala vacía sin posibilidad de reasignación ni compensación económica.
- **Precios planos ineficientes**: cobro de una tarifa plana sin incentivar horarios valle (mañanas) ni compensar el costo operativo de las horas nocturnas y fines de semana.

## 2. Lo que pidió el Cliente (Requerimiento Original Limpio)
El dueño de **SoundBox Studios**, un complejo musical con 3 salas profesionales y equipamiento de alta gama, solicita una plataforma web centralizada con dos perfiles de uso:
1. **Músicos / Bandas (Público)**:
   - Visualizar las salas disponibles con su capacidad máxima, equipamiento base y fotos/especificaciones.
   - Seleccionar fecha y franja horaria para reservar en bloques de tiempo permitidos.
   - Agregar equipamiento especial adicional (micrófonos premium, amplificadores valvulares, sintetizadores) con control de stock automático en tiempo real.
   - Obtener un presupuesto instantáneo y transparente que aplique descuentos por horario matutino o recargos por horario nocturno/fin de semana.
   - Pagar la seña del 30% para confirmar la reserva y recibir un código alfanumérico único de seguimiento.
   - Consultar el estado de su reserva y, en caso de fuerza mayor, cancelarla conociendo con exactitud el porcentaje de seña reembolsado según la anticipación del aviso.

2. **Administración / Sonidistas del Estudio**:
   - Visualizar la agenda diaria y semanal en formato de línea de tiempo interactiva donde se aprecie claramente el bloque de ensayo y el **buffer técnico obligatorio de 15 minutos** posterior a cada turno.
   - Realizar el check-in cuando la banda arriba al estudio y registrar el pago del saldo restante (70%).
   - Monitorear el inventario de equipamiento alquilado por sala para evitar roturas o pérdidas.
   - Validar métricas de ocupación y estado de cada sala.

## 3. Alcance del Proyecto
### Incluido en este desarrollo:
- Catálogo de salas con sus especificaciones, capacidad y equipamiento base.
- Motor de validación horaria con regla estricta de buffer técnico (15 min) entre reservas.
- Algoritmo de cálculo dinámico de tarifas según franja horaria (Off-Peak, Prime, Night) y recargo por fin de semana.
- Límite de capacidad estricta por sala (rechazo de reservas con exceso de integrantes).
- Control de stock de equipamiento compartido entre salas.
- Sistema de seña (30%) y simulador/ejecutor de cancelación escalonada (>48h: 100%, 24-48h: 50%, <24h: 0%).
- API REST documentada y probada exhaustivamente con tests automáticos unitarios y de integración.
- Frontend React responsivo, moderno, temático de estudio musical, con todas las pantallas funcionales y un panel interactivo de verificación de reglas de negocio para el evaluador.

### Fuera de alcance (para versiones posteriores / no exigido):
- Pasarela de pago bancaria real externa (se simula el registro de pago y confirmación de seña mediante token).
- Envío de correos electrónicos transaccionales reales mediante SMTP externo (no exigido según consigna 3.2).
- Gestión de usuarios con roles multi-tenant complejos.

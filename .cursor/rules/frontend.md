# Rol de Agente: Desarrollador Frontend (.cursor/rules/frontend.md)

## Identidad y Propósito
Eres el **Desarrollador Frontend** de SoundBox Studios. Tu misión es construir una aplicación web moderna, responsiva, atractiva e intuitiva con React, TypeScript y Vite, brindando a músicos y administradores una experiencia de usuario fluida y transparente.

## Principios y Responsabilidades
1. **Todas las Pantallas Funcionales**: La aplicación debe contar con todas las vistas operativas:
   - Catálogo de salas con aforo y detalles de equipamiento.
   - Formulario de cotización y reserva con cálculo reactivo inmediato de descuentos, recargos y seña del 30%.
   - Consulta y gestión de reservas con código, con botón de Check-in y simulador de cancelación que exhibe el reembolso en tiempo real.
   - Panel de administración con visualización explícita del **buffer técnico de 15 minutos** entre bloques de ensayo.
   - Panel interactivo de verificación de Reglas de Negocio (RN1 a RN8) para demostración evaluativa.
2. **Experiencia de Usuario Transparente**: Desglosar con claridad al usuario cómo se compone el total: precio base, descuento diurno (-20%), recargo nocturno (+25%), adicional fin de semana (+15%) y equipamiento extra.
3. **Consumo Robusto de la API**: Manejo de estados de carga (loading), errores con alertas amigables y reintentos ante desconexiones.
4. **Diseño Temático Profesional**: Estética cuidada de estudio musical (paleta oscura, acentos lumínicos neón, tipografía legible y diseño adaptable a móviles y escritorios).

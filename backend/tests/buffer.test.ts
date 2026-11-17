import { describe, it, expect } from 'vitest';
import { checkIntervalCollision, timeStringToMinutes, minutesToTimeString, TECHNICAL_BUFFER_MINUTES } from '../src/domain/buffer.js';
import { validateSlotAvailability } from '../src/domain/collision.js';

describe('RN1 & RN6: Buffer Técnico de 15 Minutos y Prevención de Solapamientos', () => {
  it('debe convertir correctamente strings HH:mm a minutos y viceversa', () => {
    expect(timeStringToMinutes('10:00')).toBe(600);
    expect(timeStringToMinutes('18:15')).toBe(1095);
    expect(minutesToTimeString(600)).toBe('10:00');
    expect(minutesToTimeString(1095)).toBe('18:15');
  });

  it('debe permitir reservas consecutivas si se respeta el buffer técnico de 15 minutos', () => {
    // Reserva previa de 18:00 a 20:00 (Buffer termina 20:15)
    // Nueva reserva de 20:15 a 22:00
    const result = checkIntervalCollision('20:15', '22:00', '18:00', '20:00');
    expect(result.collides).toBe(false);
  });

  it('debe rechazar reservas que inicien inmediatamente al terminar el turno anterior sin buffer', () => {
    // Reserva previa de 18:00 a 20:00 (Buffer termina 20:15)
    // Nueva reserva intenta arrancar 20:00 a 22:00 (colisión directa con el buffer)
    const result = checkIntervalCollision('20:00', '22:00', '18:00', '20:00');
    expect(result.collides).toBe(true);
    expect(result.reason).toContain('buffer técnico de 15 minutos');
    expect(result.suggestedNextAvailable).toBe('20:15');
  });

  it('debe rechazar reservas que se solapen directamente en horario', () => {
    // Reserva previa de 18:00 a 20:00
    // Nueva reserva intenta 19:00 a 21:00
    const result = checkIntervalCollision('19:00', '21:00', '18:00', '20:00');
    expect(result.collides).toBe(true);
    expect(result.reason).toContain('superpone con un turno ya reservado');
  });

  it('debe permitir reservas si la anterior fue cancelada', () => {
    const existing = [
      { id: '1', startTime: '18:00', endTime: '20:00', status: 'CANCELADA' }
    ];
    const availability = validateSlotAvailability('18:00', '20:00', existing);
    expect(availability.available).toBe(true);
  });

  it('debe rechazar si colisiona con cualquier reserva activa en la lista', () => {
    const existing = [
      { id: '1', startTime: '14:00', endTime: '16:00', status: 'CONFIRMADA' },
      { id: '2', startTime: '18:00', endTime: '20:00', status: 'CONFIRMADA' }
    ];
    // Intenta 15:30 a 17:30 (colisiona con id 1)
    const availability = validateSlotAvailability('15:30', '17:30', existing);
    expect(availability.available).toBe(false);
  });
});

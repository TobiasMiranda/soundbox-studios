import { describe, it, expect } from 'vitest';
import { canTransitionStatus, canCheckIn } from '../src/domain/status.js';

describe('RN8 & HU06: Ciclo de Vida y Transiciones de Estado', () => {
  it('debe permitir transiciones válidas de estado', () => {
    expect(canTransitionStatus('PENDIENTE', 'CONFIRMADA')).toBe(true);
    expect(canTransitionStatus('CONFIRMADA', 'EN_CURSO')).toBe(true);
    expect(canTransitionStatus('EN_CURSO', 'COMPLETADA')).toBe(true);
    expect(canTransitionStatus('CONFIRMADA', 'CANCELADA')).toBe(true);
  });

  it('debe bloquear transiciones ilegales de estado', () => {
    expect(canTransitionStatus('COMPLETADA', 'PENDIENTE')).toBe(false);
    expect(canTransitionStatus('CANCELADA', 'EN_CURSO')).toBe(false);
    expect(canTransitionStatus('PENDIENTE', 'COMPLETADA')).toBe(false);
  });

  it('debe validar la tolerancia horaria para realizar el Check-in (15 min antes a 30 min después)', () => {
    const reservationDate = '2026-11-20';
    const startTime = '18:00';

    // 10 minutos antes (17:50): Permitido
    const check1 = canCheckIn(reservationDate, startTime, new Date('2026-11-20T17:50:00'));
    expect(check1.allowed).toBe(true);

    // 20 minutos después (18:20): Permitido
    const check2 = canCheckIn(reservationDate, startTime, new Date('2026-11-20T18:20:00'));
    expect(check2.allowed).toBe(true);

    // Demasiado temprano: 45 minutos antes (17:15)
    const checkEarly = canCheckIn(reservationDate, startTime, new Date('2026-11-20T17:15:00'));
    expect(checkEarly.allowed).toBe(false);
    expect(checkEarly.reason).toContain('El Check-in se habilita 15 minutos antes');

    // Demasiado tarde: 45 minutos después (18:45)
    const checkLate = canCheckIn(reservationDate, startTime, new Date('2026-11-20T18:45:00'));
    expect(checkLate.allowed).toBe(false);
    expect(checkLate.reason).toContain('tiempo límite para realizar el Check-in');
  });
});

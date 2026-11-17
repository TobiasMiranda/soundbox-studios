import { describe, it, expect } from 'vitest';
import { calculateCancellationRefund } from '../src/domain/cancellation.js';

describe('RN5 & HU05: Política Escalonada de Cancelación y Reintegro de Seña', () => {
  const deposit = 9000;
  const eventDate = '2026-11-20';
  const eventStartTime = '18:00';

  it('debe reintegrar el 100% de la seña si se cancela con más de 48 horas de antelación', () => {
    // 72 horas antes (2026-11-17 a las 18:00)
    const cancelTime = new Date('2026-11-17T18:00:00');
    const result = calculateCancellationRefund({
      date: eventDate,
      startTime: eventStartTime,
      depositAmount: deposit,
      cancellationDate: cancelTime,
    });

    expect(result.eligible).toBe(true);
    expect(result.refundPercentage).toBe(100);
    expect(result.refundAmount).toBe(9000);
    expect(result.penaltyAmount).toBe(0);
    expect(result.hoursUntilStart).toBe(72);
  });

  it('debe reintegrar el 50% de la seña si se cancela entre 24 y 48 horas de antelación', () => {
    // 36 horas antes (2026-11-19 a las 06:00)
    const cancelTime = new Date('2026-11-19T06:00:00');
    const result = calculateCancellationRefund({
      date: eventDate,
      startTime: eventStartTime,
      depositAmount: deposit,
      cancellationDate: cancelTime,
    });

    expect(result.eligible).toBe(true);
    expect(result.refundPercentage).toBe(50);
    expect(result.refundAmount).toBe(4500);
    expect(result.penaltyAmount).toBe(4500);
    expect(result.hoursUntilStart).toBe(36);
  });

  it('debe retener el 100% de la seña (0% reintegro) si se cancela con menos de 24 horas', () => {
    // 8 horas antes (2026-11-20 a las 10:00)
    const cancelTime = new Date('2026-11-20T10:00:00');
    const result = calculateCancellationRefund({
      date: eventDate,
      startTime: eventStartTime,
      depositAmount: deposit,
      cancellationDate: cancelTime,
    });

    expect(result.eligible).toBe(true);
    expect(result.refundPercentage).toBe(0);
    expect(result.refundAmount).toBe(0);
    expect(result.penaltyAmount).toBe(9000);
    expect(result.hoursUntilStart).toBe(8);
  });

  it('debe rechazar cancelaciones cuando el horario pactado ya inició o transcurrió', () => {
    // 1 hora después del inicio (2026-11-20 a las 19:00)
    const cancelTime = new Date('2026-11-20T19:00:00');
    const result = calculateCancellationRefund({
      date: eventDate,
      startTime: eventStartTime,
      depositAmount: deposit,
      cancellationDate: cancelTime,
    });

    expect(result.eligible).toBe(false);
    expect(result.refundAmount).toBe(0);
    expect(result.message).toContain('ya ha transcurrido');
  });
});

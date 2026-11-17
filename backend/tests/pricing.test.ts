import { describe, it, expect } from 'vitest';
import { validateDurationAndSlots } from '../src/domain/duration.js';
import { calculateQuote, isWeekend } from '../src/domain/pricing.js';
import { Room, Equipment } from '../src/domain/types.js';

const mockRooms: Record<string, Room> = {
  abbey: {
    id: 'room-abbey',
    name: 'Sala Abbey',
    type: 'acustica',
    capacity: 4,
    hourlyRate: 12000,
    description: 'Sala acústica para cuartetos',
    includedGear: ['Batería acústica', 'PA'],
  },
  electric: {
    id: 'room-electric',
    name: 'Sala Electric',
    type: 'estandar',
    capacity: 8,
    hourlyRate: 18000,
    description: 'Sala estándar',
    includedGear: ['Batería', 'Marshall', 'Ampeg'],
  },
};

const mockCatalog: Equipment[] = [
  {
    id: 'eq-shure-sm7b',
    name: 'Micrófono Shure SM7B',
    category: 'microfono',
    totalStock: 2,
    hourlyPrice: 2500,
    description: 'Micrófono de estudio',
  },
];

describe('RN3: Validación de Duración y Bloques', () => {
  it('debe rechazar duraciones menores a 60 minutos (ej. 30 min)', () => {
    const result = validateDurationAndSlots('14:00', '14:30');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('mínima es de 1 hora');
  });

  it('debe rechazar duraciones mayores a 4 horas (ej. 5 horas)', () => {
    const result = validateDurationAndSlots('14:00', '19:00');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('máxima permitida es de 4 horas');
  });

  it('debe rechazar horarios que no sean múltiplos de 30 minutos', () => {
    const result = validateDurationAndSlots('14:10', '16:10');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('bloques de 30 minutos');
  });

  it('debe aceptar duraciones válidas entre 1 y 4 horas en múltiplos de 30 min', () => {
    const result = validateDurationAndSlots('14:00', '16:00');
    expect(result.valid).toBe(true);
    expect(result.durationHours).toBe(2);
  });
});

describe('RN4: Tarifas Dinámicas y Seña del 30%', () => {
  it('debe aplicar 20% de descuento en horario Off-Peak (11:00 a 13:00 día de semana)', () => {
    // Sala Electric: $18.000/h. 2 horas = $36.000 base. Con 20% off = $28.800.
    // Seña 30% de 28.800 = 8.640. Saldo restante = 20.160.
    const quote = calculateQuote({
      room: mockRooms.electric,
      date: '2026-11-18', // Miércoles (día de semana)
      startTime: '11:00',
      endTime: '13:00',
    });

    expect(quote.durationHours).toBe(2);
    expect(quote.subtotalBase).toBe(36000);
    expect(quote.offPeakDiscount).toBe(7200); // 20% de 36.000
    expect(quote.subtotalRoom).toBe(28800);
    expect(quote.totalPrice).toBe(28800);
    expect(quote.depositAmount).toBe(8640);
    expect(quote.remainingBalance).toBe(20160);
  });

  it('debe aplicar 25% de recargo en horario Nocturno (22:00 a 24:00)', () => {
    // Sala Abbey: $12.000/h. 2 horas = $24.000 base. Con 25% recargo = $30.000.
    const quote = calculateQuote({
      room: mockRooms.abbey,
      date: '2026-11-18', // Miércoles
      startTime: '22:00',
      endTime: '24:00',
    });

    expect(quote.lateNightSurcharge).toBe(6000);
    expect(quote.subtotalRoom).toBe(30000);
    expect(quote.depositAmount).toBe(9000); // 30% de 30.000
  });

  it('debe aplicar 15% adicional por Fin de Semana (Sábado o Domingo)', () => {
    expect(isWeekend('2026-11-21')).toBe(true); // Sábado
    // Sala Abbey: $12.000/h * 2h (18:00 a 20:00 Prime) = $24.000.
    // Fin de semana +15% = 24000 * 0.15 = 3.600 -> Total $27.600.
    const quote = calculateQuote({
      room: mockRooms.abbey,
      date: '2026-11-21', // Sábado
      startTime: '18:00',
      endTime: '20:00',
    });

    expect(quote.weekendSurcharge).toBe(3600);
    expect(quote.subtotalRoom).toBe(27600);
    expect(quote.depositAmount).toBe(Math.round(27600 * 0.3));
  });

  it('debe calcular correctamente equipamiento adicional y sumarlo a la seña', () => {
    // 2 horas en Prime un miércoles: $24.000.
    // 1 Micrófono Shure SM7B ($2.500/h * 2h) = $5.000.
    // Total = $29.000. Seña 30% = $8.700.
    const quote = calculateQuote({
      room: mockRooms.abbey,
      date: '2026-11-18',
      startTime: '18:00',
      endTime: '20:00',
      selectedEquipment: [{ equipmentId: 'eq-shure-sm7b', quantity: 1 }],
      availableEquipmentCatalog: mockCatalog,
    });

    expect(quote.subtotalRoom).toBe(24000);
    expect(quote.subtotalEquipment).toBe(5000);
    expect(quote.totalPrice).toBe(29000);
    expect(quote.depositAmount).toBe(8700);
    expect(quote.remainingBalance).toBe(20300);
  });
});

import { describe, it, expect } from 'vitest';
import { checkEquipmentAvailability } from '../src/domain/equipment.js';
import { Equipment } from '../src/domain/types.js';

const mockCatalog: Equipment[] = [
  {
    id: 'eq-shure-sm7b',
    name: 'Micrófono Shure SM7B',
    category: 'microfono',
    totalStock: 2,
    hourlyPrice: 2500,
    description: 'Micrófono dinámico',
  },
  {
    id: 'eq-marshall-jcm800',
    name: 'Cabezal Valvular Marshall JCM800',
    category: 'amplificador',
    totalStock: 2,
    hourlyPrice: 4000,
    description: 'Cabezal 100W valvular',
  },
];

describe('RN7 & HU04: Control de Stock de Equipamiento Compartido', () => {
  it('debe permitir la reserva si hay stock suficiente en el catálogo y sin colisiones', () => {
    const result = checkEquipmentAvailability({
      date: '2026-11-20',
      startTime: '18:00',
      endTime: '20:00',
      selectedEquipment: [{ equipmentId: 'eq-marshall-jcm800', quantity: 1 }],
      catalog: mockCatalog,
      activeReservations: [],
    });

    expect(result.available).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('debe rechazar si la cantidad solicitada supera el stock total del estudio', () => {
    // Pide 3 Marshall cuando solo hay 2 en todo el estudio
    const result = checkEquipmentAvailability({
      date: '2026-11-20',
      startTime: '18:00',
      endTime: '20:00',
      selectedEquipment: [{ equipmentId: 'eq-marshall-jcm800', quantity: 3 }],
      catalog: mockCatalog,
      activeReservations: [],
    });

    expect(result.available).toBe(false);
    expect(result.errors[0]).toContain('supera el stock total');
  });

  it('debe rechazar si las unidades disponibles están comprometidas en otra sala en el mismo horario', () => {
    // Otra banda ya reservó 2 Shure SM7B de 18:00 a 20:00
    const activeReservations = [
      {
        id: 'res-1',
        date: '2026-11-20',
        startTime: '18:00',
        endTime: '20:00',
        status: 'CONFIRMADA',
        selectedEquipment: [{ equipmentId: 'eq-shure-sm7b', quantity: 2 }],
      },
    ];

    // Nueva reserva intenta pedir 1 Shure de 19:00 a 21:00
    const result = checkEquipmentAvailability({
      date: '2026-11-20',
      startTime: '19:00',
      endTime: '21:00',
      selectedEquipment: [{ equipmentId: 'eq-shure-sm7b', quantity: 1 }],
      catalog: mockCatalog,
      activeReservations,
    });

    expect(result.available).toBe(false);
    expect(result.errors[0]).toContain('Stock insuficiente para "Micrófono Shure SM7B"');
  });
});

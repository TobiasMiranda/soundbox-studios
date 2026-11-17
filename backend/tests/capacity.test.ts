import { describe, it, expect } from 'vitest';
import { validateCapacity } from '../src/domain/capacity.js';
import { Room } from '../src/domain/types.js';

const mockRooms: Record<string, Room> = {
  abbey: {
    id: 'room-abbey',
    name: 'Sala Abbey',
    type: 'acustica',
    capacity: 4,
    hourlyRate: 12000,
    description: 'Sala acústica',
    includedGear: [],
  },
  electric: {
    id: 'room-electric',
    name: 'Sala Electric',
    type: 'estandar',
    capacity: 8,
    hourlyRate: 18000,
    description: 'Sala estándar',
    includedGear: [],
  },
  stadium: {
    id: 'room-stadium',
    name: 'Sala Stadium',
    type: 'escenario',
    capacity: 15,
    hourlyRate: 28000,
    description: 'Sala escenario',
    includedGear: [],
  },
};

describe('RN2 & HU03: Capacidad Máxima y Aforo de Integrantes', () => {
  it('debe aprobar si la cantidad de integrantes no supera la capacidad de la sala', () => {
    const resultAbbey = validateCapacity(mockRooms.abbey, 4);
    expect(resultAbbey.valid).toBe(true);

    const resultElectric = validateCapacity(mockRooms.electric, 8);
    expect(resultElectric.valid).toBe(true);

    const resultStadium = validateCapacity(mockRooms.stadium, 15);
    expect(resultStadium.valid).toBe(true);
  });

  it('debe rechazar si la cantidad de integrantes excede el aforo de la sala', () => {
    // 5 personas en Sala Abbey (máximo 4)
    const result = validateCapacity(mockRooms.abbey, 5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('excede la capacidad máxima permitida de la Sala Abbey (4 personas)');
  });

  it('debe rechazar cantidades inválidas (0 o números negativos o decimales)', () => {
    expect(validateCapacity(mockRooms.electric, 0).valid).toBe(false);
    expect(validateCapacity(mockRooms.electric, -2).valid).toBe(false);
    expect(validateCapacity(mockRooms.electric, 3.5).valid).toBe(false);
  });
});

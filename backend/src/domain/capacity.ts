// RN2: Validador de Capacidad y Aforo de Integrantes

import { Room } from './types.js';

export function validateCapacity(room: Room, attendeesCount: number): {
  valid: boolean;
  maxCapacity: number;
  attendeesCount: number;
  error?: string;
} {
  if (!attendeesCount || attendeesCount <= 0 || !Number.isInteger(attendeesCount)) {
    return {
      valid: false,
      maxCapacity: room.capacity,
      attendeesCount,
      error: 'La cantidad de integrantes debe ser un número entero mayor a 0.',
    };
  }

  if (attendeesCount > room.capacity) {
    return {
      valid: false,
      maxCapacity: room.capacity,
      attendeesCount,
      error: `La cantidad de integrantes (${attendeesCount}) excede la capacidad máxima permitida de la ${room.name} (${room.capacity} personas). Por favor elija una sala de mayor aforo.`,
    };
  }

  return {
    valid: true,
    maxCapacity: room.capacity,
    attendeesCount,
  };
}

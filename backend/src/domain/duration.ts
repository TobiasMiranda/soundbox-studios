// RN3: Validación de Duración y Bloques de Reserva

import { timeStringToMinutes } from './buffer.js';

export const MIN_DURATION_MINUTES = 60; // 1 hora
export const MAX_DURATION_MINUTES = 240; // 4 horas
export const SLOT_GRANULARITY_MINUTES = 30; // Bloques de 30 minutos

export function validateDurationAndSlots(startTime: string, endTime: string): {
  valid: boolean;
  durationMinutes: number;
  durationHours: number;
  error?: string;
} {
  const startMin = timeStringToMinutes(startTime);
  const endMin = timeStringToMinutes(endTime);

  if (startMin % SLOT_GRANULARITY_MINUTES !== 0) {
    return {
      valid: false,
      durationMinutes: 0,
      durationHours: 0,
      error: `La hora de inicio (${startTime}) debe ser en bloques de 30 minutos (ej: 14:00, 14:30).`,
    };
  }

  if (endMin % SLOT_GRANULARITY_MINUTES !== 0) {
    return {
      valid: false,
      durationMinutes: 0,
      durationHours: 0,
      error: `La hora de fin (${endTime}) debe ser en bloques de 30 minutos (ej: 16:00, 16:30).`,
    };
  }

  // Si endMin <= startMin (cruza medianoche ej. 23:00 a 01:00)
  let duration = endMin - startMin;
  if (duration <= 0) {
    duration += 1440; // Turno trasnoche
  }

  if (duration < MIN_DURATION_MINUTES) {
    return {
      valid: false,
      durationMinutes: duration,
      durationHours: duration / 60,
      error: `La duración mínima es de 1 hora (60 minutos). Duración solicitada: ${duration} minutos.`,
    };
  }

  if (duration > MAX_DURATION_MINUTES) {
    return {
      valid: false,
      durationMinutes: duration,
      durationHours: duration / 60,
      error: `La duración máxima permitida es de 4 horas (240 minutos). Duración solicitada: ${duration} minutos.`,
    };
  }

  return {
    valid: true,
    durationMinutes: duration,
    durationHours: duration / 60,
  };
}

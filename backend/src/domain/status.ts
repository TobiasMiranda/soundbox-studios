// RN8: Ciclo de Vida y Transición Determinística de Estados

import { ReservationStatus } from './types.js';

export const VALID_STATUS_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  PENDIENTE: ['CONFIRMADA', 'CANCELADA'],
  CONFIRMADA: ['EN_CURSO', 'CANCELADA', 'NO_SHOW'],
  EN_CURSO: ['COMPLETADA', 'CANCELADA'],
  COMPLETADA: [],
  CANCELADA: [],
  NO_SHOW: [],
};

export function canTransitionStatus(
  currentStatus: ReservationStatus,
  targetStatus: ReservationStatus
): boolean {
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(targetStatus) : false;
}

/**
 * RN8: El Check-in solo se habilita desde 15 minutos antes hasta 30 minutos después
 * de la hora fijada de inicio.
 */
export function canCheckIn(
  date: string,
  startTime: string,
  currentTime: Date = new Date()
): { allowed: boolean; reason?: string } {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

  const diffMs = currentTime.getTime() - startDateTime.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  // Demasiado temprano: antes de 15 minutos previos
  if (diffMinutes < -15) {
    const earlyMins = Math.abs(Math.round(diffMinutes));
    return {
      allowed: false,
      reason: `El Check-in se habilita 15 minutos antes del turno. Faltan ${earlyMins} minutos para la apertura de recepción.`,
    };
  }

  // Demasiado tarde: después de 30 minutos de iniciada la hora
  if (diffMinutes > 30) {
    return {
      allowed: false,
      reason: `El tiempo límite para realizar el Check-in (30 minutos posteriores al inicio) ha expirado. Corresponde registrar No-Show.`,
    };
  }

  return { allowed: true };
}

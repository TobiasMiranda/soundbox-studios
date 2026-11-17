import { checkIntervalCollision, TECHNICAL_BUFFER_MINUTES, timeStringToMinutes, minutesToTimeString } from './buffer.js';

export interface ExistingSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
}

/**
 * RN6: Evalúa si un nuevo turno colisiona con alguna de las reservas activas en la misma fecha y sala.
 * Ignora reservas canceladas o no-show.
 */
export function validateSlotAvailability(
  newStartTime: string,
  newEndTime: string,
  existingReservations: ExistingSlot[]
): { available: boolean; conflictReason?: string; suggestedNextAvailable?: string } {
  // Filtramos solo reservas activas que bloquean la sala
  const activeSlots = existingReservations.filter(
    (res) => res.status !== 'CANCELADA' && res.status !== 'NO_SHOW'
  );

  for (const existing of activeSlots) {
    const result = checkIntervalCollision(
      newStartTime,
      newEndTime,
      existing.startTime,
      existing.endTime
    );

    if (result.collides) {
      return {
        available: false,
        conflictReason: result.reason,
        suggestedNextAvailable: result.suggestedNextAvailable,
      };
    }
  }

  return { available: true };
}

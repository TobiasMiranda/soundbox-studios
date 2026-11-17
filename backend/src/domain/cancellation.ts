// RN5: Política Escalonada de Cancelación y Reintegro de Seña

import { CancellationResult } from './types.js';

export function calculateCancellationRefund(params: {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  depositAmount: number;
  cancellationDate?: Date | string;
}): CancellationResult {
  const { date, startTime, depositAmount, cancellationDate = new Date() } = params;

  // Construir timestamp de inicio de la reserva
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

  const cancelDateTime = typeof cancellationDate === 'string' ? new Date(cancellationDate) : cancellationDate;

  const diffMs = startDateTime.getTime() - cancelDateTime.getTime();
  const hoursUntilStart = diffMs / (1000 * 60 * 60);

  if (hoursUntilStart < 0) {
    return {
      eligible: false,
      hoursUntilStart: Number(hoursUntilStart.toFixed(2)),
      refundPercentage: 0,
      refundAmount: 0,
      penaltyAmount: depositAmount,
      message: 'No es posible cancelar una reserva cuya hora de inicio ya ha transcurrido (No-Show).',
    };
  }

  // Tramo 1: Más de 48 horas de antelación -> 100% reintegro
  if (hoursUntilStart >= 48) {
    return {
      eligible: true,
      hoursUntilStart: Number(hoursUntilStart.toFixed(2)),
      refundPercentage: 100,
      refundAmount: depositAmount,
      penaltyAmount: 0,
      message: `Cancelación con más de 48 hs de antelación (${hoursUntilStart.toFixed(1)} hs). Corresponde reintegro total del 100% de la seña ($${depositAmount}).`,
    };
  }

  // Tramo 2: Entre 24 y 48 horas de antelación -> 50% reintegro
  if (hoursUntilStart >= 24 && hoursUntilStart < 48) {
    const refundAmount = Math.round(depositAmount * 0.5);
    const penaltyAmount = depositAmount - refundAmount;
    return {
      eligible: true,
      hoursUntilStart: Number(hoursUntilStart.toFixed(2)),
      refundPercentage: 50,
      refundAmount,
      penaltyAmount,
      message: `Cancelación con entre 24 y 48 hs de antelación (${hoursUntilStart.toFixed(1)} hs). Corresponde reintegro del 50% ($${refundAmount}) y retención administrativa del 50% ($${penaltyAmount}).`,
    };
  }

  // Tramo 3: Menos de 24 horas de antelación -> 0% reintegro
  return {
    eligible: true,
    hoursUntilStart: Number(hoursUntilStart.toFixed(2)),
    refundPercentage: 0,
    refundAmount: 0,
    penaltyAmount: depositAmount,
    message: `Cancelación con menos de 24 hs de antelación (${hoursUntilStart.toFixed(1)} hs). Aplica retención del 100% de la seña ($${depositAmount}) sin reintegro.`,
  };
}

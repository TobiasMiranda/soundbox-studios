// RN1 & RN6: Gestión del Buffer Técnico (15 minutos) y Detección de Colisiones

export const TECHNICAL_BUFFER_MINUTES = 15;

/**
 * Convierte un string en formato "HH:mm" a minutos desde la medianoche.
 * Ejemplo: "14:30" -> 870
 */
export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (hours === 24 && minutes === 0) {
    return 1440;
  }
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Formato de hora inválido: "${timeStr}". Debe ser HH:mm.`);
  }
  return hours * 60 + minutes;
}

/**
 * Convierte minutos desde la medianoche a formato "HH:mm".
 * Ejemplo: 870 -> "14:30"
 */
export function minutesToTimeString(minutes: number): string {
  const normMinutes = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normMinutes / 60);
  const mins = normMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export interface IntervalWithBuffer {
  startMinutes: number;
  endMinutes: number;
  endMinutesWithBuffer: number;
}

/**
 * Genera el intervalo en minutos agregando el buffer técnico de 15 minutos al final.
 */
export function createIntervalWithBuffer(startTime: string, endTime: string): IntervalWithBuffer {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);

  if (endMinutes <= startMinutes) {
    throw new Error('La hora de fin debe ser posterior a la hora de inicio.');
  }

  return {
    startMinutes,
    endMinutes,
    endMinutesWithBuffer: endMinutes + TECHNICAL_BUFFER_MINUTES,
  };
}

/**
 * Determina si dos intervalos colisionan considerando que toda reserva existente
 * ocupa [start, end + 15 min).
 * 
 * Regla: Colisionan si:
 *   solicitud.start < existente.endWithBuffer  Y  solicitud.endWithBuffer > existente.start
 */
export function checkIntervalCollision(
  requestStart: string,
  requestEnd: string,
  existingStart: string,
  existingEnd: string
): { collides: boolean; reason?: string; suggestedNextAvailable?: string } {
  const req = createIntervalWithBuffer(requestStart, requestEnd);
  const ext = createIntervalWithBuffer(existingStart, existingEnd);

  // Comprobación de solapamiento
  const collides = req.startMinutes < ext.endMinutesWithBuffer && req.endMinutesWithBuffer > ext.startMinutes;

  if (collides) {
    const isInsideBufferOnly = 
      req.startMinutes >= ext.endMinutes && 
      req.startMinutes < ext.endMinutesWithBuffer;

    const reason = isInsideBufferOnly
      ? `El horario solicitado inicia en el buffer técnico de 15 minutos de la reserva previa (finaliza a las ${minutesToTimeString(ext.endMinutesWithBuffer)}).`
      : `El horario solicitado se superpone con un turno ya reservado de ${existingStart} a ${existingEnd} (con buffer técnico hasta las ${minutesToTimeString(ext.endMinutesWithBuffer)}).`;

    return {
      collides: true,
      reason,
      suggestedNextAvailable: minutesToTimeString(ext.endMinutesWithBuffer),
    };
  }

  return { collides: false };
}

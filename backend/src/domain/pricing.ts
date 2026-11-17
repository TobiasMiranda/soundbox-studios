// RN4: Motor de Tarifas Dinámicas y Cálculo de Seña (30%)

import { timeStringToMinutes } from './buffer.js';
import { validateDurationAndSlots } from './duration.js';
import { PricingBreakdown, Room, Equipment, SelectedEquipment } from './types.js';

export const OFF_PEAK_DISCOUNT_PERCENT = 0.20; // 20%
export const LATE_NIGHT_SURCHARGE_PERCENT = 0.25; // 25%
export const WEEKEND_SURCHARGE_PERCENT = 0.15; // 15%
export const DEPOSIT_PERCENT = 0.30; // 30%

export function isWeekend(dateStr: string): boolean {
  // Parsing YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Domingo, 6 = Sábado
}

/**
 * Determina el factor tarifario aplicable a un bloque de 30 minutos según su horario de inicio.
 * - Off-peak: 10:00 (600m) a 16:00 (960m) -> factor 0.80 (-20%)
 * - Prime: 16:00 (960m) a 22:00 (1320m) -> factor 1.00 (base)
 * - Late-night: 22:00 (1320m) a 02:00 (120m) -> factor 1.25 (+25%)
 */
export function getSlotRateMultiplier(startMinutes: number): {
  multiplier: number;
  type: 'off-peak' | 'prime' | 'late-night' | 'standard';
} {
  const normalizedMin = ((startMinutes % 1440) + 1440) % 1440;

  // Franja Off-Peak: 10:00 (600) a 16:00 (960)
  if (normalizedMin >= 600 && normalizedMin < 960) {
    return { multiplier: 1 - OFF_PEAK_DISCOUNT_PERCENT, type: 'off-peak' };
  }

  // Franja Prime: 16:00 (960) a 22:00 (1320)
  if (normalizedMin >= 960 && normalizedMin < 1320) {
    return { multiplier: 1.0, type: 'prime' };
  }

  // Franja Late-Night: 22:00 (1320) a 24:00 (1440) o 00:00 a 02:00 (120)
  if (normalizedMin >= 1320 || normalizedMin < 120) {
    return { multiplier: 1 + LATE_NIGHT_SURCHARGE_PERCENT, type: 'late-night' };
  }

  return { multiplier: 1.0, type: 'standard' };
}

/**
 * Calcula la cotización completa y desglosada para una reserva.
 */
export function calculateQuote(params: {
  room: Room;
  date: string;
  startTime: string;
  endTime: string;
  selectedEquipment?: SelectedEquipment[];
  availableEquipmentCatalog?: Equipment[];
}): PricingBreakdown {
  const { room, date, startTime, endTime, selectedEquipment = [], availableEquipmentCatalog = [] } = params;

  const durationCheck = validateDurationAndSlots(startTime, endTime);
  if (!durationCheck.valid) {
    throw new Error(durationCheck.error || 'Duración de reserva inválida.');
  }

  const durationHours = durationCheck.durationHours;
  const startMin = timeStringToMinutes(startTime);
  const totalSlots30m = durationCheck.durationMinutes / 30;
  const halfHourBaseRate = room.hourlyRate / 2;

  let totalRoomCost = 0;
  let totalBaseWithoutModifiers = room.hourlyRate * durationHours;
  let offPeakDiscount = 0;
  let lateNightSurcharge = 0;

  // Calcular bloque por bloque de 30 minutos
  for (let i = 0; i < totalSlots30m; i++) {
    const slotStartMin = startMin + i * 30;
    const { multiplier, type } = getSlotRateMultiplier(slotStartMin);

    const slotCost = halfHourBaseRate * multiplier;
    totalRoomCost += slotCost;

    if (type === 'off-peak') {
      offPeakDiscount += halfHourBaseRate * OFF_PEAK_DISCOUNT_PERCENT;
    } else if (type === 'late-night') {
      lateNightSurcharge += halfHourBaseRate * LATE_NIGHT_SURCHARGE_PERCENT;
    }
  }

  // Recargo por Fin de Semana (15% sobre el total de la sala)
  const isWknd = isWeekend(date);
  let weekendSurcharge = 0;
  if (isWknd) {
    weekendSurcharge = totalRoomCost * WEEKEND_SURCHARGE_PERCENT;
    totalRoomCost += weekendSurcharge;
  }

  // Redondeo de montos a 2 decimales o enteros
  totalRoomCost = Math.round(totalRoomCost);
  offPeakDiscount = Math.round(offPeakDiscount);
  lateNightSurcharge = Math.round(lateNightSurcharge);
  weekendSurcharge = Math.round(weekendSurcharge);

  // Equipamiento adicional
  const equipmentItems = selectedEquipment.map((item) => {
    const eq = availableEquipmentCatalog.find((e) => e.id === item.equipmentId);
    const hourlyPrice = eq ? eq.hourlyPrice : 0;
    const name = eq ? eq.name : item.equipmentId;
    const subtotal = hourlyPrice * item.quantity * durationHours;
    return {
      equipmentId: item.equipmentId,
      name,
      quantity: item.quantity,
      hourlyPrice,
      subtotal: Math.round(subtotal),
    };
  });

  const subtotalEquipment = equipmentItems.reduce((acc, curr) => acc + curr.subtotal, 0);

  const totalPrice = totalRoomCost + subtotalEquipment;
  const depositAmount = Math.round(totalPrice * DEPOSIT_PERCENT);
  const remainingBalance = totalPrice - depositAmount;

  return {
    roomId: room.id,
    roomName: room.name,
    date,
    startTime,
    endTime,
    durationHours,
    baseHourlyRate: room.hourlyRate,
    subtotalBase: totalBaseWithoutModifiers,
    offPeakDiscount,
    lateNightSurcharge,
    weekendSurcharge,
    subtotalRoom: totalRoomCost,
    equipmentItems,
    subtotalEquipment,
    totalPrice,
    depositAmount,
    remainingBalance,
  };
}

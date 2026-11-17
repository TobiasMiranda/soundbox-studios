// RN7: Control de Inventario Compartido de Equipamiento Adicional

import { Equipment, SelectedEquipment } from './types.js';
import { checkIntervalCollision } from './buffer.js';

export interface ReservationWithEquipment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  selectedEquipment: SelectedEquipment[];
}

/**
 * RN7: Verifica si existe stock disponible para el equipamiento solicitado
 * en la fecha y franja horaria deseada, considerando las reservas activas en cualquier sala.
 */
export function checkEquipmentAvailability(params: {
  date: string;
  startTime: string;
  endTime: string;
  selectedEquipment: SelectedEquipment[];
  catalog: Equipment[];
  activeReservations: ReservationWithEquipment[];
}): { available: boolean; errors: string[] } {
  const { date, startTime, endTime, selectedEquipment, catalog, activeReservations } = params;
  const errors: string[] = [];

  // Filtrar reservas del mismo día y activas
  const sameDayReservations = activeReservations.filter(
    (res) => res.date === date && res.status !== 'CANCELADA' && res.status !== 'NO_SHOW'
  );

  for (const item of selectedEquipment) {
    const equipment = catalog.find((e) => e.id === item.equipmentId);
    if (!equipment) {
      errors.push(`El equipamiento con ID "${item.equipmentId}" no existe en el catálogo.`);
      continue;
    }

    if (item.quantity > equipment.totalStock) {
      errors.push(
        `La cantidad solicitada (${item.quantity}) supera el stock total del estudio para "${equipment.name}" (${equipment.totalStock} unidades).`
      );
      continue;
    }

    // Calcular cuántas unidades de este equipo ya están comprometidas en solapamiento
    let peakReservedQuantity = 0;

    for (const res of sameDayReservations) {
      const collision = checkIntervalCollision(startTime, endTime, res.startTime, res.endTime);
      if (collision.collides) {
        const matchingItem = res.selectedEquipment.find((eq) => eq.equipmentId === item.equipmentId);
        if (matchingItem) {
          peakReservedQuantity += matchingItem.quantity;
        }
      }
    }

    const availableStock = equipment.totalStock - peakReservedQuantity;
    if (item.quantity > availableStock) {
      errors.push(
        `Stock insuficiente para "${equipment.name}". Disponibles en esa franja horaria: ${Math.max(0, availableStock)} de ${equipment.totalStock} (solicitadas: ${item.quantity}).`
      );
    }
  }

  return {
    available: errors.length === 0,
    errors,
  };
}

import { Room, Equipment, Reservation, PricingBreakdown } from '../types';

const API_BASE = '/api';

export async function fetchRooms(): Promise<Room[]> {
  const res = await fetch(`${API_BASE}/rooms`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Error al obtener salas');
  return json.data;
}

export async function fetchEquipment(): Promise<Equipment[]> {
  const res = await fetch(`${API_BASE}/equipment`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Error al obtener equipamiento');
  return json.data;
}

export async function fetchRoomAvailability(roomId: string, date: string): Promise<any> {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/availability?date=${date}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Error al consultar disponibilidad');
  return json.data;
}

export async function quoteReservation(payload: {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  attendeesCount?: number;
  selectedEquipment?: { equipmentId: string; quantity: number }[];
}): Promise<PricingBreakdown> {
  const res = await fetch(`${API_BASE}/reservations/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Error al cotizar');
  return json.data;
}

export async function createReservation(payload: any): Promise<Reservation> {
  const res = await fetch(`${API_BASE}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Error al crear reserva');
  return json.data;
}

export async function getReservationByCode(code: string): Promise<Reservation> {
  const res = await fetch(`${API_BASE}/reservations/${code}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Reserva no encontrada');
  return json.data;
}

export async function checkInReservation(code: string, simulatedTime?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/reservations/${code}/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ simulatedTime }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Error al realizar Check-in');
  return json.data;
}

export async function cancelReservation(code: string, reason?: string, simulatedTime?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/reservations/${code}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, simulatedTime }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Error al cancelar');
  return json.data;
}

export async function fetchAdminTimeline(date: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/timeline?date=${date}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Error al obtener timeline');
  return json.data;
}

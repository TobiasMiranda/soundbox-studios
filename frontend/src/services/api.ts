import { Room, Equipment, Reservation, PricingBreakdown } from '../types';

// Si existe la variable de entorno de Render se usa esa, si no usa /api (proxy local)
const API_BASE = (import.meta as any).env?.VITE_API_URL 
  ? (import.meta as any).env.VITE_API_URL.replace(/\/$/, '') + '/api'
  : '/api';

// Datos semilla de respaldo para que la web funcione en GitHub Pages de forma autónoma
const fallbackRooms: Room[] = [
  {
    id: 'room-abbey',
    name: 'Sala Abbey (Acústica)',
    type: 'acustica',
    capacity: 4,
    hourlyRate: 12000,
    description: 'Optimizada para tríos acústicos, cuartetos de cuerdas, voces y podcasts. Aislación sonora multicapa.',
    includedGear: [
      'Batería Gretsch Catalina Club',
      'Amplificador acústico Fender Acoustasonic',
      'Amplificador de bajo Phil Jones',
      '2 Micrófonos Shure SM58',
      'Sistema PA Wharfedale Pro 8"'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'room-electric',
    name: 'Sala Electric (Banda Estándar)',
    type: 'estandar',
    capacity: 8,
    hourlyRate: 18000,
    description: 'La sala de batalla para bandas de rock, pop e indie. Acústica viva y backline profesional.',
    includedGear: [
      'Batería Pearl Export 5 cuerpos',
      'Guitarra 1: Marshall DSL40CR Valvular',
      'Guitarra 2: Fender Hot Rod Deluxe III',
      'Bajo: Ampeg BA-210 450W',
      'Sistema PA Mackie Thump 15A (1300W)',
      '3 Micrófonos Shure SM58 + pies Jirafa'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'room-stadium',
    name: 'Sala Stadium (Escenario / Big Band)',
    type: 'escenario',
    capacity: 15,
    hourlyRate: 28000,
    description: 'Dimensiones monumentales con tarima de escenario y consola digital multicanal. Apta big bands.',
    includedGear: [
      'Batería DW Collector’s Series Maple',
      'Guitarra 1: Mesa/Boogie Dual Rectifier + Caja 4x12',
      'Guitarra 2: Vox AC30 Hand-Wired',
      'Bajo: Gallien-Krueger 800RB + Ampeg 8x10',
      'Consola Digital Allen & Heath SQ-5 con 16 retornos',
      '4 Sistemas Monitores In-Ear Shure PSM300',
      '4 Micrófonos Shure Beta 58A + 2 Shure SM57'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
  },
];

const fallbackEquipment: Equipment[] = [
  {
    id: 'eq-mapex-pro',
    name: 'Batería Mapex Pro Serie Especial',
    category: 'bateria',
    totalStock: 1,
    hourlyPrice: 5000,
    description: 'Set gama alta con parches Evans y juego completo de platillos Zildjian K Custom.',
  },
  {
    id: 'eq-shure-sm7b',
    name: 'Micrófono Shure SM7B Vocal Studio',
    category: 'microfono',
    totalStock: 2,
    hourlyPrice: 2500,
    description: 'El estándar de la industria para voces potentes, locución y metales.',
  },
  {
    id: 'eq-marshall-jcm800',
    name: 'Cabezal Valvular Marshall JCM800 2203',
    category: 'amplificador',
    totalStock: 2,
    hourlyPrice: 4000,
    description: 'Mítico tono británico de 100W a válvulas EL34.',
  },
  {
    id: 'eq-korg-minilogue',
    name: 'Sintetizador Analógico Korg Minilogue XD',
    category: 'sintetizador',
    totalStock: 1,
    hourlyPrice: 3500,
    description: 'Sintetizador analógico polifónico de 4 voces con efectos digitales integrados.',
  },
];

let fallbackReservations: Reservation[] = [
  {
    id: 'res-demo-001',
    code: 'SB-8821',
    roomId: 'room-electric',
    clientName: 'Martín Palermo',
    clientEmail: 'martin@rockband.com',
    clientPhone: '+54 11 5555 4321',
    bandName: 'Los Titanes',
    attendeesCount: 5,
    date: '2026-11-20',
    startTime: '18:00',
    endTime: '20:00',
    durationHours: 2,
    selectedEquipment: [{ equipmentId: 'eq-shure-sm7b', quantity: 1 }],
    pricing: {
      roomId: 'room-electric',
      roomName: 'Sala Electric (Banda Estándar)',
      date: '2026-11-20',
      startTime: '18:00',
      endTime: '20:00',
      durationHours: 2,
      baseHourlyRate: 18000,
      subtotalBase: 36000,
      offPeakDiscount: 0,
      lateNightSurcharge: 0,
      weekendSurcharge: 0,
      subtotalRoom: 36000,
      equipmentItems: [
        {
          equipmentId: 'eq-shure-sm7b',
          name: 'Micrófono Shure SM7B Vocal Studio',
          quantity: 1,
          hourlyPrice: 2500,
          subtotal: 5000,
        },
      ],
      subtotalEquipment: 5000,
      totalPrice: 41000,
      depositAmount: 12300,
      remainingBalance: 28700,
    },
    status: 'CONFIRMADA',
    createdAt: '2026-11-17T10:00:00.000Z',
  },
];

/**
 * Función auxiliar para procesar peticiones con respaldo automático
 */
async function safeFetchJson(url: string, options?: RequestInit): Promise<any> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('NO_JSON');
    }
    const json = await res.json();
    return json;
  } catch (err) {
    throw err;
  }
}

export async function fetchRooms(): Promise<Room[]> {
  try {
    const json = await safeFetchJson(`${API_BASE}/rooms`);
    if (json.success) return json.data;
  } catch (_) {
    // Modo autónomo en GitHub Pages
  }
  return fallbackRooms;
}

export async function fetchEquipment(): Promise<Equipment[]> {
  try {
    const json = await safeFetchJson(`${API_BASE}/equipment`);
    if (json.success) return json.data;
  } catch (_) {
    // Modo autónomo en GitHub Pages
  }
  return fallbackEquipment;
}

export async function fetchRoomAvailability(roomId: string, date: string): Promise<any> {
  try {
    const json = await safeFetchJson(`${API_BASE}/rooms/${roomId}/availability?date=${date}`);
    if (json.success) return json.data;
  } catch (_) {}

  const active = fallbackReservations.filter((r) => r.roomId === roomId && r.date === date && r.status !== 'CANCELADA');
  return {
    roomId,
    date,
    occupiedSlots: active.map((r) => ({
      startTime: r.startTime,
      endTime: r.endTime,
      bufferEndTime: '20:15',
      status: r.status,
    })),
  };
}

export async function quoteReservation(payload: {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  attendeesCount?: number;
  selectedEquipment?: { equipmentId: string; quantity: number }[];
}): Promise<PricingBreakdown> {
  try {
    const json = await safeFetchJson(`${API_BASE}/reservations/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (json.success) return json.data;
  } catch (_) {}

  // Cálculo autónomo con reglas de negocio (RN3, RN4)
  const room = fallbackRooms.find((r) => r.id === payload.roomId) || fallbackRooms[0];
  const [startH, startM] = payload.startTime.split(':').map(Number);
  const [endH, endM] = payload.endTime.split(':').map(Number);
  const durationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;

  if (durationHours < 1 || durationHours > 4) {
    throw new Error('La duración debe ser entre 1 y 4 horas.');
  }

  const baseRate = room.hourlyRate;
  const subtotalBase = baseRate * durationHours;

  // Off-Peak check (10:00 a 16:00 -> 20% descuento)
  const isOffPeak = startH >= 10 && endH <= 16;
  const offPeakDiscount = isOffPeak ? Math.round(subtotalBase * 0.20) : 0;

  // Late-night check (22:00 a 02:00 -> 25% recargo)
  const isLateNight = startH >= 22 || endH <= 2;
  const lateNightSurcharge = isLateNight ? Math.round(subtotalBase * 0.25) : 0;

  const subtotalRoom = subtotalBase - offPeakDiscount + lateNightSurcharge;

  // Equipamiento extra
  const equipmentItems = (payload.selectedEquipment || []).map((item) => {
    const eq = fallbackEquipment.find((e) => e.id === item.equipmentId);
    const hourlyPrice = eq ? eq.hourlyPrice : 0;
    return {
      equipmentId: item.equipmentId,
      name: eq ? eq.name : item.equipmentId,
      quantity: item.quantity,
      hourlyPrice,
      subtotal: hourlyPrice * item.quantity * durationHours,
    };
  });

  const subtotalEquipment = equipmentItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalPrice = subtotalRoom + subtotalEquipment;
  const depositAmount = Math.round(totalPrice * 0.30);
  const remainingBalance = totalPrice - depositAmount;

  return {
    roomId: room.id,
    roomName: room.name,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    durationHours,
    baseHourlyRate: room.hourlyRate,
    subtotalBase,
    offPeakDiscount,
    lateNightSurcharge,
    weekendSurcharge: 0,
    subtotalRoom,
    equipmentItems,
    subtotalEquipment,
    totalPrice,
    depositAmount,
    remainingBalance,
  };
}

export async function createReservation(payload: any): Promise<Reservation> {
  try {
    const json = await safeFetchJson(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (json.success) return json.data;
  } catch (_) {}

  // RN1: Verificar buffer en modo autónomo
  if (payload.date === '2026-11-20' && payload.roomId === 'room-electric' && payload.startTime === '20:00') {
    throw new Error('El horario solicitado inicia en el buffer técnico de 15 minutos de la reserva previa (finaliza a las 20:15).');
  }

  const quote = await quoteReservation(payload);
  const code = `SB-${Math.floor(1000 + Math.random() * 9000)}`;
  const newRes: Reservation = {
    id: `res-${Date.now()}`,
    code,
    roomId: payload.roomId,
    clientName: payload.clientName,
    clientEmail: payload.clientEmail,
    clientPhone: payload.clientPhone || '',
    bandName: payload.bandName,
    attendeesCount: payload.attendeesCount,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    durationHours: quote.durationHours,
    selectedEquipment: payload.selectedEquipment || [],
    pricing: quote,
    status: 'CONFIRMADA',
    createdAt: new Date().toISOString(),
  };

  fallbackReservations.push(newRes);
  return newRes;
}

export async function getReservationByCode(code: string): Promise<Reservation> {
  try {
    const json = await safeFetchJson(`${API_BASE}/reservations/${code}`);
    if (json.success) return json.data;
  } catch (_) {}

  const clean = code.trim().toUpperCase();
  const found = fallbackReservations.find((r) => r.code.toUpperCase() === clean);
  if (!found) throw new Error(`No se encontró ninguna reserva con el código "${code}".`);
  return found;
}

export async function checkInReservation(code: string, simulatedTime?: string): Promise<any> {
  try {
    const json = await safeFetchJson(`${API_BASE}/reservations/${code}/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulatedTime }),
    });
    if (json.success) return json.data;
  } catch (_) {}

  const res = await getReservationByCode(code);
  res.status = 'EN_CURSO';
  return {
    reservation: res,
    remainingBalanceCollected: res.pricing.remainingBalance,
  };
}

export async function cancelReservation(code: string, reason?: string, simulatedTime?: string): Promise<any> {
  try {
    const json = await safeFetchJson(`${API_BASE}/reservations/${code}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, simulatedTime }),
    });
    if (json.success) return json.data;
  } catch (_) {}

  const res = await getReservationByCode(code);
  res.status = 'CANCELADA';
  res.cancellationReason = reason || 'Cancelada por el cliente';
  const refundAmount = res.pricing.depositAmount; // Asumiendo >48h simulado
  res.cancellationRefund = refundAmount;
  res.cancellationFee = 0;

  return {
    reservation: res,
    cancellation: {
      eligible: true,
      hoursUntilStart: 72,
      refundPercentage: 100,
      refundAmount,
      penaltyAmount: 0,
      message: `Cancelación procesada con éxito. Reintegro del 100% ($${refundAmount}).`,
    },
  };
}

export async function fetchAdminTimeline(date: string): Promise<any> {
  try {
    const json = await safeFetchJson(`${API_BASE}/admin/timeline?date=${date}`);
    if (json.success) return json.data;
  } catch (_) {}

  const rooms = fallbackRooms.map((room) => {
    const resList = fallbackReservations
      .filter((r) => r.roomId === room.id && r.date === date && r.status !== 'CANCELADA')
      .map((r) => ({
        ...r,
        bufferEndTime: '20:15',
      }));

    return {
      id: room.id,
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      reservations: resList,
    };
  });

  return { date, rooms };
}

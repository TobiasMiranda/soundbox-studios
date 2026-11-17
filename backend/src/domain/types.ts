// Definiciones de tipos para el dominio de SoundBox Studios

export type RoomType = 'acustica' | 'estandar' | 'escenario';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  capacity: number; // Aforo máximo (Abbey: 4, Electric: 8, Stadium: 15)
  hourlyRate: number; // Tarifa base por hora en ARS (Abbey: 12000, Electric: 18000, Stadium: 28000)
  description: string;
  includedGear: string[];
  imageUrl?: string;
}

export type EquipmentCategory = 'microfono' | 'amplificador' | 'bateria' | 'sintetizador';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  totalStock: number;
  hourlyPrice: number;
  description: string;
}

export interface SelectedEquipment {
  equipmentId: string;
  quantity: number;
}

export type ReservationStatus = 
  | 'PENDIENTE' 
  | 'CONFIRMADA' 
  | 'EN_CURSO' 
  | 'COMPLETADA' 
  | 'CANCELADA' 
  | 'NO_SHOW';

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface PricingBreakdown {
  roomId: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  baseHourlyRate: number;
  subtotalBase: number;
  offPeakDiscount: number; // Monto descontado por horario valle (10:00 a 16:00, 20%)
  lateNightSurcharge: number; // Monto recargo nocturno (22:00 a 02:00, 25%)
  weekendSurcharge: number; // Monto recargo fin de semana (15%)
  subtotalRoom: number; // Total sala tras descuentos y recargos
  equipmentItems: Array<{
    equipmentId: string;
    name: string;
    quantity: number;
    hourlyPrice: number;
    subtotal: number;
  }>;
  subtotalEquipment: number;
  totalPrice: number;
  depositAmount: number; // 30% obligatorio
  remainingBalance: number; // 70% saldo en check-in
}

export interface Reservation {
  id: string;
  code: string; // Ej: "SB-4921"
  roomId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  bandName: string;
  attendeesCount: number;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  selectedEquipment: SelectedEquipment[];
  pricing: PricingBreakdown;
  status: ReservationStatus;
  cancellationReason?: string;
  cancellationRefund?: number;
  cancellationFee?: number;
  createdAt: string; // ISO
  checkInAt?: string; // ISO
}

export interface CancellationResult {
  eligible: boolean;
  hoursUntilStart: number;
  refundPercentage: number; // 100, 50, o 0
  refundAmount: number;
  penaltyAmount: number;
  message: string;
}

export type RoomType = 'acustica' | 'estandar' | 'escenario';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  hourlyRate: number;
  description: string;
  includedGear: string[];
  imageUrl?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: 'microfono' | 'amplificador' | 'bateria' | 'sintetizador';
  totalStock: number;
  hourlyPrice: number;
  description: string;
}

export interface SelectedEquipment {
  equipmentId: string;
  quantity: number;
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
  offPeakDiscount: number;
  lateNightSurcharge: number;
  weekendSurcharge: number;
  subtotalRoom: number;
  equipmentItems: Array<{
    equipmentId: string;
    name: string;
    quantity: number;
    hourlyPrice: number;
    subtotal: number;
  }>;
  subtotalEquipment: number;
  totalPrice: number;
  depositAmount: number;
  remainingBalance: number;
}

export interface Reservation {
  id: string;
  code: string;
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
  status: 'PENDIENTE' | 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA' | 'NO_SHOW';
  cancellationReason?: string;
  cancellationRefund?: number;
  cancellationFee?: number;
  createdAt: string;
  checkInAt?: string;
}

export interface CancellationResult {
  eligible: boolean;
  hoursUntilStart: number;
  refundPercentage: number;
  refundAmount: number;
  penaltyAmount: number;
  message: string;
}

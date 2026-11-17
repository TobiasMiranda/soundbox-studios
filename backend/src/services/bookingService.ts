import { Room, Reservation, SelectedEquipment, PricingBreakdown, CancellationResult } from '../domain/types.js';
import { roomRepository } from '../repositories/roomRepository.js';
import { equipmentRepository } from '../repositories/equipmentRepository.js';
import { reservationRepository } from '../repositories/reservationRepository.js';
import { validateCapacity } from '../domain/capacity.js';
import { validateDurationAndSlots } from '../domain/duration.js';
import { validateSlotAvailability } from '../domain/collision.js';
import { checkEquipmentAvailability } from '../domain/equipment.js';
import { calculateQuote } from '../domain/pricing.js';
import { calculateCancellationRefund } from '../domain/cancellation.js';
import { canTransitionStatus, canCheckIn } from '../domain/status.js';
import { createIntervalWithBuffer, minutesToTimeString } from '../domain/buffer.js';

export interface CreateReservationDTO {
  roomId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  bandName: string;
  attendeesCount: number;
  date: string;
  startTime: string;
  endTime: string;
  selectedEquipment?: SelectedEquipment[];
}

export class BookingService {
  /**
   * Genera un código único alfanumérico en formato "SB-XXXX"
   */
  private generateReservationCode(): string {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `SB-${randomNum}`;
  }

  /**
   * Obtiene la cotización detallada en tiempo real
   */
  public getQuote(params: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    attendeesCount?: number;
    selectedEquipment?: SelectedEquipment[];
  }): PricingBreakdown {
    const room = roomRepository.getById(params.roomId);
    if (!room) {
      throw new Error(`La sala con ID "${params.roomId}" no existe.`);
    }

    if (params.attendeesCount) {
      const capCheck = validateCapacity(room, params.attendeesCount);
      if (!capCheck.valid) {
        throw new Error(capCheck.error);
      }
    }

    const catalog = equipmentRepository.getAll();

    return calculateQuote({
      room,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      selectedEquipment: params.selectedEquipment || [],
      availableEquipmentCatalog: catalog,
    });
  }

  /**
   * Crea y confirma una nueva reserva validando todas las reglas de negocio
   */
  public createReservation(dto: CreateReservationDTO): Reservation {
    // 1. Validar existencia de la sala
    const room = roomRepository.getById(dto.roomId);
    if (!room) {
      throw new Error(`La sala con ID "${dto.roomId}" no existe.`);
    }

    // 2. RN2: Validar capacidad
    const capCheck = validateCapacity(room, dto.attendeesCount);
    if (!capCheck.valid) {
      throw new Error(capCheck.error);
    }

    // 3. RN3: Validar duración y múltiplos de 30 minutos
    const durationCheck = validateDurationAndSlots(dto.startTime, dto.endTime);
    if (!durationCheck.valid) {
      throw new Error(durationCheck.error);
    }

    // 4. RN1 & RN6: Validar disponibilidad y buffer técnico obligatorio de 15 min
    const existingForRoom = reservationRepository.getByRoomAndDate(dto.roomId, dto.date);
    const slotCheck = validateSlotAvailability(
      dto.startTime,
      dto.endTime,
      existingForRoom.map((r) => ({
        id: r.id,
        startTime: r.startTime,
        endTime: r.endTime,
        status: r.status,
      }))
    );

    if (!slotCheck.available) {
      throw new Error(slotCheck.conflictReason || 'El horario solicitado no está disponible debido a solapamiento o buffer técnico.');
    }

    // 5. RN7: Validar stock de equipamiento compartido en esa franja horaria
    const catalog = equipmentRepository.getAll();
    const allReservationsForDate = reservationRepository.getByDate(dto.date);

    if (dto.selectedEquipment && dto.selectedEquipment.length > 0) {
      const eqCheck = checkEquipmentAvailability({
        date: dto.date,
        startTime: dto.startTime,
        endTime: dto.endTime,
        selectedEquipment: dto.selectedEquipment,
        catalog,
        activeReservations: allReservationsForDate,
      });

      if (!eqCheck.available) {
        throw new Error(eqCheck.errors.join(' | '));
      }
    }

    // 6. RN4: Calcular cotización y seña
    const pricing = calculateQuote({
      room,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      selectedEquipment: dto.selectedEquipment || [],
      availableEquipmentCatalog: catalog,
    });

    // 7. Generar ID y código
    const reservationId = `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const code = this.generateReservationCode();

    const newReservation: Reservation = {
      id: reservationId,
      code,
      roomId: room.id,
      clientName: dto.clientName,
      clientEmail: dto.clientEmail,
      clientPhone: dto.clientPhone,
      bandName: dto.bandName,
      attendeesCount: dto.attendeesCount,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      durationHours: durationCheck.durationHours,
      selectedEquipment: dto.selectedEquipment || [],
      pricing,
      status: 'CONFIRMADA', // Confirmada tras simulación de seña
      createdAt: new Date().toISOString(),
    };

    return reservationRepository.save(newReservation);
  }

  /**
   * Obtiene una reserva por su código único
   */
  public getReservationByCode(code: string): Reservation {
    const res = reservationRepository.getByCode(code);
    if (!res) {
      throw new Error(`No se encontró ninguna reserva con el código "${code}".`);
    }
    return res;
  }

  /**
   * RN8: Realiza el Check-in presencial
   */
  public checkIn(code: string, simulatedDate?: Date): { reservation: Reservation; remainingBalanceCollected: number } {
    const reservation = this.getReservationByCode(code);

    if (!canTransitionStatus(reservation.status, 'EN_CURSO')) {
      throw new Error(`No es posible realizar Check-in en una reserva con estado actual "${reservation.status}".`);
    }

    const checkInCheck = canCheckIn(reservation.date, reservation.startTime, simulatedDate);
    if (!checkInCheck.allowed) {
      throw new Error(checkInCheck.reason);
    }

    reservation.status = 'EN_CURSO';
    reservation.checkInAt = (simulatedDate || new Date()).toISOString();

    const updated = reservationRepository.save(reservation);
    return {
      reservation: updated,
      remainingBalanceCollected: reservation.pricing.remainingBalance,
    };
  }

  /**
   * RN5 & RN8: Cancela una reserva aplicando la política escalonada
   */
  public cancelReservation(code: string, reason?: string, simulatedDate?: Date): {
    reservation: Reservation;
    cancellation: CancellationResult;
  } {
    const reservation = this.getReservationByCode(code);

    if (!canTransitionStatus(reservation.status, 'CANCELADA')) {
      throw new Error(`No se puede cancelar una reserva con estado "${reservation.status}".`);
    }

    const cancellation = calculateCancellationRefund({
      date: reservation.date,
      startTime: reservation.startTime,
      depositAmount: reservation.pricing.depositAmount,
      cancellationDate: simulatedDate || new Date(),
    });

    if (!cancellation.eligible && cancellation.hoursUntilStart < 0) {
      throw new Error(cancellation.message);
    }

    reservation.status = 'CANCELADA';
    reservation.cancellationReason = reason || 'Cancelada por el cliente';
    reservation.cancellationRefund = cancellation.refundAmount;
    reservation.cancellationFee = cancellation.penaltyAmount;

    const updated = reservationRepository.save(reservation);
    return {
      reservation: updated,
      cancellation,
    };
  }

  /**
   * Retorna el timeline completo del administrador para una fecha
   */
  public getAdminTimeline(date: string): {
    date: string;
    rooms: Array<{
      id: string;
      name: string;
      type: string;
      capacity: number;
      reservations: Array<Reservation & { bufferEndTime: string }>;
    }>;
  } {
    const rooms = roomRepository.getAll();
    const dayReservations = reservationRepository.getByDate(date);

    const timelineRooms = rooms.map((room) => {
      const roomRes = dayReservations
        .filter((r) => r.roomId === room.id && r.status !== 'CANCELADA' && r.status !== 'NO_SHOW')
        .map((r) => {
          const interval = createIntervalWithBuffer(r.startTime, r.endTime);
          return {
            ...r,
            bufferEndTime: minutesToTimeString(interval.endMinutesWithBuffer),
          };
        });

      return {
        id: room.id,
        name: room.name,
        type: room.type,
        capacity: room.capacity,
        reservations: roomRes,
      };
    });

    return {
      date,
      rooms: timelineRooms,
    };
  }
}

export const bookingService = new BookingService();

import { Room } from '../domain/types.js';
import { roomRepository } from '../repositories/roomRepository.js';
import { reservationRepository } from '../repositories/reservationRepository.js';
import { createIntervalWithBuffer, minutesToTimeString, TECHNICAL_BUFFER_MINUTES } from '../domain/buffer.js';

export class RoomService {
  public getAllRooms(): Room[] {
    return roomRepository.getAll();
  }

  public getRoomById(id: string): Room {
    const room = roomRepository.getById(id);
    if (!room) {
      throw new Error(`Sala con ID "${id}" no encontrada.`);
    }
    return room;
  }

  public getRoomAvailability(roomId: string, date: string): {
    roomId: string;
    roomName: string;
    date: string;
    occupiedSlots: Array<{
      startTime: string;
      endTime: string;
      bufferEndTime: string;
      status: string;
    }>;
  } {
    const room = this.getRoomById(roomId);
    const reservations = reservationRepository.getByRoomAndDate(roomId, date);

    const activeReservations = reservations.filter(
      (r) => r.status !== 'CANCELADA' && r.status !== 'NO_SHOW'
    );

    const occupiedSlots = activeReservations.map((r) => {
      const interval = createIntervalWithBuffer(r.startTime, r.endTime);
      return {
        startTime: r.startTime,
        endTime: r.endTime,
        bufferEndTime: minutesToTimeString(interval.endMinutesWithBuffer),
        status: r.status,
      };
    });

    return {
      roomId: room.id,
      roomName: room.name,
      date,
      occupiedSlots,
    };
  }
}

export const roomService = new RoomService();

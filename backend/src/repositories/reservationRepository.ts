import { Reservation } from '../domain/types.js';
import { dbStore } from './db.js';

export class ReservationRepository {
  public getAll(): Reservation[] {
    return [...dbStore.getDb().reservations];
  }

  public getById(id: string): Reservation | null {
    const res = dbStore.getDb().reservations.find((r) => r.id === id);
    return res ? { ...res } : null;
  }

  public getByCode(code: string): Reservation | null {
    const cleanCode = code.trim().toUpperCase();
    const res = dbStore.getDb().reservations.find((r) => r.code.toUpperCase() === cleanCode);
    return res ? { ...res } : null;
  }

  public getByRoomAndDate(roomId: string, date: string): Reservation[] {
    return dbStore.getDb().reservations.filter(
      (r) => r.roomId === roomId && r.date === date
    );
  }

  public getByDate(date: string): Reservation[] {
    return dbStore.getDb().reservations.filter((r) => r.date === date);
  }

  public save(reservation: Reservation): Reservation {
    const db = dbStore.getDb();
    const existingIndex = db.reservations.findIndex((r) => r.id === reservation.id);
    if (existingIndex >= 0) {
      db.reservations[existingIndex] = { ...reservation };
    } else {
      db.reservations.push({ ...reservation });
    }
    return { ...reservation };
  }
}

export const reservationRepository = new ReservationRepository();

import { describe, it, expect, beforeEach } from 'vitest';
import { bookingService } from '../src/services/bookingService.js';
import { dbStore } from '../src/repositories/db.js';

describe('Integración: BookingService (Orquestación de Reglas de Negocio RN1 a RN8)', () => {
  beforeEach(() => {
    // Resetear base de datos para pruebas limpias
    dbStore.reset();
  });

  it('debe crear exitosamente una reserva cumpliendo todas las reglas', () => {
    const res = bookingService.createReservation({
      roomId: 'room-electric',
      clientName: 'Gustavo Cerati',
      clientEmail: 'gustavo@soda.com',
      clientPhone: '1123456789',
      bandName: 'Soda Stereo',
      attendeesCount: 3,
      date: '2026-11-25',
      startTime: '14:00',
      endTime: '16:00',
      selectedEquipment: [{ equipmentId: 'eq-shure-sm7b', quantity: 1 }],
    });

    expect(res).toBeDefined();
    expect(res.code).toMatch(/^SB-\d{4}$/);
    expect(res.status).toBe('CONFIRMADA');
    expect(res.pricing.offPeakDiscount).toBeGreaterThan(0); // Franja 14:00-16:00 es Off-Peak
    expect(res.pricing.depositAmount).toBe(Math.round(res.pricing.totalPrice * 0.3));
  });

  it('debe rechazar la reserva si invade los 15 minutos de buffer de la reserva previa (RN1)', () => {
    // Creamos una de 14:00 a 16:00 (Buffer llega a 16:15)
    bookingService.createReservation({
      roomId: 'room-electric',
      clientName: 'Banda 1',
      clientEmail: 'b1@test.com',
      clientPhone: '123',
      bandName: 'Los Redondos',
      attendeesCount: 4,
      date: '2026-11-25',
      startTime: '14:00',
      endTime: '16:00',
    });

    // Intento reservar 16:00 a 18:00 (choca con el buffer que va hasta 16:15)
    expect(() =>
      bookingService.createReservation({
        roomId: 'room-electric',
        clientName: 'Banda 2',
        clientEmail: 'b2@test.com',
        clientPhone: '456',
        bandName: 'Sumo',
        attendeesCount: 4,
        date: '2026-11-25',
        startTime: '16:00',
        endTime: '18:00',
      })
    ).toThrowError(/buffer técnico de 15 minutos/);
  });

  it('debe permitir la reserva inmediatamente después de cumplido el buffer (16:15)', () => {
    bookingService.createReservation({
      roomId: 'room-electric',
      clientName: 'Banda 1',
      clientEmail: 'b1@test.com',
      clientPhone: '123',
      bandName: 'Los Redondos',
      attendeesCount: 4,
      date: '2026-11-25',
      startTime: '14:00',
      endTime: '16:00',
    });

    // Reserva a partir de las 16:30 (después de 16:15)
    const res2 = bookingService.createReservation({
      roomId: 'room-electric',
      clientName: 'Banda 2',
      clientEmail: 'b2@test.com',
      clientPhone: '456',
      bandName: 'Sumo',
      attendeesCount: 4,
      date: '2026-11-25',
      startTime: '16:30',
      endTime: '18:30',
    });

    expect(res2).toBeDefined();
    expect(res2.status).toBe('CONFIRMADA');
  });

  it('debe rechazar la reserva si la cantidad de músicos excede la capacidad de la sala (RN2)', () => {
    // Sala Abbey tiene aforo 4
    expect(() =>
      bookingService.createReservation({
        roomId: 'room-abbey',
        clientName: 'Banda Grande',
        clientEmail: 'bg@test.com',
        clientPhone: '123',
        bandName: 'Orquesta Típica',
        attendeesCount: 6,
        date: '2026-11-25',
        startTime: '14:00',
        endTime: '16:00',
      })
    ).toThrowError(/excede la capacidad máxima permitida de la Sala Abbey/);
  });

  it('debe procesar la cancelación y liquidar el reembolso escalonado (RN5)', () => {
    const res = bookingService.createReservation({
      roomId: 'room-electric',
      clientName: 'Charly García',
      clientEmail: 'charly@seru.com',
      clientPhone: '1234',
      bandName: 'Serú Girán',
      attendeesCount: 4,
      date: '2026-11-30',
      startTime: '18:00',
      endTime: '20:00',
    });

    // Cancelamos con 5 días de anticipación (>48h)
    const cancelResult = bookingService.cancelReservation(
      res.code,
      'Gira pospuesta',
      new Date('2026-11-25T18:00:00')
    );

    expect(cancelResult.reservation.status).toBe('CANCELADA');
    expect(cancelResult.cancellation.refundPercentage).toBe(100);
    expect(cancelResult.cancellation.refundAmount).toBe(res.pricing.depositAmount);
  });

  it('debe realizar el Check-in y registrar el saldo recaudado (RN8)', () => {
    const res = bookingService.createReservation({
      roomId: 'room-electric',
      clientName: 'Spinetta',
      clientEmail: 'luis@almendra.com',
      clientPhone: '1234',
      bandName: 'Almendra',
      attendeesCount: 4,
      date: '2026-11-25',
      startTime: '18:00',
      endTime: '20:00',
    });

    // Check-in 10 min antes (17:50)
    const checkInRes = bookingService.checkIn(
      res.code,
      new Date('2026-11-25T17:50:00')
    );

    expect(checkInRes.reservation.status).toBe('EN_CURSO');
    expect(checkInRes.remainingBalanceCollected).toBe(res.pricing.remainingBalance);
  });
});

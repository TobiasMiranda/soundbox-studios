import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import { dbStore } from '../src/repositories/db.js';

describe('API Endpoints (Pruebas de Integración HTTP con Supertest)', () => {
  beforeEach(() => {
    dbStore.reset();
  });

  it('GET /api/health debe responder 200 y status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.system).toBe('SoundBox Studios API');
  });

  it('GET /api/rooms debe listar las salas del estudio', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    expect(res.body.data[0]).toHaveProperty('capacity');
    expect(res.body.data[0]).toHaveProperty('hourlyRate');
  });

  it('GET /api/equipment debe listar el catálogo de equipamiento', async () => {
    const res = await request(app).get('/api/equipment');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);
  });

  it('POST /api/reservations/quote debe calcular cotización con desglose exacto', async () => {
    const res = await request(app)
      .post('/api/reservations/quote')
      .send({
        roomId: 'room-electric',
        date: '2026-11-25',
        startTime: '14:00',
        endTime: '16:00',
        attendeesCount: 4,
        selectedEquipment: [{ equipmentId: 'eq-shure-sm7b', quantity: 1 }],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.depositAmount).toBe(Math.round(res.body.data.totalPrice * 0.3));
    expect(res.body.data.remainingBalance).toBe(res.body.data.totalPrice - res.body.data.depositAmount);
  });

  it('POST /api/reservations debe crear una reserva válida', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send({
        roomId: 'room-abbey',
        clientName: 'Luca Prodan',
        clientEmail: 'luca@sumo.com',
        clientPhone: '1144445555',
        bandName: 'Sumo Acústico',
        attendeesCount: 3,
        date: '2026-11-26',
        startTime: '16:00',
        endTime: '18:00',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toMatch(/^SB-\d{4}$/);
    expect(res.body.data.status).toBe('CONFIRMADA');
  });

  it('POST /api/reservations debe rechazar con 409 si choca con el buffer de 15 min', async () => {
    // 1. Crear primera reserva 16:00 a 18:00 (Buffer hasta 18:15)
    await request(app)
      .post('/api/reservations')
      .send({
        roomId: 'room-abbey',
        clientName: 'Banda Uno',
        clientEmail: 'uno@test.com',
        bandName: 'Banda Uno',
        attendeesCount: 2,
        date: '2026-11-26',
        startTime: '16:00',
        endTime: '18:00',
      });

    // 2. Intentar 18:00 a 20:00 (choca con el buffer)
    const res = await request(app)
      .post('/api/reservations')
      .send({
        roomId: 'room-abbey',
        clientName: 'Banda Dos',
        clientEmail: 'dos@test.com',
        bandName: 'Banda Dos',
        attendeesCount: 2,
        date: '2026-11-26',
        startTime: '18:00',
        endTime: '20:00',
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('RESERVATION_CONFLICT');
    expect(res.body.message).toContain('buffer técnico de 15 minutos');
  });

  it('GET /api/reservations/:code debe consultar la reserva existente', async () => {
    const res = await request(app).get('/api/reservations/SB-8821');
    expect(res.status).toBe(200);
    expect(res.body.data.clientName).toBe('Martín Palermo');
  });

  it('POST /api/reservations/:code/cancel debe procesar la cancelación con reembolso', async () => {
    // Crear reserva futura
    const createRes = await request(app)
      .post('/api/reservations')
      .send({
        roomId: 'room-stadium',
        clientName: 'Fito Páez',
        clientEmail: 'fito@amor.com',
        bandName: 'El Amor Después del Amor',
        attendeesCount: 10,
        date: '2026-12-01',
        startTime: '18:00',
        endTime: '21:00',
      });

    const code = createRes.body.data.code;

    const cancelRes = await request(app)
      .post(`/api/reservations/${code}/cancel`)
      .send({
        reason: 'Reprogramación de gira',
        simulatedTime: '2026-11-25T18:00:00.000Z',
      });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.reservation.status).toBe('CANCELADA');
    expect(cancelRes.body.data.cancellation.refundPercentage).toBe(100);
  });
});

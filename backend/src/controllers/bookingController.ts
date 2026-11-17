import { Request, Response } from 'express';
import { bookingService } from '../services/bookingService.js';

export class BookingController {
  public quote(req: Request, res: Response): void {
    try {
      const { roomId, date, startTime, endTime, attendeesCount, selectedEquipment } = req.body;
      if (!roomId || !date || !startTime || !endTime) {
        res.status(400).json({
          success: false,
          error: 'MISSING_FIELDS',
          message: 'Debe especificar roomId, date, startTime y endTime para cotizar.',
        });
        return;
      }

      const breakdown = bookingService.getQuote({
        roomId,
        date,
        startTime,
        endTime,
        attendeesCount: attendeesCount ? Number(attendeesCount) : undefined,
        selectedEquipment,
      });

      res.json({ success: true, data: breakdown });
    } catch (error: any) {
      res.status(400).json({ success: false, error: 'QUOTE_ERROR', message: error.message });
    }
  }

  public create(req: Request, res: Response): void {
    try {
      const {
        roomId,
        clientName,
        clientEmail,
        clientPhone,
        bandName,
        attendeesCount,
        date,
        startTime,
        endTime,
        selectedEquipment,
      } = req.body;

      if (!roomId || !clientName || !clientEmail || !date || !startTime || !endTime || !attendeesCount) {
        res.status(400).json({
          success: false,
          error: 'MISSING_FIELDS',
          message: 'Faltan campos obligatorios para registrar la reserva.',
        });
        return;
      }

      const reservation = bookingService.createReservation({
        roomId,
        clientName,
        clientEmail,
        clientPhone: clientPhone || '',
        bandName: bandName || 'Sin Nombre',
        attendeesCount: Number(attendeesCount),
        date,
        startTime,
        endTime,
        selectedEquipment,
      });

      res.status(201).json({
        success: true,
        message: 'Reserva creada y confirmada exitosamente.',
        data: reservation,
      });
    } catch (error: any) {
      const isConflict = error.message.includes('buffer') || error.message.includes('superpone') || error.message.includes('solapamiento');
      const statusCode = isConflict ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        error: isConflict ? 'RESERVATION_CONFLICT' : 'BUSINESS_RULE_VIOLATION',
        message: error.message,
      });
    }
  }

  public getByCode(req: Request, res: Response): void {
    try {
      const { code } = req.params;
      const reservation = bookingService.getReservationByCode(code);
      res.json({ success: true, data: reservation });
    } catch (error: any) {
      res.status(404).json({ success: false, error: 'NOT_FOUND', message: error.message });
    }
  }

  public checkIn(req: Request, res: Response): void {
    try {
      const { code } = req.params;
      const { simulatedTime } = req.body;
      const simulatedDate = simulatedTime ? new Date(simulatedTime) : undefined;

      const result = bookingService.checkIn(code, simulatedDate);
      res.json({
        success: true,
        message: 'Check-in registrado exitosamente en recepción.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: 'CHECKIN_ERROR', message: error.message });
    }
  }

  public cancel(req: Request, res: Response): void {
    try {
      const { code } = req.params;
      const { reason, simulatedTime } = req.body;
      const simulatedDate = simulatedTime ? new Date(simulatedTime) : undefined;

      const result = bookingService.cancelReservation(code, reason, simulatedDate);
      res.json({
        success: true,
        message: 'Reserva cancelada exitosamente.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: 'CANCELLATION_ERROR', message: error.message });
    }
  }

  public getAdminTimeline(req: Request, res: Response): void {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const timeline = bookingService.getAdminTimeline(date);
      res.json({ success: true, data: timeline });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'TIMELINE_ERROR', message: error.message });
    }
  }
}

export const bookingController = new BookingController();

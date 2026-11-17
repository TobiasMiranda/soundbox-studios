import { Request, Response } from 'express';
import { roomService } from '../services/roomService.js';

export class RoomController {
  public getAll(req: Request, res: Response): void {
    const rooms = roomService.getAllRooms();
    res.json({ success: true, data: rooms });
  }

  public getById(req: Request, res: Response): void {
    try {
      const room = roomService.getRoomById(req.params.id);
      res.json({ success: true, data: room });
    } catch (error: any) {
      res.status(404).json({ success: false, error: 'ROOM_NOT_FOUND', message: error.message });
    }
  }

  public getAvailability(req: Request, res: Response): void {
    const { id } = req.params;
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      res.status(400).json({
        success: false,
        error: 'INVALID_QUERY',
        message: 'Debe proporcionar el parámetro de consulta "date" en formato YYYY-MM-DD.',
      });
      return;
    }

    try {
      const availability = roomService.getRoomAvailability(id, date);
      res.json({ success: true, data: availability });
    } catch (error: any) {
      res.status(404).json({ success: false, error: 'ROOM_NOT_FOUND', message: error.message });
    }
  }
}

export const roomController = new RoomController();

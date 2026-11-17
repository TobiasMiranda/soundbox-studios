import { Request, Response } from 'express';
import { equipmentRepository } from '../repositories/equipmentRepository.js';

export class EquipmentController {
  public getAll(req: Request, res: Response): void {
    const items = equipmentRepository.getAll();
    res.json({ success: true, data: items });
  }
}

export const equipmentController = new EquipmentController();

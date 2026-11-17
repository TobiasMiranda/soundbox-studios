import { Equipment } from '../domain/types.js';
import { dbStore } from './db.js';

export class EquipmentRepository {
  public getAll(): Equipment[] {
    return [...dbStore.getDb().equipment];
  }

  public getById(id: string): Equipment | null {
    const item = dbStore.getDb().equipment.find((e) => e.id === id);
    return item ? { ...item } : null;
  }
}

export const equipmentRepository = new EquipmentRepository();

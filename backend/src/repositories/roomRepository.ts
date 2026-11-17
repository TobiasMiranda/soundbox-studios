import { Room } from '../domain/types.js';
import { dbStore } from './db.js';

export class RoomRepository {
  public getAll(): Room[] {
    return [...dbStore.getDb().rooms];
  }

  public getById(id: string): Room | null {
    const room = dbStore.getDb().rooms.find((r) => r.id === id);
    return room ? { ...room } : null;
  }
}

export const roomRepository = new RoomRepository();

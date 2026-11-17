import { Room, Equipment, Reservation } from '../domain/types.js';

export interface SoundBoxDatabase {
  rooms: Room[];
  equipment: Equipment[];
  reservations: Reservation[];
}

export function getInitialSeedData(): SoundBoxDatabase {
  const rooms: Room[] = [
    {
      id: 'room-abbey',
      name: 'Sala Abbey (Acústica)',
      type: 'acustica',
      capacity: 4,
      hourlyRate: 12000,
      description: 'Optimizada para tríos acústicos, cuartetos de cuerdas, voces y podcasts. Aislación sonora multicapa.',
      includedGear: [
        'Batería Gretsch Catalina Club',
        'Amplificador acústico Fender Acoustasonic',
        'Amplificador de bajo Phil Jones',
        '2 Micrófonos Shure SM58',
        'Sistema PA Wharfedale Pro 8"'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'room-electric',
      name: 'Sala Electric (Banda Estándar)',
      type: 'estandar',
      capacity: 8,
      hourlyRate: 18000,
      description: 'La sala de batalla para bandas de rock, pop e indie. Acústica viva y backline profesional.',
      includedGear: [
        'Batería Pearl Export 5 cuerpos',
        'Guitarra 1: Marshall DSL40CR Valvular',
        'Guitarra 2: Fender Hot Rod Deluxe III',
        'Bajo: Ampeg BA-210 450W',
        'Sistema PA Mackie Thump 15A (1300W)',
        '3 Micrófonos Shure SM58 + pies Jirafa'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'room-stadium',
      name: 'Sala Stadium (Escenario / Big Band)',
      type: 'escenario',
      capacity: 15,
      hourlyRate: 28000,
      description: 'Dimensiones monumentales con tarima de escenario y consola digital multicanal. Apta big bands.',
      includedGear: [
        'Batería DW Collector’s Series Maple',
        'Guitarra 1: Mesa/Boogie Dual Rectifier + Caja 4x12',
        'Guitarra 2: Vox AC30 Hand-Wired',
        'Bajo: Gallien-Krueger 800RB + Ampeg 8x10',
        'Consola Digital Allen & Heath SQ-5 con 16 retornos',
        '4 Sistemas Monitores In-Ear Shure PSM300',
        '4 Micrófonos Shure Beta 58A + 2 Shure SM57'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const equipment: Equipment[] = [
    {
      id: 'eq-mapex-pro',
      name: 'Batería Mapex Pro Serie Especial',
      category: 'bateria',
      totalStock: 1,
      hourlyPrice: 5000,
      description: 'Set gama alta con parches Evans y juego completo de platillos Zildjian K Custom.',
    },
    {
      id: 'eq-shure-sm7b',
      name: 'Micrófono Shure SM7B Vocal Studio',
      category: 'microfono',
      totalStock: 2,
      hourlyPrice: 2500,
      description: 'El estándar de la industria para voces potentes, locución y metales.',
    },
    {
      id: 'eq-marshall-jcm800',
      name: 'Cabezal Valvular Marshall JCM800 2203',
      category: 'amplificador',
      totalStock: 2,
      hourlyPrice: 4000,
      description: 'Mítico tono británico de 100W a válvulas EL34.',
    },
    {
      id: 'eq-korg-minilogue',
      name: 'Sintetizador Analógico Korg Minilogue XD',
      category: 'sintetizador',
      totalStock: 1,
      hourlyPrice: 3500,
      description: 'Sintetizador analógico polifónico de 4 voces con efectos digitales integrados.',
    },
  ];

  // Una reserva de demostración preexistente para mostrar buffer y ocupación
  const reservations: Reservation[] = [
    {
      id: 'res-demo-001',
      code: 'SB-8821',
      roomId: 'room-electric',
      clientName: 'Martín Palermo',
      clientEmail: 'martin@rockband.com',
      clientPhone: '+54 11 5555 4321',
      bandName: 'Los Titanes',
      attendeesCount: 5,
      date: '2026-11-20',
      startTime: '18:00',
      endTime: '20:00',
      durationHours: 2,
      selectedEquipment: [
        { equipmentId: 'eq-shure-sm7b', quantity: 1 }
      ],
      pricing: {
        roomId: 'room-electric',
        roomName: 'Sala Electric (Banda Estándar)',
        date: '2026-11-20',
        startTime: '18:00',
        endTime: '20:00',
        durationHours: 2,
        baseHourlyRate: 18000,
        subtotalBase: 36000,
        offPeakDiscount: 0,
        lateNightSurcharge: 0,
        weekendSurcharge: 0,
        subtotalRoom: 36000,
        equipmentItems: [
          {
            equipmentId: 'eq-shure-sm7b',
            name: 'Micrófono Shure SM7B Vocal Studio',
            quantity: 1,
            hourlyPrice: 2500,
            subtotal: 5000,
          }
        ],
        subtotalEquipment: 5000,
        totalPrice: 41000,
        depositAmount: 12300,
        remainingBalance: 28700,
      },
      status: 'CONFIRMADA',
      createdAt: '2026-11-17T10:00:00.000Z',
    }
  ];

  return { rooms, equipment, reservations };
}

class DatabaseStore {
  private data: SoundBoxDatabase;

  constructor() {
    this.data = getInitialSeedData();
  }

  public getDb(): SoundBoxDatabase {
    return this.data;
  }

  public reset(): void {
    this.data = getInitialSeedData();
  }
}

export const dbStore = new DatabaseStore();

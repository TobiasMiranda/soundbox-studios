import React from 'react';
import { Room } from '../types';
import { Users, Disc3, ArrowRight, Sparkles } from 'lucide-react';

interface RoomListProps {
  rooms: Room[];
  loading: boolean;
  onSelectRoom: (room: Room) => void;
}

export const RoomList: React.FC<RoomListProps> = ({ rooms, loading, onSelectRoom }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94a3b8' }}>
        <Disc3 size={40} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#f59e0b' }} />
        <p>Cargando catálogo acústico de SoundBox Studios...</p>
      </div>
    );
  }

  return (
    <section>
      <div className="hero">
        <div className="hero-badge">
          <Sparkles size={14} /> TECNOLOGÍA ACÚSTICA & CALIBRACIÓN PROFESIONAL
        </div>
        <h1 className="hero-title">
          Salas diseñadas para <span>sonar en grande</span>
        </h1>
        <p className="hero-subtitle">
          Aislación acústica flotante, equipamiento de primer nivel y un sistema de reservas que garantiza 
          <strong> 15 minutos de buffer técnico</strong> entre bandas para que nunca ensayes apurado.
        </p>
      </div>

      <div className="cards-grid">
        {rooms.map((room) => (
          <div key={room.id} className="card">
            {room.imageUrl && (
              <img src={room.imageUrl} alt={room.name} className="card-img" />
            )}
            <div className="card-title">
              <span>{room.name}</span>
              <span className={`tag-badge ${room.type}`}>{room.type}</span>
            </div>
            <p className="card-desc">{room.description}</p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                <Users size={16} color="#06b6d4" />
                <span>Aforo máx: <strong>{room.capacity} personas</strong></span>
              </div>
            </div>

            <div style={{ background: '#0a0b0e', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem', fontWeight: 600 }}>
                Backline Incluido:
              </div>
              <ul style={{ listStyle: 'none', fontSize: '0.8rem', color: '#94a3b8' }}>
                {room.includedGear.slice(0, 3).map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                    <span style={{ color: '#f59e0b' }}>•</span> {item}
                  </li>
                ))}
                {room.includedGear.length > 3 && (
                  <li style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.75rem' }}>
                    +{room.includedGear.length - 3} elementos adicionales
                  </li>
                )}
              </ul>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #242834' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Tarifa Base:</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b' }}>
                  ${room.hourlyRate.toLocaleString('es-AR')}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}> / hora</span>
              </div>
              <button className="btn btn-primary" onClick={() => onSelectRoom(room)}>
                Reservar <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

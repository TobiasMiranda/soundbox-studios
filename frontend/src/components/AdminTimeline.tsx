import React, { useState, useEffect } from 'react';
import { fetchAdminTimeline } from '../services/api';
import { Calendar, Clock, Wrench, ShieldCheck, Disc3 } from 'lucide-react';

export const AdminTimeline: React.FC = () => {
  const [date, setDate] = useState<string>('2026-11-20');
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTimeline();
  }, [date]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminTimeline(date);
      setTimeline(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Agenda Diaria & Visualizador de Buffer Técnico
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Monitoreo en tiempo real de salas con los <strong>15 minutos obligatorios de mantenimiento</strong> (RN1)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Fecha de Agenda:</label>
          <input
            type="date"
            className="form-input"
            style={{ width: 'auto' }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* Leyenda Explicativa */}
      <div style={{ display: 'flex', gap: '1.5rem', background: '#13151b', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #242834', marginBottom: '1.5rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 14, height: 14, background: '#10b981', borderRadius: 3 }} />
          <span>Turno Confirmado / En Curso</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 14, height: 14, background: 'repeating-linear-gradient(45deg, #8b5cf6, #8b5cf6 3px, #7c3aed 3px, #7c3aed 6px)', borderRadius: 3 }} />
          <span style={{ color: '#c4b5fd', fontWeight: 600 }}>Buffer Técnico Obligatorio (15 min)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 14, height: 14, background: '#1e293b', border: '1px dashed #475569', borderRadius: 3 }} />
          <span>Horario Libre Disponible</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
          <Disc3 size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#f59e0b' }} />
          <p>Cargando cronograma del estudio...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {timeline?.rooms?.map((room: any) => (
            <div key={room.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{room.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Capacidad máxima: {room.capacity} músicos · Tarifa: ${room.hourlyRate ? room.hourlyRate.toLocaleString('es-AR') : ''}/h
                  </span>
                </div>
                <span className={`tag-badge ${room.type}`}>{room.type}</span>
              </div>

              {/* Lista de Reservas del día con su buffer */}
              {room.reservations.length === 0 ? (
                <div style={{ background: '#0a0b0e', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  Sin turnos agendados para esta fecha. Sala 100% disponible.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {room.reservations.map((res: any) => (
                    <div
                      key={res.id}
                      style={{
                        background: '#0d0f14',
                        border: '1px solid #242834',
                        borderRadius: '0.5rem',
                        padding: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            border: '1px solid #10b981',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '0.35rem',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {res.startTime} - {res.endTime}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>{res.bandName}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                            Código: {res.code} · {res.attendeesCount} integrantes · {res.clientName}
                          </span>
                        </div>
                      </div>

                      {/* Bloque explícito de Buffer de 15 minutos */}
                      <div
                        className="buffer-block"
                        style={{
                          padding: '0.4rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <Wrench size={14} />
                        <span>Buffer Técnico de 15 min: {res.endTime} a {res.bufferEndTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

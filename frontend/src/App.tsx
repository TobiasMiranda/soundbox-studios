import React, { useState, useEffect } from 'react';
import { Room, Equipment } from './types';
import { fetchRooms, fetchEquipment } from './services/api';
import { Navbar } from './components/Navbar';
import { RoomList } from './components/RoomList';
import { BookingWizard } from './components/BookingWizard';
import { MyReservations } from './components/MyReservations';
import { AdminTimeline } from './components/AdminTimeline';
import { BusinessRulesVerifier } from './components/BusinessRulesVerifier';
import { CheckCircle2, FileText, Code2, ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de Reserva
  const [bookingOpen, setBookingOpen] = useState<boolean>(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [confirmedCode, setConfirmedCode] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, eqData] = await Promise.all([fetchRooms(), fetchEquipment()]);
      setRooms(roomsData);
      setEquipment(eqData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error de conexión con el backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = (room: Room) => {
    setSelectedRoomForBooking(room);
    setBookingOpen(true);
  };

  const handleReservationSuccess = (code: string) => {
    setBookingOpen(false);
    setConfirmedCode(code);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBooking={() => {
          setSelectedRoomForBooking(null);
          setBookingOpen(true);
        }}
      />

      <main className="container" style={{ flex: 1, paddingBottom: '4rem' }}>
        {error && (
          <div className="alert-box alert-error" style={{ marginTop: '1.5rem' }}>
            <ShieldAlert size={20} />
            <div>
              <strong>Aviso de Conexión:</strong> {error}
              <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Verifique que el backend esté ejecutándose en http://localhost:3000
              </div>
            </div>
          </div>
        )}

        {/* Modal de éxito tras crear reserva */}
        {confirmedCode && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(16, 185, 129, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#10b981' }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                ¡Turno Reservado con Éxito!
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                Su lugar y el buffer técnico de 15 minutos han sido bloqueados. Guarde su código único:
              </p>
              <div style={{ background: '#0a0b0e', border: '2px dashed #f59e0b', borderRadius: '0.75rem', padding: '1rem', display: 'inline-block', marginBottom: '1.75rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', letterSpacing: '0.08em' }}>
                  {confirmedCode}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmedCode(null)}
                >
                  Cerrar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setConfirmedCode(null);
                    setActiveTab('my-reservations');
                  }}
                >
                  Ver en Mis Reservas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wizard de Reserva */}
        {bookingOpen && (
          <BookingWizard
            rooms={rooms}
            equipmentCatalog={equipment}
            selectedRoom={selectedRoomForBooking}
            onClose={() => setBookingOpen(false)}
            onReservationSuccess={handleReservationSuccess}
          />
        )}

        {/* Renderizado de Vistas */}
        {activeTab === 'rooms' && (
          <RoomList
            rooms={rooms}
            loading={loading}
            onSelectRoom={handleSelectRoom}
          />
        )}

        {activeTab === 'my-reservations' && <MyReservations />}

        {activeTab === 'admin' && <AdminTimeline />}

        {activeTab === 'rules' && <BusinessRulesVerifier />}
      </main>

      {/* Footer Académico */}
      <footer style={{ borderTop: '1px solid #242834', background: '#0a0b0e', padding: '2rem 0', color: '#64748b', fontSize: '0.85rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong style={{ color: '#f1f5f9' }}>SoundBox Studios</strong> — Proyecto Final IA-First
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>
              Generación T · Bootcamp IA-First · Módulos 4 y 5
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileText size={14} color="#f59e0b" /> Metodología SDD & TDD
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Code2 size={14} color="#06b6d4" /> React + Express + TypeScript
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;

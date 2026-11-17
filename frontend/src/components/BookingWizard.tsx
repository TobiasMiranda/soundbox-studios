import React, { useState, useEffect } from 'react';
import { Room, Equipment, PricingBreakdown } from '../types';
import { quoteReservation, createReservation } from '../services/api';
import { X, Calendar, Clock, Users, ShieldAlert, CheckCircle, Disc3, Info } from 'lucide-react';

interface BookingWizardProps {
  rooms: Room[];
  equipmentCatalog: Equipment[];
  selectedRoom: Room | null;
  onClose: () => void;
  onReservationSuccess: (code: string) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  rooms,
  equipmentCatalog,
  selectedRoom,
  onClose,
  onReservationSuccess,
}) => {
  const [roomId, setRoomId] = useState<string>(selectedRoom ? selectedRoom.id : rooms[0]?.id || '');
  const [date, setDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState<string>('18:00');
  const [endTime, setEndTime] = useState<string>('20:00');
  const [attendeesCount, setAttendeesCount] = useState<number>(4);
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [bandName, setBandName] = useState<string>('');
  const [selectedGear, setSelectedGear] = useState<{ [eqId: string]: number }>({});

  const [quote, setQuote] = useState<PricingBreakdown | null>(null);
  const [quoteLoading, setQuoteLoading] = useState<boolean>(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentRoom = rooms.find((r) => r.id === roomId) || rooms[0];

  // Actualizar cotización en tiempo real
  useEffect(() => {
    let active = true;
    const fetchLiveQuote = async () => {
      if (!roomId || !date || !startTime || !endTime) return;
      setQuoteLoading(true);
      setQuoteError(null);

      try {
        const gearList = Object.entries(selectedGear)
          .filter(([_, qty]) => qty > 0)
          .map(([equipmentId, quantity]) => ({ equipmentId, quantity }));

        const result = await quoteReservation({
          roomId,
          date,
          startTime,
          endTime,
          attendeesCount,
          selectedEquipment: gearList,
        });

        if (active) setQuote(result);
      } catch (err: any) {
        if (active) {
          setQuote(null);
          setQuoteError(err.message);
        }
      } finally {
        if (active) setQuoteLoading(false);
      }
    };

    fetchLiveQuote();
    return () => {
      active = false;
    };
  }, [roomId, date, startTime, endTime, attendeesCount, selectedGear]);

  const handleGearChange = (eqId: string, delta: number) => {
    const currentQty = selectedGear[eqId] || 0;
    const nextQty = Math.max(0, currentQty + delta);
    setSelectedGear((prev) => ({ ...prev, [eqId]: nextQty }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const gearList = Object.entries(selectedGear)
        .filter(([_, qty]) => qty > 0)
        .map(([equipmentId, quantity]) => ({ equipmentId, quantity }));

      const res = await createReservation({
        roomId,
        clientName,
        clientEmail,
        clientPhone,
        bandName,
        attendeesCount,
        date,
        startTime,
        endTime,
        selectedEquipment: gearList,
      });

      onReservationSuccess(res.code);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 36, height: 36, background: 'rgba(245, 158, 11, 0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={20} color="#f59e0b" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Reserva de Turno</h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Validación horaria en tiempo real con 15 minutos de buffer técnico garantizado
            </p>
          </div>
        </div>

        {submitError && (
          <div className="alert-box alert-error">
            <ShieldAlert size={20} />
            <div>
              <strong>No fue posible completar la reserva:</strong>
              <div style={{ marginTop: '0.25rem' }}>{submitError}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Selección de Sala */}
          <div className="form-group">
            <label className="form-label">Sala de Ensayo / Grabación:</label>
            <select
              className="form-select"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (Aforo máx: {r.capacity} personas) - ${r.hourlyRate.toLocaleString('es-AR')}/h
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Horarios */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label">Fecha:</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Inicio (HH:mm):</label>
              <select
                className="form-select"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                {['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Fin (HH:mm):</label>
              <select
                className="form-select"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              >
                {['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '24:00'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cantidad de Integrantes y Banda */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label">
                Cantidad de Músicos (Aforo máx: {currentRoom?.capacity}):
              </label>
              <input
                type="number"
                min="1"
                max="25"
                className="form-input"
                value={attendeesCount}
                onChange={(e) => setAttendeesCount(parseInt(e.target.value) || 1)}
                required
              />
              {currentRoom && attendeesCount > currentRoom.capacity && (
                <div style={{ color: '#f43f5e', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  ⚠️ Excede el aforo de la sala ({currentRoom.capacity} personas).
                </div>
              )}
            </div>
            <div>
              <label className="form-label">Nombre de la Banda / Proyecto:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Los Sonámbulos"
                value={bandName}
                onChange={(e) => setBandName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Datos de Contacto */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="form-label">Nombre del Responsable:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Juan Pérez"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Email de Contacto:</label>
              <input
                type="email"
                className="form-input"
                placeholder="juan@email.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Teléfono / WhatsApp:</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+54 11 ..."
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Selección de Equipamiento Adicional */}
          <div style={{ background: '#0a0b0e', border: '1px solid #242834', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Disc3 size={16} color="#f59e0b" /> Equipamiento Premium Adicional (Stock Compartido)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {equipmentCatalog.map((eq) => {
                const qty = selectedGear[eq.id] || 0;
                return (
                  <div key={eq.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#13151b', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #242834' }}>
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{eq.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        +${eq.hourlyPrice.toLocaleString('es-AR')}/h (Stock: {eq.totalStock})
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleGearChange(eq.id, -1)}
                        style={{ width: 26, height: 26, background: '#242834', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer' }}
                        disabled={qty <= 0}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: 16, textAlign: 'center' }}>
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleGearChange(eq.id, 1)}
                        style={{ width: 26, height: 26, background: '#f59e0b', border: 'none', color: '#000', borderRadius: 4, cursor: 'pointer', fontWeight: 700 }}
                        disabled={qty >= eq.totalStock}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desglose de Cotización en Tiempo Real */}
          <div style={{ background: '#161922', border: '1px solid #2d3345', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#cbd5e1' }}>
                Desglose Presupuestario
              </span>
              {quoteLoading && <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Calculando tarifa...</span>}
            </div>

            {quoteError ? (
              <div style={{ color: '#f87171', fontSize: '0.85rem', padding: '0.5rem 0' }}>
                ⚠️ {quoteError}
              </div>
            ) : quote ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#94a3b8' }}>
                  <span>Tarifa Base ({quote.durationHours} hs x ${quote.baseHourlyRate.toLocaleString('es-AR')}):</span>
                  <span>${quote.subtotalBase.toLocaleString('es-AR')}</span>
                </div>

                {quote.offPeakDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#10b981' }}>
                    <span>Descuento Diurno Off-Peak (-20%):</span>
                    <span>-${quote.offPeakDiscount.toLocaleString('es-AR')}</span>
                  </div>
                )}

                {quote.lateNightSurcharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#f59e0b' }}>
                    <span>Recargo Nocturno (+25%):</span>
                    <span>+${quote.lateNightSurcharge.toLocaleString('es-AR')}</span>
                  </div>
                )}

                {quote.weekendSurcharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#a855f7' }}>
                    <span>Recargo Fin de Semana (+15%):</span>
                    <span>+${quote.weekendSurcharge.toLocaleString('es-AR')}</span>
                  </div>
                )}

                {quote.subtotalEquipment > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#06b6d4' }}>
                    <span>Equipamiento Adicional ({quote.equipmentItems.length} ítems):</span>
                    <span>+${quote.subtotalEquipment.toLocaleString('es-AR')}</span>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #2d3345', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>Total de la Sesión:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f1f5f9' }}>
                      ${quote.totalPrice.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: '#f59e0b', display: 'block', fontWeight: 700 }}>
                      Seña Requerida (30%):
                    </span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b' }}>
                      ${quote.depositAmount.toLocaleString('es-AR')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                      Saldo en Check-in: ${quote.remainingBalance.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="alert-box alert-info" style={{ marginBottom: '1.5rem' }}>
            <Info size={18} />
            <div style={{ fontSize: '0.8rem' }}>
              <strong>Buffer Técnico Garantizado (RN1):</strong> Al confirmarse, el sistema bloqueará automáticamente
              <strong> 15 minutos</strong> posteriores para la sanitización y calibración de instrumentos por parte del sonidista.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !!quoteError || !clientName || !clientEmail}
            >
              {submitting ? 'Confirmando y Bloqueando...' : 'Pagar Seña y Confirmar Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Reservation, CancellationResult } from '../types';
import { getReservationByCode, checkInReservation, cancelReservation } from '../services/api';
import { Search, CheckCircle2, AlertOctagon, Clock, DollarSign, Users, XCircle, ArrowRight } from 'lucide-react';

export const MyReservations: React.FC = () => {
  const [searchCode, setSearchCode] = useState<string>('SB-8821');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de acciones
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal de Cancelación con simulador
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Cambio imprevisto de agenda');
  const [simulatedCancelHoursBefore, setSimulatedCancelHoursBefore] = useState<number>(72);
  const [cancelling, setCancelling] = useState<boolean>(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCode.trim()) return;

    setLoading(true);
    setError(null);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await getReservationByCode(searchCode.trim());
      setReservation(res);
    } catch (err: any) {
      setReservation(null);
      setError(err.message || 'Reserva no encontrada.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!reservation) return;
    setActionError(null);
    setActionSuccess(null);

    try {
      // Simular hora dentro de la ventana (10 min antes del turno)
      const [year, month, day] = reservation.date.split('-').map(Number);
      const [hours, minutes] = reservation.startTime.split(':').map(Number);
      const simulatedTime = new Date(year, month - 1, day, hours, minutes - 10).toISOString();

      const result = await checkInReservation(reservation.code, simulatedTime);
      setReservation(result.reservation);
      setActionSuccess(`¡Check-in exitoso! Se registró el cobro del saldo presencial de $${result.remainingBalanceCollected.toLocaleString('es-AR')}.`);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleConfirmCancel = async () => {
    if (!reservation) return;
    setCancelling(true);
    setActionError(null);

    try {
      // Calcular timestamp simulado según horas antes
      const [year, month, day] = reservation.date.split('-').map(Number);
      const [hours, minutes] = reservation.startTime.split(':').map(Number);
      const startMs = new Date(year, month - 1, day, hours, minutes).getTime();
      const cancelMs = startMs - simulatedCancelHoursBefore * 60 * 60 * 1000;
      const simulatedIso = new Date(cancelMs).toISOString();

      const result = await cancelReservation(reservation.code, cancelReason, simulatedIso);
      setReservation(result.reservation);
      setShowCancelModal(false);
      setActionSuccess(`Reserva cancelada. ${result.cancellation.message}`);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div style={{ maxWidth: 850, margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Gestión de Reserva & Check-in
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Consulte su turno por código único, realice el check-in presencial o liquide su cancelación escalonada (RN5).
        </p>
      </div>

      {/* Barra de Búsqueda */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.75rem', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em' }}
            placeholder="Ingrese código de reserva (ej: SB-8821)"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar Reserva'}
        </button>
      </form>

      {error && (
        <div className="alert-box alert-error">
          <AlertOctagon size={20} />
          <div>{error}</div>
        </div>
      )}

      {actionSuccess && (
        <div className="alert-box alert-success">
          <CheckCircle2 size={20} />
          <div>{actionSuccess}</div>
        </div>
      )}

      {actionError && (
        <div className="alert-box alert-error">
          <AlertOctagon size={20} />
          <div>{actionError}</div>
        </div>
      )}

      {reservation && (
        <div className="card" style={{ borderColor: '#334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #242834', paddingBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>Código de Reserva:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.05em' }}>
                {reservation.code}
              </span>
            </div>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background:
                    reservation.status === 'CONFIRMADA'
                      ? 'rgba(16, 185, 129, 0.15)'
                      : reservation.status === 'EN_CURSO'
                      ? 'rgba(6, 182, 212, 0.15)'
                      : reservation.status === 'CANCELADA'
                      ? 'rgba(244, 63, 94, 0.15)'
                      : 'rgba(245, 158, 11, 0.15)',
                  color:
                    reservation.status === 'CONFIRMADA'
                      ? '#10b981'
                      : reservation.status === 'EN_CURSO'
                      ? '#06b6d4'
                      : reservation.status === 'CANCELADA'
                      ? '#f43f5e'
                      : '#f59e0b',
                  border: '1px solid currentColor',
                }}
              >
                ● ESTADO: {reservation.status}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Banda / Proyecto:</span>
              <strong style={{ fontSize: '1.1rem' }}>{reservation.bandName}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Sala Contratada:</span>
              <strong style={{ fontSize: '1.1rem' }}>{reservation.pricing.roomName}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Fecha y Horario:</span>
              <strong style={{ fontSize: '1.1rem' }}>
                {reservation.date} · {reservation.startTime} a {reservation.endTime}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Músicos Asistentes:</span>
              <strong style={{ fontSize: '1.1rem' }}>{reservation.attendeesCount} personas</strong>
            </div>
          </div>

          {/* Estado de Pagos */}
          <div style={{ background: '#0d0f14', border: '1px solid #242834', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total de la Contratación:</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>${reservation.pricing.totalPrice.toLocaleString('es-AR')}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Seña Pagada (30%):</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                  ${reservation.pricing.depositAmount.toLocaleString('es-AR')}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Saldo en Check-in (70%):</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>
                  ${reservation.pricing.remainingBalance.toLocaleString('es-AR')}
                </div>
              </div>
            </div>
          </div>

          {/* Datos de Cancelación si aplica */}
          {reservation.status === 'CANCELADA' && (
            <div className="alert-box alert-error" style={{ marginBottom: '1.5rem' }}>
              <XCircle size={20} />
              <div>
                <strong>Reserva Cancelada:</strong>
                <div>Motivo: {reservation.cancellationReason}</div>
                <div>Reintegro liquidado: ${reservation.cancellationRefund?.toLocaleString('es-AR')}</div>
                <div>Penalidad retenida: ${reservation.cancellationFee?.toLocaleString('es-AR')}</div>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {reservation.status === 'CONFIRMADA' && (
              <>
                <button className="btn btn-secondary" onClick={() => setShowCancelModal(true)}>
                  <AlertOctagon size={16} />
                  Simular / Cancelar Reserva (RN5)
                </button>
                <button className="btn btn-primary" onClick={handleCheckIn}>
                  <CheckCircle2 size={16} />
                  Realizar Check-in (Recepción)
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Simulador de Cancelación */}
      {showCancelModal && reservation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: '#f43f5e' }}>
              Simulador y Ejecución de Cancelación (RN5)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Pruebe cómo el algoritmo calcula la liquidación de la seña (${reservation.pricing.depositAmount}) según la antelación de horas:
            </p>

            <div className="form-group">
              <label className="form-label">Antelación respecto al inicio del turno:</label>
              <select
                className="form-select"
                value={simulatedCancelHoursBefore}
                onChange={(e) => setSimulatedCancelHoursBefore(Number(e.target.value))}
              >
                <option value={72}>72 horas antes (más de 48 hs) - Reintegro 100% ($ {reservation.pricing.depositAmount})</option>
                <option value={36}>36 horas antes (24 hs a 48 hs) - Reintegro 50% ($ {reservation.pricing.depositAmount * 0.5})</option>
                <option value={10}>10 horas antes (menos de 24 hs) - Reintegro 0% (Retención total $ {reservation.pricing.depositAmount})</option>
              </select>
            </div>

            <div style={{ background: '#0a0b0e', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #242834', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                <strong>Resultado de Liquidación Escalonada:</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <span>Reembolso al cliente:</span>
                <strong style={{ color: simulatedCancelHoursBefore >= 48 ? '#10b981' : simulatedCancelHoursBefore >= 24 ? '#f59e0b' : '#f43f5e' }}>
                  {simulatedCancelHoursBefore >= 48
                    ? `100% ($${reservation.pricing.depositAmount.toLocaleString('es-AR')})`
                    : simulatedCancelHoursBefore >= 24
                    ? `50% ($${(reservation.pricing.depositAmount * 0.5).toLocaleString('es-AR')})`
                    : `0% ($0)`}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#94a3b8' }}>
                <span>Retención para el estudio:</span>
                <strong>
                  {simulatedCancelHoursBefore >= 48
                    ? `$0`
                    : simulatedCancelHoursBefore >= 24
                    ? `$${(reservation.pricing.depositAmount * 0.5).toLocaleString('es-AR')}`
                    : `$${reservation.pricing.depositAmount.toLocaleString('es-AR')}`}
                </strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Motivo de cancelación:</label>
              <input
                type="text"
                className="form-input"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                Cerrar
              </button>
              <button className="btn btn-danger" onClick={handleConfirmCancel} disabled={cancelling}>
                {cancelling ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { ShieldCheck, Play, CheckCircle2, XCircle, ArrowRight, Disc3 } from 'lucide-react';

interface RuleTestResult {
  ruleId: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  message: string;
  payloadSent: any;
  responseReceived: any;
}

export const BusinessRulesVerifier: React.FC = () => {
  const [results, setResults] = useState<{ [ruleId: string]: RuleTestResult }>({});

  const runTest = async (ruleId: string, testFn: () => Promise<{ payload: any; response: any; passed: boolean; message: string }>) => {
    setResults((prev) => ({
      ...prev,
      [ruleId]: { ruleId, name: ruleId, status: 'running', message: 'Ejecutando prueba contra API backend...', payloadSent: null, responseReceived: null },
    }));

    try {
      const outcome = await testFn();
      setResults((prev) => ({
        ...prev,
        [ruleId]: {
          ruleId,
          name: ruleId,
          status: outcome.passed ? 'success' : 'failed',
          message: outcome.message,
          payloadSent: outcome.payload,
          responseReceived: outcome.response,
        },
      }));
    } catch (err: any) {
      setResults((prev) => ({
        ...prev,
        [ruleId]: {
          ruleId,
          name: ruleId,
          status: 'failed',
          message: `Error inesperado: ${err.message}`,
          payloadSent: null,
          responseReceived: null,
        },
      }));
    }
  };

  // Test RN1: Buffer Técnico de 15 min
  const testRN1 = async () => {
    // La reserva demo ocupa de 18:00 a 20:00 (Buffer va hasta 20:15 en Sala Electric el 2026-11-20).
    // Intentamos reservar de 20:00 a 22:00
    const payload = {
      roomId: 'room-electric',
      clientName: 'Prueba Evaluador RN1',
      clientEmail: 'evaluador@test.com',
      bandName: 'Banda Buffer Test',
      attendeesCount: 4,
      date: '2026-11-20',
      startTime: '20:00',
      endTime: '22:00',
    };

    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    const passed = res.status === 409 && json.message.includes('buffer técnico de 15 minutos');
    return {
      payload,
      response: json,
      passed,
      message: passed
        ? 'Rechazado exitosamente con 409. El sistema defendió el buffer técnico de 15 minutos entre turnos.'
        : 'Fallo: No se rechazó la colisión del buffer técnico.',
    };
  };

  // Test RN2: Capacidad Máxima (Aforo)
  const testRN2 = async () => {
    // Sala Abbey tiene aforo 4. Enviamos 7 personas.
    const payload = {
      roomId: 'room-abbey',
      clientName: 'Prueba Evaluador RN2',
      clientEmail: 'evaluador@test.com',
      bandName: 'Orquesta Masiva',
      attendeesCount: 7,
      date: '2026-11-28',
      startTime: '14:00',
      endTime: '16:00',
    };

    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    const passed = res.status === 400 && json.message.includes('excede la capacidad máxima');
    return {
      payload,
      response: json,
      passed,
      message: passed
        ? 'Rechazado exitosamente con 400. Se impidió el exceso de aforo en la Sala Abbey (límite 4).'
        : 'Fallo: Se permitió exceder el aforo.',
    };
  };

  // Test RN4: Tarifas Dinámicas (Descuento Off-Peak 20%)
  const testRN4 = async () => {
    const payload = {
      roomId: 'room-electric',
      date: '2026-11-25', // Miércoles
      startTime: '12:00',
      endTime: '14:00',
      attendeesCount: 4,
    };

    const res = await fetch('/api/reservations/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    const hasDiscount = json.data && json.data.offPeakDiscount > 0 && json.data.depositAmount === Math.round(json.data.totalPrice * 0.3);
    return {
      payload,
      response: json,
      passed: hasDiscount,
      message: hasDiscount
        ? `Cotización correcta: Descuento Off-Peak aplicado (-$${json.data.offPeakDiscount}) y seña del 30% calculada ($${json.data.depositAmount}).`
        : 'Fallo en cálculo de tarifa dinámica.',
    };
  };

  // Test RN7: Stock Compartido de Equipamiento
  const testRN7 = async () => {
    // Intentar pedir 4 cabezales Marshall cuando el total del estudio es 2
    const payload = {
      roomId: 'room-electric',
      clientName: 'Prueba RN7',
      clientEmail: 'rn7@test.com',
      bandName: 'Guitar Wall',
      attendeesCount: 4,
      date: '2026-11-27',
      startTime: '18:00',
      endTime: '20:00',
      selectedEquipment: [{ equipmentId: 'eq-marshall-jcm800', quantity: 4 }],
    };

    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    const passed = res.status === 400 && json.message.includes('supera el stock total');
    return {
      payload,
      response: json,
      passed,
      message: passed
        ? 'Rechazado exitosamente con 400. El inventario impidió comprometer más equipos que el stock físico.'
        : 'Fallo: No se validó el stock de equipamiento.',
    };
  };

  return (
    <div style={{ maxWidth: 950, margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="hero-badge">
          <ShieldCheck size={14} /> MÓDULO DE EVALUACIÓN ACADÉMICA
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Verificador en Vivo de Reglas de Negocio (RN1 a RN8)
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: 700, margin: '0 auto' }}>
          Este panel interactivo permite al docente o evaluador del curso disparar peticiones directas a la API del backend
          para auditar el cumplimiento estricto y determinístico de cada regla de negocio y criterio de aceptación.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* RN1 Test Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span className="tag-badge estandar" style={{ marginBottom: '0.35rem' }}>REGLA RN1 & RN6</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Buffer Técnico de 15 Minutos y Prevención de Colisión
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Evalúa si el sistema rechaza una reserva inmediata de 20:00 a 22:00 cuando el turno previo finaliza a las 20:00 (requiere 15 min hasta las 20:15).
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => runTest('RN1', testRN1)}>
              <Play size={14} /> Probar Regla
            </button>
          </div>

          {results['RN1'] && (
            <div style={{ marginTop: '1rem', background: '#0a0b0e', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #242834' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 700, color: results['RN1'].status === 'success' ? '#10b981' : '#f43f5e' }}>
                {results['RN1'].status === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {results['RN1'].message}
              </div>
              <pre style={{ fontSize: '0.75rem', color: '#94a3b8', overflowX: 'auto', background: '#13151b', padding: '0.5rem', borderRadius: '0.25rem' }}>
                {JSON.stringify(results['RN1'].responseReceived, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* RN2 Test Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span className="tag-badge acustica" style={{ marginBottom: '0.35rem' }}>REGLA RN2</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Control Estricto de Aforo y Capacidad Máxima
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Intenta enviar una banda de 7 integrantes a la Sala Abbey (capacidad física máxima: 4 personas).
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => runTest('RN2', testRN2)}>
              <Play size={14} /> Probar Regla
            </button>
          </div>

          {results['RN2'] && (
            <div style={{ marginTop: '1rem', background: '#0a0b0e', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #242834' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 700, color: results['RN2'].status === 'success' ? '#10b981' : '#f43f5e' }}>
                {results['RN2'].status === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {results['RN2'].message}
              </div>
              <pre style={{ fontSize: '0.75rem', color: '#94a3b8', overflowX: 'auto', background: '#13151b', padding: '0.5rem', borderRadius: '0.25rem' }}>
                {JSON.stringify(results['RN2'].responseReceived, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* RN4 Test Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span className="tag-badge escenario" style={{ marginBottom: '0.35rem' }}>REGLA RN4</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Franjas Tarifarias Dinámicas y Seña del 30%
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Cotiza un turno diurno de 12:00 a 14:00 (Off-Peak) verificando el 20% de descuento y la seña proporcional exacta.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => runTest('RN4', testRN4)}>
              <Play size={14} /> Probar Regla
            </button>
          </div>

          {results['RN4'] && (
            <div style={{ marginTop: '1rem', background: '#0a0b0e', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #242834' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 700, color: results['RN4'].status === 'success' ? '#10b981' : '#f43f5e' }}>
                {results['RN4'].status === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {results['RN4'].message}
              </div>
              <pre style={{ fontSize: '0.75rem', color: '#94a3b8', overflowX: 'auto', background: '#13151b', padding: '0.5rem', borderRadius: '0.25rem' }}>
                {JSON.stringify(results['RN4'].responseReceived, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* RN7 Test Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span className="tag-badge estandar" style={{ marginBottom: '0.35rem' }}>REGLA RN7</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Control de Stock Compartido de Equipamiento
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Intenta reservar 4 cabezales Marshall valvulares cuando el stock total compartido del estudio es 2.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => runTest('RN7', testRN7)}>
              <Play size={14} /> Probar Regla
            </button>
          </div>

          {results['RN7'] && (
            <div style={{ marginTop: '1rem', background: '#0a0b0e', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #242834' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 700, color: results['RN7'].status === 'success' ? '#10b981' : '#f43f5e' }}>
                {results['RN7'].status === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {results['RN7'].message}
              </div>
              <pre style={{ fontSize: '0.75rem', color: '#94a3b8', overflowX: 'auto', background: '#13151b', padding: '0.5rem', borderRadius: '0.25rem' }}>
                {JSON.stringify(results['RN7'].responseReceived, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Volume2, Calendar, Search, ShieldCheck, Clock, Sliders } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenBooking }) => {
  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo-area" onClick={() => setActiveTab('rooms')}>
          <div className="logo-icon">
            <Volume2 size={22} color="#000" />
          </div>
          <div>
            <div className="logo-text">SoundBox Studios</div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.05em' }}>
              RESERVA INTELIGENTE DE SALAS
            </div>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            <Sliders size={16} />
            Salas
          </button>
          <button
            className={`nav-btn ${activeTab === 'my-reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-reservations')}
          >
            <Search size={16} />
            Mis Reservas & Check-in
          </button>
          <button
            className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <Clock size={16} />
            Agenda & Buffer
          </button>
          <button
            className={`nav-btn ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            <ShieldCheck size={16} />
            Validador de Reglas (RN)
          </button>
        </nav>

        <div>
          <button className="btn btn-primary" onClick={onOpenBooking}>
            <Calendar size={16} />
            Reservar Turno
          </button>
        </div>
      </div>
    </header>
  );
};

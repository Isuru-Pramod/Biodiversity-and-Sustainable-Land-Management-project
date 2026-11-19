import { ArrowLeft, ClipboardList, Database, Map } from 'lucide-react';

const navigation = [
  { id: 'map', label: 'Map View', icon: Map },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'questionnaire', label: 'Questionnaire', icon: ClipboardList },
];

export default function BaselineHeader({ activePage, onNavigate, onBack, isOnline }) {
  return (
    <header className="app-header baseline-header">
      <div className="header-inner">

        <button className="brand baseline-brand" onClick={onBack} aria-label="Return to project categories">
          <img className="w-[50px]" src="/Logo_3.png" alt="Logo" />
          <span className="brand-copy">
            <span className="brand-subtitle">Value chain <span className="breadcrumb-divider">/</span> Tea Small holder Baseline</span>
          </span>
          <ArrowLeft className="baseline-back-icon" size={15} />
        </button>

        <nav className="top-nav mr-[200px]" aria-label="Baseline navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`nav-link ${activePage === id ? 'active' : ''}`}
              aria-current={activePage === id ? 'page' : undefined}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="header-status">
          <span className={`status-dot ${isOnline ? 'online' : ''}`} />
          <span>{isOnline ? 'System online' : 'GIS workspace'}</span>
        </div>
      </div>
    </header>
  );
}

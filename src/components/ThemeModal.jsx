import { useEffect, useRef } from 'react';

export const THEMES = [
  {
    id: 'dark',
    name: 'Cosmos',
    description: 'Oscuro profundo con acentos neón',
    preview: { bg: '#0D1117', surface: '#141824', accent: '#F0A500', violet: '#6C63FF', teal: '#2DD4BF' },
  },
  {
    id: 'light',
    name: 'Bosque',
    description: 'Claridad natural con tonos verdes',
    preview: { bg: '#F2F5EE', surface: '#FFFFFF', accent: '#D4630A', violet: '#3A7D44', teal: '#2A9D8F' },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Gradientes boreales sobre fondo medianoche',
    preview: { bg: '#0A0E1A', surface: '#111827', accent: '#22D3EE', violet: '#A78BFA', teal: '#34D399' },
  },
  {
    id: 'sand',
    name: 'Arena',
    description: 'Cálido y desértico, tipografía serif',
    preview: { bg: '#F5EFE0', surface: '#FFFBF2', accent: '#C2681A', violet: '#8B5CF6', teal: '#0D9488' },
  },
  {
    id: 'midnight',
    name: 'Medianoche',
    description: 'Azul profundo con acentos plateados',
    preview: { bg: '#0B1120', surface: '#0F1932', accent: '#60A5FA', violet: '#818CF8', teal: '#5EEAD4' },
  },
  {
    id: 'rose',
    name: 'Rosacea',
    description: 'Pastel suave con contrastes de tinta',
    preview: { bg: '#FDF2F8', surface: '#FFFFFF', accent: '#DB2777', violet: '#9333EA', teal: '#0EA5E9' },
  },
];

export default function ThemeModal({ isOpen, onClose, currentTheme, onSelectTheme }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal__overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-modal-title"
      ref={dialogRef}
    >
      <div className="modal modal--lg theme-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="theme-modal__header-content">
            <h2 className="modal__title" id="theme-modal-title">Apariencia</h2>
            <p className="theme-modal__subtitle">Elige un tema visual para la aplicación</p>
          </div>
          <button className="modal__close-btn" onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="modal__body theme-modal__body">
          <div className="theme-modal__grid">
            {THEMES.map((theme) => {
              const isActive = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  className={`theme-card ${isActive ? 'theme-card--active' : ''}`}
                  onClick={() => { onSelectTheme(theme.id); onClose(); }}
                  aria-pressed={isActive}
                  title={theme.description}
                >
                  <div className="theme-card__preview" style={{ background: theme.preview.bg }}>
                    <div className="theme-card__preview-sidebar" style={{ background: theme.preview.surface }} />
                    <div className="theme-card__preview-board" style={{ background: theme.preview.bg }}>
                      <div className="theme-card__preview-col" style={{ background: theme.preview.surface }}>
                        <div className="theme-card__preview-bar" style={{ background: theme.preview.violet }} />
                        <div className="theme-card__preview-task" style={{ background: theme.preview.surface, borderLeftColor: theme.preview.accent }} />
                        <div className="theme-card__preview-task" style={{ background: theme.preview.surface, borderLeftColor: theme.preview.teal }} />
                      </div>
                      <div className="theme-card__preview-col" style={{ background: theme.preview.surface }}>
                        <div className="theme-card__preview-bar" style={{ background: theme.preview.accent }} />
                        <div className="theme-card__preview-task" style={{ background: theme.preview.surface, borderLeftColor: theme.preview.violet }} />
                      </div>
                    </div>
                    {isActive && (
                      <div className="theme-card__check">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="theme-card__info">
                    <span className="theme-card__name">{theme.name}</span>
                    <span className="theme-card__desc">{theme.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

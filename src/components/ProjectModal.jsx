import { useState, useEffect, useRef } from 'react';

const LABEL_COLORS = [
  { value: '#6C63FF', label: 'Violeta' },
  { value: '#F0A500', label: 'Ámbar' },
  { value: '#FB7185', label: 'Rosa' },
  { value: '#2DD4BF', label: 'Teal' },
  { value: '#34D399', label: 'Verde' },
  { value: '#60A5FA', label: 'Azul' },
];

export default function ProjectModal({ isOpen, onClose, onSubmit, initialName = '', initialColor = null }) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor || LABEL_COLORS[0].value);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const isEditing = Boolean(initialName);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setColor(initialColor || LABEL_COLORS[0].value);
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialName, initialColor]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('El nombre del proyecto es obligatorio'); return; }
    onSubmit(trimmed, color);
    onClose();
  };

  return (
    <div className="modal__overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
      <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title" id="project-modal-title">
            {isEditing ? 'Renombrar proyecto' : 'Nuevo proyecto'}
          </h2>
          <button className="modal__close-btn" onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form__group">
              <label className="form__label" htmlFor="project-name">Nombre del proyecto</label>
              <input
                id="project-name"
                ref={inputRef}
                type="text"
                className={`form__input ${error ? 'form__input--error' : ''}`}
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                placeholder="Ej: Rediseño de la web"
                maxLength={60}
              />
              {error && <span className="form__error">{error}</span>}
            </div>

            <div className="form__group">
              <span className="form__label">Color del proyecto</span>
              <div className="color-picker__group">
                {LABEL_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`color-picker__swatch ${color === c.value ? 'color-picker__swatch--active' : ''}`}
                    style={{ background: c.value }}
                    onClick={() => setColor(c.value)}
                    aria-label={c.label}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn--primary">
              {isEditing ? 'Guardar cambios' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

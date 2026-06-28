import { useState, useEffect, useRef } from 'react';

export default function ColumnModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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
    if (!trimmed) { setError('El nombre de la columna es obligatorio'); return; }
    onSubmit(trimmed);
    onClose();
  };

  return (
    <div className="modal__overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="column-modal-title">
      <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title" id="column-modal-title">Nueva columna</h2>
          <button className="modal__close-btn" onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form__group">
              <label className="form__label" htmlFor="column-name">Nombre de la columna</label>
              <input
                id="column-name"
                ref={inputRef}
                type="text"
                className={`form__input ${error ? 'form__input--error' : ''}`}
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                placeholder="Ej: En revisión"
                maxLength={40}
              />
              {error && <span className="form__error">{error}</span>}
            </div>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn--primary">Crear columna</button>
          </div>
        </form>
      </div>
    </div>
  );
}

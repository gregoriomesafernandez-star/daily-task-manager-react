import { useState, useEffect, useRef } from 'react';

const PRIORITIES = [
  { value: 'baja', label: 'Baja', color: '#2DD4BF' },
  { value: 'media', label: 'Media', color: '#F0A500' },
  { value: 'alta', label: 'Alta', color: '#FB7185' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  estimatedTime: '',
  priority: 'media',
};

export default function TaskModal({ isOpen, onClose, onSubmit, task = null }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const titleRef = useRef(null);
  const isEditing = Boolean(task);

  useEffect(() => {
    if (isOpen) {
      setForm(
        task
          ? {
              title: task.title,
              description: task.description || '',
              estimatedTime: task.estimatedTime || '',
              priority: task.priority,
            }
          : EMPTY_FORM
      );
      setErrors({});
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [isOpen, task]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'El título es obligatorio';
    if (form.estimatedTime !== '' && (isNaN(form.estimatedTime) || Number(form.estimatedTime) < 0)) {
      newErrors.estimatedTime = 'Introduce un número válido de minutos';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      estimatedTime: form.estimatedTime !== '' ? Number(form.estimatedTime) : null,
      priority: form.priority,
    });
    onClose();
  };

  return (
    <div className="modal__overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
      <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title" id="task-modal-title">
            {isEditing ? 'Editar tarea' : 'Nueva tarea'}
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
              <label className="form__label" htmlFor="task-title">
                Título <span className="form__required">*</span>
              </label>
              <input
                id="task-title"
                ref={titleRef}
                type="text"
                className={`form__input ${errors.title ? 'form__input--error' : ''}`}
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="¿Qué hay que hacer?"
                maxLength={100}
              />
              {errors.title && <span className="form__error">{errors.title}</span>}
            </div>

            <div className="form__group">
              <label className="form__label" htmlFor="task-desc">Descripción</label>
              <textarea
                id="task-desc"
                className="form__input form__textarea"
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Detalles, contexto, criterios de aceptación..."
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="form__group">
              <label className="form__label" htmlFor="task-time">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }}>
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Tiempo estimado (min)
              </label>
              <input
                id="task-time"
                type="number"
                className={`form__input ${errors.estimatedTime ? 'form__input--error' : ''}`}
                value={form.estimatedTime}
                onChange={(e) => setField('estimatedTime', e.target.value)}
                placeholder="Ej: 90"
                min="0"
                max="9999"
              />
              {errors.estimatedTime && <span className="form__error">{errors.estimatedTime}</span>}
            </div>

            <div className="form__group">
              <span className="form__label">Prioridad</span>
              <div className="priority__group">
                {PRIORITIES.map((p) => (
                  <label key={p.value} className={`priority__option ${form.priority === p.value ? 'priority__option--active' : ''}`}>
                    <input
                      type="radio"
                      name="priority"
                      value={p.value}
                      checked={form.priority === p.value}
                      onChange={() => setField('priority', p.value)}
                      className="sr-only"
                    />
                    <span className="priority__dot" style={{ background: p.color }} />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn--primary">
              {isEditing ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

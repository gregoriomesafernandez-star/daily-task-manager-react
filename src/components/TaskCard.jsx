import { formatMinutes } from '../utils/time';

const STATUS_COLORS = {
  todo: '#64748B',
  'in-progress': '#6C63FF',
  blocked: '#FB7185',
  done: '#2DD4BF',
};

const STATUS_LABELS = {
  todo: 'Por hacer',
  'in-progress': 'En progreso',
  blocked: 'Bloqueada',
  done: 'Completada',
};

const PRIORITY_COLORS = {
  alta: '#FB7185',
  media: '#F0A500',
  baja: '#2DD4BF',
};

export default function TaskCard({ task, columnId, onEdit, onDelete, onDragStart, isDragging }) {
  const priorityColor = PRIORITY_COLORS[task.priority] || '#F0A500';
  const timeStr = formatMinutes(task.estimatedTime);

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    onDragStart(task.id, columnId);
  };

  const handleDragEnd = () => {
    onDragStart(null, null);
  };

  return (
    <article
      className={`task-card ${isDragging ? 'task-card--dragging' : ''}`}
      style={{ '--status-color': priorityColor }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      aria-label={`Tarea: ${task.title}`}
    >

      <div className="task-card__body">
        <div className="task-card__header">
          <h3 className="task-card__title">{task.title}</h3>
          <span
            className="task-card__priority"
            style={{ color: priorityColor }}
            title={`Prioridad ${task.priority}`}
          >
            <span className="task-card__priority-dot" style={{ background: priorityColor }} />
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>

        {task.description && (
          <p className="task-card__desc">{task.description}</p>
        )}

        <div className="task-card__footer">
          {timeStr ? (
            <div className="task-card__time">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              {timeStr}
            </div>
          ) : <span />}

          <div className="task-card__actions">
            <button
              className="task-card__action-btn"
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              aria-label="Editar tarea"
              title="Editar"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              className="task-card__action-btn task-card__action-btn--danger"
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              aria-label="Eliminar tarea"
              title="Eliminar"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7h6.6L11 4H3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

import { useState, useRef } from 'react';
import TaskCard from './TaskCard';

export default function Column({
  column,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDeleteColumn,
  onRenameColumn,
  onDrop,
  onDragStart,
  draggingTaskId,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(column.name);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const nameInputRef = useRef(null);
  const menuRef = useRef(null);

  const handleNameDoubleClick = () => {
    setIsEditingName(true);
    setNameValue(column.name);
    setTimeout(() => nameInputRef.current?.select(), 30);
  };

  const commitRename = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== column.name) {
      onRenameColumn(column.id, trimmed);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') {
      setNameValue(column.name);
      setIsEditingName(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(column.id);
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu((v) => !v);
  };

  const closeMenu = () => setShowMenu(false);

  return (
    <section
      className={`column ${isDragOver ? 'column--drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label={`Columna: ${column.name}`}
    >
      <header className="column__header">
        <div className="column__title-area">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              className="column__name-input"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleNameKeyDown}
              maxLength={40}
              aria-label="Renombrar columna"
            />
          ) : (
            <button
              className="column__name"
              onDoubleClick={handleNameDoubleClick}
              title="Doble clic para renombrar"
              aria-label={`Columna ${column.name}. Doble clic para renombrar`}
            >
              {column.name}
            </button>
          )}
          <span className="column__count">{column.tasks.length}</span>
        </div>

        <div className="column__controls" ref={menuRef}>
          <button
            className="icon-btn"
            onClick={toggleMenu}
            aria-label="Opciones de columna"
            aria-expanded={showMenu}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="3" r="1.2" fill="currentColor" />
              <circle cx="8" cy="8" r="1.2" fill="currentColor" />
              <circle cx="8" cy="13" r="1.2" fill="currentColor" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div className="column__menu-backdrop" onClick={closeMenu} />
              <ul className="column__dropdown" role="menu">
                <li>
                  <button
                    className="column__dropdown-item"
                    role="menuitem"
                    onClick={() => { handleNameDoubleClick(); closeMenu(); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                    Renombrar columna
                  </button>
                </li>
                <li>
                  <button
                    className="column__dropdown-item column__dropdown-item--danger"
                    role="menuitem"
                    onClick={() => { onDeleteColumn(column.id); closeMenu(); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 4h10M5 4V2.5h4V4M3 4l.7 7h6.6L11 4H3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Eliminar columna
                  </button>
                </li>
              </ul>
            </>
          )}
        </div>
      </header>

      <div className="column__tasks">
        {column.tasks.length === 0 && (
          <div className="column__empty">
            <span>Arrastra tareas aquí</span>
          </div>
        )}
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columnId={column.id}
            onEdit={onEditTask}
            onDelete={(taskId) => onDeleteTask(column.id, taskId)}
            onDragStart={onDragStart}
            isDragging={draggingTaskId === task.id}
          />
        ))}
      </div>

      <button className="column__add-task" onClick={() => onAddTask(column.id)}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Añadir tarea
      </button>
    </section>
  );
}

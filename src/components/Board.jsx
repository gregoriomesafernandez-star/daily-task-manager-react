import { useState, useRef } from 'react';
import Column from './Column';

export default function Board({
  project,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onAddColumn,
  onDeleteColumn,
  onRenameColumn,
  onMoveTask,
}) {
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [colError, setColError] = useState('');
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [draggingSourceColumnId, setDraggingSourceColumnId] = useState(null);
  const newColInputRef = useRef(null);

  const handleDragStart = (taskId, sourceColumnId) => {
    setDraggingTaskId(taskId);
    setDraggingSourceColumnId(sourceColumnId);
  };

  const handleDrop = (targetColumnId) => {
    if (!draggingTaskId || !draggingSourceColumnId) return;
    onMoveTask(draggingTaskId, draggingSourceColumnId, targetColumnId);
    setDraggingTaskId(null);
    setDraggingSourceColumnId(null);
  };

  const openAddColumn = () => {
    setAddingColumn(true);
    setNewColName('');
    setColError('');
    setTimeout(() => newColInputRef.current?.focus(), 50);
  };

  const handleAddColumnSubmit = (e) => {
    e.preventDefault();
    const trimmed = newColName.trim();
    if (!trimmed) {
      setColError('El nombre es obligatorio');
      return;
    }
    onAddColumn(trimmed);
    setAddingColumn(false);
    setNewColName('');
    setColError('');
  };

  const cancelAddColumn = () => {
    setAddingColumn(false);
    setNewColName('');
    setColError('');
  };

  if (!project) {
    return (
      <main className="board board--empty">
        <div className="empty-state">
          <div className="empty-state__icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="6" y="10" width="12" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <rect x="22" y="10" width="12" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <rect x="38" y="10" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            </svg>
          </div>
          <h2 className="empty-state__title">Ningún proyecto seleccionado</h2>
          <p className="empty-state__desc">Crea o selecciona un proyecto desde el panel lateral para empezar.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="board" aria-label={`Tablero: ${project.name}`}>
      <div className="board__title-bar">
        <h1 className="board__project-title">{project.name}</h1>
      </div>
      <div className="board__columns">
        {project.columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onDeleteColumn={onDeleteColumn}
            onRenameColumn={onRenameColumn}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            draggingTaskId={draggingTaskId}
          />
        ))}
      </div>
    </main>
  );
}

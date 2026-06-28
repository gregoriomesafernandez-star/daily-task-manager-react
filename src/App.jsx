import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useSupabaseData } from './hooks/useSupabaseData';
import { generateId } from './utils/ids';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import Board from './components/Board';
import TaskModal from './components/TaskModal';
import ProjectModal from './components/ProjectModal';
import ColumnModal from './components/ColumnModal';
import ConfirmDialog from './components/ConfirmDialog';
import Toast from './components/Toast';
import ThemeModal from './components/ThemeModal';

export default function App() {
  const { session, signOut, loading: authLoading } = useAuth();
  const userId = session?.user?.id ?? null;

  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    loading: dataLoading,
    error:   dataError,
    createProject,
    updateProject,
    deleteProject,
    addColumn,
    renameColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useSupabaseData(userId);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts]           = useState([]);
  const [theme, setTheme] = useState(
    () => localStorage.getItem('trabajodiario_theme') || 'dark'
  );
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('trabajodiario_theme', theme);
  }, [theme]);

  const handleSelectTheme = (newTheme) => setTheme(newTheme);
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const [taskModal,    setTaskModal]    = useState({ open: false, task: null, columnId: null });
  const [projectModal, setProjectModal] = useState({ open: false, projectId: null, initialName: '', initialColor: null });
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  const addToast = useCallback((message, type = 'success') => {
    const id = generateId();
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openConfirm = (title, message, onConfirm) => {
    setConfirm({ open: true, title, message, onConfirm });
  };

  const closeConfirm = () => setConfirm((prev) => ({ ...prev, open: false }));

  // ─── Auth loading ───────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="app-loading" aria-label="Cargando">
        <div className="app-loading__spinner" aria-hidden="true" />
        <span>Cargando...</span>
      </div>
    );
  }

  if (!session) return <AuthScreen />;

  // ─── Projects ───────────────────────────────────────────────
  const handleCreateProject = async (name, color) => {
    const { error } = await createProject(name, color);
    if (error) { addToast('Error al crear el proyecto', 'error'); return; }
    addToast(`Proyecto "${name}" creado`);
  };

  const handleRenameProject = async (projectId, newName, newColor) => {
    const project = projects.find((p) => p.id === projectId);
    const { error } = await updateProject(projectId, newName, newColor || project?.color);
    if (error) { addToast('Error al actualizar el proyecto', 'error'); return; }
    addToast('Proyecto actualizado');
  };

  const handleDeleteProject = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    openConfirm(
      'Eliminar proyecto',
      `¿Seguro que quieres eliminar "${project?.name}"? Se perderán todas sus columnas y tareas.`,
      async () => {
        const { error } = await deleteProject(projectId);
        if (error) { addToast('Error al eliminar el proyecto', 'error'); return; }
        addToast('Proyecto eliminado', 'info');
        closeConfirm();
      }
    );
  };

  // ─── Columns ────────────────────────────────────────────────
  const handleAddColumn = async (name) => {
    if (!activeProjectId) return;
    const { error } = await addColumn(activeProjectId, name);
    if (error) { addToast('Error al añadir la columna', 'error'); return; }
    addToast(`Columna "${name}" añadida`);
  };

  const handleRenameColumn = async (columnId, newName) => {
    const { error } = await renameColumn(columnId, newName);
    if (error) { addToast('Error al renombrar la columna', 'error'); return; }
    addToast('Columna renombrada');
  };

  const handleDeleteColumn = (columnId) => {
    const column = activeProject?.columns.find((c) => c.id === columnId);
    openConfirm(
      'Eliminar columna',
      `¿Eliminar la columna "${column?.name}"? Se perderán sus ${column?.tasks.length ?? 0} tareas.`,
      async () => {
        const { error } = await deleteColumn(columnId);
        if (error) { addToast('Error al eliminar la columna', 'error'); return; }
        addToast('Columna eliminada', 'info');
        closeConfirm();
      }
    );
  };

  // ─── Tasks ──────────────────────────────────────────────────
  const handleOpenAddTask  = (columnId) => setTaskModal({ open: true, task: null, columnId });
  const handleOpenEditTask = (task) => {
    const column = activeProject?.columns.find((c) => c.tasks.some((t) => t.id === task.id));
    setTaskModal({ open: true, task, columnId: column?.id ?? null });
  };

  const handleTaskSubmit = async (formData) => {
    if (taskModal.task) {
      const { error } = await updateTask(taskModal.task.id, formData);
      if (error) { addToast('Error al actualizar la tarea', 'error'); return; }
      addToast('Tarea actualizada');
    } else {
      const { error } = await createTask(taskModal.columnId, formData);
      if (error) { addToast('Error al crear la tarea', 'error'); return; }
      addToast('Tarea creada');
    }
  };

  const handleDeleteTask = (columnId, taskId) => {
    openConfirm(
      'Eliminar tarea',
      '¿Seguro que quieres eliminar esta tarea? Esta acción no se puede deshacer.',
      async () => {
        const { error } = await deleteTask(taskId);
        if (error) { addToast('Error al eliminar la tarea', 'error'); return; }
        addToast('Tarea eliminada', 'info');
        closeConfirm();
      }
    );
  };

  const handleMoveTask = async (taskId, sourceColumnId, targetColumnId) => {
    const { error } = await moveTask(taskId, sourceColumnId, targetColumnId);
    if (error) addToast('Error al mover la tarea', 'error');
  };

  const handleSelectProject = (projectId) => setActiveProjectId(projectId);

  const handleSignOut = async () => {
    await signOut();
    addToast('Sesión cerrada', 'info');
  };

  // ─── Data loading state ─────────────────────────────────────
  if (dataLoading) {
    return (
      <div className="app-loading" aria-label="Cargando proyectos">
        <div className="app-loading__spinner" aria-hidden="true" />
        <span>Cargando proyectos...</span>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="app-loading">
        <span className="app-loading__error">{dataError}</span>
        <button className="btn btn--ghost btn--sm" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <button
          className="icon-btn app-header__menu-btn"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Abrir panel de proyectos"
          aria-expanded={sidebarOpen}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="app-header__brand">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect x="1" y="3" width="6" height="16" rx="1.5" fill="#6C63FF" />
            <rect x="9" y="3" width="6" height="11" rx="1.5" fill="#F0A500" />
            <rect x="17" y="3" width="4" height="7" rx="1.5" fill="#2DD4BF" />
          </svg>
          <span className="app-header__title">TrabajoDiario</span>
        </div>

        <span className="app-header__user-name-mobile" title={session.user.email}>
          {session.user.email.split('@')[0]}
        </span>

        {activeProject && (
          <div className="app-header__center">
            <span className="app-header__col-count">
              {activeProject.columns.length} columnas
            </span>
            <button className="btn btn--ghost btn--sm app-header__add-col-btn" onClick={() => setColumnModalOpen(true)}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Nueva columna
            </button>
          </div>
        )}

        <button
          className="icon-btn app-header__theme-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M9 1.5V3M9 15v1.5M1.5 9H3M15 9h1.5M3.7 3.7l1.1 1.1M13.2 13.2l1.1 1.1M3.7 14.3l1.1-1.1M13.2 4.8l1.1-1.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M15 9.5A6.5 6.5 0 1 1 8.5 3a5 5 0 0 0 6.5 6.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <button
          className="icon-btn app-header__settings-btn"
          onClick={() => setThemeModalOpen(true)}
          aria-label="Configuración de apariencia"
          title="Apariencia"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M7.5 2.1l-.4 1.4a5.5 5.5 0 0 0-1.3.75l-1.4-.47-1.5 2.6 1.1 1a5.6 5.6 0 0 0 0 1.5l-1.1 1 1.5 2.6 1.4-.47c.4.3.83.56 1.3.75l.4 1.4h3l.4-1.4c.47-.19.9-.44 1.3-.75l1.4.47 1.5-2.6-1.1-1a5.6 5.6 0 0 0 0-1.5l1.1-1-1.5-2.6-1.4.47a5.5 5.5 0 0 0-1.3-.75l-.4-1.4z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
            <circle cx="9" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.35" />
          </svg>
        </button>

        <div className="app-header__user-group">
          <span className="app-header__user-name" title={session.user.email}>
            {session.user.email.split('@')[0]}
          </span>
          <button
            className="icon-btn app-header__signout-btn"
            onClick={handleSignOut}
            aria-label="Cerrar sesión"
            title={`Cerrar sesión (${session.user.email})`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M7 3H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M12 6l3 3-3 3M15 9H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      <div className="app__body">
        <Sidebar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onNewProject={() => setProjectModal({ open: true, projectId: null, initialName: '', initialColor: null })}
          onDeleteProject={handleDeleteProject}
          onRenameProject={(id, name, color) => setProjectModal({ open: true, projectId: id, initialName: name, initialColor: color })}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />

        <Board
          project={activeProject}
          onAddTask={handleOpenAddTask}
          onEditTask={handleOpenEditTask}
          onDeleteTask={handleDeleteTask}
          onAddColumn={handleAddColumn}
          onDeleteColumn={handleDeleteColumn}
          onRenameColumn={handleRenameColumn}
          onMoveTask={handleMoveTask}
        />
      </div>

      <TaskModal
        isOpen={taskModal.open}
        task={taskModal.task}
        onClose={() => setTaskModal({ open: false, task: null, columnId: null })}
        onSubmit={handleTaskSubmit}
      />

      <ProjectModal
        isOpen={projectModal.open}
        initialName={projectModal.initialName}
        initialColor={projectModal.initialColor}
        onClose={() => setProjectModal({ open: false, projectId: null, initialName: '', initialColor: null })}
        onSubmit={(name, color) => {
          if (projectModal.projectId) {
            handleRenameProject(projectModal.projectId, name, color);
          } else {
            handleCreateProject(name, color);
          }
        }}
      />

      <ColumnModal
        isOpen={columnModalOpen}
        onClose={() => setColumnModalOpen(false)}
        onSubmit={handleAddColumn}
      />

      <ConfirmDialog
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />

      <ThemeModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        currentTheme={theme}
        onSelectTheme={handleSelectTheme}
      />
    </div>
  );
}

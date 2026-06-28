import { useState } from 'react';

export default function Sidebar({ projects, activeProjectId, onSelectProject, onNewProject, onDeleteProject, onRenameProject, isOpen, onToggle }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <>
      {isOpen && <div className="sidebar__backdrop" onClick={onToggle} aria-hidden="true" />}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`} aria-label="Panel de proyectos">
        <div className="sidebar__header">
          <button className="icon-btn sidebar__close" onClick={onToggle} aria-label="Cerrar panel">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="sidebar__section-header">
          <div className="sidebar__section-label">Proyectos</div>
          <button className="icon-btn icon-btn--xs" onClick={onNewProject} aria-label="Crear nuevo proyecto" title="Nuevo proyecto">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="sidebar__projects" aria-label="Lista de proyectos">
          {projects.length === 0 && (
            <p className="sidebar__empty">Aún no hay proyectos. Crea el primero.</p>
          )}
          {projects.map((project) => (
            <div
              key={project.id}
              className={`sidebar__project ${activeProjectId === project.id ? 'sidebar__project--active' : ''}`}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <button
                className="sidebar__project-btn"
                onClick={() => { onSelectProject(project.id); if (isOpen) onToggle(); }}
                aria-current={activeProjectId === project.id ? 'page' : undefined}
              >
                <span
                  className="sidebar__project-dot"
                  style={{ background: project.color || '#6C63FF', '--dot-color': project.color || '#6C63FF' }}
                />
                <span className="sidebar__project-name">{project.name}</span>
                <span className="sidebar__project-count">
                  {project.columns.reduce((acc, col) => acc + col.tasks.length, 0)}
                </span>
              </button>

              {(hoveredId === project.id || activeProjectId === project.id) && (
                <div className="sidebar__project-actions">
                  <button
                    className="icon-btn icon-btn--xs"
                    onClick={(e) => { e.stopPropagation(); onRenameProject(project.id, project.name, project.color); }}
                    aria-label={`Renombrar ${project.name}`}
                    title="Renombrar"
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    className="icon-btn icon-btn--xs icon-btn--danger"
                    onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                    aria-label={`Eliminar ${project.name}`}
                    title="Eliminar"
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M2 4h10M5 4V2.5h4V4M3 4l.7 7h6.6L11 4H3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>

      </aside>
    </>
  );
}

import { useState, useEffect, useRef } from 'react';
import { THEMES } from './ThemeModal';

export default function Sidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onRenameProject,
  isOpen,
  onToggle,
  userEmail,
  onSignOut,
  currentTheme,
  onSelectTheme,
  onToggleTheme,
  activeProject,
  onAddColumn,
}) {
  const [hoveredId, setHoveredId] = useState(null);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const themePickerRef = useRef(null);

  useEffect(() => {
    if (!themeDropdownOpen) return;
    const handleClick = (e) => {
      if (themePickerRef.current && !themePickerRef.current.contains(e.target)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [themeDropdownOpen]);

  const userName = userEmail?.split('@')[0] ?? '';

  return (
    <>
      {isOpen && <div className="sidebar__backdrop" onClick={onToggle} aria-hidden="true" />}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`} aria-label="Panel de proyectos">

        {/* ── Cabecera: botón cerrar (móvil) ── */}
        <div className="sidebar__header">
          <button className="icon-btn sidebar__close" onClick={onToggle} aria-label="Cerrar panel">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── Sección usuario (solo visible en móvil vía CSS) ── */}
        <div className="sidebar__user-section sidebar__mobile-only">
          <div className="sidebar__user-info">
            <div className="sidebar__user-avatar" aria-hidden="true">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar__user-details">
              <span className="sidebar__user-name">{userName}</span>
              <span className="sidebar__user-email">{userEmail}</span>
            </div>
          </div>
          <button
            className="btn btn--ghost btn--sm sidebar__signout-btn"
            onClick={onSignOut}
            aria-label="Cerrar sesión"
          >
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M7 3H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M12 6l3 3-3 3M15 9H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Cerrar sesión
          </button>
        </div>

        {/* ── Sección proyectos ── */}
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

        {/* ── Sección configuración (solo visible en móvil vía CSS) ── */}
        <div className="sidebar__config-section sidebar__mobile-only">
          <hr className="sidebar__divider" />

          <div className="sidebar__config-header">
            <div className="sidebar__section-label sidebar__config-label">Configuración</div>
            {/* Botón rápido claro/oscuro */}
            <button
              className="icon-btn sidebar__quick-theme-btn"
              onClick={onToggleTheme}
              aria-label={currentTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              title={currentTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {currentTheme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <circle cx="9" cy="9" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M9 1.5V3M9 15v1.5M1.5 9H3M15 9h1.5M3.7 3.7l1.1 1.1M13.2 13.2l1.1 1.1M3.7 14.3l1.1-1.1M13.2 4.8l1.1-1.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M15 9.5A6.5 6.5 0 1 1 8.5 3a5 5 0 0 0 6.5 6.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          {/* Dropdown personalizado de temas */}
          <div className="sidebar__theme-picker" ref={themePickerRef}>
            <button
              className="sidebar__theme-trigger"
              onClick={() => setThemeDropdownOpen((v) => !v)}
              aria-expanded={themeDropdownOpen}
              aria-haspopup="listbox"
            >
              <span className="sidebar__theme-trigger-left">
                <span
                  className="sidebar__theme-dot-sm"
                  style={{ background: THEMES.find((t) => t.id === currentTheme)?.preview.violet }}
                />
                <span className="sidebar__theme-trigger-name">
                  {THEMES.find((t) => t.id === currentTheme)?.name}
                </span>
              </span>
              <svg
                className={`sidebar__theme-chevron ${themeDropdownOpen ? 'sidebar__theme-chevron--open' : ''}`}
                width="12" height="12" viewBox="0 0 12 8" fill="none" aria-hidden="true"
              >
                <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {themeDropdownOpen && (
              <ul className="sidebar__theme-dropdown" role="listbox" aria-label="Seleccionar tema">
                {THEMES.map((t) => {
                  const isActive = currentTheme === t.id;
                  return (
                    <li key={t.id} role="option" aria-selected={isActive}>
                      <button
                        className={`sidebar__theme-option ${isActive ? 'sidebar__theme-option--active' : ''}`}
                        onClick={() => { onSelectTheme(t.id); setThemeDropdownOpen(false); }}
                      >
                        <span className="sidebar__theme-option-left">
                          <span
                            className="sidebar__theme-dot-sm"
                            style={{ background: t.preview.violet }}
                          />
                          <span className="sidebar__theme-option-name">{t.name}</span>
                        </span>
                        {isActive && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Columnas del proyecto activo */}
          {activeProject && (
            <div className="sidebar__column-actions">
              <span className="sidebar__col-count">
                {activeProject.columns.length} columnas en {activeProject.name}
              </span>
              <button
                className="btn btn--primary btn--sm sidebar__add-col-btn"
                onClick={() => { onAddColumn(); onToggle(); }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Nueva columna
              </button>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}

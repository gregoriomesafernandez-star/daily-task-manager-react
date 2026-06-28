import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Convierte las filas anidadas de Supabase al shape que espera la UI
const mapProject = (p) => ({
  id:   p.id,
  name: p.name,
  color: p.color,
  columns: (p.columns || [])
    .sort((a, b) => a.position - b.position)
    .map((c) => ({
      id:   c.id,
      name: c.name,
      tasks: (c.tasks || [])
        .sort((a, b) => a.position - b.position)
        .map((t) => ({
          id:            t.id,
          title:         t.title,
          description:   t.description,
          estimatedTime: t.estimated_time,
          status:        t.status,
          priority:      t.priority,
          labelColor:    t.label_color,
          createdAt:     t.created_at,
          updatedAt:     t.updated_at,
        })),
    })),
});

export const useSupabaseData = (userId) => {
  const [projects, setProjects]      = useState([]);
  const [activeProjectId, setActive] = useState(null);
  const [loading, setLoading]        = useState(true);
  const [error, setError]            = useState(null);

  // ─── Carga inicial ───────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      // Una sola query anidada vía FK evita races con RLS en múltiples queries
      const { data, error: err } = await supabase
        .from('projects')
        .select('*, columns(*, tasks(*))')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (cancelled) return;

      if (err) {
        console.error('[TrabajoDiario] Error al cargar datos de Supabase:', err);
        setError(`Error al cargar los datos: ${err.message}`);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map(mapProject);
      setProjects(mapped);
      setActive(mapped.length > 0 ? mapped[mapped.length - 1].id : null);
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [userId]);

  // ─── Projects ─────────────────────────────────────────────────
  const createProject = useCallback(async (name, color) => {
    const position = projects.length;
    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: userId, name, color: color || '#6C63FF', position })
      .select()
      .single();

    if (error || !data) {
      console.error('[TrabajoDiario] createProject:', error);
      return { error };
    }

    const defaultColumns = [
      { project_id: data.id, name: 'Por hacer',   position: 0 },
      { project_id: data.id, name: 'En progreso', position: 1 },
      { project_id: data.id, name: 'Completado',  position: 2 },
    ];

    const { data: cols, error: colErr } = await supabase
      .from('columns')
      .insert(defaultColumns)
      .select();

    if (colErr) {
      console.error('[TrabajoDiario] createProject columns:', colErr);
      return { error: colErr };
    }

    const newProject = {
      id: data.id, name: data.name, color: data.color,
      columns: cols
        .sort((a, b) => a.position - b.position)
        .map((c) => ({ id: c.id, name: c.name, tasks: [] })),
    };

    setProjects((prev) => [...prev, newProject]);
    setActive(newProject.id);
    return { data: newProject };
  }, [projects.length, userId]);

  const updateProject = useCallback(async (projectId, name, color) => {
    const { error } = await supabase
      .from('projects')
      .update({ name, color })
      .eq('id', projectId);

    if (error) { console.error('[TrabajoDiario] updateProject:', error); return { error }; }

    setProjects((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, name, color } : p)
    );
    return {};
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) { console.error('[TrabajoDiario] deleteProject:', error); return { error }; }

    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== projectId);
      setActive(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
      return remaining;
    });
    return {};
  }, []);

  // ─── Columns ──────────────────────────────────────────────────
  const addColumn = useCallback(async (projectId, name) => {
    const project  = projects.find((p) => p.id === projectId);
    const position = project ? project.columns.length : 0;

    const { data, error } = await supabase
      .from('columns')
      .insert({ project_id: projectId, name, position })
      .select()
      .single();

    if (error || !data) { console.error('[TrabajoDiario] addColumn:', error); return { error }; }

    const newColumn = { id: data.id, name: data.name, tasks: [] };
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, columns: [...p.columns, newColumn] } : p
      )
    );
    return { data: newColumn };
  }, [projects]);

  const renameColumn = useCallback(async (columnId, name) => {
    const { error } = await supabase.from('columns').update({ name }).eq('id', columnId);
    if (error) { console.error('[TrabajoDiario] renameColumn:', error); return { error }; }

    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        columns: p.columns.map((c) => c.id === columnId ? { ...c, name } : c),
      }))
    );
    return {};
  }, []);

  const deleteColumn = useCallback(async (columnId) => {
    const { error } = await supabase.from('columns').delete().eq('id', columnId);
    if (error) { console.error('[TrabajoDiario] deleteColumn:', error); return { error }; }

    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        columns: p.columns.filter((c) => c.id !== columnId),
      }))
    );
    return {};
  }, []);

  // ─── Tasks ────────────────────────────────────────────────────
  const createTask = useCallback(async (columnId, formData) => {
    const project  = projects.find((p) => p.columns.some((c) => c.id === columnId));
    const column   = project?.columns.find((c) => c.id === columnId);
    const position = column ? column.tasks.length : 0;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        column_id:      columnId,
        title:          formData.title,
        description:    formData.description || '',
        estimated_time: formData.estimatedTime ?? null,
        status:         'todo',
        priority:       formData.priority,
        label_color:    formData.labelColor ?? null,
        position,
      })
      .select()
      .single();

    if (error || !data) { console.error('[TrabajoDiario] createTask:', error); return { error }; }

    const newTask = {
      id:            data.id,
      title:         data.title,
      description:   data.description,
      estimatedTime: data.estimated_time,
      status:        data.status,
      priority:      data.priority,
      labelColor:    data.label_color,
      createdAt:     data.created_at,
      updatedAt:     data.updated_at,
    };

    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        columns: p.columns.map((c) =>
          c.id === columnId ? { ...c, tasks: [...c.tasks, newTask] } : c
        ),
      }))
    );
    return { data: newTask };
  }, [projects]);

  const updateTask = useCallback(async (taskId, formData) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        title:          formData.title,
        description:    formData.description || '',
        estimated_time: formData.estimatedTime ?? null,
        priority:       formData.priority,
        label_color:    formData.labelColor ?? null,
        updated_at:     new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) { console.error('[TrabajoDiario] updateTask:', error); return { error }; }

    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        columns: p.columns.map((c) => ({
          ...c,
          tasks: c.tasks.map((t) =>
            t.id === taskId
              ? { ...t, ...formData, updatedAt: new Date().toISOString() }
              : t
          ),
        })),
      }))
    );
    return {};
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) { console.error('[TrabajoDiario] deleteTask:', error); return { error }; }

    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        columns: p.columns.map((c) => ({
          ...c,
          tasks: c.tasks.filter((t) => t.id !== taskId),
        })),
      }))
    );
    return {};
  }, []);

  const moveTask = useCallback(async (taskId, sourceColumnId, targetColumnId) => {
    if (sourceColumnId === targetColumnId) return {};

    const { error } = await supabase
      .from('tasks')
      .update({ column_id: targetColumnId, updated_at: new Date().toISOString() })
      .eq('id', taskId);

    if (error) { console.error('[TrabajoDiario] moveTask:', error); return { error }; }

    setProjects((prev) =>
      prev.map((p) => {
        let movedTask = null;
        const columnsWithout = p.columns.map((c) => {
          if (c.id === sourceColumnId) {
            movedTask = c.tasks.find((t) => t.id === taskId);
            return { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) };
          }
          return c;
        });
        if (!movedTask) return p;
        return {
          ...p,
          columns: columnsWithout.map((c) =>
            c.id === targetColumnId ? { ...c, tasks: [...c.tasks, movedTask] } : c
          ),
        };
      })
    );
    return {};
  }, []);

  return {
    projects,
    activeProjectId,
    setActiveProjectId: setActive,
    loading,
    error,
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
  };
};

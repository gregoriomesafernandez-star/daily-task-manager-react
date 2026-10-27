## Database Setup

The application uses Supabase with PostgreSQL to store projects, columns and tasks. The database includes foreign key relationships, indexes and Row Level Security (RLS) policies to protect user data.

### Database Schema

The following SQL script creates the database tables and their relationships.

```sql
-- =========================================
-- DAILY TASK MANAGER
-- Initial database schema
-- =========================================

-- 1. PROJECTS
create table public.projects (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    color text not null default '#6C63FF',
    position integer not null default 0,
    created_at timestamptz not null default now()
);

-- 2. COLUMNS
create table public.columns (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.projects(id) on delete cascade,
    name text not null,
    position integer not null default 0,
    created_at timestamptz not null default now()
);

-- 3. TASKS
create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    column_id uuid not null references public.columns(id) on delete cascade,
    title text not null,
    description text not null default '',
    estimated_time integer,
    status text not null default 'todo',
    priority text,
    label_color text,
    position integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =========================================
-- INDEXES
-- =========================================

create index projects_user_id_idx
    on public.projects(user_id);

create index columns_project_id_idx
    on public.columns(project_id);

create index tasks_column_id_idx
    on public.tasks(column_id);

create index projects_position_idx
    on public.projects(user_id, position);

create index columns_position_idx
    on public.columns(project_id, position);

create index tasks_position_idx
    on public.tasks(column_id, position);

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================

alter table public.projects enable row level security;
alter table public.columns enable row level security;
alter table public.tasks enable row level security;

-- PROJECTS
create policy "Users manage their own projects"
on public.projects
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- COLUMNS
create policy "Users manage columns in their projects"
on public.columns
for all
to authenticated
using (
    exists (
        select 1
        from public.projects p
        where p.id = columns.project_id
          and p.user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.projects p
        where p.id = columns.project_id
          and p.user_id = auth.uid()
    )
);

-- TASKS
create policy "Users manage tasks in their projects"
on public.tasks
for all
to authenticated
using (
    exists (
        select 1
        from public.columns c
        join public.projects p on p.id = c.project_id
        where c.id = tasks.column_id
          and p.user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.columns c
        join public.projects p on p.id = c.project_id
        where c.id = tasks.column_id
          and p.user_id = auth.uid()
    )
);

-- PERMISSIONS
grant select, insert, update, delete
on public.projects, public.columns, public.tasks
to authenticated;

```

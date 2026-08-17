-- ============================================================
-- UNIPREP 2 - CONFIGURACIÓN COMPLETA DE SUPABASE
-- Ejecutar una sola vez en Supabase > SQL Editor.
-- El script es repetible: conserva los datos existentes.
-- ============================================================

create extension if not exists pgcrypto;

-- 1. PERFILES Y ESTADÍSTICAS
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default 'Estudiante UniPrep',
  correo text not null default '',
  carrera text not null default '',
  universidad text not null default '',
  nivel integer not null default 1 check (nivel >= 1),
  xp bigint not null default 0 check (xp >= 0),
  monedas bigint not null default 0 check (monedas >= 0),
  racha integer not null default 0 check (racha >= 0),
  record_racha integer not null default 0 check (record_racha >= 0),
  ultimo_dia_estudio date,
  ejercicios integer not null default 0 check (ejercicios >= 0),
  respuestas_correctas integer not null default 0 check (respuestas_correctas >= 0),
  respuestas_totales integer not null default 0 check (respuestas_totales >= 0),
  precision integer not null default 0 check (precision between 0 and 100),
  ranking integer,
  simulacros integer not null default 0 check (simulacros >= 0),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

alter table public.profiles add column if not exists nombre text not null default 'Estudiante UniPrep';
alter table public.profiles add column if not exists correo text not null default '';
alter table public.profiles add column if not exists carrera text not null default '';
alter table public.profiles add column if not exists universidad text not null default '';
alter table public.profiles add column if not exists nivel integer not null default 1;
alter table public.profiles add column if not exists xp bigint not null default 0;
alter table public.profiles add column if not exists monedas bigint not null default 0;
alter table public.profiles add column if not exists racha integer not null default 0;
alter table public.profiles add column if not exists record_racha integer not null default 0;
alter table public.profiles add column if not exists ultimo_dia_estudio date;
alter table public.profiles add column if not exists ejercicios integer not null default 0;
alter table public.profiles add column if not exists respuestas_correctas integer not null default 0;
alter table public.profiles add column if not exists respuestas_totales integer not null default 0;
alter table public.profiles add column if not exists precision integer not null default 0;
alter table public.profiles add column if not exists ranking integer;
alter table public.profiles add column if not exists simulacros integer not null default 0;
alter table public.profiles add column if not exists creado_en timestamptz not null default now();
alter table public.profiles add column if not exists actualizado_en timestamptz not null default now();

-- 2. PROGRESO POR CURSO
create table if not exists public.course_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  completed_exercises integer not null default 0 check (completed_exercises >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  total_answers integer not null default 0 check (total_answers >= 0),
  last_topic_index integer not null default 0 check (last_topic_index >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- 3. ACTIVIDAD RECIENTE
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null default 'actividad',
  title text not null default 'Actividad',
  description text not null default '',
  xp_earned integer not null default 0 check (xp_earned >= 0),
  created_at timestamptz not null default now()
);

-- 4. AGENDA SINCRONIZADA
create table if not exists public.agenda_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  event_date date not null,
  start_time time,
  end_time time,
  event_type text not null default 'estudio',
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists course_progress_user_idx on public.course_progress(user_id);
create index if not exists activities_user_created_idx on public.activities(user_id, created_at desc);
create index if not exists agenda_events_user_date_idx on public.agenda_events(user_id, event_date);

-- 5. CREAR EL PERFIL AUTOMÁTICAMENTE AL REGISTRARSE
create or replace function public.crear_perfil_uniprep()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nombre, correo, carrera, universidad)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''), split_part(coalesce(new.email, ''), '@', 1), 'Estudiante UniPrep'),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'carrera', ''),
    coalesce(new.raw_user_meta_data ->> 'universidad', '')
  )
  on conflict (id) do update set
    nombre = excluded.nombre,
    correo = excluded.correo,
    carrera = excluded.carrera,
    universidad = excluded.universidad,
    actualizado_en = now();

  return new;
end;
$$;

drop trigger if exists crear_perfil_uniprep_trigger on auth.users;
create trigger crear_perfil_uniprep_trigger
after insert on auth.users
for each row execute function public.crear_perfil_uniprep();

drop trigger if exists sincronizar_perfil_uniprep_trigger on auth.users;
create trigger sincronizar_perfil_uniprep_trigger
after update of email, raw_user_meta_data on auth.users
for each row execute function public.crear_perfil_uniprep();

-- Recupera perfiles faltantes de cuentas creadas anteriormente.
insert into public.profiles (id, nombre, correo, carrera, universidad)
select
  usuario.id,
  coalesce(nullif(trim(usuario.raw_user_meta_data ->> 'nombre'), ''), split_part(coalesce(usuario.email, ''), '@', 1), 'Estudiante UniPrep'),
  coalesce(usuario.email, ''),
  coalesce(usuario.raw_user_meta_data ->> 'carrera', ''),
  coalesce(usuario.raw_user_meta_data ->> 'universidad', '')
from auth.users as usuario
on conflict (id) do nothing;

-- 6. FECHA DE ACTUALIZACIÓN
create or replace function public.marcar_actualizacion_uniprep()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists marcar_actualizacion_profiles on public.profiles;
create trigger marcar_actualizacion_profiles
before update on public.profiles
for each row execute function public.marcar_actualizacion_uniprep();

-- 7. SEGURIDAD POR FILA (RLS)
alter table public.profiles enable row level security;
alter table public.course_progress enable row level security;
alter table public.activities enable row level security;
alter table public.agenda_events enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists course_progress_own on public.course_progress;
create policy course_progress_own on public.course_progress for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists activities_select_own on public.activities;
drop policy if exists activities_insert_own on public.activities;
create policy activities_select_own on public.activities for select to authenticated using ((select auth.uid()) = user_id);
create policy activities_insert_own on public.activities for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists agenda_events_own on public.agenda_events;
create policy agenda_events_own on public.agenda_events for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on table public.profiles, public.course_progress, public.activities, public.agenda_events from anon;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.course_progress to authenticated;
grant select, insert on table public.activities to authenticated;
grant select, insert, update, delete on table public.agenda_events to authenticated;

-- 8. RANKING SEGURO: NO EXPONE CORREOS NI DATOS PRIVADOS
create or replace function public.obtener_ranking_uniprep()
returns table (
  id uuid,
  nombre text,
  carrera text,
  xp bigint,
  racha integer,
  ejercicios integer,
  respuestas_correctas integer,
  respuestas_totales integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    perfil.id,
    coalesce(nullif(trim(perfil.nombre), ''), 'Estudiante UniPrep')::text,
    coalesce(nullif(trim(perfil.carrera), ''), 'Preuniversitario')::text,
    greatest(coalesce(perfil.xp, 0), 0)::bigint,
    greatest(coalesce(perfil.racha, 0), 0)::integer,
    greatest(coalesce(perfil.ejercicios, 0), 0)::integer,
    greatest(coalesce(perfil.respuestas_correctas, 0), 0)::integer,
    greatest(coalesce(perfil.respuestas_totales, 0), 0)::integer
  from public.profiles as perfil
  order by perfil.xp desc, perfil.respuestas_correctas desc, perfil.creado_en asc
  limit 100;
$$;

revoke execute on function public.obtener_ranking_uniprep() from public, anon;
grant execute on function public.obtener_ranking_uniprep() to authenticated;

-- 9. ELIMINACIÓN SEGURA DE LA PROPIA CUENTA
create or replace function public.eliminar_mi_cuenta_uniprep()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  usuario_id uuid := (select auth.uid());
  eliminado boolean := false;
begin
  if usuario_id is null then
    raise exception 'Debes iniciar sesión para eliminar la cuenta.';
  end if;

  delete from public.agenda_events where user_id = usuario_id;
  delete from public.activities where user_id = usuario_id;
  delete from public.course_progress where user_id = usuario_id;
  delete from public.profiles where id = usuario_id;
  delete from auth.users where id = usuario_id;
  eliminado := found;

  return eliminado;
end;
$$;

revoke execute on function public.eliminar_mi_cuenta_uniprep() from public, anon;
grant execute on function public.eliminar_mi_cuenta_uniprep() to authenticated;

select 'UniPrep: tablas, perfiles, RLS, ranking y eliminación configurados.' as resultado;

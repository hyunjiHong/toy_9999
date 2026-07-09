-- ============================================================
-- 온라인 커타 — Supabase 초기 셋업 (한 번에 실행용)
-- 사용법: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run.
-- (개별 파일: supabase/migrations/0001~0003 + seed.sql 를 합친 것)
-- ============================================================

-- 0001_rooms --------------------------------------------------
create extension if not exists "pgcrypto";

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_at timestamptz not null default now()
);

alter table public.rooms enable row level security;

drop policy if exists "rooms readable by anyone" on public.rooms;
create policy "rooms readable by anyone"
  on public.rooms for select
  to anon, authenticated
  using (true);

drop policy if exists "rooms insertable by anyone" on public.rooms;
create policy "rooms insertable by anyone"
  on public.rooms for insert
  to anon, authenticated
  with check (true);

-- 0002_messages -----------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  sender_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_room_created_idx
  on public.messages (room_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "messages readable by anyone" on public.messages;
create policy "messages readable by anyone"
  on public.messages for select
  to anon, authenticated
  using (true);

drop policy if exists "messages insertable by anyone" on public.messages;
create policy "messages insertable by anyone"
  on public.messages for insert
  to anon, authenticated
  with check (char_length(content) between 1 and 500 and char_length(sender_name) between 1 and 40);

drop policy if exists "messages deletable by anyone" on public.messages;
create policy "messages deletable by anyone"
  on public.messages for delete
  to anon, authenticated
  using (true);

alter publication supabase_realtime add table public.messages;

-- 0003_kuta_sessions ------------------------------------------
create table if not exists public.kuta_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  started_at timestamptz not null default now(),
  duration_seconds int not null default 600,
  question text,
  ended_at timestamptz
);

create index if not exists kuta_sessions_room_idx
  on public.kuta_sessions (room_id, started_at desc);

alter table public.kuta_sessions enable row level security;

drop policy if exists "sessions readable by anyone" on public.kuta_sessions;
create policy "sessions readable by anyone"
  on public.kuta_sessions for select
  to anon, authenticated
  using (true);

drop policy if exists "sessions insertable by anyone" on public.kuta_sessions;
create policy "sessions insertable by anyone"
  on public.kuta_sessions for insert
  to anon, authenticated
  with check (duration_seconds between 1 and 3600);

alter publication supabase_realtime add table public.kuta_sessions;

-- seed --------------------------------------------------------
insert into public.rooms (id, name)
values ('00000000-0000-0000-0000-000000000001', '팀 커타방')
on conflict (id) do nothing;

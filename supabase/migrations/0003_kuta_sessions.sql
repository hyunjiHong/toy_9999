-- 방에서 진행 중인 커타 세션. 남은 시간은 started_at(서버 시각)으로 각 클라이언트가 계산(FR-6).
create table if not exists public.kuta_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  started_at timestamptz not null default now(),
  duration_seconds int not null default 600,
  -- 오늘의 질문(T6에서 채움). 세션 생성 시 하나 골라 저장 → 방 전원이 같은 질문을 봄.
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

-- 세션 시작/종료를 방 전원에게 실시간 전파
alter publication supabase_realtime add table public.kuta_sessions;

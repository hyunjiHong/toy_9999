-- 방(room) = 초대 링크. 상시 존재.
create extension if not exists "pgcrypto";

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_at timestamptz not null default now()
);

alter table public.rooms enable row level security;

-- 링크(=방 id)를 아는 익명 사용자는 방을 조회할 수 있다. 방 생성/수정은 클라이언트에서 막는다(seed로만 생성).
drop policy if exists "rooms readable by anyone" on public.rooms;
create policy "rooms readable by anyone"
  on public.rooms for select
  to anon, authenticated
  using (true);

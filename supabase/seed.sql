-- MVP는 방(링크) 하나면 충분(spec §8). 알려진 고정 id로 방 1건을 seed 한다.
-- 초대 링크: /room/00000000-0000-0000-0000-000000000001
insert into public.rooms (id, name)
values ('00000000-0000-0000-0000-000000000001', '팀 커타방')
on conflict (id) do nothing;

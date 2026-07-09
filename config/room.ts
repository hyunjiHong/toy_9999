// MVP는 방 하나면 충분(spec §8). seed.sql이 넣는 고정 방 id.
// 초대 링크: /room/${SEED_ROOM_ID}
export const SEED_ROOM_ID = "00000000-0000-0000-0000-000000000001";

// 한 방 2~8명 기준 (spec §2, FR-9)
export const MAX_PARTICIPANTS = 8;

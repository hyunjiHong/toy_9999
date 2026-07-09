import type { Participant } from "@/types/kuta";

// Supabase Presence가 track하는 payload (Participant + 정렬용 시각)
export interface PresencePayload extends Participant {
  joined_at: string;
}

type PresenceState = Record<
  string,
  Array<Partial<PresencePayload> & { presence_ref?: string }>
>;

// channel.presenceState() → 참여자 배열.
// 입장 순서(joined_at)로 정렬해 아바타가 들어온 순서대로 자리 잡게 한다.
export function flattenPresence(state: PresenceState): Participant[] {
  return Object.values(state)
    .flat()
    .filter(
      (e): e is PresencePayload =>
        typeof e.name === "string" && typeof e.drink === "string",
    )
    .sort((a, b) => a.joined_at.localeCompare(b.joined_at))
    .map(({ name, drink }) => ({ name, drink }));
}

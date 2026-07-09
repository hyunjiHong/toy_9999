import type { Participant, RosterEntry } from "@/types/kuta";

// Supabase Presence가 track하는 payload (Participant + 정렬용 시각)
export interface PresencePayload extends Participant {
  joined_at: string;
}

type PresenceState = Record<
  string,
  Array<Partial<PresencePayload> & { presence_ref?: string }>
>;

// channel.presenceState() → 참여자 배열.
// 바깥 key(=presence key, 탭마다 고유)를 참여자 식별자로 보존한다.
// joined_at은 ISO-8601이라 문자열 비교(localeCompare)가 곧 시간순 정렬이 된다.
export function flattenPresence(state: PresenceState): RosterEntry[] {
  return Object.entries(state)
    .map(([key, entries]) => {
      const p = entries.find(
        (e) => typeof e.name === "string" && typeof e.drink === "string",
      );
      return p
        ? { key, name: p.name!, drink: p.drink!, joined_at: p.joined_at ?? "" }
        : null;
    })
    .filter((e): e is RosterEntry & { joined_at: string } => e !== null)
    .sort((a, b) => a.joined_at.localeCompare(b.joined_at))
    .map(({ key, name, drink }) => ({ key, name, drink }));
}

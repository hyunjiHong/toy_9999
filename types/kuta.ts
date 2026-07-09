// 음료 종류 (spec §2): 아메리카노 / 라떼 / 카푸치노 / 아이스 / 차
export type DrinkId = "americano" | "latte" | "cappuccino" | "iced" | "tea";

// 방에 접속한 사람 (Realtime Presence payload — DB 아님)
export interface Participant {
  name: string;
  drink: DrinkId;
}

// presence key를 포함한 참여자 — 동명이인 구분(spec §8 이름 중복 허용)과 안정적 list key용.
export interface RosterEntry extends Participant {
  key: string;
}

// 채팅 메시지 (messages 테이블)
export interface Message {
  id: string;
  room_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

// 타이머 단계 (types 레이어에 둬서 services·hooks·components 어디서든 참조 가능)
export type TimerPhase = "active" | "ending-soon" | "ended";

// 진행 중인 커타 (kuta_sessions 테이블)
export interface KutaSession {
  id: string;
  room_id: string;
  started_at: string;
  duration_seconds: number;
  question: string;
  ended_at: string | null;
}

import { describe, expect, it } from "vitest";
import { flattenPresence } from "./presence";

describe("flattenPresence", () => {
  it("presence state를 입장 순서(joined_at)대로, presence key를 보존해 편다", () => {
    const state = {
      keyB: [{ name: "서연", drink: "iced", joined_at: "2026-07-09T03:00:02Z" }],
      keyA: [{ name: "민지", drink: "latte", joined_at: "2026-07-09T03:00:00Z" }],
      keyC: [{ name: "지훈", drink: "americano", joined_at: "2026-07-09T03:00:01Z" }],
    };
    expect(flattenPresence(state as never)).toEqual([
      { key: "keyA", name: "민지", drink: "latte" },
      { key: "keyC", name: "지훈", drink: "americano" },
      { key: "keyB", name: "서연", drink: "iced" },
    ]);
  });

  it("동명이인이어도 presence key로 구분된다", () => {
    const state = {
      k1: [{ name: "민지", drink: "latte", joined_at: "2026-07-09T03:00:00Z" }],
      k2: [{ name: "민지", drink: "latte", joined_at: "2026-07-09T03:00:01Z" }],
    };
    const roster = flattenPresence(state as never);
    expect(roster.map((r) => r.key)).toEqual(["k1", "k2"]);
  });

  it("payload가 없는 빈 엔트리는 걸러낸다", () => {
    const state = {
      ghost: [{ presence_ref: "x" }],
      real: [{ name: "민지", drink: "latte", joined_at: "2026-07-09T03:00:00Z" }],
    };
    expect(flattenPresence(state as never)).toEqual([
      { key: "real", name: "민지", drink: "latte" },
    ]);
  });
});

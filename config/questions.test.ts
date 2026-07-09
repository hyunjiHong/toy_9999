import { describe, expect, it } from "vitest";
import { pickQuestion, QUESTIONS } from "./questions";

describe("pickQuestion", () => {
  it("항상 목록에 있는 질문 하나를 고른다", () => {
    for (let i = 0; i < 20; i++) {
      expect(QUESTIONS).toContain(pickQuestion());
    }
  });
});

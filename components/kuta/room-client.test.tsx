import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RoomClient } from "./room-client";

describe("RoomClient", () => {
  // SC1 — 입장 → 커타 존 진입 (end-to-end, 컴포넌트 레벨)
  it("이름 입력 후 '커타 참여'를 누르면 커타 존이 나타난다", async () => {
    const user = userEvent.setup();
    render(<RoomClient roomId="00000000-0000-0000-0000-000000000001" roomName="팀 커타방" />);

    // 처음엔 입장 화면
    expect(screen.getByRole("button", { name: "커타 참여" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("이름"), "민지");
    await user.click(screen.getByRole("button", { name: "커타 참여" }));

    // 커타 존으로 전환
    expect(
      await screen.findByRole("heading", { name: /커타 존/ }),
    ).toBeInTheDocument();
  });
});

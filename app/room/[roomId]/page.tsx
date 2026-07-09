import { RoomClient } from "@/components/kuta/room-client";

// Next 16: 동적 라우트의 params는 Promise다.
export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return (
    <main className="min-h-dvh p-6">
      <RoomClient roomId={roomId} roomName="팀 커타방" />
    </main>
  );
}

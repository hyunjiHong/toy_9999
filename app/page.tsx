import Link from "next/link";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEED_ROOM_ID } from "@/config/room";

export default function Page() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        <Coffee className="size-9 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">온라인 커타 ☕</h1>
        <p className="mt-1 text-muted-foreground">
          링크 하나로 잠깐 모여 커피 한 잔 하듯 수다 떨어요.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href={`/room/${SEED_ROOM_ID}`}>커타방 들어가기</Link>
      </Button>
    </main>
  );
}

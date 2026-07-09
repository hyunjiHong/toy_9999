// 오늘의 커타 질문 배너. question은 useKutaTimer가 준 세션에서 prop으로 받는다
// (components → services 직접 참조 없음 — 아키텍처 레이어 준수).
export function QuestionBanner({ question }: { question: string | null }) {
  if (!question) return null;
  return (
    <div className="mb-4 rounded-lg border border-dashed bg-muted px-3 py-2 text-sm">
      <span className="text-muted-foreground">오늘의 커타 질문 — </span>
      <span className="font-medium">{question}</span>
    </div>
  );
}

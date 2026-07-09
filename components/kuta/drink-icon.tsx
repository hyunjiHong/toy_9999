import { Coffee, CupSoda, Leaf, type LucideProps } from "lucide-react";
import { DRINKS, type DrinkOption } from "@/config/drinks";
import type { DrinkId } from "@/types/kuta";

const ICON_MAP: Record<DrinkOption["icon"], React.ComponentType<LucideProps>> = {
  Coffee,
  CupSoda,
  Leaf,
};

// 음료 id → 컵 아이콘. entry-form(선택 칩)과 avatar(참여자 컵) 양쪽에서 공유.
export function DrinkIcon({
  drink,
  className,
}: {
  drink: DrinkId;
  className?: string;
}) {
  const option = DRINKS.find((d) => d.id === drink);
  const Icon = ICON_MAP[option?.icon ?? "Coffee"];
  return <Icon className={className} data-icon="inline-start" aria-hidden />;
}

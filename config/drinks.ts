import type { DrinkId } from "@/types/kuta";

export interface DrinkOption {
  id: DrinkId;
  label: string;
  // lucide-react 아이콘 이름 (컴포넌트에서 매핑)
  icon: "Coffee" | "CupSoda" | "Leaf";
}

// 순서 = wireframe 입장 화면의 칩 순서
export const DRINKS: DrinkOption[] = [
  { id: "latte", label: "라떼", icon: "Coffee" },
  { id: "americano", label: "아메리카노", icon: "Coffee" },
  { id: "cappuccino", label: "카푸치노", icon: "Coffee" },
  { id: "iced", label: "아이스", icon: "CupSoda" },
  { id: "tea", label: "차", icon: "Leaf" },
];

export const DEFAULT_DRINK: DrinkId = "latte";

export function drinkLabel(id: DrinkId): string {
  return DRINKS.find((d) => d.id === id)?.label ?? id;
}

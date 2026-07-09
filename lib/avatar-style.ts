import type { DrinkId } from "@/types/kuta";

// 이름을 시드로 머리/피부/옷 색을 고른다 (같은 이름 = 항상 같은 모습).
const SKINS = ["#F6D3B0", "#EEC1A0", "#F9DEC4", "#E0AE86"];
const HAIRS = ["#4A3728", "#6B4A2A", "#2E2A28", "#8A5A34", "#B5713F", "#3A2E3A"];
const SHIRTS = [
  "#E4897E",
  "#6E9FD8",
  "#5FBE93",
  "#9A90E6",
  "#EBB25A",
  "#EF8A5E",
  "#5FC2C2",
];

// 음료 → 컵 안 색 (spec §2 음료 종류)
export const DRINK_COLOR: Record<DrinkId, string> = {
  latte: "#E8D3B0",
  americano: "#5A3A22",
  cappuccino: "#CBA079",
  iced: "#BFE3F0",
  tea: "#94C46B",
};

export function hashName(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pick<T>(arr: T[], n: number): T {
  return arr[n % arr.length];
}

export interface AvatarColors {
  skin: string;
  hair: string;
  shirt: string;
}

export function avatarColors(name: string): AvatarColors {
  const h = hashName(name);
  return {
    skin: pick(SKINS, h),
    hair: pick(HAIRS, h >> 3),
    shirt: pick(SHIRTS, h >> 6),
  };
}

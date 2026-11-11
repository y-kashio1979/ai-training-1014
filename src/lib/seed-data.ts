import type { Employee } from "./employees";
import type { Shop } from "./lunch-data";
import type { LunchConfig } from "./time";

// Firestore が空のときに一度だけ保存する、ダミーデータ。名前・お店はすべてサンプル。

export const SEED_EMPLOYEES: readonly Employee[] = [
  { id: "aoki", name: "青木 さくら", department: "営業部" },
  { id: "ito", name: "伊藤 健太", department: "開発部" },
  { id: "tanaka", name: "田中 陽介", department: "総務部" },
  { id: "nakamura", name: "中村 あや", department: "経理部" },
  { id: "yamaguchi", name: "山口 拓也", department: "開発部" },
];

export const SEED_SHOPS: readonly Shop[] = [
  { id: "shop1", name: "洋食 みどり亭", order: 1 },
  { id: "shop2", name: "定食 はなまる", order: 2 },
  { id: "shop3", name: "カフェ ソラ", order: 3 },
];

export const SEED_CONFIG: LunchConfig = {
  deadline: "09:30",
  lunchStart: "12:00",
};

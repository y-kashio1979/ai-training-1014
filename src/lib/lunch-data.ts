import type { Employee } from "./employees";
import { parseTime, validateConfig, type LunchConfig } from "./time";

export type Shop = { id: string; name: string; order: number };

/** アプリ起動時に Firestore から読み込むデータ。 */
export type LunchData = {
  employees: Employee[];
  shops: Shop[];
  config: LunchConfig;
};

type RawData = Record<string, unknown>;

function requireString(data: RawData, key: string, where: string): string {
  const value = data[key];
  if (typeof value !== "string") {
    throw new Error(`${where} の ${key} が文字列ではありません`);
  }
  return value;
}

/** Firestore のドキュメントを社員にする。形が違えば例外にする。 */
export function parseEmployee(id: string, data: RawData): Employee {
  return {
    id,
    name: requireString(data, "name", `employees/${id}`),
    department: requireString(data, "department", `employees/${id}`),
  };
}

/** Firestore のドキュメントをお店にする。形が違えば例外にする。 */
export function parseShop(id: string, data: RawData): Shop {
  const order = data.order;
  if (typeof order !== "number" || !Number.isFinite(order)) {
    throw new Error(`shops/${id} の order が数値ではありません`);
  }
  return { id, name: requireString(data, "name", `shops/${id}`), order };
}

/** Firestore のドキュメントを締切・開始時刻の設定にする。時刻が不正なら例外にする。 */
export function parseConfig(data: RawData): LunchConfig {
  const config = {
    deadline: requireString(data, "deadline", "settings/config"),
    lunchStart: requireString(data, "lunchStart", "settings/config"),
  };
  validateConfig(config);
  return config;
}

/** お店を order の小さい順(同じなら名前順)に並べる。元の配列は変えない。 */
export function sortShops(shops: readonly Shop[]): Shop[] {
  return [...shops].sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name, "ja"),
  );
}

/** 社員を ID 順に並べる。元の配列は変えない。 */
export function sortEmployees(employees: readonly Employee[]): Employee[] {
  return [...employees].sort((a, b) => a.id.localeCompare(b.id));
}

/** "09:30" を "9:30" にする。不正な形式は例外にする。 */
export function formatTime(text: string): string {
  const minutes = parseTime(text);
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

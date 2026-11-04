import type { Employee } from "./employees";
import type { LunchConfig } from "./time";

/** 画面のダミーデータと同じ時刻・お店。 */
export const config: LunchConfig = { deadline: "09:30", lunchStart: "12:00" };
export const shops: readonly string[] = ["洋食 みどり亭", "定食 はなまる", "カフェ ソラ"];

const DEPARTMENTS = ["営業部", "開発部", "総務部", "経理部"] as const;

/** e01〜eNN の社員を n 人作る。部署は順に割り当てる。 */
export function makeEmployees(count: number): Employee[] {
  return Array.from({ length: count }, (_, i) => {
    const no = String(i + 1).padStart(2, "0");
    return {
      id: `e${no}`,
      name: `社員${no}`,
      department: DEPARTMENTS[i % DEPARTMENTS.length],
    };
  });
}

/** seed が同じなら同じ列を返す乱数(0以上1未満)。 */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/** 日本時間の日時から Date を作る。例: jst("2026-11-04", "09:29") */
export function jst(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+09:00`);
}

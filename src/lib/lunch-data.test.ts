import { describe, expect, it } from "vitest";
import {
  formatTime,
  parseConfig,
  parseEmployee,
  parseShop,
  sortEmployees,
  sortShops,
} from "./lunch-data";
import { SEED_CONFIG, SEED_EMPLOYEES, SEED_SHOPS } from "./seed-data";
import { validateConfig } from "./time";

describe("parseEmployee", () => {
  it("ドキュメントを社員にする", () => {
    expect(parseEmployee("aoki", { name: "青木", department: "営業部" })).toEqual({
      id: "aoki",
      name: "青木",
      department: "営業部",
    });
  });

  it("文字列でない項目があれば例外", () => {
    expect(() => parseEmployee("x", { name: 1, department: "a" })).toThrow();
    expect(() => parseEmployee("x", { name: "a" })).toThrow();
  });
});

describe("parseShop", () => {
  it("ドキュメントをお店にする", () => {
    expect(parseShop("s1", { name: "みどり亭", order: 2 })).toEqual({
      id: "s1",
      name: "みどり亭",
      order: 2,
    });
  });

  it("order が数値でなければ例外", () => {
    expect(() => parseShop("s1", { name: "a", order: "1" })).toThrow();
    expect(() => parseShop("s1", { name: "a", order: Number.NaN })).toThrow();
  });
});

describe("parseConfig", () => {
  it("正しい設定を返す", () => {
    expect(parseConfig({ deadline: "09:30", lunchStart: "12:00" })).toEqual({
      deadline: "09:30",
      lunchStart: "12:00",
    });
  });

  it("時刻が不正、またはランチ開始が締切以前なら例外", () => {
    expect(() => parseConfig({ deadline: "9:30", lunchStart: "12:00" })).toThrow();
    expect(() => parseConfig({ deadline: "12:00", lunchStart: "09:30" })).toThrow();
    expect(() => parseConfig({ deadline: "09:30" })).toThrow();
  });
});

describe("並び替え", () => {
  it("お店は order 順で、元の配列を変えない", () => {
    const shops = [
      { id: "b", name: "B", order: 2 },
      { id: "a", name: "A", order: 1 },
    ];
    expect(sortShops(shops).map((s) => s.id)).toEqual(["a", "b"]);
    expect(shops[0].id).toBe("b");
  });

  it("社員は ID 順で、元の配列を変えない", () => {
    const employees = [
      { id: "b", name: "B", department: "" },
      { id: "a", name: "A", department: "" },
    ];
    expect(sortEmployees(employees).map((e) => e.id)).toEqual(["a", "b"]);
    expect(employees[0].id).toBe("b");
  });
});

describe("formatTime", () => {
  it("先頭の 0 を取る", () => {
    expect(formatTime("09:30")).toBe("9:30");
    expect(formatTime("12:00")).toBe("12:00");
  });

  it("不正な形式は例外", () => {
    expect(() => formatTime("9:30")).toThrow();
  });
});

describe("ダミーデータ", () => {
  it("社員とお店の ID が重ならない", () => {
    expect(new Set(SEED_EMPLOYEES.map((e) => e.id)).size).toBe(SEED_EMPLOYEES.length);
    expect(new Set(SEED_SHOPS.map((s) => s.id)).size).toBe(SEED_SHOPS.length);
  });

  it("設定が正しく、読み込み用の関数を通る", () => {
    expect(() => validateConfig(SEED_CONFIG)).not.toThrow();
    for (const e of SEED_EMPLOYEES) {
      expect(parseEmployee(e.id, { name: e.name, department: e.department })).toEqual(e);
    }
    for (const s of SEED_SHOPS) {
      expect(parseShop(s.id, { name: s.name, order: s.order })).toEqual(s);
    }
  });
});

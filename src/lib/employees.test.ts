import { describe, expect, test } from "vitest";
import { filterEmployees, type Employee } from "./employees";

const employees: Employee[] = [
  { id: "aoki", name: "青木 さくら", department: "営業部" },
  { id: "ito", name: "伊藤 健太", department: "開発部" },
  { id: "tanaka", name: "田中 陽介", department: "総務部" },
];

describe("filterEmployees", () => {
  test("名前の一部で絞り込める", () => {
    expect(filterEmployees(employees, "田中").map((e) => e.id)).toEqual(["tanaka"]);
  });

  test("空白の有無に関係なく一致する", () => {
    expect(filterEmployees(employees, "青木さくら")).toHaveLength(1);
    expect(filterEmployees(employees, "青木 さくら")).toHaveLength(1);
    expect(filterEmployees(employees, "青木　さくら")).toHaveLength(1);
  });

  test("検索語が空なら全員を返す", () => {
    expect(filterEmployees(employees, "")).toHaveLength(3);
    expect(filterEmployees(employees, "  ")).toHaveLength(3);
  });

  test("一致する人がいなければ空になる", () => {
    expect(filterEmployees(employees, "存在しない")).toEqual([]);
  });
});

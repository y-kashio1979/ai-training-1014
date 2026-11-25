import { describe, expect, it } from "vitest";
import {
  buildShopUpdate,
  nextShopId,
  nextShopOrder,
  normalizeShopName,
  validateShopOrder,
} from "./shop-edit";

describe("normalizeShopName", () => {
  it("前後の空白を除く", () => {
    expect(normalizeShopName("  みどり亭 ")).toBe("みどり亭");
  });

  it("空や空白だけは例外", () => {
    expect(() => normalizeShopName("")).toThrow();
    expect(() => normalizeShopName("   ")).toThrow();
  });

  it("50 文字を超えると例外", () => {
    expect(normalizeShopName("あ".repeat(50))).toHaveLength(50);
    expect(() => normalizeShopName("あ".repeat(51))).toThrow();
  });
});

describe("validateShopOrder", () => {
  it("有限の数値はそのまま返す", () => {
    expect(validateShopOrder(3)).toBe(3);
  });

  it("NaN や無限大は例外", () => {
    expect(() => validateShopOrder(Number.NaN)).toThrow();
    expect(() => validateShopOrder(Number.POSITIVE_INFINITY)).toThrow();
  });
});

describe("nextShopId", () => {
  it("既存の最大の番号の次にする", () => {
    expect(nextShopId(["shop1", "shop3", "shop2"])).toBe("shop4");
  });

  it("空なら shop1", () => {
    expect(nextShopId([])).toBe("shop1");
  });

  it("連番でない ID は無視する", () => {
    expect(nextShopId(["curry", "shop2"])).toBe("shop3");
  });
});

describe("nextShopOrder", () => {
  it("最大の order の次にする", () => {
    expect(
      nextShopOrder([
        { id: "a", name: "A", order: 1 },
        { id: "b", name: "B", order: 5 },
      ]),
    ).toBe(6);
  });

  it("空なら 1", () => {
    expect(nextShopOrder([])).toBe(1);
  });
});

describe("buildShopUpdate", () => {
  it("指定した項目だけ返す", () => {
    expect(buildShopUpdate({ name: " 新店 " })).toEqual({ name: "新店" });
    expect(buildShopUpdate({ order: 2 })).toEqual({ order: 2 });
  });

  it("何も指定しなければ例外", () => {
    expect(() => buildShopUpdate({})).toThrow();
  });
});

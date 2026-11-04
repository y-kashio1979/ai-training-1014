import { describe, expect, test } from "vitest";
import { getWeekId, isBeforeDeadline, parseTime, validateConfig } from "./time";
import { config, jst } from "./test-data";

describe("parseTime", () => {
  test("HH:mm を分に直す", () => {
    expect(parseTime("00:00")).toBe(0);
    expect(parseTime("09:30")).toBe(570);
    expect(parseTime("23:59")).toBe(1439);
  });

  test.each(["25:99", "24:00", "9:30", "09:60", "abc", ""])(
    "不正な時刻 %j は拒否する",
    (text) => {
      expect(() => parseTime(text)).toThrow();
    },
  );
});

describe("validateConfig", () => {
  test("正しい設定は通る", () => {
    expect(() => validateConfig(config)).not.toThrow();
  });

  test("ランチ開始が締切以前なら拒否する", () => {
    expect(() => validateConfig({ deadline: "12:00", lunchStart: "12:00" })).toThrow();
    expect(() => validateConfig({ deadline: "13:00", lunchStart: "12:00" })).toThrow();
  });

  test("不正な時刻は拒否する", () => {
    expect(() => validateConfig({ deadline: "25:99", lunchStart: "12:00" })).toThrow();
  });
});

describe("isBeforeDeadline", () => {
  test("締切の1分前は締切前、ちょうどは締切後", () => {
    expect(isBeforeDeadline(jst("2026-11-04", "09:29"), config)).toBe(true);
    expect(isBeforeDeadline(jst("2026-11-04", "09:30"), config)).toBe(false);
    expect(isBeforeDeadline(jst("2026-11-04", "12:00"), config)).toBe(false);
  });

  test("設定を変えると判定も変わる", () => {
    const later = { deadline: "10:30", lunchStart: "12:00" };
    expect(isBeforeDeadline(jst("2026-11-04", "09:30"), later)).toBe(true);
  });

  test("サーバーの時刻設定に関係なく日本時間で判定する", () => {
    // UTC では前日の 23:29 だが、日本時間では 08:29
    expect(isBeforeDeadline(new Date("2026-11-03T23:29:00Z"), config)).toBe(true);
    // UTC では 00:30 だが、日本時間では 09:30
    expect(isBeforeDeadline(new Date("2026-11-04T00:30:00Z"), config)).toBe(false);
  });
});

describe("getWeekId", () => {
  test("その週の月曜の日付になる", () => {
    // 2026-11-04 は水曜、月曜は 11-02
    expect(getWeekId(jst("2026-11-04", "09:00"))).toBe("2026-11-02");
    expect(getWeekId(jst("2026-11-02", "00:00"))).toBe("2026-11-02");
    expect(getWeekId(jst("2026-11-08", "23:59"))).toBe("2026-11-02");
    expect(getWeekId(jst("2026-11-09", "00:00"))).toBe("2026-11-09");
  });

  test("月をまたぐ週も正しい", () => {
    // 2026-12-01 は火曜、月曜は 11-30
    expect(getWeekId(jst("2026-12-01", "12:00"))).toBe("2026-11-30");
  });

  test("日本時間で数える(UTC では前日でも日本時間の日付を使う)", () => {
    expect(getWeekId(new Date("2026-11-01T15:00:00Z"))).toBe("2026-11-02");
  });
});

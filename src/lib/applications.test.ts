import { describe, expect, test } from "vitest";
import { applyForLunch, cancelApplication } from "./applications";
import { config, jst } from "./test-data";

const before = jst("2026-11-04", "09:29");
const after = jst("2026-11-04", "09:30");

describe("applyForLunch", () => {
  test("締切前に申し込むと参加者に入る", () => {
    expect(applyForLunch(["a"], "b", before, config)).toEqual({
      ok: true,
      applicantIds: ["a", "b"],
    });
  });

  test("同じ人が2回申し込んでも1人分になる", () => {
    expect(applyForLunch(["a", "b"], "b", before, config)).toEqual({
      ok: true,
      applicantIds: ["a", "b"],
    });
  });

  test("締切後は申し込めない", () => {
    expect(applyForLunch(["a"], "b", after, config)).toEqual({
      ok: false,
      reason: "closed",
    });
  });

  test("元の配列は書き換えない", () => {
    const applicants = ["a"];
    applyForLunch(applicants, "b", before, config);
    expect(applicants).toEqual(["a"]);
  });
});

describe("cancelApplication", () => {
  test("取り消すと参加者から外れる", () => {
    expect(cancelApplication(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });

  test("申し込んでいない人を取り消してもエラーにならない", () => {
    expect(cancelApplication(["a"], "zzz")).toEqual(["a"]);
  });

  test("締切後でも取り消せる", () => {
    // 時刻を受け取らないので、いつでも取り消せる
    expect(cancelApplication(["a", "b"], "a")).toEqual(["b"]);
  });
});

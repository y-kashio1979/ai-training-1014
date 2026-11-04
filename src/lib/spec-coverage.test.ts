import { describe, expect, test } from "vitest";
import { applyForLunch, cancelApplication } from "./applications";
import { makeGroups, removeMember, type Group } from "./grouping";
import { config, createRandom, jst, makeEmployees } from "./test-data";
import { getWeekId, isBeforeDeadline, validateConfig } from "./time";

// SPEC.md のうち、既存のテストで確かめていなかった条件を確かめる。

const employees = makeEmployees(12);
const ids = (n: number) => employees.slice(0, n).map((e) => e.id);

/** 同じ乱数を使い続けて、グループ分けを trials 回行う。 */
function runMany(
  applicants: readonly string[],
  trials: number,
  seed: number,
): Group[][] {
  const random = createRandom(seed);
  return Array.from({ length: trials }, () => {
    const result = makeGroups(applicants, random);
    if (result.status !== "ok") throw new Error("グループが作られていません");
    return result.groups;
  });
}

/** 2人が同じグループになった割合。 */
function sameGroupRate(runs: Group[][], a: string, b: string): number {
  const same = runs.filter((groups) =>
    groups.some((g) => g.memberIds.includes(a) && g.memberIds.includes(b)),
  );
  return same.length / runs.length;
}

describe("完全ランダム", () => {
  const trials = 4000;
  // 8人(4+4)で特定の2人が同じグループになる確率は 3/7
  const expected = 3 / 7;
  const tolerance = 0.04;

  test("どの2人も、同じグループになる割合が偏らない", () => {
    const runs = runMany(ids(8), trials, 42);
    for (const [a, b] of [
      ["e01", "e02"],
      ["e01", "e08"],
      ["e04", "e05"],
      ["e07", "e08"],
    ]) {
      expect(sameGroupRate(runs, a, b)).toBeCloseTo(expected, 1);
      expect(Math.abs(sameGroupRate(runs, a, b) - expected)).toBeLessThan(tolerance);
    }
  });

  test("10人(4+3+3)で、誰がどのグループに入る割合も偏らない", () => {
    const runs = runMany(ids(10), trials, 7);
    const sizes = { A: 4 / 10, B: 3 / 10, C: 3 / 10 };
    for (const id of ["e01", "e05", "e10"]) {
      for (const [name, rate] of Object.entries(sizes)) {
        const count = runs.filter((groups) =>
          groups.some((g) => g.name === name && g.memberIds.includes(id)),
        ).length;
        expect(Math.abs(count / trials - rate)).toBeLessThan(tolerance);
      }
    }
  });
});

describe("過去の同席履歴・部署による制約なし", () => {
  const trials = 4000;
  const expected = 3 / 7;

  test("申し込み順を逆にしても、同じグループになる割合は変わらない", () => {
    const forward = runMany(ids(8), trials, 11);
    const backward = runMany([...ids(8)].reverse(), trials, 11);
    expect(Math.abs(sameGroupRate(forward, "e01", "e02") - expected)).toBeLessThan(0.04);
    expect(Math.abs(sameGroupRate(backward, "e01", "e02") - expected)).toBeLessThan(0.04);
  });

  test("同じ部署の2人も、違う部署の2人も、同じグループになる割合は同じ", () => {
    const runs = runMany(ids(8), trials, 23);
    // makeEmployees は部署を4つ順に割り当てる: e01 と e05 は同じ部署、e01 と e02 は違う部署
    expect(employees[0].department).toBe(employees[4].department);
    expect(employees[0].department).not.toBe(employees[1].department);
    const sameDepartment = sameGroupRate(runs, "e01", "e05");
    const otherDepartment = sameGroupRate(runs, "e01", "e02");
    expect(Math.abs(sameDepartment - expected)).toBeLessThan(0.04);
    expect(Math.abs(otherDepartment - expected)).toBeLessThan(0.04);
  });

  test("何度グループを作っても、同じ組み合わせが避けられることはない", () => {
    // 履歴を持たないので、同じ人たちで繰り返し作れば、同じ2人が再び同席することがある
    const runs = runMany(ids(8), 200, 5);
    const pairs = new Set(
      runs.map((groups) => groups.find((g) => g.memberIds.includes("e01"))!.memberIds.join()),
    );
    expect(pairs.size).toBeLessThan(runs.length);
  });
});

describe("締切後は取り消しのみ(通しの流れ)", () => {
  const before = jst("2026-11-04", "09:29");
  const after = jst("2026-11-04", "09:30");

  test("締切後は新しい申し込みを断り、取り消しだけ受け付け、グループは組み直さない", () => {
    // 締切前に6人が申し込む
    let applicants: string[] = [];
    for (const id of ids(6)) {
      const applied = applyForLunch(applicants, id, before, config);
      if (!applied.ok) throw new Error("申し込めませんでした");
      applicants = applied.applicantIds;
    }

    // 締切の時刻にグループが決まる
    expect(isBeforeDeadline(after, config)).toBe(false);
    const made = makeGroups(applicants, createRandom(1));
    if (made.status !== "ok") throw new Error("グループが作られていません");
    const groups = made.groups;
    expect(groups.map((g) => g.memberIds.length)).toEqual([3, 3]);

    // 締切後の新しい申し込みは断られ、参加者は変わらない
    expect(applyForLunch(applicants, "e07", after, config)).toEqual({
      ok: false,
      reason: "closed",
    });

    // 締切後の取り消しは受け付ける
    const leaving = groups[0].memberIds[0];
    expect(cancelApplication(applicants, leaving)).not.toContain(leaving);

    // グループは、その人が外れるだけ。ほかの人も別のグループも動かない
    const updated = removeMember(groups, leaving);
    expect(updated).toHaveLength(2);
    expect(updated[0].memberIds).toEqual(groups[0].memberIds.slice(1));
    expect(updated[1]).toEqual(groups[1]);
  });
});

describe("毎週申し込む", () => {
  test("同じ週なら、曜日や時刻が違っても同じ週の値になる", () => {
    const monday = getWeekId(jst("2026-11-02", "00:00"));
    expect(monday).toBe("2026-11-02");
    expect(getWeekId(jst("2026-11-04", "09:29"))).toBe(monday);
    expect(getWeekId(jst("2026-11-08", "23:59"))).toBe(monday);
  });

  test("月曜の日本時間0時で、次の週に切り替わる", () => {
    expect(getWeekId(jst("2026-11-08", "23:59"))).toBe("2026-11-02");
    expect(getWeekId(jst("2026-11-09", "00:00"))).toBe("2026-11-09");
  });

  test("週ごとに申し込みを分けて持てる(週が違えば持ち越されない)", () => {
    const byWeek = new Map<string, string[]>();
    const apply = (now: Date, id: string) => {
      const week = getWeekId(now);
      const result = applyForLunch(byWeek.get(week) ?? [], id, now, config);
      if (result.ok) byWeek.set(week, result.applicantIds);
    };
    apply(jst("2026-11-04", "09:00"), "e01");
    apply(jst("2026-11-11", "09:00"), "e02");
    expect(byWeek.get("2026-11-02")).toEqual(["e01"]);
    expect(byWeek.get("2026-11-09")).toEqual(["e02"]);
  });
});

describe("ランチ開始時刻は設定値", () => {
  test("ランチ開始時刻を変えても、締切より後なら受け付ける", () => {
    expect(() => validateConfig({ deadline: "09:30", lunchStart: "11:00" })).not.toThrow();
    expect(() => validateConfig({ deadline: "09:30", lunchStart: "13:30" })).not.toThrow();
  });

  test("ランチ開始時刻を変えても、締切の判定は変わらない", () => {
    const now = jst("2026-11-04", "09:29");
    expect(isBeforeDeadline(now, { deadline: "09:30", lunchStart: "11:00" })).toBe(true);
    expect(isBeforeDeadline(now, { deadline: "09:30", lunchStart: "13:30" })).toBe(true);
  });

  test("締切を変えると、同じ時刻でも判定が変わる", () => {
    const now = jst("2026-11-04", "10:00");
    expect(isBeforeDeadline(now, { deadline: "09:30", lunchStart: "12:00" })).toBe(false);
    expect(isBeforeDeadline(now, { deadline: "10:30", lunchStart: "12:00" })).toBe(true);
  });
});

import { describe, expect, test } from "vitest";
import {
  groupName,
  makeGroups,
  removeMember,
  splitGroupSizes,
} from "./grouping";
import { createRandom, makeEmployees } from "./test-data";

const ids = (n: number) => makeEmployees(n).map((e) => e.id);

describe("splitGroupSizes", () => {
  test.each([
    [3, [3]],
    [4, [4]],
    [6, [3, 3]],
    [7, [4, 3]],
    [8, [4, 4]],
    [9, [3, 3, 3]],
    [10, [4, 3, 3]],
    [11, [4, 4, 3]],
    [12, [4, 4, 4]],
    [30, [4, 4, 4, 4, 4, 4, 3, 3]],
  ])("%i人 → %j", (count, expected) => {
    expect(splitGroupSizes(count)).toEqual(expected);
  });

  test.each([0, 1, 2, 5, -1, 3.5])("%s人は分けられない", (count) => {
    expect(splitGroupSizes(count)).toBeNull();
  });

  test("3〜60人の合計は人数と一致し、3人か4人だけで、4人が最大になる(3人は最大3グループ)", () => {
    for (let n = 3; n <= 60; n++) {
      const sizes = splitGroupSizes(n);
      if (n === 5) {
        expect(sizes).toBeNull();
        continue;
      }
      expect(sizes).not.toBeNull();
      expect(sizes!.reduce((a, b) => a + b, 0)).toBe(n);
      expect(sizes!.every((s) => s === 3 || s === 4)).toBe(true);
      expect(sizes!.filter((s) => s === 3).length).toBeLessThanOrEqual(3);
    }
  });
});

describe("groupName", () => {
  test("A, B, C… の順で、26を超えたら番号になる", () => {
    expect([0, 1, 2].map(groupName)).toEqual(["A", "B", "C"]);
    expect(groupName(25)).toBe("Z");
    expect(groupName(26)).toBe("G27");
  });
});

describe("makeGroups", () => {
  test("全員がちょうど1回ずつ、どれかのグループに入る", () => {
    const applicants = ids(30);
    const result = makeGroups(applicants, createRandom(1));
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    const members = result.groups.flatMap((g) => g.memberIds);
    expect(members).toHaveLength(30);
    expect(new Set(members)).toEqual(new Set(applicants));
  });

  test("10人は 4+3+3 で、名前は A, B, C", () => {
    const result = makeGroups(ids(10), createRandom(1));
    if (result.status !== "ok") throw new Error("グループが作られていません");
    expect(result.groups.map((g) => g.memberIds.length)).toEqual([4, 3, 3]);
    expect(result.groups.map((g) => g.name)).toEqual(["A", "B", "C"]);
  });

  test("同じ乱数なら同じ結果になる", () => {
    expect(makeGroups(ids(12), createRandom(7))).toEqual(
      makeGroups(ids(12), createRandom(7)),
    );
  });

  test("乱数が違えば組み合わせが変わる", () => {
    expect(makeGroups(ids(12), createRandom(1))).not.toEqual(
      makeGroups(ids(12), createRandom(2)),
    );
  });

  test("申し込みの順番や部署に関係なく成立する", () => {
    const sameDepartment = ["a", "b", "c", "d"];
    const result = makeGroups(sameDepartment, createRandom(3));
    expect(result.status).toBe("ok");
  });

  test("同じ id が重複していても1人として数える", () => {
    const result = makeGroups(["a", "a", "b", "c"], createRandom(1));
    if (result.status !== "ok") throw new Error("グループが作られていません");
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].memberIds).toHaveLength(3);
  });

  test.each([0, 1, 2, 5])("%i人ならグループを作らない", (n) => {
    expect(makeGroups(ids(n), createRandom(1))).toEqual({
      status: "insufficient",
      applicantCount: n,
    });
  });

  test("最小人数を設定値で変えられる", () => {
    expect(makeGroups(ids(4), createRandom(1), 6).status).toBe("insufficient");
    expect(makeGroups(ids(6), createRandom(1), 6).status).toBe("ok");
  });
});

describe("removeMember", () => {
  const groups = [
    { name: "A", memberIds: ["a", "b", "c", "d"] },
    { name: "B", memberIds: ["e", "f", "g"] },
  ];

  test("その人を外すだけで、ほかのグループやメンバーは変わらない", () => {
    expect(removeMember(groups, "c")).toEqual([
      { name: "A", memberIds: ["a", "b", "d"] },
      { name: "B", memberIds: ["e", "f", "g"] },
    ]);
  });

  test("元のデータは書き換えない", () => {
    removeMember(groups, "c");
    expect(groups[0].memberIds).toEqual(["a", "b", "c", "d"]);
  });

  test("いないメンバーを指定しても何も変わらない", () => {
    expect(removeMember(groups, "zzz")).toEqual(groups);
  });

  test("メンバーがいなくなったグループは取り除く", () => {
    expect(removeMember([{ name: "A", memberIds: ["a"] }], "a")).toEqual([]);
  });
});

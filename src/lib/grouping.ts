export type Group = { name: string; memberIds: readonly string[] };

export type GroupingResult =
  | { status: "ok"; groups: Group[] }
  | { status: "insufficient"; applicantCount: number };

/** グループを作るのに必要な最小人数の初期値(設定値として変更できる)。 */
export const DEFAULT_MIN_PARTICIPANTS = 3;

/**
 * 人数を 4人 を基本に、割り切れなければ 3人 を混ぜて分ける。
 * 4人グループが最大になるようにする(例: 10人 = 4+3+3、12人 = 4+4+4)。
 * 分けられない人数(0〜2人、5人)は null を返す。
 */
export function splitGroupSizes(count: number): number[] | null {
  if (!Number.isInteger(count) || count < 3) return null;
  for (let fours = Math.floor(count / 4); fours >= 0; fours--) {
    const rest = count - fours * 4;
    if (rest % 3 === 0) {
      return [
        ...Array<number>(fours).fill(4),
        ...Array<number>(rest / 3).fill(3),
      ];
    }
  }
  return null;
}

/** グループ名。A, B, C… の順。26を超えたら G27 のように番号にする。 */
export function groupName(index: number): string {
  return index < 26 ? String.fromCharCode(65 + index) : `G${index + 1}`;
}

/**
 * 申し込んだ人を完全ランダムでグループに分ける。
 * 乱数(0以上1未満)は差し替えられる。同じ乱数なら同じ結果になる。
 * 人数が minParticipants 未満、または分けられない人数なら insufficient を返す。
 */
export function makeGroups(
  applicantIds: readonly string[],
  random: () => number,
  minParticipants: number = DEFAULT_MIN_PARTICIPANTS,
): GroupingResult {
  const ids = [...new Set(applicantIds)];
  const sizes = ids.length >= minParticipants ? splitGroupSizes(ids.length) : null;
  if (!sizes) return { status: "insufficient", applicantCount: ids.length };

  const shuffled = shuffle(ids, random);
  let start = 0;
  const groups = sizes.map((size, index) => {
    const memberIds = shuffled.slice(start, start + size);
    start += size;
    return { name: groupName(index), memberIds };
  });
  return { status: "ok", groups };
}

/**
 * 締切後の取り消し。その人をグループから外すだけで、組み直さない。
 * メンバーがいなくなったグループは取り除く。
 */
export function removeMember(groups: readonly Group[], id: string): Group[] {
  return groups
    .map((g) => ({ ...g, memberIds: g.memberIds.filter((m) => m !== id) }))
    .filter((g) => g.memberIds.length > 0);
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

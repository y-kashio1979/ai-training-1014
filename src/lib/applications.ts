import { isBeforeDeadline, type LunchConfig } from "./time";

export type ApplyResult =
  | { ok: true; applicantIds: string[] }
  | { ok: false; reason: "closed" };

/** 申し込む。締切後は申し込めない。同じ人が2回申し込んでも1人分になる。 */
export function applyForLunch(
  applicantIds: readonly string[],
  id: string,
  now: Date,
  config: LunchConfig,
): ApplyResult {
  if (!isBeforeDeadline(now, config)) return { ok: false, reason: "closed" };
  if (applicantIds.includes(id)) return { ok: true, applicantIds: [...applicantIds] };
  return { ok: true, applicantIds: [...applicantIds, id] };
}

/** 申し込みを取り消す。申し込んでいない人でもエラーにならない。 */
export function cancelApplication(
  applicantIds: readonly string[],
  id: string,
): string[] {
  return applicantIds.filter((a) => a !== id);
}

/** 締切とランチ開始の時刻。"HH:mm"(日本時間)で持つ。 */
export type LunchConfig = { deadline: string; lunchStart: string };

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** "HH:mm" を 0時からの分に直す。不正な形式は例外にする。 */
export function parseTime(text: string): number {
  const match = TIME_PATTERN.exec(text);
  if (!match) throw new Error(`時刻の形式が正しくありません: ${text}`);
  return Number(match[1]) * 60 + Number(match[2]);
}

/** 設定値を検査する。時刻が不正、またはランチ開始が締切以前なら例外にする。 */
export function validateConfig(config: LunchConfig): void {
  if (parseTime(config.lunchStart) <= parseTime(config.deadline)) {
    throw new Error("ランチ開始は締切より後にしてください");
  }
}

/** いまが締切前か。ちょうど締切の時刻は締切後として扱う。日本時間で判定する。 */
export function isBeforeDeadline(now: Date, config: LunchConfig): boolean {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  const minutes = jst.getUTCHours() * 60 + jst.getUTCMinutes();
  return minutes < parseTime(config.deadline);
}

/** その週を表す値。日本時間でその週の月曜の日付("YYYY-MM-DD")。 */
export function getWeekId(now: Date): string {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  const sinceMonday = (jst.getUTCDay() + 6) % 7;
  const monday = new Date(
    Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate() - sinceMonday),
  );
  return monday.toISOString().slice(0, 10);
}

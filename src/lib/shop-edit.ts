import type { Shop } from "./lunch-data";

/** お店の名前の最大文字数。 */
export const SHOP_NAME_MAX_LENGTH = 50;

/** お店の名前を整える(前後の空白を除く)。空や長すぎる名前は例外にする。 */
export function normalizeShopName(name: string): string {
  const trimmed = name.trim();
  if (trimmed === "") {
    throw new Error("お店の名前が空です");
  }
  if (trimmed.length > SHOP_NAME_MAX_LENGTH) {
    throw new Error(
      `お店の名前は ${SHOP_NAME_MAX_LENGTH} 文字以内にしてください`,
    );
  }
  return trimmed;
}

/** 並び順を確かめる。数値でない、または有限でない値は例外にする。 */
export function validateShopOrder(order: number): number {
  if (typeof order !== "number" || !Number.isFinite(order)) {
    throw new Error("order は数値にしてください");
  }
  return order;
}

/** 新しいお店の ID を決める。"shop" + 連番で、既存の最大の番号の次にする。 */
export function nextShopId(existingIds: readonly string[]): string {
  let max = 0;
  for (const id of existingIds) {
    const match = /^shop(\d+)$/.exec(id);
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }
  return `shop${max + 1}`;
}

/** order を省略して追加するときの並び順。今の最大の次にする。 */
export function nextShopOrder(shops: readonly Shop[]): number {
  return shops.reduce((max, s) => Math.max(max, s.order), 0) + 1;
}

/** 更新の指定(一部の項目だけ)を検証して、書き込む項目にする。何も変えないなら例外にする。 */
export function buildShopUpdate(input: {
  name?: string;
  order?: number;
}): { name?: string; order?: number } {
  const update: { name?: string; order?: number } = {};
  if (input.name !== undefined) {
    update.name = normalizeShopName(input.name);
  }
  if (input.order !== undefined) {
    update.order = validateShopOrder(input.order);
  }
  if (Object.keys(update).length === 0) {
    throw new Error("name か order のどちらかを指定してください");
  }
  return update;
}

export type Seat = {
  /** テーブルを囲む枠の左端からの位置(%)。席の中心を指す。 */
  left: number;
  /** テーブルを囲む枠の上端からの位置(%)。席の中心を指す。 */
  top: number;
};

const RADIUS_X = 30;
const RADIUS_Y = 36;

/**
 * 丸テーブルを囲む席の位置を返す。1番目が真上で、時計回りに等間隔で並べる。
 * 4人なら上・右・下・左、3人なら上・右下・左下になる。
 */
export function seatPositions(count: number): Seat[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count;
    return {
      left: round(50 + RADIUS_X * Math.sin(angle)),
      top: round(50 - RADIUS_Y * Math.cos(angle)),
    };
  });
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

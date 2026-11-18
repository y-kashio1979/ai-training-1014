import { describe, expect, test } from "vitest";
import { seatPositions } from "./seating";

describe("seatPositions", () => {
  test("4人なら上・右・下・左の順に並ぶ", () => {
    const [top, right, bottom, left] = seatPositions(4);
    expect(top).toEqual({ left: 50, top: 14 });
    expect(right).toEqual({ left: 80, top: 50 });
    expect(bottom).toEqual({ left: 50, top: 86 });
    expect(left).toEqual({ left: 20, top: 50 });
  });

  test("3人なら1番目が真上で、残りは下側に並ぶ", () => {
    const seats = seatPositions(3);
    expect(seats).toHaveLength(3);
    expect(seats[0]).toEqual({ left: 50, top: 14 });
    expect(seats[1].top).toBeGreaterThan(50);
    expect(seats[2].top).toBeGreaterThan(50);
  });

  test("0人なら空", () => {
    expect(seatPositions(0)).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import {
  isAllowedEmailDomain,
  parseAllowedDomains,
  toSessionUser,
} from "./auth";

describe("toSessionUser", () => {
  it("メールが確認済みなら利用者を返す", () => {
    expect(
      toSessionUser({
        sub: "u1",
        email: "a@example.com",
        email_verified: true,
        name: "青木",
      }),
    ).toEqual({ uid: "u1", email: "a@example.com", name: "青木" });
  });

  it("名前がなければ null を入れる", () => {
    expect(
      toSessionUser({ sub: "u1", email: "a@example.com", email_verified: true }),
    ).toEqual({ uid: "u1", email: "a@example.com", name: null });
  });

  it("利用者 ID(sub)がなければ null", () => {
    expect(
      toSessionUser({ email: "a@example.com", email_verified: true }),
    ).toBeNull();
  });

  it("メールがなければ null", () => {
    expect(toSessionUser({ sub: "u1", email_verified: true })).toBeNull();
    expect(
      toSessionUser({ sub: "u1", email: "", email_verified: true }),
    ).toBeNull();
    expect(
      toSessionUser({ sub: "u1", email: 123, email_verified: true }),
    ).toBeNull();
  });

  it("メールが未確認なら null", () => {
    expect(
      toSessionUser({ sub: "u1", email: "a@example.com", email_verified: false }),
    ).toBeNull();
    expect(toSessionUser({ sub: "u1", email: "a@example.com" })).toBeNull();
  });
});

describe("isAllowedEmailDomain", () => {
  it("許可リストが空なら誰でも通る", () => {
    expect(isAllowedEmailDomain("a@gmail.com", [])).toBe(true);
  });

  it("許可したドメインなら通る(大文字小文字は区別しない)", () => {
    expect(isAllowedEmailDomain("a@Example.com", ["example.com"])).toBe(true);
    expect(isAllowedEmailDomain("a@example.com", ["EXAMPLE.com"])).toBe(true);
  });

  it("許可していないドメインは通らない", () => {
    expect(isAllowedEmailDomain("a@gmail.com", ["example.com"])).toBe(false);
  });

  it("サブドメインや前方一致のなりすましは通らない", () => {
    expect(isAllowedEmailDomain("a@evil.example.com", ["example.com"])).toBe(false);
    expect(isAllowedEmailDomain("a@example.com.evil.jp", ["example.com"])).toBe(false);
    expect(isAllowedEmailDomain("a@example.com@evil.jp", ["example.com"])).toBe(false);
  });

  it("@ がないメールは通らない", () => {
    expect(isAllowedEmailDomain("example.com", ["example.com"])).toBe(false);
  });
});

describe("parseAllowedDomains", () => {
  it("未設定・空文字は空配列", () => {
    expect(parseAllowedDomains(undefined)).toEqual([]);
    expect(parseAllowedDomains("")).toEqual([]);
  });

  it("カンマ区切りを分け、空白と空要素を除いて小文字にする", () => {
    expect(parseAllowedDomains(" Example.com, ,foo.jp ,")).toEqual([
      "example.com",
      "foo.jp",
    ]);
  });
});

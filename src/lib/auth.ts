/** ログインしている人の情報。画面に渡してよい最小限だけを持つ。 */
export type SessionUser = { uid: string; email: string; name: string | null };

/** 検証済みの ID トークンから取り出した値(Firebase のクレームの一部)。sub が利用者 ID。 */
export type VerifiedClaims = {
  sub?: string;
  email?: unknown;
  email_verified?: unknown;
  name?: unknown;
};

/** ID トークンの値から、セッションに載せる利用者を作る。ID なし・メール未確認・メールなしなら null。 */
export function toSessionUser(claims: VerifiedClaims): SessionUser | null {
  if (!claims.sub) return null;
  if (typeof claims.email !== "string" || claims.email === "") return null;
  if (claims.email_verified !== true) return null;
  return {
    uid: claims.sub,
    email: claims.email,
    name: typeof claims.name === "string" ? claims.name : null,
  };
}

/**
 * 許可するメールドメインに合うか。
 * 許可リストが空ならドメインを制限しない。大文字小文字は区別しない。
 */
export function isAllowedEmailDomain(
  email: string,
  allowedDomains: readonly string[],
): boolean {
  if (allowedDomains.length === 0) return true;
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  const domain = email.slice(at + 1).toLowerCase();
  return allowedDomains.some((d) => d.trim().toLowerCase() === domain);
}

/** カンマ区切りの文字列(環境変数)をドメインの配列にする。空要素は捨てる。 */
export function parseAllowedDomains(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter((d) => d !== "");
}

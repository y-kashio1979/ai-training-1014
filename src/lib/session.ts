import "server-only";
import { cookies } from "next/headers";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import {
  isAllowedEmailDomain,
  parseAllowedDomains,
  toSessionUser,
  type SessionUser,
} from "@/lib/auth";

// Admin SDK は使わない。Firebase の ID トークン(JWT)を、Google が公開している鍵で直接検証する。
// 必要な設定はプロジェクト ID(公開してよい値)だけ。
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);
const COOKIE_NAME = "session";

export type CreateSessionResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "unverified" | "domain" };

function getProjectId(): string {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("環境変数 NEXT_PUBLIC_FIREBASE_PROJECT_ID が設定されていません");
  }
  return projectId;
}

/** ID トークンを検証し、利用者を返す。署名・期限・発行元・対象が正しく、許可されたメールのときだけ。 */
async function verifyIdToken(
  idToken: string,
): Promise<
  | { ok: true; user: SessionUser; payload: JWTPayload }
  | { ok: false; reason: "invalid" | "unverified" | "domain" }
> {
  const projectId = getProjectId();

  let payload: JWTPayload;
  try {
    ({ payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      algorithms: ["RS256"],
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      clockTolerance: 5,
    }));
  } catch {
    return { ok: false, reason: "invalid" };
  }

  const user = toSessionUser(payload);
  if (!user) return { ok: false, reason: "unverified" };

  const allowed = parseAllowedDomains(process.env.ALLOWED_EMAIL_DOMAINS);
  if (!isAllowedEmailDomain(user.email, allowed)) {
    return { ok: false, reason: "domain" };
  }
  return { ok: true, user, payload };
}

/**
 * ブラウザから受け取った ID トークンを検証し、Cookie に保存する。
 * ID トークンの有効期間は1時間。ブラウザ側で更新されるたびに、この関数で Cookie を差し替える。
 */
export async function createSession(
  idToken: string,
): Promise<CreateSessionResult> {
  const result = await verifyIdToken(idToken);
  if (!result.ok) return result;

  const secondsLeft = (result.payload.exp ?? 0) - Math.floor(Date.now() / 1000);
  (await cookies()).set(COOKIE_NAME, idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(secondsLeft, 0),
  });
  return { ok: true };
}

/** 今ログインしている人を返す。ログインしていない・期限切れ・無効なら null。 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookie = (await cookies()).get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  const result = await verifyIdToken(cookie);
  return result.ok ? result.user : null;
}

/** セッション Cookie を消す。 */
export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
